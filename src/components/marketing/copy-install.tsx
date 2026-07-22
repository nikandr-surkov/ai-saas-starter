"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// v4.1: the git-clone chip is a real button — click copies the command,
// the chip flips to pop-mint with a check for 1.5s. Full chip physics
// (hover yellow + lift + sm shadow), keyboard accessible, aria-live
// announces the copied state.
export function CopyInstall({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (permissions, http) — nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "chip flex min-w-0 max-w-full cursor-pointer items-center gap-4 rounded-md px-4 py-2.5 text-left font-mono text-xs",
        copied && "bg-pop-mint hover:bg-pop-mint",
      )}
    >
      {/* Long command scrolls inside the chip — never widens the page. */}
      <span className="min-w-0 overflow-x-auto whitespace-nowrap">
        <span aria-hidden className="select-none">
          ${" "}
        </span>
        {command}
      </span>
      <span aria-live="polite" className="flex items-center gap-1 text-[11px]">
        {copied ? (
          <>
            <CheckIcon className="size-3.5" aria-hidden />
            copied!
          </>
        ) : (
          "[copy]"
        )}
      </span>
    </button>
  );
}
