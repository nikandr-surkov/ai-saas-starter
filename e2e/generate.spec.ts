import { expect, test } from "@playwright/test";

import { creditBalance, signUp, uniqueEmail } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signUp(page, uniqueEmail("gen"));
  await page.goto("/generate");
});

test("mock generation spends 1 credit and serves the image", async ({
  page,
}) => {
  await page.getByLabel("Prompt").fill("A ledger book on a desk");
  await page.getByRole("button", { name: /^Generate/ }).click();

  await expect(
    page.getByText("Image generated — 1 credit spent"),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("9");

  const image = page.locator("section img").first();
  await expect(image).toBeVisible();
  const src = await image.getAttribute("src");
  expect(src).toMatch(/^\/api\/images\//);
  const served = await page.request.get(src as string);
  expect(served.status()).toBe(200);
  expect(served.headers()["content-type"]).toMatch(/^image\//);
});

test('a prompt containing "FAIL" refunds the credit and marks the row failed', async ({
  page,
}) => {
  await page.getByLabel("Prompt").fill("A ledger book, but make it FAIL");
  await page.getByRole("button", { name: /^Generate/ }).click();

  // The demoable money-back path: refund toast, balance untouched.
  await expect(
    page.getByText("Generation failed — credit refunded"),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("10");
  await expect(
    page.locator("section li").filter({ hasText: "failed" }).first(),
  ).toBeVisible();
});
