# 07 — Define the turn and action economy within a floor

Type: grilling
Status: open
Blocked by: 03, 04, 06, 18, 19
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
6. **What ends a floor** — clearing every room, beating the boss, running out of a clock, or a
   condition combining these.
7. **Interrupts and reactions.** Whether a player can act outside their own turn. This is a major
   lever on the frantic pillar and on downtime.
8. **Upkeep.** The physical actions a human performs each turn: shuffling, flipping, sliding
   cards between piles, tracking counters. Count them honestly.

## Settled upstream — do not relitigate

From ticket 03: **strict alternating turns**, Red then Gray. **Fully open information.** Two
characters always in play, each with their own deck and health pool, controlled by one player each
in co-op and both by one player solo. A character at zero is **down, not dead**.

What remains open here is everything *inside* a turn, plus: whether the alternation is fixed
Red-then-Gray or the party chooses who leads each round; what happens to the sequence when one
character is down; and whether a full round is Red+Gray or something finer.

## Must satisfy

- The player-count model settled in ticket 03.
- The resource model settled in ticket 04.
- The floor structure settled in ticket 05.
- The pressure filter settled in ticket 06 — check the turn structure against it explicitly and
  record the check.
- The decision filter settled in ticket 18 and the topology settled in ticket 19. The phases
  designed here must be the phases in which 13's choices actually get made — a phase sequence that
  wraps no decisions has failed, however tidy it is. Record the check.

## Overlap to watch

Item 6 (*what ends a floor*) overlaps ticket 05's run structure and ticket 18's engagement rules.
If either has already settled it, adopt rather than re-decide, and say which ticket owns it.

## Notes for the session

- This is the ticket most likely to reveal that an upstream decision does not work. If it does,
  say so and reopen the upstream ticket rather than patching around it here.

## Settled upstream by ticket 04 — do not relitigate

- **Start of turn: the player decides how many cards to *convert* from deck to hand.** This is the
  core decision of the game. Every card converted is stamina spent whether used or not.
- **Playing an X-cost card = "exhaust X cards from your hand."** The played card also exhausts.
- **Damage = "exhaust X cards from your deck."** Chosen costs come off the hand; unchosen punishment
  comes off the deck.
- **The whole hand exhausts at end of turn**, with **Retain** as the exception for situational and
  equipped cards.
- **Exhausted cards do not return during a floor.** There is no discard pile.
- **A character is exhausted (down) when they begin a turn and cannot convert.**
- **No mandatory minimum conversion.** Explicitly declined — a character who converts nothing has no
  cards and cannot act, so stalling is self-punishing.

What this ticket still owes, sharpened by the above:

- **Hand size.** Is there a cap on conversion at all, or is cost the only limit? Ticket 04's finding
  is that a hand is *tools and fuel* simultaneously, so over-drawing is already self-limiting — a
  printed cap may be unnecessary.
  - **Ticket 05 has since forced this.** `[you]` Scavenged items go to hand with Retain, and their
    stated cost is that they *occupy hand space*. With no cap, that cost does not exist and item
    pickups are free. So a **maximum hand size is now required**, not optional. What remains here is
    the number, whether it applies to conversion or to holding, and how Retained cards count against
    it. Note that the cap is what makes carrying an item a real decision, so it cannot be so generous
    that nobody ever feels it.
- **Whether movement, searching, and other floor actions cost stamina**, and how much. Ticket 04
  ruled that exhausting is not a combat verb — sprinting, searching, forcing a door, tripping all
  can cost. **Ticket 06 has since ruled the principle** `[you]`: **most moves cost stamina in some
  form.** So "whether" is largely settled and this ticket decides **which and how much**, and whether
  they cost from hand or deck. A design that makes most floor movement free contradicts ticket 06 and
  needs to say so out loud. Note 06 produced **no filter** to check against — it rejected the
  one-liner it was asked for, so its constraints are argued case by case.
- **Actions per turn** — whether actions are a separate currency from card costs, or the same thing.
- `[you]` **"Do nothing: recover 1 card" is a logged candidate turn action.** Explicitly unadopted;
  must survive playtest. Ticket 10 owns the number.
- `[proposed by agent → not adopted, logged]` **"Bracing"** — absorbing a point of damage by
  exhausting a card from hand, making blocking an act of stamina rather than a printed stat.
