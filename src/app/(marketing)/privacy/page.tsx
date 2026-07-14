import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  robots: { index: false },
};

// Placeholder legal copy — replace with a real policy before launch.
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pt-24 pb-26">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 mb-6 text-3xl">Privacy policy</h1>
      <div className="space-y-4 text-[15px] text-muted-foreground">
        <p>
          Template placeholder. Before launching, replace this page with a
          policy that reflects what your deployment actually does with user
          data.
        </p>
        <p>
          What this codebase touches out of the box: account data (name, email,
          password hash) in your Postgres via Better Auth; payment data handled
          by Stripe (card numbers never reach this app); generated images in
          your storage; transactional email via Resend when configured. No
          analytics are bundled.
        </p>
      </div>
    </div>
  );
}
