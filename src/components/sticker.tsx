import { cn } from "@/lib/utils";

// Sticker (DESIGN.md v3.1): pill, panel-color background, 2px ink border,
// sm shadow (badge tier), slight rotation, tiny one-shot wobble on hover.
// Placements are specified in DESIGN.md — use sparingly.

const colors = {
  yellow: "bg-pop-yellow",
  mint: "bg-pop-mint",
  pink: "bg-pop-pink",
  sky: "bg-pop-sky",
  orange: "bg-pop-orange",
} as const;

export function Sticker({
  color = "yellow",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { color?: keyof typeof colors }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-2 rounded-full border-2 px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-widest text-foreground uppercase shadow-hard-sm motion-safe:hover:animate-[wobble_200ms_ease-in-out]",
        colors[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
