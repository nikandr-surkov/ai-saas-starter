"use client";

import * as React from "react";

import Link from "next/link";

// Route-segment error boundary — renders inside the root layout, so the
// theme and fonts still apply. Errors surface as human sentences with a
// next step; the digest stays in the server logs, not in the UI.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="eyebrow">Unexpected entry</p>
      <h1 className="text-display">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">
        The error is logged on our side. Try again — and if it keeps
        happening, head back home. Your credits and data are safe.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="press inline-flex items-center rounded-md border-2 bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground"
        >
          Try again
        </button>
        <Link
          href="/"
          className="press inline-flex items-center rounded-md border-2 bg-background px-5 py-3 text-[15px] font-semibold"
        >
          Back to safety
        </Link>
      </div>
    </div>
  );
}
