import { EmailButton } from "./components/button";
import {
  EmailHeading,
  EmailLayout,
  EmailMuted,
  EmailText,
} from "./components/layout";

export default function VerifyEmail({
  url = "http://localhost:3000/api/auth/verify-email?token=example",
}: {
  url?: string;
}) {
  return (
    <EmailLayout preview="Verify your email address to activate your account.">
      <EmailHeading>Verify your email</EmailHeading>
      <EmailText>
        Confirm this address to activate your account and sign in.
      </EmailText>
      <EmailButton href={url}>Verify email address</EmailButton>
      <EmailMuted>
        If you did not create an account, ignore this email — nothing happens
        without the click.
      </EmailMuted>
    </EmailLayout>
  );
}
