# DESIGN.md — "The Ledger", Premium Neo-Brutalist (v3.1)

An accountant's ledger drawn with markers. The identity survives — ruled
ledger rows, mono data, tabular numerals, the append-only story — but the
surface is playful neo-brutalism in the RetroUI lineage: warm cream canvas
with a dot grid, flat saturated-pastel panels, marker highlights, stickers,
sparkle doodads, chunky display type with hard offset shadows. v3.1 adds
the premium grammar: tokenized border widths and shadow tiers, and a strict
structural separation between loud marketing and calm product surfaces.
Every UI decision follows this file. No exceptions without editing it
first.

## Hard rules

1. **Borders are tokenized**: `--border-w` (2px) on every container,
   button, input, and table; `--border-w-emph` (3px) ONLY for hero/CTA
   emphasis (hero primary button, closing-band button). Always solid
   `var(--ink)`.
2. **Hard offset shadows in exactly three tiers, ONE direction
   (down-right), no exceptions** — consistency is the premium tell:
   - `--shadow-hard-sm` `3px 3px 0` — badges, chips, stickers,
     DigitBoxes, app cards.
   - `--shadow-hard-md` `5px 5px 0` — marketing cards and buttons
     (the `.press` rest state).
   - `--shadow-hard-lg` `8px 8px 0` — dialogs, popovers, dropdowns,
     toasts (the floating layer).
     No blur, no gradients, no glassmorphism, ever. Press physics: hover
     `translate(-2px,-2px)` + shadow grows to 7px; active
     `translate(2px,2px)` + shadow 0.
3. **Structural separation** — the premium move is restraint:
   - **Marketing surfaces are loud**: dot grid, section color blocking,
     panels, stickers, doodads, md shadows.
   - **App surfaces are calm**: cream/white cards with sm shadows or
     none; color appears only as small accents — 6px colored
     left-borders on cards and banners, badges, the DigitBoxes. Dense
     data on quiet surfaces. No full-color card backgrounds, no dot
     grid, no doodads in the app shell.
4. **Radius: 12px** for cards/panels/buttons; **pills (9999px)** for
   chips, badges, stickers, and nav links.
5. **Color roles are strict**: `--action` (pop-yellow) drives primary
   buttons with ink text — **ink on yellow always, never yellow text**.
   `--credit` green is ONLY positive amounts and success. `--debit` red
   is ONLY negative/destructive/errors. Panel colors are backgrounds
   (marketing) or left-border accents (app), never text.
6. **Fun vocabulary, each with restraint** (marketing): marker
   highlights on 1–2 words per section heading + the active nav item,
   stickers (bordered, sm-shadowed, −3…3deg, tiny hover wobble),
   sparkles/asterisks/squiggle doodads at most 2–3 per section,
   big-number digit boxes for the dashboard balance and pricing prices,
   ONE hero word with the offset-shadow text treatment.
7. **Section color blocking** (marketing only): canvas → mint panel →
   canvas → sky panel → … → pink CTA band. Cards inside colored panels
   sit on canvas with ink borders.
8. **Ledger rows stay** — the identity. 2px ink separators, mono
   metadata. **All numerals `tabular-nums`.** No emoji. Icons are
   lucide-react; doodads are inline SVG.
9. **A11y is non-negotiable**: body text ≥4.5:1 on every surface in
   both modes (verified below). Focus rings: **3px ink, offset 2px**,
   everywhere. Styled `::selection`: pop-yellow background, ink text.
10. **Motion is CSS-only, ≤250ms**, behind the `prefers-reduced-motion`
    kill switch — press physics, row hover nudge, hero ledger stagger,
    marker draw-in, toast press-in, and the one sanctioned slow loop:
    sparkle twinkle. Two sanctioned exceptions: the dashboard balance
    count-up (one-shot, ≤500ms, JS `requestAnimationFrame`, skipped
    entirely under reduced motion) and cross-document View Transitions
    between marketing pages (`@view-transition`, browser-driven where
    supported; SPA navigations stay instant). No marquees, no
    scroll-jacking.
11. **No new UI/animation libraries.**

## Tokens

Hard-code ONLY these; derive the rest with `color-mix()`.

