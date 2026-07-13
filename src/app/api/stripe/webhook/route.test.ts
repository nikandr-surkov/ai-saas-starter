import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The route runs REAL signature verification (pure HMAC, no network) against
// requests signed with stripe's own test helper. Everything behind the
// dispatch is mocked: sync, ledger, and the customer→user lookup — their
// real behavior is covered by the M4 ledger suite and the live checkout walk.
vi.mock("@/lib/billing/sync", () => ({
  syncStripeDataToDb: vi.fn(async () => undefined),
}));
vi.mock("@/lib/credits", () => ({
  grantCredits: vi.fn(async () => undefined),
}));
vi.mock("@/lib/billing/customer", () => ({
  userIdForStripeCustomer: vi.fn(async () => "user_1"),
  ensureStripeCustomer: vi.fn(),
  cancelSubscriptionsForUser: vi.fn(),
}));

import { POST } from "@/app/api/stripe/webhook/route";
import { syncStripeDataToDb } from "@/lib/billing/sync";
import { grantCredits } from "@/lib/credits";

const signer = new Stripe("sk_test_vitest");

function signedRequest(event: Record<string, unknown>): Request {
  const payload = JSON.stringify(event);
  const signature = signer.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET as string,
  });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": signature },
  });
}

function invoicePaidEvent({
  price = "price_vitest_pro",
  parent = {
    type: "subscription_details",
    subscription_details: { subscription: "sub_test_1" },
  } as Record<string, unknown> | null,
} = {}) {
  return {
    id: "evt_invoice_paid_1",
    object: "event",
    type: "invoice.paid",
    data: {
      object: {
        id: "in_test_1",
        object: "invoice",
        customer: "cus_test_1",
        parent,
        lines: {
          object: "list",
          data: [
            {
              id: "il_test_1",
              object: "line_item",
              pricing: {
                type: "price_details",
                price_details: { price },
              },
            },
          ],
        },
      },
    },
  };
}

function checkoutCompletedEvent(
  mode: "payment" | "subscription",
  metadata: Record<string, string> | null = mode === "payment"
    ? { kind: "topup", credits: "100" }
    : null,
) {
  return {
    id: `evt_checkout_${mode}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        object: "checkout.session",
        mode,
        customer: "cus_test_1",
        metadata,
      },
    },
  };
}

function subscriptionEvent(type: string) {
  return {
    id: `evt_${type}`,
    object: "event",
    type,
    data: {
      object: {
        id: "sub_test_1",
        object: "subscription",
        customer: "cus_test_1",
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signature verification", () => {
  it("rejects a missing signature header with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: JSON.stringify(invoicePaidEvent()),
      }),
    );
    expect(response.status).toBe(400);
    expect(syncStripeDataToDb).not.toHaveBeenCalled();
  });

  it("rejects a tampered payload with 400", async () => {
    const signedForOtherPayload = signer.webhooks.generateTestHeaderString({
      payload: JSON.stringify({ different: true }),
      secret: process.env.STRIPE_WEBHOOK_SECRET as string,
    });
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: JSON.stringify(invoicePaidEvent()),
        headers: { "stripe-signature": signedForOtherPayload },
      }),
    );
    expect(response.status).toBe(400);
    expect(syncStripeDataToDb).not.toHaveBeenCalled();
  });
});

describe("event dispatch", () => {
  it.each([
    ["invoice.paid", invoicePaidEvent()],
    ["checkout.session.completed", checkoutCompletedEvent("payment")],
    [
      "customer.subscription.updated",
      subscriptionEvent("customer.subscription.updated"),
    ],
    [
      "customer.subscription.deleted",
      subscriptionEvent("customer.subscription.deleted"),
    ],
  ])("%s → 200 and a sync for the customer", async (_type, event) => {
    const response = await POST(signedRequest(event));
    expect(response.status).toBe(200);
    expect(syncStripeDataToDb).toHaveBeenCalledExactlyOnceWith("cus_test_1");
  });

  it("acknowledges irrelevant events without syncing", async () => {
    const response = await POST(
      signedRequest({
        id: "evt_noise",
        object: "event",
        type: "customer.created",
        data: { object: { id: "cus_test_1", object: "customer" } },
      }),
    );
    expect(response.status).toBe(200);
    expect(syncStripeDataToDb).not.toHaveBeenCalled();
  });

  it("returns 500 when handling fails, so Stripe retries", async () => {
    vi.mocked(syncStripeDataToDb).mockRejectedValueOnce(new Error("db down"));
    const response = await POST(signedRequest(invoicePaidEvent()));
    expect(response.status).toBe(500);
  });
});

describe("credit side-effects", () => {
  it("invoice.paid grants the plan's monthly credits, keyed grant_{invoiceId}", async () => {
    await POST(signedRequest(invoicePaidEvent()));
    expect(grantCredits).toHaveBeenCalledExactlyOnceWith({
      userId: "user_1",
      amount: 200, // pro — price_vitest_pro
      type: "subscription_grant",
      ref: { type: "invoice", id: "in_test_1" },
      idempotencyKey: "grant_in_test_1",
    });
  });

  it("replays produce the identical idempotency key", async () => {
    await POST(signedRequest(invoicePaidEvent()));
    await POST(signedRequest(invoicePaidEvent()));
    const keys = vi
      .mocked(grantCredits)
      .mock.calls.map(([input]) => input.idempotencyKey);
    expect(keys).toEqual(["grant_in_test_1", "grant_in_test_1"]);
  });

  it("one-off invoices (no subscription parent) grant nothing", async () => {
    await POST(signedRequest(invoicePaidEvent({ parent: null })));
    expect(grantCredits).not.toHaveBeenCalled();
    expect(syncStripeDataToDb).toHaveBeenCalledOnce();
  });

  it("unknown prices grant nothing but still sync", async () => {
    await POST(signedRequest(invoicePaidEvent({ price: "price_unknown" })));
    expect(grantCredits).not.toHaveBeenCalled();
    expect(syncStripeDataToDb).toHaveBeenCalledOnce();
  });

  it("payment-mode checkout grants the top-up pack, keyed topup_{sessionId}", async () => {
    await POST(signedRequest(checkoutCompletedEvent("payment")));
    expect(grantCredits).toHaveBeenCalledExactlyOnceWith({
      userId: "user_1",
      amount: 100,
      type: "topup",
      ref: { type: "checkout_session", id: "cs_test_1" },
      idempotencyKey: "topup_cs_test_1",
    });
  });

  it("subscription-mode checkout grants nothing (invoice.paid will)", async () => {
    await POST(signedRequest(checkoutCompletedEvent("subscription")));
    expect(grantCredits).not.toHaveBeenCalled();
  });

  it("foreign payment checkouts (no top-up metadata) grant nothing", async () => {
    await POST(signedRequest(checkoutCompletedEvent("payment", null)));
    expect(grantCredits).not.toHaveBeenCalled();
    expect(syncStripeDataToDb).toHaveBeenCalledOnce();
  });

  it("top-up checkouts with tampered credits metadata grant nothing", async () => {
    await POST(
      signedRequest(
        checkoutCompletedEvent("payment", { kind: "topup", credits: "-5" }),
      ),
    );
    expect(grantCredits).not.toHaveBeenCalled();
  });
});
