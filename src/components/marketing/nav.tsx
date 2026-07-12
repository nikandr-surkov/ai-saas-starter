import Link from "next/link";
import { StarIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

// Anchor targets land with the full landing page in M6.
const links = [
  { href: "/#features", label: "Features" },
  { href: "/#ledger", label: "Ledger" },
  { href: "/#ai-native", label: "AI-native" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[1160px] items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-medium">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-xs tracking-wider uppercase transition-colors hover:bg-muted"
          >
            <StarIcon className="size-3.5" aria-hidden />
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
