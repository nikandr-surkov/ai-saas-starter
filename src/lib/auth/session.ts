import { cache } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Server-side session helpers. Every (app) page and every server action
// calls one of these — the proxy redirect is an optimistic UX nicety, never
// the security boundary (AGENTS.md conventions).

/** Session or null. Cached per request. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Session or redirect to /login. Use at the top of (app) pages. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
