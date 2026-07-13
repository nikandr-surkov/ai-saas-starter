"use client";

import * as React from "react";

import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export function PasswordForm() {
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const parsed = schema.safeParse({
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not change the password");
      return;
    }
    toast.success("Password changed — other sessions were signed out");
    formElement.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-sm gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          Change password
        </Button>
      </div>
    </form>
  );
}
