# *NORTH vs UP*

## Rulebook

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

XXXXX

**Your deck is your HP total, called `Stamina`.** Be careful to not go through your deck too quickly, because if you run out of `Stamina`, you'll risk going `Down`. If at any time both players are `Down`, 

**Playing a card costs other cards.**

---

## 3. Components and layout

Each character has **three piles of their own**:


|                  |                                                 |
| ---------------- | ----------------------------------------------- |
| **Deck**         | Face down. This is your health and your energy. |
| **Hand**         | What you drew this turn. Maximum **5**.          |
| **Exhaust pile** | Face up. Cards you have spent or lost.          |

There is **no discard pile** for a character, and **no shuffling during a floor** unless a rule
explicitly says to.

In the middle of the table:

- The **floor deck** — face down, with a **Fled** pile beside it and a **Cleared** heap beyond that.
- The **active room zone** — one card, the room you are in right now.
- The **play zone** — split into Red's side and Gray's side.

Off to one side: **Red's reward pool**, **Gray's reward pool**, the **Good Stuff pool**, the
**Bad Stuff pool**, and the **Scrapyard** — a face-up heap of everything the run has used up.
Nothing ever leaves the Scrapyard.

---

## 4. Setting up a floor

1. **Build the floor deck.** Take **1 Enemy room**, **3 Hazard rooms**, and **Stuff rooms equal to
   10 minus the floor number** — nine on floor 1, five on floor 5, none on floor 10. Shuffle them
   together face down.
2. **Hands stay as cleanup left them.** At the start of the game that means empty; on later
   floors it means whatever `Hold` cards survived the last cleanup.
3. Clear the play zone and the active room zone.

That is the whole of setup. The floor gets no harder to fight as you climb — it gets emptier.

> **NOT YET RULED — starting deck size and composition.** For prototype play, use **12 cards each**.
> Treat this as a placeholder, not a ruling (ticket 10).

---

## 5. The turn

**A turn belongs to the floor, not to a character.** There is no turn order, no first player, and
no lead. Both of you act throughout every phase, simultaneously, in whatever order suits you.

### Phase 1 — Flip

Turn the top card of the floor deck **face up** into the active room zone.

You always see what you are facing **before you spend anything**.

A room card prints a list of **`threshold: outcome`** lines and one **Flee** line.
A room has no other behaviour. It does not act, move, or do anything but sit there being a problem.

### Phase 2 — Draw

Each standing character draws cards from their deck into their hand, one at a time, stopping when
they say they are done.

- **You must draw at least 1.** There is no sitting a turn out. (The one exception: a character in
  last stand does not draw at all — see section 9.)
- **You may not draw up while holding 5 or more cards.** `Hold` cards count against the cap. Stuff
  pushed into your hand by a room ignores it entirely.
- **A full hand does not excuse the minimum.** Draw your one card anyway — and put it **straight
  into your exhaust pile** instead of your hand. A full hand costs you a card a turn; it never
  saves you one.
- **The draw phase ends for both characters at once.** Nobody plays until everyone has finished
  drawing, and once play begins, nobody draws.

**This is the decision the game is made of.** Your whole hand is thrown away at the end of the turn
regardless, so every card you draw is health spent whether you use it or not. Draw shallow and you
may not clear the room. Draw deep and you may not be standing in four turns.

### Phase 3 — Play

Both characters play cards into **their own side** of the play zone, in any order, until they stop.

- **To play a card, Exhaust cards from your hand equal to its `Cost`.** You pay in *other* cards
  from your own hand. Red never pays for Gray.
- **A card's `Cost` and its stats are unrelated numbers.** A cheap card can be huge.
- Played cards stay face up on the table. **Their stats form one shared pool across both
  characters** — Red's `Power 2` next to Gray's `Power 1, Scramble 2` gives the team 3 Power and 2
  Scramble.
- **Conditional stats are recalculated every time the pool is read.** Nothing locks in on play.
- **Nothing resolves while you play.** The room is checked once, at the end of the phase. Play
  everything you mean to play first.
- **Declining is failing without trying.** You may spend nothing at all. You still had to draw.

**When both characters have stopped, the play phase ends, and the room is checked.** Every room
card prints one or more challenges, each a **`threshold: outcome`** line.

- **If any challenge's threshold is met, the room is Cleared.** Resolve the card text of **every**
  challenge you met. Meeting `Power 3` with a pool of 5 is exactly as good as meeting it with 3;
  the excess evaporates. There is no partial progress and nothing carries to the next turn.
- **If no threshold is met, the characters Flee.** Resolve the room's **Flee** line immediately.
  Where a Flee line says *1 character*, the team chooses which one — they take all of it. There is
  no splitting.

### Phase 4 — Cleanup

Resolve these in order.

1. **If the characters Fled the room**, its Flee line has already been resolved; put the card in
   the **Fled** pile — unless the Flee text itself Cleared the room, as a Stuff room's does.
