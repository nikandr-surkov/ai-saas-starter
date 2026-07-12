"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

// Counterpart of the no-flash script in src/app/layout.tsx: toggles the
// `.dark` class on <html> and persists the choice. Icon swap is CSS-only
// (dark: variant), so server and client render identical markup.
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Private mode: theme still toggles for the session.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  );
}
