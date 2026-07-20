import { expect, test } from "@playwright/test";

test("landing renders the ledger sections with signed-out auth CTAs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A complete AI SaaS. Free.",
  );
  // Signed-out nav: Sign in + Get started; hero CTA goes to signup.
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Get started" }),
  ).toHaveAttribute("href", "/signup");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Sign in" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start free — 10 credits" }),
  ).toHaveAttribute("href", "/signup");
  await expect(page.locator("#features")).toBeVisible();
  // Pricing section reads from config/plans.ts.
  await expect(page.locator("#pricing")).toBeVisible();
  await expect(page.locator("#pricing")).toContainText("$9/mo");
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
