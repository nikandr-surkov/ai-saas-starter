import type Stripe from "stripe";
import { z } from "zod";

import { grantCredits } from "@/lib/credits";

import { userIdForStripeCustomer } from "./customer";
import { planByPriceId } from "./plans";
import { syncStripeDataToDb } from "./sync";

// Webhook dispatch, separated from the route so tests can exercise it and
// signature verification independently. Pattern per t3dotgg: every relevant
// event triggers a full re-sync keyed by customer; credit side-effects run
// after, each idempotent via a key derived from the Stripe object id —
// Stripe retries and duplicate deliveries become ledger no-ops.
//
// The signature authenticates the SENDER; it says nothing about shape. The
// few fields the dispatcher relies on are Zod-parsed (parse, don't cast) so
// an unexpected payload degrades to a logged skip, never a crash mid-grant.

const RELEVANT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const customerField = z.object({
  customer: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
});

const invoiceSchema = z.object({
  id: z.string(),
  parent: z.object({ type: z.string() }).nullish(),
  lines: z.object({
    data: z.array(
      z.object({
        pricing: z
          .object({
            price_details: z.object({ price: z.string().nullish() }).nullish(),
          })
          .nullish(),
      }),
    ),
  }),
});

const checkoutSessionSchema = z.object({
  id: z.string(),
  mode: z.string(),
  metadata: z.record(z.string(), z.string()).nullish(),
});

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  if (!RELEVANT_EVENTS.has(event.type)) return;

  const parsed = customerField.safeParse(event.data.object);
  const customer = parsed.success ? parsed.data.customer : null;
  const customerId =
    typeof customer === "string" ? customer : (customer?.id ?? null);
  if (!customerId) {
    console.warn(
      `[billing:webhook] ${event.type} without a customer — skipped`,
    );
    return;
  }

  await syncStripeDataToDb(customerId);

  switch (event.type) {
    case "invoice.paid":
      await grantSubscriptionCredits(event.data.object, customerId);
      break;
    case "checkout.session.completed":
      await grantTopupCredits(event.data.object, customerId);
      break;
  }
}

/** invoice.paid on a subscription → grant the plan's monthly credits. */
async function grantSubscriptionCredits(
  object: unknown,
  customerId: string,
): Promise<void> {
  const parsed = invoiceSchema.safeParse(object);
  if (!parsed.success) {
    console.warn(
      "[billing:webhook] invoice.paid payload shape unexpected — skipped",
    );
    return;
  }
  const invoice = parsed.data;

  // One-off invoices (no subscription parent) grant nothing.
  if (invoice.parent?.type !== "subscription_details") return;

  const priceId = invoice.lines.data
    .map((line) => line.pricing?.price_details?.price)
    .find((price): price is string => typeof price === "string");
  const plan = priceId ? planByPriceId(priceId) : null;
  if (!plan || plan.monthlyCredits <= 0) {
    console.warn(
      `[billing:webhook] invoice ${invoice.id} has no known plan price — no credits granted`,
    );
    return;
  }

  const userId = await userIdForStripeCustomer(customerId);
  if (!userId) return;

  // Policy: grants accumulate — nothing is replaced or expired here. The
  // free version never expires credits (the "expiry" ledger type exists for
  // Pro compatibility).
  await grantCredits({
    userId,
    amount: plan.monthlyCredits,
    type: "subscription_grant",
    ref: { type: "invoice", id: invoice.id },
    idempotencyKey: `grant_${invoice.id}`,
  });
}

/**
 * checkout.session.completed in mode "payment" → grant the top-up pack, but
 * only for sessions our checkout action stamped (metadata.kind === "topup").
 * Foreign payment sessions on the same Stripe account grant nothing.
 */
async function grantTopupCredits(
  object: unknown,
  customerId: string,
): Promise<void> {
  const parsed = checkoutSessionSchema.safeParse(object);
  if (!parsed.success) {
    console.warn(
      "[billing:webhook] checkout.session.completed payload shape unexpected — skipped",
    );
    return;
  }
  const session = parsed.data;

  // Subscription checkouts grant via their invoice.paid event instead.
  if (session.mode !== "payment") return;

  if (session.metadata?.kind !== "topup") {
    console.warn(
      `[billing:webhook] payment checkout ${session.id} without top-up metadata — no credits granted`,
    );
    return;
  }
  // Credits-at-purchase-time: the amount was stamped when the session was
  // created, so a later config change can't retroactively alter a purchase.
  const credits = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(session.metadata.credits);
  if (!credits.success) {
    console.warn(
      `[billing:webhook] top-up checkout ${session.id} has invalid credits metadata — no credits granted`,
    );
    return;
  }

  const userId = await userIdForStripeCustomer(customerId);
  if (!userId) return;

  await grantCredits({
    userId,
    amount: credits.data,
    type: "topup",
    ref: { type: "checkout_session", id: session.id },
    idempotencyKey: `topup_${session.id}`,
  });
}
