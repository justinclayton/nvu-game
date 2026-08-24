# 13 — Define how Red and Gray actually differ in play

Type: grilling
Status: open
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
