# North vs Up — reading map

A guide to which files to open for a given change, so an agent doesn't read
everything. Conventions for working an issue are in
[`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md); the layers and
build commands are in [`app/README.md`](app/README.md).

## Where to look, by kind of change

- **A rule.** `app/src/domain/engine.ts`, the section for that phase, then the
  matching test file: `engine.test.ts`, `ascending.test.ts`,
  `running-out.test.ts`, `reactions.test.ts`, `walkthroughs.test.ts`.
- **A card.** `app/src/domain/cards/<red|gray|stuff>.ts` and its test. The
  card's text lives in `design/cards.yaml`.
- **A query the UI or CLI reads.** `app/src/domain/queries.ts`.
- **A CLI verb.** `app/src/cli/args.ts`, then `main.ts`, then `render.ts` for
  what it prints.
- **The sim.** `app/src/sim/moves.ts` for what is legal, `policy.ts` for how
  the bot chooses, `report.ts` for the numbers.
- **The table.** `app/src/ui/placements.ts` for where a card is,
  `CardLayer.tsx` for how it is drawn, `Table.tsx` for clicks.

## Leave closed unless the task names them

- `app/src/content/cards.generated.ts` — generated from `design/cards.yaml`;
  read that instead, or grep the generated file for one card name.
- `app/src/ui/table.css` — only for visual issues.
- `app/src/domain/__fixtures__/scenarios.ts` — only for the `?fixture=` dev
  loader.
