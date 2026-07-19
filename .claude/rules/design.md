---
paths:
  - "src/components/**"
  - "src/app/(marketing)/**"
---

# Design rules — "The Ledger", Neo-Brutalist edition (v2)

Full system in DESIGN.md. The hard rules, restated:

- 2px solid `var(--ink)` borders on every container, button, input,
  table. No faint hairlines.
- Shadows are HARD offsets only (`4px 4px 0 0 var(--ink)`), no blur.
  Soft shadows, gradients, and glassmorphism stay banned.
- Interactive press physics: hover −2px/−2px with a 6px shadow; active
  +2px/+2px with no shadow.
- Radius 6px globally; pills only for badges/stickers.
- Accent green only for primary actions, positive amounts, success.
  Yellow `--highlight` is for emphasis marks only — NEVER buttons.
  `--debit` red only for destructive/errors/expiry; spends are ink.
  Raw `--debit` is illegal as light-mode text — use `--debit-text`.
- One rotated sticker per page, maximum.
- Features/lists render as numbered ledger rows with 2px separators —
  never card grids.
- All numerals `tabular-nums`. No emoji; icons are lucide-react.
- Display type is Bricolage Grotesque (700/800); body Instrument Sans;
  mono Martian Mono. Nothing else.
- Focus rings: ink, 2px, offset 2px — on every focusable element.
- Motion CSS-only, ≤200ms, always inside the `prefers-reduced-motion`
  guard. No scroll-jacking, marquees, or infinite loops.
- Copy: brief, concrete, real technology names. Banned: "Build faster",
  "Ship smarter", "Streamline", "Supercharge", "Unleash". No emoji, no
  exclamation marks. Errors are human sentences with a next step.
- Use tokens from `globals.css`; derive shades with `color-mix()`, never
  new hex/oklch literals in components.
