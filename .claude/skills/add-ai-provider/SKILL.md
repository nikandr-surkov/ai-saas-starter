---
name: add-ai-provider
description: Implement the image-generation provider interface for a new provider (fal, Replicate, direct OpenAI, ...). Use when swapping or adding an AI provider.
---

# Add an AI provider

The contract lives in `src/lib/ai/provider.ts`:

```ts
generateImage({ prompt, userId }): Promise<{ url; width; height; model }>;
```

The default implementation is `src/lib/ai/gateway.ts` (Vercel AI Gateway).
Read both files before writing anything.

## Steps

1. **Ask the user first** — a new provider almost always means a new
   dependency, and dependencies need approval (AGENTS.md).
2. Create `src/lib/ai/<provider>.ts` exporting an object that satisfies the
   `ImageProvider` interface. Keep it thin: call the API, normalize the
   response to `{ url, width, height, model }`, throw on failure.
3. Config comes from env. Add the new vars to:
   - `src/lib/env.ts` (Zod schema, optional unless the provider is active)
   - `.env.example` (with a comment and a link to where keys come from)
4. Wire selection where the provider is chosen (see how `gateway.ts` and the
   `AI_MOCK` flag are dispatched) — selection stays env-driven, no
   provider conditionals in UI or actions.
5. **Do not touch the credits flow.** The generate action already spends
   before calling the provider and refunds on failure. Your provider just
   throws on error; the action handles money.
6. Test: unit-test the response normalization with a mocked HTTP layer.
   Then run the e2e generate flow with the real provider once, manually.

## Scope note

This repo intentionally ships one provider. Multi-provider image/video/audio
with job queues, auto-refunds and gallery storage is what the Pro version is
for (https://nikandr.com) — don't rebuild it ad hoc here.
