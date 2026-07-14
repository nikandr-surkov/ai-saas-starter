import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  robots: { index: false },
};

// Placeholder legal copy — replace with real terms before launch.
export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pt-24 pb-26">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 mb-6 text-3xl">Terms of service</h1>
      <div className="space-y-4 text-[15px] text-muted-foreground">
        <p>
          Template placeholder. Before launching, replace this page with terms
          that match your product, jurisdiction, and refund policy.
        </p>
        <p>
          The codebase itself is MIT-licensed — see LICENSE in the repository.
          These terms govern your deployed service, not the source code.
        </p>
      </div>
    </div>
  );
}
