# 09 — Design the card acquisition and deckbuilding model

Type: grilling
Status: open
Blocked by: 04
Map: [core design map](../map.md)

## Question

How does the deck grow during a run? This is the "deckbuilding" half of "deckbuilding roguelite",
and it collides directly with ticket 04's resource model.

Decide:

1. **The source.** Central market, per-room rewards, item pickups found while running through
   rooms, or a combination. The pitch says players *"find items that help grow their deck's
   abilities"* — decide whether that means a market, loot, or both.
2. **The cost.** Is acquisition free (a reward) or paid (a purchase)? If paid, paid with what —
   and if the currency is cards, this is the same resource as energy and HP, which makes every
   purchase a self-harm decision. Rule on whether that is the design.
3. **The HP collision.** Under ticket 04, if the deck is health, then acquiring cards *heals* you
   and a lean deck is a *fragile* deck. This inverts the standard deckbuilding instinct. Confirm
   how ticket 04 resolved this and state the acquisition rules that follow from it.
4. **Where new cards go.** Into the discard, on top of the deck, into hand, into a separate zone.
   Under a deck-as-resource model this choice has real teeth.
5. **Thinning.** Whether cards can be removed, trashed, or upgraded, and what that costs. **Read
   ticket 15 before answering this** — thinning is the hinge of this design, and it pulls two ways
   at once. In the CCG, where the deck was the life total, thinning was self-harm and never became
   a strategy. In a deckbuilder, thinning is one of the strongest strategies there is, because a
   small deck cycles fast and concentrates its best cards into the chains players build decks to
   find. This game contains both pressures simultaneously. Ticket 15 explores whether that
   collision becomes the engine — damage as a *cull* the player steers. Whatever it concludes, this
   ticket decides whether **voluntary** thinning is also available, and at what price, alongside
   the involuntary kind.
   - Related, from the same source: **any card that returns cards to the resource pool is a healing
     card and a refuelling card at the same time.** Whatever ticket 04 settled as the recursion
     guard rail applies to every acquirable card this ticket lets into the game.
6. **Persistence.** Whether the deck resets between floors, and whether anything survives a run.
   (The between-runs half of this stays in the fog under meta-progression.)
7. **Deck size.** Starting deck size and shape, and whether there is a ceiling.

## Must satisfy

- The resource model settled in ticket 04.
- The pressure filter settled in ticket 06 — shopping is the classic place where a frantic game
  goes quiet. Check it and record the check.

## Settled upstream by ticket 04 — do not relitigate

- **The inversion is the design** `[you]`. No rule will be added to let players thin safely.
- **Sub-question 3 is answered.** Because the deck does not recycle during a floor, the trade falls
  out of the structure with no keyword: **a card you add is +1 floor-time and −1 consistency.** It
  makes you able to stay on the floor longer, and it makes you worse, because you get exactly one
  pass through your deck and every mediocre card appears instead of the one you needed. This is the
  answer to "what makes adding a card ever feel costly" — it needs nothing invented.
- **Sub-question 4 is constrained.** There is no discard pile. A new card goes into the deck, on top
  of it, into hand, or into exhaust — and "into exhaust" now means *unavailable until the floor is
  cleared*, which is a real cost worth using deliberately.
- **Sub-question 5's involuntary half is settled by ticket 15**, which resolved against the cull:
  damage is random, off the top, pure loss. This ticket still decides whether **voluntary** thinning
  exists and at what price.
- **Sub-question 6 is partly settled**: the exhaust pile returns to the deck when a floor is cleared.
  What persists between *runs* remains in the fog.
- **The recursion guard rail is: there isn't one** `[you]`. Balance is handled per-mechanic. Any card
  this ticket lets in that returns cards from exhaust is a heal, a refuel, and a floor-clock
  extension simultaneously — judge each on its own merits, and see ticket 04's recorded dissent.
