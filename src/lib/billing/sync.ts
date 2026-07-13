import { db } from "@/db";
import { subscriptions } from "@/db/schema";

import { userIdForStripeCustomer } from "./customer";
import { getStripe } from "./stripe";

// The ONLY writer of subscription state (AGENTS.md safety boundary). Every
// caller — webhook events, the checkout success route — funnels through
// here. State is fetched fresh from Stripe: event payloads arrive out of
// order and are treated as triggers, never as sources of truth.
export async function syncStripeDataToDb(customerId: string): Promise<void> {
  const userId = await userIdForStripeCustomer(customerId);
  if (!userId) {
    // Not ours (e.g. another app on the same Stripe account). Nothing to do.
    console.warn(
      `[billing:sync] no user for Stripe customer ${customerId} — skipped`,
    );
    return;
  }

  const list = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
    expand: ["data.default_payment_method"],
  });
  const sub = list.data[0];

  if (!sub) {
    const cleared = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      status: "none",
      priceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      paymentMethodBrand: null,
      paymentMethodLast4: null,
    };
    await db
      .insert(subscriptions)
      .values({ userId, ...cleared })
      .onConflictDoUpdate({ target: subscriptions.userId, set: cleared });
    return;
  }

  // Current period lives on the subscription item since Stripe's Basil API.
  const item = sub.items.data[0];
  const paymentMethod =
    typeof sub.default_payment_method === "object"
      ? sub.default_payment_method
      : null;
  const state = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    paymentMethodBrand: paymentMethod?.card?.brand ?? null,
    paymentMethodLast4: paymentMethod?.card?.last4 ?? null,
  };
  await db
    .insert(subscriptions)
    .values({ userId, ...state })
    .onConflictDoUpdate({ target: subscriptions.userId, set: state });
}
