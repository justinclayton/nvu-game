# 08 — Decide how enemies are represented and how they act

Type: grilling
Status: closed — absorbed
Blocked by: —
Map: [core design map](../map.md)

## Question

What is an enemy, physically, and how does it act in a game with no computer to run it?

## Answer

`[you, 2026-08-23]` **Closed without a session. The ticket no longer has a subject of its own** — the
floor-deck model answered most of it outright and rehomed the rest, and holding the node open would
only invite a session to invent enemy machinery to justify it.

Where each of its seven items went:

1. **Representation** — answered by [ticket 18](18-floor-encounter-decisions.md). An enemy is a card
   in the floor deck.
2. **Arrival** — answered by ticket 18. It is flipped face up at the start of the turn.
3. **Behaviour** — moved to [ticket 21](21-defeating-a-floor-card.md) item 7, as *does a floor card
   do anything other than present a defeat condition?*, carrying ticket 07's upkeep budget with it.
4. **Damage to the player** — [ticket 21](21-defeating-a-floor-card.md) item 4, the negative
   consequence of failing.
5. **Damage to the enemy** — [ticket 21](21-defeating-a-floor-card.md) items 1–3: the defeat check,
   whether partial progress exists, and whether a card carries damage into the discard pile.
6. **Persistence** — answered by ticket 18. There is nowhere to follow the player to; a card that
   beat you returns through the reshuffle instead.
7. **Escalation dimensions** (which replaced the struck boss item) — merged into
   [ticket 22](22-floor-deck-composition.md) item 4, which now names the axes explicitly. Enemy
   **identity across a floor** — whether a deck is one monster or many — is ticket 22 item 2.

**Nothing was decided here**, and nothing was dropped. This is a bookkeeping close, not a ruling:
every open question the ticket held is live on 21 or 22.

`[you, ticket 06]` The one requirement this ticket was carrying — **"you cannot simply leave"** — is
discharged by the encounter's shape rather than by anything an enemy does. The floor deck must be
beaten to advance, and a card you failed against is shuffled back in. No pursuit rule is owed.
