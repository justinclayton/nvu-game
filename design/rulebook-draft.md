# NORTH vs UP
## Rulebook — draft

*This is a drafting exercise, not a decision document. Every rule below is transcribed from a
resolved ticket on the [core design map](core-design/map.md); nothing here was invented at writing
time. Where a rule genuinely does not exist yet, the text says so in a box marked **NOT YET RULED**
rather than guessing. — `[assembled by agent from your rulings]`*

---

## The tower

Something came down on the tower and moved in. **Red** and **Gray** are going up it anyway.

Ten floors. On each one you land in the dark, run through whatever is in front of you, grab
whatever is not nailed down, and kill the thing that is guarding the stairs. Then you do it again,
higher up, with less to scavenge.

You are not going to feel prepared. That is the game.

---

## 1. What you need to know first

Read this part twice. Everything else is procedure.

**Your deck is your health.** There is no health track, no counters, no numbers to write down. The
stack of cards in front of you *is* how much fight you have left. When cards leave it, you are
hurt. When it is empty, you are in trouble.

**Your deck is also your fuel.** Playing a card costs other cards. Spending and bleeding are the
same substance, so there is never a moment where you are healthy but broke.

**So a bigger deck is a longer life and a worse one.** You get roughly one pass through your deck
per floor. Every extra card you add is one more turn you survive — and one more card that comes up
instead of the one you needed. Nothing in these rules stops you from taking every reward you are
offered. It simply does not go well.

**And your own deck is mostly tricks, not muscle.** The raw numbers come from **Stuff** you pick up
on the floor, which is gone the moment you climb the stairs. There is less of it on every floor.

---

## 2. Players

**Two characters are always in play.** Red is stocky, aggressive and headstrong. Gray is careful,
attuned and resourceful.

- **Two players:** one of you runs Red, the other runs Gray.
- **One player:** you run both.

The rules are identical either way — there is no solo variant. **Everything is open information.**
Hands are played face up on the table; hold nothing back from your partner.

---

## 3. Components and layout

Each character has **three piles of their own**:

| | |
|---|---|
| **Deck** | Face down. This is your health and your fuel. |
| **Hand** | What you drew this turn. Maximum **5**. |
| **Exhaust pile** | Face up. Cards you have spent or lost. |

There is **no discard pile** for a character, and **no shuffling during a floor** unless a rule
explicitly says to.

In the middle of the table:

- The **floor deck** — face down, with a **Fled** pile beside it and a **Cleared** heap beyond that.
- The **active room zone** — one card, the room you are in right now.
- The **play zone** — split into Red's side and Gray's side.

Off to one side: **Red's reward pool**, **Gray's reward pool**, the **Good Stuff pool**, and the
**Bad Stuff pool**.

---

## 4. Setting up a floor

1. **Build the floor deck.** Take **1 Enemy room**, **3 Hazard rooms**, and **Stuff rooms equal to
   10 minus the floor number** — nine on floor 1, five on floor 5, none on floor 10. Shuffle them
   together face down.
2. **Both characters start with empty hands.**
3. Clear the play zone and the active room zone.

That is the whole of setup. The floor gets no harder to fight as you climb — it gets emptier.

> **NOT YET RULED — starting deck size and composition.** For prototype play, use **12 cards each**.
> This is scaffolding, not a decision (ticket 10).

---

## 5. The turn

**A turn belongs to the floor, not to a character.** There is no turn order, no first player, and
no lead. Both of you act throughout every phase, simultaneously, in whatever order suits you.

### Phase 1 — Flip

Turn the top card of the floor deck **face up** into the active room zone.

You always see what you are facing **before you spend anything**.

A room card prints a list of **`threshold: outcome`** lines, and — on most rooms — one **Flee** line.
A room has no other behaviour. It does not act, move, or do anything but sit there being a problem.

### Phase 2 — Draw

Each standing character draws cards from their deck into their hand, one at a time, stopping when
they say they are done.

- **You must draw at least 1.** There is no sitting a turn out.
- **You may not draw up while holding 5 or more cards.** `Hold` cards count against the cap. Stuff
  pushed into your hand by a room ignores it entirely.
- **A full hand does not excuse the minimum.** Draw your one card anyway — and put it **straight
  into your exhaust pile** instead of your hand. A full hand costs you a card a turn; it never
  saves you one.
- **Once anyone has begun playing cards, nobody may draw again.**

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
- **The instant the pool meets a room's threshold, that outcome happens.** Meeting `Power 3` with a
  pool of 5 is exactly as good as meeting it with 3; the excess evaporates. There is no partial
  progress and nothing carries to the next turn.
- **Declining is failing without trying.** You may spend nothing at all. You still had to draw.

> **Hazard rooms are the exception to "the instant."** A Hazard prints two thresholds, and which one
> you reached is settled when you **declare the play phase over** — not the moment the lower one is
> met. Play everything you mean to play first.

### Phase 4 — Cleanup

Resolve these in order.

1. **If the room is still in the active room zone**, you failed it. Apply its **Flee** line, then put
   the card in the **Fled** pile. Where a Flee line says *1 character*, the team chooses which one —
   they take all of it. There is no splitting.
2. **If the room was Cleared**, put it in the **Cleared** heap. It is out of the game. Nobody ever
   counts that heap or asks it a question.
3. **Exhaust both hands and the entire play zone.** Each card goes to the exhaust pile of the
   character who owns it; Stuff goes to the pile of whoever played it. **`Hold` cards still in hand
   are the only survivors.**
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

