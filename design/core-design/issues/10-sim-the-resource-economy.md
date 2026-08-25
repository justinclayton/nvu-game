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

## Reopened 2026-08-25, blocked on ticket 12

This ticket was resolved and then reopened the same day. What follows replaces the resolution.

**Why.** The simulator was built and run, but no exemplar cards exist, so it had to invent a card
model — raw stats, modifiers worth `min(printed, base)`, fixed draw effects — and every number it
produced was a property of that invention rather than of the game. `[you]` **The numbers are
worthless without knowing what the synergies and specifics actually look like.** The resolution
reported them as measurements, which overstated them; it has been withdrawn rather than softened.

**What was kept.** The prototype survives as a **rules engine with a card slot cut into it**:
[`prototype/floor-economy-sim.html`](../../../prototype/floor-economy-sim.html). The turn structure,
zones, floor deck, ascend, last stand and run loop are transcribed from resolved tickets and are
card-agnostic. The invented card model, the tuning defaults presented as findings, and the knapsack
solver are gone — the last of those because a knapsack assumes each card's value is independent of
the others, which a conditional stat breaks by construction. The solver now enumerates legal subsets,
which is exact for synergy cards and trivially cheap at a hand of five. `CARD_SET` is one clearly
marked block for ticket 12 to fill in.

**Now blocked on [ticket 12](12-exemplar-card-set.md)**, which is on the frontier and unblocked. This
ticket's own brief already conceded the shape of this — it said starting deck size "cannot be chosen
honestly before ticket 11 says what a card does" — and the same is true of every other number here.
Rerun the sim with real cards; that is what resolves this.

**[Ticket 24](24-starting-deck-size.md) is folded back into this ticket** and closed. Starting deck
size was split out on the strength of a measurement that no longer stands, and it belongs where
ticket 09 originally put it: here, with the sim that can actually answer it.

### The three findings that survive, and why

These come from the **turn structure** rather than from any card's text, so they hold whatever ticket
12 prints. `[found by agent in the floor economy simulator]` They are still findings, not rulings.

1. **"Do nothing: recover 1 card" is a degenerate stall.** Turning it on made players stop engaging
   rooms and farm the floor deck — last stands rose roughly eightfold and floor length more than
   doubled. It does not depend on card values, because the loop is *card in, card back, repeat*.
   Ticket 04 logged it as a candidate and ticket 07 did not adopt it; this says it should be
   considered **closed rather than pending**.
2. **The last stand needs its exit tax, and the exact figure does not matter much.** With no tax,
   deliberately running the deck to zero pays for itself and last stands multiply — exactly the
   exploit [ticket 17](17-last-stand.md) warned about. With a tax of 1, 2 or 4 the behaviour is
   materially the same. Ticket 07's **2** is sound and can be chosen for feel.
3. **The Flee line is swamped by the per-turn drain.** Ticket 07's forced minimum draw costs the team
   two cards a turn whether or not they engage, and a floor runs many turns, so a room's printed
   punishment is a small share of what failing actually costs. This one is *partly* card-dependent —
   how many turns a floor runs depends on the cards — but the direction holds across everything
   tried. See [ticket 21](21-defeating-a-floor-card.md).

**One structural argument, which is not a measurement and should be treated as an argument.** Player
throughput per turn is bounded by rules already ruled: a hand of 5, and a cost-1 card consuming two
of those slots. So a character puts two or three cards' worth of stats on the table per turn, on
floor 1 and floor 10 alike. Growth therefore has to come from **value per card** rising, and ticket
11 ruled reward cards to be effects rather than stats. Whether that leaves any growth at all is
exactly what a synergy card decides, which is why it is [ticket 23](23-power-growth-across-a-run.md)
and why 23 waits on ticket 12 too.

### What this ticket still owes, once cards exist

Unchanged from the brief above, minus sub-question 6, which ticket 15 voided:

- Starting deck size, per character — **folded back in from ticket 24**, along with what that number
  costs in printing and in table feel, and how much of a starting deck is raw stats.
- Enemy `Power` and its slope; the hazard clear threshold and its slope; the gap between a hazard's
  two thresholds, which prices the mid-floor reward and therefore deck growth.
- Whether the acquisition inversion governs greed, or whether a cap is needed — ticket 09's charge.
- Whether the stat base holds up at floors 6–10, and whether floor 10 is winnable at zero Stuff —
  ticket 11's two charges.
- Average draw per turn, and whether players systematically over- or under-draw.

### A note for whoever picks this up

Do not tune the placeholder cards against the placeholder thresholds. That is what produced the
withdrawn resolution: two invented things fitted to each other produce a curve that looks like a
finding and describes nothing. The dials the simulator marks **unruled** are the ones no ticket has
decided, and they should stay visibly unset until real cards can settle them.
