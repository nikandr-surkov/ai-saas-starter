import { expect, test } from "@playwright/test";

import { BASE_URL } from "../playwright.config";
import { signUp, uniqueEmail } from "./helpers";

// Pins the live-verified authz behavior of the dev image route so it can't
// regress: owner 200, anonymous 401, traversal/malformed 404.

test("image route: owner 200, anonymous 401, traversal 404", async ({
  page,
  browser,
}) => {
  await signUp(page, uniqueEmail("authz"));
  await page.goto("/generate");
  await page.getByLabel("Prompt").fill("An authz probe image");
  await page.getByRole("button", { name: /^Generate/ }).click();
  // Target the API-served generation specifically — the empty-state mascot
  // illustration is also a `section img` while the action is in flight.
  const generated = page.locator('section img[src^="/api/images/"]').first();
  await expect(generated).toBeVisible();
  const src = await generated.getAttribute("src");
  expect(src).toMatch(/^\/api\/images\//);

  // Owner with a session cookie: served.
  const owner = await page.request.get(src as string);
  expect(owner.status()).toBe(200);
  expect(owner.headers()["content-type"]).toMatch(/^image\//);

  // Anonymous context: rejected before any filesystem access.
  const anonymous = await browser.newContext();
  const anonResponse = await anonymous.request.get(`${BASE_URL}${src}`);
  expect(anonResponse.status()).toBe(401);
  await anonymous.close();

  // Traversal and malformed names never resolve.
  for (const attack of [
    "/api/images/..%2F.env",
    "/api/images/%2E%2E%2F%2E%2E%2Fpackage.json",
    "/api/images/not-a-uuid.svg",
  ]) {
    const response = await page.request.get(attack);
    expect(response.status(), attack).toBe(404);
  }
});
