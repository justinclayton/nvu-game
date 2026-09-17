# *North vs Up*: Rulebook

---

## Intro

Something came down on Pyramid Tower and moved in. **Red** and **Gray** are going in to find out what it is.

Ten floors. On each one you land in the dark, run through whatever is in front of you, grab
whatever is not nailed down, and kill the thing that is guarding the stairs. If you're not prepared, you can always run -- but it'll keep rearing its ugly head until you take it down.

To succeed, **Red and Gray must work together**. Each have their own strengths, and only through communication and teamwork will you be able to avoid doom.

When you clear a floor, you move up. Because it's a pyramid, there will be fewer rooms to scavenge before you hit trouble all over again. When the final floor has been cleared and you reach the rooftop, you WIN!

---

## About the game

*North vs Up* is a cooperative roguelike deckbuilding card game intended for **two players**. One player plays as the aggressive and headstrong `Red`, while the other plays as the scrambling and resourceful `Gray`. Each character has their own deck that reflects these traits. As you ascend the tower, you will have opportunities to add new `Red`/`Gray`-specific cards to your deck. In addition, most floors will be littered with `Stuff` that you will need to collect and use in tandem with the other cards in your deck to progress.

Some things to note about how *North vs Up* works:

**Your deck is your HP total, called `Stamina`.** Be careful to not go through your deck too quickly, because if you run out of `Stamina`, you'll risk going `Down`. If at any time both players are `Down`, you lose the game!

**You choose how many cards to draw**. You'll draw a card into your hand, look at it, and then decide if you want to draw another card or stop. You can even wait to see what your partner draws before deciding as a group. If you hand is full, however, you'll have to wait -- you can't draw unless you have less than **5 cards** in your hand.

**Playing a card costs other cards.** You pay for a card by discarding other cards from your hand. The more cards in your hand, the more you'll be able to pay for expensive cards. Cards you don't spend stay in your hand for the next turn -- but a full hand can't draw.

---
## Setup

Choose one player to be `Red`, and one to be `Gray`. Ideally you should sit on the same side of the table as you play.

### Character decks

Each player grabs the **starter cards** for their character. This will form your initial deck, which goes face-down in front of you. Shuffle all remaining character cards to form each character's' **reward pool**.

### Floor deck

Assemble the floor deck for Floor 1. The first floor consists of **10** cards. As you move up, each subsequent floor will have one fewer card than the previous one (until the final battle at the top of the pyramid tower!).

To create the floor deck, first add the `Enemy Room` marked with the number of floor you're building, then select randomly from the available Floor cards until you have the right number. Shuffle these cards together and place them in the middle of the table, face down.

### Placeholder for diagram of an example table layout at start of game

By each player:

- **Character Deck** (face down)
- **Discard pile** (face up): Cards you have spent or lost.
- **Hand**: Cards you draw, hold, and use to play.
- **Reward Pool** (face down): Cards you will add to your deck throughout the game.
- **Play zone**: Blank area where your cards will be played.

In the middle of the table:

- **Floor deck** (face down)
- **Rooms pile** (face up): the card on the top of the Rooms pile is considered the Active Room.
- **Good Stuff** pool (face down)
- **Bad Stuff** pool (face down)
- **Scrapyard** (face up): cards that have been `Scrapped` (removed from the game permanently)

---
## Each Turn

### 1. New Room

Turn the top card of the Floor deck face up onto the Rooms pile. This is the new Active Room.

### 2. Draw

Both players draw **1** card at the same time. Players then take turns drawing a card, one at a time, as many times as they like.

- **Draw**: Move the top card of your deck into your hand.
- **Full Hand**: If you are holding **5** or more cards, you have a `Full Hand` and cannot draw. If you are forced to draw with a `Full Hand`, that card goes into your discard pile instead.
- **Last Stand**: If you are in `Last Stand`, skip the opening draw.

The phase ends when both players pass.

### 3. Play

Players take turns playing a card. You may not draw during this phase.

- **Play**: Move a card from your hand into your play zone and pay for it: look at its `Cost`, then move that number of cards from your hand to your discard pile. Unless otherwise specified, you can only pay for a card with other cards from your own hand. If a card's cost is 0 or less, play the card for free.
- **Add up stats**: Stats on played cards add together across both sides of the play zone into one team pool.

> *Example: `Red` plays a card with `Oomph 2`. `Gray` plays two cards, which read `Oomph 1`, and `Scramble 2`. Together, they have `Oomph 3` and `Scramble 2`.*

The phase ends when both players pass.

### 4. Outcome

Players add their combined stats they accumulated this turn and check to see if they Cleared one or more challenges, or if they must Flee.

**Clear**: If any challenge's threshold has been met or exceeded, the players `Clear` the room. Resolve each cleared challenge's outcome according to the text on the card. If more than one challenge has been cleared, their outcomes may be resolved in any order.

> If any challenge's outcome says to `Ascend`, the entire Floor is cleared. Skip the Cleanup phase and instead perform the steps in section: *Ascending*.

