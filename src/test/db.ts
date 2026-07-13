import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { db } from "@/db";
import { env } from "@/lib/env";

// Test-only helper: creates the _test database if missing (local
// convenience — CI's service container provides one) and brings it to the
// current schema. The advisory lock serializes provisioning across parallel
// Vitest workers, which would otherwise race the migrator.
export async function ensureTestDatabase(): Promise<void> {
  const dbName = new URL(env.DATABASE_URL).pathname.slice(1);
  const adminUrl = new URL(env.DATABASE_URL);
  adminUrl.pathname = "/postgres";
  const admin = new Pool({ connectionString: adminUrl.toString(), max: 1 });
  try {
    await admin.query("SELECT pg_advisory_lock(421337)");
    const exists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
    }
    await migrate(db, { migrationsFolder: "drizzle" });
    await admin.query("SELECT pg_advisory_unlock(421337)");
  } finally {
    await admin.end();
  }
}

/** Close the app db pool — call from afterAll so workers exit cleanly. */
export async function closeDb(): Promise<void> {
  await (db.$client as Pool).end();
}
