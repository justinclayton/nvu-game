# *North vs Up*: Rulebook

Rules version: 0.2.3

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

**Your deck is your HP total, called `Stamina`.** Cards you lose do not come back. If you need a card and have none left, you go `Down`, and the game is lost.

**You draw up to five cards each turn.** Cards you don't spend stay in your hand.

**Playing a card costs other cards.** You pay for a card by discarding other cards from your hand. When your deck runs out, your discard pile becomes your new deck.

---
## Setup

Choose one player to be `Red`, and one to be `Gray`. Ideally you should sit on the same side of the table as you play.

### Character decks

Each player grabs the **starter cards** for their character. This will form your initial deck, which goes face-down in front of you. Shuffle all remaining character cards to form each character's **reward pool**.

### Floor deck

Floors 1–3, 4–6, and 7–9 each share one `Room` pool and one `Stairwell` pool, called a `band`. Floor 10 has no band: it uses one fixed `Stairwell` instead.

Assemble the floor deck for the floor you're building:

1. **Draw the Stairwell:** Take one `Stairwell` at random from the floor's band, or the fixed Floor 10 card.
2. **Draw the Rooms:** Take `Room` cards at random from the same band until the deck holds this floor's count: **10** on Floor 1, one fewer each floor after.
3. **Shuffle** the drawn cards together and place them in the middle of the table, face down.

### Placeholder for diagram of an example table layout at start of game

By each player:

- **Character Deck** (face down)
- **Discard pile** (face up): Cards you have spent.
- **Exhaust pile** (face up): Cards you have lost.
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

### 1. Turn Start

1. **Flip the room:** Turn the top card of the Floor deck face up onto the Rooms pile. This is the new Active Room.
2. **Draw up to five:** Each player draws cards from their deck until they hold **5**. If you already hold 5 or more, do not draw. Resolve effects triggered by these draws after both players have drawn.

- **Draw**: Move the top card of your deck into your hand. If your deck is empty, see `Empty deck` (section 8).

### 2. Play

Players take turns playing a card.

- **Play**: Move a card from your hand into your play zone and pay for it: look at its `Cost`, then move that number of cards from your hand to your discard pile. Unless otherwise specified, you can only pay for a card with other cards from your own hand. If a card's cost is 0 or less, play the card for free. Resolve effects triggered by playing or paying for a card after that card's own text.
- **Add up stats**: Stats on played cards add together across both sides of the play zone into one team pool.

> *Example: `Red` plays a card with `Oomph 2`. `Gray` plays two cards, which read `Oomph 1`, and `Scramble 2`. Together, they have `Oomph 3` and `Scramble 2`.*

The phase ends when both players pass.

### 3. Outcome

Players add their combined stats they accumulated this turn and check to see if they met one or more challenges, or if they must Flee.

**Clear**: A challenge is met when the players' stats meet or exceed any of its thresholds. A threshold that prints both stats is met only when the players' stats meet or exceed both. If one or more challenges are met, the players `Clear` the room. For each met challenge, resolve the outcome of **one** threshold: the lowest-printed threshold met in that challenge. If more than one challenge is met, their outcomes may be resolved in any order.

> If a resolved outcome says to `Ascend`, the entire Floor is cleared. Perform the Cleanup phase as normal, then perform the steps in section 10: *Ascending*.

**Flee**: If *no challenges* have been met, the players must Flee the room. Resolve the `Flee:` outcome according to the text on the card, then **shuffle the room card back into the Floor deck**.

### 4. Cleanup (end of turn)

Each player does the following:

1. **Discard your play zone:** Move every card on your side of the play zone to your discard pile.

> In the Play phase, players always alternate actions between each other, starting with either player. Either player may pass. If both players pass, the phase ends.

*Example (Play phase): Red plays, Gray plays, Red plays, Gray passes, Red passes, phase ends.*

---
## Cards

## 8. Card anatomy

