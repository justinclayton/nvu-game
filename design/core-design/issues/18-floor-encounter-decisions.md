# 18 — Decide what a floor encounter is and what it presents to the player

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

When a player looks at a floor, what are they *facing*, and what are they *choosing between*?

## Answer

`[you, 2026-08-23]` **A floor encounter is a deck of cards the players play against.** Beating the
deck is what lets them advance to the next floor. This was decided directly, outside a grilling
session, and it replaces the floor-as-2D-plan model wholesale.

### The rules as stated

- The **floor deck** is shuffled at the start of the encounter.
- At the **start of each turn**, one **floor card** is flipped face up. It tells the players what
  they are facing that turn, and they see it before they commit anything.
- The players then take their **draw phase** and use their cards to try to **defeat** the flipped
  card.
- **Defeat it** and the card is **exhausted** from the floor deck — gone for the rest of the
  encounter. The card **may give a reward**.
- **Fail to defeat it** and the players **take a negative consequence**, and the card goes to the
  floor deck's **discard pile**.
- The **discard pile is shuffled back into the floor deck when the draw pile runs out.** A threat
  you could not handle comes back around.
- The encounter is over — the floor is cleared — when the whole deck has been exhausted.

### Why this shape

The failure branch is the point. Being outmatched, backing off, and having the same thing come at
you again later is exactly the **scrambling and fleeing** the frantic pillar is reaching for, and
here it falls out of the deck's own structure instead of needing a chase rule.

### What this settles

- **Engagement is not optional, and the flee loop is structural.** You cannot leave a floor deck
  undefeated. Ticket 06's *"you cannot simply leave"* is now satisfied by the encounter's shape
  rather than by an enemy behaviour, which frees ticket 08 from having to invent pursuit.
- **There is no routing and no geography.** A floor is a sequence of threats in an order the shuffle
  chose, not a space to move through.
- **Information is one card deep.** The players know what they face this turn before spending, and
  nothing about the turn after. Ticket 06's deferred *do you see the whole floor on arrival* question
  is answered: no.
- **Commit versus conserve bites every single turn**, and it bites at a known target — you can see
  the card, so the question is always *can I afford to beat this one now, or do I eat the
  consequence and meet it again later.*
- **The co-op question** — Red and Gray no longer move independently, because there is nowhere to
  move. What they do share or split is now a turn-economy question for ticket 07.

### Superseded in part

`[you, 2026-08-24]` [Ticket 22](22-floor-deck-composition.md) changed the win condition stated in
*The rules as stated* above. ~~The encounter is over — the floor is cleared — when the whole deck
has been exhausted.~~ A floor deck now holds exactly one **combat room**, and clearing it ends the
floor — hazard and item rooms are never mandatory to clear, and a floor can end with either kind
still sitting uncleared in the deck. The rest of this ticket's rules — the flip, the
discard-and-reshuffle loop, one card of information at a time — are unaffected.

### What it deliberately does not settle

These are open, and are ticketed, not decided here:

- **What "defeat the card" actually requires** — the check itself. → [ticket 21](21-defeating-a-floor-card.md)
- **What a negative consequence is**, and whether it is printed per-card or a general rule. → ticket 21
- **What rewards floor cards give**, and how that sits against the ascend reward from ticket 05. → ticket 21
- **How big a floor deck is, what is in it, and how it escalates floor to floor.** → [ticket 22](22-floor-deck-composition.md)
- **Whether a card carries damage with it into the discard pile**, or is met fresh next time. This is
  the descendant of the old *does damage to the enemy persist* question — it is the same design
  question, reborn in the deck. → ticket 21

### Provenance and the filter

The one-line testable filter this ticket was originally asked to produce is **not being written.**
The human declined the same request on ticket 06 — *"no tests, we'll decide these things when we talk
specifics"* — and this ticket now resolves on a direct structural ruling rather than on a grilling
session, so there is nothing for a filter to arbitrate. Tickets 07, 08, 20, 21, and 22 check
themselves against the rules above, argued case by case.

`[proposed by agent → you approved, 2026-08-15]` The ticket itself did not exist during charting; it
was added when the encounter turned out to have no node on the map.
