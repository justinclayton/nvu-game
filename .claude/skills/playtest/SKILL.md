---
name: playtest
description: Play one run of North vs Up through the CLI as a stand-in for a human playtester and write it up as a playtest note. Use when asked to playtest, to play a seed, or to run a playtest through the CLI.
---

# Playtest

You are a human playtester who happens to be an agent. You play to win, you notice things, and you
write them down at the moment you notice them. You do not read the engine.

## What you may read

- `design/rulebook.md`. The authority on every rule.
- `design/GLOSSARY.md`.
- `design/cards.yaml`, when you need to check what a card says. A rulebook line can itself be wrong;
  the yaml is the truth for printed card text.
- The existing notes in `design/playtests/`, for the format and for what earlier runs found.
- `design/cli-sim/spec.md` and `bin/nvu help`, for how the tool works.
- What the CLI prints.

Nothing under `app/src`. Not to decide a move, not to check a suspicion, not after the run. A
suspected bug is checked against the rulebook and the card list only; if those do not settle it,
it stays a question for the designer. A separate agent verifies suspected bugs against the engine
after the note is merged.

## While cards are untuned

The cards are not yet balanced for 0.2. Weight your notes this way, in order:

1. Engine fidelity: a move the CLI refused or resolved in a way that does not match the rulebook.
   Quote the rulebook line you think it breaks.
2. Rulebook gaps: something the rulebook does not say, phrased as a question for the designer, not
   a ruling of your own.
3. Shape that holds regardless of tuning: turn count, decision density, dead phases.
4. Card-level balance observations, last, and only as inputs for a later re-tune once cards are set.

## Playing

Work on a branch named `claude/playtest-NN-<slug>`, where NN is the next playtest number, based on
`main` or, while rules 0.2 is unmerged, the integration branch (check with the designer if unsure).
The seed is the one you were given; if none was, say so and stop.

```
bin/nvu play new --seed N
bin/nvu play <move>          named moves; bin/nvu help lists them
bin/nvu play note "..."
bin/nvu play show
bin/nvu play undo
```

Later calls default to the run `new` started. Each move prints what happened, the table, and the
moves open to you. A refused move prints the engine's reason; that refusal is a finding, so note it
and what you expected. Keep your context small: `play show` prints the same table you already have,
so call it only when you need something you don't, not after every move.

Write a note whenever something surprises you, feels unfair, feels great, looks like a rule gap, or
looks like a bug. Note it when it happens, so it lands in the log at the right line. Say what you
were trying to do and why, not only what you saw. Only use `undo` to back out a mistyped move, never
to take back a legal move you regret; say why in a note either way.

Play until the run ends in Victory, Defeat, or Aborted. If the run ends `Aborted`, at
`new` or at an Ascend, the card list is short of Rooms or reward cards; stop there, report the
printed shortfall, and write no note: a run on a short pool is void data, and the pools are sized
so it never happens. If play somehow reaches turn 60 without ending, stop there and report it as a
friction point instead of a note: a run never takes that long, so getting this far means something
is stuck.
Keep a scratch list, outside the
run, of every friction point with the CLI itself: output you could not read, a move you could not
express, something you wished it printed, an error you hit.

## Writing it up

1. Copy the run file: `cp runs/N.json design/playtests/NN-<slug>.json`.
2. Write `design/playtests/NN-<slug>.md` in the shape of the latest note there:
   - A header: when, how, seed, and the outcome in a sentence. State that the notes are the
     agent's, tagged `[agent]`, that nothing in the note is a ruling, and that suspected bugs were
     checked against the rulebook and the card list only.
   - **How the run went.** The story of the run, a paragraph or two per floor that mattered.
   - **Notes.** Each in-run note as a numbered item, quoted as written, tagged `[agent]`, with its
     log line. Under it, your analysis: what you checked, what you found, and any question for the
     designer framed as a question. Do not decide rules.
   - **What the run showed.** The two or three things the run adds up to.
   - **The CLI as a playtest tool.** The friction list, worst first, and what the tool got right.
   - **Candidate issues.** A list, not filed issues: engine mismatches first, then rulebook
     questions, then tuning-independent shape, then card observations for a later re-tune. The
     designer files what they want from this list.
   - **Appendix.** The output of `bin/nvu replay design/playtests/NN-<slug>.json`, verbatim, in a
     code block.
3. Write plainly. Short sentences. No em-dashes. State what is true now; the story of how you got
   there belongs only in How the run went.
4. Run `make app-check` so the saved run passes the replay check.
5. Commit, push, and open a PR titled `Playtest NN: <slug>`. While rules 0.2 is unmerged, target the
   integration branch, not `main`; check which branch is current with the designer if unsure. The
   body is two or three sentences plus the outcome. Do not merge.

## Reporting back

The PR URL, the outcome in one line, the three findings about the game that matter most, and the
three worst friction points with the CLI. Findings you could not settle from the rulebook and the
card list are questions, and you say so.
