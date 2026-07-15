import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { E2E_DATABASE_URL } from "../playwright.config";

// Creates the e2e database if missing and brings it to the current schema,
// before the dev server boots. Deliberately self-contained (no "@/" app
// imports — Playwright's transpiler doesn't resolve tsconfig paths inside
// transitively imported app modules); mirrors src/test/db.ts.
export default async function globalSetup(): Promise<void> {
  const dbName = new URL(E2E_DATABASE_URL).pathname.slice(1);
  const adminUrl = new URL(E2E_DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const admin = new Pool({ connectionString: adminUrl.toString(), max: 1 });
  try {
    const exists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await admin.end();
  }

  const pool = new Pool({ connectionString: E2E_DATABASE_URL, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  } finally {
    await pool.end();
  }
}
