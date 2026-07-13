"use client";

import * as React from "react";

import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const email = z
      .email()
      .safeParse(new FormData(event.currentTarget).get("email"));
    if (!email.success) {
      setError("Enter a valid email address");
      return;
    }
    setPending(true);
    const { error: requestError } = await authClient.requestPasswordReset({
      email: email.data,
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (requestError) {
      setError(requestError.message ?? "Could not send the reset email");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for that address, a reset link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        Send reset link
      </Button>
    </form>
  );
}
