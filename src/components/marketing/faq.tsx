// Native exclusive accordions: <details name="faq"> — opening one closes
// the others, zero JavaScript.
const faqs = [
  {
    q: "Is this production-ready?",
    a: "The billing and ledger code is the point of the repo: signature-verified webhooks, idempotent credit mutations, a double-spend race test against real Postgres, and CI gates on typecheck, lint, and the full suite. Bring your own product on top.",
  },
  {
    q: "What do I need to run it locally?",
    a: "pnpm, Docker (for Postgres 17), and Stripe test-mode keys. Copy .env.example to .env, run docker compose up -d, pnpm db:migrate, pnpm dev. AI generation runs free with AI_MOCK=true — no gateway key needed.",
  },
  {
    q: "Why a credits ledger instead of a balance column?",
    a: "A bare column can't survive webhook retries or concurrent spends. Here every mutation is an append-only row with an idempotency key, the cached balance is enforced equal to SUM(amount), and the database itself refuses negative balances.",
  },
  {
    q: "How do coding agents fit in?",
    a: "AGENTS.md is the operating manual: commands, conventions, safety boundaries, definition of done. Path-scoped rules guard billing and schema files, skills script the common jobs, and hooks block completion until typecheck passes. Works with Claude Code, Cursor, Codex, and Copilot.",
  },
  {
    q: "Can I use it commercially?",
    a: "MIT. Clone it, rename it, sell what you build with it. Attribution appreciated, not required.",
  },
  {
    q: "What does the Pro version add?",
    a: "Multi-provider image, video, and audio generation, a durable Inngest job pipeline with webhooks and auto-refunds, gallery with R2 storage, teams with seat billing, an admin dashboard, and an MCP server. One link: nikandr.com.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[1160px] scroll-mt-16 px-6 pt-26"
    >
      <div className="mb-11 max-w-[62ch]">
        <p className="eyebrow">Questions</p>
        <h2 className="mt-3 text-3xl">Asked before you asked.</h2>
      </div>
      <div className="border-t-2 border-rule">
        {faqs.map((faq) => (
          <details key={faq.q} name="faq" className="group border-b">
            <summary className="flex cursor-pointer items-baseline justify-between gap-4 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span
                aria-hidden
                className="font-mono text-xs text-muted-foreground group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden
                className="hidden font-mono text-xs text-muted-foreground group-open:inline"
              >
                −
              </span>
            </summary>
            <p className="max-w-[70ch] pb-6 text-[15px] text-muted-foreground">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
