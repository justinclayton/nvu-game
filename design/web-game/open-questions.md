# Web game — open questions

Rules the implementation had to read one way when more than one reading was available. Each entry
says what the code does, and why that reading fits the rulebook better than the alternative. An
entry tagged `[you]` has been ruled on and is settled; the rest are the list of things to rule on.

**`design/rulebook.md` is the authority.** Where `GLOSSARY.md` disagrees with it, `GLOSSARY.md` is
stale and the rulebook wins. `[you, 2026-09-01]`

The reading is marked in a comment beside the code, so a ruling here has one place to land.

---

## 1. Every challenge the pool met resolves

`[you, 2026-09-01]`

**Where:** `roomOutcome` in `app/src/domain/engine.ts`.

§5: *"If any challenge's threshold is met, the room is Cleared. Resolve the card text of **every**
challenge you met."* §6 agrees for Hazards — the higher tier *"**also** pays a permanent card
reward"*, on top of the lower rather than instead of it.

So a Scramble 6 pool against Collapsed Stairwell (`Scramble 2: Clear, but both of you Exhaust 1` /
`Scramble 5: Clear`) meets both lines: the room is Cleared and both characters still Exhaust 1.

`GLOSSARY.md` reads *"which is reached locks in"* in the singular, which would make one line resolve
and not the other. The rulebook wins.

One line cannot un-Clear a room another has Cleared: §5's first sentence is that any met threshold
Clears it, so Villy's `Scramble 9: Flee this room for free` is void when its `Oomph 9` line was also
met. See #3 for that line met on its own.

**A consequence for the card list, not the rules:** neither Hazard's higher tier does anything.
Collapsed Stairwell's `Scramble 5: Clear` and Ruptured Coolant Line's `Scramble 7: Clear` are both
strictly contained in the lower tier they sit above, so reaching them changes nothing. That is #7:
the cards do not print the reward tier the rulebook describes.

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
`Oomph 9: Ascend`. §5's "any threshold met Clears the room" would Clear Villy on Scramble alone,
which contradicts the line's own words.

**What the code does.** The line does not Clear: the room goes to the Fled pile and its Flee line
does not resolve. Because the room ends Fled, §9's *"the team Flees the room while that character is
in last stand"* still applies, so a character in last stand goes Down. §9's test is how the room
ends, not how it got there.

---

## 4. Last stand shuffles back the play zone only, not the hand

`[you, 2026-09-01]`

**Where:** the cleanup step of `END_PLAY`.

Rulebook §9: *"all cards in the character's play zone are shuffled into their deck, then 2 cards are
Exhausted from the top of that deck... Their hand is cleaned up as normal — unplayed cards are
Exhausted, `Hold` cards stay."*

`GLOSSARY.md`'s **last stand** entry says instead: *"the cards that would have been exhausted from
hand and play zone are shuffled back into their deck."*

**What the code does.** Follows the rulebook: play zone only. `GLOSSARY.md` is stale here.

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

`[you, 2026-09-01]` for the rule. The consequence below is still open.

**Where:** `ASCEND`.

Rulebook §10 step 1: *"Move all Stuff in both exhaust piles to the Scrapyard. It is out of the run
for good."* `GLOSSARY.md`'s **Ascend** entry says instead that Stuff *"returns to its pool"*, though
`GLOSSARY.md`'s own **Stuff**, **Scrap tax** and **Exhaust pile** entries all say Scrapyard.

**What the code does.** Follows the rulebook: the Scrapyard. `GLOSSARY.md`'s **Ascend** entry is
stale, and disagrees with its own **Stuff**, **Scrap tax** and **Exhaust pile** entries.

**Consequence worth ruling on:** the Good Stuff pool never refills. The card list prints one copy of
each of the eight Good Stuff cards, and floor 1 alone holds nine Stuff rooms. The pool is empty
well before the run ends, and a met Stuff threshold then pays nothing. That is a content question
(how many copies of each piece of Stuff the game ships) rather than a rules one, but the rules as
written give the pool no way back.

---

## 7. No Hazard in the card list prints the reward tier the rulebook describes

`[you, 2026-09-16]` Both Hazards now print `Clear, and one of you reveals a reward` as their higher tier.

**Where:** the generator's threshold parser.

Rulebook §6: a Hazard's higher threshold *"also pays a permanent card reward"*. Both Hazards in
`design/cards.yaml` print a higher tier that removes a punishment instead (`Clear, but both of you
Exhaust 1` / `Clear`).

**What the code does.** The generator recognises a `... reveals a reward` clause and the engine
implements the take-or-skip reveal, so the rule is there when a card prints it. Nothing in the
current list exercises it.

Since every met challenge resolves (#1), this is no longer only a missing bonus: a higher tier
printed as plain `Clear` above a lower tier that already clears is **completely inert**. Both
Hazards in the list are shaped that way, so their second thresholds do nothing at all. The fix is
on the cards, not in the code — a higher tier has to print something the lower one does not.

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

Rust reads *"Holding: Stuff you play has -1 Oomph."* Played on a Coil Of Cable (Oomph 0, Scramble
3) that would be Oomph -1, which would drain the shared pool rather than merely failing to fill it.

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

`[you, 2026-09-16]` Draw and Play are one phase. Drawing during play is the rule, not an exception.

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

## 15. `Exhaust X` on its own means X off the top of your own deck

`[you, 2026-09-01]`

**Where:** `printedExhaust` in `app/src/domain/engine.ts`, and the generator's clause parser.

Where a card or a room prints `Exhaust X` and names no zone, it means: move X cards from the top of
that character's deck to their exhaust pile. §8's other form, `Exhaust X cards from your hand`,
names its zone and is unaffected.

That is the only shape a card can turn off. **Zen Mode** — *"While `Holding`, you don't Exhaust
cards"* — stops bare `Exhaust X` lines aimed at its holder: a room's printed punishment, and the
holder's own Overdrive, Reckless, Reckless Swing and Panic. It reaches nothing that names its zone
or that a rule spells out in its own words, so it does not stop paying a cost, cleanup, the burned
draw of a full hand, or the price of getting out of last stand. The drain still runs.

Two consequences worth knowing, neither of them a question: Zen Mode protects its holder and not
their partner, so a team holding one can send every *"one of you Exhausts X"* line into that
character for nothing; and it can never itself be spent, so it occupies one of five hand slots for
the rest of the run.

---

## 16. Crowbar fires once a turn

**Where:** Crowbar's `onEvent`.

*"If you get any Good Stuff this turn, get an additional one."* The additional piece is itself Good
Stuff, so read as a standing trigger it would empty the Good Stuff pool into one hand.

**What the code does.** Once per turn per Crowbar, tracked by a marker in the turn record. Two
Crowbars in a hand each pay once.
