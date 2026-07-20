// v4 motion kit: the sanctioned marquee — a full-width Archivo strip
// under the hero. Two identical copies scroll -50% for a seamless loop;
// hover pauses; reduced-motion gets a static row (no animation applied).
// ✦ is a sanctioned ornament glyph (DESIGN.md hard rule 9).
const ITEMS = [
  "Auth",
  "Stripe",
  "Credits ledger",
  "AI images",
  "Open source",
] as const;

function Row({ hidden }: { hidden?: boolean }) {
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

export function Marquee() {
  // v4.1 sequence lock: the strip is a solid INK band (light text) —
  // it separates the yellow hero from the cream gallery, so it needs
  // no border rules of its own.
  return (
    <div className="overflow-hidden bg-foreground py-3 font-display text-2xl tracking-wide text-background uppercase">
      <div className="marquee flex w-max">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
