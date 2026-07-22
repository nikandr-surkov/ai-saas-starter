import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const colors = {
  cream: "bg-background",
  yellow: "bg-pop-yellow",
  mint: "bg-pop-mint",
  sky: "bg-pop-sky",
  pink: "bg-pop-pink",
  orange: "bg-pop-orange",
} as const;

// v4.3 icon chip — the standard marketing list marker (DESIGN.md):
// small bordered square, panel-color bg, lucide icon in ink stroke.
// Plain ✓/·/— glyphs are banned in marketing lists.
export function IconChip({
  icon: Icon,
  color = "cream",
  className,
}: {
  icon: LucideIcon;
  color?: keyof typeof colors;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[8px] border-2 shadow-hard-sm",
        colors[color],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.5} className="size-4.5" />
    </span>
  );
}
