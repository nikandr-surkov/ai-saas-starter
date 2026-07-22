import { cn } from "@/lib/utils";

// v4.5 busy indicator (DESIGN.md app register): our 4-point sparkle,
// ink, spinning 0.9s linear — never a default spinner. The animation
// lives behind the reduced-motion gate in globals.css.
export function SparkleSpinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("sparkle-spin size-4 fill-current", className)}
    >
      <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4L12 0z" />
    </svg>
  );
}
