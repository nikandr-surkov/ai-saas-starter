import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { syncStripeDataToDb } from "@/lib/billing/sync";
import { env, features } from "@/lib/env";

// Checkout lands here after payment. The redirect alone is never trusted:
// we re-sync from Stripe eagerly so the billing page is correct even when
// the webhook hasn't arrived yet (t3dotgg pattern).
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", env.BETTER_AUTH_URL));
  }

  const customerId = session.user.stripeCustomerId;
  if (features.billing && customerId) {
    try {
      await syncStripeDataToDb(customerId);
    } catch (error) {
      // Non-fatal: the webhook will sync shortly; the page just might lag.
      console.error(
        "[billing:success] sync failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return NextResponse.redirect(new URL("/billing", env.BETTER_AUTH_URL));
}
