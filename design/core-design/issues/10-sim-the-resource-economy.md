# 10 — Sim the resource economy across a floor

Type: prototype
Status: open
Blocked by: 04, 07, 09
Map: [core design map](../map.md)

## Question

Does the deck-as-energy-and-HP model actually produce a playable arc, or does it drain too fast,
too slow, or unrecoverably?

This is a **numeric** question, so per the map's prototyping policy it gets a throwaway HTML
simulator, not index cards.

## What to build

A single-file HTML simulator (via `/prototype`, logic branch) that plays out one floor under:

- the zone and drain rules from ticket 04,
- the turn structure from ticket 07,
- the acquisition rates from ticket 09,

with every tuning number exposed as a control: starting deck size, draw per turn, energy cost
curve, damage per enemy attack, enemies per room, rooms per floor, acquisition rate.

It must support both free-play (step a floor manually and watch the piles move) and batch runs
(simulate N floors and chart the distribution of outcomes).

## What it must answer

1. **Drain rate.** Does the pool fall at a rate that creates pressure without making death
   unavoidable? What is the win rate across the plausible tuning range?
2. **Floor length.** How many turns does a floor take, and does that match "one distinct combat
   round" as ticket 05 defined it?
3. **The death spiral.** Is there a point of no return, and does the player see it coming? A
   roguelite wants the player to know they are losing; it does not want ten minutes of hopeless
   play afterwards.
4. **Degenerate strategies.** Does any single line dominate — hoarding, never spending, never
   buying, rushing the boss?
5. **The acquisition inversion.** If gaining cards gains health, does the sim show players
   over-buying into a bloated unresponsive deck, or is the tension self-correcting?

## Deliverable

The simulator file, linked from this ticket, plus the answer summary. If the sim kills the model,
say so plainly — that is a successful prototype, and ticket 04's fallback branch takes over.
