# DESIGN.md — "The Ledger", LOUD MODE (v4)

An accountant's ledger repainted as a poster wall. v4 keeps the v3.1
grammar — ink borders, hard offset shadows, press physics, the pastel-pop
palette, the coin mascot — and drops the restraint DNA on marketing
surfaces: the page IS the color, the type is huge, and motion is meant to
be noticed. The app stays a working tool: medium-fun, dense data on quiet
surfaces. Every UI decision follows this file. No exceptions without
editing it first.

## Hard rules

1. **Solid color blocking (marketing)** — full-bleed saturated section
   backgrounds in this order: hero = pop-yellow · proof = canvas ·
   features = pop-mint · agents = pop-sky · pricing + compare = canvas ·
   FAQ = pop-pink · closing band = ink with light text. Dark mode keeps
   the same hues, deep-muted. Body text ALWAYS sits on solid color at
   ≥4.5:1 (verified below). NO dot-grid behind text — texture may
   survive only as thin transition strips between sections or inside
   illustrations. Section transitions are straight hard edges with a
   3px ink rule. No gradients, ever.
2. **Borders**: marketing base 3px (`border-hard` = `--border-w`), hero
   elements 4px (`border-emph` = `--border-w-emph`); the app keeps 2px.
   Always solid `var(--ink)`.
3. **Shadow tiers, ONE direction (down-right)**: marketing 6/9/12px,
   app 3/5/8px — same three utilities (`shadow-hard-sm`, `shadow-hard`,
   `shadow-hard-lg`) reading scoped variables; the `.loud` marketing
   scope raises them. No blur, no glassmorphism. Press physics: hover
   `translate(-2px,-2px)` + shadow +2px; active `translate(2px,2px)` +
   shadow 0.
4. **Four faces, four jobs**: **Archivo Black** — hero H1 and section
   titles ONLY, uppercase, tight leading, offset-shadow treatment.
   **Bricolage Grotesque 700/800** — subheads and card titles.
   **Instrument Sans** — body/UI. **Martian Mono** — eyebrows, data,
   numbers, code.
5. **Scale**: H1 `clamp(3.5rem → 7rem)`; section titles
   `clamp(2.5rem → 4.5rem)`. Offset shadow = solid `--title-shadow`
   color behind ink text: canvas-colored on pop panels, pop-yellow on
   canvas sections and the ink band.
6. **WORD BUDGETS (hard)**: H1 ≤ 8 words · section titles ≤ 4 words ·
   any paragraph ≤ 18 words · prefer chip rows and 3-word labels over
   sentences. Feature rows are six BIG statements: big number, 4-word
   title, one short line — no paragraphs. Concrete stays; hype stays
   banned (no emoji, no "Build faster / Ship smarter").
7. **Color roles are strict**: `--action` yellow = primary buttons with
   INK text (ink on yellow always, never yellow text). `--credit` green
   = positive amounts/success ONLY. `--debit` red = negative/
   destructive ONLY. Panels are backgrounds; never panel-colored text.
8. **Structural separation, v4 register**: marketing is LOUD (full-bleed
   panels, giant type, marquee, tilts, entrance choreography). The app
   is MEDIUM-FUN: panel-colored card headers (yellow/mint/sky strips
   with an ink rule) over cream bodies, colored badges, DigitBoxes —
   dense data areas stay quiet. No marquees, no tilts, no doodads
   inside the app.
9. **Ledger identity stays**: the code exhibit is the proof section,
   ledger rows/tables keep 2px separators and mono metadata, all
   numerals `tabular-nums`. Icons lucide-react; doodads inline SVG; the
   marquee separator glyph ✦ is a sanctioned ornament, not an emoji.
10. **A11y is non-negotiable**: ≥4.5:1 body text on every surface, both
    modes. Focus rings 3px ink offset 2px. `::selection` pop-yellow
    with ink text. The `prefers-reduced-motion` kill switch is absolute.
11. **Motion kit (CSS-first, ≤400ms except the marquee)** — sanctioned:
    - **Marquee ticker** under the hero: 3px rules top/bottom, Archivo
      Black, slow linear loop, pauses on hover, static row under
      reduced motion.
    - **Hero entrance**: H1 words pop in staggered (translate+scale,
      overshoot bezier), illustration drops in with one bounce,
      stickers land last with a wobble.
    - **Scroll pop-ins** via `animation-timeline: view()` (no support →
      visible immediately): translate-up + shadow-grow, staggered.
    - **Hover**: marketing cards tilt ±1deg + lift; the hero
      illustration idles on a slow 4s float (2–3px); FAQ chevrons spin
      90deg on open.
    - **Kept from v3.1**: press physics, balance count-up, marker
      draw-in (nav active + inline emphasis on canvas only), sparkle
      twinkle, toast press-in, `@view-transition`.
    - Loops allowed: marquee, idle float, twinkle. Nothing else loops.
12. **No new UI/animation libraries.** Fonts via `next/font/google`
    only.

