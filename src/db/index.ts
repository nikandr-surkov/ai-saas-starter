import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/lib/env";

import * as schema from "./schema";

// One pool per process. In dev, Next.js hot-reload re-evaluates modules;
// stash the pool on globalThis so reloads don't leak connections.
const globalForDb = globalThis as unknown as { dbPool?: Pool };

const pool =
  globalForDb.dbPool ?? new Pool({ connectionString: env.DATABASE_URL });

if (env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export const db = drizzle(pool, { schema });
