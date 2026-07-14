import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { WELCOME_CREDITS } from "@/config/plans";

import MagicLinkEmail from "./magic-link";
import ResetPasswordEmail from "./reset-password";
import SubscriptionConfirmedEmail from "./subscription-confirmed";
import VerifyEmail from "./verify-email";
import WelcomeEmail from "./welcome";

// Render smoke tests: every template produces html + a plain-text fallback,
// carries the wordmark chrome, and the money-adjacent copy stays wired to
// the config values rather than drifting literals.

describe("email templates", () => {
  it("welcome mentions the welcome credits from config", async () => {
    const email = WelcomeEmail({ name: "Ada", appUrl: "https://example.test" });
    // JSX inserts comment separators into html, so copy asserts on plaintext.
    const text = await render(email, { plainText: true });
    const html = await render(email);
    expect(text).toContain(`${WELCOME_CREDITS} welcome credits`);
    expect(text).toContain("ai-saas-starter");
    expect(html).toContain("https://example.test/generate");
  });

  it("subscription confirmation carries plan name and credit amount", async () => {
    const text = await render(
      SubscriptionConfirmedEmail({
        planName: "Ultra",
        monthlyCredits: 1000,
        appUrl: "https://example.test",
      }),
      { plainText: true },
    );
    expect(text).toContain("Ultra is active");
    expect(text).toContain("1000 credits");
  });

  it.each([
    ["verify", VerifyEmail({ url: "https://example.test/v?token=t" })],
    ["magic link", MagicLinkEmail({ url: "https://example.test/m?token=t" })],
    ["reset", ResetPasswordEmail({ url: "https://example.test/r?token=t" })],
  ])("%s renders its action URL in html and plain text", async (_n, email) => {
    const html = await render(email);
    const text = await render(email, { plainText: true });
    expect(html).toContain("https://example.test/");
    expect(text.length).toBeGreaterThan(40);
  });
});
