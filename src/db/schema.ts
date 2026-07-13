import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Schema changes go through /db-migration: edit this file, `pnpm
// db:generate`, review the SQL, `pnpm db:migrate`. Never edit applied
// migrations in drizzle/.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ── Better Auth core tables (users, sessions, accounts, verifications) ──────
// Field names follow Better Auth's core schema; columns are snake_case.
// users additionally carries the app's Stripe pointer and the cached credit
// balance (the cache is maintained ONLY by src/lib/credits/).

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    // Set at signup once billing is wired (M3). Written outside Better Auth.
    stripeCustomerId: text("stripe_customer_id").unique(),
    // Cache of SUM(credit_transactions.amount) — see src/lib/credits/.
    creditBalance: integer("credit_balance").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    // Defense-in-depth under the conditional-UPDATE spend guard: even if a
    // future code path bypasses src/lib/credits/, the database refuses a
    // negative balance.
    check("users_credit_balance_nonnegative", sql`${t.creditBalance} >= 0`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

// ── Subscription state ───────────────────────────────────────────────────────
// One row per user, upserted ONLY by syncStripeDataToDb in
// src/lib/billing/sync.ts, which fetches fresh state from Stripe. Webhook
// payloads are triggers, never sources of truth.

export const subscriptions = pgTable("subscriptions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  // A Stripe subscription status ("active", "past_due", ...) or "none" when
  // the customer has no subscription. Text, not an enum — Stripe's status
  // set evolves and stale enums would reject valid syncs.
  status: text("status").notNull().default("none"),
  priceId: text("price_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  paymentMethodBrand: text("payment_method_brand"),
  paymentMethodLast4: text("payment_method_last4"),
  ...timestamps,
});

// ── Credits ledger ───────────────────────────────────────────────────────────
// Append-only. Rows are never updated or deleted; corrections are new
// compensating rows. Only src/lib/credits/ touches this table.

export const creditTransactionsType = pgEnum("credit_transactions_type", [
  "subscription_grant",
  "topup",
  "spend",
  "refund",
  "expiry", // unused in the free version (credits don't expire) — kept for Pro compatibility
  "admin_adjust",
]);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Signed credits. Positive = grant, negative = spend. Never zero.
    amount: integer("amount").notNull(),
    type: creditTransactionsType("type").notNull(),
    refType: text("ref_type"),
    refId: text("ref_id"),
    // The idempotency guard: a replayed webhook or retried action inserts
    // with the same key, hits the unique index, and becomes a no-op.
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("credit_transactions_user_id_idx").on(t.userId),
    check("credit_transactions_amount_nonzero", sql`${t.amount} <> 0`),
  ],
);

// ── Generations ──────────────────────────────────────────────────────────────

export const generationsStatus = pgEnum("generations_status", [
  "pending",
  "completed",
  "failed",
]);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    imageUrl: text("image_url"),
    model: text("model").notNull(),
    status: generationsStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("generations_user_id_idx").on(t.userId)],
);
