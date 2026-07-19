import Link from "next/link";

import { plans, topupPack } from "@/config/plans";

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Landing pricing in the ledger register — rows, not cards. Every number
// reads from src/config/plans.ts; /pricing carries the long-form version.
export function PricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-[1160px] scroll-mt-16 px-6 pt-26"
    >
      <div className="mb-11 max-w-[62ch]">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-3 mb-3 text-3xl">
          Integer credits. No expiry. No surprises.
        </h2>
        <p className="text-muted-foreground">
          One config file drives this section, checkout, and the webhook grants.
          Start free — the welcome credits are already on the account.
        </p>
      </div>
      <div className="border-t-2 border-rule">
        {Object.values(plans).map((plan) => (
          <div
            key={plan.id}
            className="grid grid-cols-[64px_1fr_auto] items-baseline gap-x-6 gap-y-2 border-b px-2 py-6 transition-colors hover:bg-accent-soft sm:grid-cols-[64px_150px_1fr_110px_auto]"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {plan.id}
            </span>
            <h3 className="text-[17px] font-semibold">{plan.name}</h3>
            <p className="col-span-2 col-start-2 text-[15px] text-muted-foreground sm:col-span-1 sm:col-start-3">
              {plan.features.join(" · ")}
            </p>
            <span className="col-start-2 font-mono text-sm sm:col-start-4 sm:text-right">
              {plan.priceMonthlyCents === 0
                ? "free"
                : `${usd(plan.priceMonthlyCents)}/mo`}
            </span>
            <Link
              href="/signup"
              className="col-start-3 self-center justify-self-end rounded-sm border border-rule px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors hover:bg-secondary sm:col-start-5"
            >
              Start →
            </Link>
          </div>
        ))}
        <div className="grid grid-cols-[64px_1fr_auto] items-baseline gap-x-6 border-b px-2 py-6 text-muted-foreground sm:grid-cols-[64px_150px_1fr_110px_auto]">
          <span className="font-mono text-xs">topup</span>
          <h3 className="text-[17px] font-semibold text-foreground">
            {topupPack.name}
          </h3>
          <p className="col-span-2 col-start-2 text-[15px] sm:col-span-1 sm:col-start-3">
            {topupPack.credits} credits, one-time, no subscription required.
          </p>
          <span className="col-start-2 font-mono text-sm sm:col-start-4 sm:text-right">
            {usd(topupPack.priceCents)}
          </span>
          <span aria-hidden className="hidden sm:block" />
        </div>
      </div>
    </section>
  );
}
