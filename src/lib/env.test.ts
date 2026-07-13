import { describe, expect, it } from "vitest";

import { deriveFeatures, missingBillingEnv, parseEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/ai_saas_starter",
  BETTER_AUTH_SECRET: "a".repeat(32),
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro",
  STRIPE_PRICE_ULTRA_MONTHLY: "price_ultra",
  STRIPE_PRICE_TOPUP_100: "price_topup",
};

describe("parseEnv", () => {
  it("accepts a minimal valid env and applies defaults", () => {
    const env = parseEnv(validEnv);
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.AI_IMAGE_MODEL).toBe("openai/gpt-image-1");
    expect(env.AI_MOCK).toBe(false);
    expect(env.NODE_ENV).toBe("development");
  });

  it("fails fast with the offending variable named", () => {
    const withoutDb: Record<string, string> = { ...validEnv };
    delete withoutDb.DATABASE_URL;
    expect(() => parseEnv(withoutDb)).toThrowError(/DATABASE_URL/);
  });

  it("rejects a non-postgres DATABASE_URL", () => {
    expect(() =>
      parseEnv({ ...validEnv, DATABASE_URL: "mysql://localhost/db" }),
    ).toThrowError(/postgres/);
  });

  it("rejects a short BETTER_AUTH_SECRET", () => {
    expect(() =>
      parseEnv({ ...validEnv, BETTER_AUTH_SECRET: "too-short" }),
    ).toThrowError(/32/);
  });

  it("rejects Stripe Product IDs where Price IDs are expected", () => {
    expect(() =>
      parseEnv({ ...validEnv, STRIPE_PRICE_PRO_MONTHLY: "prod_123" }),
    ).toThrowError(/price_/);
  });

  it("rejects a webhook secret that is not whsec_", () => {
    expect(() =>
      parseEnv({ ...validEnv, STRIPE_WEBHOOK_SECRET: "sk_test_oops" }),
    ).toThrowError(/whsec_/);
  });

  it("allows missing Stripe config outside production", () => {
    const withoutStripe: Record<string, string> = { ...validEnv };
    for (const key of Object.keys(withoutStripe)) {
      if (key.startsWith("STRIPE_")) delete withoutStripe[key];
    }
    const env = parseEnv(withoutStripe);
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(deriveFeatures(env).billing).toBe(false);
  });

  it("requires every Stripe var in production", () => {
    const withoutStripe: Record<string, string> = {
      ...validEnv,
      NODE_ENV: "production",
    };
    delete withoutStripe.STRIPE_SECRET_KEY;
    delete withoutStripe.STRIPE_PRICE_TOPUP_100;
    const attempt = () => parseEnv(withoutStripe);
    expect(attempt).toThrowError(/STRIPE_SECRET_KEY/);
    expect(attempt).toThrowError(/STRIPE_PRICE_TOPUP_100/);
    expect(attempt).toThrowError(/required in production/);
  });

  it("accepts a fully configured production env", () => {
    expect(parseEnv({ ...validEnv, NODE_ENV: "production" }).NODE_ENV).toBe(
      "production",
    );
  });

  it("treats empty strings as unset", () => {
    const env = parseEnv({
      ...validEnv,
      GOOGLE_CLIENT_ID: "",
      GOOGLE_CLIENT_SECRET: "",
      RESEND_API_KEY: "",
    });
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it("rejects half-configured OAuth pairs, naming the missing var", () => {
    expect(() =>
      parseEnv({ ...validEnv, GOOGLE_CLIENT_ID: "id-only" }),
    ).toThrowError(/GOOGLE_CLIENT_SECRET/);
    expect(() =>
      parseEnv({ ...validEnv, GITHUB_CLIENT_SECRET: "secret-only" }),
    ).toThrowError(/GITHUB_CLIENT_ID/);
  });

  it("rejects half-configured Upstash credentials", () => {
    expect(() =>
      parseEnv({ ...validEnv, UPSTASH_REDIS_REST_URL: "https://x.upstash.io" }),
    ).toThrowError(/UPSTASH_REDIS_REST_TOKEN/);
  });

  it("parses AI_MOCK into a boolean", () => {
    expect(parseEnv({ ...validEnv, AI_MOCK: "true" }).AI_MOCK).toBe(true);
    expect(parseEnv({ ...validEnv, AI_MOCK: "false" }).AI_MOCK).toBe(false);
    expect(() => parseEnv({ ...validEnv, AI_MOCK: "yes" })).toThrowError(
      /AI_MOCK/,
    );
  });

  it("enforces provider/model format for AI_IMAGE_MODEL", () => {
    expect(
      parseEnv({ ...validEnv, AI_IMAGE_MODEL: "fal/flux-pro" }).AI_IMAGE_MODEL,
    ).toBe("fal/flux-pro");
    expect(() =>
      parseEnv({ ...validEnv, AI_IMAGE_MODEL: "gpt-image-1" }),
    ).toThrowError(/provider\/model/);
  });
});

describe("missingBillingEnv", () => {
  it("is empty when Stripe is fully configured", () => {
    expect(missingBillingEnv(parseEnv(validEnv))).toEqual([]);
  });

  it("names exactly the unset vars", () => {
    const partial: Record<string, string> = { ...validEnv };
    delete partial.STRIPE_WEBHOOK_SECRET;
    delete partial.STRIPE_PRICE_TOPUP_100;
    expect(missingBillingEnv(parseEnv(partial))).toEqual([
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_TOPUP_100",
    ]);
  });
});

describe("deriveFeatures", () => {
  it("turns optional features off for a minimal env", () => {
    expect(deriveFeatures(parseEnv(validEnv))).toEqual({
      billing: true, // validEnv configures all five Stripe vars
      googleOAuth: false,
      githubOAuth: false,
      email: false,
      redisRateLimit: false,
      blobStorage: false,
    });
  });

  it("turns billing on only when all five Stripe vars are set", () => {
    const partial: Record<string, string> = { ...validEnv };
    delete partial.STRIPE_WEBHOOK_SECRET;
    expect(deriveFeatures(parseEnv(partial)).billing).toBe(false);
  });

  it("flips flags when the backing vars are present", () => {
    const env = parseEnv({
      ...validEnv,
      GITHUB_CLIENT_ID: "id",
      GITHUB_CLIENT_SECRET: "secret",
      RESEND_API_KEY: "re_123",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_token",
    });
    const features = deriveFeatures(env);
    expect(features.githubOAuth).toBe(true);
    expect(features.email).toBe(true);
    expect(features.blobStorage).toBe(true);
    expect(features.googleOAuth).toBe(false);
    expect(features.redisRateLimit).toBe(false);
  });
});
