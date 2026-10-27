# *North vs Up*: Rulebook

Rules version: R37

---

## Intro

Flavor Text To Be Written Later.

To succeed, **Red and Gray must work together**. Each have their own strengths, and only through communication and teamwork will you be able to avoid doom.

When you clear a floor, you can rest for a moment, then move up and run into trouble all over again. When the final floor has been cleared and you reach the rooftop and defeat what awaits you, you WIN!

---

## About the game

*North vs Up* is a cooperative roguelike deckbuilding card game intended for **two players**. One player plays as the aggressive and headstrong `Red`, while the other plays as the scrambling and resourceful `Gray`. Each character has their own deck that reflects these traits. As you ascend the tower, you will have opportunities to add new `Red`/`Gray`-specific cards to your deck. In addition, most floors will be littered with `Stuff` that you will need to collect and use in tandem with the other cards in your deck to progress.

Some things to note about how *North vs Up* works:

**Your deck is your HP total, called `Stamina`.** When you run out of cards, you go `Down`, and the game is lost.

**You draw up to five cards each turn.** Cards you don't spend stay in your hand.

**Playing a card costs other cards.** You pay for a card by Exhausting other cards from your hand: they go to your Exhaust pile and never come back. When your deck runs out, your discard pile becomes your new deck.

---
## Setup

Choose one player to be `Red`, and one to be `Gray`. Ideally you should sit on the same side of the table as you play.

### Character decks

Each player grabs the **starter cards** for their character. This will form your initial deck, which goes face-down in front of you. Shuffle all remaining character cards to form each character's **reward pool**.

### Floor deck

The tower is made up of 5 numbered Floors, as well as a Roof where the final battle will take place. Each floor has its own set of cards, consisting of normal `Rooms` and special rooms called `Stairwells`. The Roof only contains one `Stairwell` room.

Assemble the floor deck for the floor you're building by **shuffling** the cards for that floor together and placing them in the middle of the table, face down.

### Table Layout

Placeholder for diagram of an example table layout at start of game

By each player:

- **Character Deck** (face down)
- **Discard pile** (face up): Cards you have played that will be shuffled back in when your deck is empty.
- **Exhaust pile** (face up): Cards you have lost. These cards will not reenter your deck until you complete each Floor.
- **Hand**: Cards you draw, hold, and use to play.
- **Red and Gray Card Reward Pool** (face down): Cards you will add to your deck throughout the game.
- **Play zone**: Blank area where your cards will be played.

In the middle of the table:

- **Floor deck** (face down)
- **Rooms pile** (face up): the card on the top of the Rooms pile is considered the Active Room.
- **Good Stuff** pool (face down)
- **Bad Stuff** pool (face down)
- **Scrapyard** (face up): cards that have been `Scrapped` (removed from the game permanently)

---
## Each Turn

### 1. Start of Turn

1. **Reveal the rooms:** Turn the top **3** cards of the Floor deck face up. If fewer than 3 remain, turn up all of them.
2. **Enter a room:** Choose **one** revealed card and put it on the Rooms pile. This is the new Active Room. If only one card is revealed, you must enter it.
3. **Pass the rest:** Put the other revealed cards on the bottom of the Floor deck, in any order you choose.
4. **Draw up to five:** Each player draws cards from their deck into their hand until they hold **5**. If you already hold 5 or more, do not draw. Resolve effects triggered by these draws after both players have drawn.

>  **Empty Deck**: Whenever your deck is empty and you need to draw, reshuffle your discard pile to form a new deck first.

### 2. Play

Players take turns playing a card. Either player may start. 

- **Play**: Move a card from your hand into your play zone and pay for it: look at its `Cost`, then move that number of cards from your hand to your Exhaust pile (NOT your discard pile). Unless otherwise specified, you can only pay for a card with other cards from your own hand, and never with `Bad Stuff`. If a card's cost is 0 or less, simply play the card. Resolve effects triggered by playing or paying for a card after that card's own text.
- **Add up stats**: Stats on played cards add together across both sides of the play zone into one team pool.

> *Example: `Red` plays a card with `Oomph 2`. `Gray` plays two cards, which read `Oomph 1`, and `Scramble 2`. Together, they have `Oomph 3` and `Scramble 2`.*

The phase ends when both players pass.

### 3. Outcome

Players add their combined stats they accumulated this turn and check to see if they met one or more challenges, or if they must Flee.

**Clear**: A challenge is met when the players' stats meet or exceed any of its thresholds. A threshold that prints both stats is met only when the players' stats meet or exceed both. If one or more challenges are met, the players `Clear` the room, whether or not an outcome says so. For each met challenge, resolve the outcome of **one** threshold: of the thresholds met in that challenge, the one printed furthest down the card. If more than one challenge is met, their outcomes may be resolved in any order.

> If a resolved outcome says to `Ascend`, the entire Floor is cleared. Perform the Cleanup phase as normal, then perform the steps in section 10: *Ascending*.

**Flee**: If *no challenges* have been met, the players must Flee the room. Resolve the `Flee:` outcome according to the text on the card, then **put the room card on the bottom of the Floor deck**.

### 4. Cleanup (end of turn)

Each player does the following:

1. **Discard your play zone:** Move every card on your side of the play zone to your discard pile.

---
## Cards

## 8. Card anatomy

Numbers on cards cannot be less than zero. If an effect would take a card's stat, cost, threshold, etc. lower than zero, it is zero.

### Room Cards

A room card presents one or more **challenges** to the players. A challenge lists one or more **thresholds**, and each threshold has an outcome. Each turn players will work together to play cards from their hand until they either meet or exceed one or more of the challenges, or, if they are unwilling or unable to complete any challenges, they `Flee`.

