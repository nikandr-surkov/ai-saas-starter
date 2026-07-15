# Contributing

Thanks for looking. This repo is deliberately small and boring in the money
paths — contributions that keep it that way are welcome.

## Setup

```bash
pnpm install
docker compose up -d
cp .env.example .env   # set BETTER_AUTH_SECRET; the rest degrades gracefully
pnpm db:migrate
pnpm dev
```

## Before you open a PR

- `pnpm typecheck && pnpm lint && pnpm test` must pass; run
  `pnpm test:e2e` if you touched pages, actions, auth, or generation.
- New features include tests. Money-adjacent changes (billing, credits)
  include tests against real Postgres — see `src/lib/credits/ledger.test.ts`
  for the pattern.
- Read [AGENTS.md](AGENTS.md) first — it is the operating manual for humans
  too, and its safety boundaries are non-negotiable in review:
  the ledger stays append-only, `syncStripeDataToDb` stays the only
  subscription writer, webhook signature checks never weaken.
- Schema changes: edit `src/db/schema.ts`, `pnpm db:generate`, review the
  SQL, commit schema + migration together. Never edit an applied migration.
- UI follows [DESIGN.md](DESIGN.md). Check `/styleguide` in both themes.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).

## Using an AI agent to contribute

Fine — encouraged, even. The repo briefs it: AGENTS.md, path-scoped rules,
skills. Two asks: keep the agent inside those rails (if it wants to touch
`credit_transactions` outside `src/lib/credits/`, it is wrong), and review
its diff yourself before opening the PR. "The agent wrote it" is not a
review.

## Scope

Bug fixes, test coverage, docs, and DX improvements are welcome.
Multi-provider generation, job queues, teams, and admin dashboards are
deliberately out of scope for the free repo — that is the
[Pro version](https://nikandr.com).
