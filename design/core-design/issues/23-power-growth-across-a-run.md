# 23 — Decide whether player throughput grows across a run, and how

Type: grilling
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

[Ticket 10](10-sim-the-resource-economy.md) found that **the stat pool a team can put on the table
does not grow over a run.** It is 5–7 on floor 1 and 5–7 on floor 10, whatever the deck has become.

The cause is structural rather than a tuning miss, and every part of it was ruled deliberately:

- The hand cap is 5 ([ticket 07](07-turn-and-action-economy.md)).
- Playing a cost-1 card consumes two of those five, itself and its fuel
  ([ticket 04](04-deck-as-energy-and-hp-model.md), [21](21-defeating-a-floor-card.md)).
- Reward cards are **effects**, not stats, and a modifier is worth at most the base it multiplies
  ([ticket 11](11-card-anatomy.md)).
- That base is Good Stuff, and the Stuff curve **removes** it, 9 down to 0
  ([ticket 22](22-floor-deck-composition.md)).

So a character can put two or three cards' worth of stats into the pool per turn, on floor 1 and on
floor 10 alike. Deckbuilding buys **stamina** — how many turns you can afford — and buys it
powerfully. It does not buy **throughput**.

Three consequences the sim measured, which are really one question wearing three hats:

1. **Room thresholds cannot escalate.** Enemy `Power` rising 4 → 18 across ten floors makes the game
   unwinnable at any deck size; the run is only playable if `Power` stays nearly flat. Hazard
   thresholds have the identical problem. Ticket 22 escalates through Stuff scarcity, which makes the
   player *weaker* — and nothing anywhere makes them stronger.
2. **The inversion does not govern greed.** Taking every reward wins 46% of runs; taking almost none
   wins 0.4%. The consistency loss ticket 04 relies on is capped by the hand of 5; the stamina gain is
   not capped at all, so more cards is simply better. See ticket 10 for the full numbers.
3. **The Flee line is economically inert.** Changing a room's printed punishment from *Exhaust 1* to
   *Exhaust 8* moves the win rate by five points, because ticket 07's forced minimum draw already
   taxes the team two cards a turn regardless. Ticket 21 bought the Flee line as a second difficulty
   dial independent of the threshold; as an economic dial it barely functions.

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

Note that [ticket 12](12-exemplar-card-set.md) may weaken the finding on its own: the sim could not
model real synergy, so its pools are a floor on what a good deck can do rather than a ceiling. If a
synergy card lifts throughput by itself, this ticket's answer may be *nothing to do*. That is a
reason to resolve this alongside ticket 12, not a reason to leave it unasked.

## What an answer must cover

- Whether the run has a power curve at all, stated in one line the map can hold.
- If it does: where the growth comes from, and which existing ruling it amends.
- If it does not: what ticket 22's escalation is escalating against, and what happens to ticket 04's
  claim that the inversion is the governor.
- What the Flee line is for, now that it is known not to be an economic dial.
