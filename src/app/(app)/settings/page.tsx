import type { Metadata } from "next";
import { headers } from "next/headers";

import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { DeleteAccount } from "@/components/settings/delete-account";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth/session";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireSession();
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  const linkedProviders = accounts
    .map((account) => account.providerId)
    .filter((id) => id !== "credential");
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );
  const availableProviders = [
    ...(features.googleOAuth ? (["google"] as const) : []),
    ...(features.githubOAuth ? (["github"] as const) : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h2 className="mt-1 text-xl">Settings</h2>
      </div>

      <Card className="max-w-2xl pt-0">
        {/* v4 medium-fun app register: panel-colored header strips —
            except the danger zone, which stays neutral. */}
        <CardHeader className="border-b-2 bg-pop-yellow py-3.5">
          <p className="eyebrow">Profile</p>
          <CardTitle>Name and email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileForm name={session.user.name} />
          <EmailForm email={session.user.email} canSendEmail={features.email} />
        </CardContent>
      </Card>

      {hasPassword ? (
        <Card className="max-w-2xl pt-0">
          <CardHeader className="border-b-2 bg-pop-mint py-3.5">
            <p className="eyebrow">Security</p>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      ) : null}

      <Card className="max-w-2xl pt-0">
        <CardHeader className="border-b-2 bg-pop-sky py-3.5">
          <p className="eyebrow">Sign-in methods</p>
          <CardTitle>Connected accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectedAccounts
            available={availableProviders}
            linked={linkedProviders}
            hasPassword={hasPassword}
          />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <p className="eyebrow">Danger zone</p>
          <CardTitle>Delete account</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccount
            hasPassword={hasPassword}
            canSendEmail={features.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
