import { siteConfig } from "@/config/site";

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-6 py-10 font-mono text-xs tracking-wider text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
        <p>{siteConfig.name} · MIT</p>
        <nav className="flex gap-6">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href={siteConfig.pro}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Pro version
          </a>
        </nav>
      </div>
    </footer>
  );
}
