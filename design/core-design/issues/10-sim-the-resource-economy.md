# 10 — Sim the resource economy across a floor

Type: prototype
Status: open
Blocked by: 04, 07, 09
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
