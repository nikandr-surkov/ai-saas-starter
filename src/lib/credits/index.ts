import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditTransactions, users } from "@/db/schema";

// The credits ledger API — the ONLY module that touches credit_transactions
// and users.creditBalance. The ledger is append-only: no UPDATE or DELETE on
// transaction rows, ever; corrections are new compensating rows.
//
// M2 ships grants (needed for the welcome grant at signup). M4 adds
// spendCredits/refundCredits/getBalance/getHistory test-first, including the
// double-spend race suite.

/** Credits granted to every new account, through the ledger like all else. */
const WELCOME_CREDITS = 10;

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
    if (inserted.length === 0) return;

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
