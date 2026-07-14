import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Action-level tests against real Postgres: real ledger, real rate limiter
// (in-memory fallback), real storage (./.generated). Only the session, the
// image provider, and Next's cache revalidation are mocked.

let currentUserId = "unset";
vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(async () => ({
    user: {
      id: currentUserId,
      name: "Gen Test",
      email: `${currentUserId}@test.local`,
    },
  })),
}));

const providerGenerate = vi.fn();
vi.mock("@/lib/ai/provider", () => ({
  getImageProvider: () => ({
    modelId: "mock/placeholder",
    generateImage: providerGenerate,
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Real credits module, but through a spread so individual functions can be
// spied on (the unknown-spend-failure test below).
vi.mock("@/lib/credits", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/credits")>()),
}));

import { db } from "@/db";
import { creditTransactions, generations, users } from "@/db/schema";
import { mockProvider } from "@/lib/ai/mock";
import * as credits from "@/lib/credits";
import { grantCredits } from "@/lib/credits";
import { closeDb, ensureTestDatabase } from "@/test/db";

import { generateImageAction, type GenerateResult } from "./actions";

const initialState: GenerateResult = { ok: true };
const runAction = (form: FormData) => generateImageAction(initialState, form);

beforeAll(async () => {
  await ensureTestDatabase();
}, 60_000);

afterAll(async () => {
  await closeDb();
});

beforeEach(() => {
  providerGenerate.mockReset();
  providerGenerate.mockResolvedValue({
    url: `data:image/svg+xml;base64,${Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>").toString("base64")}`,
    width: 1024,
    height: 1024,
    model: "mock/placeholder",
  });
});

async function createUser(startingCredits: number): Promise<string> {
  const id = `gen_test_${randomUUID()}`;
  await db.insert(users).values({
    id,
    name: "Gen Test",
    email: `${id}@test.local`,
  });
  if (startingCredits > 0) {
    await grantCredits({
      userId: id,
      amount: startingCredits,
      type: "topup",
      ref: { type: "checkout_session", id: `cs_${id}` },
      idempotencyKey: `topup_cs_${id}`,
    });
  }
  currentUserId = id;
  return id;
}

function promptForm(
  prompt = "A ledger book on a desk, studio light",
): FormData {
  const form = new FormData();
  form.set("prompt", prompt);
  return form;
}

async function balanceOf(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: users.creditBalance })
    .from(users)
    .where(eq(users.id, userId));
  return row?.balance ?? -1;
}

async function expectInvariant(userId: string): Promise<void> {
  const [ledger] = await db
    .select({
      total: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)::int`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));
  expect(await balanceOf(userId)).toBe(ledger?.total);
}

async function rowsFor(userId: string) {
  return {
    generations: await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId)),
    spends: await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .then((rows) => rows.filter((row) => row.type === "spend")),
    refunds: await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .then((rows) => rows.filter((row) => row.type === "refund")),
  };
}

describe("generateImageAction", () => {
  it("happy path: spends 1 credit, stores the image, marks completed", async () => {
    const userId = await createUser(5);

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: true });
    expect(await balanceOf(userId)).toBe(4);
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("completed");
    expect(rows[0]?.imageUrl).toMatch(/^\/api\/images\//);
    expect(rows[0]?.model).toBe("mock/placeholder");
    expect(spends).toHaveLength(1);
    expect(spends[0]?.idempotencyKey).toBe(`spend_${rows[0]?.id}`);
    await expectInvariant(userId);
  });

  it("insufficient credits: clean error, no row left pending, no spend", async () => {
    const userId = await createUser(0);

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "insufficient_credits" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(0); // deleted, not left pending
    expect(spends).toHaveLength(0);
    expect(providerGenerate).not.toHaveBeenCalled();
    await expectInvariant(userId);
  });

  it("provider failure: refunds, marks failed, balance restored", async () => {
    const userId = await createUser(3);
    providerGenerate.mockRejectedValueOnce(new Error("provider down"));

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "generation_failed" });
    expect(await balanceOf(userId)).toBe(3); // spend + refund cancel out
    const { generations: rows, spends, refunds } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("failed");
    expect(spends).toHaveLength(1);
    expect(refunds).toHaveLength(1);
    expect(refunds[0]?.idempotencyKey).toBe(`refund_${rows[0]?.id}`);
    await expectInvariant(userId);
  });

  it("rate limit: the 11th call in a minute is rejected without a spend", async () => {
    const userId = await createUser(20);

    for (let i = 0; i < 10; i++) {
      expect((await runAction(promptForm())).ok).toBe(true);
    }
    const eleventh = await runAction(promptForm());

    expect(eleventh).toEqual({ ok: false, error: "rate_limited" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(10); // no 11th record either
    expect(spends).toHaveLength(10);
    expect(await balanceOf(userId)).toBe(10);
    await expectInvariant(userId);
  });

  it("FAIL prompt through the REAL mock provider: spend + refund, balance unchanged, marked failed", async () => {
    const userId = await createUser(5);
    // Delegate to the real mock provider so its failure switch is exercised
    // end to end through the action (the M7 Playwright suite drives the
    // same string through the browser).
    providerGenerate.mockImplementationOnce((input) =>
      mockProvider.generateImage(input),
    );

    const result = await runAction(
      promptForm("A ledger book, but make it FAIL"),
    );

    expect(result).toEqual({ ok: false, error: "generation_failed" });
    expect(await balanceOf(userId)).toBe(5); // round-trip: unchanged
    const { generations: rows, spends, refunds } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("failed");
    expect(spends).toHaveLength(1);
    expect(refunds).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("unknown spend failure keeps the pending row — the reconciliation signal", async () => {
    const userId = await createUser(5);
    const spendSpy = vi
      .spyOn(credits, "spendCredits")
      .mockRejectedValueOnce(new Error("connection reset"));

    await expect(runAction(promptForm())).rejects.toThrow("connection reset");
    spendSpy.mockRestore();

    // The spend MAY have committed server-side (lost ack). The record must
    // survive as pending so "pending + spend without refund" is queryable —
    // deleting it would orphan a possible charge.
    const { generations: rows } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("pending");
    expect(providerGenerate).not.toHaveBeenCalled();
    await expectInvariant(userId);
  });

  it("rejects an invalid prompt before any side effect", async () => {
    const userId = await createUser(2);

    const result = await runAction(promptForm("ab"));

    expect(result).toEqual({ ok: false, error: "invalid_prompt" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(0);
    expect(spends).toHaveLength(0);
  });
});
