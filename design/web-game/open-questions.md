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

§5: *"If more than one challenge has been cleared, their outcomes may be resolved in any order."*
That only makes sense if every met challenge's outcome resolves, not just one. §6 agrees for
Hazards: the higher tier *"also gives a reward"*, on top of the lower tier rather than instead of
it.

So a Scramble 5 pool against Collapsed Stairwell (`Scramble 2: Clear, but both of you Exhaust 1.` /
`Scramble 5: Clear, and one of you reveals a reward.`) meets both lines: the room is Cleared, both
characters Exhaust 1, and one of them reveals a reward.

One line cannot un-Clear a room another has Cleared: §5's first sentence is that any met threshold
Clears it, so Villy's `Scramble 9: Flee this room for free` is void when its `Oomph 9` line was also
met. See #3 for that line met on its own.

---

## 2. A Stuff-room line naming both characters reads the shared pool

**Where:** the generator, `tools/cards.mjs`, and the room check.

Rulebook §6 says a Stuff room's challenges are split per character: *"Measure each character's
challenge against that character's own side of the play zone only."* Tool Cage and Spill Of Cargo
print a line that names both (`Scramble 3: Both of you get Good Stuff.`), and a line naming both
names no single side.

**What the code does.** A line naming exactly one character is measured on that character's side; a
line naming both is measured on the shared pool and pays both standing characters. Each character
then takes the largest amount any met line awards them, so `Red gets 2 instead` replaces rather than
adds to `Both of you get Good Stuff`.

---

## 3. "Flee this room for free" does not Clear the room

**Where:** the generator, and the room check.

Villy, Coney's Work Husband prints `Scramble 9: Flee this room for free.` alongside
`Oomph 9: Ascend`. §5's *"if any challenge's threshold has been met or exceeded, the players Clear
the room"* would Clear Villy on Scramble alone, which contradicts the line's own words.

**What the code does.** The line does not Clear: the room goes to the Fled pile and its Flee line
does not resolve. Because the room ends Fled, §9's rule that a character in last stand goes Down
when the room was Fled still applies. §9's test is how the room ends, not how it got there.

---

## 4. Last stand shuffles the play zone only; the hand carries over untouched

`[you, 2026-09-01]`

**Where:** the cleanup step of `END_PLAY`.

Rulebook §9: *"If the room was Cleared, instead of discarding your side of the play zone, shuffle
your play zone to form your new remaining deck, then Exhaust 2 cards from the top of your deck."*
Cleanup never touches a hand, in or out of last stand — every card in hand carries over to the next
turn.

**What the code does.** Follows the rulebook: only the play zone shuffles in and pays the price; the
hand is left exactly as it was.

---

## 5. A full hand does not skip the opening draw; it burns the card instead

**Where:** `drawOne` in `app/src/domain/verbs.ts`, called from the opening draw in `engine.ts`.

§2 gives two rules that meet on a turn's first draw: *"Both players draw 1 card at the same time"*
and *"If you are holding 5 or more cards, you have a Full Hand and cannot draw. If you are forced to
draw with a Full Hand, that card goes into your discard pile instead."*

**What the code does.** The opening draw always happens, full hand or not; a Full Hand character's
opening card goes straight to their discard pile instead of their hand. "Cannot draw" governs only
the later, voluntary draws in the phase — those are refused outright while the hand is full. Reading
the opening draw as skipped instead would leave "if you are forced to draw with a Full Hand"
describing nothing, since nothing else in the Draw phase forces a draw.

---

## 6. Stuff in a discard pile goes to the Scrapyard at ascension, not back to its pool

`[you, 2026-09-01]` for the rule. The consequence below is still open.

**Where:** `ascendOne` in `app/src/domain/engine.ts`.

Rulebook §10 steps 1–2: *"Separate your discard pile: Split it into Stuff cards and non-Stuff cards.
Say Goodbye to Your Stuff: Scrap the Stuff cards. You may keep one Stuff card by Scrapping one
non-Stuff card from your discard pile in its place."*

**What the code does.** Every Stuff card in the discard pile is Scrapped, except the one card a
player keeps by Scrapping a non-Stuff card from that pile in its place.

**Consequence worth ruling on:** the Good Stuff pool never refills. The card list prints one copy of
each of the eight Good Stuff cards, and floor 1 alone holds nine Stuff rooms. The pool is empty
well before the run ends, and a met Stuff threshold then pays nothing. That is a content question
(how many copies of each piece of Stuff the game ships) rather than a rules one, but the rules as
written give the pool no way back.

---

## 7. Both Hazards print a reward tier

`[you, 2026-09-16]`

**Where:** the generator's threshold parser, and `design/cards.yaml`.

Rulebook §6: a Hazard's higher threshold *"also gives a reward: turn the top card of the named
character's reward pool face up. That character takes it or skips it."* Both Hazards in
`design/cards.yaml` — Collapsed Stairwell and Ruptured Coolant Line — print `Clear, and one of you
reveals a reward.` as their higher tier.

