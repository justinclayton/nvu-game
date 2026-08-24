# 21 — Decide what defeating a floor card takes, and what failing it costs

Type: grilling
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

Ticket 18 settled the loop: flip a floor card, try to defeat it, exhaust it on success or take a
consequence and discard it on failure. It did not settle what any of those verbs mean. This ticket
owns the single interaction the whole encounter is made of.

Decide:

1. **The defeat check.** What does the player do with their cards to beat a floor card? Meet a
   printed number, match a type or symbol, satisfy a small set of requirements, or something else.
   State it tightly enough to play.
2. **Is it all-or-nothing?** Ticket 18's rules are binary — defeated or not. Decide whether partial
   progress exists at all, and if it does, where it is recorded. Note the map's **minimise play
   zones** philosophy: a damage track on a floor card is exactly the sort of thing this project
   would rather express with cards it already has.
3. **Does a card remember?** If a floor card goes to the discard pile after a failed attempt, is it
   met fresh next time or does it carry something with it? This is the descendant of the old *does
   damage to the enemy persist when you break off* question, and it is just as load-bearing: it is
   the difference between *chip it down over several passes* and *you must beat it outright, one
   attempt at a time.*
4. **The negative consequence.** What failing costs. Whether it is printed on each floor card, a
   single general rule, or both. Under ticket 04 the natural currency is *exhaust X cards from your
   deck* — unchosen loss, off the top — but say so explicitly rather than assuming it.
5. **Can you decline to fight?** A player who can see they cannot beat the flipped card may want to
   take the consequence deliberately rather than spend into a loss. Decide whether that is a legal
   move, a free one, or the same thing as failing.
6. **The reward.** Ticket 18 says a defeated card *may* give a reward. Decide what kind — cards,
   stamina back, something removed from the deck — how often a floor card carries one, and how it
   sits against ticket 05's card reward on ascending without making floors a second deckbuilding
   step.
7. **Does a floor card do anything other than present a defeat condition?** Whether it can act on a
   later turn, change the next flip, or stay in play once met. The flip is currently free — an enemy
   that has to be *run* costs upkeep every turn it exists, and physical games get slow exactly here.
   Ticket 06's *something acts on you every turn* is already satisfied by the flip alone, so anything
   added here is on top of a bar that is already cleared, and needs its own reason. `[from ticket 08]`
8. **Who fights.** Both characters act against the same flipped card each turn, under ticket 03's
   strict alternating turns. Decide whether defeating it is a joint effort, whether one character
   can carry it alone, and who eats the consequence when it is not defeated.

## Must satisfy

- The encounter loop settled in [ticket 18](18-floor-encounter-decisions.md).
- The resource model settled in [ticket 04](04-deck-as-energy-and-hp-model.md) — costs come from
  hand, unchosen damage comes off the deck, nothing returns during a floor.
- Ticket 06's pressure constraints. **Something must act on the player every turn** is now carried
  by the flipped card itself, so this ticket owns whether that is enough.
- The map's **minimise play zones** philosophy. The floor deck has already added a draw pile, a
  discard pile, and an exhaust pile to the table. Adding anything further needs a stated reason.
- **Ticket 07's upkeep budget**, at every point on the escalation curve — inherited with item 7 from
  ticket 08, which was closed into this ticket and ticket 22.

## Notes for the session

- This and [ticket 22](22-floor-deck-composition.md) are **siblings**, not a sequence — what a card
  takes to beat and what mix of cards a deck holds are the same tuning question seen from two sides.
  Whichever resolves second must check itself against the first and record the check.
- Beware a defeat check that is really an arithmetic exercise. The pillar is *reacting to what is in
  front of you*, and a turn spent totalling numbers is a turn spent not scrambling.

## Provenance

`[proposed by agent → awaiting your approval, 2026-08-23]` Created to hold the questions
[ticket 18](18-floor-encounter-decisions.md) explicitly left open when the floor-deck decision landed.
Nothing in it is decided.
