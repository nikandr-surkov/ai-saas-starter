"use client";

import * as React from "react";

import { DigitBoxes } from "@/components/digit-boxes";

const DURATION_MS = 500;

// Sanctioned motion exception (DESIGN.md v3.1 hard rule 10): the dashboard
// balance counts up once on mount. Server-rendered output is the final
// value, so users without JS — and reduced-motion users, checked below —
// simply see the real number. padStart keeps the box count stable so the
// layout never jumps mid-count.
export function CountUpDigits({
  value,
  label,
  size,
  className,
}: React.ComponentProps<typeof DigitBoxes> & { value: number }) {
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    if (value <= 0) return;
    // All setState happens inside rAF callbacks: reduced motion snaps to
    // the final value on the first frame instead of counting.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (reduced) {
        setDisplay(value);
        return;
      }
      const progress = Math.min(1, (now - started) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <DigitBoxes
      value={String(display).padStart(String(value).length, "0")}
      label={label}
      size={size}
      className={className}
    />
  );
}
