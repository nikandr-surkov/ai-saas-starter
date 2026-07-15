import { expect, test } from "@playwright/test";

import { creditBalance, signUp, uniqueEmail } from "./helpers";

test("draining to 0 credits blocks the form with a Billing link and no spend", async ({
  page,
}) => {
  await signUp(page, uniqueEmail("drain"));
  await page.goto("/generate");

  const prompt = page.getByLabel("Prompt");
  const generate = page.getByRole("button", { name: /^Generate/ });

  // 10 welcome credits, 1 per generation, rate limit allows exactly 10/min.
  for (let remaining = 9; remaining >= 0; remaining--) {
    await prompt.fill(`ledger entry ${9 - remaining}`);
    await generate.click();
    await expect(creditBalance(page)).toHaveText(String(remaining));
  }

  // At zero the form blocks client-side — no server call, no 11th spend.
  await expect(generate).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "top up in Billing" }),
  ).toBeVisible();
  await expect(page.locator("section img")).toHaveCount(10);
});
