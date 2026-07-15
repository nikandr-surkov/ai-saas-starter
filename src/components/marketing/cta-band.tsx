import { siteConfig } from "@/config/site";

export function CtaBand() {
  return (
    <div className="mt-26 border-t-2 border-rule bg-secondary">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center justify-between gap-8 px-6 py-18">
        <div>
          <p className="eyebrow">Closing entry</p>
          <h2 className="mt-3 text-3xl">Clone the ledger. Ship the SaaS.</h2>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Get the code — free
          </a>
          <a
            href={siteConfig.pro}
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule pb-0.5 font-mono text-xs tracking-wider text-foreground uppercase transition-colors hover:border-foreground"
          >
            Pro version · $299 →
          </a>
        </div>
      </div>
    </div>
  );
}
