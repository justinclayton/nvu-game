# North vs Up — glossary

The project's domain terms and nothing else: what each thing is, the rulebook section that governs
it, and the ticket or ruling that settled it. The rules themselves live in
[`rulebook.md`](rulebook.md) (rules version 0.2.0), which wins
wherever this file disagrees with it. Code uses these terms spelled this way.

---

**Floor**

One level of the tower. A floor is cleared when a Challenge's outcome says `Ascend` — only a Stairwell prints one. Floor 1's Floor deck has 10 cards; each floor after that has one fewer than the last.

**Floor deck**

The face-down deck in the middle of the table that new Rooms are drawn from. Built from the floor's band: one Stairwell plus Rooms drawn at random until the deck reaches that floor's card count (rulebook, Setup > Floor deck). `[you, 2026-09-23]`

**Band**

One of the three floor ranges — 1–3, 4–6, 7–9 — that each share a Room pool and a Stairwell pool. Floor 10 has no band: it uses one fixed Stairwell instead. `[agent → you, 2026-09-23]`

**Room**

A card presenting one or more Challenges, turned face up from the Floor deck onto the Rooms pile at the start of a turn. Every Room prints as either a `Room` or a `Stairwell`; every Challenge is checked the same way regardless of which. `[you, 2026-09-23]`

**Stairwell**

The Room kind that guards a floor: the only kind whose Challenges can print `Ascend`. One is shuffled into every floor deck, drawn from the floor's band. `[you, 2026-09-23]`

**Active room**

The Room card on top of the Rooms pile — the one the players are currently facing.

**Challenge**

A group of one or more Thresholds on a Room card. A challenge is met when the Stat pool meets or exceeds any of its Thresholds. Every met challenge resolves the outcome of one Threshold: the lowest-printed Threshold met in that challenge. Several challenges on one card may be met on the same turn. `[you, 2026-09-23]`

**Threshold**

A `threshold: outcome` line within a Challenge. Players compare their Stat pool against it during the Outcome phase. A line naming one character says who an outcome pays or targets, never whose side of the play zone counts — every Threshold, on every Room, reads the same shared Stat pool. `[you, 2026-09-17, 2026-09-23]`

**Flee line**

The `Flee:` line on a Room card, resolved when no Challenge is met this turn. A Room that prints no Flee line of its own Flees empty-handed, the same as one whose printed line happens to do nothing.

**Stuff**

Cards gained from Rooms rather than from a character's deck. Stuff is either Good or Bad, added directly to a player's hand when gained, and played like Character cards (with a Cost, usable to pay for other cards). Unlike Character cards, Stuff isn't tied to one character — anyone may gain and use it.

**Good Stuff** / **Bad Stuff**

The two kinds of Stuff card, drawn face down from their matching pool into a player's hand. Bad Stuff cards, unlike Good Stuff, don't display a rarity border.

**Good Stuff pool** / **Bad Stuff pool**

The face-down piles in the middle of the table that Good Stuff and Bad Stuff cards are drawn from.

**Oomph** / **Scramble**

The two stat types a card can carry. Stats from all cards played in a turn add together into the team's Stat pool, which is compared against Room Thresholds.

**Stat pool**

The combined Oomph and/or Scramble total from every card both players played this turn, across both sides of the play zone. Checked against Thresholds during the Outcome phase.

**Play zone**

The blank area in front of each player where cards are played during the Play phase. Cards here are moved to the discard pile at Cleanup.

**Type line**

