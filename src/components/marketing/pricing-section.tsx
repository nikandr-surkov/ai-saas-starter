import Image from "next/image";
import Link from "next/link";

import { plans, topupPack } from "@/config/plans";

import { DigitBoxes } from "@/components/digit-boxes";
import { Sticker } from "@/components/sticker";

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Landing pricing in the ledger register — rows, not cards. Every number
// reads from src/config/plans.ts; /pricing carries the long-form version.
export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t-[3px]">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="fade-up mb-11 flex items-end justify-between gap-8">
          <div>
            <p className="eyebrow">Pricing</p>
            <h2 className="text-title mt-4">Pick a plan.</h2>
            <p className="mt-4 max-w-[52ch] text-muted-foreground">
              One config file drives pricing, checkout, and webhook grants.
              Start free.
            </p>
          </div>
          {/* Pricing accent (DESIGN.md v3.1 illustration set). */}
          <Image
            src="/illustrations/sticker-stack.png"
            alt="A stack of gold coins with one coin spinning off the top"
            width={180}
            height={180}
            className="hidden shrink-0 sm:block"
          />
        </div>
        <div className="border-t-2 border-rule">
          {Object.values(plans).map((plan) => (
            <div
              key={plan.id}
              className="grid grid-cols-[64px_1fr_auto] items-baseline gap-x-6 gap-y-2 border-b-2 px-2 py-6 transition-colors hover:bg-accent-soft sm:grid-cols-[64px_150px_1fr_110px_auto]"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {plan.id}
              </span>
              <h3 className="flex items-center gap-3 text-[17px] font-semibold">
                {plan.name}
                {plan.id === "pro" ? (
                  <Sticker color="pink" className="text-[9px]">
                    Most popular
                  </Sticker>
                ) : null}
              </h3>
              <p className="col-span-2 col-start-2 text-[15px] text-muted-foreground sm:col-span-1 sm:col-start-3">
                {plan.features.join(" · ")}
              </p>
              <span className="col-start-2 sm:col-start-4 sm:justify-self-end">
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
              </span>
              <Link
                href="/signup"
                className="col-start-3 self-center justify-self-end border-hard press rounded-md bg-background px-3 py-1.5 font-mono text-xs tracking-wider uppercase sm:col-start-5"
              >
                Start →
              </Link>
            </div>
          ))}
          <div className="grid grid-cols-[64px_1fr_auto] items-baseline gap-x-6 border-b-2 px-2 py-6 text-muted-foreground sm:grid-cols-[64px_150px_1fr_110px_auto]">
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
      </div>
    </section>
  );
}
