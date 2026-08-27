# 10 — Sim the resource economy across a floor

Type: prototype
Status: open
Blocked by: 04, 07, 09, 11, 12
Map: [core design map](../map.md)

## Question

Does the deck-as-energy-and-HP model actually produce a playable arc, or does it drain too fast,
too slow, or unrecoverably?

This is a **numeric** question, so per the map's prototyping policy it gets a throwaway HTML
simulator, not index cards.

## What to build

A single-file HTML simulator (via `/prototype`, logic branch) that plays out one floor under:

- the zone and drain rules from ticket 04,
- the turn structure from ticket 07,
- the acquisition rates from ticket 09,

with every tuning number exposed as a control: starting deck size, draw per turn, energy cost
curve, cost of defeating a floor card, cost of failing one, floor deck size, acquisition rate.

It must support both free-play (step a floor manually and watch the piles move) and batch runs
(simulate N floors and chart the distribution of outcomes).

## What it must answer

1. **Drain rate.** Does the pool fall at a rate that creates pressure without making death
   unavoidable? What is the win rate across the plausible tuning range?
2. **Floor length.** How many turns does a floor take, and does that match "one distinct combat
   round" as ticket 05 defined it?
3. **The death spiral.** Is there a point of no return, and does the player see it coming? A
   roguelite wants the player to know they are losing; it does not want ten minutes of hopeless
   play afterwards.
4. **Degenerate strategies.** Does any single line dominate — hoarding, never spending, never
   buying, rushing the boss?
5. **The acquisition inversion.** If gaining cards gains health, does the sim show players
   over-buying into a bloated unresponsive deck, or is the tension self-correcting?
6. **The damage-as-cull rubber band (ticket 15).** This is the sim's most important job if ticket
   15 survives. Run floors **with and without player-chosen damage** and compare: win rate, average
   deck quality over the course of a run, and — the telling one — whether a rational player is ever
   *incentivised to take a hit*. If the answer to that last one is yes, the rubber band is too
   strong and ticket 15 needs a cost attached.

## Deliverable

The simulator file, linked from this ticket, plus the answer summary. If the sim kills the model,
say so plainly — that is a successful prototype, and ticket 04's fallback branch takes over.

## Revised by tickets 04 and 15

**Sub-question 6 is void.** Ticket 15 resolved against the damage-as-cull hypothesis — damage is
random off the top of the deck, so there is no player-chosen damage to compare against. Drop it.

**The model to simulate is now specific and much simpler than this ticket assumed.** Per character:
deck, hand, face-up exhaust pile, no discard pile, no reshuffling. Cards leave the deck by exactly
two routes — drawing at the start of a turn, and damage. The whole hand exhausts at end of turn
regardless of use, so **a turn's stamina cost is exactly how much was drawn, not how much was
spent.**

That yields one tight relationship to explore rather than a tangle:

    floor length ≈ deck size ÷ average draw per turn − damage taken

**Numbers to find** (ticket 04 deliberately produced none, and no figure from the previous design
attempts may be used):

1. **Starting deck size**, and how it must scale as the deck grows over a run.
2. **Average draw per turn** under pressure, and whether players systematically over- or
   under-draw.
3. **Damage per hit** relative to deck size — how many hits a floor should be able to spend.
4. **Whether deliberately failing dominates fighting.** The floor-deck model replaces the old
   flee-and-scavenge worry with a sharper one: a player who eats the consequence instead of spending
   to win pays once and meets the card again later. Verify at real numbers whether that is ever the
   better play, and how often — including how much the reshuffle punishes it, since a deck you keep
   failing against gets *longer*.
5. **Whether over-acquiring produces a bloated, unresponsive deck**, given that a bigger deck is both
   more floor-time and worse consistency on a single pass.
6. **"Do nothing: recover 1 card"** — the candidate turn action from ticket 07. Does it exist, and at
   what rate does it become a stalling strategy?

## Handed down by ticket 09, 2026-08-24

**A specific charge, added to this ticket's simulation brief: does the inversion actually govern deck
growth?**

Ticket 09 declined to cap how much a deck can grow, on the grounds that ticket 04's inversion — a
card you add is +1 floor-time and −1 consistency — is supposed to punish greed without a rule saying
so. Nothing has tested that claim.

The arithmetic that makes it urgent: **three hazard rooms per floor**, each able to pay a permanent
card at its high threshold, **plus one reward at every ascend**, is up to **forty cards added to a
12–15 card starting deck** over ten floors.

`[you, ticket 09]` **Simulate deck growth across ten floors and report whether the inversion actually
punishes greed, or whether a cap is needed after all.** If it cannot govern this, the inversion is
weaker than ticket 04 claims and the map should know.

