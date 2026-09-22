# Spec: the North vs Up CLI

Status: ruled on by the designer, 2026-09-21, and revised the same day after playtest 3 (issue #81).
Each decision below is tagged: `[you]` is the designer's, `[agent, accepted]` is one the agent
proposed and the designer took. The first draft of this tool was built without a plan and rebuilt to
this spec in PR #68; the earlier version is in git history on the closed PR #67.

## What it is for

The rules live in one place, `app/src/domain`. Until now the web game was the only thing that drove
them, and the designer was the only playtester. The CLI exists for three jobs, in this order:

1. **Agents playtest.** `[you]` An agent in a session plays a run one shell call at a time, writes
   notes into the log as it goes, and writes up the run as a playtest note in `design/playtests/`,
   in the format the existing notes use. The agent stands in for a human playtester. It is not a bot.
2. **Random play shakes the engine.** `[you]` Many seeds of uniformly random legal play, reporting
   only failures: a throw, a state with no legal move, a run that never ends, a move the generator
   offered that the rules refused.
3. **A seed solver, later.** `[agent, accepted]` Not built now, but named so two constraints hold
   from the start: the run loop is pure, and the move generator is complete. A solver walks every
   line of play for one seed and answers, with no policy and no opinion, whether that seed is
   winnable and by how many lines. Over many seeds that is a balance fact about the game rather
   than about a bot.

Balance volume with a scripted policy is not a job. `[you]` A greedy or heuristic bot measures the
bot as much as the game, and the solver gives a baseline with no policy in it. There is no bot.

## Where it lives

```
bin/nvu                 the launcher; the only way anything here is run
app/src/sim             move generation, the run loop, random play; pure, no IO
app/src/cli             argument parsing, printing, files
```

`bin/nvu` is a shell script. `[you]` It installs `app/node_modules` if `tsx` is missing, runs
`make build` so the card modules are current, then runs `app/src/cli/main.ts` with `tsx`. The
`web` subcommand is handled in the shell script itself and starts the web game's dev server, so
one entry point covers the game in both forms. `make app` stays as an alias for `bin/nvu web`.

The layer rules hold as in the web game's ADR: `sim` may import domain, content and application;
`cli` may also import infra and `sim`. `sim` has no `process`, no `console`, no clock and no
`Math.random`. Its randomness is a seed derived from the game's, advanced with the domain's
`nextRandom`. `[agent, accepted]`

## Subcommands

```
bin/nvu web
bin/nvu play new --seed N [--run FILE]
bin/nvu play <move>            one named move; see below
bin/nvu play undo
bin/nvu play note "text"
bin/nvu play show [--events N] [--table] [--moves]
bin/nvu play pile <Red|Gray> <hand|discard|play>
bin/nvu card <name>
bin/nvu replay FILE [--quiet]
bin/nvu fuzz --seeds N [--from SEED]
bin/nvu help
```

### play

One shell call per move, because that is how an agent works. There is no interactive loop.
`[agent, accepted]`

The run file is the only state. Every `play` call reads the file, replays its command log from the
seed through `application/session.ts`, applies the move, and writes the file back. `undo` is the
session's undo: it truncates the log to the last checkpoint, which falls on hidden information
exactly as in the browser. `note` appends a note to the log at the current position, the same
`Note` the web game stores. The file is the `nvu-run/1` format `application/exportRun.ts` writes,
so the web game can open any run the CLI wrote and the CLI can continue any run the web game saved.
`[agent, accepted]`

`--run FILE` defaults to `runs/<seed>.json` for `play new`, which also writes that path to
`runs/current`. The other `play` calls default to the run named there, so an agent names the file
once per run. `[you]` `runs/` is gitignored. `[agent, accepted]` A run that backs a playtest note is
copied into `design/playtests/` by hand next to the note. Only those runs are guarded by the replay
check below.

### Moves are named, not numbered `[you]`

The agent types what a player would say. The engine's `validate` decides legality, as it does for
the web game. When a move is refused the CLI prints the engine's reason and stops; nothing is
undone. An illegal attempt is playtest signal, not something to prevent. Playtest 3 showed the
numbered list hiding legal moves and shifting under the agent between calls, which is worse than
either failure a named move can have.

The moves, one per engine command: `[agent, accepted]`

| Call | Engine command |
| --- | --- |
| `play flip` | `FLIP_ROOM`; Turn Start is one step, see below |
| `play end` | `END_PLAY` |
| `play card Red CI pay Rope Flare` | `PLAY_CARD`, paying with the named cards; `pay` and its list are omitted for a cost of 0 |
| `play choose Red` | `CHOOSE_CHARACTER` |
| `play choose Rope Flare`, `play choose none` | `CHOOSE_CARDS` |
| `play order Rope Flare Shove` | `ORDER_CARDS`, top first |
| `play take`, `play skip` | `TAKE_REWARD` |
| `play ascend Red keep Crowbar scrap Shove shed Rust scrap Charge In take Zen Mode` | half of `ASCEND`, see below |

There is no Draw phase and no draw move. `[agent]` Rulebook 0.2 folded Draw up to five into Turn
Start as an automatic second step with no decision in it (rulebook, Each Turn): `play flip` resolves
both, the room and every character's draw, in one call.

The moves hint printed after each call and by `show --moves` lists the verbs open in this phase
with the cards eligible for each, not every combination. In the Play phase that is each character's
playable cards with their costs, and the payer candidates.

**Card names.** `[you]` A name resolves against the cards eligible for that slot: the hand for
`card`, the payer candidates for `pay`, the offer for `take`, and so on. It matches the full name,
the initials, or an unambiguous prefix, case-insensitively, so `CI` is Charge In and `Pick` is Pick
The Lock. Quoting is only shell quoting for names with spaces. When more than one eligible card
matches, the CLI refuses and lists the candidates; when the eligible cards are several copies of the
same card, any copy is taken. A content test in `app/src/content` reports every pair of cards in
`design/cards.yaml` that share initials, so the designer sees a new collision when it lands. Today
those are Reckless Swing and Riot Shield, Reckless and Rust, Shove and Sluggish.

**Ascending, one character at a time.** `[you]` The engine takes one `ASCEND` command holding both
characters' choices, `Red` and `Gray`, each an `AscendChoice`: a `settle` list of `{cardId,
payWith}` and a `takeRewardId` (`app/src/domain/types.ts`). The CLI collects the two characters'
choices in two calls, one per character, and composes them into the one command. `[agent, accepted]`

The hand shuffles into the deck automatically before Settle your Stuff; there is no move for it.
`[agent]` Rulebook 0.2, section 10, then asks the character to settle each Stuff card found across
their deck and discard: keep a Good Stuff card by Scrapping one other, non-Stuff card, or let it
return to the pool for free; keep a Bad Stuff card for free, or shed it to the pool by Scrapping one
other, non-Stuff card. A card not mentioned takes the free default (Good Stuff to the pool, Bad
Stuff kept), matching `AscendChoice.settle` omitting it. `[agent]`

One line per character states every Stuff card it is settling the costed way, then the reward pick:

```
play ascend <Red|Gray> [keep <good stuff card> scrap <card>]... [shed <bad stuff card> scrap <card>]... take <reward card|none>
```

`keep X scrap Y` pays `Y` to keep the Good Stuff card `X` instead of returning it to the pool.
`shed X scrap Y` pays `Y` to shed the Bad Stuff card `X` to the pool instead of keeping it. Either
clause may repeat, for a character settling several Stuff cards, in any order; a Stuff card left out
gets its free default. `take` is required and takes a card from the reveal of three or `none` to
decline. For example: `play ascend Red keep Crowbar scrap Shove shed Rust scrap Charge In take Zen
Mode` keeps the Good Stuff Crowbar by scrapping Shove, sheds the Bad Stuff Rust by scrapping Charge
In, and takes the reward Zen Mode. A character with nothing to settle and no reward wanted is
`play ascend Gray take none`. `[agent]`

The first call is staged in a sidecar file next to the run file and reported back; the second
composes the command, executes it, and removes the sidecar. `undo` during staging clears the
sidecar. `show` during Ascend prints each character's Stuff found in deck and discard, the payer
candidates, the offered cards as full faces, and what is staged so far. The flat cross product of
both characters' choices is gone. `[agent, accepted]`

Stuff rent (what a kept or shed Stuff card costs to Scrap) is pinned by the designer; this syntax
follows whatever the designer rules replaces it with. `[agent]`

### What each call prints `[you]`

After a move, in this order:

1. What just happened, one narrated line per event, from `application/narrate.ts`. These are the
   same lines the web game's log shows, so the agent's account of a run and the log agree word for
   word. A call that produced no event says so in one line, naming what it did, so an answer that
   only narrows the next question is never silent.
2. The table: floor, turn, phase, the room and its thresholds, each character's deck and discard
   counts and hand with each card's cost, stats and text. The room stays on the table while a
   prompt about it is open. Anywhere a card is offered, in a reward reveal as in the Ascend offer,
   the full face is printed.
3. The moves hint.

`show` prints 2 and 3. `show --events N` prints the last N narrated lines, `--table` and `--moves`
print only that part. `note` confirms itself in one line and prints nothing else. A refused move
prints the engine's reason and the moves hint, never the help text. `pile` prints the named pile as
card faces. `card NAME` prints a card's face from the content, with no run needed.

Playtest 3 recorded what the table got right, and it stays: the tick beside a met threshold, a
modified number shown next to the printed one, the name of the card that stopped an effect, the
pool counters in the header, and the line that says a pool is empty.

### The move generator `[agent, accepted]`

`sim/moves.ts` exports `legalCommands(state)`: every command the engine would accept right now.
The engine's `validate` answers yes or no for one command and produces no list. The generator
builds the candidates from `state.pending`, the phase and the domain queries the UI already uses.
It serves `fuzz` and the future solver. The agent does not go through it: `play` takes named
moves and hands them to the engine directly.

`Turn Start` (rulebook, Each Turn) bundles both its steps, Flip the room and Draw up to five, into
`FLIP_ROOM`, with no decision between them — so there is one case for the whole phase here, not
one per step.

The contract, held by `moves.test.ts`: every command returned passes `validate`, and for a sample
of seeded states every command `validate` accepts is one it returned.

Three places cap the list where the full set is large, and all three are recorded here as debt the
solver must pay before it can claim completeness. None touches `play`, which enumerates nothing:

- An `OrderCards` answer over more than four cards offers only the order shown and its reverse.
- The cross product of the two characters' ascension choices is not crossed past 256 entries.
- An ascension's Settle your Stuff answer tries one Stuff card at a time, each way of paying for
  it alone; settling several Stuff cards in the same `ASCEND` is not crossed.

Playtest 4 (`design/playtests/04-first-run-on-rules-0.2.md`) hit the 256-entry cross-product cap
with only two Stuff cards to settle, and it silently dropped a legal combination rather than just
making the list unwieldy; the marathon deck sizes 0.2 produces make this worse than under 0.1. The
per-question `play` form above is unaffected, but `fuzz` and the solver still owe this fix. `[agent]`

The web game's ADR ruled a generator out for the UI, which has a better source in `pending` and
targeted queries. That ruling stands; this generator lives in `sim`, not `domain`.

### fuzz `[you]`

`fuzz --seeds N` plays N seeds from `--from` (default 1) with uniformly random legal play, each
under a command budget so a run that never ends is a finding rather than a hang. It prints
failures only, one per line: the seed, what went wrong, and the path of the run file it wrote for
that seed under `runs/fuzz/`. A clean sweep prints one line saying so. There are no statistics.

Failure kinds: the engine threw; the generator returned no moves in a state that is not game over;
the budget ran out; the engine refused a command the generator offered.

### replay `[agent, accepted]`

`replay FILE` folds a run file back through the engine and prints the narrated transcript with
notes in place. This transcript is the appendix of a playtest note. A command the rules now refuse
is reported with its index, which is how a rules change that broke a saved run shows itself.
`--quiet` prints only the verdict, one line, and nothing before it. Playtest 3 and playtest 4 both
found the current build still prints the full table first; the spec above is what `--quiet` owes,
still unfixed. `[agent]`

## Checks `[agent, accepted]`

`make app-check` gains two tests:

- **Saved runs replay.** Every run file under `design/playtests/` replays to the same final state
  and outcome it recorded. A rules change that breaks one fails the check.
- **Fuzz sweep.** A fixed set of fifty seeds plays through with no failure of any kind above.

Tests: `moves.test.ts` (the contract), `run.test.ts` (every seed ends or hits the budget, never
throws, and the log replays to the same state), `cli/args.test.ts`, a test of card-name resolution
(full name, initials, prefix, ambiguity refused, copies interchangeable), and the initials-collision
report in `app/src/content`.

## The playtest note `[you]`

The agent writes the prose sections of a playtest note by hand, in the format of the notes already
in `design/playtests/`. The appendix is the output of `replay`. The run file sits next to the note.

The instructions for an agent playtest are the `playtest` skill in `.claude/skills/playtest/`. The
playtester reads the rulebook, the glossary, the card list and what the CLI prints, and nothing in
`app/src`. Checking a suspected bug against the engine is a separate pass by a separate agent.
`[you]`

## What this does not decide

Balance conclusions; those are design work in `design/playtests/`. The solver's search and budget
strategy. Networked or scripted two-seat play, which the web game's ADR already rules out.