The line on a card stating what it is: `Red` or `Gray` (and whether it's a starter) on Character cards, `Good Stuff` or `Bad Stuff` on Stuff cards, and `Room` or `Stairwell` plus its band's floors (`Room · Floors 4–6`) on Room cards.

**Rarity**

The border on a Character or Good Stuff card — `Fine`, `Cool`, or `Woah` — with no in-game effect. Bad Stuff cards don't display one.

**Cost**

The number of cards a player must discard from their hand to play a card. A Cost of 0 or less means the card is played for free.

**Cleared**

The result when at least one Challenge is met this turn. The players resolve each met Challenge's outcome, in any order if more than one is met.

**Fled**

The result when no Challenge is met this turn. The players resolve the Room's Flee line, then shuffle the Room card back into the Floor deck.

**Ascend**

The outcome, printed on some Thresholds, that clears the entire floor rather than just the Room. Triggering it runs Cleanup as normal first, then moves into the Ascending steps.

**Settle your Stuff**

Ascending's second step, once the hand has been shuffled into the deck. Every Stuff card in a player's deck and discard pile is found: a Good Stuff card shuffles into the Good Stuff pool unless kept by Scrapping one other owned, non-Stuff card from the deck or discard pile; a Bad Stuff card stays unless shed into the Bad Stuff pool the same way. A kept card is returned to wherever it was found.

**Card reward**

A card offered to a player from their reward pool. Comes from a Room's Threshold outcome (one card, take or skip) or from Ascending (top 3 cards revealed, take up to one into your deck).

**Reward pool**

Each player's face-down pile of that character's remaining cards, shuffled at Setup from everything not in the starting deck. Card rewards are drawn from here.

**Character**

One of the two playable roles, Red or Gray, each with its own deck, Character cards, and reward pool.

**Deck**

A player's face-down pile of cards, built from their character's starter cards at Setup. A deck's size is that character's Stamina. An empty deck reshuffles the discard pile to form a new deck (see Empty deck); if the discard pile is empty too, the character goes Down.

**Stamina**

A character's HP, tracked as the size of their deck and discard pile together. Running out — needing a card with both empty — puts the character Down.

**Hand**

The cards a player has drawn and is holding, used to play cards and pay Costs. Stuff cards are added directly to hand when gained. Draw brings a hand to 5 each turn; nothing else caps it, so a hand can hold more. Ascending's first step shuffles the whole hand into the deck.

**Turn Start**

The turn phase that opens each turn: Flip the room, then Draw up to five. Both steps run together, with no decision between them.

**Draw**

The second step of Turn Start: each player draws from their deck until holding 5, all at once — no decision to make. A draw that reaches an empty deck triggers Empty deck.

**Empty deck**

What a draw or an Exhaust does when it needs a card and the deck is empty: the discard pile shuffles to form a new deck first. If the discard pile is empty too, the character goes Down.

**Play**

The turn phase where players take turns playing a card from their hand into their play zone. Nobody draws during it.

**Discard**

To move a card to its owner's discard pile, from wherever it was: paying a Cost, the `Discard X cards from your hand` keyword, the play zone at Cleanup, or the hand of a character going Down.

**Discard pile**

A player's face-up pile of spent or lost cards. Played cards move here at Cleanup. It recycles: an empty deck reshuffles it to form a new deck (Empty deck). A card in it can also be shuffled back into the deck directly (Ascending, Settle your Stuff) or Scrapped.

**Exhaust**

The keyword `Exhaust X`, also written `Exhaust X cards from your deck`: move the top X cards of your own deck to your Exhaust pile.

**Exhaust pile**

A player's face-up pile of cards Exhausted off their deck. Permanent: unlike the discard pile, nothing here ever returns.

**Scrap**

To move a card to the Scrapyard, removing it from the game for good.

**Scrapyard**

The face-up pile of cards that have been Scrapped and removed from the game permanently.

**Holding**

The keyword marking a passive effect that applies only while the card is in hand — it stops applying once the card is played or discarded.

**Turn**

One pass through four phases: Turn Start, Play, Outcome, and Cleanup. Repeats until the floor is cleared (Ascend) or the game ends.

**Down**

The state a character enters when they must draw or Exhaust and both their deck and discard pile are empty (Empty deck). A Down character's hand moves to the discard pile. One character going Down ends the run in a loss (Winning and losing).
