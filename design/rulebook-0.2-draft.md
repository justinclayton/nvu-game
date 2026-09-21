# *North vs Up*: Rulebook

Rules version: 0.2.0 (draft)

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

**Your deck is your HP total, called `Stamina`.** Cards you lose go to your Exhaust pile, and they do not come back. If you ever need a card and have none left, you go `Down`, and the game is lost for both of you.

**You draw up to five cards each turn.** Cards you don't spend stay in your hand for the next turn, so a hand full of things you are saving is a hand that draws less.

**Playing a card costs other cards.** You pay for a card by discarding other cards from your hand. The more cards in your hand, the more you'll be able to pay for expensive cards. When your deck runs out, your discard pile becomes your new deck.

---
## Setup

Choose one player to be `Red`, and one to be `Gray`. Ideally you should sit on the same side of the table as you play.

### Character decks

Each player grabs the **starter cards** for their character. This will form your initial deck, which goes face-down in front of you. Shuffle all remaining character cards to form each character's **reward pool**.

### Floor deck

Assemble the floor deck for Floor 1. The first floor consists of **10** cards. As you move up, each subsequent floor will have one fewer card than the previous one (until the final battle at the top of the pyramid tower!).

To create the floor deck, first add the `Enemy Room` marked with the number of floor you're building, then select randomly from the available Floor cards until you have the right number. Shuffle these cards together and place them in the middle of the table, face down.

### Placeholder for diagram of an example table layout at start of game

By each player:

- **Character Deck** (face down)
- **Discard pile** (face up): Cards you have spent. They become your deck again when it runs out.
- **Exhaust pile** (face up): Cards you have lost. They do not return.
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

Each player does the following:

1. **Draw up to five:** Draw cards from your deck until you hold **5**. If you already hold 5 or more, do not draw.

- **Draw**: Move the top card of your deck into your hand. If your deck is empty, see `Empty deck` (section 8).

### 3. Play

Players take turns playing a card. You may not draw during this phase.

- **Play**: Move a card from your hand into your play zone and pay for it: look at its `Cost`, then move that number of cards from your hand to your discard pile. Unless otherwise specified, you can only pay for a card with other cards from your own hand. If a card's cost is 0 or less, play the card for free.
- **Add up stats**: Stats on played cards add together across both sides of the play zone into one team pool.

> *Example: `Red` plays a card with `Oomph 2`. `Gray` plays two cards, which read `Oomph 1`, and `Scramble 2`. Together, they have `Oomph 3` and `Scramble 2`.*

The phase ends when both players pass.

### 4. Outcome

Players add their combined stats they accumulated this turn and check to see if they Cleared one or more challenges, or if they must Flee.

**Clear**: If any challenge's threshold has been met or exceeded, the players `Clear` the room. Resolve each cleared challenge's outcome according to the text on the card. If more than one challenge has been cleared, their outcomes may be resolved in any order.

> If any challenge's outcome says to `Ascend`, the entire Floor is cleared. Perform the Cleanup phase as normal, then perform the steps in section 10: *Ascending*.

**Flee**: If *no challenges* have been cleared, the players must Flee the room. Resolve the `Flee:` outcome according to the text on the card, then **shuffle the room card back into the Floor deck**.

### 5. Cleanup (end of turn)

Each player does the following:

1. **Discard your play zone:** Move every card on your side of the play zone to your discard pile.

> In the Play phase, players always alternate actions between each other, starting with either player. Either player may pass. If both players pass, the phase ends.

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
- `Exhaust X cards from your deck`: Move the top **X** cards of your deck to your Exhaust pile. If your deck is empty, see `Empty deck`.
- `Exhaust X`: the same as `Exhaust X cards from your deck`.
- `Scrap`: Move the card to the Scrapyard. It is removed from play for the rest of the game.
- `Empty deck`: If you must draw or Exhaust a card and your deck is empty, shuffle your discard pile to form a new deck first. If your discard pile is also empty, you go `Down` (section 9).

---
## 9. Going Down

If you must draw or Exhaust a card and both your deck and your discard pile are empty, you go `Down`. The game is lost (section 11).

---

## 10. Ascending

When you have Cleared the Enemy room, you escape the current floor and `Ascend` to the next. On floor 10, skip this section: you have won (section 11).

After Cleanup, each player does the following:

1. **Settle your Stuff:** Search your deck, hand and discard pile for `Stuff` cards. Stuff in your Exhaust pile stays there.
   - For each `Good Stuff` card, either shuffle it into the Good Stuff pool, or keep it by Scrapping **one** non-Stuff card from your deck, hand or discard pile.
   - For each `Bad Stuff` card, either keep it, or shed it by shuffling it into the Bad Stuff pool and Scrapping **one** non-Stuff card from your deck, hand or discard pile.
   Return each kept card to where you found it, then shuffle your deck.
2. **Choose a reward:** Reveal the top **3** cards of your reward pool. You may shuffle **one** into your deck. Put the cards you did not take on the bottom of your reward pool.
3. **Build the next floor:** Setup, *Floor deck*.

---

## 11. Winning and losing

**You win** by clearing the Enemy room on floor 10.

**You lose** when either character goes `Down`.

---

## Appendix

## Playing Solo

*North vs Up* is intended for two players. Because nothing is hidden between players, it also plays solo with one change.

Play as both `Red` and `Gray`. Keep every deck, pile, and zone as in the two-player game, but hold both hands together. Each character draws up to five from their own deck as normal. Play cards from either hand in any order. When you play a `Red` card, you may **not** pay for it with a `Gray` card, and vice versa. Treat each action as performed by one character.

**If you have more than two hands**, you may ignore this rule change and play as normal.
