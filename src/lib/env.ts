import { z } from "zod";

/**
 * Environment validation — the only place `process.env` is read.
 *
 * Server-only: importing this from a client component will leak nothing (the
 * parse throws on the server at build/boot), but don't do it. Client code
 * that needs a NEXT_PUBLIC_* var must reference
 * `process.env.NEXT_PUBLIC_...` literally so Next.js can inline it at build.
 *
 * Empty strings are treated as unset, so a copied .env.example with blank
 * values behaves the same as missing vars. Every variable is documented in
 * .env.example.
 */

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: z
      .url("DATABASE_URL must be a valid URL")
      .refine((v) => /^postgres(ql)?:\/\//.test(v), {
        message: "DATABASE_URL must be a postgres:// or postgresql:// URL",
      }),

    // ── Better Auth ───────────────────────────────────────────────────────
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "min 32 chars — generate with `openssl rand -base64 32`"),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),

    // ── OAuth (optional — a missing pair hides that login button) ─────────
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // ── Email via Resend (optional — emails no-op without it) ─────────────
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("AI SaaS Starter <onboarding@resend.dev>"),

    // ── Stripe ────────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: z
      .string()
      .startsWith("sk_", "expected a Stripe secret key (sk_...)"),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .startsWith("whsec_", "expected a webhook signing secret (whsec_...)"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .startsWith("pk_", "expected a Stripe publishable key (pk_...)")
      .optional(),
    STRIPE_PRICE_PRO_MONTHLY: priceId(),
    STRIPE_PRICE_ULTRA_MONTHLY: priceId(),
    STRIPE_PRICE_TOPUP_100: priceId(),

    // ── AI generation ─────────────────────────────────────────────────────
    AI_GATEWAY_API_KEY: z.string().optional(),
    AI_IMAGE_MODEL: z
      .string()
      .regex(/^[\w.-]+\/[\w.:-]+$/, 'expected "provider/model" format')
      .default("openai/gpt-image-1"),
    AI_MOCK: stringBool(),

    // ── Rate limiting via Upstash (optional — in-memory fallback) ─────────
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // ── Storage via Vercel Blob (optional — ./.generated fallback in dev) ─
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const pairs = [
      ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
      ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
      ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ] as const;
    for (const [a, b] of pairs) {
      if (Boolean(env[a]) !== Boolean(env[b])) {
        ctx.addIssue({
          code: "custom",
          path: [env[a] ? b : a],
          message: `set both ${a} and ${b}, or neither`,
        });
      }
    }
  });

function priceId() {
  return z
    .string()
    .startsWith(
      "price_",
      "expected a Stripe Price ID (price_...), not a Product ID (prod_...)",
    );
}

function stringBool() {
  return z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true");
}

export type Env = z.infer<typeof schema>;

/** Exported for tests. App code uses the `env` singleton below. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  // Blank values in .env behave as unset.
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== ""),
  );
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(env)"}: ${issue.message}`,
    );
    throw new Error(
      [
        "Invalid environment variables:",
        ...lines,
        "Fix your .env — every variable is documented in .env.example.",
      ].join("\n"),
    );
  }
  return parsed.data;
}

export const env: Env = parseEnv(process.env);

/** Exported for tests. App code uses the `features` singleton below. */
export function deriveFeatures(e: Env) {
  return {
    /** Show the "Continue with Google" button. */
    googleOAuth: Boolean(e.GOOGLE_CLIENT_ID),
    /** Show the "Continue with GitHub" button. */
    githubOAuth: Boolean(e.GITHUB_CLIENT_ID),
    /** Send real emails (magic links require this). */
    email: Boolean(e.RESEND_API_KEY),
    /** Distributed rate limiting; otherwise per-instance in-memory. */
    redisRateLimit: Boolean(e.UPSTASH_REDIS_REST_URL),
    /** Store generated images in Vercel Blob; otherwise ./.generated (dev). */
    blobStorage: Boolean(e.BLOB_READ_WRITE_TOKEN),
  } as const;
}

export const features = deriveFeatures(env);
