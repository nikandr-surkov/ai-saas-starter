import { ChevronRightIcon } from "lucide-react";

// Native exclusive accordions: <details name="faq"> — opening one closes
// the others, zero JavaScript. v4: pop-pink block, answers <=18 words,
// chevron spins 90deg on open, summary presses on click.
const faqs = [
  {
    q: "Is this production-ready?",
    a: "The billing and ledger core is tested against real Postgres, with CI gates on every push.",
  },
  {
    q: "What do I need to run it locally?",
    a: (
      <>
        pnpm, Docker for Postgres, Stripe test keys. AI generation runs free
        with <span className="chip-mono text-foreground">AI_MOCK=true</span>.
      </>
    ),
  },
  {
    q: "Why a credits ledger instead of a balance column?",
    a: "Columns can't survive webhook retries or races. Append-only rows with idempotency keys can — the database enforces it.",
  },
  {
    q: "How do coding agents fit in?",
    a: "AGENTS.md briefs them, scoped rules guard the money paths, hooks block completion until typecheck passes.",
  },
  {
    q: "Can I use it commercially?",
    a: "MIT. Clone it, rename it, sell what you build. Attribution appreciated, not required.",
  },
  {
    q: "What does the Pro version add?",
    a: "Multi-provider media generation, durable job pipeline, gallery, teams, admin, MCP server. One link: nikandr.com.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-16 border-t-[3px] bg-pop-pink [--title-shadow:var(--canvas)]"
    >
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-11">
          <p className="eyebrow">Asked before you asked</p>
          <h2 className="text-title mt-4">Questions.</h2>
        </div>
        <div className="border-t-[3px]">
          {faqs.map((faq) => (
            <details key={faq.q} name="faq" className="group border-b-[3px]">
              <summary className="pop-in flex cursor-pointer items-center justify-between gap-4 py-5 text-xl font-bold select-none active:translate-x-0.5 active:translate-y-0.5 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronRightIcon
                  aria-hidden
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-90"
                />
              </summary>
              <p className="max-w-[70ch] pb-6 text-xl">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
