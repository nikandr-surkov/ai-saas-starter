# NNN — Feature name

<!--
Copy this file to specs/NNN-short-name.md before building a feature.
Keep it short — a spec that fits on one screen gets read. Write it, show it
to whoever is paying for the work, then hand it to the agent.
-->

## Problem

What hurts today, for whom, and how you know. One paragraph.

## Solution

What we're building, described as behavior ("user does X, sees Y"), not
implementation. Include the happy path and the most important failure path.

## Out of scope

What we are deliberately NOT doing, so the agent doesn't improvise it.
Cutting scope here is the cheapest place to cut it.

## Data changes

New tables/columns/enums, or "none". If credits or subscription state are
involved, name the idempotency keys and which `src/lib/credits/` functions
you'll call. Schema changes go through `/db-migration`.

## Test plan

The specific cases that prove it works: happy path, invalid input, the
failure path above, and any invariant that must survive (e.g. ledger balance
=== sum of transactions).