```css
/* light */
--ink: oklch(0.2 0.02 90); /* every border, every body text */
--canvas: oklch(0.993 0.011 95); /* warm cream ≈ #FFFDF5 */
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

Required derivations (the v3.1 grammar):

```css
--border-w: 2px; /* the standard; Tailwind border-2 */
--border-w-emph: 3px; /* hero/CTA emphasis only */
--shadow-hard-sm: 3px 3px 0 0 var(--ink); /* badges, chips, app cards */
--shadow-hard-md: 5px 5px 0 0 var(--ink); /* marketing cards, buttons */
--shadow-hard-lg: 8px 8px 0 0 var(--ink); /* dialogs, popovers, toasts */
--action: var(--pop-yellow); /* primary buttons, ink text */
--paper-2: color-mix(in oklch, var(--canvas), var(--ink) 5%);
--muted-ink: color-mix(
  in oklch,
  var(--ink),
  var(--canvas) 25%
); /* 30% in dark — the warmer canvas forced 35%→25% in light to keep
      muted text ≥4.5 on every colored panel */
--credit-text: color-mix(
  in oklch,
  var(--credit),
  var(--ink) 45%
); /* light only; dark uses --credit raw */
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
```

Contrast (WCAG 2.x, computed 2026-07-20): ink on canvas 17.8 light /
16.0 dark; ink on panels — yellow 12.6/11.0, mint 13.2/10.7, sky
12.0/10.9, pink 11.2/11.2, orange 10.0/11.1; muted-ink on canvas 9.1
light / 7.5 dark, and on panels (worst case) orange 5.1 light / mint 5.0
dark — every pairing ≥4.5; credit-text 5.6 light, credit 8.9 dark;
debit-text 5.9 light, debit 6.2 dark; canvas-on-debit-deep 5.9. Raw
`--credit` as light-mode text is **1.85** — that is why `--credit-text`
exists.

## Typography

- **Bricolage Grotesque** (`--font-display`, 700/800) — display headings,
  tight leading. ONE hero word gets `text-shadow: 4px 4px 0
var(--pop-yellow)` (dark: the muted yellow) — the "stand out" moment.
- **Instrument Sans** — body/UI. **Martian Mono** — eyebrows, data,
  numbers, code. Unchanged.

## Components

- **Button**: 2px ink border (3px for the hero/band CTAs), 12px radius,
  md shadow, press physics. Primary = `--action` yellow + ink text.
  Outline/secondary = canvas. Destructive = debit-deep + canvas text.
  Ghost = borderless icon buttons; 3px ink focus ring, offset 2px,
  everywhere.
- **Card**: 2px border. App register: canvas bg, sm shadow, optional 6px
  colored left-border accent. Marketing register: canvas or panel bg, md
  shadow.
- **Marker**: skewed pop-yellow swoosh behind heading words / active nav
  pill; draws in once (scale-x, ≤250ms, motion-safe).
- **Sticker**: pill, panel-color bg, 2px border, sm shadow, −3…3deg,
  hover wobble. Hero: "10 FREE CREDITS" (yellow) + "MIT · OPEN SOURCE"
  (mint); pricing Pro row: "MOST POPULAR" (pink).
- **Doodads**: inline-SVG sparkles (4-point), asterisk bursts, one
  squiggle underline; ink or panel colors; sparkles twinkle slowly.
  Marketing only.
- **DigitBoxes**: each digit in its own 2px-bordered square, Martian
  Mono, sm shadow — dashboard balance (with one-shot count-up), pricing
  prices.
- **Checkbox/Switch**: chunky — 2px ink borders, sm shadow on the
  checkbox, `--action` yellow fill + ink glyph/thumb when on.
- **Skeleton**: bordered — 2px ink border, paper-2 fill, motion-safe
  pulse. Route-level `loading.tsx` in the app shell uses it.
- **Inputs/Table/Dialog/Menu/Toast**: 2px borders, 12px radius, 3px ink
  focus rings; dialogs/menus/toasts carry the lg shadow. Toasts enter
  with a press-release (translate from the shadow offset, ≤200ms).
- **LedgerRow**: unchanged layout; hover = credit-soft wash + 2px nudge.

## Copy

Friendly, playful, concrete. Exclamation marks allowed SPARINGLY —
success toasts and one hero moment, nowhere else. Still banned: emoji,
hype adjectives, "Build faster / Ship smarter" phrasing. Every empty,
loading, and error state is informative with a clear next step; errors
are human sentences, never raw codes.
