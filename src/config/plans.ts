// Single source of truth for plans, prices, and credit amounts. The pricing
// page, checkout actions, and webhook grants all read from here — never
// hard-code a price or credit amount anywhere else. Changing anything in
// this file requires asking the repo owner first (AGENTS.md).

export type PaidPlanId = "pro" | "ultra";
export type PlanId = "free" | PaidPlanId;

export type Plan = {
  id: PlanId;
  name: string;
  /** USD cents per month. Money is integer cents — no floats, ever. */
  priceMonthlyCents: number;
  /** Credits granted on every paid subscription invoice (invoice.paid). */
  monthlyCredits: number;
  /** Name of the env var holding the Stripe Price ID; null for free. */
  priceEnvKey: "STRIPE_PRICE_PRO_MONTHLY" | "STRIPE_PRICE_ULTRA_MONTHLY" | null;
  /** Drives the pricing page rows. Concrete copy, no adjectives. */
  features: string[];
};

/** Credits granted once at signup, through the ledger (`welcome_{userId}`). */
export const WELCOME_CREDITS = 10;

/** Credits spent per image generation (the spend lands in M5). */
export const GENERATION_COST_CREDITS = 1;

export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyCents: 0,
    monthlyCredits: 0,
    priceEnvKey: null,
    features: [
      `${WELCOME_CREDITS} welcome credits`,
      `${GENERATION_COST_CREDITS} credit per image generation`,
      "Full source code, MIT",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyCents: 900,
    monthlyCredits: 200,
    priceEnvKey: "STRIPE_PRICE_PRO_MONTHLY",
    features: [
      "200 credits every month",
      "Credits accumulate — no expiry",
      "Cancel anytime in the portal",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    priceMonthlyCents: 2900,
    monthlyCredits: 1000,
    priceEnvKey: "STRIPE_PRICE_ULTRA_MONTHLY",
    features: [
      "1,000 credits every month",
      "Credits accumulate — no expiry",
      "Cancel anytime in the portal",
    ],
  },
};

/** One-time credit pack (Checkout mode "payment"). */
export const topupPack = {
  name: "Top-up",
  credits: 100,
  priceCents: 500,
  priceEnvKey: "STRIPE_PRICE_TOPUP_100",
} as const;
