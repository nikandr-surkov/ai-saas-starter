import {
  ClipboardListIcon,
  FolderLockIcon,
  PaletteIcon,
  ShieldIcon,
  TerminalIcon,
} from "lucide-react";

import { IconChip } from "@/components/icon-chip";

const tree = [
  ["AGENTS.md", "# commands, boundaries, done-criteria", true],
  ["CLAUDE.md", "# @AGENTS.md + plan-mode rules", true],
  ["DESIGN.md", "# tokens + hard rules", true],
  [".claude/", "", false],
  ["├── settings.json", '# hooks: no "done" until typecheck passes', false],
  ["├── rules/billing.md", "# scoped: never weaken webhook checks", false],
  ["├── skills/", "# /add-feature /add-ai-provider /db-migration", false],
  ["└── agents/code-reviewer.md", "# read-only security reviewer", false],
  [".cursor/rules/", "# mirrored .mdc rules", false],
  ["specs/TEMPLATE.md", "# spec-driven workflow", false],
] as const;

// v4.3 icon-chip checklist — no bare glyphs (DESIGN.md IconChip rule).
const checklist = [
  {
    icon: TerminalIcon,
    text: "Agents run the right commands — pnpm, drizzle-kit, stripe listen",
  },
  {
    icon: ShieldIcon,
    text: "Hard rules enforced by hooks, not vibes: ledger stays append-only",
  },
  {
    icon: FolderLockIcon,
    text: "Path-scoped rules load only when billing or schema files are touched",
  },
  {
    icon: PaletteIcon,
    text: "Design tokens as guardrails — extensions stay on-brand automatically",
  },
  {
    icon: ClipboardListIcon,
    text: 'Spec template turns "add teams" into a reviewable plan first',
  },
] as const;

export function AiNative() {
  return (
    <section
      id="ai-native"
      className="scroll-mt-16 border-t-[3px] bg-pop-sky [--title-shadow:var(--canvas)]"
    >
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-11">
          <p className="eyebrow">AI-native</p>
          <h2 className="text-title mt-4">Built for AI agents.</h2>
          <p className="mt-4 max-w-[52ch]">
            One <span className="chip-mono text-foreground">AGENTS.md</span>{" "}
            briefs Claude Code, Cursor, Codex, Copilot — guardrails included.
          </p>
        </div>
        <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_1fr]">
          {/* overflow-x-auto: long tree comments scroll instead of clipping. */}
          <div className="border-hard pop-in tilt-l overflow-x-auto rounded-md bg-background px-5 py-5 font-mono text-xs leading-8 font-light shadow-hard">
            {tree.map(([name, comment, highlight]) => (
              <div key={name} className="whitespace-nowrap">
                <span className={highlight ? "text-primary-text" : ""}>
                  {name}
                </span>
                {comment ? (
                  <span className="text-muted-foreground"> {comment}</span>
                ) : null}
              </div>
            ))}
          </div>
          <ul>
            {checklist.map((item) => (
              <li
                key={item.text}
                className="group flex items-center gap-4 border-b-2 py-3.5 text-xl font-semibold transition-transform last:border-0 motion-safe:hover:translate-x-1"
              >
                <IconChip
                  icon={item.icon}
                  className="transition-colors group-hover:bg-pop-yellow"
                />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
