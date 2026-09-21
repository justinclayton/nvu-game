# Spec: the North vs Up CLI

Status: ruled on by the designer, 2026-09-21. Each decision below is tagged: `[you]` is the
designer's, `[agent, accepted]` is one the agent proposed and the designer took. The first draft of
this tool was built without a plan and is being rebuilt to this spec; the earlier version is in git
history on the closed PR #67.

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
bin/nvu play new  --seed N [--run FILE]
bin/nvu play move N        [--run FILE]
bin/nvu play undo          [--run FILE]
bin/nvu play note "text"   [--run FILE]
bin/nvu play show          [--run FILE]
bin/nvu replay FILE [--quiet]
bin/nvu fuzz --seeds N [--from SEED]
bin/nvu help
```

### play `[agent, accepted]`

One shell call per move, because that is how an agent works. There is no interactive loop.

The run file is the only state. Every `play` call reads the file, replays its command log from the
seed through `application/session.ts`, applies the move, and writes the file back. `undo` is the
session's undo: it truncates the log to the last checkpoint, which falls on hidden information
exactly as in the browser. `note` appends a note to the log at the current position, the same
`Note` the web game stores. The file is the `nvu-run/1` format `application/exportRun.ts` writes,
so the web game can open any run the CLI wrote and the CLI can continue any run the web game saved.

`--run FILE` defaults to `runs/<seed>.json`. `runs/` is gitignored. `[agent, accepted]` A run that
backs a playtest note is copied into `design/playtests/` by hand next to the note. Only those runs
are guarded by the replay check below.

After every move the CLI prints, in this order: `[you]`

1. What just happened, one narrated line per event, from `application/narrate.ts`. These are the
   same lines the web game's log shows, so the agent's account of a run and the log agree word
   for word.
2. The table: floor, turn, phase, the room and its thresholds, each character's deck, discard and
   hand with each card's cost, stats and text.
3. The legal moves, numbered.

`show` prints 2 and 3 without moving.

### The move generator `[agent, accepted]`

`sim/moves.ts` exports `legalCommands(state)`: every command the engine would accept right now.
The engine's `validate` answers yes or no for one command and produces no list. The generator
builds the candidates from `state.pending`, the phase and the domain queries the UI already uses,
and the CLI numbers them. The engine still checks every command it is handed; the list only saves
the agent from guessing.

The contract, held by `moves.test.ts`: every command returned passes `validate`, and for a sample
of seeded states every command `validate` accepts is one it returned.

Two places cap the list where the full set is large, and both are recorded here as debt the solver
must pay before it can claim completeness:

- An `OrderCards` answer over more than four cards offers only the order shown and its reverse.
- The cross product of the two characters' ascension choices is not crossed past 256 entries.

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
`--quiet` prints only the verdict.

## Checks `[agent, accepted]`

`make app-check` gains two tests:

- **Saved runs replay.** Every run file under `design/playtests/` replays to the same final state
  and outcome it recorded. A rules change that breaks one fails the check.
- **Fuzz sweep.** A fixed set of fifty seeds plays through with no failure of any kind above.

Tests kept or written for the new tree: `moves.test.ts` (the contract), `run.test.ts` (every seed
ends or hits the budget, never throws, and the log replays to the same state), `cli/args.test.ts`.

## The playtest note `[you]`

The agent writes the prose sections of a playtest note by hand, in the format of the notes already
in `design/playtests/`. The appendix is the output of `replay`. The run file sits next to the note.

A short instructions file for agent playtesting (start a run, play, note as you go, replay for the
appendix, write the note) is written after the first agent playtest, not before. `[agent, accepted]`

## What this does not decide

Balance conclusions; those are design work in `design/playtests/`. The solver's search and budget
strategy. Networked or scripted two-seat play, which the web game's ADR already rules out.
