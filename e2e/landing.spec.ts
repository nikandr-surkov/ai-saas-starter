import { expect, test } from "@playwright/test";

test("landing renders the ledger sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "credits ledger",
  );
  await expect(page.locator("#features")).toBeVisible();
  await expect(page.locator("#code pre")).toContainText(
    "export async function spendCredits",
  );
  await expect(page.locator('details[name="faq"]').first()).toBeVisible();
});

test("theme toggle flips to dark, renders, and persists across reloads", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(html).toHaveClass(/dark/);
  // Dark theme actually renders the page (not just a class flip).
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.reload();
  await expect(html).toHaveClass(/dark/);
});
