# DESIGN.md — "The Ledger"

Accounting paper meets terminal. Light mode is "the ledger" (default), dark
mode is "the terminal" (class strategy + `color-scheme`). Every UI decision
in this repo follows this file. No exceptions without editing this file first.

## Hard rules

1. **No gradients.**
2. **No glassmorphism, no `backdrop-blur`.**
3. **No drop shadows.** Depth comes from borders and the paper/paper-2 surface
   ladder. Focus rings are exempt.
4. **Radius is 2px everywhere.** Buttons, cards, inputs, dialogs, images.
5. **No emoji in the UI.** Icons are lucide-react only.
6. **Features and lists render as ruled ledger rows** — numbered, hairline
   separators — never 3-card grids.
7. **All numerals are `tabular-nums`.** Credits, prices, dates, table cells.
8. **Accent green is scarce.** Only: primary CTA, links/active nav, positive
   credit amounts, success states. Never decorative.
9. **Motion is CSS-only and minimal.** Every animation and transition sits
   behind a `prefers-reduced-motion: no-preference` guard.
10. **No new UI/animation libraries.** shadcn/ui + Tailwind + lucide-react.

## Tokens

Declared in `src/app/globals.css` via Tailwind v4 `@theme` / CSS variables.
Hard-code exactly these; derive everything else with `color-mix()`.

```css
/* light (default) — "the ledger" */
--paper: oklch(0.985 0.003 95);
--paper-2: oklch(0.965 0.004 95);
--ink: oklch(0.21 0.012 145);
--muted: oklch(0.5 0.015 145);
--hairline: color-mix(in oklch, var(--ink), transparent 88%);
--rule: color-mix(in oklch, var(--ink), transparent 72%);
--accent: oklch(0.42 0.11 162); /* ledger green */
--accent-hover: oklch(0.36 0.11 162);
--accent-ink: oklch(0.985 0.003 95);
--debit: oklch(0.5 0.19 27); /* destructive only */
--radius: 2px;

/* dark — "the terminal" */
--paper: oklch(0.16 0.008 150);
--paper-2: oklch(0.19 0.008 150);
--ink: oklch(0.93 0.005 145);
--muted: oklch(0.62 0.01 145);
--accent: oklch(0.78 0.13 162);
--accent-hover: oklch(0.85 0.13 162);
--accent-ink: oklch(0.16 0.008 150);
--debit: oklch(0.68 0.17 27);
```

Derived (examples — keep derivations in CSS, not new hex values):

```css
--accent-soft: color-mix(
  in oklch,
  var(--accent),
  transparent 92%
); /* row hover tint */
```

- `--hairline` — default borders, row separators.
- `--rule` — stronger 2px rules: top of ledger blocks, table header underline.
- `--debit` — destructive actions, errors, and expiry rows ONLY. Ordinary
  negative amounts (routine spends) render in ink: spending credits is
  normal operation, not a warning.

## Typography

- **Instrument Sans** (`--font-sans`, via next/font/google) — display, UI,
  body. Display: weight 600, letter-spacing −0.03em, line-height 1.08,
  `text-wrap: balance`. Sizes via clamp; H1 is
  `clamp(2.4rem, 1.4rem + 3.4vw, 3.7rem)`.
- **Martian Mono** (`--font-mono`, weights 300–500) — eyebrows, labels,
  metadata, numbers, code. Eyebrow style: 11px, letter-spacing +0.12em,
  uppercase, muted.
- Map shadcn's `--font-sans`/`--font-mono` to these two. No other fonts.

## Color mapping (shadcn)

Replace the default zinc ramp with the ledger tokens: `--background` → paper,
`--card`/`--popover` → paper (elevated surfaces use paper-2), `--foreground` →
ink, `--muted-foreground` → muted, `--border`/`--input` → hairline,
`--primary` → accent, `--primary-foreground` → accent-ink, `--destructive` →
debit, `--ring` → accent. Set `color-scheme: light` on `:root` and
`color-scheme: dark` on `.dark`.

## Components

- **Button**: 2px radius, no shadow. Primary = accent bg + accent-ink text,
  hover accent-hover. Secondary = paper bg + hairline border + ink text.
  Destructive = debit. Focus ring: 2px accent, offset 2px.
- **Card**: paper bg, hairline border, no shadow. Header may carry a mono
  uppercase label.
- **Table**: the ledger register — 2px `--rule` under the header, hairline
  row separators, mono tabular numerals right-aligned, generous row height.
- **Input/Textarea**: paper bg, hairline border, 2px radius; focus swaps
  border to accent (plus ring), no glow.
- **LedgerRow** (signature, marketing): mono index (`01`) · title ·
  description · right-aligned mono uppercase metadata. Hairline between rows,
  2px ink rule at the top of each list block, `--accent-soft` bg on hover.

## Layout & motion

- Section vertical padding 96–128px; content max-width 1160px.
- Marketing sections separated by hairlines, not background changes.
- Motion: small fades/translate-ins (≤200ms, ease-out) and the hero ledger
  stagger. CSS only. Always inside `@media (prefers-reduced-motion:
no-preference)`.

## Copy

Radically brief. Concrete. Name real technologies, not adjectives. Banned:
"Build faster", "Ship smarter", "Streamline", "Supercharge", "Unleash".
No exclamation marks in UI copy. No emoji.
