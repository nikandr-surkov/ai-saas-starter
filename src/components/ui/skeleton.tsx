import { cn } from "@/lib/utils";

// Loading placeholder in the bordered style (DESIGN.md v3.1): the outline
// stays crisp while the fill pulses. Reduced motion shows a static block.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-lg border-2 border-border bg-secondary motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
