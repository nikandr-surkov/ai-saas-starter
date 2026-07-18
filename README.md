# ai-saas-starter

The free, open-source AI SaaS boilerplate and starter kit for Next.js 16.

Auth, Stripe subscriptions, an append-only credits ledger, and AI image
generation — built as an AI-native repo that Claude Code, Cursor, and
Codex can extend without breaking the money paths.

[![CI](https://github.com/nikandr-surkov/ai-saas-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/nikandr-surkov/ai-saas-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-1f7a4d.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nikandr-surkov/ai-saas-starter)](https://github.com/nikandr-surkov/ai-saas-starter/stargazers)

![ai-saas-starter — Next.js AI SaaS boilerplate, landing page in the Ledger design (light theme)](docs/landing.png)

## Why another SaaS boilerplate?

AI assistants are good at building product features and bad at the 20% that
loses money when improvised: webhook retries, concurrent spends, refund
paths, idempotency. This repo ships that 20% finished and tested — an
append-only credit ledger whose balance is enforced equal to
`SUM(amount)`, Stripe webhooks that verify raw-body signatures and survive
replays, a double-spend race test against real Postgres — plus the context
files (AGENTS.md, rules, skills, hooks) that keep an agent from quietly
unpicking any of it while you vibe-code the product on top.

## Stack

Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · TypeScript
strict · Better Auth · Drizzle ORM + PostgreSQL · Stripe · Vercel AI SDK 6
via AI Gateway · Tailwind CSS v4 + shadcn/ui · Resend + React Email ·
Vitest + Playwright.

## Quickstart (60 seconds)

```bash
git clone https://github.com/nikandr-surkov/ai-saas-starter.git my-app
cd my-app
pnpm install
docker compose up -d        # Postgres 17
cp .env.example .env        # fill in BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate
pnpm dev
```

That boots with graceful degradation: no Stripe keys → billing page shows a
setup card; no Resend key → emails no-op with a console warning; no OAuth
keys → those buttons hide; `AI_MOCK=true` → image generation is free and
offline. Every variable is documented in [.env.example](.env.example).

## What's inside

- **Auth** — email/password with verification, Google, GitHub, magic links.
  Sessions live in your Postgres. Settings page with password change,
  account linking, and cascade-safe account deletion (cancels the Stripe
  subscription first).
- **Billing** — Stripe Checkout + Customer Portal as server actions, a
  signature-verified webhook, and one sync function as the only writer of
  subscription state. Plans, prices, and credit amounts live in
  [src/config/plans.ts](src/config/plans.ts) and nowhere else.
- **Credits ledger** — append-only `credit_transactions` with UNIQUE
  idempotency keys. Grants on `invoice.paid` (`grant_{invoiceId}`), top-ups
  on checkout (`topup_{sessionId}`), spends as one conditional UPDATE (the
  race guard), refunds as compensating rows. The database itself refuses
  negative balances and zero-amount rows.
- **AI generation** — prompt → rate limit (10/min) → spend 1 credit →
  AI SDK 6 `generateImage` → store (Vercel Blob, or `./.generated` in dev)
  → history grid. Provider failure refunds automatically. Swap models via
  `AI_IMAGE_MODEL=provider/model`; add providers by implementing one
  interface ([src/lib/ai/provider.ts](src/lib/ai/provider.ts)).
- **Design system** — "The Ledger": tokens and hard rules in
  [DESIGN.md](DESIGN.md), light and dark, no gradients, no shadows, 2px
  radius, ruled rows instead of card grids. `/styleguide` (dev only) shows
  every primitive in both themes.

## Architecture in one paragraph

Server Components by default; Server Actions for mutations; API routes only
for the Stripe webhook and the Better Auth handler. Zod validates every
boundary — forms, webhook payloads, and env
([src/lib/env.ts](src/lib/env.ts), the only place `process.env` is read).
Money is integer cents, credits are integers, and two modules own the
dangerous writes: [src/lib/credits/](src/lib/credits/) is the only code
that touches credit tables, and `syncStripeDataToDb` in
[src/lib/billing/sync.ts](src/lib/billing/sync.ts) is the only writer of
subscription state — webhooks are triggers, never sources of truth.

## The AI-native part

This repo assumes an agent will extend it, and briefs the agent accordingly:

| File                              | What it does for the agent                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AGENTS.md](AGENTS.md)            | The operating manual: commands, conventions, safety boundaries (NEVER / ASK FIRST), gotchas, definition of done. Works with Claude Code, Cursor, Codex, Copilot, Gemini CLI. |
| [CLAUDE.md](CLAUDE.md)            | Imports AGENTS.md, adds plan-mode policy for money code and skill pointers.                                                                                                  |
| [DESIGN.md](DESIGN.md)            | Tokens plus hard rules, so generated UI stays on-brand.                                                                                                                      |
| `.claude/rules/`                  | Path-scoped invariants that load only when billing, database, or design files are touched.                                                                                   |
| `.claude/skills/`                 | `/add-feature`, `/add-ai-provider`, `/db-migration` — the common jobs, scripted the repo's way.                                                                              |
| `.claude/hooks/`                  | Prettier after every edit; a Stop hook that blocks "done" until `tsc --noEmit` passes.                                                                                       |
| `.claude/agents/code-reviewer.md` | A read-only reviewer for auth/billing/ledger diffs. It found real money bugs during this repo's own build.                                                                   |
| `specs/TEMPLATE.md`               | Spec-first workflow — copy it, fill it, hand it to the agent. A filled example is included.                                                                                  |

With Claude Code: open the repo and the context loads itself; type
`/add-feature` to scaffold the repo way. With Cursor: `.cursor/rules/`
mirrors the same invariants. Everything defers to AGENTS.md, so there is
one source of truth to edit.

## Testing

```bash
pnpm test        # Vitest — needs Postgres: docker compose up -d
pnpm test:e2e    # Playwright — boots its own dev server on :3100
```

94 unit/integration tests: the full ledger behavioral suite against real
Postgres (double-spend race, exact-boundary spends, idempotent replays,
refunds, key-collision detection, invariant checks, DB CHECK probes),
webhook signature verification with real HMAC fixtures, sync derivation,
plans-config locks, env validation, email rendering. 11 e2e tests: signup
to dashboard, mock generation, the FAIL-refund path, the 0-credit block,
open-redirect guards, image-route authorization.

e2e runs against `next dev` deliberately — `AI_MOCK=true` is refused in
production builds, so a build+start e2e would hit a real provider. The
comment in [playwright.config.ts](playwright.config.ts) explains.

## Stripe, locally

1. Create three test-mode prices (Pro $9/mo, Ultra $29/mo, Top-up $5
   one-time) in the [Stripe dashboard](https://dashboard.stripe.com/test/products)
   or via the API, and put the `price_...` IDs in `.env`.
2. `pnpm stripe:listen` (Stripe CLI) — copy the printed `whsec_...` into
   `.env`, restart `pnpm dev`.
3. Subscribe with card `4242 4242 4242 4242` → the webhook grants the
   plan's credits, keyed by invoice ID. Resend the event from the Stripe
   dashboard — the ledger's unique key makes the replay a no-op.
4. Renewals and cancellations can't wait a month: use
   [test clocks](https://docs.stripe.com/billing/testing/test-clocks) to
   advance time. Portal cancellations set `cancel_at` (not the legacy
   boolean) — the sync handles both; don't "simplify" it.

## Deploy (Vercel)

1. Push to GitHub, import in Vercel.
2. Set the env vars from `.env.example` — in production the Stripe vars are
   required at boot, `AI_MOCK` must be false/unset, and you'll want
   `BLOB_READ_WRITE_TOKEN` (image storage) plus a real `RESEND_API_KEY`.
3. Point a production Stripe webhook at
   `https://your-domain/api/stripe/webhook` and use ITS signing secret.
4. Set `BETTER_AUTH_URL` and `siteConfig.url`
   ([src/config/site.ts](src/config/site.ts)) to your domain.
5. Run migrations against your production database:
   `DATABASE_URL=... pnpm db:migrate`.

## FAQ

**Is this production-ready?** The billing and ledger core is tested to a
standard most products never reach (races, replays, invariants, adversarial
webhooks). The legal pages are placeholders and the product on top is
yours to build.

**Is this a free alternative to ShipFast or Makerkit?** It overlaps where
every SaaS starter overlaps — auth, Stripe, landing page — but the focus
is different: a tested credits ledger, an AI generation loop, and agent
context files, free and MIT. The paid kits are broader (teams, i18n,
admin); the Pro version covers that ground.

**Why is generation mocked by default?** So a fresh clone works offline and
free. Set `AI_GATEWAY_API_KEY` and `AI_MOCK=false` for real images; in mock
mode, a prompt containing `FAIL` demos the refund path.

**Can I swap Postgres providers?** Anything with a `postgres://` URL —
Neon, Supabase, RDS, the bundled Docker.

**Where do I start extending?** Copy `specs/TEMPLATE.md`, write ten lines,
and hand it to your agent with `/add-feature`.

## Free vs Pro

| Capability                                | Free — this repo | [Pro — nikandr.com](https://nikandr.com) |
| ----------------------------------------- | ---------------- | ---------------------------------------- |
| Auth, subscriptions, credits ledger       | full             | + rollover, meters, packs                |
| AI generation                             | 1 image provider | image + video + audio, 7 providers       |
| Async job pipeline, webhooks, auto-refund | —                | Inngest, durable                         |
| Gallery + R2 storage, teams, admin        | —                | included                                 |
| MCP server + extended agent skills        | core set         | full suite                               |

The free repo is complete — nothing above is crippled. Pro is what comes
after product-market fit.

## License

MIT — see [LICENSE](LICENSE).
