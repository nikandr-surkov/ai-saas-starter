// Stop hook: block the agent from finishing while the repo has type errors.
// Exit 2 feeds stderr back to Claude as a blocking message.
import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["exec", "tsc", "--noEmit"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  console.error(
    `pnpm typecheck failed — fix these before finishing:\n${output.slice(0, 4000)}`,
  );
  process.exit(2);
}
process.exit(0);
