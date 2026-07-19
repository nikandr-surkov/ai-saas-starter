import Link from "next/link";
import { StarIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

import { CopyInstall } from "./copy-install";
import { HeroLedger } from "./hero-ledger";

export function Hero() {
  return (
    <header className="mx-auto w-full max-w-[1160px] px-6 pt-24 pb-22">
      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Open source · MIT · Next.js 16</p>
          <h1 className="text-display mt-5 mb-4">
            Auth, Stripe subscriptions, and a{" "}
            <span className="text-primary">credits ledger</span> that survives
            webhook retries.
          </h1>
          <p className="mb-7 max-w-[52ch] text-lg text-muted-foreground">
            A complete AI-SaaS foundation — Better Auth, Drizzle, atomic credit
            accounting, and one AI image endpoint — built to be extended with
            Claude Code, Cursor, or Codex. AGENTS.md included.
          </p>
          <div className="mb-7 flex flex-wrap items-center gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Start free — 10 credits
            </Link>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border-b border-rule pb-0.5 font-mono text-xs tracking-wider text-foreground uppercase transition-colors hover:border-foreground"
            >
              <StarIcon className="size-3.5" aria-hidden />
              Star on GitHub →
            </a>
          </div>
          <CopyInstall command={`git clone ${siteConfig.github}.git`} />
        </div>
        <HeroLedger />
      </div>
    </header>
  );
}
