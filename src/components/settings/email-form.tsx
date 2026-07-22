"use client";

import * as React from "react";

import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { BusyButton } from "@/components/busy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailForm({
  email,
  canSendEmail,
}: {
  email: string;
  canSendEmail: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = z
      .email("Enter a valid email address")
      .safeParse(new FormData(event.currentTarget).get("email"));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    if (parsed.data === email) {
      toast.error("That is already your email address");
      return;
    }
    setPending(true);
    const { error } = await authClient.changeEmail({
      newEmail: parsed.data,
      callbackURL: "/settings",
    });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not start the email change");
      return;
    }
    toast.success(
      canSendEmail
        ? "Check your current inbox to approve the change"
        : "Email updated",
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm items-end gap-2">
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="settings-email">Email</Label>
        <Input
          id="settings-email"
          name="email"
          type="email"
          defaultValue={email}
          required
        />
      </div>
      <BusyButton
        type="submit"
        variant="outline"
        busy={pending}
        busyLabel="Saving…"
      >
        Change
      </BusyButton>
    </form>
  );
}
