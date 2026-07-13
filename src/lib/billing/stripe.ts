import Stripe from "stripe";

import { env } from "@/lib/env";

// Lazy singleton. Checkout/portal actions and the webhook only run when
// features.billing is on; this throw is the backstop for direct calls in
// unconfigured dev environments.
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured — set the STRIPE_* variables in .env (see .env.example).",
    );
  }
  stripe ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripe;
}
