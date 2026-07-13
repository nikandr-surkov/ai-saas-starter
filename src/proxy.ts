import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic redirect for signed-out visitors to (app) routes. This checks
// only that a session cookie EXISTS — it is UX, not auth. The security
// boundary is requireSession() inside every (app) page and server action
// (AGENTS.md: never trust middleware alone).
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
