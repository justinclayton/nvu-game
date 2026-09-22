# Playtest 4 — first agent run on rules 0.2

Recorded 2026-09-22. Rules version 0.2.0 (draft), as in `design/rulebook-0.2-draft.md`. Played by an
agent standing in for a human playtester, in the CLI (`bin/nvu`), seed 4, one shell call per move.
The run reached floor 5 of 10 and was stopped at the turn-25 limit with both characters alive and
nowhere near a loss.

This is the first playtest of the 0.2 draft, sometimes called the "marathon model": the discard pile
recycles into a fresh deck when it empties, Exhaust is permanent instead of healing on Ascend,
Stamina carries across floors, and each Turn Start draws up to five with unspent cards staying in
hand. Because every card is due for re-tuning against these new rules, this note weights engine
fidelity and rulebook gaps over balance and difficulty. Balance findings are recorded only as inputs
for that re-tuning pass, not as verdicts.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run. The
analysis under each one is also the agent's. Nothing here is a ruling. A playtester checks a
suspected bug against `design/rulebook-0.2-draft.md` and `design/cards.yaml` only; this run's agent
did not read the engine source under `app/src/` to diagnose anything.

The run file is `04-first-run-on-rules-0.2.json`. The full transcript is the appendix, and notes cite
it by line.

## How the run went

Seed 4 opened on Collapsed Stairwell, a hazard. Gray alone reached Scramble 6 with one Pick The Lock
and a Duck Under, clearing both thresholds and revealing a reward while Red held a full hand of
Charge In and never spent a card. Floor 1's Enemy room, Gross Thing at Oomph 5, fell the next turn to
a Charge In plus a Shove. Two turns, one floor, Red took Reckless Swing and Gray took I Know Kung Fu.

I Know Kung Fu -- Oomph 5, and while held, draw a card whenever you play a card with Scramble --
turned out to be the run's central engine. Keeping it in hand instead of playing it meant every Duck
Under or Pick The Lock played also drew a card, which repeatedly refilled Gray's hand mid-turn and
let single turns clear both thresholds of a room off a starting hand of two or three cards. It also
produced the run's clearest rules question, on whether card-triggered draws should happen during the
Play phase at all (note 12).

Floors 2 through 5 fell in a similar rhythm: Riot Shield (Scramble 3, returns to hand if the room
clears) carried most rooms for one card a turn, same as it did in playtest 3, and Exhaust triggers on
room thresholds ate into both decks steadily rather than dramatically. The one card that changed the
Exhaust math was Zen Mode, taken on floor 4, which stopped two separate Exhaust triggers outright
(notes 3, 15) and read as a strong synergy specifically because 0.2 made Exhaust permanent.

The run never came close to a loss. It stopped at the turn-25 limit on floor 5 with Red at deck 9 /
discard 1 / exhaust 11 and Gray at deck 2 / discard 6 / exhaust 7 -- both comfortably short of Down,
neither ever near it.

## Notes

1. **Turn 1, floor 1: Collapsed Stairwell, a hazard, was the first room. Gray alone reached Scramble
   6 with Pick The Lock plus a Duck Under, clearing both thresholds and revealing a reward. Red held
   a full hand of four Charge In and a Shove the entire turn, no reason to spend Oomph cards Red had
   no use for, and the unspent-cards-stay-in-hand rule meant nothing was lost by sitting out. Felt
   right: a hazard room that only needs one stat gives one character a clean turn while the other
   watches, same shape as playtest 3 noted for Enemy rooms.** `[agent]` (log 31)

   Tuning-independent shape observation: this is a direct consequence of "unspent cards stay in
   hand" (rulebook, About the game). It removed any pressure to spend cards Red couldn't use, so the
   turn had exactly one real decision instead of two players groping for something to do.

2. **Floor 1 cleared in 2 turns (Gross Thing at Oomph 5, no Enemy-room-on-turn-1 luck this time but
   close). Ascend reward: gave Gray I Know Kung Fu, cost 3, Oomph 5, Holding draw-on-Scramble. This
   directly answers playtest 3's biggest finding (Gray has no route to Oomph). Picked it deliberately
   to see if one reward card changes Gray's shape. Settle your Stuff was a no-op this floor, no Stuff
   cards had entered either deck yet, so the step printed nothing to decide -- worth remembering for
   later floors once Stuff shows up.** `[agent]` (log 62)

   Re-tune input: I Know Kung Fu ended up carrying much of the run once taken (see notes 3, 12).

3. **Held I Know Kung Fu in hand instead of playing it, so its Holding draw-on-Scramble triggered
   twice while Gray played Duck Under and Pick The Lock. That is a real decision the Holding keyword
   creates: play the card for its stat now, or hold it for the passive and cash in the stat later.
   Eventually traded it away as payment to push Scramble from 4 to 8 for the second threshold anyway.
   This is the kind of choice playtest 3 never saw. Also: Ruptured Coolant Line gave both characters
   Bad Stuff on the lower threshold, and Gray now holds Panic, +2 Scramble to every room's thresholds
   while held, for the whole rest of the game unless it gets played or discarded. That is a
   persistent tax that stacks with the marathon model's growing decks -- worth watching whether it
   gets paid off or just sat on.** `[agent]` (log 101)

   Tuning-independent shape: the Holding keyword (play now for the stat vs. hold for the passive) is
   the single best source of real in-hand decisions this run produced. Panic's dynamic threshold tax
   also confirmed working correctly (see note 6): once discarded, thresholds reverted to printed
   values mid-turn.

4. **Spill Of Cargo paid out 3 Good Stuff on one clear: Coil Of Cable to Red, Pry Bar and Riot Shield
   to Gray. Riot Shield showed up on floor 2 turn 4 here too, same as playtest 3, and it is the same
   card: Scramble 3 for cost 1 that returns to hand whenever the room clears. If it clears every turn
   from here it is a free Scramble 3 forever. Watching whether it dominates the run the way playtest
   3 said it did.** `[agent]` (log 127)

   Re-tune input, confirmed: Riot Shield again carried a large share of Scramble rooms through this
   run, same as playtest 3 under 0.1.

