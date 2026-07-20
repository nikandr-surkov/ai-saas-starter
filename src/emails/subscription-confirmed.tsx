import { EmailButton } from "./components/button";
import {
  EmailHeading,
  EmailLayout,
  EmailMuted,
  EmailText,
  emailTheme,
} from "./components/layout";

export default function SubscriptionConfirmedEmail({
  planName = "Pro",
  monthlyCredits = 200,
  appUrl = "http://localhost:3000",
}: {
  planName?: string;
  monthlyCredits?: number;
  appUrl?: string;
}) {
  return (
    <EmailLayout
      preview={`${planName} is active — ${monthlyCredits} credits granted.`}
    >
      <EmailHeading>{planName} is active</EmailHeading>
      <EmailText>
        Your subscription is live and{" "}
        <span style={{ color: emailTheme.credit, fontWeight: 600 }}>
          {monthlyCredits} credits
        </span>{" "}
        have been added to your balance. The same amount arrives with every paid
        invoice. Credits accumulate — nothing expires.
      </EmailText>
      <EmailButton href={`${appUrl}/dashboard`}>Open the dashboard</EmailButton>
      <EmailMuted>
        Manage or cancel anytime under Billing — the customer portal handles
        plan changes, invoices, and payment methods.
      </EmailMuted>
    </EmailLayout>
  );
}
