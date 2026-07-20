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

const checklist = [
  "Agents run the right commands — pnpm, drizzle-kit, stripe listen",
  "Hard rules enforced by hooks, not vibes: ledger stays append-only",
  "Path-scoped rules load only when billing or schema files are touched",
  "Design tokens as guardrails — extensions stay on-brand automatically",
  'Spec template turns "add teams" into a reviewable plan first',
] as const;

export function AiNative() {
  return (
    <section id="ai-native" className="mt-26 scroll-mt-16 border-y-2 bg-pop-sky">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
      <div className="fade-up mb-11 max-w-[62ch]">
        <p className="eyebrow">Built for agents</p>
        <h2 className="mt-3 mb-3 text-3xl">
          Your AI assistant gets a briefing,{" "}
          <span className="marker">guardrails</span>, and a definition of done.
        </h2>
        <p className="text-muted-foreground">
          Works with Claude Code, Cursor, Codex, Copilot, Gemini CLI — one
          AGENTS.md as source of truth.
        </p>
      </div>
      <div className="grid items-start gap-14 lg:grid-cols-2">
        <div className="rounded-md border-2 bg-background px-5 py-5 font-mono text-xs leading-8 font-light shadow-hard">
          {tree.map(([name, comment, highlight]) => (
            <div key={name} className="whitespace-nowrap">
              <span className={highlight ? "text-primary-text" : ""}>{name}</span>
              {comment ? (
                <span className="text-muted-foreground"> {comment}</span>
              ) : null}
            </div>
          ))}
        </div>
        <ul>
          {checklist.map((item) => (
            <li
              key={item}
              className="border-b-2 py-2.5 text-[15.5px] last:border-0"
            >
              <span aria-hidden className="font-mono text-primary-text">
                ✓{" "}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  );
}
