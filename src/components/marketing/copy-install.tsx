"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// v4.5: no inner scrollbar, ever. Desktop shows the full command on one
// line; below the fit breakpoint a MIDDLE-ELLIPSIZED display version
// takes over ("git clone …/repo.git") — display only, the copy action
// always copies the full command. Click copies (pop-mint + check for
// 1.5s, aria-live), full chip physics, keyboard accessible.
export function CopyInstall({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);
  const shortCommand = command.replace(/https?:\/\/\S+\//, "…/");

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
    // Container query: the full command shows only when the chip's OWN
    // available width fits it — no breakpoint guessing, no clipping.
    <div className="@container max-w-full min-w-0">
      <button
        type="button"
        onClick={copy}
        className={cn(
          "chip flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-4 overflow-hidden rounded-md px-4 py-2.5 text-left font-mono text-xs",
          copied && "bg-pop-mint hover:bg-pop-mint",
        )}
      >
        {/* End-ellipsis is the last-resort fallback on ultra-narrow
            screens — never a scroll region. */}
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span aria-hidden className="select-none">
            ${" "}
          </span>
          <span className="hidden @min-[39rem]:inline">{command}</span>
          <span aria-hidden className="@min-[39rem]:hidden">
            {shortCommand}
          </span>
        </span>
        <span
          aria-live="polite"
          className="flex items-center gap-1 text-[11px]"
        >
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
    </div>
  );
}
