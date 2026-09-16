# 02 — Decide the shape of the domain model

Type: grilling
Status: resolved
Blocked by: 01

## Question

Is the whole game state one aggregate, and are commands in and events out the only way through its
boundary? Decide what is a value object (Card, Room, Threshold), what is the aggregate root, whether
the seeded RNG stays inside the state, and whether the engine returns `[state, events]` or events
alone with state derived. Cross-check against the prototype's `types.ts`, which is the reference
shape, and against `design/GLOSSARY.md`, which is the vocabulary the types must use verbatim.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`

**One aggregate.** `GameState` is the root and the only thing outside code holds. Nothing reaches
inside it to change it; the only way in is `execute`, the only way out is the returned state and
events, plus pure query functions.

**Value objects**, all readonly plain types, no classes: `Card`, `Room`, `Threshold`,
`FleeLine`, `PlayedCard`, `RewardOffer`. Ids are branded: `CardId` is unique per physical
copy, `RoomId` per room. `Character` is the literal union `"Red" | "Gray"`. Every type name is a
term from `design/GLOSSARY.md`, spelled the same way: exhaust pile, Fled, Cleared, Scrapyard, last stand,
Down.

**The signature.**

```ts
execute(state: GameState, command: Command): Result
type Result =
  | { ok: true; state: GameState; events: readonly DomainEvent[] }
  | { ok: false; reason: Rejection }
```

An illegal command is a value, not a throw. The state is untouched on rejection. Events are the
narrative for the UI and the log; the **command log** is the replay source, and replay is a fold of
the commands over the initial state.

**Randomness is data.** The seed lives in `GameState` and every shuffle returns the advanced seed
with the new state. Same seed, same commands, same game, always.

**Content is injected once.** `createInitialState(seed, content)` builds the decks, pools and
floor from the content module. After that `execute` needs no content parameter: a card instance in
state carries its printed data, and behaviour is looked up by name in the domain registry (ticket
03).

**Phases are named.** `phase` is `Flip | Draw | Play | Ascend | GameOver`. Cleanup is not a
waiting phase; it runs as the last step of `END_PLAY` and announces itself with events. A
**pending choice** is a separate field, `pending: Pending | null`, following boardgame.io's stage
pattern: a command that needs a decision ends with `pending` set to what is being waited for and
from whom, and the answer is its own command, legal only while that pending is set. Ticket 04 fixes
the mechanism.

**Ruled out.** Events-only with state derived: the state is the natural thing to test and render.
XState: the phase chart is small enough to be a union and a switch, and it would put a library in
the domain. Class-based entities with private constructors: ceremony with no payoff here.
