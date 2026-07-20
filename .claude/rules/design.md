---
paths:
  - "src/components/**"
  - "src/app/(marketing)/**"
  - "src/app/(app)/**"
---

# Design rules — "The Ledger", Premium Neo-Brutalist (v3.1)

Full system in DESIGN.md. The hard rules, restated:

- Borders: 2px solid `var(--ink)` everywhere (`--border-w`); 3px
  (`--border-w-emph`, `border-emph` utility) ONLY on the hero and
  closing-band CTAs.
- Hard offset shadows in exactly THREE tiers, one direction (down-right),
  never blurred: `shadow-hard-sm` 3px (badges/chips/stickers/DigitBoxes/
  app cards), `shadow-hard` 5px (marketing cards, buttons), and
  `shadow-hard-lg` 8px (dialogs/dropdowns/toasts). Press physics on
  interactive elements (hover −2px/−2px + 7px shadow, active +2px/+2px +
  no shadow). No blur, no gradients, no glassmorphism, ever.
- STRUCTURAL SEPARATION: marketing is loud (dot grid, color-blocked
  panels, stickers, doodads, md shadows); the app is calm (cream cards,
  sm shadow or none, color only as 6px left-border accents, badges, and
  DigitBoxes — never full-color card backgrounds, never doodads).
- Radius 12px; pills for chips, badges, stickers, nav links.
- Color roles are strict: `--action` yellow = primary buttons with INK
  text (never yellow text on anything); `--credit` green = positive
  amounts and success ONLY; `--debit` red = negative/destructive/errors
  ONLY; panel colors (`--pop-*`) are backgrounds or accent borders,
  never text.
- NEVER use raw `--credit` or `--debit` as light-mode text — use
  `--credit-text` / `--debit-text` (raw values fail WCAG on cream).
- Muted text is `--muted-ink`: a 25% canvas mix in light, 30% in dark —
  computed to stay ≥4.5 on every panel. Don't invent other grays.
- Focus rings: 3px ink, offset 2px, on every interactive element.
  `::selection` is pop-yellow with ink text.
- Fun vocabulary with restraint (marketing only): marker highlights
  (1–2 words per heading), stickers at the DESIGN.md-specified spots,
  sparkle/asterisk/squiggle doodads max 2–3 per section, DigitBoxes for
  balance and prices, ONE hero word with the yellow offset text-shadow.
- Section color blocking per DESIGN.md; ledger rows stay the signature —
  numbered, 2px separators, never card grids. Tabular numerals always.
- Motion CSS-only ≤250ms behind the reduced-motion kill switch; the slow
  sparkle twinkle is the only loop. Sanctioned exceptions: the dashboard
  balance count-up (one-shot rAF, ≤500ms, skipped under reduced motion)
  and `@view-transition` for cross-document marketing navigation.
- No emoji. Icons lucide-react; doodads inline SVG.
- Copy: friendly, playful, concrete. Exclamations SPARINGLY (success
  toasts, one hero moment). Banned: emoji, hype adjectives, "Build
  faster"/"Ship smarter" phrasing.
- Use tokens from `globals.css`; derive shades with `color-mix()` — no
  new oklch/hex literals in components.
