# 10 — Sim the resource economy across a floor

Type: prototype
Status: resolved
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

## Answer

Resolved 2026-08-25 by simulation. The prototype is
[`prototype/floor-economy-sim.html`](../../../prototype/floor-economy-sim.html) — a single-file
simulator with every number exposed as a dial, a batch mode, a dial sweep, and a turn-by-turn trace
of one run. Its **Model** tab lists which rule came from which ticket and, separately, every
assumption the sim had to invent.

Everything below is `[found by agent in the floor economy simulator]`. **Nothing here is a ruling.**
A prototype produces measurements; what the design does about them is the human's, and the decisions
this raises are listed at the end.

### The headline: there is no power-growth curve in the design

Across every configuration tested, **the stat pool a team can put on the table does not grow over a
run.** It is roughly 5–7 on floor 1 and roughly 5–7 on floor 10, while the deck grows from 22 cards
to 33 and the run hands out ten ascend rewards and up to thirty mid-floor ones.

The cause is arithmetic and does not depend on what the cards say:

- The hand cap is 5 (ticket 07), so a character can hold at most five cards on any turn.
- Playing a cost-1 card consumes two of those five — itself and one fuel card (ticket 04/21).
- So a character can put **two or three cards' worth of stats** into the pool per turn, forever.
- Card values are printed and fixed, and ticket 11 made reward cards **effects**, not stats — a
  modifier is worth at most the base it multiplies.
- The base is Good Stuff (ticket 11), and ticket 22's Stuff curve **removes** it, 9 down to 0.

Deckbuilding therefore buys **stamina** — how many turns you can afford — and buys it very
effectively. It does not buy **throughput**. Escalating a room threshold escalates against a number
that is flat by construction, and the one dial the map has for escalation makes the player weaker
rather than the rooms stronger.

Measured directly: with Enemy `Power` rising 4 → 18 across the run (a plausible-looking curve), the
Enemy room clear rate falls 88% → 3% by floor 7 and **no run in 3000 ever reached floor 10**. Raising
the starting deck to 40 cards moved the median run from floor 2 to floor 7 and still won 0% — more
stamina buys more turns, and more turns do not help when the room cannot be beaten on any of them.

**Enemy `Power` has to stay nearly flat for the run to be playable at all.** Ticket 22 left that
number to this ticket; the honest answer is that the number is not the problem, the *slope* is, and
the slope is bounded by a ceiling nothing in the design lifts.

### What a live run actually looks like

The tuning below produces a healthy roguelite arc and is the sim's current default, so opening the
file shows a working economy rather than a dead one. **It is a measurement, not a proposal.**

| Dial | Value | Was |
|---|---|---|
| Starting deck, per character | **22** | 12–15 provisional (ticket 09) |
| Enemy `Power`, floor 1 | **3** | untuned (ticket 22) |
| Enemy `Power` per floor | **+0.7** | untuned |
| Stuff on the last floor | **0** | 0 (ticket 22) — unchanged |

Result over 3000 runs: **28% of runs clear the tower**, the median run dies on floor 7, and deaths are
spread almost evenly across all ten floors (282 on floor 1, 227 on floor 9) rather than piling up at
either end. A floor takes **6.9 turns on floor 1 falling to 4.2 on floor 10** — the fall is ticket
22's shrinking floor deck, and it means late floors are shorter *and* nastier, which reads correctly.

### The numbers this ticket was asked to settle

**1. Starting deck size — 12–15 is far too small.** This is the single most powerful dial in the game
and nothing else is close. At the tuning above, win rate by starting deck: 13 → 7%, 16 → 16%, 19 →
25%, 22 → 34%, 25 → 43%, 28 → 54%. Every other dial moves the win rate by single digits; this one
spans fifty points. That follows from ticket 04 — the deck *is* the health bar, and no other dial
touches health.

The physical cost is real and belongs to the human: at 22 cards each, a run ends with roughly 33
cards per character and two starting decks of 22 to print per character.

