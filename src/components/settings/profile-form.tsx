"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { BusyButton } from "@/components/busy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = z
      .string()
      .min(1, "Enter a name")
      .max(100)
      .safeParse(new FormData(event.currentTarget).get("name"));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error } = await authClient.updateUser({ name: parsed.data });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not update your name");
      return;
    }
    toast.success("Name updated");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm items-end gap-2">
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="profile-name">Name</Label>
        <Input id="profile-name" name="name" defaultValue={name} required />
      </div>
      <BusyButton
        type="submit"
        variant="outline"
        busy={pending}
        busyLabel="Saving…"
      >
        Save
      </BusyButton>
    </form>
  );
}
