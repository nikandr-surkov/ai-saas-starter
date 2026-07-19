# DESIGN.md — "The Ledger", Neo-Brutalist edition (v2)

Accounting paper meets a rubber stamp. The concept survives from v1 —
credits ledger, ruled rows, mono data, tabular numerals — but the surface
is now neo-brutalist: thick ink borders, hard offset shadows, chunky
display type, one loud sticker per page. Light mode is warm cream; dark
mode is charcoal with light ink. Every UI decision follows this file.
No exceptions without editing this file first.

## Hard rules

1. **2px solid `var(--ink)` borders** on every container, button, input,
   and table. Borders are the structure; there are no faint hairlines.
2. **Hard offset shadows only**: `4px 4px 0 0 var(--ink)`. No blur, ever.
   Soft/blurred shadows stay banned. Gradients and glassmorphism stay
   banned.
3. **Press physics on interactive elements**: hover
   `translate(-2px,-2px)` with the shadow growing to 6px; active
   `translate(2px,2px)` with the shadow collapsing to 0 — the "press".
4. **Radius is 6px globally.** Pills (`rounded-full`) are allowed for
   badges and stickers only.
5. **Accent stays rationed**: `--primary` green only for primary actions,
   positive credit amounts, and success states. `--highlight` yellow is
   for emphasis marks — stickers, badges, underline marks — and **never
   for buttons**. `--debit` red only for destructive actions, errors, and
   expiry rows; routine spends render in ink.
6. **One rotated sticker per page, maximum.** Highlight background, 2px
   ink border, about −2deg rotation.
7. **Features and lists render as ruled ledger rows** — numbered, with
   2px separators — never card grids.
8. **All numerals are `tabular-nums`.** Credits, prices, dates, tables.
9. **No emoji in the UI.** Icons are lucide-react only.
10. **Motion is CSS-only, ≤200ms, always behind the
    `prefers-reduced-motion` kill switch.** No scroll-jacking, no
    marquees, no infinite loops.
11. **No new UI/animation libraries.** shadcn/ui + Tailwind + lucide.

## Tokens

Declared in `src/app/globals.css`. Hard-code ONLY these; derive the rest
with `color-mix()`.

```css
/* light — warm cream ledger */
--paper: oklch(0.96 0.02 90);
--ink: oklch(0.2 0.01 90); /* all borders + text */
--primary: oklch(0.8 0.19 150); /* vivid ledger green; ink text on it */
--highlight: oklch(0.87 0.17 95); /* yellow — marks only, never buttons */
--debit: oklch(0.62 0.23 27); /* vivid red */
--radius: 6px;

/* dark — charcoal ledger, light ink */
--paper: oklch(0.2 0.015 90);
--ink: oklch(0.95 0.01 90);
--primary: oklch(0.83 0.19 150);
--highlight: oklch(0.88 0.15 95);
--debit: oklch(0.7 0.2 27);
```

Required derivations (keep in CSS, never new literals in components):

```css
--paper-2: color-mix(
  in oklch,
  var(--paper),
  var(--ink) 5%
); /* raised surface */
--muted-ink: color-mix(
  in oklch,
  var(--ink),
  var(--paper) 35%
); /* secondary text */
--on-accent: /* text on primary/highlight: the DARK ink in light mode,
                the charcoal paper in dark mode — always near-black */ --debit-text:
  color-mix(in oklch, var(--debit), var(--ink) 25%); /* light mode only;
                dark mode uses --debit raw */
--debit-deep: color-mix(
  in oklch,
  var(--debit),
  var(--ink) 30%
); /* destructive fills,
                paper text on top */
--accent-soft: color-mix(
  in oklch,
  var(--primary),
  transparent 88%
); /* row hover wash */
--shadow-hard: 4px 4px 0 0 var(--ink);
```

Contrast (WCAG 2.x, computed): ink/paper 16.1 light · 15.7 dark;
muted-ink/paper 6.2 · 6.5; ink-on-primary 10.4 · 11.5 (dark uses charcoal
text); ink-on-highlight 12.2 · 12.6; debit-text/paper 5.4 light,
debit/paper 6.1 dark; paper-on-debit-deep 5.9. Raw `--debit` as text on
light paper is 3.6 — that is WHY `--debit-text` exists; never use raw
debit for light-mode text.

## Typography

- **Bricolage Grotesque** (`--font-display`, next/font/google, weights
  700/800) — display headings only. Tight leading (~1.02), slight
  negative tracking. H1 sizes via clamp, e.g.
  `clamp(2.6rem, 1.4rem + 4vw, 4.2rem)`.
- **Instrument Sans** (`--font-sans`) — UI and body text, unchanged.
- **Martian Mono** (`--font-mono`, 300–500) — eyebrows, labels, data,
  numbers, code. Eyebrow: 11px, +0.12em tracking, uppercase, muted.
- Tabular numerals everywhere, unchanged.

## Color mapping (shadcn)

`--background` → paper · `--foreground` → ink · `--card`/`--popover` →
paper (raised: paper-2) · `--muted` → paper-2 · `--muted-foreground` →
muted-ink · `--border`/`--input` → **ink** (widths come from `border-2`
classes) · `--primary` → primary with `--primary-foreground` = on-accent ·
`--destructive` → debit-deep with paper text (fills) — debit-text for
text-only errors · `--ring` → **ink** (focus rings are ink, 2px, offset
2px) · shadcn `--accent` stays a NEUTRAL hover tint for menus — never
green, never yellow.

## Components

- **Button**: 2px ink border, 6px radius, hard shadow, press physics.
  Primary = green bg + on-accent text. Secondary/outline = paper bg.
  Destructive = debit-deep bg + paper text. Ghost = borderless and
  shadowless (icon buttons); still gets the ink focus ring.
- **Card**: paper bg, 2px ink border, static hard shadow (no press).
- **Input/Textarea**: paper bg, 2px ink border, no shadow; focus = ink
  ring 2px offset 2px. Invalid = debit border + debit-text message.
- **Table**: 2px outer border, 2px rule under the header, 2px row
  separators, generous rows, mono right-aligned numerals.
- **Dialog/DropdownMenu**: 2px border + hard shadow (6px for dialogs);
  plain scrim overlay, no blur.
- **Toast**: 2px border + hard shadow, paper bg.
- **LedgerRow** (signature): mono index · title · description ·
  right-aligned mono metadata, 2px separators, 2px ink rule at block top;
  hover = accent-soft wash + 2px translate-x.
- **Sticker** (signature): pill, highlight bg, 2px border, mono uppercase,
  −2deg; tiny wobble on hover. One per page.

## Motion

- Button press physics as above (transition ≤150ms).
- Hero ledger stagger stays (`ledger-in`, 500ms rows, delays).
- Ledger rows: hover `translate-x: 2px`.
- Sticker: small rotate wobble on hover.
- Section headers may fade-up via `animation-timeline: view()` inside an
  `@supports` guard — progressive enhancement only.
- Everything sits behind the global `prefers-reduced-motion: reduce`
  kill switch. That rule is law.

## Copy

Unchanged and non-negotiable: radically brief, concrete, name real
technologies. Banned: "Build faster", "Ship smarter", "Streamline",
"Supercharge", "Unleash". No exclamation marks. No emoji. Errors are
human sentences with a next step, never raw codes.
