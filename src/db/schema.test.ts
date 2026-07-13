import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  accounts,
  creditTransactions,
  generations,
  sessions,
  users,
} from "./schema";

// Schema invariants that money-safety depends on. These run without a
// database — they introspect the Drizzle table definitions the migrations
// are generated from.

describe("credit_transactions", () => {
  const config = getTableConfig(creditTransactions);

  it("has a UNIQUE idempotency key — the webhook-replay guard", () => {
    const column = creditTransactions.idempotencyKey;
    expect(column.isUnique).toBe(true);
    expect(column.notNull).toBe(true);
  });

  it("stores integer amounts (no floats, ever)", () => {
    expect(creditTransactions.amount.getSQLType()).toBe("integer");
    expect(creditTransactions.amount.notNull).toBe(true);
  });

  it("forbids zero-amount rows via CHECK", () => {
    expect(
      config.checks.some(
        (check) => check.name === "credit_transactions_amount_nonzero",
      ),
    ).toBe(true);
  });

  it("indexes userId (every FK gets an index)", () => {
    expect(
      config.indexes.some(
        (index) => index.config.name === "credit_transactions_user_id_idx",
      ),
    ).toBe(true);
  });
});

describe("users", () => {
  it("caches the credit balance as a non-null integer defaulting to 0", () => {
    expect(users.creditBalance.getSQLType()).toBe("integer");
    expect(users.creditBalance.notNull).toBe(true);
    expect(users.creditBalance.hasDefault).toBe(true);
  });

  it("refuses negative balances via CHECK — backstop under the spend guard", () => {
    expect(
      getTableConfig(users).checks.some(
        (check) => check.name === "users_credit_balance_nonnegative",
      ),
    ).toBe(true);
  });

  it("keeps stripeCustomerId unique", () => {
    expect(users.stripeCustomerId.isUnique).toBe(true);
  });
});

describe("foreign-key indexes", () => {
  it.each([
    ["sessions", getTableConfig(sessions), "sessions_user_id_idx"],
    ["accounts", getTableConfig(accounts), "accounts_user_id_idx"],
    ["generations", getTableConfig(generations), "generations_user_id_idx"],
  ])("%s indexes user_id", (_name, config, indexName) => {
    expect(
      config.indexes.some((index) => index.config.name === indexName),
    ).toBe(true);
  });
});
