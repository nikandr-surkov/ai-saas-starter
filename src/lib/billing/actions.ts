"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { topupPack } from "@/config/plans";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { env, features } from "@/lib/env";

import { ensureStripeCustomer } from "./customer";
import { priceIdFor, topupPriceId } from "./plans";
import { getStripe } from "./stripe";

// Server actions for money flows. Session is re-checked here — never rely
// on the page or proxy having done it (AGENTS.md conventions).

const checkoutInput = z.object({
  item: z.enum(["pro", "ultra", "topup"]),
});

export async function createCheckoutSession(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!features.billing) {
    throw new Error(
      "Stripe is not configured — set the STRIPE_* variables in .env (see .env.example).",
    );
  }
  const { item } = checkoutInput.parse({ item: formData.get("item") });
  const customerId = await ensureStripeCustomer(session.user);

  // The UI hides subscribe buttons for subscribers, but a hand-crafted POST
  // must not be able to open a second concurrent subscription (double
  // billing). Plan changes happen in the portal instead.
  if (item !== "topup") {
    const [sub] = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);
    if (sub?.status === "active" || sub?.status === "trialing") {
      const portal = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${env.BETTER_AUTH_URL}/billing`,
      });
      redirect(portal.url);
    }
  }

  const checkout = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: item === "topup" ? "payment" : "subscription",
    line_items: [
      {
        price: item === "topup" ? topupPriceId() : priceIdFor(item),
        quantity: 1,
      },
    ],
    // Stamped so the webhook grants credits only for OUR top-up checkouts —
    // a foreign payment-mode session on the same Stripe account grants
    // nothing (see grantTopupCredits).
    ...(item === "topup"
      ? {
          metadata: {
            kind: "topup",
            credits: String(topupPack.credits),
          },
        }
      : {}),
    // The success route re-syncs from Stripe — the redirect alone is never
    // trusted (the webhook may or may not have arrived yet).
    success_url: `${env.BETTER_AUTH_URL}/api/stripe/success`,
    cancel_url: `${env.BETTER_AUTH_URL}/billing`,
  });
  if (!checkout.url) {
    throw new Error("Stripe did not return a Checkout URL");
  }
  redirect(checkout.url);
}

export async function createPortalSession(): Promise<void> {
  const session = await requireSession();
  if (!features.billing) {
    throw new Error(
      "Stripe is not configured — set the STRIPE_* variables in .env (see .env.example).",
    );
  }
  const customerId = await ensureStripeCustomer(session.user);
  const portal = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.BETTER_AUTH_URL}/billing`,
  });
  redirect(portal.url);
}
