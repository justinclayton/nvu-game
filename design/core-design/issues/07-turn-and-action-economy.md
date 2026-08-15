# 07 — Define the turn and action economy within a floor

Type: grilling
Status: open
Blocked by: 03, 04, 05, 06
Map: [core design map](../map.md)

## Question

What does a player actually *do*, in order, from the moment a floor begins to the moment it ends?

Decide:

1. **Phase sequence.** The literal ordered steps of a turn, stated tightly enough that someone
   could follow them without asking a question.
2. **Hand size** — starting, maximum, and whether it changes during a floor.
3. **Draw** — when it happens, how much, and what it costs under ticket 04's model.
4. **Actions per turn.** How many, and whether actions are a distinct currency from energy or the
   same thing.
5. **What ends a turn**, and in a multiplayer configuration, what the other players are doing
   while one player acts.
6. **What ends a floor** — clearing every room, beating the boss, running out of a clock, or a
   condition combining these.
7. **Interrupts and reactions.** Whether a player can act outside their own turn. This is a major
   lever on the frantic pillar and on downtime.
8. **Upkeep.** The physical actions a human performs each turn: shuffling, flipping, sliding
   cards between piles, tracking counters. Count them honestly.

## Settled upstream — do not relitigate

From ticket 03: **strict alternating turns**, Red then Gray. **Fully open information.** Two
characters always in play, each with their own deck and health pool, controlled by one player each
in co-op and both by one player solo. A character at zero is **down, not dead**.

What remains open here is everything *inside* a turn, plus: whether the alternation is fixed
Red-then-Gray or the party chooses who leads each round; what happens to the sequence when one
character is down; and whether a full round is Red+Gray or something finer.

## Must satisfy

- The player-count model settled in ticket 03.
- The resource model settled in ticket 04.
- The floor structure settled in ticket 05.
- The pressure filter settled in ticket 06 — check the turn structure against it explicitly and
  record the check.

## Notes for the session

- This is the ticket most likely to reveal that an upstream decision does not work. If it does,
  say so and reopen the upstream ticket rather than patching around it here.
