import { cn } from "@/lib/utils";

// Sticker (DESIGN.md v4.1): pill, panel-color background, ink border, sm
// shadow, slight rotation. STATIC — badges are decorative and don't react
// to hover; wobble belongs to entrance choreography only.

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
        "border-hard inline-block -rotate-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-widest text-foreground uppercase shadow-hard-sm",
        colors[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
