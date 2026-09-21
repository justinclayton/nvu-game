# North vs Up — glossary

The project's domain terms and nothing else: what each thing is, the rulebook section that governs
it, and the ticket or ruling that settled it. The rules themselves live in
[`rulebook-0.2-draft.md`](rulebook-0.2-draft.md), the current draft, which wins wherever this file
disagrees with it. Code uses these terms spelled this way.

---

**Floor**

One level of the tower. A floor is cleared when the players clear its Enemy room, which triggers Ascend. Floor 1's Floor deck has 10 cards; each floor after that has one fewer than the last.

**Floor deck**

The face-down deck in the middle of the table that new Rooms are drawn from. Built by adding the current floor's Enemy Room card, then adding randomly-selected Floor cards until the deck reaches that floor's card count.

**Room**

A card presenting one or more Challenges, turned face up from the Floor deck onto the Rooms pile at the start of a turn. Its printed type — `Enemy`, `Hazard`, or `Stuff` — is an archetype, read for flavor and for floor-deck composition (see Floor deck); every Room works the same way regardless of it. `[you, 2026-09-17]`

**Active room**

The Room card on top of the Rooms pile — the one the players are currently facing.

**Challenge**

A `threshold: outcome` line on a Room card. Players compare their Stat pool against the threshold during the Outcome phase; meeting or exceeding it clears that challenge. A line naming one character says who an outcome pays or targets, never whose side of the play zone counts — every Challenge, on every Room, reads the same shared Stat pool. `[you, 2026-09-17]`

**Flee line**

The `Flee:` line on a Room card, resolved when no Challenge is cleared this turn. A Room that prints no Flee line of its own (no Stuff room does) Flees empty-handed, the same as one whose printed line happens to do nothing.

**Stuff**

Cards gained from Rooms rather than from a character's deck. Stuff is either Good or Bad, added directly to a player's hand when gained, and played like Character cards (with a Cost, usable to pay for other cards). Unlike Character cards, Stuff isn't tied to one character — anyone may gain and use it.

**Good Stuff** / **Bad Stuff**

The two kinds of Stuff card, drawn face down from their matching pool into a player's hand. Bad Stuff cards, unlike Good Stuff, don't display a rarity border.

**Good Stuff pool** / **Bad Stuff pool**

The face-down piles in the middle of the table that Good Stuff and Bad Stuff cards are drawn from.

**Oomph** / **Scramble**

The two stat types a card can carry. Stats from all cards played in a turn add together into the team's Stat pool, which is compared against Room challenge thresholds.

**Stat pool**

The combined Oomph and/or Scramble total from every card both players played this turn, across both sides of the play zone. Checked against Challenge thresholds during the Outcome phase.

**Play zone**

The blank area in front of each player where cards are played during the Play phase. Cards here are moved to the discard pile at Cleanup.

**Type line**

The line on a card stating what it is: `Red` or `Gray` (and whether it's a starter) on Character cards, `Good Stuff` or `Bad Stuff` on Stuff cards, and `Enemy`/`Hazard`/`Stuff` on Room cards.

**Rarity**

The border on a Character or Good Stuff card — `Fine`, `Cool`, or `Woah` — with no in-game effect. Bad Stuff cards don't display one.

**Cost**

The number of cards a player must discard from their hand to play a card. A Cost of 0 or less means the card is played for free.

**Cleared**

The result when a turn's Stat pool meets or exceeds at least one Challenge's threshold. The players resolve each cleared Challenge's outcome, in any order if more than one clears.

**Fled**

The result when no Challenge clears this turn. The players resolve the Room's Flee line, then shuffle the Room card back into the Floor deck.

**Ascend**

The outcome, printed on some Challenges, that clears the entire floor rather than just the Room. Triggering it runs Cleanup as normal first, then the Ascending steps.

**Card reward**

A card offered to a player from their reward pool. Comes from a Hazard room's higher threshold (one card, take or skip) or from Ascending (top 3 cards revealed, take up to one into your deck).

**Reward pool**

Each player's face-down pile of that character's remaining cards, shuffled at Setup from everything not in the starting deck. Card rewards are drawn from here.

**Character**

One of the two playable roles, Red or Gray, each with its own deck, Character cards, and reward pool.

**Deck**

A player's face-down pile of cards, built from their character's starter cards at Setup. A deck's size is that character's Stamina. A draw or an Exhaust that finds it empty triggers Empty deck.

**Stamina**

A character's HP, tracked as the size of their deck. Running it out risks going Down, by way of Empty deck.

**Hand**

The cards a player has drawn and is holding, used to play cards and pay Costs. Stuff cards are added directly to hand when gained. Draw fills it to Maximum hand size each turn, but nothing caps it after that — a hand may run higher than five.

**Maximum hand size**

Five cards, unless a card you hold says otherwise. What Draw fills your hand to each turn; a draw that would go past it (yours or one a card's text forces) simply doesn't happen.

**Draw**

The turn step where both players draw, at the same time, until each holds five — no decision, so nobody waits on the other. A draw that finds the deck empty triggers Empty deck.

**Play**

The turn phase where players take turns playing a card from their hand into their play zone. Nobody draws during it.

**Discard**

To move a card to its owner's discard pile, from wherever it was: paying a Cost, the `Discard X cards from your hand` keyword, the play zone at Cleanup, or the hand of a character going Down.

**Discard pile**

A player's face-up pile of spent or lost cards that recycles: Empty deck shuffles it into a new deck when the deck runs dry. At Ascending, each Stuff card found in it is Settled (see Settle your Stuff); everything else stays put — there is no heal.

**Exhaust**

The keyword `Exhaust X`, also written `Exhaust X cards from your deck`: move the top X cards of your own deck to your Exhaust pile. A loss you did not choose, off the top, face up. Not to be confused with Discard: the Exhaust pile does not recycle.

**Exhaust pile**

A player's face-up pile of Exhausted cards. Unlike the discard pile, nothing here comes back — not even Empty deck reads it — so a card sent here is gone for the run, barring a card's own text that says otherwise.

**Empty deck**

What happens when a draw or an Exhaust needs a card and the deck is empty: the discard pile is shuffled in to form a new deck first. If the discard pile is also empty, the character goes Down.

**Scrap**

To move a card to the Scrapyard, removing it from the game for good.

**Scrapyard**

The face-up pile of cards that have been Scrapped and removed from the game permanently.

**Holding**

The keyword marking a passive effect that applies only while the card is in hand — it stops applying once the card is played or discarded.

**Turn**

One pass through the five steps: New Room, Draw, Play, Outcome, and Cleanup. Repeats until the floor is cleared (Ascend) or the game ends.

**Settle your Stuff**

Ascending's first step: every Stuff card found in a character's deck, hand or discard pile is Settled. Good Stuff shuffles into the Good Stuff pool for free, or is kept by Scrapping one non-Stuff card of that character's; Bad Stuff stays with its owner for free, or is shed into the Bad Stuff pool the same way. A kept card returns to whichever pile it was found in, then the deck shuffles. There is no heal and no hand discard alongside it.

**Down**

The state a character enters the instant a draw or an Exhaust finds their deck and discard pile both empty (Empty deck). A Down character's hand moves to the discard pile and they take no further part in anything still resolving. Either character going Down ends the run in a loss, at once — not deferred to a turn boundary.