**Also handed down:** starting deck size is **12–15 cards per character, provisional**, and is this
ticket's number to settle — ticket 09 deliberately refused to pick it, because it cannot be chosen
honestly before ticket 11 says what a card does.

## Handed down by ticket 11, 2026-08-25

Ticket 11 ruled that **player cards are effect-forward and Stuff carries the bulk of the raw stats**,
which changes what this sim is actually measuring. A character's permanent deck grows over ten floors
into a pile of *modifiers*; the base those modifiers act on is **Good Stuff**, scavenged fresh each
floor and gone on ascending. Two measurements follow.

1. **Does the stat base hold up?** The raw-stat supply is Good Stuff plus a fixed handful of starter
   cards diluted across a deck growing from 12–15 toward 40. Measure how often a hand of five contains
   a usable stat at floors 6–10 — the failure mode is a hand of powerful multipliers with nothing to
   multiply.

2. **Is floor 10 winnable at zero Stuff?** `[you, ticket 11]` The *shape* is ruled: floor 10 is meant
   to be a desperate scrape, and softening the curve was rejected. But it must actually be winnable,
   and ticket 22's Stuff count bottoming out at 0 is a number, not a shape. If 0 turns out to be
   impossible rather than desperate, 2 or 3 is a one-number fix and this sim is what should say so.

**Note on this ticket's blocking.** Ticket 11 is now listed as a blocker. This ticket's own brief
already said starting deck size "cannot be chosen honestly before ticket 11 says what a card does" —
the dependency existed and was simply never wired.

## Simulator rebuilt against the current rules, 2026-08-25 — no numbers ruled

[`prototype/encounter-sim.html`](../../../prototype/encounter-sim.html) was rebuilt from
[the floor rules summary](../prototypes/12-floor-rules-summary.md), which is now the most current
statement of how a floor plays. The version it replaced predated the 2026-08-25 rulings and was wrong
about the win condition, Down, last stand, the hand cap, and Stuff rooms.

**This ticket is not answered.** The simulator is the instrument, not the finding. The three numbers it
was built to inform are **adjustable inputs with scaffolding defaults and no recommendation**: starting
deck size, the Stuff room curve, and the Stuff room thresholds including the second tier.

### What it now implements

Two-object Stuff rooms with a **split per-character threshold** read against that character's own side
of the play zone; Good Stuff drawn blind from a side pool; no choosing whose hand an item enters; the
room Cleared either way. **Last stand as a state** held for as long as the deck is empty, with the
2-card exit cost. **Down** only when something would Exhaust from an empty deck or the team Flees while
you are in last stand. The **minimum draw at a full hand**, exhausted rather than drawn. **Clearing the
Enemy room ends the floor.**

### The two open findings are instrumented

- **The reshuffle** — mean and longest wait for a fled Enemy to come back around, and the share of lost
  runs that ended with the Enemy sitting unreachable in the Fled pile.
- **The hand cap collision** — character-turns started at or over the cap, and the share of minimum
  draws burnt straight to the exhaust pile, broken out by floor.

### What the first runs show, as observations rather than answers

All of it is at placeholder numbers, with an **agent-written auto-player** that the tool exposes as a
policy setting, and with **no card effect text executed** — so `Reckless`, `Second Wind`, `In Step` and
`Both Barrels` all contribute nothing. Read these as directional.

1. **The scaffolding numbers are severely lethal.** At 12-card decks, Enemy `Power 5` and the 9 → 0
   Stuff curve, almost no run reaches floor 3 and the mean loss is around floor 2. A 12-card deck lasts
   roughly five or six turns against a floor-1 deck of thirteen rooms, so the deck runs out before the
   floor does. Raising both decks to 24 still clears all ten floors only a few percent of the time.
   **This is the reshuffle problem stated as a number**: you cannot outlast the deck, so a fled Enemy
   is often unreachable in practice, and around half of all lost runs end with it stuck in the Fled
   pile.
2. **The hand-cap collision does not appear on its own.** Good Stuff is `Hold`, but *playing* it
   exhausts it — so a player who spends Stuff as they get it never fills their hand and the cap never
   binds. The collision only shows up when a character **hoards Stuff for the Enemy room**, which is
   the natural play and is now a toggle in the tool. Whether the collision is real therefore depends
   on a player policy, not on the rules alone, which is worth knowing before tuning anything.
3. **A Stuff room is a free escape from last stand.** `[finding]` A Stuff room is Cleared whether or
   not anyone meets anything, and getting out of last stand triggers on **the room being Cleared** — so
   a character in last stand escapes on any Stuff room, without meeting a threshold or spending a card.
   On floor 1 that is up to nine free escapes sitting in the deck. This falls out of two separate
   rulings colliding and has not been ruled on either way.


