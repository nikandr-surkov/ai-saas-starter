import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Same-origin paths only — never redirect to a caller-supplied host.
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Sign in</p>
        <h1 className="mt-2 text-2xl">Welcome back</h1>
      </div>
      <OAuthButtons
        google={features.googleOAuth}
        github={features.githubOAuth}
        next={safeNext}
      />
      <LoginForm magicLink={features.email} next={safeNext} />
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/signup"
          className="link-pop"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
