"use client";

import * as React from "react";

import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

// Brand marks are inline SVGs: lucide-react dropped brand icons, and
// DESIGN.md's lucide-only rule is about UI glyphs, not provider logos.

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

export function OAuthButtons({
  google,
  github,
  next,
}: {
  google: boolean;
  github: boolean;
  next: string;
}) {
  const [pending, setPending] = React.useState<"google" | "github" | null>(
    null,
  );

  async function signIn(provider: "google" | "github") {
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
    });
    if (error) {
      toast.error(error.message ?? "Sign-in failed");
      setPending(null);
    }
    // On success the browser navigates to the provider — no state to reset.
  }

  if (!google && !github) return null;

  return (
    <div className="grid gap-2">
      {google ? (
        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => signIn("google")}
        >
          <GoogleMark />
          Continue with Google
        </Button>
      ) : null}
      {github ? (
        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => signIn("github")}
        >
          <GitHubMark />
          Continue with GitHub
        </Button>
      ) : null}
    </div>
  );
}
