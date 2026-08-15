# 04 — Design the deck-as-energy-and-HP model

Type: grilling
Status: open
Blocked by: 01
Map: [core design map](../map.md)

## Question

How do "cards as energy" and "cards as HP" work in a physical deckbuilding roguelite?

This is the mechanical heart of the game and the reason the designer is excited about it. It is
held as a **strong hypothesis, not a fixed pillar**: it earns its place by working. If it collapses
under this ticket, record the fallback rather than forcing it.

Decide:

1. **The zones.** What card zones exist, and what each one *means* to the player.
2. **One pool or two.** Is a single pool of cards simultaneously the energy supply and the health
   total, or are they distinct-but-coupled? A single pool is the pure form of the idea and the
   source of its tension; two pools are easier to tune and easier to explain.
3. **Spending.** What does using energy physically do to cards — move them, flip them, discard
   them? Where do spent cards go, and do they come back?
4. **Damage.** What does taking damage physically do to cards? Which zone is hit, who chooses
   which cards are lost, and is that choice interesting or just painful?
5. **The loss condition.** Exactly what state ends a run. If it's "your deck runs out", say what
   running out means given the recycling rules in (3).
6. **The deckbuilder conflict.** A deckbuilder's defining act is *adding cards*. If the deck is
   also HP, then acquiring cards heals you and thinning your deck makes you fragile — which
   inverts the normal deckbuilding instinct to thin. Rule on whether that inversion is the design
   or a problem to engineer around. This is the single most important sub-question here.
7. **Bookkeeping.** How much physical shuffling, counting, and pile-management this asks a human to
   do per turn. A model that is elegant on paper and miserable at a table has failed.

## Inputs

- Ticket 01's findings on how Decipher actually did it. Reference, not answer — that was a
  two-player duelling CCG, not a solo/co-op roguelite.
- **Ticket 02's strongest finding:** the best-attested constraint in all the previous documents is
  *low complexity — no extra physical components, no extra systems; resources are printed on cards
  or are the cards themselves.* It is the only constraint stated imperatively, designated as a
  standing filter for future mechanics, and quoted back independently by both other documents. It
  points at the same place this ticket is already headed, which is either strong corroboration or
  a reason to check that the idea is being adopted on its merits. Rule on it explicitly.
- **Ticket 02's warning:** the previous attempts recorded a cost model as "locked" that was never
  tested, that its own document conceded collides with that components constraint at ~42 cards, and
  that recommended re-running the comparison *before committing* — after committing. Do not inherit
  it. Every number in those documents traces to a `prototype/NOTES.md` that does not exist in this
  repo, so no prior figure may be treated as measured. Ticket 10 exists to generate real ones.

## Notes for the session

- Sketch at least two genuinely different models before choosing, so the choice is a choice.
- If the answer implies a fallback branch (what we do if playtesting kills this), record it — the
  map should not dead-end on one mechanic.
