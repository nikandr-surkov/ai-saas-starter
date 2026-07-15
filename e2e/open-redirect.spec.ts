import { expect, request, test } from "@playwright/test";

import { BASE_URL } from "../playwright.config";
import { PASSWORD, uniqueEmail } from "./helpers";

// The open-redirect guard, tested logged-OUT as a real attacker would find
// it: /login?next=<evil> must never leave the origin after login.

const email = uniqueEmail("redirect");

test.beforeAll(async () => {
  // Create the victim account in a throwaway context so the page contexts
  // below start signed out.
  const context = await request.newContext({ baseURL: BASE_URL });
  const response = await context.post("/api/auth/sign-up/email", {
    data: { email, password: PASSWORD, name: "E2E User" },
  });
  expect(response.ok()).toBeTruthy();
  await context.dispose();
});

test("visiting /dashboard signed out bounces through login and back", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.waitForURL("**/login?next=%2Fdashboard");

  await page.getByLabel("Email").first().fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard");
  expect(page.url()).toBe(`${BASE_URL}/dashboard`);
});

for (const evil of ["//evil.com", "https://evil.com", "%2F%2Fevil.com"]) {
  test(`next=${evil} lands on /dashboard, never leaves the origin`, async ({
    page,
  }) => {
    await page.goto(`/login?next=${evil}`);

    await page.getByLabel("Email").first().fill(email);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("**/dashboard");
    expect(page.url()).toBe(`${BASE_URL}/dashboard`);
    expect(new URL(page.url()).origin).toBe(BASE_URL);
  });
}
