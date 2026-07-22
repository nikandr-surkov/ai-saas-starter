import Image from "next/image";

// v4.3: three numbered step cards connected by hand-drawn ink arrows.
const steps = [
  {
    index: "01",
    title: "Clone it",
    file: "step-clone",
    alt: "Happy laptop character with a git branch on its screen",
    line: "One repo, everything wired.",
  },
  {
    index: "02",
    title: "Add your keys",
    file: "step-keys",
    alt: "Golden key with a sparkle and a small tag",
    line: "Stripe and a database. That's it.",
  },
  {
    index: "03",
    title: "Ship your SaaS",
    file: "step-ship",
    alt: "Small rocket lifting off on halftone smoke",
    line: "Your product on a proven core.",
  },
] as const;

// Hand-drawn ink arrow between the cards (desktop only).
function InkArrow() {
  return (
    <svg
      viewBox="0 0 80 40"
      aria-hidden
      fill="none"
      className="hidden w-16 shrink-0 text-foreground lg:block"
    >
      <path
        d="M4 28 C 24 8, 48 10, 70 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 12 L 71 20 L 58 26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t-[3px]">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-12">
          <p className="eyebrow">Three steps</p>
          <h2 className="text-title mt-4">How it works.</h2>
        </div>
        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center">
          {steps.map((step, i) => (
            <div key={step.index} className="contents">
              {i > 0 ? <InkArrow /> : null}
              {/* v4.4 standard card hover: lift + shadow-grow; the
                  arrows are siblings, so they never move. */}
              <article className="border-hard pop-in flex-1 rounded-md bg-background p-6 text-center shadow-hard transition-[translate,box-shadow] duration-150 motion-safe:hover:-translate-y-1 motion-safe:hover:[box-shadow:var(--shadow-hover)]">
                <Image
                  src={`/illustrations/${step.file}.png`}
                  alt={step.alt}
                  width={440}
                  height={440}
                  className="mx-auto h-auto w-full max-w-[180px]"
                />
                <span className="chip-mono mt-3">{step.index}</span>
                <h3 className="mt-3 font-heading text-2xl font-extrabold uppercase">
                  {step.title}
                </h3>
                <p className="mt-2 text-xl leading-snug font-semibold">
                  {step.line}
                </p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
