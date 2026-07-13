"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  name: z.string().min(1, "Enter your name").max(100),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function SignupForm({
  requiresVerification,
}: {
  requiresVerification: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error: signUpError } = await authClient.signUp.email(parsed.data);
    if (signUpError) {
      setError(signUpError.message ?? "Sign-up failed");
      setPending(false);
      return;
    }
    if (requiresVerification) {
      setVerifyNotice(true);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (verifyNotice) {
    return (
      <p className="text-sm text-muted-foreground">
        Almost there — check your inbox and click the verification link to
        activate your account. Your 10 welcome credits are already waiting.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input id="signup-name" name="name" autoComplete="name" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        Create account
      </Button>
    </form>
  );
}
