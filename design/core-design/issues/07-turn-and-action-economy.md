# 07 — Define the turn and action economy within a floor

Type: grilling
Status: open
Blocked by: 03, 04, 06, 18, 21
Map: [core design map](../map.md)

## Question

What does a player actually *do*, in order, from the moment a floor begins to the moment it ends?

Decide:

1. **Phase sequence.** The literal ordered steps of a turn, stated tightly enough that someone
   could follow them without asking a question.
2. **Hand size** — starting, maximum, and whether it changes during a floor.
3. **Draw** — when it happens, how much, and what it costs under ticket 04's model.
4. **Actions per turn.** How many, and whether actions are a distinct currency from energy or the
   same thing.
5. **What ends a turn**, and in a multiplayer configuration, what the other players are doing
   while one player acts.
6. ~~**What ends a floor.**~~ **Struck by ticket 18.** `[you]` A floor ends when the floor deck has
   been exhausted. What remains here is only where the **flip** sits in the phase order relative to
   drawing — ticket 18 says the card is flipped at the **start of the turn**, before the draw
   phase, so the players always see what they face before they spend. Fit that in and do not move it.
7. **Interrupts and reactions.** Whether a player can act outside their own turn. This is a major
   lever on the frantic pillar and on downtime.
8. **Upkeep.** The physical actions a human performs each turn: shuffling, flipping, sliding
   cards between piles, tracking counters. Count them honestly.

## Settled upstream — do not relitigate

From ticket 03, **as amended by ticket 21**: ~~strict alternating turns~~ — **both characters act
simultaneously, either of them in any order.** **Fully open information.** Two
characters always in play, each with their own deck and health pool, controlled by one player each
in co-op and both by one player solo. A character at zero is **down, not dead**.

What remains open here is everything *inside* a turn, plus: whether the alternation is fixed
Red-then-Gray or the party chooses who leads each round; what happens to the sequence when one
character is down; and whether a full round is Red+Gray or something finer.

## Must satisfy

- The player-count model settled in ticket 03.
- The resource model settled in ticket 04.
- The floor structure settled in ticket 05, **as amended by ticket 18** — a floor is a deck played
  against, not a plan moved around on.
- The encounter loop settled in [ticket 18](18-floor-encounter-decisions.md), and the defeat check
  settled in [ticket 21](21-defeating-a-floor-card.md). The turn's shape is now largely fixed by
  them: flip, draw, try to beat the card, resolve. This ticket owns what happens inside that.
- The pressure constraints from ticket 06 (*Decide what creates the frantic, in-over-your-head
  pressure*) — **there is no filter**. 06 rejected the one-liner it was asked for, so hold the turn
  structure up against its rulings by argument, and record the check.
- There is **no filter from ticket 18 and no topology from ticket 19** — 18 resolved on a structural
  ruling and wrote no filter, and 19 was abandoned with the spatial floor. The phases designed here
  must still be the phases in which real choices get made; a phase sequence that wraps no decisions
  has failed, however tidy it is. Record the check by argument.

## Overlap to watch

Item 6 (*what ends a floor*) overlaps ticket 05's run structure and ticket 18's engagement rules.
If either has already settled it, adopt rather than re-decide, and say which ticket owns it.

## Notes for the session

- This is the ticket most likely to reveal that an upstream decision does not work. If it does,
  say so and reopen the upstream ticket rather than patching around it here.

## Settled upstream by ticket 21 — the five phases

`[you, 2026-08-23]` The grilling session on [ticket 21](21-defeating-a-floor-card.md) settled the
turn's shape. It is recorded here because this ticket owns it:

1. **Flip.** Draw a room from the floor deck and place it face up in the **active room zone**.
2. **Draw phase.** Both players at once, in any order. A player draws one card at a time into hand,
   deciding after each whether to draw again, until they declare they are done.
