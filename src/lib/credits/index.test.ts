import { describe, expect, it } from "vitest";

import { grantCredits } from "./index";

// Input-validation tests only — they throw before any query runs, so no
// database is needed. The full behavioral suite (grants, spends, races,
// idempotent replays, the balance invariant) is built test-first against
// real Postgres in M4.

describe("grantCredits input validation", () => {
  it.each([
    ["zero", 0],
    ["negative", -5],
    ["fractional", 1.5],
    ["NaN", Number.NaN],
  ])("rejects a %s amount without touching the db", async (_label, amount) => {
    await expect(
      grantCredits({
        userId: "user_1",
        amount,
        type: "topup",
        idempotencyKey: `test_${amount}`,
      }),
    ).rejects.toThrow(/positive integer/);
  });
});
