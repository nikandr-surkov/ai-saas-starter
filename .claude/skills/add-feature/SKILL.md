---
name: add-feature
description: Scaffold a new feature (page + server action + test) following this repo's patterns. Use when adding any user-facing feature to the app.
---

# Add a feature

Follow these steps in order. Look at an existing feature first —
`src/app/(app)/generate/` is the reference implementation of this shape.

## 1. Spec it

Copy `specs/TEMPLATE.md` to `specs/NNN-short-name.md` and fill it in
(problem, solution, out-of-scope, data changes, test plan). Two paragraphs
beat zero. Show the user before writing code.

## 2. Data (only if the spec says so)

If the feature needs schema changes, stop and run `/db-migration`. Schema
changes require asking the user first.

## 3. Server action

Create `src/app/(app)/<feature>/actions.ts`:

- `"use server"` at the top.
- First line of every action: re-check the session via the helper in
  `src/lib/auth/` — never rely on middleware alone. Throw/redirect if absent.
- Validate all input with a Zod schema. Parse, don't cast.
- Mutations that touch credits go through `src/lib/credits/` only.
- Return typed results; `revalidatePath` what the mutation changed.

## 4. Page

Create `src/app/(app)/<feature>/page.tsx`:

- Server Component. Fetch data directly (Drizzle), no client fetching.
- Re-check the session server-side, same as the action.
- `"use client"` only for leaf components that need interactivity (forms,
  toggles) — keep them small, pass data down from the RSC.
- UI per DESIGN.md: existing shadcn primitives from `src/components/ui/`,
  ledger rows for lists, mono for numbers/labels, no new colors.

## 5. Navigation

Add the page to the sidebar nav in the app shell component (one entry:
lucide icon + label).

## 6. Test

Write a Vitest file next to the logic you added (`*.test.ts`):

- Cover the action's happy path, invalid input (Zod rejection), and the
  unauthenticated case.
- If credits are involved, assert the ledger invariant still holds
  (balance cache === sum of transactions).

## 7. Done means done

`pnpm typecheck && pnpm lint && pnpm test` all green. Walk the feature once
in the browser (`pnpm dev`).
