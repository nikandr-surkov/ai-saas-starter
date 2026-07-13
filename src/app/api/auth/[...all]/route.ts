import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth owns this entire surface. Do not add logic here (AGENTS.md) —
// signup side-effects belong in databaseHooks in src/lib/auth/index.ts.
export const { GET, POST } = toNextJsHandler(auth);
