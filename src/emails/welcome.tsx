import { WELCOME_CREDITS } from "@/config/plans";

import { EmailButton } from "./components/button";
import {
  EmailHeading,
  EmailLayout,
  EmailMuted,
  EmailText,
  emailTheme,
} from "./components/layout";

export default function WelcomeEmail({
  name = "there",
  appUrl = "http://localhost:3000",
}: {
  name?: string;
  appUrl?: string;
}) {
  return (
    <EmailLayout preview={`${WELCOME_CREDITS} credits are on your account.`}>
      <EmailHeading>Welcome, {name}.</EmailHeading>
      <EmailText>
        Your account is live and{" "}
        <span style={{ color: emailTheme.accent, fontWeight: 600 }}>
          {WELCOME_CREDITS} welcome credits
        </span>{" "}
        are already on it — enough to generate your first images. Each
        generation costs 1 credit; failed generations are refunded
        automatically.
      </EmailText>
      <EmailButton href={`${appUrl}/generate`}>
        Generate your first image
      </EmailButton>
      <EmailMuted>
        Credits never expire. When you run out, plans and top-ups live under
        Billing.
      </EmailMuted>
    </EmailLayout>
  );
}
