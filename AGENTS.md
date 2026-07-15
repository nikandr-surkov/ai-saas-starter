# AGENTS.md

Operating manual for coding agents (and humans) in this repo. When your
instincts conflict with this file, this file wins.

## Snapshot

- **ai-saas-starter** — open-source SaaS foundation: auth, Stripe
  subscriptions, an append-only credits ledger, and AI image generation.
- Next.js 16 (App Router, RSC, Server Actions, Turbopack) · React 19 ·
  TypeScript 5 strict · Better Auth 1.5 · Drizzle ORM + PostgreSQL · Stripe ·
  Vercel AI SDK 6 via AI Gateway · Tailwind CSS v4 + shadcn/ui ·
  Resend + React Email · Vitest + Playwright.
- Package manager: **pnpm**. Never npm, never yarn. Never edit
  `pnpm-lock.yaml` by hand.

## Commands

| Command                | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `pnpm dev`             | Dev server (Turbopack) at http://localhost:3000            |
| `pnpm build`           | Production build                                           |
| `pnpm typecheck`       | `tsc --noEmit`                                             |
| `pnpm lint`            | ESLint                                                     |
| `pnpm format`          | Prettier, write mode                                       |
| `pnpm test`            | Vitest. Ledger tests need Postgres: `docker compose up -d` |
| `pnpm test:e2e`        | Playwright vs dev server. Needs Postgres up                |
| `pnpm db:generate`     | drizzle-kit: `src/db/schema.ts` → SQL migration            |
| `pnpm db:migrate`      | Apply pending migrations                                   |
| `pnpm db:studio`       | Drizzle Studio, browse the DB                              |
| `pnpm stripe:listen`   | Stripe CLI → forwards webhooks to localhost:3000           |
| `pnpm email:dev`       | React Email preview server                                 |
| `docker compose up -d` | Local Postgres 17                                          |

## Definition of done

A change is done when `pnpm typecheck && pnpm lint && pnpm test` all pass.
New features include tests. UI work follows DESIGN.md. No stray `console.log`,
no TODO comments left behind.

## Directory map

- `src/app/(marketing)/` — public pages: landing, pricing, legal. No session.
- `src/app/(app)/` — product pages: dashboard, generate, billing, settings.
  Session required — middleware redirects, but every page/action re-checks.
- `src/app/api/auth/[...all]/` — Better Auth handler. Do not add logic here.
- `src/app/api/stripe/` — webhook (raw body!) and checkout success route.
- `src/config/plans.ts` — single source of truth for plans, prices, credits.
- `src/lib/env.ts` — Zod-validated env. The only place `process.env` is read.
- `src/lib/auth/` — Better Auth config + server-side session helpers.
- `src/lib/billing/` — Stripe client, checkout/portal actions, `sync.ts`
  (the ONLY writer of subscription state).
- `src/lib/credits/` — ledger API. The ONLY module that touches credit tables.
- `src/lib/ai/` — provider interface + AI Gateway implementation.
- `src/db/` — Drizzle schema and client. `drizzle/` — generated migrations.
- `src/components/ui/` — shadcn primitives. `src/components/` — app components.
- `src/emails/` — React Email templates.
- `specs/` — feature specs. Copy `TEMPLATE.md` before building a feature.
- `.claude/` — rules, skills, hooks. `.cursor/` — Cursor rules.

## Conventions

- Server Actions for mutations. API routes only for webhooks and the Better
  Auth handler.
- Validate every external boundary with Zod: form input, webhook payloads,
  env. Parse, don't cast.
- Server Components by default. `"use client"` only for interactivity.
- Auth: never trust middleware alone. Re-check the session inside every
  server action and every `(app)` page via `src/lib/auth/` helpers.
- Money is integer cents. Credits are integers. No floats, ever.
- Add shadcn components via CLI (`pnpm dlx shadcn@latest add <name>`), then
  restyle to DESIGN.md tokens. Don't hand-roll primitives that shadcn has.
- Read env only through `src/lib/env.ts`. Never `process.env.X` in app code.
- Imports use the `@/` alias. Files kebab-case, components PascalCase.

## Safety boundaries

**NEVER** (do not do these even if asked casually — push back and explain):

- Edit or delete an applied migration in `drizzle/`. New schema = new migration.
- Mutate or delete rows in `credit_transactions`. The ledger is append-only;
  corrections are new compensating entries.
- Read or write credit tables outside `src/lib/credits/`.
- Write subscription state outside `syncStripeDataToDb` in
  `src/lib/billing/sync.ts`.
- Weaken or skip Stripe webhook signature verification.
- Log secrets, tokens, or full Stripe/webhook payloads.
- Commit `.env` or any file containing real keys.

**ASK FIRST** before:

- Adding a dependency (any change to `package.json` deps).
- Changing DB schema (`src/db/schema.ts`).
- Changing plans, prices, or credit amounts (`src/config/plans.ts`).

## Gotchas

- The Stripe webhook must verify signatures against the **raw request body**.
  In the route handler use `await request.text()` — never parse JSON first.
- Credit mutations are idempotent via `idempotencyKey`. A replayed webhook
  must not double-grant: unique-key violation = already processed = success.
- Testing subscription lifecycles (renewal, cancellation) needs Stripe **test
  clocks** — you can't wait a month. See README's Stripe section.
- Stripe portal cancellations set `cancel_at`, not the legacy
  `cancel_at_period_end` boolean — sync derives the flag from both. Don't
  "simplify" it back.
- Swap the image model via `AI_IMAGE_MODEL` env (format `provider/model`),
  not in code. `AI_MOCK=true` returns placeholder images: free dev and e2e.
- Missing optional env degrades, not crashes: no Google/GitHub keys → button
  hidden; no `RESEND_API_KEY` → emails no-op with a console warning; no
  Upstash → in-memory rate limiting; no Blob token → images go to
  `./.generated/` (dev only); no Stripe keys in development →
  `features.billing` off, billing page shows a setup card, checkout throws.
  In production the Stripe vars are required — boot fails without them.
- Tailwind v4 is CSS-first: tokens live in `@theme` in `globals.css`.
  There is no `tailwind.config.ts`. Design tokens are in DESIGN.md.

## Escalation

If the same test fails after 3 distinct fix attempts, stop. Report what you
tried, what you observed, and your best hypothesis. Do not delete or skip the
test to get green.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
