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

## Handed down by ticket 10, 2026-08-25

**The exemplar set is now the test of whether the run has a power curve at all.**

[Ticket 10](10-sim-the-resource-economy.md) found that the stat pool a team can assemble is flat
across a run — 5–7 on floor 1 and 5–7 on floor 10 — because the hand cap of 5, the cost-comes-out-of-
hand rule, and ticket 11's ruling that reward cards are effects together bound throughput no matter
what the deck has grown into. [Ticket 23](23-power-growth-across-a-run.md) owns what the design does
about that.

The sim could not model real build synergy, so its pools are a **floor** on what a good deck can do,
not a ceiling. `[found by agent in the floor economy simulator]` **The exemplars are what settles it.**
Two specific charges:

1. **Print at least one card whose stat scales with the turn** — ticket 21's own example,
   *"Power equal to twice the cards Gray plays this turn"* — and say what it is actually worth at
   floors 1 and 10. If a card of that shape lifts late-run throughput on its own, ticket 23's answer
   may be *nothing to do*, and that is worth knowing before 23 is grilled.
2. **Say what a modifier multiplies late.** Ticket 10 measured the stat base falling from 6.2 on
   floor 1 to 3.6 on floor 10, and a hand of five containing a usable stat only 57% of the time on
   floor 10. Exemplar modifiers should be written against that base, not against a floor-1 one.

**Also handed down:** ticket 10 measured a healthy run at roughly **22 cards per character** rather
than ticket 09's provisional 12–15, which changes how many starter cards the exemplar set has to
account for. The number itself belongs to [ticket 24](24-starting-deck-size.md).