2. **If the room was Cleared**, put it in the **Cleared** heap. It is out of the game. Nobody ever
   counts that heap or asks it a question.
3. **Exhaust both hands and the entire play zone.** Each card goes to the exhaust pile of the
   character who owns it; Stuff goes to the pile of whoever played it. **`Hold` cards still in
   hand are the only survivors.**
4. **If the floor draw pile is empty**, shuffle the **Fled** pile back into it.

### Phase 5 — Flip again

Go back to phase 1.

---

## 6. The three kinds of room

### Enemy room

`Power X`. One stat standing in for how hard it hits and how much it can take.

**There is exactly one Enemy room in every floor deck, and clearing it ends the floor.** You do not
have to empty the deck; you have to kill the thing on the stairs.

Every Enemy room carries a **Flee** line. Failing one is not a disaster — it is backing out of a
fight with a few scrapes to show. It will come back around when the Fled pile shuffles in.

> Expect to meet the Enemy the first time, look at what it costs, and walk away. That is normal play,
> not a mistake.

### Hazard room

`Scramble X`. Running, not falling, not braining yourself on a pipe.

A Hazard prints **two challenges**. The lower threshold clears the room and moves you on. The
higher one **also pays a permanent card reward**: turn the top card of the named character's reward
pool face up, and take it or skip it. A taken card goes **on top of that character's deck** —
nothing shuffles during a floor, so it is the very next card they draw.

A Hazard carries a **Flee** line.

> **NOT YET RULED —** whether a skipped reveal goes to the bottom of its pool, as a declined
> ascension reward does (ticket 09).

### Stuff room

The lowest thresholds in the deck, and a Flee line with no teeth:

> *Flee: Clear the room, but leave empty-handed.*

A Stuff room's challenge is **split per character**:

> *Power 1: Red takes 1 Good Stuff.*
> *Scramble 1: Gray takes 1 Good Stuff.*

Each character is measured on **their own side of the play zone only** — you pay for your own item
and never for your partner's. Some Stuff rooms print a richer second tier worth leaning into.

What you earn is drawn **blind from the Good Stuff pool** and goes to that character's hand. A Down
character earns nothing.

**So a Stuff room is Cleared either way.** Its own Flee line clears it, so it never goes to Fled
and it never punishes you. Meet nothing and you simply walk out with nothing. The only thing you
can lose here is the Stuff you did not take.

---

## 7. Stuff

**Stuff** is what the floor hands you: a tool, a length of pipe, a faceful of slime. Stuff has
`Hold`, so it stays in your hand across turns. It is playable like any card, and it is **ordinary
energy** — you may Exhaust it from hand to pay another card's cost.

**Good Stuff** is earned. It is where **the bulk of your raw stats come from**, so paying a Stuff
room's threshold is almost always the right call. It carries a rarity border.

**Bad Stuff** is dealt to you, as a room's printed punishment. It behaves like any other Stuff
except in the one way that matters: **it contributes no stats.** It is a cut to your usable hand
size that you have to pay to undo.

Both kinds say which they are on the type line. Learn to read it at a glance.

**Spent Stuff is Exhausted like anything else** — it goes to the pile of whoever spent it, and
sits there with the rest. The difference comes at ascension: Stuff in the exhaust piles is moved
to the **Scrapyard**, for good, instead of shuffling back in. Stuff still held in hand is
different: `Hold` carries it across the floor boundary like any other turn. And the Scrap tax
(section 10) can save one Exhausted piece from the Scrapyard, at a price.

---

## 8. Reading a card

**Player cards** print: name, **type line** (`Red`, `Gray`, `Good Stuff`, or `Bad Stuff`), **`Cost`**
in the corner, **stats**, effect text, `Hold` if it has it, and a **rarity border**.

**A card is worth exactly 1 stamina, always, and never prints it.** Whatever else it does, it is one
card off your health when it goes.

**Rarity** is `Fine`, `Cool`, or `Woah`, and it is **purely printed** — no rule anywhere reads it. It
tells you how much a card can do for you when things line up. Starter cards are all `Fine`. The
complicated cards are always high rarity, so a player who only ever takes `Fine` cards will never
meet a nested conditional in their life. They will also miss some very good cards. Every rarity is
equally likely at every floor.

**Keywords:**

- **`Hold`** — this card is not Exhausted at end of turn. It stays in your hand, taking up one of
  your five slots, until you play it or spend it. Playing it moves it to the play zone, where it is
  Exhausted like anything else.
- **`Exhaust X cards from your hand`** — a cost *you chose*. Pick which.
- **`Exhaust X cards from your deck`** — a loss you *did not* choose. Off the top, face up, no
  choices.

That distinction is deliberate. The wording alone tells you whether you had any say.

---

## 9. Running out

### Last stand

