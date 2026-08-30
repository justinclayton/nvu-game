# 13 — Define how Red and Gray actually differ in play

Type: grilling
Status: closed
Blocked by: 04, 09
Map: [core design map](../map.md)

## Question

Ticket 03 settled that two characters are always in play and named their archetypes: **Red** is
stocky, aggressive, headstrong; **Gray** is more concerned, attuned, resourceful. That is a design
*intent*. This ticket turns it into mechanics.

The risk this ticket exists to manage: "aggressive vs. resourceful" is the most generic pairing in
game design, and it is very easy to end up with two characters who differ only in flavour text and
a damage number. If the difference does not change what the player *does on their turn*, it is not
a difference.

Decide:

1. **Where the asymmetry lives.** Different starting decks? Different card pools they may acquire
   from? A unique permanent ability? Different base statistics? Different relationships to the
   resource model? Pick the smallest set that makes them feel unlike each other.
2. **The one-sentence test.** State, in one sentence each, what Red can do that Gray cannot, and
   vice versa. If either sentence is hard to write, the asymmetry is not real yet.
3. **Whether asymmetry touches the resource model.** Ticket 04 will have settled how cards serve
   as energy and health. Does Red burn through his faster? Does Gray get more out of the same
   cards? This is the most interesting available axis and the most dangerous to balance.
4. **Interdependence.** Whether the characters are merely different or actively need each other.
   A co-op game where the two could swap decks and barely notice has wasted the premise. Decide
   whether there is something Red simply cannot solve without Gray.
5. **Balance posture.** Whether the two are meant to be equally strong, or deliberately unequal in
   a way the design accounts for.
6. **Solo load.** Both characters are driven by one brain in solo play. Asymmetry that requires
   holding two complex rule sets at once is much more expensive solo than in co-op. State the
   complexity budget per character with that in mind.

## Inputs

- Ticket 03's answer — two decks, two health pools, open information, alternating turns.
- Ticket 04's resource model, and ticket 09's acquisition model — asymmetry is expressed mostly
  through what cards a character starts with and can gain.

## Notes for the session

- The named archetypes came from the designer directly and are not up for renaming. What they
  *mean* mechanically is entirely open.
- Resist giving each character a long unique rules block. Under the low-complexity constraint, the
  best answer is likely one structural difference plus different starting decks.

## Inherited from ticket 21

`[you, 2026-08-23]` The stat keywords are a ready-made axis for this ticket. Rooms print a **named**
threshold — `Power X` for combat, `Scramble X` for hazards — and a card only counts toward the stat
it carries, so **a character whose deck leans Power is genuinely bad at hazard rooms** and vice
versa. That is asymmetry with real teeth and no extra rules, and it is the obvious first place to
look for how Red and Gray differ. It is a **candidate, not a decision** — this ticket rules.

Also available cheaply: the team chooses whose hand a cleared item lands in, so an item can be routed
to whichever character its stats suit.

## Handed down by ticket 09, 2026-08-24

**This ticket no longer decides *whether* Red and Gray differ — only how.**

`[you, ticket 09]` Permanent card rewards come from **two per-character pools**: Red chooses one of
three from a Red pool, Gray one of three from a Gray pool. The reason is synergy — a character can
only build toward something if the cards they are offered are theirs. That commits the design to
**card-level asymmetry**, so "Red and Gray play the same cards with different flavour" is off the
table.

`[you, ticket 09]` **Starting decks are per character and are allowed to differ.** Ticket 09 settled
the shape and left the content to this ticket. Size is 12–15 cards, provisional, owned by ticket 10.

Still this ticket's to answer, unchanged: what the difference *is*, and whether it runs deeper than
the card pools — different starting deck contents, different stat leanings, or different roles
entirely. Ticket 22's handed-down note that **stats may live on floor rooms rather than on player
cards** is still live and bears directly on this.

## Handed down 2026-08-25 — one input gained, one lever lost

**The input.** `[you]` **Each character leans toward one stat without being locked to it.** Red leans
`Power`, Gray leans `Scramble`, but each can supply the other — especially since either can be holding
Stuff that provides it.

This softens what this ticket inherited from ticket 21. That inheritance read *"a character whose deck
leans Power is genuinely bad at hazard rooms and vice versa"*, offered as asymmetry with real teeth.
The teeth stay, but they are **a matter of what is in each starting deck, not a wall in the rules**.
Ticket 21's keyword rule is untouched — a card still only counts toward the stat it carries — so this
costs nothing and needs no new machinery. It is a statement about deck composition, which is this
ticket's to make.

