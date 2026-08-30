# Rules core — TypeScript prototype

**Throwaway code. Not the real implementation.** It exists to answer one question:

> Does the state model proposed in [`north-vs-up-rfc.md`](north-vs-up-rfc.md) hold up when it has to
> run the rules we actually ratified?

Short answer: **the shape holds, the content does not.** `(state, command) -> [state, events]` turned
out to be the right spine — every rule in the rulebook fits it, the engine is pure, and a seeded run
replays exactly. But the RFC's own game is not North vs Up. Roughly half its rules were invented at
writing time and contradict resolved tickets. The list is below.

## Running it

```
make rules-core        build and open the demo in a browser
make rules-core-check  run the smoke run and the walkthrough check
```

Or directly, with no build step and no dependencies (Node strips the types itself):

```
node prototype/rules-core-ts/smoke.ts     seeded runs + invariants
node prototype/rules-core-ts/build.mjs    regenerate prototype/rules-core-demo.html
node prototype/rules-core-ts/verify.mjs   check the built demo loads and every walkthrough runs
```

`prototype/rules-core-demo.html` is a single self-contained file. Double-click it. It has eight
guided walkthroughs — one per rule that is hard to reason about on paper — and a free-play tab where
every legal command is a button. The full state prints after every action, and open questions the
rules do not answer show up in yellow.

## What is here

| | |
|---|---|
| `types.ts` | The state tree, the commands, the events. All `readonly`. |
| `engine.ts` | `execute(state, command)`. The whole rulebook, and nothing else. |
| `cards.ts` | Reshapes the generated `prototype/cards.js` into engine types. Holds no cards. |
| `rng.ts` | Seeded shuffle. The seed lives in the state, so runs replay. |
| `scenarios.ts` | The eight walkthroughs: rigged states plus commentary. |
| `ui.ts`, `build.mjs` | The demo page, and the build that inlines it into one file. |
| `smoke.ts`, `verify.mjs` | Seeded runs, invariants, and a check that the demo still works. |

No card is written down anywhere in here. Everything comes from `design/cards.yaml` through
`make build`, per ticket 25.

## Where the RFC disagrees with the ratified rules

Each of these is the RFC inventing a rule that a resolved ticket had already settled the other way.
The engine follows the ticket, not the RFC.

| RFC says | The rules say | Where |
|---|---|---|
| Red has `AdrenalineRush`, Gray has `TacticalBackpack` and a backpack slot | *Neither character has a special ability.* The difference between them is their cards and only their cards. | rulebook §2, ticket 13 |
| A `Downed` character can be brought back, and `state` cycles Standing → LastStand → Downed → Standing | Down is out. No revive action, no cost, until the floor is cleared. | rulebook §9, ticket 14 |
| Flee damage is split between characters, `Math.ceil(d/2)` and `Math.floor(d/2)` | Where a Flee line says 1 character, the team chooses which one and *they take all of it. There is no splitting.* | rulebook §5 |
| Down is a stored tri-state | Last stand is *derived*: a character is in it for exactly as long as their deck is empty. Only Down needs a flag. | rulebook §9 |
| `HAND_OFF` — pass a card to your partner | No such action exists. Red never pays for Gray, and nothing moves between hands. | rulebook §5 |
| Enemy rooms are the only rooms with thresholds worth evaluating | Three room kinds, each reading the play zone differently — and Stuff rooms read one character's own side, not the shared pool. | rulebook §6 |
| Ascension retypes kept Stuff to `'Class'` to preserve it | The Scrap tax keeps it as Stuff; the price is a starter card to the Scrapyard. | ticket 24 |
| A per-character `scrapPile` | One shared Scrapyard at the side of the table. | ticket 24 |
| Rarity is on the card and read by nothing in particular | Correct, and worth keeping: rarity is purely printed. | rulebook §8 |

Two RFC ideas are worth keeping outright: the command/event split (the events made the walkthroughs
almost free to write) and putting the reducer behind a React hook. Neither needs the RFC's domain
model to work.

## Open questions the rules do not answer

The engine does not paper over these. It picks a behaviour, emits an `OPEN_QUESTION` event saying so,
and the demo prints it in yellow. All four are live tickets, not prototype bugs.

1. **`last-stand-minimum-draw`** — You must draw at least 1 every turn (§5). An empty deck is last
   stand (§9). A character in last stand has nothing to draw, and no rule says which of the two gives
   way. Excused here, because the alternative is a state that no legal move leaves. *This one is not
   theoretical — the engine deadlocked on it until it was decided, and it fires in every seeded run.*
2. **`stuff-exhaust-vs-ascension`** — `design/cards.yaml` rules that Stuff Exhausted is **Scrapped**
   instead. Rulebook §7 and ticket 24 both say Stuff is pulled out of the **exhaust piles** at
   ascension. If Stuff never reaches an exhaust pile, that step can never do anything. The YAML is
   newer, so it wins here — which means *spending a Pry Bar as fuel destroys it*, and the ascension
   step is dead code. Watch the "Spending Stuff destroys it" walkthrough and decide.
3. **`permanent-stuff-exhaust`** — Following on: if all Stuff is Scrapped when Exhausted, then Stuff
   made permanent by the Scrap tax is destroyed the first time it is played, and the tax buys
   nothing. The engine exempts permanent Stuff from the Scrap-on-exhaust rule so the tax means
   something. That exemption is invented and needs a ruling.
4. **`hazard-reward-pool`** — The reward tier says "one character reveals reward" without saying
   whose pool, whose deck it tops, or where a skipped card goes (ticket 09 leaves all three open).
   Red is assumed.
5. **`own-cards-left-in-hand`** — Ascending collects the exhaust piles and never mentions hands, so a
   character's own held cards have nowhere to go. Shuffled back in here.

## What the seeded runs showed

A dumb greedy actor over eight seeds: **0 wins, mean floor reached 1.1.** Every run dies on floor 1
or 2. That is not an engine fault — it is arithmetic that only shows up once the rules run.

- A 12-card deck, drawing 2–3 a turn, with the whole hand exhausted at cleanup, is about **five turns
  of life per floor**.
- Floor 1 holds **13 rooms** (1 Enemy, 3 Hazard, 9 Stuff).
- So a character gets through roughly a third of a floor before their deck is gone, and the Enemy
  room wants Power 5–9 out of a starter deck whose best card is Power 3.

The floor is three times longer than a deck-pass affords. Either the deck is much bigger, or the
floor is much shorter, or a cleared room has to give cards back far more often than the last-stand
escape does. All the numbers involved are placeholders belonging to tickets 10 and 22, so this is a
data point for those, not a verdict.

The second thing the runs showed: the Scrapyard fills up fast (up to 14 cards in a single short run)
purely from Stuff being spent as fuel. That is open question 2 showing its teeth — the permanent
graveyard is doing far more work than the "one voluntary thinning decision per floor" that ticket 24
describes.

## Invariants the engine holds

Checked by `smoke.ts` on every run:

- the same seed replays exactly
- `execute()` never mutates the state handed to it
- no card appears or vanishes: `start + Stuff taken = still held + Scrapped`
- going Down empties the hand
