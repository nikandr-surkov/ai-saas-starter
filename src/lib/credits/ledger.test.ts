import { randomUUID } from "node:crypto";

import { desc, eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { creditTransactions, users } from "@/db/schema";
import { closeDb, ensureTestDatabase } from "@/test/db";

import {
  InsufficientCreditsError,
  getBalance,
  getHistory,
  grantCredits,
  refundCredits,
  spendCredits,
} from "./index";

// The ledger behavioral suite — runs against REAL Postgres (docker compose
// up -d), never mocks. This file lives inside src/lib/credits/ on purpose:
// the invariant checks read credit_transactions directly, and only this
// module may touch credit tables.
//
// The invariant, asserted after every scenario:
//   users.credit_balance === SUM(credit_transactions.amount)

beforeAll(async () => {
  await ensureTestDatabase();
}, 60_000);

afterAll(async () => {
  await closeDb();
});

let userCounter = 0;

/** Fresh user per test — scenarios never share ledger state. */
async function createUser(): Promise<string> {
  const id = `ledger_test_${++userCounter}_${randomUUID()}`;
  await db.insert(users).values({
    id,
    name: "Ledger Test",
    email: `${id}@test.local`,
  });
  return id;
}

async function expectInvariant(userId: string): Promise<void> {
  const [user] = await db
    .select({ balance: users.creditBalance })
    .from(users)
    .where(eq(users.id, userId));
  const [ledger] = await db
    .select({
      total: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)::int`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));
  expect(user?.balance).toBe(ledger?.total);
}

async function ledgerRows(userId: string) {
  return db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt));
}

describe("grants", () => {
  it("increase the balance and append rows", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "subscription_grant",
      ref: { type: "welcome", id: userId },
      idempotencyKey: `welcome_${userId}`,
    });
    await grantCredits({
      userId,
      amount: 100,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_1" },
      idempotencyKey: `topup_cs_1_${userId}`,
    });

    expect(await getBalance(userId)).toBe(110);
    expect(await ledgerRows(userId)).toHaveLength(2);
    await expectInvariant(userId);
  });

  it("replays with the same key produce one row and one increment", async () => {
    const userId = await createUser();
    const grant = () =>
      grantCredits({
        userId,
        amount: 200,
        type: "subscription_grant",
        ref: { type: "invoice", id: "in_replay" },
        idempotencyKey: `grant_in_replay_${userId}`,
      });
    await grant();
    await grant(); // webhook retry — must be a silent no-op

    expect(await getBalance(userId)).toBe(200);
    expect(await ledgerRows(userId)).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("a key collision from a DIFFERENT operation throws instead of no-oping", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const sharedKey = `grant_shared_${userA}`;
    await grantCredits({
      userId: userA,
      amount: 100,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_shared" },
      idempotencyKey: sharedKey,
    });

    // Same key, different user: not a replay — must not report success.
    await expect(
      grantCredits({
        userId: userB,
        amount: 100,
        type: "topup",
        ref: { type: "checkout_session", id: "cs_shared" },
        idempotencyKey: sharedKey,
      }),
    ).rejects.toThrow(/collision/);
    expect(await getBalance(userB)).toBe(0);

    // Same key and user, different amount: also not a replay.
    await expect(
      grantCredits({
        userId: userA,
        amount: 999,
        type: "topup",
        ref: { type: "checkout_session", id: "cs_shared" },
        idempotencyKey: sharedKey,
      }),
    ).rejects.toThrow(/collision/);
    expect(await getBalance(userA)).toBe(100);

    await expectInvariant(userA);
    await expectInvariant(userB);
  });
});

describe("spends", () => {
  it("deduct and append a negative row keyed spend_{ref.id}", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_2" },
      idempotencyKey: `topup_cs_2_${userId}`,
    });
    await spendCredits({
      userId,
      amount: 3,
      ref: { type: "generation", id: `gen_a_${userId}` },
    });

    expect(await getBalance(userId)).toBe(7);
    const rows = await ledgerRows(userId);
    const spend = rows.find((row) => row.type === "spend");
    expect(spend?.amount).toBe(-3);
    expect(spend?.idempotencyKey).toBe(`spend_gen_a_${userId}`);
    await expectInvariant(userId);
  });

  it("succeeds at the exact boundary (balance == amount)", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 5,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_3" },
      idempotencyKey: `topup_cs_3_${userId}`,
    });
    await spendCredits({
      userId,
      amount: 5,
      ref: { type: "generation", id: `gen_b_${userId}` },
    });

    expect(await getBalance(userId)).toBe(0);
    await expectInvariant(userId);
  });

  it("throws InsufficientCreditsError one credit short (balance == amount - 1)", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 4,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_4" },
      idempotencyKey: `topup_cs_4_${userId}`,
    });

    await expect(
      spendCredits({
        userId,
        amount: 5,
        ref: { type: "generation", id: `gen_c_${userId}` },
      }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);

    // The failed spend leaves no trace: no row, no deduction.
    expect(await getBalance(userId)).toBe(4);
    expect(await ledgerRows(userId)).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("throws on a zero balance", async () => {
    const userId = await createUser();
    await expect(
      spendCredits({
        userId,
        amount: 1,
        ref: { type: "generation", id: `gen_d_${userId}` },
      }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);
    await expectInvariant(userId);
  });

  it("replays with the same ref produce one row and one deduction", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_5" },
      idempotencyKey: `topup_cs_5_${userId}`,
    });
    const spend = () =>
      spendCredits({
        userId,
        amount: 2,
        ref: { type: "generation", id: `gen_e_${userId}` },
      });
    await spend();
    await spend(); // retried action — silent no-op, not a double charge

    expect(await getBalance(userId)).toBe(8);
    expect(
      (await ledgerRows(userId)).filter((row) => row.type === "spend"),
    ).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("double-spend race: two parallel spends against balance 1 — exactly one wins", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 1,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_6" },
      idempotencyKey: `topup_cs_6_${userId}`,
    });

    const results = await Promise.allSettled([
      spendCredits({
        userId,
        amount: 1,
        ref: { type: "generation", id: `gen_race_1_${userId}` },
      }),
      spendCredits({
        userId,
        amount: 1,
        ref: { type: "generation", id: `gen_race_2_${userId}` },
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBeInstanceOf(InsufficientCreditsError);

    expect(await getBalance(userId)).toBe(0);
    expect(
      (await ledgerRows(userId)).filter((row) => row.type === "spend"),
    ).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("a spend ref collision from another user throws, not a free success", async () => {
    const userA = await createUser();
    const userB = await createUser();
    for (const userId of [userA, userB]) {
      await grantCredits({
        userId,
        amount: 5,
        type: "topup",
        ref: { type: "checkout_session", id: `cs_${userId}` },
        idempotencyKey: `topup_cs_${userId}`,
      });
    }
    const sharedRef = { type: "generation", id: `gen_shared_${userA}` };
    await spendCredits({ userId: userA, amount: 2, ref: sharedRef });

    // userB reusing userA's ref must not "succeed" without deducting.
    await expect(
      spendCredits({ userId: userB, amount: 2, ref: sharedRef }),
    ).rejects.toThrow(/collision/);
    expect(await getBalance(userB)).toBe(5);
    await expectInvariant(userA);
    await expectInvariant(userB);
  });

  it("rejects non-positive and non-integer amounts", async () => {
    const userId = await createUser();
    for (const amount of [0, -1, 1.5]) {
      await expect(
        spendCredits({
          userId,
          amount,
          ref: { type: "generation", id: `gen_bad_${amount}_${userId}` },
        }),
      ).rejects.toThrow(/positive integer/);
    }
  });
});

describe("refunds", () => {
  it("refund-after-spend restores the balance with a compensating row", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_7" },
      idempotencyKey: `topup_cs_7_${userId}`,
    });
    const ref = { type: "generation", id: `gen_f_${userId}` };
    await spendCredits({ userId, amount: 4, ref });
    await refundCredits({ userId, ref });

    expect(await getBalance(userId)).toBe(10);
    const rows = await ledgerRows(userId);
    expect(rows).toHaveLength(3); // grant, spend, refund — nothing mutated
    const refund = rows.find((row) => row.type === "refund");
    expect(refund?.amount).toBe(4);
    expect(refund?.idempotencyKey).toBe(`refund_${ref.id}`);
    await expectInvariant(userId);
  });

  it("replays with the same ref produce one refund row", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 5,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_8" },
      idempotencyKey: `topup_cs_8_${userId}`,
    });
    const ref = { type: "generation", id: `gen_g_${userId}` };
    await spendCredits({ userId, amount: 2, ref });
    await refundCredits({ userId, ref });
    await refundCredits({ userId, ref }); // retry — no double refund

    expect(await getBalance(userId)).toBe(5);
    expect(
      (await ledgerRows(userId)).filter((row) => row.type === "refund"),
    ).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("throws when there is no matching spend", async () => {
    const userId = await createUser();
    await expect(
      refundCredits({
        userId,
        ref: { type: "generation", id: `gen_missing_${userId}` },
      }),
    ).rejects.toThrow(/no spend/i);
    await expectInvariant(userId);
  });
});

describe("reads", () => {
  it("getBalance matches the ledger sum", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_9" },
      idempotencyKey: `topup_cs_9_${userId}`,
    });
    await spendCredits({
      userId,
      amount: 1,
      ref: { type: "generation", id: `gen_h_${userId}` },
    });
    expect(await getBalance(userId)).toBe(9);
    await expectInvariant(userId);
  });

  it("getBalance throws for an unknown user", async () => {
    await expect(getBalance("no_such_user")).rejects.toThrow(/unknown user/i);
  });

  it("getHistory returns newest first and respects the limit", async () => {
    const userId = await createUser();
    await grantCredits({
      userId,
      amount: 10,
      type: "subscription_grant",
      ref: { type: "welcome", id: userId },
      idempotencyKey: `welcome_${userId}`,
    });
    await spendCredits({
      userId,
      amount: 1,
      ref: { type: "generation", id: `gen_i_${userId}` },
    });
    await refundCredits({
      userId,
      ref: { type: "generation", id: `gen_i_${userId}` },
    });

    const all = await getHistory(userId, 20);
    expect(all.map((row) => row.type)).toEqual([
      "refund",
      "spend",
      "subscription_grant",
    ]);

    const limited = await getHistory(userId, 2);
    expect(limited).toHaveLength(2);
    expect(limited[0]?.type).toBe("refund");
  });
});

describe("defense in depth — DB constraints behind the module", () => {
  // Drizzle wraps the Postgres error; the violated constraint's name is on
  // the cause chain.
  function messageChain(error: unknown): string {
    const parts: string[] = [];
    let current: unknown = error;
    while (current instanceof Error) {
      parts.push(current.message);
      current = current.cause;
    }
    return parts.join(" | ");
  }

  it("the CHECK rejects a direct negative-balance write", async () => {
    const userId = await createUser();
    // Nothing outside src/lib/credits/ may write balances; if some future
    // code path tries anyway, the database itself refuses (constraint
    // users_credit_balance_nonnegative from migration 0000).
    const failure = await db
      .update(users)
      .set({ creditBalance: -5 })
      .where(eq(users.id, userId))
      .then(() => null)
      .catch((error: unknown) => error);
    expect(messageChain(failure)).toMatch(/users_credit_balance_nonnegative/);
    await expectInvariant(userId);
  });

  it("the CHECK rejects zero-amount ledger rows", async () => {
    const userId = await createUser();
    const failure = await db
      .insert(creditTransactions)
      .values({
        userId,
        amount: 0,
        type: "admin_adjust",
        idempotencyKey: `zero_${userId}`,
      })
      .then(() => null)
      .catch((error: unknown) => error);
    expect(messageChain(failure)).toMatch(/credit_transactions_amount_nonzero/);
  });
});
