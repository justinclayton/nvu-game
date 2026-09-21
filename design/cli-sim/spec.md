# Plan: the CLI game simulator

Status: proposed by agent, 2026-09-21. Built in the same change as this document; every decision
below is marked as the agent's and stands until the designer rules otherwise.

## What it is for

The rules live in one place, `app/src/domain`, and the web game is the one thing that drives them.
A browser is the wrong tool for two jobs the design work keeps needing:

- **Volume.** Balance questions ("how often does floor 1 end in a loss?", "does Ruptured Coolant
  Line kill runs?") want hundreds of seeded runs, not one afternoon of clicking.
- **Reproduction.** A bug report is a seed and a command log. Replaying it should not need a screen.

The simulator is a terminal driver for the same engine: it plays runs with a scripted policy, plays a
run interactively, or replays a `.json` export the web game wrote. It adds no rule. Everything it
knows about legality it asks `validate` and the domain queries, exactly as the UI does.

## Where it lives

Two new layers inside `app/src`, so the existing lint rule keeps the dependency direction honest:

| Layer     | What is in it                                                             | May import                                  |
| --------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| `src/sim` | legal-move enumeration, policies, the run loop, aggregate reports; pure   | domain, content, application                |
| `src/cli` | the terminal: argument parsing, printing, stdin, files                    | domain, content, application, infra, sim    |

`sim` has no `process`, no `console`, no clock and no `Math.random`: a policy's own randomness is a
seed derived from the game's seed, advanced with the domain's `nextRandom`. Same seed and policy,
same run, so a surprising result is reproducible by number. `cli` is the only layer that touches IO.

The web game is untouched. `application/session.ts` already said a bot could drive a session without
a browser; this is that bot.

## The pieces

**`sim/moves.ts` — `legalCommands(state)`.** Every command the engine would accept right now, built
from `state.pending`, the phase and the queries. A `PLAY_CARD` is one entry per card per way of paying
for it (hands are at most five cards, so the combinations stay small). An `ASCEND` is one entry per
combination of each character's reward pick and Scrap-tax choice. The test for this file is the
contract: every command it returns passes `validate`, and for a sample of seeded states every command
`validate` accepts is one it returned.

The ADR ruled out an enumerator *for the UI* (ticket 04) because the UI has a better source of truth
in `pending` and targeted queries. A policy has no buttons to grey; it needs the list. The enumerator
is built on those same queries and lives in `sim`, not `domain`, so that ruling stands.

**`sim/policy.ts` — `Policy`.** `choose(state, legal, rng) -> [command, rng]`. Two ship:

- `random`: a uniform pick over the legal list. The floor of what any real player beats, and a
  cheap way to shake the engine (`invariants.test.ts` does something similar by hand).
- `greedy`: draws to a target hand while keeping a stamina reserve, then for each play looks one
  command ahead with `execute` and keeps the one whose resulting state scores best: Ascend over Clear
  over a reward, punishments counted against, deck size as stamina. It answers a room's "one of you"
  the same way. It takes rewards and keeps the strongest Good Stuff at ascension when a card can pay
  the tax. It is a baseline, not a good player; its job is to give the balance numbers a floor above
  random and to be replaced by better policies later without changing anything else.

**`sim/run.ts` — `simulate(seed, policy, content, options)`.** A fold of `execute` over the policy's
choices until the game ends or a command budget runs out (a policy that never ends the Play phase
would otherwise spin). Returns a `RunResult`: the outcome, the floor and turn reached, tallies read
off the event log (rooms Cleared and Fled by name, Stuff taken and dealt, last stands, who went Down
and when, cards played by name), and the command log itself, so any run can be written out as the
same `nvu-run/1` file the web game exports and loads.

**`sim/report.ts` — `aggregate(results)` and `formatReport`.** Win rate, floor reached as a
histogram, mean turns, how runs ended, per-room Clear/Flee counts, the most played cards. Text for the
terminal, or the same numbers as JSON for a spreadsheet.

**`cli/main.ts`** — three subcommands:

```
npm run sim -- sim     --games 200 --seed 1 --policy greedy [--json] [--save-runs DIR]
npm run sim -- play    [--seed N] [--save DIR]
npm run sim -- replay  FILE.json [--quiet]
```

`sim` runs N seeds from a starting seed and prints the report. `play` is the game in the terminal:
the table drawn as text, every legal move numbered, `u` to undo (the session's undo, checkpointed on
hidden information exactly as in the browser), `q` to quit, and the run exported through
`application/exportRun.ts` so a playtest from the terminal is filed like one from the browser.
`replay` folds a `.json` export back through the engine and prints the transcript, notes in place,
using `application/narrate.ts`; a command the rules now refuse is reported with its index, which is
how a rules change that broke a saved run shows itself.

## Tests

- `moves.test.ts`: the contract above, over seeded states reached by the random policy.
- `policy.test.ts`: determinism (same seed, same command sequence) and that greedy ends a Play phase
  where a Clear is on the table.
- `run.test.ts`: every run over a spread of seeds ends or hits the budget, never throws, and the
  command log replays to the same final state through `application/session.ts`'s `replay`.
- `report.test.ts`: the tallies add up.
- `cli/args.test.ts`: the argument parser, since a wrong default silently changes a study.

## What this does not decide

Balance conclusions. The simulator produces numbers; reading them is design work and belongs in
`design/playtests/`. A stronger policy (search, or a learned one) is a later ticket and slots in
behind the `Policy` interface. Networked or scripted two-seat play is out of scope, as the ADR says.
