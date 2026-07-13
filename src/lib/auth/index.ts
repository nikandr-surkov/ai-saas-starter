import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { grantWelcomeCredits } from "@/lib/credits";
import { sendEmail } from "@/lib/email";
import { env, features } from "@/lib/env";

// Server-side Better Auth instance. The HTTP surface is mounted at
// src/app/api/auth/[...all]/route.ts; session helpers live in ./session.
// OAuth providers and magic links are feature-flagged by env — a missing
// pair of keys hides that option instead of crashing (AGENTS.md gotchas).

const socialProviders: NonNullable<
  Parameters<typeof betterAuth>[0]["socialProviders"]
> = {};
if (features.googleOAuth && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}
if (features.githubOAuth && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  user: {
    additionalFields: {
      // Managed by the app, never by client input.
      stripeCustomerId: { type: "string", required: false, input: false },
      creditBalance: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: user.email, // current address must approve the change
          subject: "Approve your email change",
          text: `Confirm changing your account email to ${newEmail}:\n\n${url}\n\nIf you didn't request this, ignore this email.`,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          text: `This permanently deletes your account and data:\n\n${url}\n\nIf you didn't request this, ignore this email.`,
        });
      },
      beforeDelete: async () => {
        // M3: cancel the user's Stripe subscription here, before the DB
        // rows cascade away.
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Without Resend, verification emails can't be delivered — requiring
    // verification would brick signup. Degrade to unverified accounts in
    // keyless dev; production setups configure RESEND_API_KEY.
    requireEmailVerification: features.email,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset your password:\n\n${url}\n\nThe link expires in one hour. If you didn't request this, ignore this email.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: features.email,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Welcome. Verify your email address to activate your account:\n\n${url}`,
      });
    },
  },
  socialProviders,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Every new account gets 10 welcome credits through the ledger —
          // idempotent on welcome_{userId}. M3 adds Stripe customer
          // creation here (features.billing).
          await grantWelcomeCredits(user.id);
        },
      },
    },
  },
  plugins: features.email
    ? [
        magicLink({
          sendMagicLink: async ({ email, url }) => {
            await sendEmail({
              to: email,
              subject: "Your sign-in link",
              text: `Sign in to your account:\n\n${url}\n\nThe link expires in five minutes. If you didn't request this, ignore this email.`,
            });
          },
        }),
      ]
    : [],
});

export type Session = typeof auth.$Infer.Session;
