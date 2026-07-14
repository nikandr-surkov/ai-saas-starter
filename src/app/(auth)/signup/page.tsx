import type { Metadata } from "next";
import Link from "next/link";

import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignupForm } from "@/components/auth/signup-form";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Create account</p>
        <h1 className="mt-2 text-2xl">Start with 10 free credits</h1>
      </div>
      <OAuthButtons
        google={features.googleOAuth}
        github={features.githubOAuth}
        next="/dashboard"
      />
      <SignupForm requiresVerification={features.email} />
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
