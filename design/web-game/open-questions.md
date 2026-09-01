# Web game — open questions

Rules the implementation had to read one way when more than one reading was available. Each entry
says what the code does, and why that reading fits the rulebook better than the alternative. None of
these is a ruling; they are the list of things to rule on.

The reading is marked in a comment beside the code, so a ruling here has one place to land.

---

## 1. A Hazard's higher tier resolves instead of the lower, not as well as it

**Where:** `app/src/domain/engine.ts`, the room check.

Rulebook §5 says *"If any challenge's threshold is met, the room is Cleared. Resolve the card text
of **every** challenge you met."* Read literally, a Scramble 6 pool against Collapsed Stairwell
(`Scramble 2: Clear, but both of you Exhaust 1` / `Scramble 5: Clear`) meets both lines, so the team
clears the room *and* takes the lower line's punishment — the higher tier is a downgrade.

`CONTEXT.md` says the opposite in the singular: *"which is reached locks in only once the players
declare the play phase done"*, and *"the lower clears the room and moves the players on; the higher
clears it and pays a permanent card reward."*

**What the code does.** On an Enemy or a Hazard room, exactly one threshold resolves: the highest
met line, preferring a line that Clears over one that does not, then the higher printed value, then
printed order. On a Stuff room every met line still resolves, because a Stuff room's lines are split
per character rather than tiered — that is the case §5's wording actually describes.

---

## 2. A Stuff-room line naming both characters reads the shared pool

**Where:** the generator, `tools/cards.mjs`, and the room check.

Rulebook §6 says a Stuff room's challenge is split per character and *"each character is measured on
their own side of the play zone only"*. Tool Cage and Spill Of Cargo print a line that names both
(`Scramble 3: Both of you get Good Stuff.`), and a line naming both names no single side.

**What the code does.** A line naming exactly one character is measured on that character's side; a
line naming both is measured on the shared pool and pays both standing characters. Each character
then takes the largest amount any met line awards them, so `Red gets 2 instead` replaces rather than
adds to `Both of you get Good Stuff`.

---

## 3. "Flee this room for free" does not Clear the room

**Where:** the generator, and the room check.

Villy, Coney's Work Husband prints `Scramble 9: Flee this room for free.` alongside
`Power 9: Ascend`. §5's "any threshold met Clears the room" would Clear Villy on Scramble alone,
which contradicts the line's own words.

**What the code does.** The line does not Clear: the room goes to the Fled pile and its Flee line
does not resolve. Because the room ends Fled, §9's *"the team Flees the room while that character is
in last stand"* still applies, so a character in last stand goes Down. §9's test is how the room
ends, not how it got there.

---

## 4. Last stand shuffles back the play zone only, not the hand

**Where:** the cleanup step of `END_PLAY`.

Rulebook §9: *"all cards in the character's play zone are shuffled into their deck, then 2 cards are
Exhausted from the top of that deck... Their hand is cleaned up as normal — unplayed cards are
Exhausted, `Hold` cards stay."*

`CONTEXT.md`'s **last stand** entry says instead: *"the cards that would have been exhausted from
hand and play zone are shuffled back into their deck."*

**What the code does.** Follows the rulebook: play zone only. The rulebook is the more specific of
the two — it spells out what happens to the hand in the same breath.

---

## 5. A full hand allows exactly one draw, and it is burned

**Where:** `validate` on `DRAW`.

§5 gives two rules that meet in one case: *"You may not draw up while holding 5 or more cards"* and
*"A full hand does not excuse the minimum. Draw your one card anyway — and put it straight into your
exhaust pile."*

**What the code does.** With a full hand, `DRAW` is legal only while the character has not yet drawn
this turn, and that one card goes to the exhaust pile. A second burned draw is rejected. Reading it
any other way lets a character burn their whole deck a card at a time for nothing.

---

## 6. Stuff in an exhaust pile goes to the Scrapyard at ascension, not back to its pool

**Where:** `ASCEND`.

Rulebook §10 step 1: *"Move all Stuff in both exhaust piles to the Scrapyard. It is out of the run
for good."* `CONTEXT.md`'s **Ascend** entry says instead that Stuff *"returns to its pool"*, though
`CONTEXT.md`'s own **Stuff**, **Scrap tax** and **Exhaust pile** entries all say Scrapyard.

**What the code does.** Follows the rulebook and the majority of `CONTEXT.md`: the Scrapyard.

**Consequence worth ruling on:** the Good Stuff pool never refills. The card list prints one copy of
each of the eight Good Stuff cards, and floor 1 alone holds nine Stuff rooms. The pool is empty
well before the run ends, and a met Stuff threshold then pays nothing. That is a content question
(how many copies of each piece of Stuff the game ships) rather than a rules one, but the rules as
written give the pool no way back.

