import { expect, type Page } from "@playwright/test";

export const PASSWORD = "e2e-Passw0rd-42";

let counter = 0;

export function uniqueEmail(tag: string): string {
  return `e2e-${tag}-${Date.now()}-${++counter}@test.local`;
}

/**
 * Signs up through the real API using the page's cookie jar — the page is
 * signed in afterwards (no Resend configured → no verification gate).
 */
export async function signUp(page: Page, email: string): Promise<void> {
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: { email, password: PASSWORD, name: "E2E User" },
  });
  expect(response.ok()).toBeTruthy();
}

export function creditBalance(page: Page) {
  return page.getByTestId("credit-balance");
}
