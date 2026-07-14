import Link from "next/link";
import { StarIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#code", label: "Code" },
  { href: "/#ai-native", label: "AI-native" },
  { href: "/#pro", label: "Pro" },
] as const;

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-[60px] w-full max-w-[1160px] items-center gap-7 px-6">
        <Link href="/" className="font-mono text-[13px] font-medium">
          <span aria-hidden className="text-primary">
            ▮
          </span>{" "}
          {siteConfig.name}
        </Link>
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {/* Star count is a constant until the repo is public (M7). */}
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-sm border border-rule px-3 py-1.5 font-mono text-xs transition-colors hover:bg-secondary"
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
