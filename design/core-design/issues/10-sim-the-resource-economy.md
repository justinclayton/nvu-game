# 10 — Sim the resource economy across a floor

Type: prototype
Status: claimed
Blocked by: 04, 07, 09, 11
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

## Sweep results, 2026-08-26 — findings only, nothing ruled

The simulator was driven headlessly across the whole plausible tuning range rather than a run at
a time. The driver is [`prototype/sim-sweep.js`](../../../prototype/sim-sweep.js) — it loads the
engine straight out of `encounter-sim.html`, so there is still exactly one engine and the HTML
tool remains the thing a human plays with. `node prototype/sim-sweep.js` reproduces everything
below; each figure is 600 ten-floor runs.

Everything here is a **finding**. Not one number below is ruled — they are the agent's readings
and its recommendations, and they are the human's to accept or reject.

### The observation recorded on 2026-08-25 no longer holds

That note said the scaffolding numbers were severely lethal — almost no run reaching floor 3.
They are not. At 12-card decks, `Power 5`, and the 9 → 0 Stuff curve, **90% of runs now clear all
ten floors**. The auto-player fixes since then — drawing against the pooled hands and the real
threshold, and stopping on two dud draws — are the whole difference. The old reading was
measuring a bad auto-player, not the rules.

The finding it stated is also gone. **No run ever stalls**, in any configuration tested. A fled
Enemy comes back around after a mean of 3–5 turns and never more than 11, so the reshuffle worry
— a fled Enemy sitting unreachable — is not real at any numbers tried.

### 1. The deck is not what kills you

The relationship this ticket was built around — `floor length ≈ deck size ÷ draw per turn` — is
real but is not the binding constraint. Floors run about 7 turns; a character does go near-empty
and last stand does get entered, but only on **2–3% of character-turns**, and the loss is always
a wipe rather than a deck-out. What decides a run is whether the party can **meet the threshold
in front of it**, and that is a question about Good Stuff, not stamina.

That reframes the whole ticket. The deck-as-energy-and-HP model produces a playable arc, but the
arc's shape is set by the challenge curve, not by the drain.

### 2. Good Stuff is the entire game, and that is a problem

| line | clears all ten floors |
|---|---|
| meet Stuff-room thresholds when you can | **89%** |
| never meet a Stuff-room threshold | **10%** |

One toggle swings the run from near-certain to near-hopeless. Nothing else in the model comes
close. `[finding]` **Good Stuff is currently load-bearing to the point of being the only real
decision on a floor** — every other choice is noise beside it.

Whether that is a flaw depends on what a floor is meant to be about, which is a ruling, not a
measurement. If Stuff rooms are *supposed* to be the floor's spine, this is the model working.
If they were meant to be one texture among several, it is not.

### 3. No degenerate line — the sensible play is the best play

Both greedy extremes are punished, without a rule saying so:

| draw policy | clears |
|---|---|
| draw what you need to afford the room | **89%** |
| draw to the hand cap every turn | 23% |
| draw the minimum every turn | 2% |

And **hoarding Stuff for the Enemy room halves the clear rate**, 89% → 48%. The natural miser's
line loses. The hand-cap collision that the last note worried about barely exists — the cap binds
on **1% of character-turns** — so it is not a live problem at these numbers.

Sub-questions 4 and 6 of the original brief are answered by this: deliberately failing does not
dominate, and no stalling strategy emerged.

### 4. The Stuff curve is not a difficulty knob — enemy power is

Ticket 22's escalation is currently expressed as *less Stuff per floor*. Alone, that does almost
nothing:

| escalation | clears | floor-10 win rate |
|---|---|---|
| flat `Power 5`, Stuff 9 → 0 | 91% | 98% |
| flat `Power 5`, Stuff 9 → 2 | 93% | 100% |
| `Power` +0.5/floor, Stuff 9 → 0 | 25% | 44% |
| `Power` +0.5/floor, Stuff 9 → 2 | **62%** | **84%** |
| `Power` +1/floor, Stuff 9 → 2 | 20% | 59% |

