// v4 LOUD features: six BIG statements — big number, 4-word title, one
// short line (word budgets in DESIGN.md hard rule 6). No paragraphs.
const features = [
  {
    index: "01",
    title: "Auth that owns data",
    line: "Email, Google, GitHub, magic links — sessions in your Postgres.",
    meta: "better-auth",
  },
  {
    index: "02",
    title: "Webhooks survive retries",
    line: "Raw-body signatures, one sync writer, idempotency keys everywhere.",
    meta: "stripe",
  },
  {
    index: "03",
    title: "Append-only credits ledger",
    line: "Atomic spends, automatic refunds. Balance is a SUM, not a hope.",
    meta: "postgres",
  },
  {
    index: "04",
    title: "AI images, wired",
    line: "Prompt → spend → image → history. Swap models with one env string.",
    meta: "ai sdk 6",
  },
  {
    index: "05",
    title: "Built for agents",
    line: "AGENTS.md, scoped rules, skills, hooks that block broken code.",
    meta: "agents.md",
  },
  {
    index: "06",
    title: "Proof on every push",
    line: "Vitest and Playwright against real Postgres, in CI.",
    meta: "vitest / playwright",
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
          <p className="mt-4 max-w-[52ch] text-muted-foreground">
            Tested, idempotent,{" "}
            <span className="marker text-foreground">boring on purpose</span>.
            Vibe-code the product on top.
          </p>
        </div>
        <div className="border-t-[3px]">
          {features.map((feature) => (
            <div
              key={feature.index}
              className="pop-in grid grid-cols-[auto_1fr] items-baseline gap-x-7 border-b-[3px] py-7 sm:grid-cols-[90px_1fr_auto]"
            >
              <span className="font-mono text-3xl font-bold sm:text-4xl">
                {feature.index}
              </span>
              <div>
                {/* Section-accent offset shadow (yellow on mint — the
                    accent may not repeat the section bg, DESIGN.md). */}
                <h3 className="font-heading text-2xl font-extrabold uppercase [text-shadow:0.045em_0.045em_0_var(--pop-yellow)] sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[15px] text-muted-foreground">
                  {feature.line}
                </p>
              </div>
              <span className="hidden self-center font-mono text-[10.5px] tracking-widest text-muted-foreground uppercase sm:block">
                {feature.meta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
