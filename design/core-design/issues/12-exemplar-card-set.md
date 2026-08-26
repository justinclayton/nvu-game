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

## Built 2026-08-25 — awaiting your ruling

The set exists and is on paper. **Nothing in it is adopted and this ticket stays open**, because the
map's standing rule is that the agent surfaces options and the human rules. Everything below is
`[proposed by agent → awaiting your ruling]`.

- **[The exemplar card set](../prototypes/12-exemplar-card-set.md)** — 21 cards: 4 starters, 7 reward
  cards, 4 Good Stuff, 2 Bad Stuff, 4 rooms. Every card is annotated with which of this ticket's
  requirements it stresses and why.
- **[The one-page rules summary](../prototypes/12-floor-rules-summary.md)** — enough to play a floor
  with them, assembled only from closed tickets.
- **[The printable sheet](../../../prototype/12-exemplar-cards.html)** — poker-size, cut on the
  borders, border colour is rarity.

### The findings, in short

1. **The anatomy holds.** No card needed a field that does not exist. Three smaller findings, all
   belonging to [ticket 11](11-card-anatomy.md) rather than being amended here: the **Stuff room's
   type line has to be one printed string** and ticket 11 named it two; **"no stat field" no longer
   reliably means "no stats"** now that conditional stats live in effect text; and **player cards
   want a cleanup timing hook**, which ticket 21 ruled on for rooms but never for player cards.
2. **One thing the rules could not express: healing.** `Second Wind` recovers cards from the exhaust
   pile, which ticket 04 authorised and then made impossible by banning mid-floor shuffling. The set
   prints it deliberately so the question cannot be designed around quietly. It is also the first
   mechanic that has to be judged under ticket 04's decision to have no structural recursion guard
   rail.
3. **Reading time is not answered and cannot be from here** — it needs a person and a timer, which is
   [ticket 20](20-encounter-tabletop-prototype.md)'s table. The set names the three cards to time,
   the control to time them against, and predicts that `Both Barrels` misses the budget on purpose.
4. **The triple read is a double read.** Health is the height of a pile, not a property of a card, so
   the third read never appears. A card is only ever read in hand, where it asks one question: *fuel
   or play?* This is a simplification of the hardest problem ticket 11 thought it had.

### The one number this ticket owes and cannot make fit

Ticket 09's target — a declined reward card is **essentially never seen again in that run** — implies
**45–55 cards per character pool**, because a run draws each pool 40–50 times (30 at the ascend, up to
30 more from hazard reveals). That is 90–110 unique player cards, and about **175 cards total** with
the rooms and Stuff. Four ways out are laid out in the deliverable; the agent's recommendation, marked
as such, is to have **hazard reveals draw from a third shared pool** instead of the character pools.

### On reaching the destination

Not yet, and this ticket should not claim it. The destination needs this set *ruled on*, and
[ticket 13](13-red-and-gray-asymmetry.md) is still open — the Red/Gray difference in this set is
flavour standing in for a decision nobody has made.

## Revised 2026-08-25, after a cold review

The set was handed to a reviewer given **only the card sheet and the rules summary** — no tickets, no
map, no access to any reasoning. It set up floor 1 and played ten turns.

### The ruling this produced

`[you, 2026-08-25]` **Down is redefined and last stand becomes a state.** Full text and consequences
are recorded as amendments on [04](04-deck-as-energy-and-hp-model.md),
[07](07-turn-and-action-economy.md) and [17](17-last-stand.md), and handed to
[14](14-down-and-revive.md), which owns the subject:

> When a character's deck is empty, that character enters **last stand**. A character is **Down** when
> something would Exhaust a card from their empty deck, **or** when the team Flees the room while that
> character is in last stand. While Down, a character gets no rewards, cannot act, and **cannot have
> cards added to their hand.**

It closes three holes the review found: a character could be declared **Down at full health** once
five `Hold` cards jammed their hand against the cap; last stand's Flee-cost trigger opened a free-play
window onto a phase that was already over; and a Down character was a **dumpster for unwanted Stuff**,
defusing the hand cap that exists to price `Hold`.

### Cards fixed

`Reckless` (rarity, and its drawback was null at zero deck — fixed by the ruling, not the card),
`Both Barrels` (its upside deleted the card), `Scrap Sense` (killed itself on the game's most common
turn), `Catch Your Breath` (strictly worse than the starter it replaces), `In Step` (wording),
`Collapsed Stair` (fleeing was cheaper than clearing), and four rarity corrections. Full table in the
[deliverable](../prototypes/12-exemplar-card-set.md#revision-2026-08-25--after-a-cold-review).

### Two findings that are not this ticket's to fix

- **Stuff rooms are a decision-free tax and they are most of floor 1.** Nine of thirteen rooms have no
  threshold and no Flee line, yet the mandatory draw still charges both characters a card. In the
  reviewer's playthrough **six of ten turns were "draw one, throw it away", and Gray went Down on turn
  7 without a single enemy or hazard touching them.** This is composition, and belongs to
  [ticket 22](22-floor-deck-composition.md) and [ticket 20](20-encounter-tabletop-prototype.md). It is
  the largest finding in the review.
- **The rarity axis collapses under its own rule.** Auditing strictly on complexity left `Woah`
  holding two cards and `Fine` holding nine, because **a card with no rules text has no complexity** —
  `Cutting Torch` at `Power 5` lands in the same tier as `Shove` at `Power 1`. So rarity cannot
  differentiate Good Stuff at all, which contradicts [ticket 11](11-card-anatomy.md) in its own words:
  it ruled Good Stuff carries rarity because *"a `Woah` Stuff should be an exciting flip"* — which is
  quality, the reading it forbade three paragraphs earlier. One of those two lines has to go, and it
  is ticket 11's to lose.
