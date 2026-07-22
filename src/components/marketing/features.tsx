import Image from "next/image";

import { cn } from "@/lib/utils";

// v4.2 illustrated feature cards (replace the numbered rows): cream
// cards on the mint block, transparent sticker illustration on top,
// mono number chip, Bricolage 800 title with a rotating colored offset
// shadow, ONE bold ink line (<=12 words). Tilts straighten on hover.
const cards = [
  {
    index: "01",
    file: "feature-auth",
    alt: "Smiling padlock character holding a golden key",
    title: "Auth that owns data",
    line: "Email, Google, GitHub, magic links — sessions in your Postgres.",
    shadow: "var(--pop-yellow)",
  },
  {
    index: "02",
    file: "feature-webhooks",
    alt: "Mail envelope inside a bold looping retry arrow",
    title: "Webhooks survive retries",
    line: "Raw-body signatures, one sync writer, idempotency keys everywhere.",
    shadow: "var(--pop-sky)",
  },
  {
    index: "03",
    file: "feature-ledger",
    alt: "Open accounting ledger with stacked gold coins and a mint check mark",
    title: "An honest credits ledger",
    line: "Atomic spends, automatic refunds. Balance is a SUM, not a hope.",
    shadow: "var(--pop-pink)",
  },
  {
    index: "04",
    file: "feature-ai",
    alt: "Polaroid photo with a sunset landscape popping out of the frame",
    title: "AI images, wired",
    line: "Prompt → spend → image → history. Swap models with one env string.",
    shadow: "var(--pop-mint)",
  },
  {
    index: "05",
    file: "feature-agents",
    alt: "Friendly robot head beside a clipboard with checkmarks",
    title: "Built for AI agents",
    line: "AGENTS.md, scoped rules, skills, hooks that block broken code.",
    shadow: "var(--pop-orange)",
  },
  {
    index: "06",
    file: "feature-tests",
    alt: "Clipboard with checkmarks next to a small gold trophy",
    title: "Proven by 106 tests",
    line: "Vitest and Playwright against real Postgres, on every push.",
    shadow: "var(--pop-yellow)",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-16 border-t-[3px] bg-pop-mint [--title-shadow:var(--canvas)]"
    >
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-12">
          <p className="eyebrow">Ledger of features</p>
          <h2 className="text-title mt-4">It handles the money.</h2>
          <p className="mt-4 max-w-[52ch] text-xl font-semibold">
            Tested, idempotent,{" "}
            <span className="marker">boring on purpose</span>. Vibe-code the
            product on top.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <article
              key={card.index}
              className={cn(
                "border-hard pop-in rounded-md bg-background p-6 shadow-hard transition-[rotate,translate] duration-150",
                i % 2 === 0 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]",
                "motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0",
              )}
            >
              <Image
                src={`/illustrations/${card.file}.png`}
                alt={card.alt}
                width={440}
                height={440}
                className="mx-auto h-auto w-full max-w-[200px]"
              />
              <span className="chip-mono mt-3">{card.index}</span>
              <h3
                className="mt-3 font-heading text-2xl font-extrabold uppercase"
                style={{ textShadow: `0.045em 0.045em 0 ${card.shadow}` }}
              >
                {card.title}
              </h3>
              <p className="mt-2.5 text-xl leading-snug font-semibold">
                {card.line}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
