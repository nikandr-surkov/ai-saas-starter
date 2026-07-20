import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";

// v4.1 footer — a destination, not an afterthought: full-width ink block,
// giant Archivo wordmark with the yellow offset shadow, chunky mono link
// chips with the nav hover physics, the mascot in the corner. Light-on-
// ink text stays >=4.5:1 (canvas/ink 17.8, on-ink-muted 10.3).
const columns = [
  {
    title: "Product",
    links: [
      { label: "sign in", href: "/login" },
      { label: "sign up", href: "/signup" },
      { label: "pricing", href: "/pricing" },
    ],
  },
  {
    title: "Repo",
    links: [
      { label: "github", href: siteConfig.github, external: true },
      { label: "pro version", href: siteConfig.pro, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "privacy", href: "/privacy" },
      { label: "terms", href: "/terms" },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-foreground text-background [--muted-ink:var(--on-ink-muted)] [--title-shadow:var(--pop-yellow)]">
      <div className="mx-auto w-full max-w-[1160px] px-6 pt-16 pb-10">
        <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-12">
          <div className="max-w-full">
            <p className="font-display text-[clamp(3rem,1.6rem+3.5vw,6rem)] leading-none tracking-tight uppercase [text-shadow:0.05em_0.05em_0_var(--title-shadow)]">
              ai-saas-
              <br />
              starter
            </p>
            <p className="mt-6 font-mono text-xs">
              Built by{" "}
              <a
                href="https://nikandr.com"
                target="_blank"
                rel="noreferrer"
                className="marker-hover underline underline-offset-4 hover:text-foreground"
              >
                Nikandr Surkov
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-10">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="eyebrow mb-3.5">{column.title}</p>
                <ul className="flex flex-col items-start gap-2.5">
                  {column.links.map((link) =>
                    "external" in link && link.external ? (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="chip inline-block px-3.5 py-1 font-mono text-xs text-foreground"
                        >
                          {link.label}
                        </a>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="chip inline-block px-3.5 py-1 font-mono text-xs text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
          <p className="font-mono text-[10.5px] tracking-wider text-muted-foreground">
            © 2026 {siteConfig.name} · MIT license · ledger-true since day one
          </p>
          <Image
            src="/illustrations/mascot-hello.png"
            alt="Gold coin mascot with sunglasses pushed up, waving goodbye"
            width={72}
            height={72}
            className="size-18"
          />
        </div>
      </div>
    </footer>
  );
}
