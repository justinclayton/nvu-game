# Web game — wayfinder map

Label: `wayfinder:map`

## Destination

An architecture spec for the official web version of North vs Up, plus a scaffolded repo skeleton
with the layering decided and tooling chosen, ready to hand to implementation sessions. Nothing is
built beyond the skeleton. The spec lands at `design/web-game/spec.md`.

## Notes

- **Domain**: North vs Up, a two-character cooperative deckbuilder. The rules are ratified in
  [`design/rulebook.md`](../rulebook.md) and the vocabulary in [`design/GLOSSARY.md`](../GLOSSARY.md).
  Every card is written down once, in [`design/cards.yaml`](../cards.yaml); `make build` generates
  `tools/cards.js` for the printable card sheet from it. The web game reads from that same source.
- **The engine's shape**: a `(state, command) -> [state, events]` spine, randomness as a seed kept
  in state, and commands and events as separate types. `[proposed by agent → you approved, 2026-09-01]`
- **Scope settled at charting** `[you, 2026-09-01]`: React, TypeScript strict, one browser with
  both characters on one screen, hosted locally, no networking. DDD in its lighter form: one bounded
  context, a pure domain layer, a ubiquitous language, and everything else kept out of it.
- **Skills every session should consult**: `/grilling` and `/domain-modeling` for grilling tickets;
  `/prototype` for prototype tickets; `/codebase-design` when deciding where a seam goes.
- **Standing preferences**: write plainly, no noun-stacks; state the rule, not how it got there;
  tag every decision as yours or agent-proposed; name phases Flip/Draw/Play/Outcome/Cleanup by name.
- The spec is prose plus one directory tree. No diagrams.

## Decisions so far

<!-- one line per closed ticket: gist, then the link for the detail the ticket holds -->

- [Research: DDD conventions in TypeScript front-end projects](issues/09-research-ddd-typescript.md) — layered `domain / application / infrastructure / ui`, dependencies point inward, guard the domain with an ESLint import rule, value objects as readonly types and branded ids, commands and events both live in the domain.
- [Research: wiring a pure game engine under React](issues/10-research-react-engine-state.md) — engine is already the reducer every host wants; Zustand vanilla is the thinnest host with selectors and out-of-React subscriptions; copy boardgame.io's stage pattern for pending choices; XState is a separate design question.
- [Decide the layers and what each may import](issues/01-layering.md) — `app/src/{domain,content,application,infrastructure,ui}`, dependencies point inward, ESLint enforces it; card behaviour and pure queries are domain, the store is application, card data is `content/` injected at session start.
- [Decide the shape of the domain model](issues/02-domain-model-shape.md) — one aggregate `GameState`, readonly value objects with branded ids, `execute(state, command) -> Result` where an illegal command is a value not a throw, seed in state, content injected once, phases named, pending choices as a separate field.
- [Decide where card-specific logic goes](issues/03-card-logic-binding.md) — a domain registry keyed by card name with optional `stats`, `onPlay`, `whileHeld`, `onEvent`; behaviours compose the engine's own verbs; a card with text and no entry fails the build.
- [Decide how the engine tells the UI what is legal](issues/04-legal-moves-to-ui.md) — `state.pending` names the choice being waited for, `validate` answers "would this be legal", targeted queries cover the rest; no enumerator, no throws.
- [Decide how React talks to the engine](issues/05-ui-state-management.md) — Zustand vanilla store in application holding state, command log, events and history; undo back to the last hidden-information checkpoint; save is seed plus command log; ui binds with a selector hook.
- [Decide the testing strategy per layer](issues/06-testing-strategy.md) — Vitest; rulebook-section tests, ported walkthrough fixtures, seeded-run invariants and per-card tests in domain; a drift test in content; session tests in application; a few RTL smoke tests in ui.
- [Decide how card data reaches the app](issues/07-card-data-pipeline.md) — `tools/cards.mjs` also emits `app/src/content/cards.generated.ts`; Flee prose is parsed in the generator; `make check` covers freshness and behaviour coverage.
- [Choose tooling and scaffold the skeleton](issues/08-tooling-scaffold.md) — npm, Vite, TypeScript strict, Zustand, Vitest, ESLint boundary overrides, path aliases, `make app` and `make app-check`; scaffolding handed to the implementing agent via the spec.

The map is complete. The spec is [`spec.md`](spec.md).

## Not yet specified

- How a networked two-browser version would layer on later. Deliberately unexamined until the
  layering and UI-state decisions are in, since a pure engine should make it a later effort.
- Animations and the visual language of the table. Belongs to the build effort, not this map.

## Out of scope

- Networking, a server, or any multiplayer beyond one browser. Ruled out at charting. `[you]`
- Heavy tactical DDD: multiple bounded contexts, a context map, repositories, sagas. One
  single-player card game is one context. `[proposed by agent → you approved]`
- Balance, card content, and rule changes. Those belong to the design map, not this one.
- Building the game past the skeleton. This map ends at the spec.
