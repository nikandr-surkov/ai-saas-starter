"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccount({
  hasPassword,
  canSendEmail,
}: {
  hasPassword: boolean;
  canSendEmail: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    setPending(true);
    const { error } = await authClient.deleteUser(
      hasPassword && typeof password === "string" && password.length > 0
        ? { password }
        : { callbackURL: "/" },
    );
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not delete the account");
      return;
    }
    if (hasPassword) {
      // Deleted immediately. Subscription cancellation runs in beforeDelete (M3).
      router.push("/");
      router.refresh();
      return;
    }
    toast.success(
      canSendEmail
        ? "Check your inbox to confirm deletion"
        : "Deletion requested",
    );
  }

  return (
    <div className="max-w-sm space-y-3">
      <p className="text-sm text-muted-foreground">
        Deletes your account, generations, and ledger history. Cancels any
        active subscription. This cannot be undone.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this account?</DialogTitle>
            <DialogDescription>
              {hasPassword
                ? "Confirm with your password. This permanently removes:"
                : "We send a confirmation link to your email. Confirming permanently removes:"}
            </DialogDescription>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>— your account and every sign-in method</li>
              <li>— all generated images</li>
              <li>— the entire credit ledger history</li>
              <li>— any active subscription (canceled at Stripe first)</li>
            </ul>
          </DialogHeader>
          <form onSubmit={onDelete} className="grid gap-4">
            {hasPassword ? (
              <div className="grid gap-1.5">
                <Label htmlFor="delete-password">Password</Label>
                <Input
                  id="delete-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            ) : null}
            <DialogFooter showCloseButton>
              <Button type="submit" variant="destructive" disabled={pending}>
                Delete permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
