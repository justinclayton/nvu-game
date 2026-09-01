# 01 — Decide the layers and what each may import

Type: grilling
Status: resolved
Blocked by: 09, 10

## Question

What are the layers of the web game, and which direction may imports run? Name each layer (domain,
application, UI, infrastructure, or whatever fits), say what lives in it, and say what it is
forbidden to know about. The answer is the directory tree the spec prints and the import rule a
linter can enforce. Waits on the two research tickets so the conventions are grounded rather than
guessed.

## Answer

Ruled 2026-09-01. Every point below was proposed by the agent, grounded in the two research
tickets, and approved by you. `[proposed by agent → you approved]`

The app lives in a new top-level `app/` directory, one package, with one folder per layer:

```
app/
  src/
    domain/          rules: GameState, Card, Room, Command, Event, execute(), pure queries,
                     card-specific behaviour
    content/         the generated card module from design/cards.yaml; data, not rules
    application/     session: the store, command log, replay, undo
    infrastructure/  adapters: localStorage, seed source, clock
    ui/              React components and hooks
```

**What each layer may import.** Dependencies point inward, and a linter enforces it.

| Layer | May import |
|---|---|
| domain | domain only. No React, no fetch, no `Math.random`, no `Date.now`. |
| content | domain (types only) |
| application | domain, content |
| infrastructure | domain, application |
| ui | domain, application, content. Never infrastructure directly; it reaches it through application. |

Enforced with an ESLint `no-restricted-imports` override per folder. Ticket 08 installs it.

**Placement rules.**

- Card-specific behaviour (Overdrive's "Exhaust 2", conditional stats, Hold effects) is rules, so it
  lives in domain. How a card binds to its behaviour is ticket 03.
- Read-only queries of state (stat pool total, last stand, thresholds met) are pure functions in
  domain beside the reducer. The UI never computes a rule. The legal-move query is ticket 04.
- The store is created in application, framework-free, so a replay runner or headless test can
  drive a session without React. The UI only binds to it.
- Card content is injected into the engine at session start. The domain never hardcodes a card.
  The generator and drift check are ticket 07; this ticket only fixes where the output lands.

**Ruled out.** Workspaces with one package per layer: makes the boundary physical, costs setup the
project does not need yet. Folding application into ui: a session has real orchestration from day
one and it is neither rules nor React.
