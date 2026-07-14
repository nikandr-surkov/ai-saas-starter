import type { ReactElement } from "react";

import { render } from "@react-email/render";
import { Resend } from "resend";

import { env, features } from "@/lib/env";

// Transactional email. Templates live in src/emails/ (preview them with
// `pnpm email:dev`); plain-text callers may pass `text` instead of `react`.
// Without RESEND_API_KEY the send is a no-op with a console warning
// (graceful degradation, see AGENTS.md gotchas). Never log bodies or URLs —
// they contain single-use tokens.

const resend = features.email ? new Resend(env.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
} & ({ react: ReactElement; text?: never } | { text: string; react?: never });

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY is not set — "${input.subject}" to ${input.to} was not sent.`,
    );
    return;
  }

  const html = input.react ? await render(input.react) : undefined;
  const text = input.react
    ? await render(input.react, { plainText: true })
    : input.text;

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    ...(html ? { html, text: text as string } : { text: text as string }),
  });
  if (error) {
    throw new Error(
      `Email "${input.subject}" failed to send: ${error.message}`,
    );
  }
}
