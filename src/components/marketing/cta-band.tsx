import Link from "next/link";

import { siteConfig } from "@/config/site";

// v4 closing band: full-bleed ink, light text, yellow title shadow — the
// one sanctioned inversion (canvas border/shadow on the CTA, since ink on
// ink is invisible; documented in DESIGN.md hard rule 3).
export function CtaBand() {
  return (
    <div className="border-t-[3px] bg-foreground text-background [--muted-ink:var(--on-ink-muted)] [--title-shadow:var(--pop-yellow)]">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center justify-between gap-10 px-6 py-20">
        <div>
          <p className="eyebrow">Closing entry</p>
          <h2 className="text-title mt-4">Clone the ledger.</h2>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link
            href="/signup"
            className="border-emph inline-flex items-center rounded-md border-background bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-[translate] [box-shadow:6px_6px_0_0_var(--background)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            Start free
          </Link>
          <a
            href={siteConfig.pro}
            target="_blank"
            rel="noreferrer"
            className="chip px-3.5 py-1.5 font-mono text-xs tracking-wider text-foreground uppercase"
          >
            Pro version · $299 →
          </a>
        </div>
      </div>
    </div>
  );
}
