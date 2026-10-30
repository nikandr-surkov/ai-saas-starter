"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

type Provider = "google" | "github";

const labels: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
};

export function ConnectedAccounts({
  available,
  linkedAccounts,
  hasPassword,
}: {
  /** Providers configured via env on the server. */
  available: Provider[];
  /** The user's linked OAuth accounts: provider id and Better Auth account id. */
  linkedAccounts: { id: string; providerId: string }[];
  /** Whether a credential (password) account exists — last sign-in method must stay. */
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<Provider | null>(null);

  async function link(provider: Provider) {
    setPending(provider);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/settings",
    });
    if (error) {
      toast.error(error.message ?? `Could not link ${labels[provider]}`);
      setPending(null);
    }
  }

  async function unlink(provider: Provider) {
    const account = linkedAccounts.find((item) => item.providerId === provider);
    if (account === undefined) return;
    const remaining = linkedAccounts.length + (hasPassword ? 1 : 0);
    if (remaining <= 1) {
      toast.error("Keep at least one sign-in method");
      return;
    }
    setPending(provider);
    const { error } = await authClient.unlinkAccount({ accountId: account.id });
    setPending(null);
    if (error) {
      toast.error(error.message ?? `Could not unlink ${labels[provider]}`);
      return;
    }
    toast.success(`${labels[provider]} unlinked`);
    router.refresh();
  }

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No OAuth providers are configured. Add Google or GitHub keys to .env to
        enable provider sign-in.
      </p>
    );
  }

  return (
    <ul className="max-w-sm">
      {available.map((provider) => {
        const isLinked = linkedAccounts.some(
          (item) => item.providerId === provider,
        );
        return (
          <li
            key={provider}
            className="flex items-center justify-between border-b py-3 last:border-0"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-sm">{labels[provider]}</span>
              <span className="eyebrow">
                {isLinked ? "Linked" : "Not linked"}
              </span>
            </div>
            <Button
              variant={isLinked ? "ghost" : "outline"}
              size="sm"
              disabled={pending !== null}
              onClick={() => (isLinked ? unlink(provider) : link(provider))}
            >
              {isLinked ? "Unlink" : "Link"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
