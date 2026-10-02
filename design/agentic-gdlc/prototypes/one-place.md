# Prototype: the one place, rough enough to react to

Issue [#245](https://github.com/justinclayton/nvu-game/issues/245). Throwaway; this branch is the
primary source and never merges. Everything in it is agent-proposed until the designer picks.

## The question

Which layout and which first screen feel right for the one place, and does the table read as a
tab of something larger, or the something larger as a panel of the table.

## How to run it

```
make app
```

then open one of

- `http://localhost:5173/?prototype=one-place&variant=A`
- `http://localhost:5173/?prototype=one-place&variant=B`
- `http://localhost:5173/?prototype=one-place&variant=C`

The pill at the bottom of the screen, or the left and right arrow keys, switches variants. The
prototype is dev-only: `main.tsx` loads it behind `import.meta.env.DEV` the way the `?fixture=`
loader is, so a production build carries none of it.

## What is real and what is static

The table is the real one, live on seed 7, with New run, undo and the drop-a-run-file target all
working. The flagged run under Data is a real run file recorded on the current card list
(`app/src/prototype/one-place/flagged-run.json`, seed 12, seven commands); clicking it opens the
real replay bar. Everything else (chain runs, agents, pull requests, rulings owed, the
`gdlc:idea` queue, the report and the anomaly list) is static data in
`app/src/prototype/one-place/data.ts`, written to look like a plausible morning. The Merge, Close,
Answer and Make-it-a-proposal buttons do nothing.

## The three variants

| Key | Name | Shape | First screen | What hosts what |
| --- | --- | --- | --- | --- |
| A | Workbench | a new app with a top bar and four tabs: Status, Reviews, Data, Table | Status: the chain's runs with their stages, and the agents | the something larger hosts; the table is one tab, unchanged |
| B | Table first | the existing table, with a one-line strip above it and a drawer on the right | the table | the table hosts; status is a strip and the other three areas are a drawer, one at a time |
| C | Board | one screen, no tabs: Status, Reviews and Data across the top, the table a wide panel along the bottom | everything at once | nothing hosts; the table is one panel and expands to fill the window |

In every variant a flagged run opens in the replay inspector, which is the table replaying: A
switches to the Table tab, B replaces the live table in place, C expands the table panel. The
`gdlc:idea` queue is told apart from rulings owed everywhere with a dashed tag and italic title,
and in A it has its own dashed panel.

## Files

- `app/src/main.tsx` — the `?prototype=one-place` hook, the only change outside the prototype
- `app/src/prototype/one-place/index.tsx` — the root: variant from the URL, the live table, the replay
- `app/src/prototype/one-place/VariantA.tsx`, `VariantB.tsx`, `VariantC.tsx`
- `app/src/prototype/one-place/TableHost.tsx` — the real table with a replay banner
- `app/src/prototype/one-place/parts.tsx` — the leaves each variant lays out differently
- `app/src/prototype/one-place/data.ts` — the static data
- `app/src/prototype/one-place/Switcher.tsx`, `prototype.css`

## Verdict

Open. The designer reacts on the issue.
