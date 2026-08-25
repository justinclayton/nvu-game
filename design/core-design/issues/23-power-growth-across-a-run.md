# 23 — Decide whether player throughput grows across a run, and how

Type: grilling
Status: open
Blocked by: 12
Map: [core design map](../map.md)

## Question

[Ticket 10](10-sim-the-resource-economy.md) argues that **the design may have no way for the player
to get stronger over a run**, and cannot settle it alone.

The argument is arithmetic and uses only rules already ruled:

- The hand cap is 5 ([ticket 07](07-turn-and-action-economy.md)).
- Playing a cost-1 card consumes two of those five, itself and its fuel
  ([ticket 04](04-deck-as-energy-and-hp-model.md), [21](21-defeating-a-floor-card.md)).
- So a character puts **two or three cards' worth of stats** on the table per turn, on floor 1 and on
  floor 10 alike. That factor cannot grow.
- Growth must therefore come from **value per card** rising. But
  [ticket 11](11-card-anatomy.md) ruled reward cards to be **effects, not stats**, and a modifier is
  worth at most the base it multiplies — and that base is Good Stuff, which
  [ticket 22](22-floor-deck-composition.md)'s curve **removes**, 9 down to 0.

If that holds, deckbuilding buys **stamina** — how many turns you can afford — and not **throughput**,
and three things follow. Room thresholds cannot escalate, because they would escalate against a flat
number. The acquisition inversion cannot govern greed, because the consistency it costs is capped by
the hand of 5 while the stamina it buys is capped by nothing — which is
[ticket 09](09-card-acquisition-and-deckbuilding.md)'s charge, still unanswered. And a room's printed
Flee line is a minor cost next to ticket 07's per-turn drain.

**The hole in the argument, and why this ticket is blocked.** A **synergy card** is exactly the escape
hatch — ticket 21 already imagined *"Power equal to twice the cards Gray plays this turn"*, whose value
rises with what else the deck can do. The simulator could not model one, because it had no real cards
and its solver assumed each card's value was independent. Both problems are now fixed: the solver
enumerates combinations and handles conditional stats exactly, and it is waiting on
[ticket 12](12-exemplar-card-set.md) for cards to put in it.

So **resolve ticket 12 first.** Write two or three cards whose stats scale with what else was played,
price them at floors 1 and 10, and run them. If throughput rises, this ticket's answer may be
*nothing to do* and it can be closed cheaply. If it does not, this is a real hole in the middle of the
map and the grilling below is the one worth having.

**Decide what, if anything, the design does about this.** Some possible shapes, none preferred:

- **Accept it.** A flat power ceiling with escalation carried entirely by resource scarcity is a
  legitimate design — it makes the run an endurance curve rather than a power curve. If so, the map
  should say that plainly, ticket 22's escalation numbers need to be set against a flat ceiling, and
  ticket 04's claim that the inversion punishes greed should be retired rather than left standing.
- **Lift the ceiling.** Something that raises throughput as the run goes on — synergy cards whose
  stats scale with what else was played (ticket 21 already imagined *"Power equal to twice the cards
  Gray plays this turn"*), rarity carrying larger printed numbers, a card that raises the hand cap.
- **Change what a reward is.** Ticket 11 ruled reward cards effect-forward and Stuff the stat base.
  If the stat base is the thing that must grow, that ruling is what stands in the way.

## What an answer must cover

- Whether the run has a power curve at all, stated in one line the map can hold.
- If it does: where the growth comes from, and which existing ruling it amends.
- If it does not: what ticket 22's escalation is escalating against, and what happens to ticket 04's
  claim that the inversion is the governor.
- What the Flee line is for, if it turns out to be a minor cost next to the per-turn drain.
