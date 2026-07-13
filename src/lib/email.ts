import { Resend } from "resend";

import { env, features } from "@/lib/env";

// Plain-text transactional email. M6 replaces the bodies with React Email
// templates in src/emails/ — this wrapper's contract stays the same.
// Without RESEND_API_KEY the send is a no-op with a console warning
// (graceful degradation, see AGENTS.md gotchas). Never log the body or
// URLs — they contain single-use tokens.

const resend = features.email ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY is not set — "${subject}" to ${to} was not sent.`,
    );
    return;
  }
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
  });
  if (error) {
    throw new Error(`Email "${subject}" failed to send: ${error.message}`);
  }
}
