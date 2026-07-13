import { readFileSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it can't use src/lib/env.ts (that rule
// is for app code). Read DATABASE_URL from the environment or .env directly,
// falling back to the docker-compose default so `pnpm db:migrate` is
// zero-config for local development.
function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const line = readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("DATABASE_URL="));
    const value = line
      ?.slice("DATABASE_URL=".length)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value) return value;
  } catch {
    // No .env — fall through to the docker-compose default.
  }
  return "postgres://postgres:postgres@localhost:5432/ai_saas_starter";
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl() },
  strict: true,
  verbose: true,
});
