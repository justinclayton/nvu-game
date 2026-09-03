# *NORTH vs UP*

## Rulebook

---

## 1. Intro

Something came down on Pyramid Tower and moved in. **Red** and **Gray** are going in to find out what it is.

Ten floors. On each one you land in the dark, run through whatever is in front of you, grab
whatever is not nailed down, and kill the thing that is guarding the stairs. If you're not prepared, you can always run -- but it'll keep rearing its ugly head until you take it down.

To succeed, **Red and Gray must work together**. Each have their own strengths, and only through communication and teamwork will you be able to avoid doom.

When you clear a floor, you move up. Because it's a pyramid, there will be fewer rooms to scavenge before you hit trouble all over again. When the final floor has been cleared and you reach the rooftop, you WIN!

---

## 2. About the game

*North vs Up* is a cooperative roguelike deckbuilding card game intended for **two players**. One player plays as the aggressive and headstrong `Red`, while the other plays as the scrambling and resourceful `Gray`. Each character has their own deck that reflects these traits. As you ascend the tower, you will have opportunities to add new `Red`/`Gray`-specific cards to your deck. In addition, most floors will be littered with `Stuff` that you will need to collect and use in tandem with the other cards in your deck to progress.

Some things to note about how *North vs Up* works:

**Your deck is your HP total, called `Stamina`.** Be careful to not go through your deck too quickly, because if you run out of `Stamina`, you'll risk going `Down`. If at any time both players are `Down`, you lose the game!

**You choose how many cards to draw**. You'll draw a card into your hand, look at it, and then decide if you want to draw another card or stop. You can even wait to see what your partner draws before deciding as a group. If you hand is full, however, you'll have to wait -- you can't draw unless you have less than **5 cards** in your hand.

**Playing a card costs other cards.** You pay for cards by putting them in your discard pile (also called the exhaust pile). The more cards in your hand, the more you'll be able to pay for expensive cards. But if you don't use them this turn, they get exhasted too!

---

## 3. Components and layout

Each player has three piles of their own:

|                  |                                            |
| ---------------- | ------------------------------------------ |
| **Deck**         | Face down. This is your `Stamina`.         |
| **Hand**         | Cards you drew this turn. Maximum **5**.   |
| **Exhaust pile** | Face up. Cards you have spent or lost.     |

In the middle of the table:

- The **floor deck**, face down, with the **Fled pile** and the **Cleared pile** beside it.
- The **active room**: the room card you are in right now.
- The **play zone**, split into `Red`'s side and `Gray`'s side.

Off to one side:

- `Red`'s and `Gray`'s **reward pools**.
- The **Good Stuff pool** and the **Bad Stuff pool**.
- The **Scrapyard**.

---

## 4. Setting up a floor

1. **Build the floor deck:** Take **1** Enemy room, **3** Hazard rooms, and Stuff rooms equal to **10 minus the floor number**. Shuffle them together face down.
2. **Keep your hand:** Your hand stays as the last Cleanup left it. At the start of the game it is empty.
3. **Clear the table:** Remove any cards left in the play zone and the active room.

---

## 5. Each turn

Both players take each turn together. Within a phase, act in any order: at the same time, alternating, or a mix.

### Phase 1 — Flip

Turn the top card of the floor deck face up into the active room.

A room card lists one or more **challenges**, each a `threshold: outcome` line, and one `Flee` line.

### Phase 2 — Draw

Draw cards from your deck into your hand one at a time. Stop when you choose.

- You **must** draw at least **1** card. A character in `Last Stand` does not draw (section 9).
- You may **not** draw while you hold **5** or more cards. `Hold` cards count toward this limit. `Stuff` a room puts into your hand ignores it.
- If you hold **5** or more cards, make your required draw anyway and put that card straight into your exhaust pile.
- Draw ends for both players at once. Nobody plays until both players have stopped drawing. Once Play begins, nobody draws.

### Phase 3 — Play

