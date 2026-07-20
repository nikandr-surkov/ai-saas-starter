import Link from "next/link";
import { StarIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

import { Sparkle, Squiggle } from "@/components/doodads";
import { Sticker } from "@/components/sticker";

import { CopyInstall } from "./copy-install";
import { HeroLedger } from "./hero-ledger";

export function Hero() {
  return (
    <header className="mx-auto w-full max-w-[1160px] px-6 pt-24 pb-22">
      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-3">
            <Sticker color="mint" className="rotate-2">
              MIT · Open source
            </Sticker>
            <Sparkle className="text-pop-orange" />
          </div>
          <h1 className="text-display mt-5 mb-4">
            Auth, Stripe subscriptions, and a{" "}
            <span className="text-pop-shadow">credits ledger</span>{" "}
            that survives webhook retries.
          </h1>
          <p className="mb-7 max-w-[52ch] text-lg text-muted-foreground">
            A complete AI-SaaS foundation — Better Auth, Drizzle, atomic credit
            accounting, and one AI image endpoint — built to be extended with
            Claude Code, Cursor, or Codex. AGENTS.md included.
          </p>
          <div className="mb-7 flex flex-wrap items-center gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md border-2 press bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground"
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
          <Squiggle className="mt-6 text-pop-pink" />
        </div>
        <div className="relative">
          {/* Hero stickers per DESIGN.md v3 placements. */}
          <Sticker className="absolute -top-4 -right-2 z-10">
            10 free credits
          </Sticker>
          <HeroLedger />
        </div>
      </div>
    </header>
  );
}
