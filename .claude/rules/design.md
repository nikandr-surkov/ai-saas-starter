---
paths:
  - "src/components/**"
  - "src/app/(marketing)/**"
---

# Design rules — "The Ledger", Playful Neo-Brutalist (v3)

Full system in DESIGN.md. The hard rules, restated:

- 2px solid `var(--ink)` borders on every container, button, input, table.
- Hard offset shadows only (`4px 4px 0 var(--ink)`); press physics on
  interactive elements (hover −2px/−2px + 6px shadow, active +2px/+2px +
  no shadow). No blur, no gradients, no glassmorphism, ever.
- Radius 12px; pills for chips, badges, stickers, nav links.
- Color roles are strict: `--action` yellow = primary buttons (ink text);
  `--credit` green = positive amounts and success ONLY; `--debit` red =
  negative/destructive/errors ONLY; panel colors (`--pop-*`) are
  backgrounds, never text.
- NEVER use raw `--credit` or `--debit` as light-mode text — use
  `--credit-text` / `--debit-text` (raw values fail WCAG on cream).
- Fun vocabulary with restraint: dot-grid canvas (marketing), marker
  highlights (1–2 words per heading), stickers at the DESIGN.md-specified
  spots, sparkle/asterisk/squiggle doodads max 2–3 per section,
  DigitBoxes for balance and prices, ONE hero word with the yellow
  offset text-shadow.
- Section color blocking per DESIGN.md; ledger rows stay the signature —
  numbered, 2px separators, never card grids. Tabular numerals always.
- Motion CSS-only ≤250ms behind the reduced-motion kill switch; the slow
  sparkle twinkle is the only loop allowed.
- No emoji. Icons lucide-react; doodads inline SVG.
- Copy: friendly, playful, concrete. Exclamations SPARINGLY (success
  toasts, one hero moment). Banned: emoji, hype adjectives, "Build
  faster"/"Ship smarter" phrasing.
- Use tokens from `globals.css`; derive shades with `color-mix()` — no
  new oklch/hex literals in components.