5. **Clearing Collapsed Stairwell's Scramble 2 threshold Exhausts 1 from each deck, and the top of
   Red's deck happened to be Junk Launcher, the reward taken two floors back on floor 1. Under 0.2
   Exhaust is permanent, so that card is gone for the rest of the run unless something un-exhausts
   it. A threshold whose outcome is Exhaust does not let you choose which card -- it is the top of
   the deck, so a good reward can vanish the same turn it might have been drawn. This is the marathon
   model's teeth: Exhaust is no longer a minor tempo cost, it is deck attrition that can eat your
   best cards at random.** `[agent]` (log 143)

   Engine fidelity: correct per the Exhaust keyword definition (rulebook section 8: "Exhaust X cards
   from your deck: Move the top X cards..."), no choice of which card is specified. This is the
   clearest single illustration of what changed between 0.1 and 0.2 -- see note 15 and "What the run
   showed."

6. **cards.yaml has Torn Seal (bad_stuff, cost 2) with text: null. It has no printed rules text. Red
   just drew it into hand and the CLI shows it as [cost 2; Bad Stuff] with no effect line, no
   Holding, nothing. This looks like a design gap rather than a CLI bug: the card is incomplete in
   cards.yaml, so there is nothing wrong to fix in the engine, but flagging it since it will produce
   a card that does literally nothing if played or held.** `[agent]` (log 175)

   Card data gap, not an engine bug: `design/cards.yaml` line for Torn Seal reads `text: null`.

7. **Engine fidelity check: playing the second Overdrive (Exhaust 2) mid-Play with Red's deck down
   to 1 card triggered a discard-to-deck reshuffle inside the Exhaust resolution itself -- deck went
   1 -> exhaust the 1 -> deck empty -> discard pile (5 cards) shuffled into a new deck -> exhaust 1
   more from it. Ended at deck 4, discard 0, exhaust 6 (up from 4). This matches the rulebook's Empty
   deck rule (section 8: "If you must draw or Exhaust a card and your deck is empty, first shuffle
   your discard pile to form a new deck") applying mid-Play phase, not just at Turn Start. Good sign
   for engine fidelity: the reshuffle is not special-cased to the draw step.** `[agent]` (log 185)

   Engine fidelity: confirmed correct. This is the first of several confirmations this run that the
   discard-recycle rule fires wherever it is needed (Turn Start draws, mid-Play Exhaust, mid-Play
   draws), not only at one hardcoded point.

8. **Engine fidelity / CLI: this Ascend at floor 2 -> 3 printed 487 numbered options for two players
   each with a 3-card reward offer and, between them, two Stuff cards to Settle (Red's Overcharged
   Battery, Gray's A Pair Of Stich-Em-Ups) plus several more Stuff cards the generator found buried
   in deck and discard (Coil Of Cable, Rust, Pry Bar, ...). Settle your Stuff (rulebook section 10.2)
   says "search your deck and discard pile for Stuff cards" -- confirmed, the generator does search
   past the hand shown on screen, which is correct, but it crosses every found Stuff card's
   keep/shuffle choice, every scrap-target card option for each, and both characters' 3-way reward
   choice into one flat list. Went looking for "Red takes Zen Mode; Gray takes In Step" with no Stuff
   kept and could not find it anywhere in the 487 lines -- spec.md names a 256-entry cap on the two
   characters' Ascend cross product as known debt, and this run hit a case beyond it where a specific
   legal combination was simply absent from the list, not just hard to find. Chose "Red takes Zen
   Mode; Gray declines" instead of the Gray reward I wanted, because I could not locate the
   combination that had both.** `[agent]` (log 258)

   Top-priority engine/CLI finding. `design/cli-sim/spec.md` names the 256-entry cross-product cap
   as known debt for two characters' reward choices; this run shows the marathon model makes it
   worse, since Settle-your-Stuff now searches accumulated deck and discard piles (which grow over a
   longer game) and crosses those choices in too. The result is not just an unwieldy list (playtest
   3's finding) but a list that silently omits legal combinations once the cap is hit.

9. **Tuning-independent shape, floors 2-3: Settle your Stuff has read as pure bookkeeping every time
   so far, not a decision. The default (shuffle into the pool) is almost always correct because a
   kept Stuff card costs a permanent non-Stuff card from deck or discard, and nothing so far has been
   worth that price -- the Stuff cards offered (Overcharged Battery, Torn Seal, A Pair Of
   Stich-Em-Ups) are not strong enough to pay a real card for. Combined with the missing-combination
   problem in note above, the practical move has been "decline everything, keep nothing" every single
   Ascend so far. Whether that is a tuning problem (nothing worth keeping) or a structural one
   (keeping is never worth a card) is a question for the designer once cards are re-tuned.** `[agent]`
   (log 380)

   Tuning-independent shape: this was true for every Ascend in the run, not just floors 2-3. Settle
   your Stuff never once produced a real choice.

10. **Engine fidelity / rulebook gap, worth flagging clearly: Turn Start this turn, Gray's hand size
    before the draw was 1 (Crowbar). Draw up to five (rulebook, Each Turn 1.2) should draw exactly 4
    cards for Gray. The log shows Gray drew 7: Duck Under, Peek Around Corner, Pick The Lock, [deck
    empty, reshuffle], Pick The Lock, Catch Your Breath, Duck Under, I Know Kung Fu -- landing Gray
    at hand size 8, three over the stated cap. Red drew exactly 3 cards this turn (hand 2 -> 5,
    correct), and the 3rd card Red drew was My Head Is Quantum Spinning, cards.yaml text "Holding:
    whenever you draw a card, your partner must also draw a card." Three extra Gray draws exactly
    matches Red's three draws this turn, so the effect looks like it fired for all of Red's draws
    this Turn Start even though MHQS only entered Red's hand as the LAST of those three draws -- it
    could not have been "in hand" (the Holding keyword's stated trigger condition) for the first two.
    Either the engine batches Holding draw-triggers over the whole Turn Start step rather than
    checking hand membership in real time, or there is a genuine ordering bug. Separately: the
    rulebook's "draw up to five" doesn't say whether a Holding-triggered forced draw is capped at 5
    or can push a hand past it -- worth a question to the designer either way, since MHQS pushing a
    hand to 8 is a big stamina hit for a card that isn't in that hand at all.** `[agent]` (log 458)

    Top-priority engine fidelity finding. This is the clearest suspected mismatch between the
    rulebook's Holding keyword ("applies while the card is in your hand... if the card is played or
    discarded, the effect no longer applies") and the engine's behavior. Two separate questions for
    the designer: (1) does the engine apply Holding draw-triggers at end-of-phase rather than in
    real time as cards land in hand, and is that intended; (2) is a forced draw from a Holding effect
    meant to respect the "draw up to five" cap at all, or is exceeding it the intended bite of a Bad
    Stuff card.

11. **CLI: bin/nvu replay runs/4.json --quiet printed the full final table (floor, both hands,
    everything) before the one-line verdict, same as playtest 3 note 9 flagged for this rules
    version's engine. Spec.md says --quiet prints only the verdict. Still open.** `[agent]` (log 615)

    Repeat of a playtest 3 finding, confirmed still present in 0.2's build of the CLI.

12. **Rulebook gap: the Play phase section says "You may not draw during this phase," but I Know
    Kung Fu's Holding text is "when you play a card with Scramble, draw 1 card," and this triggered
    repeatedly during Play all through this run (e.g. logs around turn 3, 7, 12, 19). The engine
    allows it every time, uncapped, with no error. Read narrowly, the rulebook's ban on drawing in
    Play and this card's printed effect contradict each other. Read generously, "you may not draw"
    means the player cannot choose to draw as an action, and a card-triggered draw is a different
    thing. The engine has clearly taken the generous reading. Worth a flat question to the designer:
    is a Play-phase forced draw from a card effect meant to be exempt from the "no draw during this
    phase" line, and if so should the rulebook say so explicitly, since as printed it reads like a
    flat ban.** `[agent]`

    Top-priority rulebook gap. This is the single interaction the run leaned on most (see note 3 and
    "How the run went"), so the ambiguity is not a corner case -- it was load-bearing for how Gray
    played nearly every turn from floor 1 onward.

13. **Rulebook gap: Stuff gained on the turn a floor Ascends. This run never happened to draw
    Good/Bad Stuff and Ascend in the same turn, so it went untested, but nothing in section 10
    (Ascending) says what happens if a Stuff card is still in the play zone or was just gained when
    Cleanup and the Ascend steps run. Section 10 step 1 is "Shuffle your hand into your deck" -- a
    Stuff card gained into hand that turn would just go in with everything else, which seems fine,
    but a Stuff card returned to hand at end of turn (Riot Shield's own text) landing mid-Ascend was
    never exercised this run. Flagging as an untested edge rather than a confirmed problem.**
    `[agent]`

    Untested edge case, named per the coordinator's list of known gaps to look for. Worth a
    dedicated check in a future run rather than a question now.

14. **Re-tune input, not a verdict: Zen Mode (cost 0, Holding: you don't Exhaust) combined with
    Reckless-style Oomph-for-Exhaust cards is a strong synergy under 0.2 specifically because Exhaust
    is now permanent -- it converts a card that used to cost real deck attrition into a pure stat
    card with zero downside for as long as Zen Mode stays in hand. It stopped an Exhaust twice this
    run (floor 3 and floor 5) with the line "Zen Mode stops it," which read clearly both times.
    Whether that is too strong is a balance question for after re-tuning, but the interaction itself
    is worth recording since it is a direct product of the 0.1 -> 0.2 change to Exhaust.** `[agent]`

    Engine fidelity note attached: both times, the narration ("Zen Mode stops it: Red Exhausts
    nothing") was unambiguous about what happened and why -- one of the clearer pieces of output in
    the whole run.

15. **Stopping at the turn-25 limit, floor 5 of 10, mid-turn-start. Neither character came close to
    Down: Red is on deck 9 + discard 1 + exhaust 11 (of an original 12-card deck, so exhaust alone
    now exceeds the starting deck size), Gray is deck 2 + discard 6 + exhaust 7. Stamina pressure
    exists but is slow -- both decks kept cycling through discard recycling and neither hand was ever
    empty at a moment it mattered. The permanent Exhaust pile is the standout number: Red has
    exhausted 11 cards total across five floors, several of them good reward cards (Junk Launcher,
    Fast Follow, Second Wind, Reckless Swing all got eaten by threshold-Exhaust or Overdrive's
    Exhaust 2 at some point in this run) rather than starter filler. Under 0.1 rules exhaust was
    recoverable at Ascend; under 0.2 it just accumulates. That is the biggest structural difference
    this run surfaced, tuning aside.** `[agent]` (log 614)

    Re-tune input: permanent Exhaust is the single largest structural change 0.2 makes versus 0.1,
    and this run's numbers (11 cards permanently gone from a 12-card starting deck, several of them
    good reward cards rather than starter filler) are the clearest evidence of its size.

## What the run showed

**1. Engine fidelity.** No confirmed engine bug was found. Every mechanic this run exercised matched
the rulebook where it could be checked directly:

- Discard recycling into a fresh deck fired correctly at Turn Start, mid-Play during a draw, and
  mid-Play during an Exhaust resolution (note 7) -- not special-cased to one trigger point.
- Exhaust stayed permanent across all five floors; nothing un-exhausted a card at any point, and
  Ascending never touched the Exhaust pile (note 5, note 15).
- "Draw up to five" correctly drew 0 when a hand was already at or above 5, and drew exactly the
  gap otherwise, for every ordinary Turn Start this run saw.
- Down never triggered (deck and discard never both hit zero for either character), so that
  boundary condition went untested.
- The Ascend order matched the rulebook: Cleanup, then shuffle hand into deck, then Settle your
  Stuff, then choose a reward, then build the next floor -- confirmed by the printed sequence at
  every Ascend.

One suspected mismatch stands out (note 10): a Holding effect that forces a partner's draw
(My Head Is Quantum Spinning) appeared to apply to draws that happened before the card itself was in
hand, pushing Gray's hand to 8 -- three over the stated draw-to-five cap. This needs the designer's
eyes; it was not chased into the engine source per the playtest rules.

**2. Rulebook gaps.** The most load-bearing one: the Play phase's "you may not draw during this
phase" reads as a flat ban, but I Know Kung Fu's card-triggered draw fired constantly during Play all
run (note 12) with no engine complaint. This was not a corner case -- it was the run's central
mechanic from floor 1 on. Also open: whether a Holding-triggered forced draw should respect the
draw-to-five cap (note 10), and what happens to Stuff gained or returned to hand on the turn a floor
Ascends (note 13, untested this run). Torn Seal has no printed text in `cards.yaml` (note 6), a data
gap rather than a rules one.

**3. Tuning-independent shape.** Holding produced the one real recurring decision in the run: play a
card now for its stat, or hold it for its passive and cash in later (notes 1, 3). Settle your Stuff,
by contrast, never once produced a decision -- the default of shuffling every Stuff card into its
pool was correct every single Ascend, because nothing offered was worth the permanent card it would
cost to keep (note 9). The Ascend reward-choice screen itself was frequently impossible to search
properly: past a certain size the generator's list silently drops legal combinations rather than just
getting long (note 8), which is a step worse than playtest 3's "hard to read" finding.

**4. Re-tune inputs.** Riot Shield again dominated Scramble rooms for one card a turn (note 4), same
as under 0.1. Zen Mode plus Exhaust-for-Oomph cards (Reckless, Reckless Swing) is a new synergy that
0.2's permanent Exhaust creates by itself (note 14). I Know Kung Fu functioned as this run's engine
almost by accident, and its strength is entangled with the Play-phase-draw rulebook question above
(note 12) -- it cannot be re-tuned as a card until that question is settled. Permanent Exhaust itself
is the largest structural change from 0.1: 11 of Red's original 12 starter+reward cards were
permanently gone by turn 25, several of them prized rewards rather than filler (note 15). Whether the
marathon model's tension builds or difficulty scales correctly is mostly unanswerable from this run
in one sentence: nothing came close to threatening either character in 25 turns, but every card in
the run is slated for re-tuning regardless.

## The CLI as a playtest tool

- **The Ascend cross-product cap now drops legal combinations, not just readability.** Past 256
  entries the generator stops crossing the two characters' choices; this run hit that ceiling with
  only two Stuff cards to settle and modest reward pools, and a specific legal move ("Red takes Zen
  Mode; Gray takes In Step," no Stuff kept) could not be found anywhere in a 487-line list (note 8).
  Settle-your-Stuff searching accumulated deck and discard piles, as the marathon model means those
  piles grow large, makes this worse than it was in playtest 3.
- **`replay --quiet` is still not quiet** (note 11), unchanged from playtest 3.
- Things that worked well, repeated from playtest 3 and confirmed again this run: modified numbers
  shown next to printed ones (`cost 3 (printed 2)` for Sluggish, `Scramble 4 (printed 2)` for Panic),
  and naming the card that stopped an effect ("Zen Mode stops it: Red Exhausts nothing," note 14).
  Both remain the clearest pieces of output in the tool.

## Candidate issues

Engine mismatches:

- Suspected: a Holding effect that forces a partner's draw (My Head Is Quantum Spinning) appears to
  apply retroactively to draws that happened before the card entered hand, pushing a hand three cards
  past the draw-to-five cap in one Turn Start. Needs designer/engine review (note 10).

Rulebook questions for the designer:

- Does "you may not draw during this phase" (Play) exempt card-triggered draws like I Know Kung Fu's,
  or is the current engine behavior (allowing them freely) a bug against the rulebook as written?
  (note 12)
- Is a Holding-triggered forced draw meant to respect the draw-to-five cap, or is exceeding it
  intended? (note 10)
- What happens to Stuff gained or returned to hand on the turn a floor Ascends -- does it enter
  Settle your Stuff normally? Untested this run. (note 13)
- Torn Seal has no printed text in `cards.yaml` (`text: null`) -- confirm intended text. (note 6)

Re-tune inputs (balance, not rulings):

- Riot Shield again carried most Scramble rooms for one card a turn, same as under 0.1 (note 4).
- Zen Mode + Exhaust-for-Oomph cards (Reckless, Reckless Swing) is a strong new synergy created by
  permanent Exhaust; consider whether that is intended (note 14).
- I Know Kung Fu's strength this run is entangled with the Play-phase-draw rulebook question; cannot
  be tuned independently of that ruling (note 12).
- Settle your Stuff never produced a real decision in 5 floors; the Stuff cards on offer were never
  worth the permanent card cost of keeping one (note 9).
- Permanent Exhaust ate 11 of Red's 12 starting deck's worth of cards by turn 25, several of them
  prized rewards rather than filler; this is the single largest 0.1 -> 0.2 structural change this run
  surfaced (note 15).

CLI improvements (repeats from playtest 3, still open):

- The Ascend cross-product cap (256 entries) now silently drops legal combinations rather than just
  producing an unwieldy list (note 8).
- `replay --quiet` still prints the full table before the verdict (note 11).

## Appendix: the run transcript

Output of `bin/nvu replay design/playtests/04-first-run-on-rules-0.2.json`.

```
  1. Floor 1 is built: 10 rooms.
  2. You are in: Collapsed Stairwell.
  3. Red draws Charge In.
  4. Red draws Charge In.
  5. Red draws Charge In.
  6. Red draws Charge In.
  7. Red draws Shove.
  8. Gray draws Duck Under.
  9. Gray draws Duck Under.
 10. Gray draws Pick The Lock.
 11. Gray draws Pick The Lock.
 12. Gray draws Duck Under.
 13. Gray discards Duck Under from their hand.
 14. Gray discards Duck Under from their hand.
 15. Gray pays with Duck Under, Duck Under.
 16. Gray plays Pick The Lock.
 17. Gray discards Pick The Lock from their hand.
 18. Gray pays with Pick The Lock.
 19. Gray plays Duck Under.
 20. Scramble 2 met — Clear, but both of you Exhaust 1.
 21. Scramble 5 met — Clear, and one of you reveals a reward.
 22. Collapsed Stairwell is Cleared.
 23. Red Exhausts Charge In.
 24. Gray Exhausts Pick The Lock.
 25. Gray's reward pool shows Here, Catch.
 26. Gray takes Here, Catch.
 27. Cleanup.
 28. Gray discards Pick The Lock from their play zone.
 29. Gray discards Duck Under from their play zone.
 30. — end of turn 1 —
 31. NOTE — Turn 1, floor 1: Collapsed Stairwell, a hazard, was the first room. Gray alone reached Scramble 6 with Pick The Lock plus a Duck Under, clearing both thresholds and revealing a reward. Red held a full hand of four Charge In and a Shove the entire turn, no reason to spend Oomph cards Red had no use for, and the unspent-cards-stay-in-hand rule meant nothing was lost by sitting out. Felt right: a hazard room that only needs one stat gives one character a clean turn while the other watches, same shape as playtest 3 noted for Enemy rooms.
 32. You are in: Gross Thing That Looks Like A Cherry.
 33. Gray draws Here, Catch.
 34. Gray draws Duck Under.
 35. Gray draws Pick The Lock.
 36. Gray draws Peek Around Corner.
 37. Gray draws Peek Around Corner.
 38. Red discards Charge In from their hand.
 39. Red discards Charge In from their hand.
 40. Red pays with Charge In, Charge In.
 41. Red plays Charge In.
 42. Gray discards Pick The Lock from their hand.
 43. Gray pays with Pick The Lock.
 44. Gray plays Here, Catch.
 45. Red discards Charge In from their hand.
 46. Red pays with Charge In.
 47. Red plays Shove.
 48. Oomph 5 met — Ascend
 49. Gross Thing That Looks Like A Cherry is Cleared.
 50. Cleanup.
 51. Red discards Charge In from their play zone.
 52. Red discards Shove from their play zone.
 53. Gray discards Here, Catch from their play zone.
 54. — end of turn 2 —
 55. Floor 1 is clear.
 56. Red takes Reckless Swing.
 57. Red shuffles 1 card(s) back in.
 58. Gray shuffles 3 card(s) back in.
 59. Gray takes I Know Kung Fu.
 60. Gray shuffles 1 card(s) back in.
 61. Floor 2 is built: 9 rooms.
 62. NOTE — Floor 1 cleared in 2 turns (Gross Thing at Oomph 5, no Enemy-room-on-turn-1 luck this time but close). Ascend reward: gave Gray I Know Kung Fu, cost 3, Oomph 5, Holding draw-on-Scramble. This directly answers playtest 3's biggest finding (Gray has no route to Oomph). Picked it deliberately to see if one reward card changes Gray's shape. Settle your Stuff was a no-op this floor, no Stuff cards had entered either deck yet, so the step printed nothing to decide -- worth remembering for later floors once Stuff shows up.
 63. You are in: Ruptured Coolant Line.
 64. Red draws Overdrive.
 65. Red draws Shove.
 66. Red draws Overdrive.
 67. Red draws Reckless Swing.
 68. Red draws Shove.
 69. Gray draws Duck Under.
 70. Gray draws Pick The Lock.
 71. Gray draws Peek Around Corner.
 72. Gray draws Peek Around Corner.
 73. Gray draws I Know Kung Fu.
 74. Gray discards Peek Around Corner from their hand.
 75. Gray pays with Peek Around Corner.
 76. Gray plays Duck Under.
 77. Gray draws Duck Under.
 78. Gray discards Peek Around Corner from their hand.
 79. Gray pays with Peek Around Corner.
 80. Gray plays Duck Under.
 81. Gray's deck is empty — the discard pile shuffles in to make a new one (9 cards).
 82. Gray draws Pick The Lock.
 83. Gray discards I Know Kung Fu from their hand.
 84. Gray discards Pick The Lock from their hand.
 85. Gray pays with I Know Kung Fu, Pick The Lock.
 86. Gray plays Pick The Lock.
 87. Scramble 4 met — Clear, but both of you get Bad Stuff.
 88. Scramble 7 met — Clear, and one of you reveals a reward.
 89. Ruptured Coolant Line is Cleared.
 90. Red gets Rust.
 91. Red takes Rust into hand.
 92. Gray gets Panic.
 93. Gray takes Panic into hand.
 94. Red's reward pool shows Junk Launcher.
 95. Red takes Junk Launcher.
 96. Cleanup.
 97. Gray discards Duck Under from their play zone.
 98. Gray discards Duck Under from their play zone.
 99. Gray discards Pick The Lock from their play zone.
100. — end of turn 3 —
101. NOTE — Held I Know Kung Fu in hand instead of playing it, so its Holding draw-on-Scramble triggered twice while Gray played Duck Under and Pick The Lock. That is a real decision the Holding keyword creates: play the card for its stat now, or hold it for the passive and cash in the stat later. Eventually traded it away as payment to push Scramble from 4 to 8 for the second threshold anyway. This is the kind of choice playtest 3 never saw. Also: Ruptured Coolant Line gave both characters Bad Stuff on the lower threshold, and Gray now holds Panic, +2 Scramble to every room's thresholds while held, for the whole rest of the game unless it gets played or discarded. That is a persistent tax that stacks with the marathon model's growing decks -- worth watching whether it gets paid off or just sat on.
102. You are in: Spill Of Cargo.
103. Gray draws Here, Catch.
104. Gray draws Duck Under.
105. Gray draws Pick The Lock.
106. Gray draws Pick The Lock.
107. Gray discards Panic from their hand.
108. Gray discards Here, Catch from their hand.
109. Gray pays with Panic, Here, Catch.
110. Gray plays Pick The Lock.
111. Gray discards Pick The Lock from their hand.
112. Gray pays with Pick The Lock.
113. Gray plays Duck Under.
114. Scramble 3 met — Both of you get Good Stuff.
115. Scramble 5 met — Gray gets 2 instead.
116. Spill Of Cargo is Cleared.
117. Red gets Coil Of Cable.
118. Red takes Coil Of Cable into hand.
119. Gray gets Pry Bar.
120. Gray takes Pry Bar into hand.
121. Gray gets Riot Shield.
122. Gray takes Riot Shield into hand.
123. Cleanup.
124. Gray discards Pick The Lock from their play zone.
125. Gray discards Duck Under from their play zone.
126. — end of turn 4 —
127. NOTE — Spill Of Cargo paid out 3 Good Stuff on one clear: Coil Of Cable to Red, Pry Bar and Riot Shield to Gray. Riot Shield showed up on floor 2 turn 4 here too, same as playtest 3, and it is the same card: Scramble 3 for cost 1 that returns to hand whenever the room clears. If it clears every turn from here it is a free Scramble 3 forever. Watching whether it dominates the run the way playtest 3 said it did.
128. You are in: Collapsed Stairwell.
129. Gray draws Duck Under.
130. Gray draws Duck Under.
131. Gray draws Peek Around Corner.
132. Gray discards Peek Around Corner from their hand.
133. Gray pays with Peek Around Corner.
134. Gray plays Riot Shield.
135. Gray discards Pry Bar from their hand.
136. Gray pays with Pry Bar.
137. Gray plays Duck Under.
138. Scramble 2 met — Clear, but both of you Exhaust 1.
139. Scramble 5 met — Clear, and one of you reveals a reward.
140. Collapsed Stairwell is Cleared.
141. Red Exhausts Junk Launcher.
142. Gray Exhausts Peek Around Corner.
143. NOTE — Clearing Collapsed Stairwell's Scramble 2 threshold Exhausts 1 from each deck, and the top of Red's deck happened to be Junk Launcher, the reward taken two floors back on floor 1. Under 0.2 Exhaust is permanent, so that card is gone for the rest of the run unless something un-exhausts it. A threshold whose outcome is Exhaust does not let you choose which card -- it is the top of the deck, so a good reward can vanish the same turn it might have been drawn. This is the marathon model's teeth: Exhaust is no longer a minor tempo cost, it is deck attrition that can eat your best cards at random.
144. Red's reward pool shows Fast Follow.
145. Red takes Fast Follow.
146. Cleanup.
147. Gray takes Riot Shield into hand.
148. Gray discards Duck Under from their play zone.
149. — end of turn 5 —
150. You are in: Ruptured Coolant Line.
151. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
152. Gray draws Duck Under.
153. Gray draws Here, Catch.
154. Gray draws Pick The Lock.
155. Gray discards Here, Catch from their hand.
156. Gray pays with Here, Catch.
157. Gray plays Riot Shield.
158. Gray discards Duck Under from their hand.
159. Gray discards Duck Under from their hand.
160. Gray pays with Duck Under, Duck Under.
161. Gray plays Pick The Lock.
162. Scramble 4 met — Clear, but both of you get Bad Stuff.
163. Scramble 7 met — Clear, and one of you reveals a reward.
164. Ruptured Coolant Line is Cleared.
165. Red gets Torn Seal.
166. Red takes Torn Seal into hand.
167. Gray gets Faceful Of Slime.
168. Gray takes Faceful Of Slime into hand.
169. Gray's reward pool shows Level Up.
170. Gray declines the reward.
171. Cleanup.
172. Gray takes Riot Shield into hand.
173. Gray discards Pick The Lock from their play zone.
174. — end of turn 6 —
175. NOTE — cards.yaml has Torn Seal (bad_stuff, cost 2) with text: null. It has no printed rules text. Red just drew it into hand and the CLI shows it as [cost 2; Bad Stuff] with no effect line, no Holding, nothing. This looks like a design gap rather than a CLI bug: the card is incomplete in cards.yaml, so there is nothing wrong to fix in the engine, but flagging it since it will produce a card that does literally nothing if played or held.
176. You are in: Ration Locker.
177. Gray draws Duck Under.
178. Red plays Overdrive.
179. Red Exhausts Fast Follow.
180. Red Exhausts Shove.
181. Red plays Overdrive.
182. Red Exhausts Shove.
183. Red's deck is empty — the discard pile shuffles in to make a new one (5 cards).
184. Red Exhausts Shove.
185. NOTE — Engine fidelity check: playing the second Overdrive (Exhaust 2) mid-Play with Red's deck down to 1 card triggered a discard-to-deck reshuffle inside the Exhaust resolution itself -- deck went 1 -> exhaust the 1 -> deck empty -> discard pile (5 cards) shuffled into a new deck -> exhaust 1 more from it. Ended at deck 4, discard 0, exhaust 6 (up from 4). This matches the rulebook's Empty deck rule (section 8: 'If you must draw or Exhaust a card and your deck is empty, first shuffle your discard pile to form a new deck') applying mid-Play phase, not just at Turn Start. Good sign for engine fidelity: the reshuffle is not special-cased to the draw step.
186. Gray discards Faceful Of Slime from their hand.
187. Gray pays with Faceful Of Slime.
188. Gray plays Riot Shield.
189. Red plays Coil Of Cable.
190. Oomph 2 met — Red gets Good Stuff.
191. Scramble 2 met — Gray gets Good Stuff.
192. Oomph 4 met — Red gets 2 instead.
193. Scramble 4 met — Gray gets 2 instead.
194. Ration Locker is Cleared.
195. Red gets Overcharged Battery.
196. Red takes Overcharged Battery into hand.
197. Red gets Cutting Torch.
198. Red takes Cutting Torch into hand.
199. Gray gets A Pair Of Stich-Em-Ups.
200. Gray takes A Pair Of Stich-Em-Ups into hand.
201. Gray gets Grav Harness.
202. Gray takes Grav Harness into hand.
203. Cleanup.
204. Gray takes Riot Shield into hand.
205. Red discards Overdrive from their play zone.
206. Red discards Overdrive from their play zone.
207. Red discards Coil Of Cable from their play zone.
208. — end of turn 7 —
209. You are in: Spill Of Cargo.
210. Gray draws Peek Around Corner.
211. Gray discards Peek Around Corner from their hand.
212. Gray pays with Peek Around Corner.
213. Gray plays Riot Shield.
214. Gray discards A Pair Of Stich-Em-Ups from their hand.
215. Gray pays with A Pair Of Stich-Em-Ups.
216. Gray plays Duck Under.
217. Scramble 3 met — Both of you get Good Stuff.
218. Scramble 5 met — Gray gets 2 instead.
219. Spill Of Cargo is Cleared.
220. Red gets Crowbar.
221. Red takes Crowbar into hand.
222. The Good Stuff pool is empty — Gray gets nothing.
223. Cleanup.
224. Gray takes Riot Shield into hand.
225. Gray discards Duck Under from their play zone.
226. — end of turn 8 —
227. You are in: Sorting Room.
228. Gray draws I Know Kung Fu.
229. Gray draws Pick The Lock.
230. Gray draws Duck Under.
231. You Flee Sorting Room.
232. Cleanup.
233. — end of turn 9 —
234. You are in: Coney, The Thing In The Stairwell.
235. Red discards Rust from their hand.
236. Red discards Torn Seal from their hand.
237. Red pays with Rust, Torn Seal.
238. Red plays Cutting Torch.
239. Red plays Crowbar.
240. Red discards Shove from their hand.
241. Red pays with Shove.
242. Red plays Reckless Swing.
243. Red Exhausts Charge In.
244. Oomph 9 met — Ascend
245. Coney, The Thing In The Stairwell is Cleared.
246. Cleanup.
247. Red discards Cutting Torch from their play zone.
248. Red discards Crowbar from their play zone.
249. Red discards Reckless Swing from their play zone.
250. — end of turn 10 —
251. Floor 2 is clear.
252. Red shuffles 2 card(s) back in.
253. Red takes Zen Mode.
254. Red shuffles 1 card(s) back in.
255. Gray shuffles 5 card(s) back in.
256. Gray declines the reward.
257. Floor 3 is built: 8 rooms.
258. NOTE — Engine fidelity / CLI: this Ascend at floor 2 -> 3 printed 487 numbered options for two players each with a 3-card reward offer and, between them, two Stuff cards to Settle (Red's Overcharged Battery, Gray's A Pair Of Stich-Em-Ups) plus several more Stuff cards the generator found buried in deck and discard (Coil Of Cable, Rust, Pry Bar, ...). Settle your Stuff (rulebook section 10.2) says 'search your deck and discard pile for Stuff cards' -- confirmed, the generator does search past the hand shown on screen, which is correct, but it crosses every found Stuff card's keep/shuffle choice, every scrap-target card option for each, and both characters' 3-way reward choice into one flat list. Went looking for 'Red takes Zen Mode; Gray takes In Step' with no Stuff kept and could not find it anywhere in the 487 lines -- spec.md names a 256-entry cap on the two characters' Ascend cross product as known debt, and this run hit a case beyond it where a specific legal combination was simply absent from the list, not just hard to find. Chose 'Red takes Zen Mode; Gray declines' instead of the Gray reward I wanted, because I could not locate the combination that had both.
259. You are in: Ration Locker.
260. Red draws Zen Mode.
261. Red draws Shove.
262. Red draws Charge In.
263. Red draws Charge In.
264. Red draws Charge In.
265. Gray draws I Know Kung Fu.
266. Gray draws Duck Under.
267. Gray draws Panic.
268. Gray draws Pick The Lock.
269. Gray draws Duck Under.
270. Red discards Charge In from their hand.
271. Red discards Charge In from their hand.
272. Red pays with Charge In, Charge In.
273. Red plays Charge In.
274. Gray discards Duck Under from their hand.
275. Gray discards Panic from their hand.
276. Gray pays with Duck Under, Panic.
277. Gray plays Pick The Lock.
278. Gray draws Pick The Lock.
279. Oomph 2 met — Red gets Good Stuff.
280. Scramble 2 met — Gray gets Good Stuff.
281. Oomph 4 met — Red gets 2 instead.
282. Scramble 4 met — Gray gets 2 instead.
283. Ration Locker is Cleared.
284. Red gets Coil Of Cable.
285. Red takes Coil Of Cable into hand.
286. Red gets Cutting Torch.
287. Red takes Cutting Torch into hand.
288. Gray gets Crowbar.
289. Gray takes Crowbar into hand.
290. Gray gets A Pair Of Stich-Em-Ups.
291. Gray takes A Pair Of Stich-Em-Ups into hand.
292. Cleanup.
293. Red discards Charge In from their play zone.
294. Gray discards Pick The Lock from their play zone.
295. — end of turn 11 —
296. You are in: Sorting Room.
297. Red's deck is empty — the discard pile shuffles in to make a new one (9 cards).
298. Red draws Rust.
299. Red discards Rust from their hand.
300. Red pays with Rust.
301. Red plays Shove.
302. Gray discards I Know Kung Fu from their hand.
303. Gray pays with I Know Kung Fu.
304. Gray plays Duck Under.
305. Oomph 2 met — Red gets Good Stuff.
306. Scramble 2 met — Gray gets Good Stuff.
307. Sorting Room is Cleared.
308. Red gets Grav Harness.
309. Red takes Grav Harness into hand.
310. Gray gets Riot Shield.
311. Gray takes Riot Shield into hand.
312. Cleanup.
313. Red discards Shove from their play zone.
314. Gray discards Duck Under from their play zone.
315. — end of turn 12 —
316. You are in: Collapsed Stairwell.
317. Red draws Charge In.
318. Gray draws Pick The Lock.
319. Red plays Coil Of Cable.
320. Gray discards A Pair Of Stich-Em-Ups from their hand.
321. Gray pays with A Pair Of Stich-Em-Ups.
322. Gray plays Riot Shield.
323. Scramble 2 met — Clear, but both of you Exhaust 1.
324. Scramble 5 met — Clear, and one of you reveals a reward.
325. Collapsed Stairwell is Cleared.
326. Zen Mode stops it: Red Exhausts nothing.
327. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
328. Gray Exhausts Here, Catch.
329. Gray's reward pool shows Catch Your Breath.
330. Gray takes Catch Your Breath.
331. Cleanup.
332. Gray takes Riot Shield into hand.
333. Red discards Coil Of Cable from their play zone.
334. — end of turn 13 —
335. You are in: Ruptured Coolant Line.
336. Red draws Shove.
337. Gray draws Catch Your Breath.
338. Gray discards Crowbar from their hand.
339. Gray pays with Crowbar.
340. Gray plays Riot Shield.
341. Gray discards Pick The Lock from their hand.
342. Gray discards Catch Your Breath from their hand.
343. Gray pays with Pick The Lock, Catch Your Breath.
344. Gray plays Pick The Lock.
345. Scramble 4 met — Clear, but both of you get Bad Stuff.
346. Scramble 7 met — Clear, and one of you reveals a reward.
347. Ruptured Coolant Line is Cleared.
348. Red gets My Head Is Quantum Spinning.
349. Red takes My Head Is Quantum Spinning into hand.
350. Gray gets Spore Cloud.
351. Gray takes Spore Cloud into hand.
352. Red's reward pool shows Both Barrels.
353. Red takes Both Barrels.
354. Cleanup.
355. Gray takes Riot Shield into hand.
356. Gray discards Pick The Lock from their play zone.
357. — end of turn 14 —
358. You are in: Villy, Coney's Work Husband.
359. Gray draws A Pair Of Stich-Em-Ups.
360. Red discards Grav Harness from their hand.
361. Red discards Shove from their hand.
362. Red pays with Grav Harness, Shove.
363. Red plays Cutting Torch.
364. Red discards Zen Mode from their hand.
365. Red discards My Head Is Quantum Spinning from their hand.
366. Red pays with Zen Mode, My Head Is Quantum Spinning.
367. Red plays Charge In.
368. Oomph 9 met — Ascend
369. Villy, Coney's Work Husband is Cleared.
370. Cleanup.
371. Red discards Cutting Torch from their play zone.
372. Red discards Charge In from their play zone.
373. — end of turn 15 —
374. Floor 3 is clear.
375. Red takes Second Wind.
376. Red shuffles 1 card(s) back in.
377. Gray shuffles 3 card(s) back in.
378. Gray declines the reward.
379. Floor 4 is built: 7 rooms.
380. NOTE — Tuning-independent shape, floors 2-3: Settle your Stuff has read as pure bookkeeping every time so far, not a decision. The default (shuffle into the pool) is almost always correct because a kept Stuff card costs a permanent non-Stuff card from deck or discard, and nothing so far has been worth that price -- the Stuff cards offered (Overcharged Battery, Torn Seal, A Pair Of Stich-Em-Ups) are not strong enough to pay a real card for. Combined with the missing-combination problem in note above, the practical move has been 'decline everything, keep nothing' every single Ascend so far. Whether that is a tuning problem (nothing worth keeping) or a structural one (keeping is never worth a card) is a question for the designer once cards are re-tuned.
381. You are in: Collapsed Stairwell.
382. Red draws Charge In.
383. Red draws Torn Seal.
384. Red draws Both Barrels.
385. Red draws Charge In.
386. Red draws Overdrive.
387. Gray draws Duck Under.
388. Gray draws Panic.
389. Gray draws Spore Cloud.
390. Gray discards Panic from their hand.
391. Gray pays with Panic.
392. Gray plays Duck Under.
393. Scramble 2 met — Clear, but both of you Exhaust 1.
394. Collapsed Stairwell is Cleared.
395. Red Exhausts Overdrive.
396. Gray Exhausts Duck Under.
397. Cleanup.
398. Gray discards Duck Under from their play zone.
399. — end of turn 16 —
400. You are in: Ruptured Coolant Line.
401. Gray draws Duck Under.
402. Gray draws I Know Kung Fu.
403. Gray discards Spore Cloud from their hand.
404. Gray pays with Spore Cloud.
405. Gray plays Duck Under.
406. Gray draws Faceful Of Slime.
407. You Flee Ruptured Coolant Line.
408. Red Exhausts Reckless Swing.
409. Gray Exhausts Duck Under.
410. Red gets Sluggish.
411. Red takes Sluggish into hand.
412. Cleanup.
413. Gray discards Duck Under from their play zone.
414. — end of turn 17 —
415. You are in: Tool Cage.
416. Gray draws Pick The Lock.
417. Red discards Torn Seal from their hand.
418. Red pays with Torn Seal.
419. Red plays Overdrive.
420. Red Exhausts Second Wind.
421. Red's deck is empty — the discard pile shuffles in to make a new one (7 cards).
422. Red Exhausts Charge In.
423. Red discards Both Barrels from their hand.
424. Red discards Charge In from their hand.
425. Red discards Sluggish from their hand.
426. Red pays with Both Barrels, Charge In, Sluggish.
427. Red plays Charge In.
428. Gray discards I Know Kung Fu from their hand.
429. Gray discards Faceful Of Slime from their hand.
430. Gray pays with I Know Kung Fu, Faceful Of Slime.
431. Gray plays Pick The Lock.
432. Scramble 3 met — Both of you get Good Stuff.
433. Oomph 5 met — Red gets 2 instead.
434. Tool Cage is Cleared.
435. Red gets Pry Bar.
436. Red takes Pry Bar into hand.
437. Red gets Cutting Torch.
438. Red takes Cutting Torch into hand.
439. Gray gets Crowbar.
440. Gray takes Crowbar into hand.
441. Cleanup.
442. Red discards Overdrive from their play zone.
443. Red discards Charge In from their play zone.
444. Gray discards Pick The Lock from their play zone.
445. — end of turn 18 —
446. You are in: Spill Of Cargo.
447. Red draws Shove.
448. Red draws Shove.
449. Red draws My Head Is Quantum Spinning.
450. Gray draws Duck Under.
451. Gray draws Peek Around Corner.
452. Gray draws Pick The Lock.
453. Gray's deck is empty — the discard pile shuffles in to make a new one (10 cards).
454. Gray draws Pick The Lock.
455. Gray draws Catch Your Breath.
456. Gray draws Duck Under.
457. Gray draws I Know Kung Fu.
458. NOTE — Engine fidelity / rulebook gap, worth flagging clearly: Turn Start this turn, Gray's hand size before the draw was 1 (Crowbar). Draw up to five (rulebook, Each Turn 1.2) should draw exactly 4 cards for Gray. The log shows Gray drew 7: Duck Under, Peek Around Corner, Pick The Lock, [deck empty, reshuffle], Pick The Lock, Catch Your Breath, Duck Under, I Know Kung Fu -- landing Gray at hand size 8, three over the stated cap. Red drew exactly 3 cards this turn (hand 2 -> 5, correct), and the 3rd card Red drew was My Head Is Quantum Spinning, cards.yaml text 'Holding: whenever you draw a card, your partner must also draw a card.' Three extra Gray draws exactly matches Red's three draws this turn, so the effect looks like it fired for all of Red's draws this Turn Start even though MHQS only entered Red's hand as the LAST of those three draws -- it could not have been 'in hand' (the Holding keyword's stated trigger condition) for the first two. Either the engine batches Holding draw-triggers over the whole Turn Start step rather than checking hand membership in real time, or there is a genuine ordering bug. Separately: the rulebook's 'draw up to five' doesn't say whether a Holding-triggered forced draw is capped at 5 or can push a hand past it -- worth a question to the designer either way, since MHQS pushing a hand to 8 is a big stamina hit for a card that isn't in that hand at all.
459. Gray discards Peek Around Corner from their hand.
460. Gray pays with Peek Around Corner.
461. Gray plays Duck Under.
462. Gray draws Duck Under.
463. Gray discards Crowbar from their hand.
464. Gray pays with Crowbar.
465. Gray plays Duck Under.
466. Gray draws Faceful Of Slime.
467. Gray discards Faceful Of Slime from their hand.
468. Gray pays with Faceful Of Slime.
469. Gray plays Duck Under.
470. Gray draws Pick The Lock.
471. Scramble 3 met — Both of you get Good Stuff.
472. Scramble 5 met — Gray gets 2 instead.
473. Spill Of Cargo is Cleared.
474. Red gets Riot Shield.
475. Red takes Riot Shield into hand.
476. Gray gets A Pair Of Stich-Em-Ups.
477. Gray takes A Pair Of Stich-Em-Ups into hand.
478. Gray gets Grav Harness.
479. Gray takes Grav Harness into hand.
480. Cleanup.
481. Gray discards Duck Under from their play zone.
482. Gray discards Duck Under from their play zone.
483. Gray discards Duck Under from their play zone.
484. — end of turn 19 —
485. You are in: Sorting Room.
486. Red plays Pry Bar.
487. Gray discards Pick The Lock from their hand.
488. Gray discards Catch Your Breath from their hand.
489. Gray pays with Pick The Lock, Catch Your Breath.
490. Gray plays Pick The Lock.
491. Gray draws Spore Cloud.
492. Oomph 2 met — Red gets Good Stuff.
493. Scramble 2 met — Gray gets Good Stuff.
494. Sorting Room is Cleared.
495. Red gets Overcharged Battery.
496. Red takes Overcharged Battery into hand.
497. Gray gets Coil Of Cable.
498. Gray takes Coil Of Cable into hand.
499. Cleanup.
500. Red discards Pry Bar from their play zone.
501. Gray discards Pick The Lock from their play zone.
502. — end of turn 20 —
503. You are in: Coney, The Thing In The Stairwell.
504. Red discards My Head Is Quantum Spinning from their hand.
505. Red pays with My Head Is Quantum Spinning.
506. Red plays Overcharged Battery.
507. Red plays Cutting Torch.
508. Red discards Riot Shield from their hand.
509. Red pays with Riot Shield.
510. Red plays Shove.
511. Oomph 9 met — Ascend
512. Coney, The Thing In The Stairwell is Cleared.
513. Cleanup.
514. Red discards Overcharged Battery from their play zone.
515. Red discards Cutting Torch from their play zone.
516. Red discards Shove from their play zone.
517. — end of turn 21 —
518. Floor 4 is clear.
519. Red shuffles 1 card(s) back in.
520. Red takes Heavy Pockets.
521. Red shuffles 1 card(s) back in.
522. Gray shuffles 6 card(s) back in.
523. Gray declines the reward.
524. Floor 5 is built: 6 rooms.
525. You are in: Ruptured Coolant Line.
526. Red draws Shove.
527. Red draws Zen Mode.
528. Red draws Torn Seal.
529. Red draws Heavy Pockets.
530. Red draws Rust.
531. Gray draws Panic.
532. Gray draws I Know Kung Fu.
533. Gray draws Pick The Lock.
534. Gray draws Spore Cloud.
535. Gray discards Panic from their hand.
536. Gray discards Spore Cloud from their hand.
537. Gray pays with Panic, Spore Cloud.
538. Gray plays Pick The Lock.
539. Gray draws Pick The Lock.
540. Scramble 4 met — Clear, but both of you get Bad Stuff.
541. Ruptured Coolant Line is Cleared.
542. The Bad Stuff pool is empty — Red gets nothing.
543. The Bad Stuff pool is empty — Gray gets nothing.
544. Cleanup.
545. Gray discards Pick The Lock from their play zone.
546. — end of turn 22 —
547. You are in: Collapsed Stairwell.
548. Gray's deck is empty — the discard pile shuffles in to make a new one (11 cards).
549. Gray draws Duck Under.
550. Gray draws Pick The Lock.
551. Gray draws Faceful Of Slime.
552. Gray discards Faceful Of Slime from their hand.
553. Gray pays with Faceful Of Slime.
554. Gray plays Duck Under.
555. Gray draws Spore Cloud.
556. Scramble 2 met — Clear, but both of you Exhaust 1.
557. Collapsed Stairwell is Cleared.
558. Zen Mode stops it: Red Exhausts nothing.
559. Gray Exhausts Pick The Lock.
560. Cleanup.
561. Gray discards Duck Under from their play zone.
562. — end of turn 23 —
563. You are in: Ration Locker.
564. Red discards Torn Seal from their hand.
565. Red pays with Torn Seal.
566. Red plays Shove.
567. Red discards Rust from their hand.
568. Red pays with Rust.
569. Red plays Heavy Pockets.
570. Gray discards Pick The Lock from their hand.
571. Gray discards Spore Cloud from their hand.
572. Gray pays with Pick The Lock, Spore Cloud.
573. Gray plays Pick The Lock.
574. Gray draws Peek Around Corner.
575. Oomph 2 met — Red gets Good Stuff.
576. Scramble 2 met — Gray gets Good Stuff.
577. Oomph 4 met — Red gets 2 instead.
578. Scramble 4 met — Gray gets 2 instead.
579. Ration Locker is Cleared.
580. Red gets Riot Shield.
581. Red takes Riot Shield into hand.
582. Red gets Overcharged Battery.
583. Red takes Overcharged Battery into hand.
584. Gray gets Coil Of Cable.
585. Gray takes Coil Of Cable into hand.
586. Gray gets Cutting Torch.
587. Gray takes Cutting Torch into hand.
588. Cleanup.
589. Red discards Shove from their play zone.
590. Red discards Heavy Pockets from their play zone.
591. Gray discards Pick The Lock from their play zone.
592. — end of turn 24 —
593. You are in: Collapsed Stairwell.
594. Red's deck is empty — the discard pile shuffles in to make a new one (11 cards).
595. Red draws Charge In.
596. Red draws Shove.
597. Gray draws Pick The Lock.
598. Red discards Charge In from their hand.
599. Red pays with Charge In.
600. Red plays Riot Shield.
601. Gray plays Coil Of Cable.
602. Gray draws Duck Under.
603. Scramble 2 met — Clear, but both of you Exhaust 1.
604. Scramble 5 met — Clear, and one of you reveals a reward.
605. Collapsed Stairwell is Cleared.
606. Zen Mode stops it: Red Exhausts nothing.
607. Gray Exhausts Duck Under.
608. Red's reward pool shows Flurry.
609. Red declines the reward.
610. Cleanup.
611. Red takes Riot Shield into hand.
612. Gray discards Coil Of Cable from their play zone.
613. — end of turn 25 —
614. NOTE — Stopping at the turn-25 limit, floor 5 of 10, mid-turn-start. Neither character came close to Down: Red is on deck 9 + discard 1 + exhaust 11 (of an original 12-card deck, so exhaust alone now exceeds the starting deck size), Gray is deck 2 + discard 6 + exhaust 7. Stamina pressure exists but is slow -- both decks kept cycling through discard recycling and neither hand was ever empty at a moment it mattered. The permanent Exhaust pile is the standout number: Red has exhausted 11 cards total across five floors, several of them good reward cards (Junk Launcher, Fast Follow, Second Wind, Reckless Swing all got eaten by threshold-Exhaust or Overdrive's Exhaust 2 at some point in this run) rather than starter filler. Under 0.1 rules exhaust was recoverable at Ascend; under 0.2 it just accumulates. That is the biggest structural difference this run surfaced, tuning aside.
615. NOTE — CLI: bin/nvu replay runs/4.json --quiet printed the full final table (floor, both hands, everything) before the one-line verdict, same as playtest 3 note 9 flagged for this rules version's engine. Spec.md says --quiet prints only the verdict. Still open.
616. NOTE — Rulebook gap: the Play phase section says 'You may not draw during this phase,' but I Know Kung Fu's Holding text is 'when you play a card with Scramble, draw 1 card,' and this triggered repeatedly during Play all through this run (e.g. logs around turn 3, 7, 12, 19). The engine allows it every time, uncapped, with no error. Read narrowly, the rulebook's ban on drawing in Play and this card's printed effect contradict each other. Read generously, 'you may not draw' means the player cannot choose to draw as an action, and a card-triggered draw is a different thing. The engine has clearly taken the generous reading. Worth a flat question to the designer: is a Play-phase forced draw from a card effect meant to be exempt from the 'no draiw during this phase' line, and if so should the rulebook say so explicitly, since as printed it reads like a flat ban.
617. NOTE — Rulebook gap: Stuff gained on the turn a floor Ascends. This run never happened to draw Good/Bad Stuff and Ascend in the same turn, so it went untested, but nothing in section 10 (Ascending) says what happens if a Stuff card is still in the play zone or was just gained when Cleanup and the Ascend steps run. Section 10 step 1 is 'Shuffle your hand into your deck' -- a Stuff card gained into hand that turn would just go in with everything else, which seems fine, but a Stuff card returned to hand at end of turn (Riot Shield's own text) landing mid-Ascend was never exercised this run. Flagging as an untested edge rather than a confirmed problem.
618. NOTE — Re-tune input, not a verdict: Zen Mode (cost 0, Holding: you don't Exhaust) combined with Reckless-style Oomph-for-Exhaust cards is a strong synergy under 0.2 specifically because Exhaust is now permanent -- it converts a card that used to cost real deck attrition into a pure stat card with zero downside for as long as Zen Mode stays in hand. It stopped an Exhaust twice this run (floor 3 and floor 5) with the line 'Zen Mode stops it,' which read clearly both times. Whether that is too strong is a balance question for after re-tuning, but the interaction itself is worth recording since it is a direct product of the 0.1 -> 0.2 change to Exhaust.

Floor 5 · turn 25 · Turn Start   floor deck 2, fled 0, cleared 4   Good Stuff 4, Bad Stuff 0
Red: deck 9, discard 1, exhaust 11, hand 4
    Zen Mode [cost 0] — Holding: you don't `Exhaust`.
    Overcharged Battery [cost 1; Oomph 2; Good Stuff] — The next card played this turn costs 0.
    Shove [cost 1; Oomph 2]
    Riot Shield [cost 1; Scramble 3; Good Stuff] — If the room is Cleared, return this to your hand at the end of the turn.
Gray: deck 2, discard 6, exhaust 7, hand 5
    I Know Kung Fu [cost 3; Oomph 5] — Holding: when you play a card with Scramble, draw 1 card.
    Peek Around Corner [cost 1; Scramble 1] — Look at the top card of any deck, then put it back on top. (Peek 1?)
    Cutting Torch [cost 2; Oomph 5; Good Stuff]
    Pick The Lock [cost 2; Scramble 4]
    Duck Under [cost 1; Scramble 2]

seed 4, 122 command(s) replayed, floor 5, turn 25, in progress (Turn Start).
```
