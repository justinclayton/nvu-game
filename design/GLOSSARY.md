# North vs Up — glossary

The project's domain terms and nothing else: what each thing is, the rulebook section that governs
it, and the ticket or ruling that settled it. The rules themselves live in
[`rulebook.md`](rulebook.md), which wins wherever this file disagrees with it. Code
uses these terms spelled this way.

---

**Floor**

One level of the tower. A floor is cleared when the players clear its Enemy room, which triggers Ascend. Floor 1's Floor deck has 10 cards; each floor after that has one fewer than the last.

**Floor deck**

The face-down deck in the middle of the table that new Rooms are drawn from. Built by adding the current floor's Enemy Room card, then adding randomly-selected Floor cards until the deck reaches that floor's card count.

**Room**

A card presenting one or more Challenges, turned face up from the Floor deck onto the Rooms pile at the start of a turn.

**Active room**

The Room card on top of the Rooms pile — the one the players are currently facing.

**Challenge**

A `threshold: outcome` line on a Room card. Players compare their Stat pool against the threshold during the Outcome phase; meeting or exceeding it clears that challenge.

**Flee line**

The `Flee:` line on a Room card, resolved when no Challenge is cleared this turn.

**Enemy room**

The Room unique to a floor, one per floor, marked with that floor's number (`Enemy 1`, etc.). Clearing it Ascends the players to the next floor.

**Hazard room**

A Room with two Scramble challenges. The lower threshold clears the room; the higher threshold also reveals the top card of the named character's reward pool as a reward, which that character takes or skips (a skipped card goes to the bottom of the reward pool). Every Hazard room has a Flee line.

**Stuff room**

A Room whose Flee line clears the room but leaves the players empty-handed. Its challenges are split per character (e.g. a Oomph threshold for Red, a Scramble threshold for Gray), each measured against only that character's side of the play zone. Some Stuff rooms have a second, higher challenge. A Down character earns nothing from a Stuff room.

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

The blank area in front of each player where cards are played during the Play phase. Cards here are moved to the discard pile at Cleanup, unless the player is leaving Last Stand after a Clear, in which case they're shuffled into that player's deck instead.

**Type line**

The line on a card stating what it is: `Red` or `Gray` (and whether it's a starter) on Character cards, `Good Stuff` or `Bad Stuff` on Stuff cards, and `Enemy`/`Hazard`/`Stuff` on Room cards.

**Rarity**

The border on a Character or Good Stuff card — `Fine`, `Cool`, or `Woah` — with no in-game effect. Bad Stuff cards don't display one.

**Cost**

The number of cards a player must discard from their hand to play a card. A Cost of 0 or less means the card is played for free. While in Last Stand, a player ignores Cost entirely.

**Cleared**

The result when a turn's Stat pool meets or exceeds at least one Challenge's threshold. The players resolve each cleared Challenge's outcome, in any order if more than one clears.

**Fled**

The result when no Challenge clears this turn. The players resolve the Room's Flee line, then shuffle the Room card back into the Floor deck.

**Ascend**

The outcome, printed on some Challenges, that clears the entire floor rather than just the Room. Triggering it skips Cleanup and moves straight into the Ascending steps.

**Card reward**

A card offered to a player from their reward pool. Comes from a Hazard room's higher threshold (one card, take or skip) or from Ascending (top 3 cards revealed, take up to one into your deck).

**Reward pool**

Each player's face-down pile of that character's remaining cards, shuffled at Setup from everything not in the starting deck. Card rewards are drawn from here.

**Character**

One of the two playable roles, Red or Gray, each with its own deck, Character cards, and reward pool.

**Deck**

A player's face-down pile of cards, built from their character's starter cards at Setup. A deck's size is that character's Stamina; an empty deck puts the character into Last Stand.

**Stamina**

A character's HP, tracked as the size of their deck. Running out (entering Last Stand and then failing to recover) risks going Down.

**Hand**

The cards a player has drawn and is holding, used to play cards and pay Costs. Stuff cards are added directly to hand when gained. Limited by Maximum hand size.

**Maximum hand size**

Five cards. A player holding 5 or more has a Full Hand and cannot draw; if forced to draw anyway, the card goes to the discard pile instead.

**Draw**

The turn phase where both players first draw 1 card at the same time, then take turns drawing a card, one at a time, for as long as they like. A player in Last Stand does not draw, even if forced.

**Play**

The turn phase where players take turns playing a card from their hand into their play zone. Nobody draws during it.

**Discard**

To move a card to its owner's discard pile, from wherever it was: paying a Cost, the `Discard X cards from your hand` keyword, the play zone at Cleanup, the burned draw of a Full Hand, or the hand of a character going Down.

**Discard pile**

A player's face-up pile of spent or lost cards. Played cards move here at Cleanup; cards in it can be shuffled back into the deck (Ascending) or Scrapped.

**Exhaust**

The keyword `Exhaust X`, also written `Exhaust X cards from your deck`: discard the top X cards of your own deck.

**Scrap**

To move a card to the Scrapyard, removing it from the game for good.

**Scrapyard**

The face-up pile of cards that have been Scrapped and removed from the game permanently.

**Holding**

The keyword marking a passive effect that applies only while the card is in hand — it stops applying once the card is played or discarded.

**Turn**

One pass through the five phases: New Room, Draw, Play, Outcome, and Cleanup. Repeats until the floor is cleared (Ascend) or the game ends.

**Last Stand**

The state a character enters immediately when their deck becomes empty. While in it, they ignore Cost when playing cards and do not draw, even if forced. It ends at the next Cleanup: if the room was Cleared, the player shuffles their play zone into a new deck and Exhausts its top 2 cards instead of discarding their play zone as normal; if the room was Fled, the player goes Down instead.

**Down**

The state a character enters from Last Stand after a Fled room. A Down character moves their hand to the discard pile and cannot act. If both characters are Down, the game ends in a loss.
