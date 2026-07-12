---
paths:
  - "src/lib/billing/**"
  - "src/app/api/stripe/**"
  - "src/lib/credits/**"
---

# Billing & credits invariants

- **Every credit mutation carries an `idempotencyKey`.** Grants from webhooks
  use deterministic keys (`grant_{invoiceId}`, `topup_{sessionId}`,
  `welcome_{userId}`). A unique-violation on that key means "already
  processed" — return the existing row silently, never throw, never double-apply.
- **`syncStripeDataToDb(customerId)` is the only code that writes subscription
  state.** Webhook handlers and the success route call it; nothing else
  mutates subscription columns. It fetches fresh state from Stripe and
  upserts — never trusts event payloads for state.
- **The ledger is append-only.** No UPDATE or DELETE on `credit_transactions`,
  ever. Corrections are new compensating rows (`refund`, `admin_adjust`).
- **Spending is a conditional UPDATE** (`credit_balance >= amount` in the
  WHERE clause) inside a transaction — that's the double-spend guard. Don't
  "check then update" in two steps.
- **Webhook route**: verify the Stripe signature against the raw body
  (`await request.text()`) before anything else. Return 200 fast on success;
  500 on real failures so Stripe retries.
- **Testing**: subscription lifecycle changes are tested with Stripe test
  clocks, webhook handlers with recorded event fixtures + signature
  verification, credits with the Vitest ledger suite against real Postgres.