## Permanent rewards built into the simulator, 2026-08-26

`[you]` **The sim was reporting runs that beat floor 10 without permanent rewards ever being
handed out. That had to be fixed before any number was tuned.** It was — and the numbers below
are from the repaired instrument. An earlier version of this section, tuned against the broken
one, is in git history and should not be read.

### What was missing, and it was built rather than ruled

None of this needed a new decision. It was all ruled already and simply never implemented:

- **The mid-floor reward.** Ticket 22's amendment to ticket 21 made a Hazard room's high
  threshold pay a permanent card; ticket 09 specified it as a *reveal* — the top card of one
  character's reward pool turns face up, the decision is take-or-skip, and a taken card goes on
  **top of that character's deck**, so it is +1 stamina immediately. The simulator reached the
  second tier, logged *"a reward is revealed"*, and then handed out nothing at all.
- **The ascend reward.** Ticket 09 ruled three cards off that character's own pool, take one or
  decline, declined to the bottom. The simulator took **one card at random and never declined**.
- **The reward pools themselves.** There were none. Each character now carries one flat,
  finite, ordered pool for the whole run, with no rarity tiers and no escalation by floor, per
  ticket 09.

Three heuristics were needed to run it and **none of them is a ruling**, so all three are
settings on the tool: which character reveals when a Hazard says "one character" (the shorter
deck takes it — they need the stamina most), whether the auto-player takes a revealed card, and
which of three offered cards it prefers. The take-or-skip policy is the interesting one and is
swept below as `always` / `better` / `never`.

Two limits still stand and matter when reading anything here. **Card effect text is still not
executed**, so `Second Wind`, `Scrap Sense`, `In Step` and `Catch Your Breath` enter a deck as
blanks and are worth only the stamina they add — the sim therefore *understates* what a reward
is worth. And starter cards are excluded from the reward pools, which is unstated in the rules.

### Why floor 10 was being beaten — it was never really about the rewards

The rewards were missing, but they are not the reason. `[finding]` **The Enemy threshold sits
below what a starting character produces unaided.**

A 12-card Red starter deck is 7 `Shove` (`Power 1`, cost 0) and 5 `Charge In` (`Power 3`, cost 1).
Enumerating every play from a full five-card hand:

| best Power from one full Red starter hand | 5 | 6 | 7 | 8+ |
|---|---|---|---|---|
| share of hands | 2.5% | 21.5% | 76.0% | **0%** |

**Every possible starting hand meets `Power 5` on its own**, with no Good Stuff, no rewards, and
no help from Gray — five `Shove` at cost 0 is exactly 5. So floor 10 at zero Stuff was won 98% of
the time because floor 10 was never asking for anything. The missing rewards hid this rather
than caused it.

The same table shows something sharper. **A starter hand tops out at `Power 7`, and `Power 8` is
flat-out impossible from one hand.** The model has a cliff, not a slope: up to 7 a character
copes alone, and past 8 the threshold *must* be met from Good Stuff, a partner, or accumulated
rewards. That cliff is why the escalation rate swings results so violently, and it is worth
knowing before anyone picks a threshold curve.

### 1. Rewards are worth much more than the difficulty curve was assuming

Adding the ruled rewards changes the tuning conclusions outright:

| escalation | clears, no rewards (broken sim) | clears, rewards built |
|---|---|---|
| flat `Power 5` | 91% | 94% |
| `Power` +0.5/floor | 25% | **85%** |
| `Power` +1/floor | 1% | **57%** |

`[finding]` **Permanent rewards are worth roughly a floor of enemy escalation each.** A rate that
looked brutal without them is comfortable with them. Nothing about the escalation rate should be
ruled off the earlier figures.

The structural reading is unchanged and now firmer: a **flat threshold produces no difficulty
curve at all** (floor 10 won ~100% of the time it is reached), and a rising one produces one
immediately. `[agent recommends]` **+1 `Power` per floor** — `Power 5` on floor 1 to `Power 14` on
floor 10 — which lands the run at about a 57% clear rate with floor 10 won 89% of the time it is
reached. The earlier recommendation of +0.5 was made against the broken sim and is withdrawn.

### 2. Ticket 09's charge, answered: the inversion does not punish greed

This is the finding that most deserves a ruling. Ticket 09 declined to cap deck growth on the
grounds that ticket 04's inversion — a card you add is +1 floor-time and −1 consistency — punishes
greed without a rule saying so. With rewards actually handed out, that claim can now be tested,
and it fails:

