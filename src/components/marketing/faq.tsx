import { ChevronRightIcon } from "lucide-react";

// Native exclusive accordions: <details name="faq"> — opening one closes
// the others, zero JavaScript. v4.3: mono Q-chips, Bricolage questions,
// chevron in a bordered square that flips yellow on open, one marker per
// answer, and the open item pops off the pink as a cream card.
const faqs = [
  {
    q: "Is this production-ready?",
    a: (
      <>
        The billing and ledger core is tested against{" "}
        <span className="marker">real Postgres</span>, with CI gates on every
        push.
      </>
    ),
  },
  {
    q: "What do I need to run it locally?",
    a: (
      <>
        pnpm, Docker for Postgres, Stripe test keys. AI generation{" "}
        <span className="marker">runs free</span> with{" "}
        <span className="chip-mono">AI_MOCK=true</span>.
      </>
    ),
  },
  {
    q: "Why a credits ledger instead of a balance column?",
    a: (
      <>
        Columns can&apos;t survive webhook retries or races. Append-only rows
        with idempotency keys can —{" "}
        <span className="marker">the database enforces it</span>.
      </>
    ),
  },
  {
    q: "How do coding agents fit in?",
    a: (
      <>
        AGENTS.md briefs them, scoped rules guard the money paths,{" "}
        <span className="marker">hooks block completion</span> until typecheck
        passes.
      </>
    ),
  },
  {
    q: "Can I use it commercially?",
    a: (
      <>
        MIT. Clone it, rename it,{" "}
        <span className="marker">sell what you build</span>. Attribution
        appreciated, not required.
      </>
    ),
  },
  {
    q: "What does the Pro version add?",
    a: (
      <>
        Multi-provider media generation,{" "}
        <span className="marker">durable job pipeline</span>, gallery, teams,
        admin, MCP server. One link: nikandr.com.
      </>
    ),
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
          {faqs.map((faq, i) => (
            <details
              key={faq.q}
              name="faq"
              className="group border-b-[3px] transition-all open:my-5 open:rounded-md open:border-[3px] open:bg-background open:px-6 open:shadow-hard"
            >
              <summary className="pop-in flex cursor-pointer items-center gap-4 py-5 select-none active:translate-x-0.5 active:translate-y-0.5 [&::-webkit-details-marker]:hidden">
                <span className="chip-mono shrink-0">Q{i + 1}</span>
                <span className="flex-1 font-heading text-2xl font-bold">
                  {faq.q}
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border-2 bg-background shadow-hard-sm transition-colors group-open:bg-pop-yellow">
                  <ChevronRightIcon
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-open:rotate-90"
                  />
                </span>
              </summary>
              <p className="max-w-[70ch] pb-6 text-xl">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
