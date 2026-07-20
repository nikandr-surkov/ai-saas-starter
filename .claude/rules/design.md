---
paths:
  - "src/components/**"
  - "src/app/(marketing)/**"
  - "src/app/(app)/**"
---

# Design rules — "The Ledger", LOUD MODE (v4)

Full system in DESIGN.md. The hard rules, restated:

- SOLID COLOR BLOCKING on marketing: full-bleed section backgrounds in
  the DESIGN.md order (yellow hero → cream proof → mint features → sky
  agents → cream pricing/compare → pink FAQ → ink closing band, light
  text). Body text always on solid color, ≥4.5:1 both modes. NO
  dot-grid behind text — texture only as thin strips between sections
  or inside illustrations. Sections meet at straight edges with a 3px
  ink rule. No gradients ever.
- Register scoping via `.loud` (marketing `<main>`): borders 3px base /
  4px hero (`border-hard` / `border-emph` utilities read `--border-w` /
  `--border-w-emph`); shadow tiers 6/9/12. The app keeps literal 2px
  borders and 3/5/8 tiers. One shadow direction (down-right), never
  blurred. Press physics unchanged.
- FOUR FACES, FOUR JOBS: Archivo Black = hero H1 + section titles ONLY
  (uppercase, `text-display` / `text-title`, offset `--title-shadow`);
  Bricolage = subheads/card titles; Instrument Sans = body; Martian
  Mono = data. Never Archivo in the app.
- WORD BUDGETS are hard rules: H1 ≤8 words, section titles ≤4, any
  paragraph ≤18, chip rows over sentences. Feature rows = number +
  4-word title + one line.
- Color roles strict: `--action` yellow buttons with INK text (never
  yellow text); `--credit` positive/success ONLY (use `--credit-text`
  in light mode — raw fails WCAG); `--debit` negative/destructive ONLY
  (`--debit-text` in light); muted text is `--muted-ink` (25% light /
  30% dark), `--on-ink-muted` on the ink band.
- App register is MEDIUM-FUN: panel-colored card header strips
  (yellow/mint/sky) with an ink rule over cream bodies, colored badges,
  DigitBoxes. No marquees, tilts, or doodads in the app. Dense data
  stays quiet.
- Motion: CSS-first, ≤400ms except the marquee; reduced-motion kill
  switch is absolute. Sanctioned: marquee (pause on hover, static under
  reduced motion), hero entrance stagger (words → illustration bounce →
  sticker wobble), view()-timeline scroll pop-ins with fallback to
  visible, card tilt ±1deg hovers, hero illustration 4s idle float, FAQ
  chevron 90deg spin, plus v3.1 keepers (press, count-up, marker
  draw-in, twinkle, toast press-in). Loops: marquee, float, twinkle —
  nothing else.
- Ledger identity: code exhibit is the proof; ledger rows/tables keep
  2px separators, mono metadata, tabular numerals. ✦ in the marquee is
  a sanctioned glyph; emoji stay banned.
- Focus rings 3px ink offset 2px; ::selection yellow/ink.
- Illustrations only at: hero, dashboard first-run, generate empty,
  404/error pages, pricing accent. next/image, real alt, ≤150KB.
- Copy: loud, concrete, few words. Exclamations SPARINGLY. Banned:
  emoji, hype adjectives, "Build faster"/"Ship smarter".
- Use tokens from `globals.css`; derive shades with `color-mix()` — no
  new oklch/hex literals in components.
