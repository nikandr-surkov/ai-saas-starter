import { cn } from "@/lib/utils";

// v4.5 skeleton system (DESIGN.md calm register): cream block, 2px ink
// border at 25%, radius matched per use via className, ONE shared
// shimmer (1.2s linear, defined in globals.css behind the
// reduced-motion gate — static block otherwise).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-shimmer rounded-lg border-2 border-foreground/25 bg-background",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
