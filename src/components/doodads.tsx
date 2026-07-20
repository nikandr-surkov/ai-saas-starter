import { cn } from "@/lib/utils";

// Inline-SVG doodads (DESIGN.md v3): sparkles, asterisk bursts, one
// squiggle. Max 2–3 per section, ink or panel colors, decorative only
// (aria-hidden). Sparkles carry the one sanctioned slow loop (twinkle).

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("twinkle size-5 fill-current", className)}
    >
      <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4L12 0z" />
    </svg>
  );
}

export function Asterisk({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-6 stroke-current", className)}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    >
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    </svg>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 12"
      className={cn("h-3 w-28 stroke-current", className)}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    >
      <path d="M2 8q10-6 20 0t20 0 20 0 20 0 20 0t16 0" />
    </svg>
  );
}
