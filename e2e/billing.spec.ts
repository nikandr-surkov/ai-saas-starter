import { expect, test } from "@playwright/test";

import { signUp, uniqueEmail } from "./helpers";

// v4.7: the plan cards render their details straight from
// config/plans.ts — one feature-line assertion per purchase option
// pins that nothing is hard-coded copy.
test("billing renders plan cards from the plans config", async ({ page }) => {
  await signUp(page, uniqueEmail("billing"));
  await page.goto("/billing");

  await expect(page.getByText("200 credits every month")).toBeVisible();
  await expect(page.getByText("1,000 credits every month")).toBeVisible();
  await expect(page.getByText("100 credits, one time")).toBeVisible();

  // Sibling upgrade actions, identical style; top-up shares the anatomy.
  await expect(
    page.getByRole("button", { name: "Upgrade to Pro" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Upgrade to Ultra" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Buy top-up" })).toBeVisible();
});