## Tokens

Hard-code ONLY these; derive the rest with `color-mix()`.

```css
/* light */
--ink: oklch(0.2 0.02 90);
--canvas: oklch(0.993 0.011 95); /* warm cream ≈ #FFFDF5 */
--pop-yellow: oklch(0.88 0.16 95);
--pop-mint: oklch(0.88 0.13 150);
--pop-sky: oklch(0.86 0.09 230);
--pop-pink: oklch(0.86 0.1 350);
--pop-orange: oklch(0.82 0.13 60);
--credit: oklch(0.75 0.18 150); /* positive amounts / success ONLY */
--debit: oklch(0.62 0.23 27); /* negative / destructive ONLY */
--radius: 12px;

/* dark — charcoal canvas, light ink, panels deep-muted */
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
/* register scoping — app defaults, .loud (marketing <main>) overrides */
--border-w: 2px; /* .loud: 3px */
--border-w-emph: 3px; /* .loud: 4px */
--shadow-hard-sm: 3px 3px 0 0 var(--ink); /* .loud: 6px */
--shadow-hard-md: 5px 5px 0 0 var(--ink); /* .loud: 9px */
--shadow-hard-lg: 8px 8px 0 0 var(--ink); /* .loud: 12px */
--action: var(--pop-yellow);
--paper-2: color-mix(in oklch, var(--canvas), var(--ink) 5%);
--muted-ink: color-mix(in oklch, var(--ink), var(--canvas) 25%); /* 30% dark */
--on-ink-muted: color-mix(in oklch, var(--canvas), var(--ink) 22%); /* band */
--credit-text: color-mix(in oklch, var(--credit), var(--ink) 45%); /* light */
--debit-text: color-mix(in oklch, var(--debit), var(--ink) 25%); /* light */
--debit-deep: color-mix(in oklch, var(--debit), var(--ink) 30%);
--title-shadow:
  set per section — canvas on pop panels,
  pop-yellow on canvas sections and the ink band.;
```

Contrast (WCAG 2.x, computed — light / dark): ink on canvas 17.8/16.0;
ink as body text on full-bleed panels — yellow 12.6/11.0, mint 13.2/10.7,
sky 12.0/10.9, pink 11.2/11.2; muted-ink on canvas 9.1/7.5 and on panels
worst-case 5.1/5.0; closing band canvas-on-ink 17.8/16.0 and on-ink-muted
≥9; credit-text 5.6 light (raw credit 1.85 — banned as light text),
credit 8.9 dark; debit-text 5.9/6.2. Every body-text pairing ≥4.5.

## Landing composition

Hero (yellow: H1 "A complete AI SaaS. Free.", sub ≤18 words, CTA, install
line, illustration cluster + stickers) → marquee ticker → proof (canvas:
the real `spendCredits` source, intro ≤18 words) → features (mint: "IT
HANDLES THE MONEY.", six big statements) → agents (sky: "BUILT FOR AI
AGENTS.", tree + checklist) → pricing (canvas: "PICK A PLAN.", DigitBoxes
prices, MOST POPULAR sticker on Pro) → compare ("FREE VS PRO.") → FAQ
(pink: "QUESTIONS.", answers ≤18 words) → closing band (ink: "CLONE THE
LEDGER.", light text).

## Components

- **Button**: ink border (register width), 12px radius, md shadow, press
  physics. Primary = action yellow + ink text. Destructive = debit-deep +
  canvas text. 3px ink focus ring offset 2px everywhere.
- **Card**: app register — cream body, sm shadow, panel-colored header
  strip (yellow/mint/sky) above an ink rule. Marketing register — canvas
  or panel bg, md shadow, tilt hover.
- **Marquee**: full-width, 3px rules, Archivo Black uppercase, ✦
  separators, ~30s linear loop, `animation-play-state: paused` on hover.
- **Sticker / Doodads / DigitBoxes / Checkbox / Switch / Skeleton /
  LedgerRow / Inputs / Dialog / Menu / Toast**: as v3.1 (tiers read the
  scoped variables). Marketing-only: doodads, stickers, tilts.
- **Illustrations** (`public/illustrations/`, generated by
  `scripts/generate-illustrations.mjs`): robot-artist hero cluster (idle
  float), coin mascot — ONE character: bare stubby yellow arms/feet, dot
  eyes, small smile — in hello/paint/lost poses, coin stack. Spots:
  hero, dashboard first-run, generate empty, 404 + error pages, pricing
  accent. `next/image`, real alt text, ≤150KB.
- **Logo mark**: ink-ringed pop-yellow coin, SVG — nav, footer, favicon
  (`src/app/icon.svg`).

## Copy

Loud, concrete, few words — the budgets in hard rule 6 are enforced, not
aspirational. Exclamations SPARINGLY (success toasts, one hero moment).
Banned: emoji in copy, hype adjectives, "Build faster / Ship smarter"
phrasing. Every empty, loading, and error state stays informative with a
clear next step; errors are human sentences.
