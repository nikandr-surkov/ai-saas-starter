# Changelog

## 0.2.1 — 2026-07-23 — docs: illustrated README

The README becomes the storefront: eight optimized screenshots
(`docs/screenshots/`), a plain-words "What is this?", a captioned
gallery, a one-prompt "Quickstart for AI agents", screenshots embedded
at the features they show, and an expanded FAQ (Claude Code/Cursor,
credits system, model swap, Better Auth rationale). Billing gained plan
cards rendered from the plans config (0.2.0 follow-up, `14de3a4`).

## 0.2.0 — 2026-07-22 — the loud redesign

"The Ledger, LOUD MODE": the marketing site moves from restrained
neo-brutalism to full-bleed color blocking (yellow hero → ink marquee →
cream clarity/gallery → mint features → sky agents → cream pricing →
pink FAQ → ink closing band), Archivo Black display type with hard word
budgets, and a CSS-first motion kit (marquee, entrance choreography,
scroll pop-ins, tilts) behind an absolute reduced-motion kill switch.

- Illustration pipeline: `scripts/generate-illustrations.mjs` generates
  the sticker-world cast on Replicate (parallel, green-screen →
  chroma-key transparency, per-file resume) — hero robot, coin mascots,
  gallery posters, feature cards, how-it-works steps.
- New sections: "What is this?", "How it works", "Made with it."
  gallery, illustrated feature cards, two-card Free-vs-Pro, upgraded
  FAQ; the code exhibit retired in favor of the gallery.
- Interaction grammar: chip pills with yellow-flip hovers, icon-chip
  list markers (bare glyphs banned), marker/link-pop hovers everywhere —
  no underline-only or color-only hovers left; cursor-pointer on every
  enabled control.
- App interior stays calm: tinted card headers, unified page headers,
  one skeleton system with a shared shimmer, calm button physics with
  sparkle busy states, generation tile states with prompt-prefilling
  retry.
- A11y: computed ≥4.5:1 body text on every surface in both themes, 3px
  ink focus rings, styled selection, zero horizontal overflow from
  320px up.

## 0.1.0 — 2026-07-15

Initial release.

- Auth: Better Auth with email/password + verification, Google, GitHub,
  magic links; settings with password change, account linking, cascade-safe
  deletion. Welcome grant (10 credits) through the ledger at signup.
- Billing: Stripe Checkout + Customer Portal server actions,
  signature-verified webhook, `syncStripeDataToDb` as the single writer of
  subscription state, plans/prices/credits in one config file.
- Credits: append-only ledger with UNIQUE idempotency keys, conditional-
  UPDATE spend (race-safe), compensating refunds, DB CHECKs backstopping
  the invariant `users.credit_balance == SUM(amount)`.
- AI: provider interface + AI Gateway implementation (AI SDK 6), model swap
  via env, free offline mock mode with a demoable failure switch, rate
  limiting, Blob/local storage, history grid.
- Marketing: "The Ledger" design system (light/dark), landing, pricing,
  SEO (sitemap, robots, OG, JSON-LD), React Email templates.
- AI-native: AGENTS.md, CLAUDE.md, DESIGN.md, path-scoped rules, skills,
  typecheck-blocking hooks, read-only code-reviewer agent, spec template.
- Tests: 94 Vitest (ledger vs real Postgres incl. double-spend race,
  webhook HMAC fixtures) + 11 Playwright e2e (auth flow, generation,
  refund path, zero-credit block, open-redirect guard, image authz).
  GitHub Actions CI with a Postgres service container.
