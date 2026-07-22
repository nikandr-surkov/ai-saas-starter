import type { Metadata } from "next";
import Link from "next/link";
import { CoinsIcon, DoorOpenIcon, InfinityIcon } from "lucide-react";

import { plans, topupPack } from "@/config/plans";

import { DigitBoxes } from "@/components/digit-boxes";
import { IconChip } from "@/components/icon-chip";

const featureIcons = [CoinsIcon, InfinityIcon, DoorOpenIcon] as const;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free plan with welcome credits; Pro and Ultra subscriptions grant monthly credits that never expire.",
};

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Single source of truth: src/config/plans.ts drives every number here.
export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 pt-24 pb-26">
      <div className="mb-11 max-w-[62ch]">
        <p className="eyebrow">Pricing</p>
        <h1 className="text-display mt-4 mb-3">
          Integer credits. No expiry. No surprises.
        </h1>
        <p className="mt-2 text-xl">
          Every plan reads from one config file — checkout and webhook grants
          follow it.
        </p>
      </div>

      <div className="border-t-2 border-rule">
        {Object.values(plans).map((plan) => (
          <div
            key={plan.id}
            className="grid grid-cols-[64px_1fr] items-baseline gap-x-6 gap-y-2 border-b-2 px-2 py-7 transition-colors hover:bg-accent-soft sm:grid-cols-[64px_160px_1fr_auto]"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {plan.id}
            </span>
            <h2 className="font-heading text-2xl font-extrabold">
              {plan.name}
            </h2>
            <ul className="col-start-2 space-y-2 sm:col-start-3">
              {plan.features.map((feature, fi) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-lg font-medium"
                >
                  <IconChip
                    icon={featureIcons[fi % featureIcons.length]}
                    className="size-8"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="col-start-2 sm:col-start-4 sm:justify-self-end">
              {plan.priceMonthlyCents === 0 ? (
                <span className="font-mono text-sm">free</span>
              ) : (
                <span className="flex items-end gap-1">
                  <DigitBoxes size="sm" value={usd(plan.priceMonthlyCents)} />
                  <span className="font-mono text-xs text-muted-foreground">
                    /mo
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[64px_1fr] items-baseline gap-x-6 gap-y-2 border-b-2 px-2 py-7 transition-colors hover:bg-accent-soft sm:grid-cols-[64px_160px_1fr_auto]">
          <span className="font-mono text-xs text-muted-foreground">topup</span>
          <h2 className="text-xl">{topupPack.name}</h2>
          <p className="col-start-2 text-xl sm:col-start-3">
            {topupPack.credits} credits, one-time. No subscription required —
            stack them whenever you run low.
          </p>
          <div className="col-start-2 sm:col-start-4 sm:justify-self-end">
            <DigitBoxes size="sm" value={usd(topupPack.priceCents)} />
          </div>
        </div>
      </div>

      <p className="mt-10 text-xl">
        Start free —{" "}
        <Link href="/signup" className="link-pop">
          create an account
        </Link>{" "}
        and the welcome credits are waiting. Top up from Billing.
      </p>
    </div>
  );
}
