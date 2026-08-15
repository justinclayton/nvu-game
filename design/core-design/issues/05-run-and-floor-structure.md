# 05 — Define the run and floor structure

Type: grilling
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

What is the structure of a run, and what is a floor actually made of?

The pitch contains a strong structural claim — *"each floor should feel like one distinct combat
round"* — which needs to become a mechanical statement before anything downstream can be designed.

Decide:

1. **What "one floor = one combat round" means.** Is a floor literally a single round of play, or
   a bounded sequence of rooms resolved under one pressure envelope? These are very different
   games; the phrase currently covers both.
2. **What a room is.** A card? A tile? A slot on a track? What does entering one do?
3. **How many rooms per floor**, and whether that is fixed, variable, or player-chosen.
4. **Movement.** How the player moves between rooms, whether rooms can be skipped or revisited,
   and whether the floor layout is known in advance or revealed on entry. (Revealed-on-entry is a
   candidate mechanism for ticket 06.)
   - **New since ticket 03:** there are always **two** characters. Do Red and Gray occupy the same
     room, or can they split up? Splitting is a large and interesting lever — it creates the
     "Gray is alone two rooms away and in trouble" scenario that the down-not-dead rule was made
     for — but it roughly doubles the board state a solo player tracks, and it interacts with
     everything ticket 08 decides about which enemies threaten whom. Rule on it here; it is a
     structural question, not a turn-economy one.
5. **The boss.** Where the floor boss sits in the structure and what forces the player to face it.
6. **Ascension.** What beating a boss changes, and what carries between floors.
7. **Escalation.** What gets harder floor to floor, and along which axis.
8. **Run length.** Whether the number of floors is fixed, and roughly how long a full run should
   take at the table.

## Notes for the session

- This ticket is unblocked and can be worked before the resource model exists — but whatever it
  settles must be able to *host* a pressure mechanism (ticket 06). Do not settle a structure with
  no room for time pressure in it.
- Run length and floor count may partly stay in the fog if they depend on the turn economy
  (ticket 07). Settle the structure; leave the numbers to the sim (ticket 10) if needed.

## Settled upstream by ticket 04 — do not relitigate

`[you]`, ruled while resolving ticket 04 on 2026-08-14, because the resource model could not be
settled without it:

**A floor is one continuous encounter.** Not a series of fights with a boss at the end. It is a 2D
floor plan the characters move around over many turns — entering rooms, finding a monster, denting
it, fleeing when they are in over their heads, scavenging for things that help, doubling back,
getting chased along the way. The floor ends by ascending: perhaps a big enemy blocks the exit,
perhaps a key must be found, perhaps there is only one enemy per floor but the players are too busy
running around to face it. A run is many floors.

Two constraints follow directly:

- **A floor should not drag**, and its length is balanced against deck size. Ticket 04's model makes
  these the same dial: floor length ≈ deck size ÷ average conversion per turn, minus damage taken.
- **Ascending restores the exhaust pile** — cards return to the deck, healing to full. Attrition
  therefore lives *within* a floor, not across a run. The run-level arc is deckbuilding, not
  attrition.

This ticket owns the detail — room layout, how the exit is gated, how movement works, how many rooms.
