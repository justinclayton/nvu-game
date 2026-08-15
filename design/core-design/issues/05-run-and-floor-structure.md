# 05 — Define the run and floor structure

Type: grilling
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

What is the structure of a run — the shape of the whole climb?

This ticket owns the **run scale**. The shape of a single floor *as a playable encounter* belongs
to tickets 18 and 19, which this ticket blocks.

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

This ruling **closes** the question this ticket used to open with — whether "one floor = one combat
round" meant a literal single round or a bounded sequence under one pressure envelope. It is the
latter. Do not reopen it.

## Decide

1. **The boss.** Where the floor boss sits in the structure and what forces the player to face it.
   Ticket 04 floated three gate shapes — a big enemy blocking the exit, a key to find, or no gate at
   all with the pressure coming from elsewhere. Rule between them, or hand the choice to ticket 19
   if it turns out to be a topology question.
2. **Ascension.** What beating a boss changes, and what carries between floors. Ticket 04 settled
   that the exhaust pile returns; this ticket settles everything *else* that does or doesn't.
3. **Escalation.** What gets harder floor to floor, and along which axis. Note that ticket 04 put
   attrition inside a floor, so escalation cannot lean on the player arriving weakened.
4. **Run length.** Whether the number of floors is fixed, and roughly how long a full run should
   take at the table.

## Notes for the session

- Whatever this settles must be able to *host* a pressure mechanism (ticket 06). Do not settle a
  structure with no room for time pressure in it.
- Run length and floor count may partly stay in the fog if they depend on the turn economy
  (ticket 07). Settle the structure; leave the numbers to the sim (ticket 10) if needed.
- Settle the run scale and **stop**. Resist specifying room layout, movement, or how many rooms —
  that is ticket 19's job, and settling representation here is the specific failure the rescope
  below was made to prevent.

## Rescope history

`[proposed by agent → you approved, 2026-08-15]` This ticket originally carried encounter-scale
items — what a room is, how many rooms per floor, movement and layout reveal, and whether Red and
Gray may split up. They moved to tickets 18 and 19 when the encounter cluster was charted. The
reason: those items asked for a *physical representation* before anything on the map established
what that representation had to accomplish, and the floor encounter had no owning node at all.

The splitting-up question in particular was recorded here as "a structural question, not a
turn-economy one" — that remains true, but it is *encounter* structure rather than *run* structure,
so it now sits in ticket 18 (may they split) and ticket 19 (what the topology must support if they
can). `[proposed by agent → flag for your review]` — this is the one item of the rescope where a
prior session's placement was overridden rather than merely moved.
