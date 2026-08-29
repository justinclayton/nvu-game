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

## Rarity re-ruled, 2026-08-25

`[you]` **Rarity is based on card value above everything.** A more powerful card is a *higher* rarity,
not a lower one; the most complex cards are still always the highest rarity, because a complex card
has to pay for its complexity in potential value when the synergy comes together.

This **reverses [ticket 11](11-card-anatomy.md)'s "a complexity signal, never a quality one"** and is
recorded there as an amendment. It came out of this ticket's own finding 4: tiering a real set strictly
on complexity put `Cutting Torch` at `Power 5` in the same tier as `Shove` at `Power 1`, because a card
with no rules text has no complexity — and since ticket 11 also made Stuff the stat engine, the axis
could not tell apart the game's most important card category.

**All 15 rarity-bearing cards were re-tiered.** The distribution went from 9/3/2 to **7 `Fine` / 4
`Cool` / 4 `Woah`**; the full table is in the
[deliverable](../prototypes/12-exemplar-card-set.md#finding-4--the-rarity-axis-collapsed-under-its-own-rule-and-has-been-replaced).

**One card changed to fit the new rule rather than being re-tiered.** `In Step` paid `Power 2–3` for
two of Gray's cards — a conditional cross-character read that never repaid the attention it demanded,
which is precisely what the ruling forbids. It now reads *"Power equal to **twice** the number of cards
Red has played into the play zone this turn"*, the shape ticket 21 used when it named this pattern.
`[proposed by agent → you approved, 2026-08-25]`. The alternative — demote it to `Fine` and accept it
as a minor card — was put and **declined**: the card keeps its ceiling and earns its tier.

**And "value" means ceiling, not rate** `[proposed by agent → you approved, 2026-08-25]`. The two
disagree in this set — `Pry Bar` is more efficient than `Cutting Torch` (3 stats per card against 2.5)
while `Cutting Torch` is plainly the bigger card — and the border reports the **ceiling**, because a
five-card hand cap means one big number clears thresholds that two good ones cannot reach. Recorded in
full on [ticket 11](11-card-anatomy.md), which owns the axis.

## Handed down by ticket 22, 2026-08-25 — the exemplar Stuff rooms need reprinting

`[you, ticket 22]` **A Stuff room prints a threshold: pay stats or leave empty-handed**, below what
Hazard and Enemy rooms ask. This is the ruling on the largest finding this ticket surfaced.

**This set cannot be reprinted yet.** It currently prints four Good Stuff cards and *no* Stuff rooms,
on ticket 11's reasoning that the room simply is the Stuff card. Two of ticket 22's four open
consequences have to be ruled before the cards can change:

- **Where the threshold prints** — a line on the Stuff card read only in the room zone, or a separate
  room card. The second roughly doubles this ticket's Stuff pool count of 16.
- **How low the threshold is** — a ticket 10 number; this set needs a placeholder to print against.

Also unruled and relevant here: **which stat the gate asks for**. Red produces `Power` and Gray
produces `Scramble`, so a gate naming one stat taxes the other character for a threshold they cannot
help meet — which is the compounding factor behind the cold review's floor-1 death.

Ticket 12 stays open regardless; the set as a whole is still unratified.

## Handed down by ticket 22, 2026-08-25 — Stuff rooms are cards now, and the pool table changes

`[you, ticket 22]` **A Stuff room is its own card** with its own flavour, printing a split challenge —
*"Power 1: Red takes 1 Good Stuff. Scramble 1: Gray takes 1 Good Stuff"* — and optionally a richer
second tier. **Good Stuff moves to a pool at the side of the table**, drawn blind when a challenge is
met.

**This set now owes four Stuff room cards it does not have.** It currently prints four Good Stuff
cards and treats them *as* the rooms, on ticket 11's since-reversed reasoning. The four Good Stuff
cards survive unchanged as pool contents; four room cards have to be written alongside them.

**Two of the three blockers noted in the previous hand-down are cleared.** Where the threshold prints
is settled — on the room card. Whether a failed Stuff room leaves the deck is settled — it is Cleared
either way. What remains is **how low the threshold is**, still a
[ticket 10](10-sim-the-resource-economy.md) number, now with a second tier to price as well. A
placeholder is fine for cutting cards.

**This ticket's finding 1 is dissolved rather than answered.** It reported that the Stuff room's type
line had to be one printed string while ticket 11 named it two. There are two cards now, so the room
reads `Stuff` and the item reads `Good Stuff`, and nothing does double duty.

**The pool table needs redoing, and one row roughly doubles.** The current table has a single combined
row, *Stuff rooms / Good Stuff — 16*. That becomes two rows on two different rules:

- **Stuff rooms** — a room pool, sized by ticket 22's room policy against the largest single-floor
  draw, as the Enemy and Hazard rows already are.
- **Good Stuff** — sized by how much is handed out per floor, which ticket 22 just **roughly doubled**:
  nine rooms paying both characters is 18 pieces on floor 1 where it used to be 9. Ticket 22 flagged
  that the 9 → 0 Stuff curve probably needs recalibrating downward as a result, which would pull this
  number back. Do not size it until that lands.

This does not touch the reward-pool problem, which is still the one number this ticket cannot make fit.

## Hand-down executed, 2026-08-25 — the four Stuff rooms are printed

The two hand-downs above are now reflected in the deliverable. **Nothing here is ruled and the set is
still unratified.**

- **Four Stuff room cards** — `Sorting Room`, `Ration Locker`, `Tool Cage`, `Spill of Cargo` — printed
  in both the [card set](../prototypes/12-exemplar-card-set.md#stuff-rooms) and the
  [cutting sheet](../../../prototype/12-exemplar-cards.html). The four Good Stuff cards survive
  unchanged as pool contents, as the hand-down said they would.
- **Every threshold on them is a placeholder**, including the second tier. That is the remaining
  blocker and it is [ticket 10](10-sim-the-resource-economy.md)'s.
- **Two of the four ask each character for the stat they do not produce**, deliberately, to put
  ticket 22's still-open *which stat* question on a physical card. That is a probe, not a proposal.
- **The pool table is split.** Stuff rooms keep the room policy at 16. **Good Stuff is left unsized**,
  because ticket 22 flagged that the 9 → 0 curve has to come down first and sizing it now would only
  have to be redone.
- **Finding 1 is marked dissolved** rather than deleted, with the original text kept as a quote.

The reward-pool problem is untouched and still the one number this ticket cannot make fit.

## Ruled 2026-08-26 — hazard reveals draw from the character pools

`[you]` **A hazard room's high threshold reveals from that character's own reward pool.** The agent's
recommendation on this ticket — a third shared pool for mid-floor reveals — is **declined**.

This keeps ticket 09's reasoning intact: a character can only build toward something if the cards they
are offered are theirs, and a shared mid-floor pool would have handed them cards that are not.

**The consequence is that this ticket's unfittable number stays unfitted.** The pool requirement
remains what this ticket costed it at — **45–55 cards per character**, because a run draws each pool
40–50 times once hazard reveals are counted alongside the ascend offers. That is roughly 90–110 unique
player cards and about 175 cards in total. The four ways out are still listed in the deliverable; the
one the agent recommended is now closed, and the remaining three are untouched by this ruling.

Sizing the pools is therefore still open, and is not answered by knowing where reveals draw from.

## Added 2026-08-27 — twenty-two more cards

`[you]` Card designs for both reward pools, Good Stuff and Bad Stuff, handed to the map in
`north-vs-up-card-designs.md`. They live in the [card bank](../prototypes/12-card-bank.md), which is
where the pools fill up from here; the exemplar set stays the twenty-four cards that tested the anatomy.

The bank ends with the places these cards sit against rulings already made — a mid-floor draw from a
reward pool, a card that scouts the floor deck, and two cards with no cost field. Those are open, not
fixed.


## Ruled 2026-08-29 — `Pack Rat` is dropped

`[you]` **`Pack Rat` is dropped from the exemplar set.** It was priced as the only way to carry Stuff
between floors, and [ticket 24](24-the-scrap-mechanic.md) made carrying Stuff forward free for
everyone. The difference it still made — keeping Stuff as playable Stuff rather than as deck stamina —
did not justify a `Woah` slot at `Cost 2`. Removed from the
[deliverable](../prototypes/12-exemplar-card-set.md#dropped-2026-08-29--pack-rat), the cutting sheet
and the simulator.

**The set is now 24 cards** — 10 player cards, 4 Good Stuff, 2 Bad Stuff, 4 rooms, 4 Stuff rooms.

**This leaves one of the brief's requirements uncovered.** `[finding]` The brief asks for a card whose
purchase is a genuinely hard call under ticket 09's acquisition rules, and `Pack Rat` was that card.
Nothing replaces it, and the set is short one exemplar until something does.

**It also exposed a duplication problem, now [ticket 25](25-single-source-for-the-card-list.md).**
Dropping one card was a five-place edit, and the three copies of the card list had already drifted —
the simulator ticket 10 depends on is running cards that do not exist. Ticket 25 blocks ticket 10.


## Ruled 2026-08-29 — `Heavy Pockets` and `Pack Away` survive ticket 24

`[you]` Both cards shuffle Stuff into a deck, which [ticket 24](24-the-scrap-mechanic.md) does for
free at the ascend. They **survive** where `Pack Rat` did not, because they act **mid-floor**: a card
shuffled in partway through a floor is stamina you can still draw and spend this floor, where the free
version only arrives once the floor is over.

**The general principle** `[proposed by agent → you approved]`: a card that does at the ascend what
ticket 24 already gives away is dead weight; a card that does it mid-floor is buying tempo and earns
its slot. This is the test `Pack Rat` failed and these two pass, and it applies to any future card in
the same shape.

**It exposes a gap in ticket 24.** `[finding]` Ticket 24's ascend sorts the exhaust pile and the hand,
and says nothing about Stuff sitting **in a deck** — which is where these two cards put it. Whether it
returns to the pool or stays a permanent deck card decides whether they are tempo cards or permanent
upgrades. That is ticket 24's to answer, not this ticket's.


## Ruled 2026-08-29 — where `Scrap` lives

`[you]` **`Scrap` goes on all `Stuff`**, and **stays off almost all reward cards** — not ruled out,
but reserved for something like a character-specific `Woah` bomb that is overpowered because it can
only be used once. Recorded as an anatomy amendment on [ticket 11](11-card-anatomy.md).

The effect on this ticket's Scrap gap: the set does not need a new Scrap *reward* card. It needs its
**Good Stuff reprinted**, because all four exemplar pieces — `Pry Bar`, `Coil of Cable`,
`Cutting Torch`, `Grav Harness` — currently print no Scrap line at all. The card bank's Good Stuff
already does this (`Crowbar`, `Stitch-Kit`, `Overcharged Battery` all Scrap themselves), so the
exemplars are the ones out of step.

**The acquisition-inversion slot is still uncovered** and this ruling does not fill it. If anything it
narrows the options: the obvious candidate was a Scrap-costed reward card, and those are now meant to
be rare.

### Two things this raises

- **Does "all Stuff" include Bad Stuff?** `[finding]` Bad Stuff is Stuff by type, but ticket 24 casts
  it as the fuel that *other* cards Scrap. If Bad Stuff carries its own Scrap line, a player sheds
  junk whenever they like and Bad Stuff stops being a burden. The two exemplar pieces already print
  *"Play this to be rid of it"*, so an escape hatch exists; whether Scrap is a second, cheaper one is
  unruled.
- **Is the ascension swap net −1 card or net 0?** `[finding]` You described thinning as happening
  "only in a swap sense", which reads as net 0 — a starter out, a piece of Stuff in. Ticket 24 instead
  says decks *"get leaner and better and smaller"*, which is only true if the kept Stuff was already
  counted in the deck from the held-Stuff step. Which one it is decides whether the inversion is ever
  escapable. Raised on [ticket 24](24-the-scrap-mechanic.md).
