# 08 — Decide how enemies are represented and how they act

Type: grilling
Status: open
Blocked by: 07
Map: [core design map](../map.md)

## Question

What is an enemy, physically, and how does it act in a game with no computer to run it?

Decide:

1. **Representation.** Card, tile, standee, token, or its own deck. Where it physically sits
   relative to the room and the player.
2. **Arrival.** How enemies enter play — drawn on room entry, spawned by a threat deck, revealed
   by a timer. This is a prime carrier of ticket 06's pressure.
3. **Behaviour.** How an enemy decides what to do without a game AI: fixed rules on the card, an
   initiative track, a shared behaviour deck, or a "they always do the worst thing" heuristic.
   Weigh this against the upkeep budget from ticket 07 — enemy logic is where physical games get
   slow.
4. **Damage to the player.** How an enemy's attack resolves against ticket 04's model, and who
   chooses which cards are lost.
5. **Damage to the enemy.** How the player attacks, what tracks an enemy's remaining health, and
   whether that tracking is a component or a card-state.
6. **Persistence.** Whether unkilled enemies follow the player between rooms or are left behind —
   a large lever on whether the player feels chased.
7. ~~**Boss distinction.**~~ **Struck by ticket 05.** `[you]` There is one enemy per floor and killing
   it grants passage, so boss and room enemy are the same thing and there is no structural distinction
   left to draw. What replaces this item: enemies must **scale in difficulty floor to floor** (ticket
   05's escalation axis), so decide *along which dimensions* an enemy gets harder — health, damage,
   behaviour complexity, or how hard it is to disengage from — and keep the answer inside ticket 07's
   upkeep budget at every point on the curve.

## Routed here by ticket 05 — decide jointly with ticket 19

**Does damage to the floor's enemy persist when the party breaks off contact?** `[you]` Left open
deliberately, because it is downstream of items 1 and 5 above: how the enemy is represented determines
how its damage is tracked, and if separate health tracking is fiddly at the table, "you have to take
it down in one go" becomes the answer.

This is not a small detail. Ticket 04's picture of a floor — dent it, flee, scavenge, come back —
**only exists if damage persists.** Ticket 18 has been told not to assume it. Whichever way this goes,
say so loudly and check it against 18's decision filter.

The map's **minimise play zones** philosophy bears directly on item 5: an enemy health track is
precisely the sort of thing this project would rather express with cards it already has.

## Must satisfy

- The turn economy settled in ticket 07, including its upkeep budget.
- The pressure filter settled in ticket 06.
- The decision filter from ticket 18 and the topology from ticket 19. Items 1 (where the enemy
  physically sits) and 6 (whether unkilled enemies follow the player) are only answerable against a
  settled topology — and if ticket 18 made engagement optional, this ticket owns what an enemy does
  when it is bypassed.
