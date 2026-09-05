# North vs Up — the web game

The official web version. Architecture: [`design/web-game/spec.md`](../design/web-game/spec.md).
The rules are [`design/rulebook.md`](../design/rulebook.md); the vocabulary is
[`CONTEXT.md`](../CONTEXT.md); every card is written down once in
[`design/cards.yaml`](../design/cards.yaml).

```
make app        the dev server
make app-check  lint, typecheck, tests
```

## Layers

Dependencies point inward, and `eslint.config.js` enforces the table.

| Layer | What is in it | May import |
|---|---|---|
| `src/domain` | the rules: state, commands, events, `execute`, queries, card behaviours | domain only |
| `src/content` | `cards.generated.ts`, emitted from `design/cards.yaml`; data, not rules | domain |
| `src/application` | the session: store, command log, event log, undo, replay | domain, content |
| `src/infrastructure` | adapters: seed source, storage | domain, application |
| `src/ui` | React components and hooks | domain, application, content |

The domain has no React, no `fetch`, no `Math.random` and no `Date.now`; its randomness is the
seed carried in `GameState`.

## The table

`src/ui` draws the state as a playmat. The mat (`Mat.tsx`) is a grid of empty, labelled slots, one
per zone from rulebook §3. Every card and room is rendered once, keyed by its id, in a single layer
over the mat (`CardLayer.tsx`); `placements.ts` is the pure function that says which slot each one
is in, and `useSlotRects.ts` measures the slots. A card whose zone changes is given a new transform
and CSS transitions it there, face down cards flipping on the way, so nothing ever appears or
vanishes. `moveDelays` reads the last command's events to send the cards it moved one after
another. The domain and application layers know nothing about any of this.

Card faces (`CardFace.tsx`) are sized in em from the card's width, so the same face prints at
table scale, in a panel, and zoomed under the pointer. The type colours and rarity edges are the
ones `prototype/card-sheet.html` prints.
