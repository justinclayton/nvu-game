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

## Playing

Work on a branch from `main` named `claude/playtest-NN-<slug>`, where NN is the next playtest
number. The seed is the one you were given; if none was, say so and stop.

```
bin/nvu play new --seed N
bin/nvu play <move>          named moves; bin/nvu help lists them
bin/nvu play note "..."
bin/nvu play show
bin/nvu play undo
```

Later calls default to the run `new` started. Each move prints what happened, the table, and the
moves open to you. A refused move prints the engine's reason; that refusal is a finding, so note it
and what you expected.

Write a note whenever something surprises you, feels unfair, feels great, looks like a rule gap, or
looks like a bug. Note it when it happens, so it lands in the log at the right line. Say what you
were trying to do and why, not only what you saw. If you use `undo`, say why in a note.

Play until the run ends in victory or defeat, or until turn 25. Keep a scratch list, outside the
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
   - **Appendix.** The output of `bin/nvu replay design/playtests/NN-<slug>.json`, verbatim, in a
     code block.
3. Write plainly. Short sentences. No em-dashes. State what is true now; the story of how you got
   there belongs only in How the run went.
4. Run `make app-check` so the saved run passes the replay check.
5. Commit, push, and open a PR against `main` titled `Playtest NN: <slug>`. The body is two or three
   sentences plus the outcome. Do not merge.

## Reporting back

The PR URL, the outcome in one line, the three findings about the game that matter most, and the
three worst friction points with the CLI. Findings you could not settle from the rulebook and the
card list are questions, and you say so.