A Hazard prints **two thresholds**. The lower one clears the room and moves you on. The higher one
clears it **and pays a permanent card reward**: turn the top card of the named character's reward
pool face up, and take it or skip it. A taken card goes **on top of that character's deck** —
nothing shuffles during a floor, so it is the very next card they draw.

A Hazard carries a **Flee** line.

> **NOT YET RULED —** whether a skipped reveal goes to the bottom of its pool, as a declined
> ascension reward does (ticket 09).

### Stuff room

The lowest thresholds in the deck, and **no Flee line at all**.

A Stuff room's challenge is **split per character**:

> *Power 1: Red takes 1 Good Stuff.*
> *Scramble 1: Gray takes 1 Good Stuff.*

Each character is measured on **their own side of the play zone only** — you pay for your own item
and never for your partner's. Some Stuff rooms print a richer second tier worth leaning into.

What you earn is drawn **blind from the Good Stuff pool** and goes to that character's hand. A Down
character earns nothing.

**A Stuff room is Cleared either way.** It never goes to Fled and it never punishes you. Meet
nothing and you simply walk out with nothing. The only thing you can lose here is the Stuff you did
not take.

---

## 7. Stuff

**Stuff** is what the floor hands you: a tool, a length of pipe, a faceful of slime. Stuff has
`Hold`, so it stays in your hand across turns. It is playable like any card, and it is **ordinary
fuel** — you may Exhaust it from hand to pay another card's cost.

**Good Stuff** is earned. It is where **the bulk of your raw stats come from**, so paying a Stuff
room's threshold is almost always the right call. It carries a rarity border.

**Bad Stuff** is dealt to you, as a room's printed punishment. It behaves like any other Stuff
except in the one way that matters: **it contributes no stats.** It is a cut to your usable hand
size that you have to pay to undo.

Both kinds say which they are on the type line. Learn to read it at a glance.

**No Stuff survives a floor.** When you ascend, all Stuff is pulled out of the exhaust piles and set
aside before anything is shuffled back — unless a card says otherwise.

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

- **`Hold`** — this card is not exhausted at end of turn. It stays in your hand, taking up one of
  your five slots, until you play it or spend it. Playing it moves it to the play zone, where it is
  exhausted like anything else.
- **`Exhaust X cards from your hand`** — a cost *you chose*. Pick which.
- **`Exhaust X cards from your deck`** — a loss you *did not* choose. Off the top, face up, no
  choices.

That distinction is deliberate. The wording alone tells you whether you had any say.

---

## 9. Running out

### Last stand

**When a character's deck is empty, that character is in last stand.** It is a state, not a timer.
They are in it for exactly as long as their deck is empty.

**While in last stand, every card in that character's hand may be played at no cost.** Their partner
still pays normally.

**Getting out.** If the room is Cleared while a character is in last stand, then at that cleanup the
cards that would have been exhausted from their **hand and play zone** are **shuffled back into
their deck instead — minus 2, which are exhausted as the price of getting out.** The exhaust pile is
not involved. `Hold` cards stay in hand and take no part in the shuffle.

Their deck is no longer empty, so they are no longer in last stand.

Every trip through last stand costs you two cards permanently. You cannot live there.

### Going Down

**A character goes Down when either of these happens:**

- **something would Exhaust a card from their empty deck** — a Flee line, a card's own cost, anything
  at all; or
- **the team Flees the room while that character is in last stand.**

In last stand you have to keep clearing rooms. Walking away is what finishes you.

**A Down character** does nothing at all. They are skipped in the draw and play phases, they take no
rewards, and **no card may be put into their hand** — you cannot park Stuff on a partner who is out.
Flee lines still land on the team, and with nobody left to share them, **every one of them falls on
the survivor**.

**The run ends when both characters are Down.**

> **NOT YET RULED — mid-floor revival.** Whether a standing character can bring their partner back
> before the floor ends, and at what cost, is ticket 14 and is genuinely open. Until it is settled,
> a Down character stays Down until the floor is cleared.

---

## 10. Ascending

Clearing the Enemy room ends the floor. Then, in order:

1. **Pull all Stuff out of both exhaust piles** and set it aside.
2. **Shuffle each exhaust pile back into its deck.** Both characters are now at full health —
   including one who was Down. **A floor cleared is a full heal**, and nothing bad crosses a floor
   boundary. There are no lasting wounds in this game.
3. **Take a reward.** Each character is offered **three cards from their own reward pool** and takes
   one — or declines. A taken card is shuffled into their deck. A declined card goes to the bottom
   of its pool.
4. **Build the next floor's deck** (section 4), with one fewer Stuff room than last time.

**Declining is a real play, not a forfeit.** A card you skip is consistency you keep. Read section 1
again if that sounds wrong.

> **NOT YET RULED —** what happens to cards left in a character's hand when the floor ends. Ascending
> collects the exhaust piles and does not mention hands.

---

## 11. Winning and losing

**You win** by clearing the Enemy room on floor 10.

**You lose** when both characters are Down.

Floor 10 has no Stuff rooms at all. Everything you bring to it, you brought from downstairs.

---

## Appendix — open questions this draft could not answer

These are live tickets, listed so nobody mistakes a placeholder for a rule.

| Question | Ticket |
|---|---|
| Starting deck size and composition | 10 |
| Mid-floor revival of a Down character | 14 |
| Cards left in hand when a floor ends | 07 / 09 |
| Which reward pool a Hazard's reveal line draws from, and whose deck it tops | 09 |
| Whether a skipped reveal goes to the bottom of its pool | 09 |
| The Enemy room's `Power` requirement per floor | 22 / 10 |
| How Red and Gray differ at card level | 13 |
