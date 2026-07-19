import { expect, test } from "@playwright/test";

import { PASSWORD, creditBalance, uniqueEmail } from "./helpers";

test("signup → sign out → login → dashboard shows 10 welcome credits", async ({
  page,
}) => {
  const email = uniqueEmail("auth");

  // Signup through the real form.
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard");
  await expect(creditBalance(page)).toHaveText("10");
  // The welcome grant shows up in the dashboard ledger table.
  await expect(page.getByText("subscription_grant")).toBeVisible();

  // Sign out via the user menu.
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("**/login**");

  // Log back in with the same credentials.
  await page.getByLabel("Email").first().fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  await expect(creditBalance(page)).toHaveText("10");

  // Signed-in marketing nav collapses to a single Dashboard button.
  await page.goto("/");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Dashboard" }),
  ).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Get started" }),
  ).toHaveCount(0);
});
