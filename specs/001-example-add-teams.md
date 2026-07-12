# 001 — Example: shared team workspaces

<!--
This is a FILLED EXAMPLE of specs/TEMPLATE.md, kept as documentation of how
to spec a feature before prompting an agent. It is not on the roadmap for
the free repo — teams/orgs with seat billing ship in the Pro version
(https://nikandr.com). If you build your own version anyway, this is the
shape the spec should take.
-->

## Problem

Solo accounts can't share anything. Two freelancers on the same client
project each burn their own credits generating the same assets, and neither
can see the other's generation history. We know because it's the most common
"can I..." question for AI SaaS products.

## Solution

A user can create one team, invite members by email, and switch the app
into "team context". In team context, generations spend from a shared team
credit balance and appear in a shared history. The inviter stays owner;
members can generate and view, only the owner can buy credits or remove
members. Failure path: a member generating with an empty team balance gets
the same "out of credits" state as a solo user — with a "ask your team owner
to top up" line instead of a buy button.

## Out of scope

- Seat-based subscription billing (owner-pays-per-member). Team credits come
  from the owner's top-up purchases only.
- Roles beyond owner/member, transfer of ownership, multiple teams per user.
- Real-time presence, comments, or any collaboration UI beyond shared history.

## Data changes

- New tables: `teams` (id, name, ownerId, creditBalance, createdAt),
  `team_members` (teamId, userId, role, createdAt; unique on teamId+userId,
  both FKs indexed).
- `credit_transactions` gains a nullable `teamId` (indexed) — team spends
  are rows with `teamId` set. Amounts/types unchanged; ledger stays
  append-only.
- `generations` gains nullable `teamId` (indexed).
- Credits API: `spendCredits`/`grantCredits`/`refundCredits` accept an
  optional `teamId` scope; idempotency keys unchanged
  (`spend_{generationId}`, `refund_{generationId}`,
  `topup_{checkoutSessionId}`).
- Schema changes go through `/db-migration` and need approval first.

## Test plan

- Owner creates team, invites member, member accepts: membership row exists,
  member sees team context.
- Member generates in team context: team balance decremented, ledger row has
  `teamId`, member's personal balance untouched.
- Two members generate concurrently with balance 1: exactly one succeeds,
  one gets `InsufficientCreditsError` (race test, same pattern as the solo
  double-spend test).
- Provider failure in team context refunds the TEAM balance
  (`refund_{generationId}` idempotent on retry).
- Invariant: `teams.creditBalance === SUM(credit_transactions.amount WHERE
teamId = ...)` after every suite.
- Non-member hitting a team URL gets 404, not 403 (no existence leak).
