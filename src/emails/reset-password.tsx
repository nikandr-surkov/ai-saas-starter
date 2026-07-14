import { EmailButton } from "./components/button";
import {
  EmailHeading,
  EmailLayout,
  EmailMuted,
  EmailText,
} from "./components/layout";

export default function ResetPasswordEmail({
  url = "http://localhost:3000/reset-password?token=example",
}: {
  url?: string;
}) {
  return (
    <EmailLayout preview="Reset your password — the link expires in one hour.">
      <EmailHeading>Reset your password</EmailHeading>
      <EmailText>
        Someone — hopefully you — asked to reset the password for this account.
      </EmailText>
      <EmailButton href={url}>Choose a new password</EmailButton>
      <EmailMuted>
        The link expires in one hour. If you did not request a reset, ignore
        this email; your password stays as it is.
      </EmailMuted>
    </EmailLayout>
  );
}
