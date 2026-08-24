# 20 — Put a floor encounter on a real table

Type: prototype
Status: open
Blocked by: 21, 22
Map: [core design map](../map.md)

## Kind of prototype

**Feel, not numeric.** Per the map's prototyping policy this is index cards on a real table, not an
HTML simulator. Ticket 10 owns the numeric side of the resource economy; this ticket owns whether a
floor is interesting to sit in front of.

## Question

Does the floor-deck encounter settled in tickets 18, 21, and 22 actually produce decisions when a
human plays it?

Write a floor deck on index cards, shuffle it, and play a floor end to end against a stubbed
character deck. Then answer:

1. **Was there a decision?** On each flip, did the player have a real choice, or did the correct move
   announce itself? Name the turns where nothing was decided. The suspected failure mode is that
   *beat it if you can, eat it if you can't* is not a choice at all — watch for it specifically.
2. **Did failing feel like fleeing?** The failure branch is the whole reason for this model
   `[you, ticket 18]`. When a card beat you and came back around later, did that read as *scrambling
   and being outmatched*, or as a flat repeated tax?
3. **The reshuffle.** How many passes the floor took, and how the second pass felt against the first.
   A deck that gets longer when you are losing is either the pressure or a death spiral; say which it
   was at the table.
4. **Setup cost.** Time building the floor deck and clearing it away, honestly measured, against the
   5–7 minute floor budget.
5. **What broke.** The thing that felt wrong, in plain language, before theorising about why.

## Notes for the session

- **This ticket is built to be re-run.** The floor encounter is the element expected to need the
  most iteration `[you, 2026-08-15]`, so treat it as a standing surface rather than a one-shot: each
  time 18, 21, or 22 changes, the answer gets another pass appended rather than replaced. Keep the
  build cheap enough that re-running it is not a chore — if it becomes expensive to rebuild, that is
  itself a finding.
- Play it badly on purpose once. A floor that only works when played well is not yet a design.
- Resist fixing what breaks inside this ticket. Record the break and send it back to 21 or 22. This
  ticket observes; those tickets rule.
- Ticket 07 may not be settled when this first runs. If it is not, stub the turn with the crudest
  sequence that lets the floor be played, and say clearly which findings depend on the stub.

## Provenance

`[proposed by agent → you approved, 2026-08-15]` The map's Notes require feel questions to get index
cards on a real table, but before this ticket the only prototype on the map was ticket 10, which is
numeric. `[agent, 2026-08-23]` Rewritten from the spatial floor to the floor deck; the question it
asks is unchanged, the thing it puts on the table is not.
