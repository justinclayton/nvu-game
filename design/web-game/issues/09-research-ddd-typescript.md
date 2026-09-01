# 09 — Research: DDD conventions in TypeScript front-end projects

Type: research
Status: resolved
Blocked by:

## Question

What do well-regarded TypeScript projects do for the lighter form of DDD in a single-page app:
layer names, directory layout, how a pure domain is kept free of framework imports, how import
boundaries are enforced (eslint-plugin-boundaries, dependency-cruiser, tsconfig paths), and how
value objects and aggregates are expressed without classes-heavy ceremony. Cite primary sources.
Findings go to `design/web-game/research/ddd-typescript.md`.

## Answer

Findings: `design/web-game/research/ddd-typescript.md` on branch `research/ddd-typescript`
(worktree `.claude/worktrees/research-ddd-typescript`). `[research subagent, 2026-09-01]`

- Every layered style (Clean, Hexagonal, Onion, DDD) shares one rule: dependencies point inward.
  The common TypeScript names are `domain`, `application`, `infrastructure`, `ui`. Hexagonal calls
  UI and tests driving adapters and storage a driven adapter, both plugging into plain interfaces.
- One bounded context favours a layered layout over feature folders.
- A pure domain imports only from itself: no React, no fetch, no `Math.random`, no `Date.now`.
- `tsconfig` paths enforce nothing. The cheapest real guard is an ESLint `no-restricted-imports`
  override on `src/domain/**`; `eslint-plugin-boundaries` and `dependency-cruiser` are the heavier
  rungs.
- Value objects without classes: readonly fields, `as const` tables, branded ids, smart
  constructors that parse at the edge. An aggregate is a readonly type plus the only functions
  allowed to change it.
- Commands are imperative inputs, events past-tense outputs. In a reducer-shaped engine both types
  live in `domain/`; a separate application layer can wait. Naming them so is not CQRS.