**When a character's deck runs out, last stand activates as the last step of the phase that
emptied it.** Whatever else that phase does — a room check, a Flee line — resolves first, before
the character is in last stand.

**Last stand lasts until the end of the next play phase.** It resolves there, at that phase's room
check, one way or the other: the room ends up Cleared and the character gets out (below), or it
does not, and the team's Flee — taken while the character is in last stand — sends them Down. What
matters is how the room ends, not how it got there: a Flee whose own text Clears the room, as a
Stuff room's does, still counts as a Clear.

**While in last stand, a character does not draw** — there is nothing left to draw, and the
mandatory draw does not apply — **and every card in their hand may be played at no cost.** Their
partner still draws and pays normally.

**Getting out.** If the room is Cleared while a character is in last stand, replace that
character's play-zone cleanup this turn with the **last stand cleanup** rules: **all cards in the
character's play zone are shuffled into their deck, then 2 cards are Exhausted from the top of
that deck** as the price of getting out. At that point, the character is no longer in last stand.
Their hand is cleaned up as normal — unplayed cards are Exhausted, `Hold` cards stay.

Every trip through last stand costs you two cards. You cannot live there — and if fewer than 2
cards went into that shuffle, the tax meets an empty deck and sends you Down. Clearing the room is
not enough; you have to clear it with a board worth keeping.

### Going Down

**A character goes Down when either of these happens:**

- **a card would be moved from the top of their deck, but the deck is empty**; or
- **the team Flees the room while that character is in last stand.**

In last stand you have to keep clearing rooms. Walking away is what finishes you.

**Going Down empties your hand into your exhaust pile.** That
is how you tell the two states apart on sight: a character in
last stand has an empty deck but is still holding cards; a Down character has an empty deck *and* an
empty hand. Nothing is flipped over and nothing is tracked.

**A Down character** does nothing at all. They are skipped in the draw and play phases, they pay no
costs, they take no punishments, they take no rewards, and **no card may be put into their hand** —
you cannot park Stuff on a partner who is out. Flee lines still land on the team, and with nobody
left to share them, **every one of them falls on the survivor**.

**Down is out.** A Down character stays Down until the floor is cleared. There is no revive action,
no cost you can pay to bring a partner back. The only exception is **a card that explicitly says
otherwise**, and such a card says for itself what it gives back.

**The run ends when both characters are Down** — checked at the **start of a turn**. If both are
Down when a turn begins, there is no flip. The game ends there.

---

## 10. Ascending

Clearing the Enemy room ends the floor. Then, in order:

1. **Move all Stuff in both exhaust piles to the Scrapyard.** It is out of the run for good —
   nothing ever leaves the Scrapyard. **This is the moment of the Scrap tax:** each character may
   keep **one** Stuff card from their own exhaust pile instead, by Scrapping **another card from
   that exhaust pile in its place**. Kept Stuff stays ordinary Stuff — it will be spent, Exhausted,
   and facing the Scrapyard again a floor from now. There is nothing to track.
2. **Shuffle each exhaust pile back into its deck.** Both characters are now at full health —
   including one who was Down. **A floor cleared is a full heal**, and nothing bad crosses a floor
   boundary. There are no lasting wounds in this game.
3. **Take a reward.** Each character is offered **three cards from their own reward pool** and takes
   one — or declines. A taken card is shuffled into their deck. A declined card goes to the bottom
   of its pool.
4. **Build the next floor's deck** (section 4), with one fewer Stuff room than last time.

**The Scrap tax is the game's deck-thinning engine, and its only voluntary one.** A run trades a
weak card — often a starter — for a strong scavenged one, over and over, and decks get leaner and
better and smaller. They also get more fragile: a deck is stamina, so every trade is a card of
health given up, and the preserved Stuff is itself spent the moment it is finally played.

**Declining is a real play, not a forfeit.** A card you skip is consistency you keep. Read section 1
again if that sounds wrong.

**Hands follow the normal cleanup rules and nothing more.** The turn that cleared the Enemy room
still gets its cleanup, so by the time you ascend a hand holds only `Hold` cards — and those carry
up the stairs, Stuff included.

---

## 11. Winning and losing

**You win** by clearing the Enemy room on floor 10.

**You lose** when both characters are Down at the start of a turn.

---

## Appendix

## Playing Solo

*North vs Up* is intended to be a two-player cooperative experience. However, because nothing is hidden between players, this makes it also playable as a solo experience with almost no differences.

When playing solo, you play as both `Red` and `Gray`. All decks, piles and other play spaces remain the same as the two-player version, but characters' hands are instead combined into one. When you draw, you can draw from the `Red` or `Gray` deck in any order, and when you play, you may play cards from your combined hand in any order. **However, when a `Red` card is being played, you may NOT pay for it using a `Gray` card, and vice versa**. Consider each action to be performed by one character, and all of it should make sense.

**If you have more than two hands**, you may ignore this rule change and play as normal.