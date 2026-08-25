# 12 — Build the exemplar card set

Type: prototype
Status: open
Blocked by: 11, 21, 22
Map: [core design map](../map.md)

## Question

Does the card anatomy survive contact with real content?

This is a **feel and expressiveness** question, so per the map's prototyping policy it is built on
paper: printable index-card content the designer can cut out and put on a table. It is the last
ticket before the destination.

## What to build

8–12 exemplar cards spanning the types defined in ticket 11. The set must include at least one
card that stresses each of:

- **Energy use** — a card whose value as fuel matters more than its effect.
- **Health loss** — a card that hurts to lose, so the damage rules from ticket 04 have teeth.
- **Effect** — a card that does something interesting enough to justify the whole system.
- **The acquisition inversion** — a card whose purchase is a genuinely hard call under ticket 09.
- **A floor card** — a threat rendered per tickets 11 and 21, so the floor side of the anatomy is
  tested too, and the player can actually be beaten by something.
- **The floor deck's hardest card** — whatever ticket 22 item 3 settles a climax to be, or the
  nastiest card in the deck if it settles that there is no climax.

Alongside the cards, a one-page rules summary sufficient to actually play a floor with them.

## What it must answer

1. **Does the anatomy hold**, or did some card need a field that does not exist?
2. **What could the anatomy not express** without a rules exception?
3. **Reading time** — put the cards in front of someone and see whether they parse inside ticket
   06's budget.
4. **Does the triple read work** in practice, or does the card become a spreadsheet?

## Deliverable

The printable card content and rules summary, linked from this ticket, plus the answer summary.
Any anatomy change this forces goes back into ticket 11's record — do not silently amend it here.

## On reaching the destination

When this closes, check the map's Destination against what exists. If run structure, turn economy,
resource model, acquisition, anatomy, and exemplars are all settled, the core-design spec can be
assembled from the closed tickets and this map is complete.

## Handed down by ticket 09, 2026-08-24

**Two more pools to size, on a different rule than ticket 22's.**

`[you, ticket 09]` Permanent card rewards come from **two per-character pools** — one Red, one Gray.
A card a character declines goes to the **bottom** of their pool, and the pools must be large enough
that it is **essentially never seen again in that run**. That is a stricter target than ticket 22 set
for the floor-deck room pools, where repeats only had to be *uncommon*.

A run draws each reward pool **10 times at minimum** (one ascend offer of three cards per floor, so
30 cards seen), plus whatever the hazard rooms' high thresholds reveal mid-floor.

`[you, ticket 09]` There is also a **Bad Stuff pool**, sitting outside the floor deck, which this
ticket owes exemplars for alongside the Good Stuff in the floor deck's Item rooms.

**Also handed down:** the exemplar hazard rooms should print the standard reveal line — *"One
character reveals reward. You may add it to the top of your deck or skip it."* — as their high
threshold. Variations on which character reveals are a balance-time tool, not a starting point.

## Handed down by ticket 11, 2026-08-25

The anatomy is settled, so this ticket is unblocked. Three things it now owns.

**The exemplars have to demonstrate one specific claim.** `[you, ticket 11]` Player cards are
**effect-forward** and **Stuff carries the bulk of the raw stats** — a permanent deck is modifiers,
and the base they act on is scavenged fresh each floor. The exemplar set is the first place anyone can
see whether that is actually fun to hold in a hand, so it should include the whole loop: a couple of
`Fine` starter cards that are near-pure stats, at least one `Woah` reward card whose text is genuinely
complex, and enough Good Stuff to make the stat base visible.

**Two cards this ticket may choose to print, or decline to.**

- **An Enemy room with a reward tier.** `[you, ticket 11]` Raised while ratifying the room card format
  and left open; a room is a list of `threshold: outcome` lines, so it costs the anatomy nothing.
  Whether composition uses it belongs to ticket 22, but an exemplar is the cheapest way to see how it
  reads.
- **A card that carries Stuff past ascending** — *"if you are holding this when you clear a floor,
  keep up to 2 Stuff for the next floor."* Handed from ticket 09 as *allowed, not owed*; ticket 11
  confirmed it needs no new machinery, being `Hold` plus a static line. Note it is a **stronger card
  than ticket 09 could have known**, because Stuff is now the stat engine.

**Rarity is a complexity signal, never a quality one.** Ticket 11's item 6a died with ticket 15 —
there is no culling, so there is no card *quality* to make legible. Do not use `Woah` to mean "good."

## Handed down by ticket 10, 2026-08-25 — this ticket now unblocks two others

[Ticket 10](10-sim-the-resource-economy.md) built its simulator, found it had no cards to put in it,
invented some, and was reopened once it was clear that every number it produced described the
invention rather than the game. Both [ticket 10](10-sim-the-resource-economy.md) and
[ticket 23](23-power-growth-across-a-run.md) are now **blocked on this ticket**, which makes the
exemplar set the map's bottleneck rather than a late flourish.

**What is waiting for you.** The simulator survives as a rules engine with a card slot cut into it:
[`prototype/floor-economy-sim.html`](../../../prototype/floor-economy-sim.html). Its `CARD_SET` block
is one clearly marked place to drop this ticket's cards in. A card needs one function —
`stats(ctx) -> {Power, Scramble}` — where `ctx` carries the whole play zone, so a conditional stat can
read what else was played. Plus `cost`, `hold`, and `draw`. Nothing else.

**Two specific charges, beyond what this ticket already owed.**

1. **Print at least one card whose stat scales with what else was played** — ticket 21's own example,
   *"Power equal to twice the cards Gray plays this turn"* — and say what it is actually worth on
   floor 1 and on floor 10. Ticket 23 argues that player throughput may be flat across a whole run,
   bounded by the hand cap of 5 and the cost-from-hand rule, with ticket 11's effect-forward reward
   cards leaving nothing to grow. **A scaling card is the one escape hatch**, and whether it works is
   this ticket's to demonstrate. If it does, ticket 23 closes cheaply.
2. **Say what a modifier multiplies late in a run.** Ticket 11 made Stuff the stat base and ticket 22
   removes it, 9 down to 0. A modifier written against a floor-1 base may be worth nothing on floor 9.
   Write the exemplar modifiers against the late-run base, not the early one.

**Also relevant:** starting deck size is back with ticket 10 (ticket 24 was folded into it and
closed), still at ticket 09's provisional 12–15. How many starter cards this set has to account for
moves with it, so the two are worth settling together.
