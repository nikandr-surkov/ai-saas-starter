import { siteConfig } from "@/config/site";

// Free-vs-Pro in the ledger register. One outbound link, no upsell copy.
const rows = [
  {
    capability: "Auth, subscriptions, credits ledger",
    free: { kind: "yes", label: "✓ full" },
    pro: { kind: "yes", label: "✓ + rollover, meters, packs" },
  },
  {
    capability: "AI generation",
    free: { kind: "val", label: "1 image provider" },
    pro: { kind: "val", label: "image + video + audio × 7 providers" },
  },
  {
    capability: "Async job pipeline · webhooks · auto-refund",
    free: { kind: "no", label: "—" },
    pro: { kind: "yes", label: "✓ Inngest, durable" },
  },
  {
    capability: "Gallery + R2 storage · teams · admin",
    free: { kind: "no", label: "—" },
    pro: { kind: "yes", label: "✓" },
  },
  {
    capability: "MCP server + extended agent skills",
    free: { kind: "val", label: "core set" },
    pro: { kind: "yes", label: "✓ full suite" },
  },
] as const;

function cellClass(kind: "yes" | "no" | "val"): string {
  if (kind === "yes") return "font-mono text-xs text-primary";
  if (kind === "val") return "font-mono text-[11.5px]";
  return "text-muted-foreground";
}

export function Compare() {
  return (
    <section
      id="pro"
      className="mx-auto w-full max-w-[1160px] scroll-mt-16 px-6 pt-26"
    >
      <div className="mb-11 max-w-[62ch]">
        <p className="eyebrow">Free vs Pro</p>
        <h2 className="mt-3 text-3xl">
          This repo is complete. Pro is what comes after product-market fit.
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-t-2 border-rule">
          <thead>
            <tr className="text-left font-mono text-[10.5px] tracking-widest text-muted-foreground uppercase">
              <th className="border-b py-3.5 pr-2 font-normal">Capability</th>
              <th className="w-[190px] border-b px-2 py-3.5 text-center font-normal">
                Free · this repo
              </th>
              <th className="w-[240px] border-b px-2 py-3.5 text-center font-normal">
                Pro ·{" "}
                <a
                  href={siteConfig.pro}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary normal-case underline underline-offset-4"
                >
                  nikandr.com
                </a>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.capability}>
                <td className="border-b py-3.5 pr-2 text-[15px]">
                  {row.capability}
                </td>
                <td
                  className={`border-b px-2 py-3.5 text-center ${cellClass(row.free.kind)}`}
                >
                  {row.free.label}
                </td>
                <td
                  className={`border-b px-2 py-3.5 text-center ${cellClass(row.pro.kind)}`}
                >
                  {row.pro.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
