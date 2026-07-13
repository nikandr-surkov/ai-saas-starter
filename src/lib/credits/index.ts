import { and, desc, eq, gte, sql } from "drizzle-orm";

import { WELCOME_CREDITS } from "@/config/plans";
import { db } from "@/db";
import { creditTransactions, users } from "@/db/schema";

export class InsufficientCreditsError extends Error {
  constructor(message = "Insufficient credits") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * A key conflict normally means "replay of the same operation — no-op". But
 * if the existing row belongs to a different user or amount, the key was
 * reused for a DIFFERENT operation; silently reporting success would spend
 * or grant nothing while callers believe it worked. That is corruption, not
 * a replay — so it throws.
 */
async function assertSameOperation(
  tx: Tx,
  idempotencyKey: string,
  userId: string,
  amount: number,
): Promise<void> {
  const [existing] = await tx
    .select({
      userId: creditTransactions.userId,
      amount: creditTransactions.amount,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.idempotencyKey, idempotencyKey))
    .limit(1);
  if (!existing || existing.userId !== userId || existing.amount !== amount) {
    throw new Error(
      `credits: idempotency key collision on ${idempotencyKey} — the existing row is a different operation`,
    );
  }
}

// The credits ledger API — the ONLY module that touches credit_transactions
// and users.creditBalance. The ledger is append-only: no UPDATE or DELETE on
// transaction rows, ever; corrections are new compensating rows.
//
// M2 ships grants (needed for the welcome grant at signup). M4 adds
// spendCredits/refundCredits/getBalance/getHistory test-first, including the
// double-spend race suite.

type GrantCreditsInput = {
  userId: string;
  /** Positive integer. */
  amount: number;
  type: "subscription_grant" | "topup" | "refund" | "admin_adjust";
  ref?: { type: string; id: string };
  /**
   * Deterministic key, e.g. `grant_{invoiceId}`. A replay (webhook retry,
   * double-submit) hits the unique index and becomes a silent no-op.
   */
  idempotencyKey: string;
};

export async function grantCredits({
  userId,
  amount,
  type,
  ref,
  idempotencyKey,
}: GrantCreditsInput): Promise<void> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      `grantCredits: amount must be a positive integer, got ${amount}`,
    );
  }
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(creditTransactions)
      .values({
        userId,
        amount,
        type,
        refType: ref?.type,
        refId: ref?.id,
        idempotencyKey,
      })
      .onConflictDoNothing({ target: creditTransactions.idempotencyKey })
      .returning({ id: creditTransactions.id });

    // Conflict on the idempotency key = already processed. Skip the balance
    // increment too — the earlier transaction already applied it.
    if (inserted.length === 0) {
      await assertSameOperation(tx, idempotencyKey, userId, amount);
      return;
    }

    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} + ${amount}` })
      .where(eq(users.id, userId));
  });
}

/** Signup grant. Idempotent on `welcome_{userId}` — safe against hook retries. */
export async function grantWelcomeCredits(userId: string): Promise<void> {
  await grantCredits({
    userId,
    amount: WELCOME_CREDITS,
    type: "subscription_grant",
    ref: { type: "welcome", id: userId },
    idempotencyKey: `welcome_${userId}`,
  });
}

type SpendCreditsInput = {
  userId: string;
  /** Positive integer to deduct. */
  amount: number;
  /** The idempotency key derives from this: `spend_{ref.id}`. */
  ref: { type: string; id: string };
};

export async function spendCredits({
  userId,
  amount,
  ref,
}: SpendCreditsInput): Promise<void> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      `spendCredits: amount must be a positive integer, got ${amount}`,
    );
  }
  await db.transaction(async (tx) => {
    // Ledger row first: a replayed spend (same ref) conflicts here and skips
    // the deduction — the original transaction already applied it.
    const inserted = await tx
      .insert(creditTransactions)
      .values({
        userId,
        amount: -amount,
        type: "spend",
        refType: ref.type,
        refId: ref.id,
        idempotencyKey: `spend_${ref.id}`,
      })
      .onConflictDoNothing({ target: creditTransactions.idempotencyKey })
      .returning({ id: creditTransactions.id });
    if (inserted.length === 0) {
      // Replay of the same spend → no-op; a foreign key collision → throw.
      await assertSameOperation(tx, `spend_${ref.id}`, userId, -amount);
      return;
    }

    // The double-spend guard: ONE conditional UPDATE, no check-then-write.
    // Concurrent spends serialize on the row lock; the loser re-evaluates
    // the WHERE against the committed balance, matches zero rows, and this
    // throw rolls back its ledger row too.
    const updated = await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} - ${amount}` })
      .where(and(eq(users.id, userId), gte(users.creditBalance, amount)))
      .returning({ id: users.id });
    if (updated.length === 0) {
      throw new InsufficientCreditsError();
    }
  });
}

type RefundCreditsInput = {
  userId: string;
  /** The spend to compensate; keys derive as `refund_{ref.id}`. */
  ref: { type: string; id: string };
};

export async function refundCredits({
  userId,
  ref,
}: RefundCreditsInput): Promise<void> {
  await db.transaction(async (tx) => {
    // The refund amount comes from the matching spend row — never from the
    // caller, so a refund can only ever compensate what was actually spent.
    const [spend] = await tx
      .select({ amount: creditTransactions.amount })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.idempotencyKey, `spend_${ref.id}`),
          eq(creditTransactions.userId, userId),
        ),
      )
      .limit(1);
    if (!spend) {
      throw new Error(
        `refundCredits: no spend found for ${ref.type} ${ref.id}`,
      );
    }
    const amount = Math.abs(spend.amount);

    const inserted = await tx
      .insert(creditTransactions)
      .values({
        userId,
        amount,
        type: "refund",
        refType: ref.type,
        refId: ref.id,
        idempotencyKey: `refund_${ref.id}`,
      })
      .onConflictDoNothing({ target: creditTransactions.idempotencyKey })
      .returning({ id: creditTransactions.id });
    if (inserted.length === 0) {
      await assertSameOperation(tx, `refund_${ref.id}`, userId, amount);
      return;
    }

    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} + ${amount}` })
      .where(eq(users.id, userId));
  });
}

/** The cached balance — kept equal to SUM(amount) by every mutation above. */
export async function getBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ creditBalance: users.creditBalance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) {
    throw new Error(`getBalance: unknown user ${userId}`);
  }
  return row.creditBalance;
}

export type CreditTransaction = typeof creditTransactions.$inferSelect;

/** Newest-first ledger entries; backed by the (user_id, created_at DESC) index. */
export async function getHistory(
  userId: string,
  limit = 20,
): Promise<CreditTransaction[]> {
  return (
    db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      // createdAt is transaction-start time and can tie under concurrency;
      // the id tiebreaker keeps the display order deterministic.
      .orderBy(desc(creditTransactions.createdAt), desc(creditTransactions.id))
      .limit(limit)
  );
}