`[finding]` **A flat enemy threshold produces no difficulty curve at all** — floor 10 is as
winnable as floor 3. A rising threshold produces one immediately. `[agent recommends]` the Enemy
threshold should rise with the floor, around **+0.5 per floor** (`Power 5` on floor 1 to about
`Power 9–10` on floor 10). This is a genuinely new number the map does not yet have, and ruling
it belongs to ticket 22 or a fresh ticket rather than to this one.

There is a structural note underneath. With Stuff bottoming out at 0, floor 10 has only four
rooms and takes under three turns — the finale is a **spike, not a scrape**. Ticket 11 asked for
a desperate scrape; that is what a rising threshold gives, while the Stuff curve alone gives a
short sharp shock. Worth knowing which was meant.

### 5. Is floor 10 winnable at zero Stuff? — Yes, and that is the objection

Ticket 11 handed down that floor 10 must be desperate but possible, and asked whether Stuff
bottoming out at **0** makes it impossible rather than desperate. It does not: **at 0 Stuff and a
flat threshold, floor 10 is won 98% of the time**. The starter deck alone is more than enough.

So 0 is safe. `[agent recommends]` **leave the floor-10 Stuff count at 0** — the fix ticket 11
anticipated (raising it to 2 or 3) is not needed to make floor 10 survivable, and raising it only
makes an already-easy floor easier. Under a rising threshold, `top=2` becomes a real difficulty
lever rather than a survivability one (84% vs 44% at floor 10), which is a different argument and
should be made on its own terms.

### 6. Starting deck size: the curve saturates around 15

Under the escalating configuration, where deck size actually bites:

| starting deck | 6 | 8 | 10 | 12 | 15 | 18 | 24 |
|---|---|---|---|---|---|---|---|
| clears all ten | 11% | 30% | 43% | 63% | 77% | 80% | 82% |

Ticket 09's provisional **12–15** sits exactly on the shoulder. Below 10 the deck collapses;
above 18 the extra cards buy nothing. `[agent recommends]` **15 per character** — the top of the
provisional band, where the marginal card stops paying and before deck size stops mattering at
all. 12 is defensible if the intent is that the early floors bite.

### 7. Ticket 09's deck-growth question cannot be answered yet — the sim does not model it

Ticket 09 asked whether ticket 04's inversion governs greed, on the arithmetic that three hazard
rooms plus an ascend reward could add **forty cards over ten floors**.

**The simulator adds one card per ascend and nothing else**, so a 12-card deck reaches floor 10
at 21 cards. Good Stuff is set aside on ascending, and the sim's Stuff rooms pay Good Stuff rather
than permanent cards, so the high-threshold permanent-card payout that ticket 09's arithmetic
assumed **is not implemented**.

`[finding]` **This is a gap in the instrument, not a finding about the design.** The honest answer
to ticket 09's charge is *not measured*. Someone must first rule what a hazard room's high
threshold actually pays — if it pays a permanent card, the sim needs it, and the question can then
be asked properly.

### 8. Ticket 11's stat-base worry does not appear — conditionally

The failure mode ticket 11 named is a hand of multipliers with nothing to multiply. Across the run
the permanent deck stays **80%+ raw-stat cards** and the chance of a full hand containing at least
one usable stat is **1.000 at every floor**.

But that is measured on a deck that grows from 12 to 21, for the reason in the section above. On
the 40-card deck ticket 09 feared, dilution would be real. `[finding]` **The stat base holds at
the deck sizes the sim actually produces**; the worry stands or falls with the unimplemented
growth, and should be re-measured once section 7 is settled.

### What is still needed from you

Nothing above is a ruling. Four decisions would close this ticket:

1. **Starting deck size.** Agent recommends 15; 12 is the other defensible pick.
2. **The floor-10 Stuff count.** Agent recommends leaving it at 0.
3. **Whether the Enemy threshold rises with the floor**, and at what rate — the sim says the
   difficulty curve does not exist without this.
4. **Whether Good Stuff being the near-sole determinant of a run is intended**, or a sign the
   floor needs another axis.

Question 3 arguably belongs to ticket 22 and question 4 may want a ticket of its own; both are
noted rather than assumed.