---

## 7. No Hazard in the card list prints the reward tier the rulebook describes

**Where:** the generator's threshold parser.

Rulebook §6: a Hazard's higher threshold *"also pays a permanent card reward"*. Both Hazards in
`design/cards.yaml` print a higher tier that removes a punishment instead (`Clear, but both of you
Exhaust 1` / `Clear`).

**What the code does.** The generator recognises a `... reveals a reward` clause and the engine
implements the take-or-skip reveal, so the rule is there when a card prints it. Nothing in the
current list exercises it.

---

## 8. A skipped reward reveal goes to the bottom of its pool

**Where:** the `RewardReveal` pending choice.

The rulebook flags this itself, in §6: *"NOT YET RULED — whether a skipped reveal goes to the bottom
of its pool, as a declined ascension reward does (ticket 09)."*

**What the code does.** Bottom of the pool, matching the declined ascension reward.

---

## 9. Floors 4 to 10 have no Enemy room to guard them

**Where:** floor setup.

Enemy rooms name the floor they guard (`floor: 1`, `2`, `3`). §4 builds every floor from 1 Enemy, 3
Hazards and 10-minus-the-floor Stuff rooms, and there is no Enemy printed for floors 4 upward.

**What the code does.** Takes the Enemy whose printed floor matches; failing that, any Enemy room.
A floor past 3 is therefore playable but guarded by a repeat. This is content, not rules.

---

## 10. A card's contribution to the pool never goes below zero

**Where:** `contributionOf` in `app/src/domain/queries.ts`.

Rust reads *"Holding: Stuff you play has -1 Power."* Played on a Coil Of Cable (Power 0, Scramble
3) that would be Power -1, which would drain the shared pool rather than merely failing to fill it.

**What the code does.** Each card's contribution is floored at zero. A card reduced past nothing
contributes nothing.

---

## 11. A printed "this costs 0" is set first, then modifiers apply

**Where:** `costOf`.

Fast Follow reads *"If Gray played a card this turn, this costs 0"*, and Sluggish reads
*"Holding: cards cost +1 to play."* Holding both, Fast Follow costs either 0 or 1.

**What the code does.** The printed cost is what the card says it is, and a `Holding:` line adjusts
it afterwards — so Fast Follow costs 1 while Sluggish is in hand. The alternative reading, that a
printed 0 cannot be raised, would make "costs 0" a stronger keyword than anything else on a card.

---

## 12. "The card that clears the room" is read as "the room ended Cleared"

**Where:** Both Barrels' `onCleanup`.

Both Barrels reads *"If this is the card that clears the room, put this right back in your hand."*
§5 checks the room **once**, when both characters have stopped, so no single card ever clears it —
a pool does.

**What the code does.** If the room ended Cleared and Both Barrels is in the play zone, it returns
to hand at cleanup instead of Exhausting. Being the card that tipped the pool over the line is not
something the rules can identify.

---

## 13. A card may draw during the Play phase

**Where:** Covering Fire, I Know Kung Fu, Grav Harness.

§5 says *"once play begins, nobody draws."* Three cards say otherwise in their own text.

**What the code does.** The rule is the default and a card's printed text is the exception, which is
the ordinary convention for a card game. Nothing rules on it explicitly.

---

## 14. "The next card played this turn costs 0" means the holder's next card

**Where:** Overcharged Battery.

The card names no character.

**What the code does.** The discount goes to whoever played the Battery. §5's *"Red never pays for
Gray"* is the reason: a cost is a private thing between a character and their own hand, so a
discount should not cross either. The discount is also spent only when it saved something — a card
that already cost nothing does not use it up.

---

## 15. Zen Mode has no implementation

**Where:** nowhere. It is the one card with printed text and no behaviour, and
`app/src/content/behaviour-coverage.test.ts` pins that fact so it cannot be forgotten.

Zen Mode reads *"While `Holding`, you don't Exhaust cards."* Taken literally that stops paying costs
(§5), cleanup (§5), a room's printed punishment (§8), the last-stand exit tax (§9) and the burned
draw of a full hand (§5) — which between them are most of how the game spends you. There is no
reading here that is obviously the intended one, and guessing would quietly rewrite five rules.

It is a `proposed` card, so the build gate does not require it. It needs a ruling on which of those
Exhausts it stops before it can be written.

---

## 16. Crowbar fires once a turn

**Where:** Crowbar's `onEvent`.

*"If you get any Good Stuff this turn, get an additional one."* The additional piece is itself Good
Stuff, so read as a standing trigger it would empty the Good Stuff pool into one hand.

**What the code does.** Once per turn per Crowbar, tracked by a marker in the turn record. Two
Crowbars in a hand each pay once.
