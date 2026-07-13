import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Only the Stripe client is mocked — the upsert runs against real Postgres,
// same as the ledger suite.
const subscriptionsList = vi.fn();
vi.mock("./stripe", () => ({
  getStripe: () => ({ subscriptions: { list: subscriptionsList } }),
}));

import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { closeDb, ensureTestDatabase } from "@/test/db";

import { syncStripeDataToDb } from "./sync";

beforeAll(async () => {
  await ensureTestDatabase();
}, 60_000);

afterAll(async () => {
  await closeDb();
});

const PERIOD_END = 1_786_629_564; // 2026-08-13T13:59:24Z

function fakeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: `sub_sync_${randomUUID().slice(0, 8)}`,
    status: "active",
    cancel_at_period_end: false,
    cancel_at: null,
    default_payment_method: null,
    items: {
      data: [
        {
          price: { id: "price_vitest_pro" },
          current_period_end: PERIOD_END,
        },
      ],
    },
    ...overrides,
  };
}

async function createCustomer(): Promise<{
  userId: string;
  customerId: string;
}> {
  const userId = `sync_test_${randomUUID()}`;
  const customerId = `cus_sync_${randomUUID().slice(0, 12)}`;
  await db.insert(users).values({
    id: userId,
    name: "Sync Test",
    email: `${userId}@test.local`,
    stripeCustomerId: customerId,
  });
  return { userId, customerId };
}

async function syncedRow(userId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return row;
}

describe("syncStripeDataToDb — cancelAtPeriodEnd derivation", () => {
  it("cancel_at set with the legacy boolean false → flag is true (post-Basil portal cancel)", async () => {
    const { userId, customerId } = await createCustomer();
    subscriptionsList.mockResolvedValueOnce({
      data: [
        fakeSubscription({
          cancel_at_period_end: false,
          cancel_at: PERIOD_END,
        }),
      ],
    });

    await syncStripeDataToDb(customerId);

    const row = await syncedRow(userId);
    expect(row?.status).toBe("active");
    expect(row?.cancelAtPeriodEnd).toBe(true);
    expect(row?.currentPeriodEnd?.getTime()).toBe(PERIOD_END * 1000);
  });

  it("legacy boolean true still maps to true", async () => {
    const { userId, customerId } = await createCustomer();
    subscriptionsList.mockResolvedValueOnce({
      data: [fakeSubscription({ cancel_at_period_end: true })],
    });

    await syncStripeDataToDb(customerId);

    expect((await syncedRow(userId))?.cancelAtPeriodEnd).toBe(true);
  });

  it("no scheduled cancellation → false", async () => {
    const { userId, customerId } = await createCustomer();
    subscriptionsList.mockResolvedValueOnce({ data: [fakeSubscription()] });

    await syncStripeDataToDb(customerId);

    const row = await syncedRow(userId);
    expect(row?.cancelAtPeriodEnd).toBe(false);
    expect(row?.priceId).toBe("price_vitest_pro");
  });
});
