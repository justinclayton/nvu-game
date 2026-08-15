# 07 — Define the turn and action economy within a floor

Type: grilling
Status: open
Blocked by: 03, 04, 05, 06, 13, 14
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

## Must satisfy

- The player-count model settled in ticket 03.
- The resource model settled in ticket 04.
- The floor structure settled in ticket 05.
- The pressure filter settled in ticket 06 — check the turn structure against it explicitly and
  record the check.
- The decision filter settled in ticket 13 and the topology settled in ticket 14. The phases
  designed here must be the phases in which 13's choices actually get made — a phase sequence that
  wraps no decisions has failed, however tidy it is. Record the check.

## Overlap to watch

Item 6 (*what ends a floor*) overlaps ticket 05's run structure and ticket 13's engagement rules.
If either has already settled it, adopt rather than re-decide, and say which ticket owns it.

## Notes for the session

- This is the ticket most likely to reveal that an upstream decision does not work. If it does,
  say so and reopen the upstream ticket rather than patching around it here.
