import { describe, expect, it } from "vitest";

import {
  GENERATION_COST_CREDITS,
  WELCOME_CREDITS,
  plans,
  topupPack,
} from "./plans";

describe("plans config", () => {
  it("keys match plan ids", () => {
    for (const [key, plan] of Object.entries(plans)) {
      expect(plan.id).toBe(key);
    }
  });

  it("money is integer cents and credits are integers", () => {
    for (const plan of Object.values(plans)) {
      expect(Number.isInteger(plan.priceMonthlyCents)).toBe(true);
      expect(Number.isInteger(plan.monthlyCredits)).toBe(true);
      expect(plan.priceMonthlyCents).toBeGreaterThanOrEqual(0);
      expect(plan.monthlyCredits).toBeGreaterThanOrEqual(0);
    }
    expect(Number.isInteger(topupPack.credits)).toBe(true);
    expect(Number.isInteger(topupPack.priceCents)).toBe(true);
    expect(Number.isInteger(WELCOME_CREDITS)).toBe(true);
  });

  it("free has no price env key; paid plans have distinct ones", () => {
    expect(plans.free.priceEnvKey).toBeNull();
    expect(plans.free.priceMonthlyCents).toBe(0);
    const paidKeys = [plans.pro.priceEnvKey, plans.ultra.priceEnvKey];
    expect(paidKeys).toEqual([
      "STRIPE_PRICE_PRO_MONTHLY",
      "STRIPE_PRICE_ULTRA_MONTHLY",
    ]);
    expect(new Set(paidKeys).size).toBe(paidKeys.length);
  });

  it("paid plans grant credits and cost money", () => {
    for (const plan of [plans.pro, plans.ultra]) {
      expect(plan.monthlyCredits).toBeGreaterThan(0);
      expect(plan.priceMonthlyCents).toBeGreaterThan(0);
    }
    expect(plans.ultra.priceMonthlyCents).toBeGreaterThan(
      plans.pro.priceMonthlyCents,
    );
    expect(plans.ultra.monthlyCredits).toBeGreaterThan(
      plans.pro.monthlyCredits,
    );
  });

  it("locks the agreed amounts — changing these requires owner approval", () => {
    expect(WELCOME_CREDITS).toBe(10);
    expect(GENERATION_COST_CREDITS).toBe(1);
    expect(plans.pro.priceMonthlyCents).toBe(900);
    expect(plans.pro.monthlyCredits).toBe(200);
    expect(plans.ultra.priceMonthlyCents).toBe(2900);
    expect(plans.ultra.monthlyCredits).toBe(1000);
    expect(topupPack.credits).toBe(100);
    expect(topupPack.priceCents).toBe(500);
  });

  it("every plan has pricing-page copy", () => {
    for (const plan of Object.values(plans)) {
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });
});
