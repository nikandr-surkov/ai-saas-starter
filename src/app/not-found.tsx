import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <Image
        src="/illustrations/mascot-lost.png"
        alt="Gold coin mascot shrugging beside a question mark"
        width={140}
        height={140}
      />
      <p className="eyebrow">Entry not found</p>
      <h1 className="text-display">404</h1>
      <p className="max-w-md text-muted-foreground">
        This page is not in the ledger — the address may have moved or never
        existed. Your account and credits are unaffected.
      </p>
      <Link
        href="/"
        className="press inline-flex items-center rounded-md border-2 bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground"
      >
        Back to safety
      </Link>
    </div>
  );
}
