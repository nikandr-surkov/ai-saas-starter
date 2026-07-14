import { LedgerList, LedgerRow } from "@/components/ledger-row";

const features = [
  {
    index: "01",
    title: "Auth that owns its data",
    description:
      "Better Auth with email + Google + GitHub + magic links. Sessions in your Postgres, not a vendor's dashboard.",
    meta: "better-auth / drizzle",
  },
  {
    index: "02",
    title: "Stripe webhooks that survive retries",
    description:
      "Signature-verified raw bodies, one sync function as the single writer of subscription state, idempotency keys on every event.",
    meta: "checkout / portal",
  },
  {
    index: "03",
    title: "Append-only credits ledger",
    description:
      "Atomic spend, compensating refunds on provider failure, monthly grants keyed by invoice ID. Balance is a SUM, not a hope.",
    meta: "tested vs postgres",
  },
  {
    index: "04",
    title: "AI image generation, wired end-to-end",
    description:
      "Prompt → rate limit → spend 1 credit → AI SDK 6 generateImage → history. Swap providers with one string.",
    meta: "ai gateway",
  },
  {
    index: "05",
    title: "An AI-native repo, not just a repo",
    description:
      'AGENTS.md, CLAUDE.md, path-scoped rules, skills, hooks that block "done" until typecheck passes.',
    meta: "agents.md standard",
  },
  {
    index: "06",
    title: "Proof it works",
    description:
      "Vitest on the ledger and webhooks against real Postgres, Playwright from signup to generation, CI on every push.",
    meta: "vitest / playwright",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-[1160px] scroll-mt-16 px-6 pt-26"
    >
      <div className="mb-11 max-w-[62ch]">
        <p className="eyebrow">Ledger of features</p>
        <h2 className="mt-3 mb-3 text-3xl">
          The 20% of a SaaS your AI agent shouldn&apos;t be trusted to
          improvise.
        </h2>
        <p className="text-muted-foreground">
          Everything here is tested, idempotent, and boring on purpose.
          Vibe-code the product on top.
        </p>
      </div>
      <LedgerList>
        {features.map((feature) => (
          <LedgerRow key={feature.index} {...feature} />
        ))}
      </LedgerList>
    </section>
  );
}
