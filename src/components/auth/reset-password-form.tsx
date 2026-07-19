"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({
      newPassword: new FormData(event.currentTarget).get("newPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: parsed.data.newPassword,
      token,
    });
    setPending(false);
    if (resetError) {
      setError(resetError.message ?? "The link may have expired — try again");
      return;
    }
    toast.success("Password updated — sign in with the new one");
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {error ? <p className="text-sm text-debit-text">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
