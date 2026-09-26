# North vs Up — the web game

The official web version. Architecture: [`design/web-game/spec.md`](../design/web-game/spec.md).
The rules are [`design/rulebook.md`](../design/rulebook.md); the vocabulary is
[`design/GLOSSARY.md`](../design/GLOSSARY.md); every card is written down once in
[`design/cards.yaml`](../design/cards.yaml).

```
make app        the dev server (an alias for bin/nvu web)
make app-check  lint, typecheck, tests
../bin/nvu      the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu web
```

## Layers

Dependencies point inward, and `eslint.config.js` enforces the table.

| Layer                | What is in it                                                           | May import                   |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| `src/domain`         | the rules: state, commands, events, `execute`, queries, card behaviours | domain only                  |
| `src/content`        | `cards.generated.ts`, emitted from `design/cards.yaml`; data, not rules | domain                       |
| `src/application`    | the session: store, command log, event log, undo, replay                | domain, content              |
| `src/infrastructure` | adapters: seed source, storage                                          | domain, application          |
| `src/ui`             | React components and hooks                                              | domain, application, content |
| `src/sim`            | move generation, the run loop; pure, no IO                              | domain, content, application |
| `src/cli`            | the terminal: arguments, printing, files                                | domain, content, application, infrastructure, sim |

The domain has no React, no `fetch`, no `Math.random` and no `Date.now`; its randomness is the
seed carried in `GameState`. `src/sim` keeps the same promise: no IO, no clock, no `Math.random`.
Its randomness is a seed derived from the game's, advanced with the domain's `nextRandom`.

## The table

`src/ui` draws the state as a playmat. The mat (`Mat.tsx`) is a grid of empty, labelled slots, one
per zone from rulebook §3. Every card and room is rendered once, keyed by its id, in a single layer
over the mat (`CardLayer.tsx`); `placements.ts` is the pure function that says which slot each one
is in, and `useSlotRects.ts` measures the slots. A card whose zone changes is given a new transform
and CSS transitions it there, face down cards flipping on the way, so nothing ever appears or
vanishes. `moveDelays` reads the last command's events to send the cards it moved one after
another. The domain and application layers know nothing about any of this.

On ascending, the three cards each character is offered are lifted off their reward pool and
float above that character's side of the mat until one is clicked or the ascent is confirmed; the
taken card then travels into the discard pile and the others settle back onto the pool. The choice itself
is owned by `Table.tsx`, so the floating cards and the ascension panel read the same one.

Card faces (`CardFace.tsx`) are sized in em from the card's width, so the same face prints at
table scale, in a panel, and zoomed under the pointer. The type colours and rarity edges are the
ones `tools/card-sheet.html` prints.

## The log, notes and exports

The log (`EventLog.tsx`) is the event stream as sentences, and the playtester's tools for it sit
with it: a box that writes a note into the log, and three buttons that take the run away.

A note is not a game rule, so it is not a domain event and not a command. It is session data:
`notes` in the session store, each note anchored to a position in the event log, which is where it
reads back. The engine never sees one, and a run replays the same whether notes were typed or not.
Undo keeps a note about the thing being taken back, moving it to the new end of the log.

`application/narrate.ts` turns events into lines and interleaves the notes, so the screen and every
export read the same log. `application/exportRun.ts` writes the three files:

| File    | What it is                                                                   |
| ------- | ---------------------------------------------------------------------------- |
| `.txt`  | the transcript, numbered, notes in place — what a playtest record quotes     |
| `.csv`  | one row per turn, counted off the event log — several playtests side by side |
| `.json` | the seed, the command log and the notes — this file replays the run          |

`loadSession(run, content, notes)` takes a `.json` export back: a fold of `execute` over the
command log rebuilds the run, and the notes go back where they were typed.

## The CLI

The same engine, driven from a terminal instead of a browser. The plan is
[`design/cli-sim/spec.md`](../design/cli-sim/spec.md). The launcher is `bin/nvu` at the repo root;
it installs and regenerates whatever it needs on first use.

```
bin/nvu play new  --seed N [--run FILE]
bin/nvu play move N        [--run FILE]
bin/nvu play undo          [--run FILE]
bin/nvu play note "text"   [--run FILE]
bin/nvu play show          [--run FILE]
bin/nvu replay FILE [--quiet]
bin/nvu fuzz --seeds N [--from SEED]
bin/nvu web
```

`play` has no interactive loop: an agent playtesting a run makes one shell call per move. The run
file is the only state — every call loads it, replays the command log from the seed through
`application/session.ts`, applies the one move, and writes the file back. It is the same
`nvu-run/1` file `application/exportRun.ts` writes, so the web game can open a run the CLI wrote and
the CLI can continue a run the web game saved. `--run` defaults to `runs/<seed>.json`, which
`runs/` is gitignored; a run worth keeping is copied into `design/playtests/` by hand next to its
playtest note. After every move the CLI prints what just happened (`application/narrate.ts`), the
table, and the legal moves, numbered; `show` prints the table and the moves without moving.

`src/sim/moves.ts` lists what is legal by asking the same queries the UI asks — the engine still
checks every command it is handed, so the list only saves a caller from guessing. There is no
policy that plays for score: a greedy or heuristic bot would measure the bot as much as the game.
`fuzz` plays a batch of seeds with uniformly random legal play instead, under a command budget, and
prints failures only, one line each, with the run file it wrote under `runs/fuzz/`. `replay` folds a
run file back through the engine and prints its transcript, notes in place; a command the rules now
refuse is reported with its index.
