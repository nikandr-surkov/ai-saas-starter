import { cn } from "@/lib/utils";

// Signature marketing pattern (DESIGN.md > Components > LedgerRow): features
// and lists render as numbered rows on ruled paper — never card grids. A list
// block opens with a 2px ink rule; rows separate with hairlines and take a
// soft green tint on hover (the one sanctioned green wash).

function LedgerList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("border-t-2 border-rule", className)} {...props} />;
}

type LedgerRowProps = React.ComponentProps<"li"> & {
  /** Mono row index, e.g. "01". */
  index: string;
  title: string;
  description?: string;
  /** Right-aligned mono uppercase metadata, e.g. "BETTER AUTH". */
  meta?: string;
};

function LedgerRow({
  index,
  title,
  description,
  meta,
  className,
  children,
  ...props
}: LedgerRowProps) {
  return (
    <li
      className={cn(
        "grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b-2 px-2 py-5 transition-[background-color,translate] hover:bg-accent-soft motion-safe:hover:translate-x-0.5 sm:grid-cols-[3rem_1fr_auto]",
        className,
      )}
      {...props}
    >
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
      <div className="space-y-1">
        <div className="font-medium">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
      {meta ? <span className="eyebrow hidden sm:block">{meta}</span> : null}
    </li>
  );
}

export { LedgerList, LedgerRow };
