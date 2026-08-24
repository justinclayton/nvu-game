# 08 — Decide how enemies are represented and how they act

Type: grilling
Status: open
Blocked by: 21, 22
Map: [core design map](../map.md)

## Question

What is an enemy, physically, and how does it act in a game with no computer to run it?

**Most of this ticket was answered by [ticket 18](18-floor-encounter-decisions.md).** An enemy is a
card in the floor deck. It arrives by being flipped at the start of a turn, it sits in one place on
the table, it acts by what is printed on it, and it leaves by being exhausted. There is no
positioning, no pursuit, and no enemy that follows you between rooms, because there are no rooms.

What is left is what a card cannot answer by existing:

1. **Behaviour beyond the flip.** Whether a floor card does anything other than present a defeat
   condition — acts on a later turn, changes the next flip, stays in play after being met. Weigh
   every candidate against per-turn upkeep: enemy logic is where physical games get slow, and the
   flip is currently free.
2. **Identity across a floor.** Whether the ten-or-so cards of a floor deck are ten faces of one
   monster, a monster and its lesser company, or ten unrelated threats. Ticket 05's *one enemy per
   floor* was written about a creature you cornered on a map, and it does not translate cleanly to a
   deck. Settle jointly with [ticket 22](22-floor-deck-composition.md) item 2.
3. **Escalation dimensions.** Along which axes an enemy gets harder floor to floor — what it takes
   to defeat, what it costs to fail, or how it behaves — inside ticket 07's upkeep budget at every
   point on the curve.
4. **Whether this ticket still has a subject.** It may collapse entirely into 21 and 22. If a session
   finds nothing here that those two do not already own, **rule it out of scope and close it** rather
   than inventing enemy machinery to justify the node.

## Settled elsewhere — do not relitigate

- **Representation, arrival, and persistence** — [ticket 18](18-floor-encounter-decisions.md). An
  enemy is a floor card; it arrives on the flip; a card that beat you returns via the discard pile.
- **Damage to the player, damage to the enemy, and who chooses what is lost** —
  [ticket 21](21-defeating-a-floor-card.md).
- **"You cannot simply leave"** `[you, ticket 06]` — now satisfied structurally: the floor deck must
  be beaten to advance and failures come back around. This ticket no longer owes a pursuit mechanism.
- **Boss distinction** — struck by ticket 05, and now owned as *the last card* by ticket 22 item 3.

## Must satisfy

- The encounter loop settled in ticket 18.
- The turn economy settled in ticket 07, including its upkeep budget.
- Ticket 06's constraint that **something acts on the player every turn** — carried by the flipped
  card, so anything added here is on top of a bar already cleared.
