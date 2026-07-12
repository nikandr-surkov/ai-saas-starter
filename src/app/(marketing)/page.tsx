import { LedgerTable } from "@/components/ledger-table";

// Placeholder while the full landing page lands in M6. Uses the final hero
// headline so the design foundation is reviewed against real copy.
const sampleEntries = [
  {
    id: "1",
    timestamp: "2026-07-12 09:14",
    type: "subscription_grant",
    ref: "invoice in_1Nx4h2",
    amount: 200,
  },
  {
    id: "2",
    timestamp: "2026-07-12 09:20",
    type: "spend",
    ref: "generation gen_84h1a0",
    amount: -1,
  },
  {
    id: "3",
    timestamp: "2026-07-12 09:21",
    type: "refund",
    ref: "generation gen_84h1a0",
    amount: 1,
  },
  {
    id: "4",
    timestamp: "2026-07-11 18:02",
    type: "topup",
    ref: "checkout cs_a1b2c3",
    amount: 100,
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-24">
      <p className="eyebrow">Open source · MIT · Next.js 16</p>
      <h1 className="text-display mt-4 max-w-3xl">
        Auth, Stripe subscriptions, and a credits ledger that survives webhook
        retries.
      </h1>
      <p className="mt-5 max-w-xl text-muted-foreground">
        Next.js 16, Better Auth, Drizzle, Stripe, and AI SDK 6 — wired together,
        tested, and documented for coding agents. Full landing page ships in M6.
      </p>
      <section className="mt-16 max-w-2xl">
        <p className="eyebrow mb-3">credit_transactions</p>
        <LedgerTable entries={sampleEntries} animated />
      </section>
    </div>
  );
}