**2. Average draw per turn, and do players over- or under-draw.** Roughly **2.7 cards per character
per turn** under the incremental policy. Both extremes fail, and they fail in opposite directions,
which is a good sign for ticket 04's central claim that the draw is the game's real decision:

- **Draw to the cap every turn** — median floor 1, 0% win, 4.8 last stands per run. Suicide.
- **Draw the forced minimum only** — median floor 6, 0% win, 9.6 turns on floor 1 rising to 14.7 on
  floor 8. You survive much longer and never win anything, because you can never assemble a pool.
- **Draw until the threshold looks reachable, then stop** — the only policy that wins.

Hoarding delays death and forfeits victory; spending buys victory and kills you. That is the tension
the deck-as-stamina model was built for, and it is present.

**3. Hand cap 5 is right, and raising it does not help.** Win rate by cap: 3 → 0%, 4 → 0.8%, **5 →
3.9%**, 6 → 2.6%, 8 → 1.7%, unlimited → 1.7% (measured on the older steep curve, where the
differences are visible). A bigger hand does raise throughput — the floor-10 pool goes from 5.3 at cap
5 to 9.3 uncapped — but it raises the stamina cost faster, because every card in that hand was drawn.
This is ticket 04's "drawing more does not linearly buy more plays," confirmed at real numbers, and
ticket 07's choice of 5 lands on the peak.

**4. Deliberately failing does not dominate fighting — but the Flee line is close to a dead dial.**
Runs flee the Enemy room **0.8 times per run**, less than once, so flight is a real option and not a
strategy. But changing the printed Flee cost barely moves anything: win rate 36% at *Exhaust 1* and
31% at *Exhaust 8*. The reason is ticket 07's forced minimum draw — **a turn costs the team two cards
whether or not they engage**, and against a floor that takes five to seven turns, that tax dwarfs
anything a room prints. Failure is punished by the clock, not by the Flee line. Ticket 21 bought the
Flee line as "a second difficulty dial, independent of the threshold"; as an economic dial it is
nearly inert, though its job of making failure *feel* like a scrape is untouched by this.

**5. Over-acquiring does not produce a bloated deck, and the inversion is not a governor.** This is
the charge ticket 09 handed down, and the answer is emphatic and the opposite of what ticket 04
predicts. Win rate by acquisition policy: **take everything 46%, take selectively 34%, take almost
nothing 0.4%.** Greed is not merely unpunished, it is the correct play by a wide margin.

The inversion is real and measurable — a lean deck is far more consistent, reaching a floor-10 pool
of 10.0 against a greedy deck's 5.3 — it is simply **worth much less than the stamina it costs**.
Consistency is capped by the hand of 5 no matter how good the deck is; stamina is not capped at all.

The good news for ticket 09's other worry: **there is no runaway.** The feared forty-card pile-on does
not appear, because a run that takes everything ends at about 33 cards per character — reward sources
are finite and most runs end early. So **no cap is needed** — but not for the reason ticket 04 gave.
Greed needs no governing because greed is not a problem; the inversion is simply not doing the work
the map credits it with.

**6. "Do nothing: recover 1 card" is a degenerate stall at any rate.** Turning it on raises the win
rate from 34% to 56% and turns the game into grinding: last stands go from 2.0 to 17.7 per run, Enemy
rooms fled from 0.8 to 12.0 per run, and floor 10 stretches from 4.8 turns to 11.1. Players stop
engaging and farm the floor deck. The candidate from tickets 04 and 07 does not survive contact.

### The two measurements ticket 11 added

**1. Does the stat base hold up? It erodes, badly, but does not collapse.** At the live tuning, a
hand of five contains a usable stat 90% of the time on floors 1–3 and **74% on floor 9, 57% on floor
10**. The base's *value* falls further than its presence: the mean stat base in play drops from 6.2 on
floor 1 to 3.6 on floor 10 — a 42% fall while thresholds rise. Ticket 11's predicted failure mode,
*a hand of powerful multipliers with nothing to multiply*, is confirmed as the shape of the endgame.
Whether that is the desperate scrape the human wants or simply frustrating is a table question, not a
sim question, and belongs to ticket 20.

