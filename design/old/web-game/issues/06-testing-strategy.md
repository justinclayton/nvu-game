# 06 — Decide the testing strategy per layer

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

What does each layer get tested with, and how? Decide whether the rulebook's numbered sections
become named engine tests, whether the prototype's walkthrough scenarios are ported as fixtures,
how the seeded replay invariants are kept, and how much the UI is tested at all. Name the test
runner.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`

**Runner: Vitest**, one config, environment `node` by default and `jsdom` only for `ui/`.

**Domain, the bulk of the suite.**
- **Rulebook tests.** One describe block per rulebook section, test names quoting the rule:
  `describe("§5 Play phase")` with `it("a full hand still draws for the minimum and discards the
  card")`. When a rule changes, the failing test names the section.
- **Walkthrough fixtures.** The prototype's eight scenarios in `scenarios.ts` are ported as rigged
  starting states with expected events. They are the regression suite for the hard rules.
- **Invariants over seeded runs.** A dumb greedy actor over many seeds asserts: same seed replays
  exactly; `execute` never mutates its input; no card appears or vanishes; going Down empties the
  hand; a rejected command leaves state identical.
- **Per-card tests** for every registry entry, in the same file as the behaviour.

**Content.** A drift test: the generated module is fresh against `cards.yaml`, and every official
card with text has a behaviour entry.

**Application.** Session tests: dispatch, rejection handling, undo to checkpoint, save and replay
round-trip.

**UI.** React Testing Library, a handful of smoke tests: a card in hand renders, a pending choice
renders its options, an illegal action shows the rejection. No end-to-end browser suite.

**Not measured.** Coverage. The rulebook sections are the checklist.
