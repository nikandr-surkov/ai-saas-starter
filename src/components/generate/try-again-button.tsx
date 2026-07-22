"use client";

import { Button } from "@/components/ui/button";

// v4.5 failed-tile action: prefills the prompt back into the form and
// scrolls to it — navigation only, never an auto-spend.
export function TryAgainButton({ prompt }: { prompt: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        const field = document.getElementById(
          "generate-prompt",
        ) as HTMLTextAreaElement | null;
        if (!field) return;
        field.value = prompt;
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        field.focus({ preventScroll: true });
      }}
    >
      Try again
    </Button>
  );
}
