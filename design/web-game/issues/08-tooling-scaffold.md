# 08 — Choose tooling and scaffold the skeleton

Type: task
Status: resolved
Blocked by: 01, 05, 06, 07

## Question

Choose the build tool, test runner, linter with an import-boundary rule, and package layout, then
scaffold the directory tree the layering ticket decided, with placeholder modules and one passing
test per layer. Record what was created and the commands to run it. This is the last ticket; the
spec is written from the closed tickets alongside it.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`. Resolved as the tooling decision. The scaffolding itself is the implementing agent's first
step and is specified in the ADR, since you asked for that handoff.

- **Package manager**: npm. The repo has none today and nothing here needs more.
- **Build**: Vite with the React plugin. TypeScript strict, `noUncheckedIndexedAccess` on.
- **React**: the current stable major.
- **Store**: Zustand, vanilla `createStore` plus `subscribeWithSelector`.
- **Tests**: Vitest, React Testing Library for `ui/` only.
- **Lint**: ESLint flat config with typescript-eslint, plus a `no-restricted-imports` override per
  layer folder encoding ticket 01's table. Prettier for formatting.
- **Aliases**: `@domain/*`, `@content/*`, `@application/*`, `@infrastructure/*`, `@ui/*` via
  `tsconfig` paths and the Vite resolver. Readability only; the linter is the guard.
- **Makefile**: `make app` runs the dev server, `make app-check` runs lint, typecheck and
  tests, and `make check` grows to include the content drift test.
- **Skeleton contents**: one placeholder module and one passing test per layer, the ESLint
  boundary rule proven by a deliberately failing import that is then removed.
