import { plans, topupPack, type PaidPlanId, type Plan } from "@/config/plans";
import { env } from "@/lib/env";

// Resolves the pure plan config (src/config/plans.ts) against the
// env-provided Stripe Price IDs. Kept here so the config stays importable
// without env (the pricing page renders plans even when billing is off).

export function priceIdFor(planId: PaidPlanId): string {
  const key = plans[planId].priceEnvKey;
  const priceId = key ? env[key] : undefined;
  if (!priceId) {
    throw new Error(
      `Stripe is not configured: ${key} is missing (see .env.example).`,
    );
  }
  return priceId;
}

export function topupPriceId(): string {
  const priceId = env[topupPack.priceEnvKey];
  if (!priceId) {
    throw new Error(
      `Stripe is not configured: ${topupPack.priceEnvKey} is missing (see .env.example).`,
    );
  }
  return priceId;
}

/** Reverse lookup for webhook events: Stripe price → plan. */
export function planByPriceId(priceId: string): Plan | null {
  return (
    Object.values(plans).find(
      (plan) => plan.priceEnvKey && env[plan.priceEnvKey] === priceId,
    ) ?? null
  );
}
