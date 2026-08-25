# 24 — Settle starting deck size

Type: grilling
Status: open
Blocked by: 23
Map: [core design map](../map.md)

## Question

How many cards does each character start with?

[Ticket 09](09-card-acquisition-and-deckbuilding.md) put this at **12–15, provisional**, and handed
the number to [ticket 10](10-sim-the-resource-economy.md) on the grounds that it could not be chosen
honestly before ticket 11 said what a card does. Ticket 10 measured it and found **12–15 is far too
small** — and that this is the most powerful dial in the game by a wide margin.

Win rate against starting deck size, everything else held at ticket 10's live tuning:

| Starting deck, per character | 13 | 16 | 19 | 22 | 25 | 28 |
|---|---|---|---|---|---|---|
| Runs clearing the tower | 7% | 16% | 25% | 34% | 43% | 54% |

Every other dial on the map moves the win rate by single digits. This one spans fifty points, and it
does so because of [ticket 04](04-deck-as-energy-and-hp-model.md): the deck **is** the health bar, so
this is the only dial that touches health directly.

**The measurement does not settle the number, because the number is a trade the sim cannot see:**

- **Printing.** Two starting decks of ~22 per character is a real component cost, against
  [ticket 22](22-floor-deck-composition.md)'s room pools and
  [ticket 09](09-card-acquisition-and-deckbuilding.md)'s two reward pools. The map's *table footprint
  and component budget* fog is the other side of this.
- **Table feel.** A run ends at roughly 33 cards per character at a start of 22. Ticket 04 made deck
  height the health bar you read at a glance; a taller stack reads differently, and only a table can
  say whether it still reads.
- **What difficulty the game wants.** 34% is one choice among the row above and nothing has ruled on
  what a North vs Up run should feel like to lose.
- **The starter cards themselves.** Ticket 11 made starters a floor-1 crutch that dilutes away. A
  bigger starting deck is a *longer* crutch, and how much of it is raw stats
  (`starterStatFrac` in the sim) is its own unruled number.

**Blocked on [ticket 23](23-power-growth-across-a-run.md)** because the table above was measured
against a flat throughput ceiling. If 23 lifts the ceiling, more of the difficulty curve is carried
by power growth and less by stamina, and these numbers move.

## What an answer must cover

- The number, per character, and whether Red's and Gray's differ (ticket 09 allowed them to; ticket
  13 owns whether they do).
- How much of a starting deck is raw stats versus effects.
- What win rate — or what feeling — the number was chosen for, so a later balance pass knows what it
  is preserving.
