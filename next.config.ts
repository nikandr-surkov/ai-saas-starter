import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing's code exhibit reads src/lib/credits/index.ts with fs at
  // render time (the auth-aware nav makes marketing pages dynamic). Include
  // the file in the traced output so the read works in production too.
  outputFileTracingIncludes: {
    "/": ["./src/lib/credits/index.ts"],
  },
};

export default nextConfig;
