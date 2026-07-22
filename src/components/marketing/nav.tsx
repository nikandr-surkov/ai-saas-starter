import Link from "next/link";
import { StarIcon } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { LogoMark } from "@/components/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

import { MobileMenu } from "./nav-mobile";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#ai-native", label: "AI-native" },
  { href: "/#pro", label: "Pro" },
] as const;

// Auth-aware (server-side session): visitors get Sign in + Get started,
// signed-in users get one Dashboard button. This read makes marketing pages
// dynamic — see outputFileTracingIncludes in next.config.ts.
// v4.1: links are chip pills (bordered, cream, yellow-flip hover) — no
// underline/opacity/color-only hovers anywhere in the nav.
export async function MarketingNav() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b-[3px] bg-background">
      <div className="relative mx-auto flex h-[60px] w-full max-w-[1160px] items-center gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-[13px] font-medium"
        >
          <LogoMark className="size-5" />
          {siteConfig.name}
        </Link>
        {/* Chip nav needs lg width; tablets keep the drawer. */}
        <nav className="ml-auto hidden items-center gap-2.5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="chip px-3.5 py-1 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          {/* Star count is a constant until the repo has one worth showing. */}
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="border-hard press hidden items-center gap-2 rounded-md px-3 py-1.5 font-mono text-xs sm:flex"
          >
            <StarIcon className="size-3.5" aria-hidden />
            GitHub
          </a>
          <ThemeToggle />
          {session ? (
            <Link
              href="/dashboard"
              className="border-hard press rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="chip hidden px-3.5 py-1 text-sm font-medium sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="border-hard press rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                Get started
              </Link>
            </>
          )}
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
