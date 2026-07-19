import { cn } from "@/lib/utils";

// The hero art: a compact credit_transactions register, staggered in with
// the same ledger-in keyframes LedgerTable's animated mode uses (mockup
// layout: type · ref · amount with head/foot bands). The rows mirror real
// ledger semantics — refund follows a failed spend, expiry renders debit —
// and the closing balance is genuinely the sum of the rows.

const rows = [
  { type: "subscription_grant", ref: "in_2K9f… · invoice.paid", amount: 200 },
  { type: "spend", ref: "gen_8xk2… · image", amount: -1 },
  { type: "spend", ref: "gen_8xk3… · image", amount: -1 },
  { type: "refund", ref: "gen_8xk3… · provider_err", amount: 1 },
  { type: "topup", ref: "cs_a1B2… · checkout", amount: 100 },
  { type: "spend", ref: "gen_9mp1… · image", amount: -1 },
  { type: "expiry", ref: "period_2026_06", amount: -12 },
] as const;

const balance = rows.reduce((sum, row) => sum + row.amount, 0);

function amountClass(row: (typeof rows)[number]): string {
  if (row.type === "expiry") return "text-destructive";
  return row.amount > 0 ? "text-primary-text" : "text-foreground";
}

function formatAmount(amount: number): string {
  return amount > 0 ? `+${amount}` : `−${Math.abs(amount)}`;
}

export function HeroLedger() {
  return (
    <div
      aria-label="Credit transactions ledger demo"
      className="rounded-md border-2 bg-background font-mono shadow-hard text-[11.5px]"
    >
      <div className="flex items-center justify-between border-b-2 border-rule px-4 py-3">
        <span className="font-medium tracking-wider">credit_transactions</span>
        <span className="flex items-center gap-1.5 text-primary-text">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse"
          />
          LIVE
        </span>
      </div>
      <ul>
        {rows.map((row, i) => (
          <li
            key={`${row.type}-${row.ref}`}
            className="grid grid-cols-[100px_1fr_64px] gap-3 border-b-2 px-4 py-2.5 whitespace-nowrap motion-safe:animate-[ledger-in_500ms_ease-out_both]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="overflow-hidden text-ellipsis text-muted-foreground">
              {row.type}
            </span>
            <span className="overflow-hidden text-ellipsis text-muted-foreground">
              {row.ref}
            </span>
            <span className={cn("text-right", amountClass(row))}>
              {formatAmount(row.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t-2 border-rule px-4 py-3">
        <span className="text-muted-foreground">balance = Σ(amount)</span>
        <span className="text-primary-text">{balance} ✓ invariant holds</span>
      </div>
    </div>
  );
}
