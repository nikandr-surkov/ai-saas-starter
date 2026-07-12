---
name: db-migration
description: Make a database schema change safely — edit schema.ts, generate the migration, review the SQL, apply it. Use for any change under src/db/.
---

# Database migration

Applied migrations are immutable history. This skill exists so nobody ever
"just edits the SQL file".

## Steps

1. **Ask the user first.** Schema changes are on the ASK FIRST list in
   AGENTS.md. Describe the change and why.
2. Edit `src/db/schema.ts` only. Conventions:
   - Every foreign key gets an index.
   - Timestamps: `createdAt` with `defaultNow()`, timezone-aware.
   - Money in integer cents; credits in integers.
   - Enums via `pgEnum`, named `<table>_<column>`.
3. Generate: `pnpm db:generate`. Never write migration SQL by hand.
4. **Read the generated file in `drizzle/`.** Confirm: no unintended
   `DROP`, correct column types/defaults, indexes present. Column renames
   often generate drop+create — if data must survive, say so and write the
   migration plan out for the user before applying.
5. Apply locally: `pnpm db:migrate` (Postgres running via
   `docker compose up -d`).
6. Run `pnpm test` — the ledger suite will catch schema drift in credit
   tables.
7. Commit `src/db/schema.ts` and the new `drizzle/` files together.

## Never

- Edit or delete an existing file in `drizzle/`.
- Run `drizzle-kit push` against anything but a throwaway local DB —
  this repo uses generated, committed migrations.
- Touch `credit_transactions` semantics (signed integer amounts, UNIQUE
  `idempotencyKey`) without reading `.claude/rules/billing.md`.
