"use client";

import * as React from "react";

export function CopyInstall({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions, http) — nothing to do.
    }
  }

  return (
    <div className="inline-flex items-center gap-4 rounded-md border-2 bg-secondary px-4 py-2.5 font-mono text-xs">
      <span className="whitespace-nowrap">
        <span aria-hidden className="text-primary-text select-none">
          ${" "}
        </span>
        {command}
      </span>
      <button
        type="button"
        onClick={copy}
        className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copy install command"
      >
        {copied ? "[copied]" : "[copy]"}
      </button>
    </div>
  );
}
