import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { CoinsIcon, DoorOpenIcon, InfinityIcon } from "lucide-react";

import {
  GENERATION_COST_CREDITS,
  plans,
  topupPack,
  type Plan,
} from "@/config/plans";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/lib/billing/actions";
import { planByPriceId } from "@/lib/billing/plans";
import { features, missingBillingEnv } from "@/lib/env";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/busy-button";
import { DigitBoxes } from "@/components/digit-boxes";
import { IconChip } from "@/components/icon-chip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Billing" };

// One icon per feature slot — same rotation as the pricing pages.
const featureIcons = [CoinsIcon, InfinityIcon, DoorOpenIcon] as const;

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// v4.7: plan details at the point of choice — rendered entirely from
// config/plans.ts, no copy duplicated. Calm-register cards; Stripe
// handles plan switches (proration) in the portal — no new money paths.
function PlanCard({
  plan,
  isActive,
  isCurrent,
}: {
  plan: Plan;
  isActive: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex flex-col rounded-lg border-2 bg-card p-5 shadow-hard-sm transition-[translate,box-shadow] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-hard">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-2xl font-extrabold">{plan.name}</h3>
        {plan.id === "pro" ? (
          // Calm-register version of the landing sticker: no rotation.
          <span className="rounded-full border-2 bg-pop-pink px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-widest uppercase shadow-hard-sm">
            Most popular
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-end gap-1">
        <DigitBoxes size="sm" value={usd(plan.priceMonthlyCents)} />
        <span className="font-mono text-xs text-muted-foreground">/mo</span>
      </div>
      <ul className="mt-4 flex-1 space-y-2.5">
        {plan.features.map((feature, fi) => (
          <li
            key={feature}
            className="flex items-center gap-2.5 text-lg font-medium"
          >
            <IconChip
              icon={featureIcons[fi % featureIcons.length]}
              className="size-8"
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-5">
        {isCurrent ? (
          <span className="chip-mono uppercase">Current</span>
        ) : isActive ? (
          <form action={createPortalSession}>
            <SubmitButton
              size="sm"
              variant="outline"
              className="w-full"
              busyLabel="Opening portal…"
            >
              Switch in portal
            </SubmitButton>
          </form>
        ) : (
          <form action={createCheckoutSession}>
            <input type="hidden" name="item" value={plan.id} />
            <SubmitButton
              size="sm"
              variant="outline"
              className="w-full"
              busyLabel="Redirecting…"
            >
              Upgrade to {plan.name}
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const session = await requireSession();

  if (!features.billing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Account" title="Billing" />
        <Card className="max-w-xl">
          <CardHeader>
            <p className="eyebrow">Setup required</p>
            <CardTitle>Stripe is not configured</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Billing runs once the Stripe variables are set in{" "}
              <span className="font-mono text-xs">.env</span>. Missing:
            </p>
            <ul className="font-mono text-xs">
              {missingBillingEnv().map((key) => (
                <li key={key} className="border-b py-1.5 last:border-0">
                  {key}
                </li>
              ))}
            </ul>
            <p>
              Each variable is documented in{" "}
              <span className="font-mono text-xs">.env.example</span>. Create
              the products in the Stripe dashboard (test mode), then restart the
              dev server. In production these variables are required at boot.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);
  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const currentPlan =
    (isActive && sub?.priceId && planByPriceId(sub.priceId)) || plans.free;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Billing" />

      <Card className="max-w-xl pt-0">
        {/* v4 medium-fun app register: panel-colored header strips. */}
        <CardHeader className="border-b-2 bg-pop-sky py-3.5">
          <p className="eyebrow">Current plan</p>
          <CardTitle className="flex items-center gap-2">
            {currentPlan.name}
            {currentPlan.priceMonthlyCents > 0 ? (
              // Key numbers render as mono chips (DESIGN.md v4.1).
              <span className="chip-mono">
                {usd(currentPlan.priceMonthlyCents)}/mo
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {isActive && sub?.currentPeriodEnd ? (
            <p className="text-sm">
              {sub.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
              <span className="font-mono">{isoDate(sub.currentPeriodEnd)}</span>
              {sub.cancelAtPeriodEnd
                ? " — remaining credits stay usable."
                : ` — grants ${currentPlan.monthlyCredits} credits.`}
            </p>
          ) : (
            <p className="text-sm">
              No subscription. Credits from signup and top-ups never expire.
            </p>
          )}
          {sub?.paymentMethodBrand && sub.paymentMethodLast4 ? (
            <p className="font-mono text-xs text-muted-foreground">
              {sub.paymentMethodBrand} ·· {sub.paymentMethodLast4}
            </p>
          ) : null}
          {sub && !isActive && sub.status !== "none" ? (
            <p className="text-sm text-debit-text">
              Subscription status: {sub.status} — check the customer portal.
            </p>
          ) : null}
        </CardContent>
        {isActive ? (
          <CardFooter>
            <form action={createPortalSession}>
              <SubmitButton size="sm" busyLabel="Opening portal…">
                Manage subscription
              </SubmitButton>
            </form>
          </CardFooter>
        ) : null}
      </Card>

      {/* Plan cards — every line reads from config/plans.ts. */}
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        {[plans.pro, plans.ultra].map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={isActive}
            isCurrent={isActive && currentPlan.id === plan.id}
          />
        ))}
      </div>

      {/* Top-up: third purchase, same anatomy, slimmer. */}
      <div className="flex max-w-xl flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border-2 bg-card p-5 shadow-hard-sm transition-[translate,box-shadow] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-hard">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl font-extrabold">
            {topupPack.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-2.5 text-lg font-medium">
            <IconChip icon={CoinsIcon} className="size-8" />
            {topupPack.credits} credits, one time
          </p>
        </div>
        <DigitBoxes size="sm" value={usd(topupPack.priceCents)} />
        <form action={createCheckoutSession}>
          <input type="hidden" name="item" value="topup" />
          <SubmitButton size="sm" variant="outline" busyLabel="Redirecting…">
            Buy top-up
          </SubmitButton>
        </form>
      </div>

      <Card className="max-w-xl pt-0">
        <CardHeader className="border-b-2 bg-pop-yellow py-3.5">
          <p className="eyebrow">Credits</p>
          <CardTitle className="font-mono">
            {session.user.creditBalance}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {GENERATION_COST_CREDITS} credit per image generation. Failed
          generations are refunded.
        </CardContent>
      </Card>
    </div>
  );
}
