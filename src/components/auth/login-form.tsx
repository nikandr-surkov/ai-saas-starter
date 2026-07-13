"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export function LoginForm({
  magicLink,
  next,
}: {
  magicLink: boolean;
  next: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [magicSent, setMagicSent] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error: signInError } = await authClient.signIn.email(parsed.data);
    if (signInError) {
      setError(signInError.message ?? "Sign-in failed");
      setPending(false);
      return;
    }
    router.push(next as Parameters<typeof router.push>[0]);
    router.refresh();
  }

  async function onMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = z.email().safeParse(form.get("email"));
    if (!email.success) {
      toast.error("Enter a valid email address");
      return;
    }
    setPending(true);
    const { error: magicError } = await authClient.signIn.magicLink({
      email: email.data,
      callbackURL: next,
    });
    setPending(false);
    if (magicError) {
      toast.error(magicError.message ?? "Could not send the link");
      return;
    }
    setMagicSent(true);
  }

  if (magicSent) {
    return (
      <p className="text-sm text-muted-foreground">
        Check your inbox — the sign-in link is on its way. It expires in five
        minutes.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Forgot password
            </Link>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          Sign in
        </Button>
      </form>
      {magicLink ? (
        <form onSubmit={onMagicLink} className="grid gap-2 border-t pt-4">
          <Label htmlFor="magic-email" className="text-muted-foreground">
            Or get a sign-in link by email
          </Label>
          <div className="flex gap-2">
            <Input
              id="magic-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Button type="submit" variant="outline" disabled={pending}>
              Send link
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
