import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="grid gap-4">
        <p className="eyebrow">Reset password</p>
        <p className="text-sm text-muted-foreground">
          This link is missing its token — request a fresh one from the{" "}
          <Link
            href="/forgot-password"
            className="text-primary underline underline-offset-4"
          >
            reset page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Reset password</p>
        <h1 className="mt-2 text-2xl">Choose a new password</h1>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
