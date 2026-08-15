# 05 — Define the run and floor structure

Type: grilling
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

What is the structure of a run, and what is a floor actually made of?

The pitch contains a strong structural claim — *"each floor should feel like one distinct combat
round"* — which needs to become a mechanical statement before anything downstream can be designed.

This ticket owns the **run scale** — the shape of the whole climb. The shape of a single floor
*as a playable encounter* belongs to tickets 13 and 14, which this ticket blocks.

Decide:

1. **What "one floor = one combat round" means.** Is a floor literally a single round of play, or
   a bounded sequence of rooms resolved under one pressure envelope? These are very different
   games; the phrase currently covers both. **This is the gating question for the whole encounter
   cluster** — if a floor is literally one round, there may be no floor plan at all, and tickets 13
   and 14 change shape or disappear.
2. **The boss.** Where the floor boss sits in the structure and what forces the player to face it.
3. **Ascension.** What beating a boss changes, and what carries between floors.
4. **Escalation.** What gets harder floor to floor, and along which axis.
5. **Run length.** Whether the number of floors is fixed, and roughly how long a full run should
   take at the table.

## Notes for the session

- This ticket is unblocked and can be worked before the resource model exists — but whatever it
  settles must be able to *host* a pressure mechanism (ticket 06). Do not settle a structure with
  no room for time pressure in it.
- Run length and floor count may partly stay in the fog if they depend on the turn economy
  (ticket 07). Settle the structure; leave the numbers to the sim (ticket 10) if needed.
- Settle the run scale and **stop**. Resist specifying what a room is or how movement works — that
  is ticket 13's and 14's job, and settling representation here is the specific failure this
  rescope was made to prevent.

## Rescope history

`[proposed by agent → you approved, 2026-08-15]` This ticket originally carried three
encounter-scale items — what a room is, how many rooms per floor, and movement/layout reveal. They
moved to tickets 13 and 14 when the encounter cluster was charted. The reason: those items asked
for a *physical representation* before anything on the map established what that representation had
to accomplish, and the floor encounter had no owning node at all.
