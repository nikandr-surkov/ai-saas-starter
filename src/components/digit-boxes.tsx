import { cn } from "@/lib/utils";

// Big-number boxes (DESIGN.md v3.1): each character in its own 2px-bordered
// square, Martian Mono, sm shadow (chip tier) — countdown style. Dashboard
// balance and pricing prices.
export function DigitBoxes({
  value,
  label,
  size = "lg",
  className,
}: {
  value: string | number;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const chars = String(value).split("");
  return (
    <div className={className}>
      {/* Never wraps (DESIGN.md v4.3) — boxes shrink responsively so
          "$29/mo" always renders as one row. */}
      <div className="flex flex-nowrap gap-1.5">
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={cn(
              "border-hard flex items-center justify-center rounded-lg bg-background font-mono shadow-hard-sm",
              size === "lg"
                ? "size-10 text-xl sm:size-12 sm:text-2xl"
                : "size-7 text-[13px] sm:size-8 sm:text-sm",
            )}
          >
            {char}
          </span>
        ))}
      </div>
      {label ? <p className="eyebrow mt-2.5">{label}</p> : null}
    </div>
  );
}