There are two kinds: `Room` and `Stairwell`. `Stairwell` cards are essentially floor-bosses, and are how players `Ascend` to the next floor.

#### Placeholder for diagram


- **Name.**
- **Type line:** `Room` or `Stairwell`, and the floor it belongs to (`Room · Floor 3`).
- **Flavor text.**
- **Challenges:** one or more, each listing one or more `threshold: outcome` lines. A threshold consists of one or more stats (`Oomph 7 and Scramble 7`). An outcome prints its own reward, and prints `Ascend` when it ends the Floor. It never prints `Clear`.
- **`Flee`**: what happens when no challenges are met.

### Character cards

A Character card shows:

>  Placeholder for diagram

 

- **Name**
- **Type:** `Red` or `Gray`. The type of card. May also print `(starter)`.
- **`Cost`**: the number of cards you Exhaust from your hand to play it. Bad Stuff cannot pay for other cards.
- **Stats**: `Oomph` and/or `Scramble`.
- **Effect text**: keywords and card-specific rules.
- **Rarity border:** `Fine`, `Cool`, or `Woah`. Has no in-game effect.

### Stuff cards

`Stuff` is `Good Stuff` or `Bad Stuff`. Unless a card says otherwise, Stuff you gain goes into your hand. If its pool is empty when you would gain Stuff, you gain nothing.

Play Stuff cards as you play Character cards. Pay for them with Character cards or Good Stuff; `Bad Stuff` cannot pay for other cards. Either player may gain and use any Stuff card.


A `Stuff` card looks similar to a character card:

>  Placeholder for diagram

- **Type line:** `Good Stuff` or `Bad Stuff`.
- `Bad Stuff` cards do not display a rarity.

### Keywords

- `Holding:` a passive effect that applies while the card is in your hand. If the card is played or discarded, the effect no longer applies.
- `Play:` An effect that happens once when the card is played.
- `for free`: Play the card without paying. Overrides all other cost modifiers.
- `Discard X cards from your hand`: Choose **X** cards from your hand and move them to your discard pile.
- `Exhaust X cards from your deck`: Move the top **X** cards of your deck to your Exhaust pile. If your deck is empty, see `Empty deck`. If your deck and your discard pile are both empty, choose the rest from your hand.
- `Exhaust X`: Move **X** cards from your hand, deck, or discard pile to your Exhaust pile. Choose each card: a card from your hand, the top card of your deck, or a card from your discard pile.
- `Get Good Stuff`: Reveal the top **3** cards of the Good Stuff pool. Put **one** into your hand. Put the rest on the bottom of the Good Stuff pool. When both players get Good Stuff from the same outcome, both players reveal their 3 before either chooses, then both put their chosen card into their hand at the same time.
- `Get X Good Stuff`: `Get Good Stuff` **X** times.
- `Get Bad Stuff`: Move the top card of the Bad Stuff pool into your hand.
- `Reveal a card reward`: Reveal the top **3** cards of your reward pool. You may put **one** into your discard pile. Put the cards you did not take on the bottom of your reward pool.
- `Peek X`: Reveal the top **X** cards of ANY face-down pile. Discard any number of them, then put the rest back in any order. If there are fewer than X cards, look at as many as there are; you do not reshuffle the discard pile when you Peek.
- `you may draw X cards`: Draw any number of cards from none up to **X**.
- `any deck`: any face-down pile on the table: a character deck, a reward pool, the Floor deck, or a Stuff pool.
- `Scrap`: Move the card to the Scrapyard. It is removed from play for the rest of the game.
- `may Scrap a card from your hand or discard pile`: Choose **one** card from your hand or your discard pile and `Scrap` it, or choose none. When an outcome says *the other* player, it means the player who did not take the outcome's previous line.

### Room keywords

A room's text may open with one or more keywords.

- `Ambush`: When this room is revealed, you must enter it. Put the other revealed rooms on the bottom of the Floor deck in any order you choose. If more than one revealed room has `Ambush`, choose **one** of them to enter.
- `Cap`: At most **3** cards may be in the play zone, both sides together.
- `Corrosive`: When you pay for a card, `Scrap` the cards you pay with instead of moving them to your Exhaust pile.
- `Dim`: At Start of Turn, draw until you hold **4** instead of 5.
- `Draining`: At Cleanup, move the cards in your play zone to your Exhaust pile instead of your discard pile.
- `Heavy`: Whenever you play a card, `Exhaust 1 card from your deck`.
- `Lockstep`: No player may play two cards in a row.
- `Relentless`: If you Flee this room, put it on the **top** of the Floor deck instead of the bottom.
- `Toxic`: When you enter this room, each player gets Bad Stuff.
- `Unstable`: At Outcome, if you did not meet a challenge that asks for Scramble only, each player Exhausts 2 (see `Exhaust X`).

---
## 9. Going Down

If one player has no cards in their hand, deck, or discard pile, you go `Down`, and the game is lost.

---

## 10. Ascending

When a resolved outcome says `Ascend`, you escape the current floor! You are safe, for now. To move on to the next floor, after receiving your rewards and completing the Cleanup phase as normal, do the following:

1. **Heal and Reset:** Shuffle ALL your cards into your deck, including your hand, discard pile, AND exhaust pile.
2. **Build the next floor:** Assemble the new floor deck *(see Setup -> Floor deck*). All Rooms you cleared stay in the Rooms pile.

---

## 11. Winning and losing

**You win** by clearing the final room on the Roof.

**You lose** when either character goes `Down`.

---

## Appendix

