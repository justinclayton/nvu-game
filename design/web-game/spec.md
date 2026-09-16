# ADR: Architecture of the North vs Up web game

Status: accepted, 2026-09-01. Every decision here was proposed by the agent and ruled on by the
designer; the ticket linked at each heading holds the alternatives that were rejected and why.
This document is the handoff to the implementing agent. The map is [`map.md`](map.md).

## Context

North vs Up is a two-character cooperative deckbuilder with ratified rules in
[`design/rulebook.md`](../rulebook.md) and a settled vocabulary in [`design/GLOSSARY.md`](../GLOSSARY.md).
Every card is written down once, in [`design/cards.yaml`](../cards.yaml). A throwaway TypeScript
prototype in [`prototype/rules-core-ts/`](../../prototype/rules-core-ts/README.md) showed that a
pure `(state, command) -> [state, events]` engine runs every ratified rule and replays exactly from
a seed. The official web version starts clean and keeps that shape.

Scope: React, TypeScript strict, one browser with both characters on one screen, hosted locally.
No networking and no server. DDD in its light form: one bounded context, a pure domain, a
ubiquitous language taken verbatim from `design/GLOSSARY.md`.

## Decision

### Layers ([ticket 01](issues/01-layering.md))

The app lives in a new top-level `app/` directory, one npm package.

```
app/
  src/
    domain/          rules: GameState, Card, Room, Command, Event, execute(), pure queries,
                     card behaviours
    content/         cards.generated.ts, emitted from design/cards.yaml; data, not rules
    application/     session: the store, command log, event log, undo, replay
    infrastructure/  adapters: seed source, localStorage, clock
    ui/              React components and hooks
```

Dependencies point inward. ESLint enforces the table with a `no-restricted-imports` override per
folder.

| Layer | May import |
|---|---|
| domain | domain only. No React, no fetch, no `Math.random`, no `Date.now`. |
| content | domain (types only) |
| application | domain, content |
| infrastructure | domain, application |
| ui | domain, application, content. Never infrastructure directly. |

### Domain model ([ticket 02](issues/02-domain-model-shape.md))

- `GameState` is the one aggregate root. Outside code holds it whole and never reaches inside.
- Value objects are readonly plain types, no classes: `Card`, `Room`, `Threshold`, `FleeLine`,
  `PlayedCard`, `RewardOffer`. Ids are branded: `CardId` per physical copy, `RoomId` per room.
  `Character` is `"Red" | "Gray"`. Type and field names are `design/GLOSSARY.md` terms.
- The engine:

  ```ts
  execute(state: GameState, command: Command): Result
  type Result =
    | { ok: true; state: GameState; events: readonly DomainEvent[] }
    | { ok: false; reason: Rejection }
  ```

  An illegal command is a value. State is untouched on rejection. Throws are for corrupted state
  only.
- The seed lives in `GameState`; every shuffle returns the advanced seed. Same seed and commands,
  same game.
- `createInitialState(seed, content)` is the only place content enters. After that `execute` takes
  no content.
- `phase` is `Flip | Draw | Play | Ascend | GameOver`. Cleanup runs as the last step of `END_PLAY`
  and is announced by events. `pending: Pending | null` is a separate field for a choice the engine
  is waiting on.
- `Command` and `DomainEvent` are discriminated unions on `type`, switched exhaustively with a
  `never` default. Both live in domain. The prototype's `types.ts` is the reference shape; copy its
  intent, not its file.

### Card behaviour ([ticket 03](issues/03-card-logic-binding.md))

`domain/cards/behaviours.ts` exports `Record<CardName, CardBehaviour>`, keyed by the name that
`cards.yaml` makes unique. Vanilla cards have no entry.

```ts
interface CardBehaviour {
  stats?(state, owner, card): { power: number; scramble: number }
  onPlay?(state, ctx): StepResult
  whileHeld?: { costDelta?; stuffPowerDelta?; handCap?; drawCap? }
  onEvent?(event, state, ctx): StepResult
}
```

`StepResult` is the engine's internal shape: new state, events, and optionally a pending choice.
Behaviours compose domain-internal verbs (`exhaustFromDeck`, `draw`, `moveToHand`, `scrap`) and
never write state fields directly, so a card effect emits the same events a rule would. An official
card with `text` and no entry fails `make check`.

### Legality ([ticket 04](issues/04-legal-moves-to-ui.md))

The UI computes no rule. It uses three things, all in domain:

1. `state.pending`: what choice is awaited, from whom, with the legal options. Only the answering
   command is legal while it is set.