| take-or-skip policy | rewards taken/run | deck at floor 10 | clears all ten |
|---|---|---|---|
| **take everything** | 22.5 | **22.7 cards** | **94%** |
| take only if better than your average card | 6.6 | 15.2 cards | **95%** |
| never take anything | 0 | 12.0 cards | 88% |

`[finding]` **Taking every card offered nearly doubles the deck and costs nothing measurable** —
94% against 95% is inside the noise. The greedy player is not punished; they are merely not
rewarded. Refusing everything *is* punished, so the inversion has a floor but no ceiling.

Under a real escalation curve the shape is the same — 82% for greed against 88% for discipline,
a gap barely outside noise — while refusal collapses to 20%.

Every figure on this page is 600 ten-floor runs and moves by a point or two between runs, so read
differences under about three points as nothing.

`[agent recommends]` **the inversion cannot govern deck growth on its own, and ticket 09's
decision to leave growth uncapped should be reopened.** Two honest readings, and picking between
them is yours: either the punishment for greed needs to be real — costlier rewards, a smaller
hand, thinner decks — or growth needs the cap ticket 09 declined to write. What is not tenable is
the current position, which assumes a self-correction the numbers do not show.

One caveat, stated because it cuts against the finding: effect text is not executed, so every
reward is currently valued at its raw stats alone. Cards that are *good* rather than merely
*stat-bearing* would make greed look better still, not worse — so this understates the problem
rather than manufacturing it.

The forty-card deck ticket 09 feared does not appear even at maximum greed — about 23 cards per
character — because second-tier Hazard clears are rarer than "three rooms a floor" suggests.
The direction of the worry was right; the magnitude was not.

### 3. Ticket 11's stat-base worry: real, but only for the greedy

The failure mode ticket 11 named is a hand of modifiers with nothing to multiply. Now that decks
actually grow, it can be seen:

| entering floor | 2 | 4 | 6 | 8 | 10 |
|---|---|---|---|---|---|
| stat density, take everything | 0.94 | 0.86 | 0.79 | 0.75 | **0.72** |
| stat density, take selectively | 1.00 | 0.99 | 0.99 | 0.99 | 0.99 |

At maximum greed the chance of a full hand holding no usable stat at all reaches about **1 in
125 hands** by floor 10 — present, but nowhere near the failure ticket 11 was bracing for.
`[finding]` **The stat base holds.** It is worth re-measuring if the exemplar set gets more
effect-only cards, since the pool is currently 4 Red and 3 Gray non-starter cards recycled.

### 4. Starting deck size, remeasured

Under `Power 5` +0.5/floor, with rewards live:

| starting deck | 6 | 8 | 10 | 12 | 15 | 18 | 24 |
|---|---|---|---|---|---|---|---|
| clears all ten | 20% | 41% | 68% | 87% | 96% | 98% | 100% |

Rewards lift the whole curve and move the shoulder left: **12 is now the knee**, where 15 was
before. Ticket 09's provisional 12–15 still brackets it. `[agent recommends]` **12 per character**
— it keeps a real early-floor bite that 15 sands off, and it is already the scaffolding number in
the floor rules summary, so ruling it changes nothing on the table.

### 5. Unchanged by the repair

These held up and are restated only so it is clear they were re-run, not carried over:

- **No run ever stalls**, in any configuration. A fled Enemy returns in a mean of 5–7 turns, never
  more than 12. The reshuffle worry recorded on 2026-08-25 is not real.
- **The deck is not what kills you.** Last stand takes 2–4% of character-turns and every loss is a
  wipe, never a deck-out. Runs are decided by meeting the threshold in front of you.
- **No degenerate line.** Drawing what you need (89%) beats drawing to the cap (23%) and drawing
  the minimum (2%); hoarding Stuff for the Enemy halves the clear rate. The hand cap binds on
  ~1% of character-turns.
- **Good Stuff remains close to the whole game**: chase Stuff rooms and you clear 89% of runs,
  ignore them and you clear 10%.

### What is still needed from you

1. **Reopen deck-growth governance, or accept it.** The inversion does not punish greed. Either
   greed gets a real cost or growth gets a cap — ticket 09 assumed neither was needed.
2. **Whether the Enemy threshold rises with the floor**, and at what rate. Agent recommends +1
   `Power` per floor. There is no difficulty curve without this, and the starter-hand ceiling of
   `Power 7` is the landmark the curve should be drawn against.
3. **Starting deck size.** Agent recommends 12.
4. **The floor-10 Stuff count.** 0 is survivable; leaving it there is recommended.
5. **Whether Good Stuff being the near-sole determinant of a run is intended**, or a sign the
   floor needs another axis.

