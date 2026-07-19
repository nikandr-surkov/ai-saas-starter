import { cn } from "@/lib/utils";

// Signature v2 element (DESIGN.md hard rule 6): ONE rotated sticker per
// page, maximum. Highlight background, 2px ink border, pill shape, tiny
// one-shot wobble on hover.
export function Sticker({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-block -rotate-2 rounded-full border-2 bg-highlight px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-widest text-on-accent uppercase shadow-hard motion-safe:hover:animate-[wobble_200ms_ease-in-out]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