2. `validate(state, command): Rejection | null`. `execute` is validate then apply.
3. Targeted queries: `canDraw`, `playableCards`, `payOptions`, `metThresholds`, `statPool`,
   `revealsHiddenInfo(events)`.

### Session and React ([ticket 05](issues/05-ui-state-management.md))

- `application/session.ts`: `createSession(seed, content)` returns a Zustand vanilla store
  (`createStore` + `subscribeWithSelector`) holding `{ state, commands, events, history,
  lastRejection }`. React-free.
- `dispatch(command)`: on `ok`, replace state whole, append command and events; on rejection, store
  it and change nothing else.
- Undo: a stack of prior states, allowed back to the last checkpoint. A checkpoint is any command
  whose events revealed hidden information, decided by `revealsHiddenInfo`. In practice
  `FLIP_ROOM`, `DRAW`, `END_PLAY`, `ASCEND`.
- Save is the seed plus the command log. Load is a fold of `execute` over it.
- `ui/useSession.ts` wraps `useStore(session, selector)`. Sound, animation, and the text log
  subscribe to the event log outside React.
- `infrastructure/seed.ts` supplies the seed from `crypto.getRandomValues`.

### Tests ([ticket 06](issues/06-testing-strategy.md))

Vitest, `node` environment except `ui/`.

- Domain: a describe block per rulebook section with test names quoting the rule; the prototype's
  eight walkthroughs ported as rigged-state fixtures with expected events; seeded-run invariants
  (exact replay, no input mutation, card conservation, Down empties the hand, rejection leaves
  state identical); a test per registry entry beside the behaviour.
- Content: generated module is fresh, every official text card has a behaviour.
- Application: dispatch, rejection, undo to checkpoint, save and replay round-trip.
- UI: a few React Testing Library smoke tests. No end-to-end suite. Coverage not measured.

### Content pipeline ([ticket 07](issues/07-card-data-pipeline.md))

`tools/cards.mjs` gains a second output, `app/src/content/cards.generated.ts`, a typed `as const`
module importing only domain types. Flee prose and thresholds are parsed into structure in the
generator, never in the app. `make build` writes both outputs; `make check` fails on staleness or a
missing behaviour.

### Tooling ([ticket 08](issues/08-tooling-scaffold.md))

npm. Vite with the React plugin. TypeScript strict with `noUncheckedIndexedAccess`. Current
stable React. Zustand. Vitest and React Testing Library. ESLint flat config with typescript-eslint
and the per-layer `no-restricted-imports` overrides. Prettier. Path aliases `@domain/*`,
`@content/*`, `@application/*`, `@infrastructure/*`, `@ui/*`, for readability only. Makefile
targets `make app` (dev server) and `make app-check` (lint, typecheck, tests); `make check` grows
to include the content drift test.

## Consequences

- The domain is testable and replayable with no browser. A networked or AI-driven version later
  needs a new driving adapter, not a new engine.
- Every rule has one home. A UI that greys a button has asked the domain why.
- Adding a card is a YAML edit and, if it has text, one registry entry. Forgetting the entry is a
  build failure, not a runtime surprise.
- The cost is one extra folder (`content/`) and a lint configuration the implementer must get
  right first, before any feature.

## Implementation order for the handoff

Do these in order. Each step ends green under `make app-check`.

1. **Scaffold** `app/` per the tooling section: one placeholder module and one passing test per
   layer. Prove the boundary rule by adding a React import to `domain/` and watching lint fail,
   then remove it.
2. **Generator output.** Extend `tools/cards.mjs` to emit `cards.generated.ts` with structured
   thresholds and flee lines. Wire `make build` and `make check`.
3. **Domain types** from `design/GLOSSARY.md` and the prototype's `types.ts`: state, commands, events,
   `Result`, `Pending`, branded ids.
4. **Engine**: `execute` as validate then apply, one rulebook section at a time, each with its
   tests. Port the eight walkthroughs as fixtures. Add the seeded-run invariants.
5. **Behaviour registry** with Overdrive ("Exhaust 2") and one Holding modifier as the first two
   entries, and the content coverage test.
6. **Session**: the store, dispatch, undo to checkpoint, save and replay.
7. **UI vertical slice**: one floor playable end to end, both characters on one screen, every
   button driven by `pending`, `validate`, and the queries.
8. The remaining registry entries, one per official card with text, each with its test.

## What this ADR does not decide

Animation and the visual language of the table. Networking. Balance and card content. Those are
other efforts.
