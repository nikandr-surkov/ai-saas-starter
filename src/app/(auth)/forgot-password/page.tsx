import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Reset password</p>
        <h1 className="mt-2 text-2xl">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we send a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
