import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { GENERATION_COST_CREDITS, plans, topupPack } from "@/config/plans";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Billing" };

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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
        <CardFooter className="gap-2">
          {isActive ? (
            <form action={createPortalSession}>
              <SubmitButton size="sm" busyLabel="Opening portal…">
                Manage subscription
              </SubmitButton>
            </form>
          ) : (
            <>
              <form action={createCheckoutSession}>
                <input type="hidden" name="item" value="pro" />
                <SubmitButton size="sm" busyLabel="Redirecting…">
                  Pro — {usd(plans.pro.priceMonthlyCents)}/mo
                </SubmitButton>
              </form>
              <form action={createCheckoutSession}>
                <input type="hidden" name="item" value="ultra" />
                <SubmitButton
                  size="sm"
                  variant="outline"
                  busyLabel="Redirecting…"
                >
                  Ultra — {usd(plans.ultra.priceMonthlyCents)}/mo
                </SubmitButton>
              </form>
            </>
          )}
        </CardFooter>
      </Card>

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
        <CardFooter>
          <form action={createCheckoutSession}>
            <input type="hidden" name="item" value="topup" />
            <SubmitButton size="sm" variant="outline" busyLabel="Redirecting…">
              Buy {topupPack.credits} credits — {usd(topupPack.priceCents)}
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
