import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

import { getStripe } from "./stripe";

// Stripe customers are created at signup, never lazily at checkout
// (t3dotgg/stripe-recommendations). ensureStripeCustomer is idempotent so it
// also heals accounts that signed up while billing was unconfigured in dev,
// and it is the retry path if customer creation failed during signup.

export async function ensureStripeCustomer(user: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (row?.stripeCustomerId) return row.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));
  return customer.id;
}

export async function userIdForStripeCustomer(
  customerId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Cancels every non-canceled subscription immediately. Called from the
 * account-deletion flow (deleteUser.beforeDelete) — the rows cascade away
 * right after, so "at period end" would orphan the subscription in Stripe.
 */
export async function cancelSubscriptionsForUser(
  userId: string,
): Promise<void> {
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.stripeCustomerId) return;

  const stripe = getStripe();
  // Default list excludes canceled subscriptions — exactly what we want.
  const subs = await stripe.subscriptions.list({
    customer: row.stripeCustomerId,
  });
  for (const sub of subs.data) {
    await stripe.subscriptions.cancel(sub.id);
  }
}