Items 1, 2 and 5 look like they belong to tickets 09, 22 and a new ticket respectively, rather
than to this one. Flagged, not assumed.

## Ruled 2026-08-26 — deck growth stays uncapped, and why

`[you]` **Ticket 09's decision not to cap deck growth stands, untouched.** The deck-growth question is
held open rather than settled by a new rule, because the thing that makes greed cost something is the
Enemy threshold rising with the floor — and that rate is not set yet. Re-test greed once it is.

`[you]` **Enemies scale with the floor.** Recorded in full as an amendment on
[ticket 22](22-floor-deck-composition.md), which owns escalation. The rate remains this ticket's
number to find.

### The finding this ruling rests on, corrected

An earlier reading on this ticket said the inversion was simply too weak — that taking every reward
offered nearly doubles the deck and costs nothing. That was measured **only at a flat threshold**, and
it does not survive sweeping the escalation rate underneath it:

| enemies scale by | take everything | take selectively | cost of greed |
|---|---|---|---|
| nothing (flat) | 94% | 93% | none — greed is slightly *better* |
| +0.5 `Power`/floor | 84% | 85% | about 1 point |
| **+1 `Power`/floor** | **46%** | **56%** | **10 points** |
| +1.5 `Power`/floor | 5% | 9% | shrinking again |

`[finding]` **The inversion is not broken, it is dormant.** Ticket 04's claim — a card you add makes
you last longer and makes you worse — only has teeth once thresholds are high enough to strain a
five-card hand. While almost any hand clears the bar, it does not matter which cards you drew, so
diluting the deck costs nothing. Raise the bar and it matters a great deal, and the greedy deck starts
missing.

This is the same arithmetic as the starter-hand ceiling: `Power 5` is met by every possible starting
hand, so at that threshold there is nothing for dilution to spoil.

`[finding]` **So the difficulty curve and the deckbuilding decision are one question, not two.** The
scaling rate is not only what makes floor 10 hard; it is what makes taking a card a choice at all. It
should be ruled as a design number, not turned as a dial.

**One caveat, recorded because it cuts against the ruling.** At +1.5 and +2 per floor the gap closes
again — runs collapse early enough that no deck survives long enough to suffer from being bloated. So
greed only costs something inside a band, and +1/floor sits in it. A steeper curve is not simply a
stronger version of the same effect.

### What this ticket still owes

Unchanged and still open, all of them waiting on [ticket 12](12-exemplar-card-set.md)'s cards being
ruled:

1. **The Enemy threshold's scaling rate.** Now known to be load-bearing twice over. Drawn against the
   `Power 7` starter-hand ceiling.
2. **Starting deck size.** 12 and 15 both defensible; the knee moves with the reward strength, so this
   cannot be honestly picked before the cards are ruled.
3. **The Stuff room thresholds**, including the second tier — which ticket 12 is holding a placeholder
   for so its cards can be cut.
4. **The floor-10 Stuff count.** 0 is survivable on the current numbers.

**Ticket 12 is now wired as a blocker**, which it should have been all along: every number left here
depends on what a reward card is actually worth.

## New input from ticket 24, 2026-08-27 — the Scrap mechanic, and three things it breaks

`[you]` The **Scrap mechanic** landed after the simulator was rebuilt, and it changes rules the
simulator implements. It must be modelled before this ticket can answer anything, and it brings three
open questions of its own — all three are this ticket's now.

**What the simulator must add:** the **Scrapyard**, a run-long shared heap nothing ever leaves;
**Scrap** as a printable card cost that removes a card permanently instead of exhausting it; **held
Stuff shuffled into the deck on ascending** rather than returned to its pool; and the **Scrap tax** —
one piece of Stuff made permanent per ascension, paid for with one Scrapped starter card.

1. **The heal now runs on two dials.** Held Stuff is +1 stamina per character per floor, and a taxed
   card is a permanent one. The runs already swept predate both and no longer describe this game.
2. **The tax cuts against ticket 22's escalation.** The whole escalation curve is Stuff room count
   falling 9 → 0 across the tower. The tax converts early-floor generosity into permanent late-floor
   power, which is the flattening that curve was built to prevent. Ticket 11 also ruled **floor 10
   must actually be winnable at zero Stuff** — with the tax, floor 10 is no longer at zero Stuff.
3. **It is the first escape from the inversion.** Deck growth was left uncapped on the claim that
   *+1 card is −1 consistency* governs it. The tax lets a player grow power while shrinking the deck.
   This ticket was already charged with proving the inversion governs growth; it now has to prove it
   against a mechanic designed to sidestep it.
