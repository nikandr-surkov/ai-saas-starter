# DESIGN.md — "The Ledger", Playful Neo-Brutalist (v3)

An accountant's ledger drawn with markers. The identity survives — ruled
ledger rows, mono data, tabular numerals, the append-only story — but the
surface is playful neo-brutalism in the RetroUI lineage: cream canvas with
a dot grid, flat saturated-pastel panels in rotation, marker highlights,
stickers, sparkle doodads, chunky display type with hard offset shadows.
Every UI decision follows this file. No exceptions without editing it
first.

## Hard rules

1. **2px solid `var(--ink)` borders** on every container, button, input,
   and table.
2. **Hard offset shadows only**: `4px 4px 0 var(--ink)`; hover
   `translate(-2px,-2px)` + 6px shadow; active `translate(2px,2px)` +
   shadow 0 (the press). No blur, no gradients, no glassmorphism, ever.
3. **Radius: 12px** for cards/panels/buttons; **pills (9999px)** for
   chips, badges, stickers, and nav links.
4. **Color roles are strict**: `--action` (pop-yellow) drives primary
   buttons with ink text. `--credit` green is ONLY positive amounts and
   success. `--debit` red is ONLY negative/destructive/errors. Panel
   colors are backgrounds, never text.
5. **Fun vocabulary, each with restraint**: dot-grid canvas (marketing),
   marker highlights on 1–2 words per section heading + the active nav
   item, stickers (bordered, hard-shadowed, −3…3deg, tiny hover wobble),
   sparkles/asterisks/squiggle doodads at most 2–3 per section,
   big-number digit boxes for the dashboard balance and pricing prices,
   ONE hero word with the offset-shadow text treatment.
6. **Section color blocking** (marketing): canvas → mint panel → canvas →
   sky panel → … → pink CTA band. Cards inside colored panels sit on
   canvas with ink borders. Dashboard cards rotate panel colors
   (balance = yellow, plan = mint, history = canvas).
7. **Ledger rows stay** — the identity. 2px ink separators, mono
   metadata; they may sit on colored panels.
8. **All numerals `tabular-nums`.** No emoji. Icons are lucide-react;
   doodads are inline SVG.
9. **Motion is CSS-only, ≤250ms**, behind the `prefers-reduced-motion`
   kill switch — press physics, row hover nudge, hero ledger stagger,
   marker draw-in, and the one sanctioned slow loop: sparkle twinkle.
   No marquees, no scroll-jacking.
10. **No new UI/animation libraries.**

## Tokens

Hard-code ONLY these; derive the rest with `color-mix()`.

```css
/* light */
--ink: oklch(0.2 0.02 90); /* every border, every body text */
--canvas: oklch(0.96 0.02 90); /* cream page background */
--pop-yellow: oklch(0.88 0.16 95);
--pop-mint: oklch(0.88 0.13 150);
--pop-sky: oklch(0.86 0.09 230);
--pop-pink: oklch(0.86 0.1 350);
--pop-orange: oklch(0.82 0.13 60);
--credit: oklch(0.75 0.18 150); /* positive amounts / success ONLY */
--debit: oklch(0.62 0.23 27); /* negative / destructive ONLY */
--radius: 12px;

/* dark — charcoal canvas, light ink, panels drop to deep muted hues */
--canvas: oklch(0.19 0.02 90);
--ink: oklch(0.95 0.01 90);
--pop-yellow: oklch(0.32 0.07 95);
--pop-mint: oklch(0.32 0.06 150);
--pop-sky: oklch(0.32 0.05 230);
--pop-pink: oklch(0.32 0.05 350);
--pop-orange: oklch(0.32 0.06 60);
--credit: oklch(0.75 0.18 150);
--debit: oklch(0.7 0.2 27);
```

Required derivations:

```css
--action: var(--pop-yellow); /* primary buttons, ink text */
--paper-2: color-mix(in oklch, var(--canvas), var(--ink) 5%);
--muted-ink: color-mix(
  in oklch,
  var(--ink),
  var(--canvas) 35%
); /* 30% in dark —
               keeps muted text ≥4.5 on colored panels */
--credit-text: color-mix(
  in oklch,
  var(--credit),
  var(--ink) 45%
); /* light only;
               dark uses --credit raw */
--debit-text: color-mix(
  in oklch,
  var(--debit),
  var(--ink) 25%
); /* light only */
--debit-deep: color-mix(
  in oklch,
  var(--debit),
  var(--ink) 30%
); /* destructive fills */
--shadow-hard: 4px 4px 0 0 var(--ink);
```

Contrast (WCAG 2.x, computed): ink on canvas 16.1 light / 16.0 dark; ink
on panels — yellow 12.6/11.0, mint 13.2/10.7, sky 12.0/10.9, pink
11.2/11.2, orange 10.0/11.1; muted-ink ≥6.2 on canvas and ≥5.0 on every
panel in both modes; credit-text 5.1 light, credit 8.9 dark; debit-text
5.4 light, debit 6.2 dark; canvas-on-debit-deep 5.9. Raw `--credit` as
light-mode text is **1.85** — that is why `--credit-text` exists.

## Typography

- **Bricolage Grotesque** (`--font-display`, 700/800) — display headings,
  tight leading. ONE hero word gets `text-shadow: 4px 4px 0
var(--pop-yellow)` (dark: the muted yellow) — the "stand out" moment.
- **Instrument Sans** — body/UI. **Martian Mono** — eyebrows, data,
  numbers, code. Unchanged.

## Components

- **Button**: 2px ink border, 12px radius, hard shadow, press physics.
  Primary = `--action` yellow + ink text. Outline/secondary = canvas.
  Destructive = debit-deep + canvas text. Ghost = borderless icon
  buttons; ink focus ring (2px, offset 2px) everywhere.
- **Card**: canvas or panel color bg, 2px border, static hard shadow.
- **Marker**: skewed pop-yellow swoosh behind heading words / active nav
  pill; draws in once (scale-x, ≤250ms, motion-safe).
- **Sticker**: pill, panel-color bg, 2px border, hard shadow, −3…3deg,
  hover wobble. Hero: "10 FREE CREDITS" (yellow) + "MIT · OPEN SOURCE"
  (mint); pricing Pro row: "MOST POPULAR" (pink).
- **Doodads**: inline-SVG sparkles (4-point), asterisk bursts, one
  squiggle underline; ink or panel colors; sparkles twinkle slowly.
- **DigitBoxes**: each digit in its own 2px-bordered square, Martian
  Mono, hard shadow — dashboard balance, pricing prices.
- **Inputs/Table/Dialog/Menu/Toast**: as v2 (2px borders, hard shadows,
  ink focus rings) with the 12px radius.
- **LedgerRow**: unchanged layout; hover = credit-soft wash + 2px nudge.

## Copy

Friendly, playful, concrete. Exclamation marks allowed SPARINGLY —
success toasts and one hero moment, nowhere else. Still banned: emoji,
hype adjectives, "Build faster / Ship smarter" phrasing. Every empty,
loading, and error state is informative with a clear next step; errors
are human sentences, never raw codes.