It matters more than it looks, because [ticket 11](11-card-anatomy.md) made Stuff the stat base. A
character locked out of a stat entirely would be locked out by their **scavenged gear** as much as by
their deck, which is not a difference anyone chose.

**The lever lost.** This ticket had ticket 09's routing rule written down as a cheap asymmetry tool —
*"the team chooses whose hand a cleared item lands in, so an item can be routed to whichever character
its stats suit."* [Ticket 22](22-floor-deck-composition.md) deleted that choice: Stuff rooms now pay
each character separately, so there is nothing to route. Recorded as an amendment on
[ticket 09](09-card-acquisition-and-deckbuilding.md).

**What replaces it is arguably better for this ticket.** A Stuff room's split challenge — *"Power 1:
Red takes 1. Scramble 1: Gray takes 1"* — makes the Red/Gray difference **visible on a card in the
floor deck**, not just in two decklists. Whatever this ticket decides the difference is, the room
cards will be printing it every floor.

## Answer, 2026-08-29

`[you]` **The asymmetry is entirely card-level, and it is entirely the stat lean.** Red's cards
carry `Power`, Gray's carry `Scramble`. There is nothing else. No unique ability, no different
relationship to the resource model, no rule either character has that the other does not.

**No permanent abilities.** `[you]` Neither character gets a rules block of their own. Explicitly
*for now* rather than forever — the door is open to add one later, but nothing in the core spec
waits on it.

**No designed interdependence.** `[you]` Asked whether anything exists that Red simply cannot get
past without Gray, the ruling was that it depends on what Stuff he is holding, and there is nothing
to design for at this stage. Since [ticket 11](11-card-anatomy.md) made Stuff the stat base and
either character can be holding any of it, a hard lock could not be guaranteed anyway. The
characters are different, not codependent.

**Equally capable.** `[you]` Neither is deliberately stronger. Balance posture is parity.

**Same spend rate.** `[you]` Red does not burn through his deck faster to pay for bigger numbers.
Both characters spend stamina at the same rate; the difference is *which stat* the spend produces,
never *how much* it costs.

**Starting deck contents are not this ticket's.** `[you]` The decklists are settled with the numbers
— [ticket 10](10-sim-the-resource-economy.md) owns starting deck size and composition, and how
strongly each list leans is part of that. This ticket says only that the lean exists.

## What this closes

- **Sub-question 1 (where the asymmetry lives)**: the card pools, and nothing else.
- **Sub-question 2 (the one-sentence test)**: *Red turns a card into `Power`; Gray turns a card into
  `Scramble`.* Both sentences are easy to write, which was the test.
- **Sub-questions 3, 4 and 5**: no, no, and parity, as above.
- **Sub-question 6 (solo load)**: answered by construction. With zero per-character rules, a solo
  player holds **one** rule set and two decklists, not two rule sets. This was the ticket's stated
  worry and the ruling removes it entirely.

## The risk this ticket was created to manage

The ticket opened by naming the failure mode: *"aggressive vs. resourceful" is the most generic
pairing in game design, and it is very easy to end up with two characters who differ only in flavour
text and a damage number.* The ruling accepts a version of that deliberately, and it is worth being
honest about why it is not the failure mode:

- **The stat lean is not flavour.** Rooms print a *named* threshold and a card only counts toward the
  stat it carries `[you, ticket 21]`, so a Power card is not a bigger Scramble card — it does nothing
  at all against a hazard. The two characters are not on one axis at different magnitudes.
- **The difference is printed on the floor deck, not just on two decklists.** Ticket 22's split
  challenge — *"Power 1: Red takes 1. Scramble 1: Gray takes 1"* — puts the Red/Gray distinction on a
  card the team flips every floor.
- **Nothing here is load-bearing against a later addition.** The lean costs no rules, so a permanent
  ability could be added on top without unpicking anything.

**What to watch:** whether the two decks feel like different characters or like one deck cut in half.
That is a table question, not a spec question — [ticket 20](20-encounter-tabletop-prototype.md)
already carries it, and ticket 12 flagged that the Red/Gray difference in the exemplar set is
currently flavour standing in for this ruling. It no longer is: the lean is the ruling.