A number never goes below zero. If an effect would take a card's stat, cost, or a threshold lower than zero, it stops at zero instead.

### Room Cards

A room card presents one or more **challenges** to the players. A challenge lists one or more **thresholds**, and each threshold has an outcome. Each turn players will work together to play cards from their hand until they either meet or exceed one or more of the challenges, or, if they are unwilling or unable to complete any challenges, they `Flee`.

There are two kinds: `Room` and `Stairwell`. Only a `Stairwell`'s challenges print `Ascend`.

#### Placeholder for diagram


- **Name.**
- **Type line:** `Room` or `Stairwell`, and the band of floors it belongs to (`Room · Floors 4–6`).
- **Flavor line.**
- **Challenges:** one or more, each listing one or more `threshold: outcome` lines. A threshold prints one stat, or both (`Oomph 7 and Scramble 7`).
- **`Flee`**: what happens when no challenges are met.

### Character cards

#### Placeholder for diagram
A Character card shows:

- **Name**
- **Type line:** `Red` or `Gray`. Note that starter cards are also indicated as such on this line.
- **`Cost`**: the number of cards you discard from your hand to play it.
- **Stats**: `Oomph` and/or `Scramble`. Some cards have neither, and some grant stats in their effect text.
- **Effect text**: keywords and card-specific rules.
- **Rarity border:** `Fine`, `Cool`, or `Woah`. Has no in-game effect.

### Stuff cards

`Stuff` is `Good Stuff` or `Bad Stuff`. Unless a card says otherwise, Stuff you gain goes into your hand. If its pool is empty when you would gain Stuff, you gain nothing.

Play and pay with Stuff cards as with Character cards. Either player may gain and use any Stuff card.

#### Placeholder for diagram
A `Stuff` card shows the same parts as a player card, with these differences:

- **Type line:** `Good Stuff` or `Bad Stuff`.
- `Bad Stuff` cards do not display a rarity.

### Keywords

- `Holding:` a passive effect that applies while the card is in your hand. If the card is played or discarded, the effect no longer applies.
- `for free`: Play the card without paying, whatever cost modifiers you hold.
- `Discard X cards from your hand`: Choose **X** cards from your hand and move them to your discard pile.
- `Exhaust X cards from your deck`: Move the top **X** cards of your deck to your Exhaust pile. If your deck is empty, see `Empty deck`.
- `Exhaust X`: the same as `Exhaust X cards from your deck`.
- `Peek X`: Look at the top **X** cards of any deck, then put them back in the same order.
- `Scrap`: Move the card to the Scrapyard. It is removed from play for the rest of the game.
- `Empty deck`: If you must draw or Exhaust a card and your deck is empty, first shuffle your discard pile to form a new deck. If your discard pile is also empty, you go `Down` (section 9).

---
## 9. Going Down

If you must draw or Exhaust a card and your deck and discard pile are both empty, you go `Down` and the game is lost (section 11).

---

## 10. Ascending

When a resolved outcome says `Ascend`, you escape the current floor and move to the next. On floor 10, skip this section: you have won (section 11).

After Cleanup, each player does the following:

1. **Shuffle your hand into your deck.**
2. **Choose a reward:** Reveal the top **3** cards of your reward pool. You may shuffle **one** into your deck. Put the cards you did not take on the bottom of your reward pool.
3. **Build the next floor:** Return every room still in the floor deck, Fled rooms included, to its band's pool. Rooms you cleared, the Stairwell included, stay on the Rooms pile. Then assemble the new floor as in Setup, *Floor deck*.

---

## 11. Winning and losing

**You win** by clearing floor 10's Stairwell.

**You lose** when either character goes `Down`.

---

## Appendix

## Playing Solo

Play as both `Red` and `Gray`. Keep every deck, pile, and zone as in the two-player game. Each character draws up to five from their own deck. Play cards from either hand in any order. You may **not** pay for a `Red` card with a `Gray` card, or vice versa.
