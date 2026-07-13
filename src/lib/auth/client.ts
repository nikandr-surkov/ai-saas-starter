import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

// Browser-side auth client. Which sign-in options render is decided by
// server components reading `features` (src/lib/env.ts) and passing flags
// down — this client never reads env.
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});
