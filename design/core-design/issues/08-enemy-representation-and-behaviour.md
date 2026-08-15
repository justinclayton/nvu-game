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
7. **Boss distinction.** What *structurally* separates a floor boss from a room enemy: more
   health, a phase change, a rule that breaks a normal rule, or a different subsystem entirely.
   Only the structural distinction is settled here; actual boss encounter design stays in the fog.

## Must satisfy

- The turn economy settled in ticket 07, including its upkeep budget.
- The pressure filter settled in ticket 06.