**2. Is floor 10 winnable at zero Stuff? Yes.** Zero costs about six points of win rate against a
floor 10 with two Stuff (28.6% vs 34.0%) and about fifteen against a generous nine (43.4%). It is
expensive and survivable — which is what "desperate scrape" should measure like. **Ticket 22's 0
needs no change.** What made floor 10 look impossible in the first sweeps was the Enemy `Power`
slope, not the Stuff count; fix the slope and the bottom of the curve is fine as printed.

### Two dials nobody had looked at, which turn out to matter

- **The hazard thresholds have the same ceiling problem as Enemy `Power`.** A hazard's clear
  threshold rising 2 → 10 across the run makes hazards unclearable late for exactly the reason Enemy
  rooms become unbeatable. At a shallow slope the win rate is 55%; at the steeper one, 32%.
- **The gap between a hazard's two thresholds is a strong economic dial**, because the high threshold
  is the mid-floor reward and the mid-floor reward is the run's growth engine. Holding everything
  else fixed, a gap of 2 wins 55% and a gap of 5 wins 24%. Ticket 22 set no number here; it should
  know the number is load-bearing.

### Ticket 17's last stand, checked at numbers

Ticket 07's **exit tax of 2** does its job and the exact figure is not load-bearing. With no tax, last
stands rise from 2.0 to 8.9 per run and the win rate nearly triples — exactly the *reaching zero
deliberately becomes a play* exploit ticket 17 warned about. With a tax of 1, 2, or 4 the win rate
sits at 3.5%, 3.9%, 3.4% and last stands at 2.7, 2.6, 2.5. The tax has to exist; 2 is as good as any
number and can be chosen for feel.

### What the sim assumed, and how much to trust it

No exemplar cards exist yet (ticket 12), so the sim invented a card model: a player card is a raw
stat, a modifier worth `min(printed, base in play)`, or a draw effect, with reward cards mostly
modifiers per ticket 11. Real build synergy — ticket 21's *"Power equal to twice the cards Gray
played this turn"* — is **not** modelled, so these pools are a floor on what a good deck can do rather
than a ceiling.

That matters for how much weight each finding carries:

- **Robust to card design**, because they follow from the hand cap and the cost structure rather than
  from any card's text: the flat throughput ceiling, deck size being the dominant dial, the draw
  policy having a real interior optimum, the recover action being degenerate, greed being unpunished,
  and the Flee line being economically inert.
- **Provisional, and owed a re-run once ticket 12 exists**: every specific number — starting deck 22,
  `Power` 3 rising 0.7 a floor, the 28% win rate, the hazard threshold gap. Synergy cards are exactly
  the thing that could lift the throughput ceiling, and if ticket 12 finds a card that does, the
  headline finding weakens.

**The model did not collapse.** Ticket 04's fallback branch is not needed: deck-as-stamina produces a
real arc with an even death distribution, a genuine draw decision, and no dominant line. What it does
not produce, on its own, is a reason for the player to get stronger.

### Decisions this raises, for the human

None of these are ruled here.

1. **Does player throughput grow across a run, and if so how?** The map has no answer and the sim says
   it needs one. Raised as [ticket 23](23-power-growth-across-a-run.md).
2. **Starting deck size** — the sim says 22-ish per character for a 30% win rate, against ticket 09's
   provisional 12–15. This is a real trade against printing and table feel, and it is the human's.
   Raised as [ticket 24](24-starting-deck-size.md).
3. **What the Flee line is for**, given it does almost nothing economically. Folded into ticket 23's
   fog rather than ticketed on its own.
4. **Whether the inversion should be strengthened, or the map should stop claiming it governs greed.**
   Also folded into ticket 23, since both come from the same ceiling.
