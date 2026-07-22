import { CircleCheckIcon, MinusIcon } from "lucide-react";

import { IconChip } from "@/components/icon-chip";
import { siteConfig } from "@/config/site";

// v4.3 Free-vs-Pro: two cards. The PRO column is a raised yellow panel
// (3px border, md shadow, lifted); cells use icon chips — no text glyphs.
const rows = [
  {
    capability: "Auth, subscriptions, credits ledger",
    free: { has: true, label: "Full" },
    pro: { has: true, label: "+ rollover, meters, packs" },
  },
  {
    capability: "AI generation",
    free: { has: true, label: "1 image provider" },
    pro: { has: true, label: "Image + video + audio × 7 providers" },
  },
  {
    capability: "Async job pipeline · webhooks · auto-refund",
    free: { has: false, label: "Not included" },
    pro: { has: true, label: "Inngest, durable" },
  },
  {
    capability: "Gallery + R2 storage · teams · admin",
    free: { has: false, label: "Not included" },
    pro: { has: true, label: "Included" },
  },
  {
    capability: "MCP server + extended agent skills",
    free: { has: true, label: "Core set" },
    pro: { has: true, label: "Full suite" },
  },
] as const;

function CompareRow({
  capability,
  cell,
}: {
  capability: string;
  cell: { has: boolean; label: string };
}) {
  return (
    <li className="flex items-center gap-4 border-b-2 py-3.5 last:border-0">
      <IconChip
        icon={cell.has ? CircleCheckIcon : MinusIcon}
        color={cell.has ? "mint" : "cream"}
        className={cell.has ? "" : "text-muted-foreground"}
      />
      <div>
        <p className="text-lg leading-snug font-semibold">{capability}</p>
        <p
          className={`text-lg leading-snug ${cell.has ? "" : "text-muted-foreground"}`}
        >
          {cell.label}
        </p>
      </div>
    </li>
  );
}

export function Compare() {
  return (
    <section id="pro" className="scroll-mt-16 border-t-[3px]">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-12">
          <p className="eyebrow">This repo is complete</p>
          <h2 className="text-title mt-4">Free vs Pro.</h2>
          <p className="mt-4 max-w-[52ch]">
            Pro is what comes after{" "}
            <span className="marker text-foreground">product-market fit</span>.
          </p>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="border-hard pop-in rounded-md bg-background p-7 shadow-hard">
            <span className="chip-mono text-sm">This repo</span>
            <ul className="mt-5">
              {rows.map((row) => (
                <CompareRow
                  key={row.capability}
                  capability={row.capability}
                  cell={row.free}
                />
              ))}
            </ul>
          </div>
          <div className="pop-in rounded-md border-[3px] bg-pop-yellow p-7 shadow-hard [--chip-hover:var(--pop-sky)] lg:-translate-y-3">
            <a
              href={siteConfig.pro}
              target="_blank"
              rel="noreferrer"
              className="chip inline-block px-4 py-1.5 font-mono text-sm font-semibold text-foreground"
            >
              PRO · $299
            </a>
            <ul className="mt-5">
              {rows.map((row) => (
                <CompareRow
                  key={row.capability}
                  capability={row.capability}
                  cell={row.pro}
                />
              ))}
            </ul>
            <a
              href={siteConfig.pro}
              target="_blank"
              rel="noreferrer"
              className="border-hard press mt-7 flex w-full items-center justify-center rounded-md bg-background px-5 py-3 text-[15px] font-semibold"
            >
              Get Pro →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
