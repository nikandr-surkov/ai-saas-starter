import Link from "next/link";

import { siteConfig } from "@/config/site";

export function MarketingFooter() {
  return (
    <footer className="border-t-2">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-3 px-6 pt-7 pb-10 font-mono text-[10.5px] tracking-wider text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span aria-hidden className="text-primary-text">
            ▮
          </span>{" "}
          {siteConfig.name} · MIT · 2026
        </span>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            sign in
          </Link>
          <Link
            href="/signup"
            className="transition-colors hover:text-foreground"
          >
            sign up
          </Link>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            github
          </a>
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground"
          >
            pricing
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            terms
          </Link>
          <a
            href={siteConfig.pro}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            nikandr.com
          </a>
        </nav>
      </div>
    </footer>
  );
}
