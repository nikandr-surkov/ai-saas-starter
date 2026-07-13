import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env, features } from "@/lib/env";

// Generation rate limit: 10 per minute per user. Upstash Redis when
// configured; otherwise a per-instance in-memory sliding window — fine for
// dev, NOT for serverless production where instances don't share memory
// (AGENTS.md gotchas).

const LIMIT = 10;
const WINDOW_MS = 60_000;

export type RateLimitResult = {
  success: boolean;
  /** Epoch ms when the window resets (set when rejected). */
  reset?: number;
};

const upstash = features.redisRateLimit
  ? new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(LIMIT, "1 m"),
      prefix: "ratelimit:generate",
    })
  : null;

// Survives dev hot-reload the same way the db pool does.
const globalForRateLimit = globalThis as unknown as {
  rateLimitWindows?: Map<string, number[]>;
};
const windows = (globalForRateLimit.rateLimitWindows ??= new Map<
  string,
  number[]
>());

function limitInMemory(key: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (windows.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= LIMIT) {
    windows.set(key, recent);
    const oldest = recent[0] ?? now;
    return { success: false, reset: oldest + WINDOW_MS };
  }
  recent.push(now);
  windows.set(key, recent);
  return { success: true };
}

export async function limitGeneration(
  userId: string,
): Promise<RateLimitResult> {
  if (upstash) {
    const { success, reset } = await upstash.limit(userId);
    return { success, reset };
  }
  return limitInMemory(userId);
}
