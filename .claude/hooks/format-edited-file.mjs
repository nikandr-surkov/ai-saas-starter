// PostToolUse hook: run Prettier on the file Claude just wrote or edited.
// Receives the tool call as JSON on stdin. Exits 0 always — formatting is
// best-effort and must never block the agent.
import { spawnSync } from "node:child_process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

spawnSync(
  "pnpm",
  ["exec", "prettier", "--write", "--ignore-unknown", filePath],
  {
    stdio: "ignore",
    shell: process.platform === "win32",
  },
);
process.exit(0);
