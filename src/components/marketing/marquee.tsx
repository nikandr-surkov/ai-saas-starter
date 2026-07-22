// v4.4 mechanically seam-proof marquee: the track is exactly TWO
// identical halves side by side (no gap — spacing lives INSIDE each
// item), each half repeating the phrase sequence 6x so it exceeds 100vw
// at any supported viewport. Animating the track translateX(0 → -50%)
// lands on a pixel-identical frame — a gap is impossible. Hover pauses
// via animation-play-state; reduced motion gets a static row.
// ✦ is a sanctioned ornament glyph (DESIGN.md hard rule 9).
const ITEMS = [
  "Auth",
  "Stripe",
  "Credits ledger",
  "AI images",
  "Open source",
] as const;

const REPEATS = 6;

function Sequence({ hidden }: { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6">{item}</span>
          <span aria-hidden>✦</span>
        </span>
      ))}
    </span>
  );
}

function Half({ first }: { first?: boolean }) {
  return (
    <div className="flex shrink-0">
      {Array.from({ length: REPEATS }, (_, i) => (
        <Sequence key={i} hidden={!first || i > 0} />
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden bg-foreground py-3 font-display text-2xl font-normal tracking-wide text-background uppercase">
      <div className="marquee flex w-max">
        <Half first />
        <Half />
      </div>
    </div>
  );
}
