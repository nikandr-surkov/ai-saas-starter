---
paths:
  - "src/db/**"
  - "drizzle/**"
---

# Database rules

- **Never edit an applied migration.** Files in `drizzle/` are history, not
  code. Wrong migration already applied? Write a new migration that corrects
  it.
- Schema changes follow one path:
  1. Edit `src/db/schema.ts`.
  2. `pnpm db:generate` — drizzle-kit writes the SQL migration.
  3. **Read the generated SQL** and check it does exactly what you intended
     (no accidental drops, correct indexes, correct defaults).
  4. `pnpm db:migrate`.
  5. Commit schema + migration together.
- Schema changes require asking the user first (see AGENTS.md).
- All tables live in `src/db/schema.ts`. Credit tables are only ever queried
  through `src/lib/credits/` — even for reads in other features.
- Every foreign key gets an index. `idempotencyKey` stays UNIQUE — that
  constraint is what makes webhook retries safe.