1. **Play cards:** Play cards from your hand into your own side of the play zone, in any order, until both players stop. You may play nothing.
   - To play a card, `Exhaust` cards from your hand equal to its `Cost`. Pay with other cards from your own hand, never your partner's.
   - Played cards stay face up. Their stats add together across both sides of the play zone into one team pool. `Red`'s `Power 2` and `Gray`'s `Power 1, Scramble 2` give the team `Power 3` and `Scramble 2`.
   - Recalculate conditional stats every time the pool is read.
2. **Check the room:** When both players have stopped, compare the team pool to the room's challenges.
   - **Cleared:** If the pool meets any challenge's threshold, the room is `Cleared`. Resolve the outcome of **every** challenge met. Excess over a threshold has no effect.
   - **Fled:** If the pool meets no threshold, the team `Flees`. Resolve the room's `Flee` line. Where a `Flee` line names *1 character*, choose which character. That character takes all of it.

### Phase 4 — Cleanup

In order:

1. **Put away the room:** If the room was `Cleared`, put it in the Cleared pile. If the team `Fled`, put it in the Fled pile. A `Flee` line that itself Clears the room (as a Stuff room's does) counts as Cleared.
2. **Exhaust your hand:** Move every card in your hand to your exhaust pile, except `Hold` cards, which stay in your hand.
3. **Exhaust the play zone:** Move every card on your side of the play zone to your exhaust pile. `Stuff` goes to the exhaust pile of whoever played it.
4. **Refill the floor deck:** If the floor deck is empty, shuffle the Fled pile into it.

### Phase 5 — Next turn

- If the Enemy room was `Cleared` this turn, `Ascend` (section 10).
- If both characters are `Down`, the game ends (section 11).
- Otherwise, start the next turn at Flip.

---

## 6. The three kinds of room

### Enemy room

- Every floor deck has **1** Enemy room. Clearing it ends the floor (section 10). You do not need to empty the floor deck.
- Every Enemy room has a `Flee` line.

### Hazard room

- A Hazard room lists **2** challenges, both `Scramble` thresholds.
- The lower threshold Clears the room.
- The higher threshold also gives a reward: turn the top card of the named character's reward pool face up. That character takes it or skips it. A taken card goes on top of that character's deck. A skipped card goes to the bottom of the reward pool.
- Every Hazard room has a `Flee` line.

### Stuff room

- A Stuff room's `Flee` line reads: *Flee: Clear the room, but leave empty-handed.*
- Its challenges are split per character:

  > *Power 1: Red takes 1 Good Stuff.*
  > *Scramble 1: Gray takes 1 Good Stuff.*

- Measure each character's challenge against that character's own side of the play zone only.
- Some Stuff rooms list a second, higher challenge.
- `Good Stuff` you earn is drawn face down from the Good Stuff pool and goes into your hand. A `Down` character earns nothing.

---

## 7. Stuff

`Stuff` is a card the floor gives you.

- `Stuff` has `Hold` (section 8).
- Play `Stuff` like any other card, or `Exhaust` it from your hand to pay another card's `Cost`.
- `Good Stuff` is earned from rooms. `Bad Stuff` is dealt to you as a punishment. The type line says which kind a card is (section 8).
- Spent `Stuff` goes to the exhaust pile of whoever spent it. When you `Ascend`, `Stuff` in your exhaust pile is `Scrapped` (section 10). `Stuff` still in your hand carries over with `Hold`.

---

## 8. Card anatomy

### Player cards

A `Red` or `Gray` card shows:

- **Name.**
- **Type line:** `Red` or `Gray`.
- **`Cost`**, in the corner: the number of cards you `Exhaust` from your hand to play it.
- **Stats:** `Power` and `Scramble`. A card with no printed stat may state one in its text instead. Recalculate that stat every time the pool is read.
- **Effect text.**
- **`Hold`**, if the card has it.
- **Rarity border:** `Fine`, `Cool`, or `Woah`. No rule reads rarity.

Every card in your deck counts as **1** `Stamina`. Cards do not print this.

### Stuff cards

A `Stuff` card shows the same parts as a player card, with these differences:

- **Type line:** `Good Stuff` or `Bad Stuff`.
- Every `Stuff` card has `Hold`.
- `Good Stuff` has stats and a rarity border. `Bad Stuff` has neither.

### Room cards

A room card shows:

- **Name.**
- **Type:** Enemy, Hazard, or Stuff.
- **Challenges:** one or more `threshold: outcome` lines.
- **`Flee` line:** what happens when the team meets no threshold.

### Keywords

- `Hold`: This card is not Exhausted at Cleanup. It stays in your hand, counting toward your **5**-card limit, until you play it or spend it. Once played, it is Exhausted at Cleanup like any other card.
- `Holding:` Text after this word applies while the card is in your hand.
- `Exhaust X cards from your hand`: Choose **X** cards from your hand and move them to your exhaust pile.
- `Exhaust X cards from your deck`: Move the top **X** cards of your deck to your exhaust pile, face up.
- `Exhaust X` with no zone named: the same as `Exhaust X cards from your deck`.
- `Scrap`: Move the card to the Scrapyard. Nothing leaves the Scrapyard.

---

## 9. Running out

### Last Stand

**Enter Last Stand:** When your deck runs out, finish the current phase, including any room check or `Flee` line. You are then in `Last Stand`.

While in Last Stand:

- You do not draw.
- You may play every card in your hand at no `Cost`.
- Your partner draws and pays as normal.

**Leave Last Stand:** Last Stand ends at the room check of the next Play phase.

- If the room is `Cleared`, including by a `Flee` line that Clears it: at Cleanup, instead of Exhausting your side of the play zone, shuffle every card there into your deck, then `Exhaust` **2** cards from the top of your deck. You are no longer in Last Stand. Clean up your hand as normal.
- If the team `Flees` and the room is not Cleared: you go `Down`.

### Going Down

You go `Down` when either of these happens:

- A card would be moved from the top of your deck, and your deck is empty.
- The team `Flees` while you are in `Last Stand`.

**When you go Down:** Move your hand to your exhaust pile.

**While Down:**

- Skip the Draw and Play phases. You pay no costs, take no punishments, and take no rewards.
- No card may be put into your hand.
- Every `Flee` line that names a character falls on your partner.
- You stay Down until the floor is Cleared (section 10), unless a card says otherwise.

If both characters are Down at the start of a turn, the game ends (section 11).

---

## 10. Ascending

When you have Cleared the Enemy room, you escape the current floor and `Ascend` to the next. On floor 10, skip this section: you have won (section 11).

Each player does the following:

1. **Separate your exhaust pile:** Split it into `Stuff` cards and non-Stuff cards.
2. **Say Goodbye to Your Stuff:** `Scrap` the `Stuff` cards. You may keep **one** `Stuff` card by Scrapping **one non-Stuff card** from your exhaust pile in its place.
3. **Heal:** Shuffle the rest of your exhaust pile, kept `Stuff` included, into your deck. If you were `Down`, you are no longer Down.
4. **Choose a reward:** Reveal the top **3** cards of your reward pool. You may shuffle **one** into your deck. Put the cards you did not take on the bottom of your reward pool.
5. **Build the next floor:** Section 4.

---

## 11. Winning and losing

**You win** by clearing the Enemy room on floor 10.

**You lose** when both characters are `Down` at the start of a turn.

---

## Appendix

## Playing Solo

*North vs Up* is intended for two players. Because nothing is hidden between players, it also plays solo with one change.

Play as both `Red` and `Gray`. Keep every deck, pile, and zone as in the two-player game, but combine both hands into one. Draw from either deck in any order. Play cards from your combined hand in any order. When you play a `Red` card, you may **not** pay for it with a `Gray` card, and vice versa. Treat each action as performed by one character.

**If you have more than two hands**, you may ignore this rule change and play as normal.
