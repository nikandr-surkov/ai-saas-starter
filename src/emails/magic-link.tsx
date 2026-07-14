import { EmailButton } from "./components/button";
import {
  EmailHeading,
  EmailLayout,
  EmailMuted,
  EmailText,
} from "./components/layout";

export default function MagicLinkEmail({
  url = "http://localhost:3000/api/auth/magic-link/verify?token=example",
}: {
  url?: string;
}) {
  return (
    <EmailLayout preview="Your sign-in link — expires in five minutes.">
      <EmailHeading>Your sign-in link</EmailHeading>
      <EmailText>One click signs you in. No password needed.</EmailText>
      <EmailButton href={url}>Sign in</EmailButton>
      <EmailMuted>
        The link expires in five minutes and works once. If you did not request
        it, ignore this email.
      </EmailMuted>
    </EmailLayout>
  );
}
