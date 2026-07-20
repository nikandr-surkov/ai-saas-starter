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
      <div className="flex flex-wrap gap-1.5">
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={cn(
              "border-hard flex items-center justify-center rounded-lg bg-background font-mono shadow-hard-sm",
              size === "lg" ? "size-12 text-2xl" : "size-8 text-sm",
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