**Flee**: If *no challenges* have been cleared, the players must Flee the room. Resolve the `Flee:` outcome according to the text on the card, then **shuffle the room card back into the Floor deck**.

### 5. Cleanup (end of turn)

Each player does the following:

1. **Discard your play zone:** Move every card on your side of the play zone to your discard pile. If you are in `Last Stand`, see section 9 instead.

If both players are `Down` at the end of the turn, the game ends (section 11).

> Players always alternate actions between each other, starting with either player. Either player may pass. If both players pass, the phase ends.

*Example (Draw phase): Red and Gray each draw their opening card, Red draws, Gray draws, Red passes, Gray draws, Gray passes, phase ends.*

*Example (Play phase): Red plays, Gray plays, Red plays, Gray passes, Red passes, phase ends.*

---
## Cards

## 8. Card anatomy

### Room Cards

A room card presents one or more **challenges** to the players. Each turn players will work together to play cards from their hand until they either meet or exceed one or more of the challenges, or, if they are unwilling or unable to complete any challenges, they `Flee`.

#### Placeholder for diagram


- **Name.**
- **Type:** `Enemy`, `Hazard`, or `Stuff`. Note: `Enemy` rooms will also have a number indicating which floor they belong to (`Enemy 1`, etc.)
- **Challenges:** one or more lines with `threshold: outcome`.
- **`Flee`**: what happens when no challenges are completed.

### Character cards

#### Placeholder for diagram
A Character card shows:

- **Name**
- **Type line:** `Red` or `Gray`. Note that starter cards are also indicated as such on this line.
- **`Cost`**: the number of cards you discard from your hand to play it.
- **Stats**: `Oomph` and/or `Scramble`. Most cards will have this, though not all. Note that some cards also provide stats as part of their **effect text**.
- **Effect text**, including keywords or other card-specific rules, modifiers, or stat calculations.
- **Rarity border:** `Fine`, `Cool`, or `Woah`. Has no in-game effect.

### Stuff cards

Some rooms will reward you with `Stuff`, which can be either Good Stuff or Bad Stuff. Unless otherwise specified, Stuff cards are added directly to your hand when gained.

Stuff cards are played just like Character cards: they typically have a Cost in order to play them, and they may be used to pay for other cards.

Unlike Character cards, Stuff cards are not specific to one player, and may be gained and used by anyone.

#### Placeholder for diagram
A `Stuff` card shows the same parts as a player card, with these differences:

- **Type line:** `Good Stuff` or `Bad Stuff`.
- `Bad Stuff` cards do not display a rarity.

### Keywords

- `Holding:` a passive effect that applies while the card is in your hand. If the card is played or discarded, the effect no longer applies.
- `Discard X cards from your hand`: Choose **X** cards from your hand and move them to your discard pile.
- `Exhaust X cards from your deck`: Move the top **X** cards of your deck to your discard pile.
- `Exhaust X`: the same as `Exhaust X cards from your deck`.
- `Scrap`: Move the card to the Scrapyard. It is removed of play for the rest of the game.

---
## 9. Last Stand

**Entering Last Stand**: When your deck becomes empty, your character immediately enters `Last Stand`.

**While in Last Stand**:

- All cards in your hand **ignore their Cost when played**.
- You **do not draw, even if forced**.

**Leaving Last Stand**: At the beginning of the next Cleanup phase:

- If the room was `Cleared`, instead of discarding your side of the play zone, shuffle your play zone to form your new remaining deck, then `Exhaust` **2** cards from the top of your deck.
- If the room was `Fled` instead: you are `Down`.

### Going Down

**When you go Down:** Move your hand to your discard pile.

While Down, you are not able to act.

If both characters are Down at the start of a turn, the game ends (section 11).

---

## 10. Ascending

When you have Cleared the Enemy room, you escape the current floor and `Ascend` to the next. On floor 10, skip this section: you have won (section 11).

Each player does the following:

1. **Separate your discard pile:** Split it into `Stuff` cards and non-Stuff cards.
2. **Say Goodbye to Your Stuff:** `Scrap` the `Stuff` cards. You may keep **one** `Stuff` card by Scrapping **one non-Stuff card** from your discard pile in its place.
3. **Heal:** Shuffle the rest of your discard pile, kept `Stuff` included, into your deck. A `Down` character stands again.
4. **Choose a reward:** Reveal the top **3** cards of your reward pool. You may shuffle **one** into your deck. Put the cards you did not take on the bottom of your reward pool.
5. **Build the next floor:** Section 4.

---

## 11. Winning and losing

**You win** by clearing the Enemy room on floor 10.

**You lose** when both characters are `Down` at end of turn.

---

## Appendix

## Playing Solo

*North vs Up* is intended for two players. Because nothing is hidden between players, it also plays solo with one change.

Play as both `Red` and `Gray`. Keep every deck, pile, and zone as in the two-player game, but combine both hands into one. Draw from either deck in any order. Play cards from your combined hand in any order. When you play a `Red` card, you may **not** pay for it with a `Gray` card, and vice versa. Treat each action as performed by one character.

**If you have more than two hands**, you may ignore this rule change and play as normal.
