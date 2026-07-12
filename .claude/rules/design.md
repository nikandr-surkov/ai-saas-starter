---
paths:
  - "src/components/**"
  - "src/app/(marketing)/**"
---

# Design rules — "The Ledger"

Full system in DESIGN.md. The hard rules, restated:

- No gradients. No glassmorphism or `backdrop-blur`. No drop shadows —
  borders and the paper/paper-2 surface ladder only (focus rings exempt).
- Radius is 2px everywhere.
- No emoji in the UI. Icons are lucide-react.
- Features/lists render as numbered, ruled **ledger rows** — never 3-card
  grids.
- All numerals `tabular-nums`.
- Accent green only for: primary CTA, links/active nav, positive credit
  amounts, success states. `--debit` red only for destructive/negative.
- Motion is CSS-only, ≤200ms, and always inside a
  `prefers-reduced-motion: no-preference` guard.
- Fonts: Instrument Sans (UI/display), Martian Mono (eyebrows, labels,
  numbers, code). Nothing else.
- Copy: brief, concrete, names real technologies. Banned: "Build faster",
  "Ship smarter", "Streamline", "Supercharge", "Unleash".
- Use existing tokens from `globals.css`; derive new shades with
  `color-mix()`, never new hex/oklch literals in components.
