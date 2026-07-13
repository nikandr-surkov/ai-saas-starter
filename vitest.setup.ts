// Baseline env so modules importing "@/lib/env" can load under Vitest.
// Dummy values only — suites that need real services (the ledger tests need
// Postgres) get their configuration from the actual environment / CI.
//
// DATABASE_URL defaults to a dedicated _test database so the ledger suite
// never touches dev data; it is created on demand by the suite itself.
process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/ai_saas_starter_test";
process.env.BETTER_AUTH_SECRET ??= "vitest-only-secret-vitest-only-secret";
process.env.STRIPE_SECRET_KEY ??= "sk_test_vitest";
process.env.STRIPE_WEBHOOK_SECRET ??= "whsec_vitest";
process.env.STRIPE_PRICE_PRO_MONTHLY ??= "price_vitest_pro";
process.env.STRIPE_PRICE_ULTRA_MONTHLY ??= "price_vitest_ultra";
process.env.STRIPE_PRICE_TOPUP_100 ??= "price_vitest_topup";
process.env.AI_MOCK ??= "true";
