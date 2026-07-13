import type Stripe from "stripe";

import { getStripe } from "@/lib/billing/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";
import { env } from "@/lib/env";

export async function POST(request: Request): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe is not configured", { status: 503 });
  }

  // Signature verification REQUIRES the raw body — request.text(), never
  // request.json() (parsing re-serializes and breaks the HMAC). AGENTS.md
  // safety boundary: this check is never weakened or skipped.
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    // Log type and id only — never the payload (it carries customer PII).
    console.error(
      `[billing:webhook] ${event.type} (${event.id}) failed:`,
      error instanceof Error ? error.message : error,
    );
    // 500 makes Stripe retry with backoff — exactly what we want, because
    // every side-effect behind this is idempotent.
    return new Response("Webhook handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
