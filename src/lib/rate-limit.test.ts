import { describe, expect, it } from "vitest";

import { limitGeneration } from "./rate-limit";

// Exercises the in-memory fallback (no Upstash env in tests) — 10/min/user.

describe("limitGeneration (in-memory fallback)", () => {
  it("allows 10 in a minute, rejects the 11th with a reset time", async () => {
    const userId = `rate_${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      expect((await limitGeneration(userId)).success).toBe(true);
    }
    const eleventh = await limitGeneration(userId);
    expect(eleventh.success).toBe(false);
    expect(eleventh.reset).toBeGreaterThan(Date.now());
  });

  it("tracks users independently", async () => {
    const blocked = `rate_blocked_${Date.now()}`;
    for (let i = 0; i < 10; i++) await limitGeneration(blocked);
    expect((await limitGeneration(blocked)).success).toBe(false);
    expect((await limitGeneration(`rate_other_${Date.now()}`)).success).toBe(
      true,
    );
  });
});
