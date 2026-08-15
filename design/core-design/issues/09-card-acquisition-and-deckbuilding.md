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
5. **Thinning.** Whether cards can be removed, trashed, or upgraded, and what that costs.
6. **Persistence.** Whether the deck resets between floors, and whether anything survives a run.
   (The between-runs half of this stays in the fog under meta-progression.)
7. **Deck size.** Starting deck size and shape, and whether there is a ceiling.

## Must satisfy

- The resource model settled in ticket 04.
- The pressure filter settled in ticket 06 — shopping is the classic place where a frantic game
  goes quiet. Check it and record the check.
