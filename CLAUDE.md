@AGENTS.md

## Claude Code specifics

- Use **plan mode** for any change under `src/lib/billing/` or
  `src/lib/credits/` — money and ledger code gets a reviewed plan first.
- Scoped rules load automatically from `.claude/rules/` (billing, database,
  design). Follow them; they restate the invariants that matter most.
- Skills for common jobs — prefer them over improvising:
  - `/add-feature` — scaffold a page + server action + test the repo way.
  - `/add-ai-provider` — implement `src/lib/ai/provider.ts` for a new provider.
  - `/db-migration` — schema change → generated migration → review → apply.
- The `code-reviewer` agent (`.claude/agents/code-reviewer.md`) reviews
  auth/billing/ledger diffs read-only. Run it before committing changes there.
- Hooks: Prettier runs after every file edit; `pnpm typecheck` runs when you
  stop — a type error blocks completion, fix it before finishing.
