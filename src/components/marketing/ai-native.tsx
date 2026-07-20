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
    <section
      id="ai-native"
      className="scroll-mt-16 border-t-[3px] bg-pop-sky [--title-shadow:var(--canvas)]"
    >
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="fade-up mb-11">
          <p className="eyebrow">AI-native</p>
          <h2 className="text-title mt-4">Built for AI agents.</h2>
          <p className="mt-4 max-w-[52ch] text-muted-foreground">
            One AGENTS.md briefs Claude Code, Cursor, Codex, Copilot —
            guardrails included.
          </p>
        </div>
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div className="border-hard rounded-md bg-background px-5 py-5 font-mono text-xs leading-8 font-light shadow-hard">
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
