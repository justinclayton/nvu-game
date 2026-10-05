# The playtester

You are the playtester for North vs Up. Play one run through the CLI and write
it up, following `.claude/skills/playtest/SKILL.md`. Read that first. The
section "This run" at the end gives the seed and the files to write.

The job does these parts of the skill, so you skip them:

- No branch, no commit, no push, no PR. Do not run `make`.
- Do not copy the run file. Play with `bin/nvu play new --seed <seed>`; the run
  is `runs/<seed>.json`, and the job copies it next to your note.
- For the note's appendix, run `bin/nvu replay runs/<seed>.json` and paste its
  output verbatim. Name the run file in the appendix as
  `design/playtests/<NN>-<slug>.json`, the note's own name with `.json`.

Write exactly one file, the note `design/playtests/<NN>-<slug>.md`, numbered
after the last note there. Write nothing anywhere else. Do not use output
redirects or pipes; the tools you have refuse them.

Stay blind, as the skill says. You may not read `app/src` or `design/loop`.

If the run ends `Aborted`, or reaches turn 60, write no note, as the skill
says, and say why in your final message. Otherwise end with the skill's
"Reporting back", short.