3. **Play phase.** Both players in any order, until they cannot or choose to stop. Playing a card
   Exhausts cards from that player's hand equal to its **cost**, then places it face up in the
   **play zone**, where its **stats** join the shared pool. The moment the pool meets the room's
   challenge the room is **Cleared** — exhausted from the floor deck, paying any reward printed on it.
4. **Cleanup.** If the room is still there, take its punishment and send it to the **Fled** pile.
   Then exhaust every card in hand **and** in the play zone, except `Hold` cards still in hand.
5. **Turn end.**

What this leaves this ticket: **hand size** (if any), **actions per turn**, **interrupts**, the
**upkeep count**, and what happens to the sequence when one character is down. Note that item 5 of
the original question — what the other player does while one acts — is dissolved rather than
answered: they act at the same time.

**The tension is all in phase 2** `[you]`. Cleanup exhausts the hand regardless, so a card not played
was lost anyway and cards spent on costs were about to die — in the play phase, playing everything
legal is very nearly always right. This was accepted deliberately, with `Hold` as what keeps the play
phase from being empty. If a table says it needs a fix, ticket 21 logged the surgical one: pay costs
from the **deck** rather than the hand. Do not adopt it here without the human.

## Settled upstream by ticket 04 — do not relitigate

- **Start of turn: the player decides how many cards to *draw* from deck to hand.** This is the
  core decision of the game. Every card drawn is stamina spent whether used or not.
- **Playing an X-cost card = "exhaust X cards from your hand."** The played card also exhausts.
- **Damage = "exhaust X cards from your deck."** Chosen costs come off the hand; unchosen punishment
  comes off the deck.
- **The whole hand exhausts at end of turn**, with **Hold** as the exception for situational and
  equipped cards.
- **Exhausted cards do not return during a floor.** There is no discard pile.
- **A character is exhausted (down) when they begin a turn and cannot draw.**
- ~~**No mandatory minimum draw.**~~ **Reversed by ticket 04 `[you, 2026-08-23]`: each character
  must draw at least one card during the draw phase.** Declining a room is therefore no longer free —
  the turn costs the team two cards whether or not they engage. A character who cannot meet the
  minimum because their deck is empty is **down**; one who cannot meet it because their hand is at a
  cap simply declares themselves done, which is why the cap below is now load-bearing rather than
  cosmetic.

What this ticket still owes, sharpened by the above:

- **Hand size.** Is there a cap on drawing at all, or is cost the only limit? Ticket 04's finding
  is that a hand is *tools and fuel* simultaneously, so over-drawing is already self-limiting — a
  printed cap may be unnecessary.
  - **The argument that forced a cap has lapsed.** Ticket 05 made a maximum hand size *required*
    because scavenged items went to hand with Hold and their whole cost was occupying hand space.
    Ticket 18 removed rooms and therefore scavenging, so that pressure is gone and the cap is an open
    question again. Whether floor cards hand out anything that lives in hand is
    [ticket 21](21-defeating-a-floor-card.md) item 6; wait for it, or rule the cap on its own merits.
- **What still costs stamina, now that movement does not exist.** Ticket 04 ruled that exhausting is
  not a combat verb, and **ticket 06 ruled the principle** `[you]`: **most moves cost stamina in some
  form.** The price list that principle was heading for was written against rooms and doors and died
  with them. This ticket now owes the honest answer to what a turn even contains beyond flipping,
  drawing, and playing — and if the answer is *nothing else*, whether ticket 06's principle has
  been quietly reduced to ticket 04's drain. Say so out loud either way. Note 06 produced **no
  filter** — its constraints are argued case by case.
- **Actions per turn** — whether actions are a separate currency from card costs, or the same thing.
- `[you]` **"Do nothing: recover 1 card" is a logged candidate turn action.** Explicitly unadopted;
  must survive playtest. Ticket 10 owns the number.
- `[proposed by agent → not adopted, logged]` **"Bracing"** — absorbing a point of damage by
  exhausting a card from hand, making blocking an act of stamina rather than a printed stat.