**What the code does.** The generator recognises the `... reveals a reward` clause and the engine
implements the take-or-skip reveal, so both Hazards exercise it.

---

## 8. A skipped reward reveal goes to the bottom of its pool

`[you, 2026-09-16]`

**Where:** the `RewardReveal` pending choice.

Rulebook §6: *"A skipped card goes to the bottom of the reward pool."*

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

## 12. Both Barrels and Riot Shield come back when the room is Cleared

`[you, 2026-09-16]`

**Where:** the `onCleanup` of Both Barrels and of Riot Shield.

Both cards read *"If the room is Cleared, return this to your hand at the end of the turn."* If the room ended
Cleared and the card is in the play zone, it returns to hand at Cleanup instead of being discarded.
If the room was Fled, it is discarded with the rest of the play zone. The return is not optional.

---

## 13. A card may draw during the Play phase

`[you, 2026-09-17]`

**Where:** Covering Fire, I Know Kung Fu, Grav Harness.

§5 says *"you may not draw during this phase."* Three cards say otherwise in their own text.

**What the code does.** The rule is the default and a card's printed text is the exception, which is
the ordinary convention for a card game. The phase is checked only by the `DRAW` command's own
legality; `drawOne`, which every card-driven draw goes through, does not check it.

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
that character's deck to their discard pile. §8's other form, `Discard X cards from your hand`,
names its zone and is unaffected.

That is the only shape a card can turn off. **Zen Mode** — *"Holding: you don't `Exhaust`"* —
stops bare `Exhaust X` lines aimed at its holder: a room's printed punishment, and the
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

---

## 17. Last stand activates the instant any deck becomes empty

`[you, 2026-09-17]`

**Where:** `drawOne` and `exhaustFromDeck` in `app/src/domain/verbs.ts`, which call
`activateLastStand` on themselves; `engine.ts`'s cleanup sweeps once more as a backstop.

§9: *"When your deck becomes empty, your character immediately enters Last Stand."* A draw or an
Exhaust is what empties a deck, and the turn runs on after either: the partner may draw, a card may
trigger, the room may still owe more of its punishment. Waiting for the phase to end would leave a
character acting, or being acted on, while §9 says they are already in Last Stand.

**What the code does.** `drawOne` and `exhaustFromDeck` are the only two places a card ever leaves
the top of a deck, so each sweeps for last stand on itself the moment it empties one. Every cause
goes through one or the other: a chosen or opening draw, a draw a card's text forces, a card's own
`Exhaust X`, and a room's printed punishment. The state is live in the same step the deck empties,
not at the end of the phase. `engine.ts` still sweeps once more at cleanup as a backstop, which
ordinarily finds nothing left to do.

**Consequence worth knowing:** a character whose deck a room's Flee punishment empties enters Last
Stand during Outcome, before Cleanup runs. §9 sends a character Down at Cleanup if they are in Last
Stand and the room Fled, with no exception for how recently they entered it — so this character goes
Down at that same Cleanup, exactly as a character who had already been in Last Stand since an
earlier draw does. The only difference is how much of the turn each spent there: the
earlier-emptied character got a Play phase with every card free before going Down, and the one
emptied by the Flee punishment did not, since Play had already ended.

---

## 18. The floor deck's Hazard count is fixed at 3, not left to chance

**Where:** `HAZARD_ROOMS_PER_FLOOR` in `app/src/domain/setup.ts`.

The Floor deck section says only: *"select randomly from the available Floor cards until you have
the right number."* It does not say how many of those are Hazards and how many are Stuff. The card list
prints exactly 6 Hazard rooms (3 Collapsed Stairwell, 3 Ruptured Coolant Line), and every used room
returns to the supply at Ascending, so a fixed 3 Hazards a floor is what the printed counts support.

**What the code does.** Takes exactly 3 Hazard rooms and 1 Enemy room every floor, then fills the
rest with Stuff rooms (10 minus the floor number). A draw at random from the whole Floor-card
supply, Hazard and Stuff mixed together, would also fit the rulebook's words, and could leave a
floor with more or fewer than 3 Hazards.

---

## 19. Deadweight Grip's draw cap also stops a forced draw

**Where:** `My Head Is Quantum Spinning`'s `onEvent`, `app/src/domain/cards/stuff.ts`.

The designer ruled that Faceful Of Slime's draw cap stops a forced draw outright — no card moves,
and no draw event fires — rather than letting the forced draw happen and only then discarding it
the way a Full Hand does. Deadweight Grip prints its own draw cap of 2 the same way Faceful Of Slime
prints 1, and both are read by the same `drawCapFor`.

**What the code does.** The forced draw checks `drawCapFor` for whoever it would land on, whichever
card is capping them. A Deadweight Grip holder who has already drawn their 2 cards this turn is
skipped exactly as a Faceful Of Slime holder at 1 is. This extension to Deadweight Grip was not
itself ruled on — it follows from reading the same code the ruling named.
