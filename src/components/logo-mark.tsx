// The logo mark (DESIGN.md v4): an ink-ringed pop-yellow coin with the
// dashed inner ring — same character DNA as the mascot. Inline SVG so it
// theme-shifts with the tokens; src/app/icon.svg is the static favicon twin.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <circle
        cx="16"
        cy="16"
        r="13"
        className="fill-pop-yellow stroke-foreground"
        strokeWidth="3"
      />
      <circle
        cx="16"
        cy="16"
        r="8"
        fill="none"
        className="stroke-foreground"
        strokeWidth="2"
        strokeDasharray="2.5 3.5"
      />
    </svg>
  );
}
