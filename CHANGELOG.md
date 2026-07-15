# Changelog

## 0.1.0 — 2026-07-15

Initial release.

- Auth: Better Auth with email/password + verification, Google, GitHub,
  magic links; settings with password change, account linking, cascade-safe
  deletion. Welcome grant (10 credits) through the ledger at signup.
- Billing: Stripe Checkout + Customer Portal server actions,
  signature-verified webhook, `syncStripeDataToDb` as the single writer of
  subscription state, plans/prices/credits in one config file.
- Credits: append-only ledger with UNIQUE idempotency keys, conditional-
  UPDATE spend (race-safe), compensating refunds, DB CHECKs backstopping
  the invariant `users.credit_balance == SUM(amount)`.
- AI: provider interface + AI Gateway implementation (AI SDK 6), model swap
  via env, free offline mock mode with a demoable failure switch, rate
  limiting, Blob/local storage, history grid.
- Marketing: "The Ledger" design system (light/dark), landing, pricing,
  SEO (sitemap, robots, OG, JSON-LD), React Email templates.
- AI-native: AGENTS.md, CLAUDE.md, DESIGN.md, path-scoped rules, skills,
  typecheck-blocking hooks, read-only code-reviewer agent, spec template.
- Tests: 94 Vitest (ledger vs real Postgres incl. double-spend race,
  webhook HMAC fixtures) + 11 Playwright e2e (auth flow, generation,
  refund path, zero-credit block, open-redirect guard, image authz).
  GitHub Actions CI with a Postgres service container.
