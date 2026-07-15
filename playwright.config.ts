import { defineConfig, devices } from "@playwright/test";

// The e2e suite runs against `next dev` ON PURPOSE, not a production build:
// generation must be free (AI_MOCK=true), and env validation REFUSES
// AI_MOCK when NODE_ENV=production — a build+start run would either fail to
// boot or hit a real image provider. Do not "fix" this into a prod-build
// run. (The same note lives in .github/workflows/ci.yml.)

const PORT = 3100;

export const BASE_URL = `http://localhost:${PORT}`;

/** Separate database so e2e users never pollute dev data. */
export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/ai_saas_starter_e2e";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  // One worker: the suite shares a dev server and a rate limiter keyed per
  // user; serial runs keep timing deterministic.
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // These OVERRIDE .env (real environment beats env files in Next):
      // mock generation, isolated database, and a base URL matching the
      // e2e port so Better Auth's origin checks pass.
      AI_MOCK: "true",
      DATABASE_URL: E2E_DATABASE_URL,
      BETTER_AUTH_URL: BASE_URL,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ?? "e2e-only-secret-e2e-only-secret-e2e",
    },
  },
});
