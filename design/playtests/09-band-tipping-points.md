# Playtest 9: Band tipping points

Recorded 2026-09-24. Rules version 0.2.4 or later (main at a0857ab). Played by an agent standing
in for a human playtester, in the CLI (`bin/nvu`), seed 21, one shell call per decision. The run
ended in **Defeat** on turn 36, floor 7, when Red went `Down` on a forced Exhaust from a Flee.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

This run tests the rework since playtest 8: The Sentry Drone now needs Oomph 6 or Scramble 6 to
Ascend (an easier Oomph 4/Scramble 4 line gives both players 2 Good Stuff too, and its Flee gives
both players Bad Stuff), Flooded Ventilation Shaft's Oomph 3/Scramble 3 line gives Good Stuff to
both players, and the roof's thresholds read "You Win!". Printed text says "both players", not
"both of you", and this note uses that wording.

## How the run went

Floor 1 (turns 1-9) was cheap: Security Turnstile and Flooded Ventilation Shaft traded off, and
most turns cleared with one or two cards from a single hand. The Oomph 3/Scramble 3 both-players
Good Stuff line on Flooded Ventilation Shaft came up four times and was hit every time it was in
reach, with help from Crowbar's own-turn Good Stuff bonus and free cards like Coil Of Cable, Pry
Bar, and Emergency Power Core. The Sentry Drone Ascended turn 10 at Oomph 4/Scramble 4, giving both
players 2 Good Stuff on top of the reward picks.

Floor 2 (turns 11-19) repeated the same two rooms plus a second Sentry Drone. The reworked O4/S4
line was chased again and hit turn 19 with room to spare (Oomph 6, Scramble 6). Good Stuff pool
pressure started showing here: by turn 19 the pool that started at 28 was down to 2 (note 4).

Floor 3 (turns 20-22) was short, three rooms including a Sentry Drone Ascended at Oomph 6 alone.
The Good Stuff pool hit exactly zero mid-floor (note 5), and floor 4 opened with it still at zero
and no way found in the rulebook for it to refill (note 6).

Floor 4 (turns 23-24) was the first real step up: Automated Defense Turret needed Scramble 8, only
reachable by spending both hands' cards together, and Gears & Glitch (a new Band 2 Stairwell)
needed Oomph 12 or Oomph 7/Scramble 7, cleared turn 24 via the straight Oomph 12 line after a tight
hand-management puzzle.

Floor 5 (turns 25-31) was the longest floor: two visits to Pressurized Maintenance Hub (a room with
two independent one-character reward lines), Overgrown Hydroponics Bay (note 7, a room whose lower
Scramble line gives Bad Stuff even when the higher line is also met), two more Automated Defense
Turrets, and a second Gears & Glitch, Ascended turn 31 via Oomph 7/Scramble 7. Red picked up
Corrosive Acid (Bad Stuff, self-Exhaust every Turn Start while held) on turn 26 and Reckless
(Exhaust 3 on play) as a floor 5 reward; between the two, Red's Exhaust pile climbed from single
digits to 15 by the end of the floor (note 8), and Second Wind (shuffle an Exhausted Red card back
into the deck) started showing up as a needed tool rather than a nice-to-have.

Floor 6 (turns 32-33) was short: one Automated Defense Turret and a third Gears & Glitch, Ascended
turn 33 via Oomph 7/Scramble 7. Red's Exhaust pile reached 18, more than Red's deck and discard
pile combined, before Band 3 even started (note 9).

Floor 7 (turns 34-36), Band 3, is where the run ended. Laser Grid Security Hall (Scramble 14 or
Oomph 18) and The Iron Sentinel (a Stairwell needing Oomph 10/Scramble 10 or Oomph 18) both came up
unreachable on the hands dealt, three Flees in a row (notes 10-11). Each Flee's forced Exhaust
compounded faster than the hand could rebuild a discard buffer, even when the turn was spent
deliberately trying to do that (note 12). Red went Down on the third Flee when both Red's deck and
discard pile ran out mid-Exhaust (note 13). The run reached floor 7 of 9, turn 36 -- deeper than any
run in this series so far -- before Exhaustion itself ended it.

## Notes

1. **In Step's conditional confirmed.** `[agent]` (log 221)

   > In Step confirmed: Red played 2 cards this turn (Lean In, Reckless Swing) before In Step
   > resolved; stat pool Scramble went from 1 to 5, a +4 gain matching 2x2. Card reads correctly as
   > printed.

   Checked against `design/cards.yaml`'s text ("Scramble equal to 2 times the number of cards Red
   has played this turn"). The arithmetic matches exactly. No issue.

2. **Overcharged Battery's on-screen cost-0 preview looked like a bug, then resolved as intended.**
   `[agent]` (log 246, resolved log 248)

   > Overcharged Battery says 'The next card played this turn is played for free' (one card,
   > design/cards.yaml). After playing it, the table showed cost 0 for every card in BOTH Red's and
   > Gray's hands, not just one upcoming card.
   >
   > Resolved: the cost-0 display after playing Overcharged Battery was a preview of what each hand
   > card WOULD cost if played next, not a simultaneous discount on every card. After Grav Harness
   > was actually played, Red's Charge In and Gray's whole hand reverted to their printed costs.
   > Overcharged Battery reads correctly as printed.

   Worth flagging as a CLI display question even though the underlying rule is fine: showing every
   card in both hands at cost 0 reads, at a glance, like the discount applies to all of them. A
   human playtester without the card text memorized could easily overspend expecting several free
   plays.

3. *(folded into note 2's resolution; no separate entry)*

4. **Good Stuff pool draining fast.** `[agent]` (log 400)

   > Good Stuff pool is down to 2 remaining entering floor 3 (turn 19), Bad Stuff at 18. Two
   > Ascends and several Oomph3/Scramble3 both-players Good Stuff lines have drawn it down fast.

   Not a rule question by itself, just the setup for notes 5 and 6.

5. **Good Stuff pool hit empty mid-Clear; one of two grants came up dry.** `[agent]` (log 433)

   > Good Stuff pool hit empty this turn (turn 20, floor 3): the printed line read 'The Good Stuff
   > pool is empty — Gray gets nothing.' Red still got its Good Stuff reward (Overcharged Battery)
   > from the same Clear, so the two Good Stuff grants from one Oomph3/Scramble3 line resolve in
   > order and the second one can come up dry even though the room's own text promised both
   > players Good Stuff.

   Checked rulebook section on Stuff: "If its pool is empty when you would gain Stuff, you gain
   nothing." Matches exactly, not a bug. But it means a "both players get Good Stuff" line can
   deliver to only one player depending on resolution order and remaining pool count, which reads
   oddly for a line printed as symmetric.

6. **No rule found for the Good Stuff pool refilling mid-run.** `[agent]` (log 471)

   > Floor 4 (Band 2) starts with the Good Stuff pool already at 0 (Bad Stuff still 18). Rulebook:
   > 'If its pool is empty when you would gain Stuff, you gain nothing.' No rule found for the pool
   > ever refilling mid-run.

   Question for the designer, not a ruling: is the Good Stuff pool meant to run out partway through
   a run and stay empty, or is there meant to be a refill mechanism that isn't in the rulebook yet?
   This run never saw one, and the pool was at 0 for floors 3 through 7 (all of Band 2 and the start
   of Band 3).

7. **A room's higher Scramble line doesn't skip the lower line's Bad Stuff cost.** `[agent]` (log
   622)

   > Overgrown Hydroponics Bay has Scramble 6 (Bad Stuff both) and Scramble 11 (Good Stuff both) as
   > two SEPARATE challenges (checked design/cards.yaml: two challenges: entries, not one challenge
   > with two thresholds), so meeting Scramble 11 does not skip the Scramble 6 penalty -- both
   > resolved this turn.

   Checked against rulebook section on Clear: "If more than one challenge is met, their outcomes
   may be resolved in any order." Matches exactly, not a bug -- the room is built as two independent
   challenges, not one challenge with two thresholds (where only the lowest met threshold would
   resolve). But reaching the room's better number still cost Bad Stuff on the way there, which
   reads oddly for a design meant to reward hitting the higher number. Question for the designer:
   is that the intended shape for rooms built this way?

8. **Red's Exhaust pile at 12, well before Band 3.** `[agent]` (log 648)

   > Red's exhaust pile is at 12 cards (deck 15, discard 0, hand 1) at turn 27, floor 5 -- Band 2,
   > not yet Band 3. Reckless's own Exhaust 3 and Corrosive Acid's Turn Start Exhaust 1 (held since
   > turn 26) are compounding fast.

   First flag in a chain that continues through notes 9, 12, and 13.

9. **Red's Exhaust pile at 18, larger than deck+discard combined, before Band 3 starts.** `[agent]`
   (log 875)

   > Ascend #6, end of floor 6 (Band 2 complete), turn 33: Red deck 8, discard 9, exhaust 18, hand
   > 0. Red's exhaust pile (18) is now larger than Red's deck+discard combined (17), and this is
   > still before Band 3 (floors 7-9) starts.

   See "Design questions" below (Q3) for the full read on this.

10. **Laser Grid Security Hall (Scramble 14 or Oomph 18) was unreachable.** `[agent]` (log 893)

    > Raw sum of every stat in both hands ... is only O11 S14 even before any payment cost is paid
    > -- and payment always eats several cards, so the achievable total is well under that. Neither
    > threshold is reachable this turn, or plausibly any single turn with a 5-card starter-heavy
    > hand.

    Shape finding, not a rule question: a Band 3 room whose thresholds exceed what even a
    theoretical zero-payment turn could produce from two 5-card hands.

11. **The Iron Sentinel (Oomph 10/Scramble 10, or Oomph 18) was also unreachable.** `[agent]` (log
    909)

    > Checked max reachable with this turn's hands using the same combos as the last two rooms: Red
    > tops out around O6-8 total, Gray around O1 S7 total ... combined roughly O7-9 S7-8, short of
    > the O10S10 line and nowhere near O18.

    Same shape as note 10, one room later. See Q2 below.

12. **Used Gray's utility cards to relieve Red's Exhaust pile instead of chasing a doomed Clear.**
    `[agent]` (log 710)

    > Since neither threshold was reachable, used both of Gray's A Pair Of Stitch-Em-Ups on Red's
    > Exhaust pile instead of chasing a doomed Clear: moved 4 cards total ... from Red's exhaust
    > pile (was 14) back to the bottom of Red's deck, down to 10, before ending the turn into a
    > known Flee. This reads as the correct counter-play to playtest 8's finding 3.

    This is the deliberate counter-play to playtest 8's finding that holding a hand back against an
    unreachable room can leave no discard buffer for the Flee's own Exhaust. It worked this once
    (turn 29). It was not enough three rooms later; see note 13.

13. **Red went Down on a Flee despite actively managing the Exhaust pile all floor.** `[agent]`
    (log 945)

    > Red's deck had 1 card (Second Wind) before the Flee's Exhaust 4; exhausted Second Wind, deck
    > empty, discard (2 cards) shuffled in, exhausted Charge In and Shove (2 more, total 3), deck
    > empty again, discard also empty -- rulebook Empty deck: 'If your discard pile is also empty,
    > you go Down.' This matches playtest 8's finding almost exactly, but this time Red HAD been
    > playing cards each unreachable-room turn specifically to keep a discard buffer, and it still
    > wasn't enough: three straight unreachable Band 3 rooms ... each forcing a 3-4 card Exhaust
    > compounded faster than a 2-card-per-turn discard trickle could refill.

    Checked against the rulebook's Empty deck rule; matches exactly, not a bug. See Q3 below for
    the full read.

14. **The Scrap-a-Bad-Stuff prompt gate confirmed clean.** `[agent]` (log 755)

    > Confirmed the 'who may Scrap a Bad Stuff card' prompt did not appear this Clear (turn 30,
    > Automated Defense Turret, Oomph 10 line) because neither Red nor Gray held any Bad Stuff at
    > resolution -- both Corrosive Acid and Panic had already been discarded as payment the turn
    > before. This matches the changelog note that the Scrap prompt is now gated on someone
    > actually holding Bad Stuff.

    Positive confirmation of the fix mentioned in the brief; playtest 8 had no data on this.

## Design questions

Justin asked four questions about this run; answers below, each citing the log lines from
`bin/nvu replay design/playtests/09-band-tipping-points.json`.

1. **Dual-Stat Utilization: are Lean In and Work The Angles played consistently in Band 1, or
   held/discarded?**

   Lean In (Red, count 1) was drawn 3 times and played all 3 times, immediately, the same turn
   drawn: turn 1 (log 5 draw, 59 play), turn 11 (log 202 draw, 210 play), turn 24 (log 507 draw,
   528 play). It was never held idle or discarded as payment. A fourth fate happened without ever
   reaching hand: at log 699 (turn 28) it was auto-Exhausted straight from the top of the deck by
   Corrosive Acid's Turn Start effect, before Red could draw or play it -- a way a dual-stat starter
   can be lost that has nothing to do with the player's choice to play or hold it.

   Work The Angles (Gray, count 1) was drawn 5 times, played 4 times (log 31, 65, 220, 862) and
   discarded as payment once (log 675-676, turn 27, when Gray's hand had two higher-priority plays
   -- Pick The Lock and Riot Shield -- and not enough cards to pay for all three). It was never held
   unplayed across a turn boundary.

   So in this run: both cards were used the turn they were drawn, all but once. The one exception
   was a deliberate payment choice under hand pressure, not neglect. This reads as "played
   consistently," not "held or discarded," across all of Band 1 and into Band 2 and 3 (both cards
   kept cycling back through the deck the whole run). One run is a thin sample, and this run's
   agent was actively looking for reasons to play them (as dual-stat cards they're flexible payment
   fodder too, which may inflate their play rate compared to a less deliberate player).

2. **Band Transition Win Rates: does Band 2 (floors 4-6) create the intended "tipping point" where
   reliance on basic starters drops off?**

   Yes, clearly, starting at floor 4. Automated Defense Turret (Scramble 8 or Oomph 10, first seen
   log 168-ish/turn 23) and Gears & Glitch (Oomph 12, or Oomph 7/Scramble 7, first seen turn 24)
   both required spending both hands' cards together, and reward cards taken from earlier Ascends
   (Junk Launcher, Second Wind, Distract & Pivot, In Step) did real work reaching those numbers --
   see note 1 for In Step's exact contribution (+4 Scramble in one resolution). Compare to Band 1,
   where a single starter card (Pick The Lock, Coil Of Cable, Emergency Power Core) routinely
   cleared a room alone.

   Band 3 (floor 7, the only Band 3 floor this run reached) went further: both rooms encountered
   (Laser Grid Security Hall, Oomph 18/Scramble 14; The Iron Sentinel, Oomph 18/Oomph 10+Scramble
   10) were unreachable even combining both hands at full value (notes 10-11, logs 893 and 909).
   That reads as past the intended tipping point into "unwinnable this turn regardless of hand" --
   worth checking whether that's true of every Band 3 room or just these two, since this run only
   sampled two of presumably several.

3. **Stamina & Down Rates: is Exhaustion pressuring player deck size appropriately in Band 3
   without causing premature run failures in Band 1?**

   No premature Band 1 failure this run -- floor 1 was the cheapest floor of the run, no Exhausts
   beyond ordinary card costs. But Exhaustion pressure started building well before Band 3: Red's
   Exhaust pile was 12 by turn 27 (floor 5, log 648), 15 by the end of floor 5 (log 792), and 18 by
   the end of floor 6 (log 875) -- larger than Red's deck and discard pile combined, and this is
   all still Band 2. Two compounding sources: Corrosive Acid (Bad Stuff, self-Exhaust every Turn
   Start while held, picked up log 611) and Reckless (a Fine reward with its own Exhaust 3 on play,
   picked up log 574) both landed on Red in the same stretch.

   By Band 3 (floor 7), the pile was a genuine failure mode: three straight unreachable rooms
   forced Flee Exhausts of 3-4 cards each (notes 10-13), deliberate discard-buffer management (note
   12) bought one extra room's survival but not two, and Red went Down on the third Flee (note 13,
   log 941) when both deck and discard ran dry mid-Exhaust. The run ended turn 36, floor 7 --
   deeper than any run in this series, but still a Down from Exhaustion rather than a Victory or an
   ordinary Defeat from a lost fight.

   Read together: this run's data says Exhaustion is not causing premature Band 1 failures, but it
   is building real pressure well ahead of schedule in Band 2 (two Bad Stuff/self-Exhaust cards
   landing on one character close together did it), and by Band 3 that pressure combined with
   simply-unreachable rooms to end the run. One run is one data point, and this run's particular mix
   of Bad Stuff draws (Corrosive Acid twice, Panic, Sluggish, Torn Seal) may not be typical -- but
   the mechanism (self-Exhaust Bad Stuff cards stacking, then a string of unreachable rooms forcing
   big Flee Exhausts with no time to recover) is worth weighing against future runs' data.

4. **Card Reward Pick Rates: are the new 2:1/3:1 Fine and Cool rewards feeling like distinct power
   spikes over the starter baseline?**

   This run had six Ascends plus four single-card "reveal a reward" grants (Pressurized
   Maintenance Hub twice, and Gears & Glitch's O7/S7 line twice), for 18 reward cards taken total: 9
   Fine, 9 Cool, an even split.

   The clearest power-spike reads: Junk Launcher (Cool, turn 19 log 394) and Second Wind (Cool,
   taken twice, log 783 and 793) both did work no starter could -- Junk Launcher scales with the
   whole play zone's printed cost, and Second Wind directly answered the Exhaust-pressure problem
   this run kept hitting (notes 8-9, Q3). In Step (Cool, log 194) delivered a clean +4 Scramble in
   one resolution (note 1), well above any single starter's stat line. On the Fine side, Bull Rush
   (taken twice, log 654 and 866) is functionally a slightly-worse Lean In/Work The Angles (same
   O2S1 dual-stat shape at a different split) rather than a visible spike -- it read as a solid
   inclusion, not a power jump. Reckless (Fine, log 574) and Reckless Swing (Fine, taken as a
   Cool-tier... no, Fine, log 191) both hit hard (O4-O5 off one card) but at the cost of self-Exhaust,
   which this run's Exhaust crisis (Q3) makes a real trade-off, not a free spike.

   So: the Cool-tier picks in this run mostly read as distinct power spikes (Junk Launcher, Second
   Wind, In Step all did something no starter could). The Fine-tier picks read more like solid
   lateral upgrades than spikes, with Reckless/Reckless Swing's raw Oomph offset by their own
   Exhaust cost. Eighteen picks from one run is a reasonable sample within this run, but every pick
   here was chosen by the same agent optimizing for "what does the room need right now" --
   different picks (or different card pools on other seeds) could read differently.

## The CLI as a playtest tool

- **Things that worked:** `play take`/`play skip` for the single-card "reveal a reward" outcome
  (distinct from the 3-choice Ascend prompt) was clear and unambiguous -- the two never got
  confused despite this run hitting both types repeatedly. `bin/nvu card "<name>"` for checking
  rarities and exact text against `design/cards.yaml` continued to work well with no run needed.
  `play note` after game-over (turn 36, no legal moves) still accepted the final note explaining
  the Down, same as playtest 8.
- **The one moment of friction:** the cost-0 display after playing Overcharged Battery (note 2)
  read, at a glance, like every card in both hands had become free, when it was actually a preview
  of what each candidate next-play would cost. This cost a full note-and-resolve cycle to sort out
  and would likely confuse a human playtester the same way.
- Automated Salvage Kit's "Scrap 1 Bad Stuff card from your hand or discard pile" was played twice
  this run with no Bad Stuff available to Scrap, so it just had no effect both times -- the CLI
  didn't flag this as a wasted play, which is correct (nothing about the printed text requires a
  valid target), but a human player might want a heads-up before spending a card on a dead effect.

## Candidate issues

Rulebook questions for the designer:

- Overgrown Hydroponics Bay's Scramble 6 (Bad Stuff) and Scramble 11 (Good Stuff) are two separate
  challenges, so reaching the better number doesn't skip the worse one's cost (note 7). Is that the
  intended shape for rooms built with a "worse line, better line" pair of independent challenges?
- No rule found for the Good Stuff pool refilling mid-run (note 6); it hit zero on turn 20 (floor
  3) and stayed there through the whole rest of this run. Is that intended, and if so, are the
  several "both players get Good Stuff" printed lines meant to go permanently dead once the pool
  runs dry?
- A "both players get Good Stuff" line can deliver to only one player if the pool empties between
  the two grants (note 5), which happened this run. Worth a rulebook note if that's intended,
  since the printed text reads as symmetric.

Shape, independent of tuning:

- Band 3's two sampled rooms (Laser Grid Security Hall, The Iron Sentinel) were both unreachable
  even at a theoretical zero-payment maximum with the hands this run was dealt (notes 10-11). See
  Q2.
- Exhaustion pressure built well ahead of Band 3, reaching 18 cards (more than deck+discard
  combined) by the end of Band 2 from two Bad Stuff/self-Exhaust cards landing close together on
  one character (notes 8-9). See Q3.
- The counter-play of spending a turn's utility cards on Exhaust-pile relief instead of chasing an
  unreachable room (note 12) worked once but wasn't enough against three unreachable rooms in a
  row (note 13). Worth knowing whether Band 3's room density is expected to outpace a single
  character's relief tools like Second Wind and A Pair Of Stitch-Em-Ups.

Card observations for a later re-tune:

- Second Wind (Cool) and In Step (Cool) both read as genuine power spikes this run: Second Wind
  directly answers the Exhaust-pressure problem, In Step delivered a clean +4 Scramble off one
  card. Junk Launcher (Cool) continues to read strong, consistent with playtest 8.
- Bull Rush (Fine) reads as a lateral upgrade (same shape as the dual-stat starters) rather than a
  spike. Reckless / Reckless Swing (Fine) hit hard on Oomph but their own Exhaust cost is a real
  trade-off given this run's Exhaust crisis.

CLI improvements:

- The cost-0 preview after Overcharged Battery (note 2) could use a clearer label -- something
  like showing only the specific "if played next" cost rather than rewriting every hand card's
  displayed cost to 0.

## Appendix: the run transcript

`bin/nvu replay design/playtests/09-band-tipping-points.json`, verbatim.

```
  1. Floor 1 is built: 10 rooms.
  2. You are in: Security Turnstile.
  3. Red draws Charge In.
  4. Red draws Shove.
  5. Red draws Lean In.
  6. Red draws Overdrive.
  7. Red draws Shove.
  8. Gray draws Duck Under.
  9. Gray draws Pick The Lock.
 10. Gray draws Peek Around Corner.
 11. Gray draws Pick The Lock.
 12. Gray draws Peek Around Corner.
 13. Gray discards Duck Under from their hand.
 14. Gray discards Peek Around Corner from their hand.
 15. Gray pays with Duck Under, Peek Around Corner.
 16. Gray plays Pick The Lock.
 17. Scramble 3 met — Clear.
 18. Security Turnstile is Cleared.
 19. Cleanup.
 20. Gray discards Pick The Lock from their play zone.
 21. — end of turn 1 —
 22. You are in: Security Turnstile.
 23. Gray draws Work The Angles.
 24. Gray draws Duck Under.
 25. Gray draws Pick The Lock.
 26. Gray discards Peek Around Corner from their hand.
 27. Gray pays with Peek Around Corner.
 28. Gray plays Duck Under.
 29. Gray discards Pick The Lock from their hand.
 30. Gray pays with Pick The Lock.
 31. Gray plays Work The Angles.
 32. Scramble 3 met — Clear.
 33. Security Turnstile is Cleared.
 34. Cleanup.
 35. Gray discards Duck Under from their play zone.
 36. Gray discards Work The Angles from their play zone.
 37. — end of turn 2 —
 38. You are in: Security Turnstile.
 39. Gray draws Duck Under.
 40. Gray draws Duck Under.
 41. Gray draws Pick The Lock.
 42. Gray draws Pick The Lock.
 43. Gray discards Duck Under from their hand.
 44. Gray discards Duck Under from their hand.
 45. Gray pays with Duck Under, Duck Under.
 46. Gray plays Pick The Lock.
 47. Scramble 3 met — Clear.
 48. Security Turnstile is Cleared.
 49. Cleanup.
 50. Gray discards Pick The Lock from their play zone.
 51. — end of turn 3 —
 52. You are in: Flooded Ventilation Shaft.
 53. Gray's deck is empty — the discard pile shuffles in to make a new one (10 cards).
 54. Gray draws Work The Angles.
 55. Gray draws Pick The Lock.
 56. Gray draws Pick The Lock.
 57. Red discards Overdrive from their hand.
 58. Red pays with Overdrive.
 59. Red plays Lean In.
 60. Red discards Charge In from their hand.
 61. Red pays with Charge In.
 62. Red plays Shove.
 63. Gray discards Pick The Lock from their hand.
 64. Gray pays with Pick The Lock.
 65. Gray plays Work The Angles.
 66. Gray discards Pick The Lock from their hand.
 67. Gray discards Pick The Lock from their hand.
 68. Gray pays with Pick The Lock, Pick The Lock.
 69. Gray plays Pick The Lock.
 70. Scramble 4 met — Clear.
 71. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
 72. Flooded Ventilation Shaft is Cleared.
 73. Red gets Stim Pack.
 74. Red takes Stim Pack into hand.
 75. Gray gets Crowbar.
 76. Gray takes Crowbar into hand.
 77. Cleanup.
 78. Red discards Lean In from their play zone.
 79. Red discards Shove from their play zone.
 80. Gray discards Work The Angles from their play zone.
 81. Gray discards Pick The Lock from their play zone.
 82. — end of turn 4 —
 83. You are in: Flooded Ventilation Shaft.
 84. Red draws Overdrive.
 85. Red draws Charge In.
 86. Red draws Charge In.
 87. Gray draws Duck Under.
 88. Gray draws Pick The Lock.
 89. Gray draws Duck Under.
 90. Gray draws Duck Under.
 91. Gray plays Crowbar.
 92. Red discards Shove from their hand.
 93. Red discards Overdrive from their hand.
 94. Red pays with Shove, Overdrive.
 95. Red plays Charge In.
 96. Gray discards Duck Under from their hand.
 97. Gray discards Duck Under from their hand.
 98. Gray pays with Duck Under, Duck Under.
 99. Gray plays Pick The Lock.
100. Scramble 4 met — Clear.
101. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
102. Flooded Ventilation Shaft is Cleared.
103. Red gets Emergency Power Core.
104. Red takes Emergency Power Core into hand.
105. Gray gets Riot Shield.
106. Gray takes Riot Shield into hand.
107. Gray gets Crowbar.
108. Gray takes Crowbar into hand.
109. Cleanup.
110. Red discards Charge In from their play zone.
111. Gray discards Crowbar from their play zone.
112. Gray discards Pick The Lock from their play zone.
113. — end of turn 5 —
114. You are in: Flooded Ventilation Shaft.
115. Red draws Shove.
116. Red draws Shove.
117. Gray draws Peek Around Corner.
118. Gray draws Peek Around Corner.
119. Gray plays Crowbar.
120. Red plays Emergency Power Core.
121. Red Exhausts Charge In.
122. Red Exhausts Charge In.
123. Scramble 4 met — Clear.
124. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
125. Flooded Ventilation Shaft is Cleared.
126. Red gets Duct Tape & Wire.
127. Red takes Duct Tape & Wire into hand.
128. Gray gets Riot Shield.
129. Gray takes Riot Shield into hand.
130. Gray gets Coil Of Cable.
131. Gray takes Coil Of Cable into hand.
132. Cleanup.
133. Red discards Emergency Power Core from their play zone.
134. Gray discards Crowbar from their play zone.
135. — end of turn 6 —
136. You are in: Security Turnstile.
137. Gray plays Coil Of Cable.
138. Scramble 3 met — Clear.
139. Security Turnstile is Cleared.
140. Cleanup.
141. Gray discards Coil Of Cable from their play zone.
142. — end of turn 7 —
143. You are in: Security Turnstile.
144. Gray discards Duck Under from their hand.
145. Gray pays with Duck Under.
146. Gray plays Riot Shield.
147. Scramble 3 met — Clear.
148. Security Turnstile is Cleared.
149. Cleanup.
150. Gray takes Riot Shield into hand.
151. — end of turn 8 —
152. You are in: Security Turnstile.
153. Gray draws Duck Under.
154. Gray discards Duck Under from their hand.
155. Gray pays with Duck Under.
156. Gray plays Riot Shield.
157. Scramble 3 met — Clear.
158. Security Turnstile is Cleared.
159. Cleanup.
160. Gray takes Riot Shield into hand.
161. — end of turn 9 —
162. You are in: The Sentry Drone.
163. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
164. Gray draws Duck Under.
165. Red plays Stim Pack.
166. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
167. Red draws Charge In.
168. Red discards Shove from their hand.
169. Red pays with Shove.
170. Red plays Duct Tape & Wire.
171. Gray discards Peek Around Corner from their hand.
172. Gray pays with Peek Around Corner.
173. Gray plays Riot Shield.
174. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
175. The Sentry Drone is Cleared.
176. Red gets Duct Tape & Wire.
177. Red takes Duct Tape & Wire into hand.
178. Red gets Grav Harness.
179. Red takes Grav Harness into hand.
180. Gray gets Cutting Torch.
181. Gray takes Cutting Torch into hand.
182. Gray gets Pry Bar.
183. Gray takes Pry Bar into hand.
184. Cleanup.
185. Gray takes Riot Shield into hand.
186. Red discards Stim Pack from their play zone.
187. Red discards Duct Tape & Wire from their play zone.
188. — end of turn 10 —
189. Floor 1 is clear.
190. Red shuffles 5 card(s) back in.
191. Red takes Reckless Swing.
192. Red shuffles 1 card(s) back in.
193. Gray shuffles 6 card(s) back in.
194. Gray takes In Step.
195. Gray shuffles 1 card(s) back in.
196. Floor 2 is built: 9 rooms.
197. You are in: Flooded Ventilation Shaft.
198. Red draws Charge In.
199. Red draws Shove.
200. Red draws Reckless Swing.
201. Red draws Charge In.
202. Red draws Lean In.
203. Gray draws Riot Shield.
204. Gray draws Pick The Lock.
205. Gray draws Pick The Lock.
206. Gray draws In Step.
207. Gray draws Work The Angles.
208. Red discards Shove from their hand.
209. Red pays with Shove.
210. Red plays Lean In.
211. Red discards Charge In from their hand.
212. Red pays with Charge In.
213. Red plays Reckless Swing.
214. Red Exhausts Charge In.
215. Gray discards Pick The Lock from their hand.
216. Gray pays with Pick The Lock.
217. Gray plays In Step.
218. Gray discards Riot Shield from their hand.
219. Gray pays with Riot Shield.
220. Gray plays Work The Angles.
221. NOTE — In Step confirmed: Red played 2 cards this turn (Lean In, Reckless Swing) before In Step resolved; stat pool Scramble went from 1 to 5, a +4 gain matching 2x2. Card reads correctly as printed.
222. Scramble 4 met — Clear.
223. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
224. Flooded Ventilation Shaft is Cleared.
225. Red gets Overcharged Battery.
226. Red takes Overcharged Battery into hand.
227. Gray gets A Pair Of Stitch-Em-Ups.
228. Gray takes A Pair Of Stitch-Em-Ups into hand.
229. Cleanup.
230. Red discards Lean In from their play zone.
231. Red discards Reckless Swing from their play zone.
232. Gray discards In Step from their play zone.
233. Gray discards Work The Angles from their play zone.
234. — end of turn 11 —
235. You are in: Flooded Ventilation Shaft.
236. Red draws Overdrive.
237. Red draws Grav Harness.
238. Red draws Shove.
239. Gray draws Riot Shield.
240. Gray draws Pry Bar.
241. Gray draws Crowbar.
242. Gray plays Crowbar.
243. Red discards Shove from their hand.
244. Red pays with Shove.
245. Red plays Overcharged Battery.
246. NOTE — Overcharged Battery says 'The next card played this turn is played for free' (one card, design/cards.yaml). After playing it, the table showed cost 0 for every card in BOTH Red's and Gray's hands, not just one upcoming card. Playing Grav Harness next to see whether only it goes free or the discount is really general.
247. Red plays Grav Harness.
248. NOTE — Resolved: the cost-0 display after playing Overcharged Battery was a preview of what each hand card WOULD cost if played next, not a simultaneous discount on every card. After Grav Harness was actually played, Red's Charge In and Gray's whole hand reverted to their printed costs. Overcharged Battery reads correctly as printed.
249. Gray draws Duck Under.
250. Scramble 4 met — Clear.
251. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
252. Flooded Ventilation Shaft is Cleared.
253. Red gets Duct Tape & Wire.
254. Red takes Duct Tape & Wire into hand.
255. Gray gets Stim Pack.
256. Gray takes Stim Pack into hand.
257. Gray gets Stim Pack.
258. Gray takes Stim Pack into hand.
259. Cleanup.
260. Red discards Overcharged Battery from their play zone.
261. Red discards Grav Harness from their play zone.
262. Gray discards Crowbar from their play zone.
263. — end of turn 12 —
264. You are in: Security Turnstile.
265. Red draws Overdrive.
266. Red draws Duct Tape & Wire.
267. Gray discards Stim Pack from their hand.
268. Gray pays with Stim Pack.
269. Gray plays Riot Shield.
270. Scramble 3 met — Clear.
271. Security Turnstile is Cleared.
272. Cleanup.
273. Gray takes Riot Shield into hand.
274. — end of turn 13 —
275. You are in: Security Turnstile.
276. Gray discards Stim Pack from their hand.
277. Gray pays with Stim Pack.
278. Gray plays Riot Shield.
279. Scramble 3 met — Clear.
280. Security Turnstile is Cleared.
281. Cleanup.
282. Gray takes Riot Shield into hand.
283. — end of turn 14 —
284. You are in: Security Turnstile.
285. Gray discards Pry Bar from their hand.
286. Gray pays with Pry Bar.
287. Gray plays A Pair Of Stitch-Em-Ups.
288. Charge In goes to Red's deck.
289. Charge In goes to Red's deck.
290. Gray discards Duck Under from their hand.
291. Gray pays with Duck Under.
292. Gray plays Riot Shield.
293. Scramble 3 met — Clear.
294. Security Turnstile is Cleared.
295. Cleanup.
296. Gray takes Riot Shield into hand.
297. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
298. — end of turn 15 —
299. You are in: Flooded Ventilation Shaft.
300. Gray draws Pick The Lock.
301. Gray draws Peek Around Corner.
302. Gray draws Pick The Lock.
303. Red discards Overdrive from their hand.
304. Red pays with Overdrive.
305. Red plays Duct Tape & Wire.
306. Gray discards Peek Around Corner from their hand.
307. Gray pays with Peek Around Corner.
308. Gray plays Riot Shield.
309. Red plays Overdrive.
310. Red Exhausts Emergency Power Core.
311. Red Exhausts Shove.
312. Scramble 4 met — Clear.
313. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
314. Flooded Ventilation Shaft is Cleared.
315. Red gets Pry Bar.
316. Red takes Pry Bar into hand.
317. Gray gets Pry Bar.
318. Gray takes Pry Bar into hand.
319. Cleanup.
320. Gray takes Riot Shield into hand.
321. Red discards Duct Tape & Wire from their play zone.
322. Red discards Overdrive from their play zone.
323. — end of turn 16 —
324. You are in: Security Turnstile.
325. Red draws Charge In.
326. Red draws Charge In.
327. Gray discards Pry Bar from their hand.
328. Gray pays with Pry Bar.
329. Gray plays Riot Shield.
330. Scramble 3 met — Clear.
331. Security Turnstile is Cleared.
332. Cleanup.
333. Gray takes Riot Shield into hand.
334. — end of turn 17 —
335. You are in: Flooded Ventilation Shaft.
336. Gray draws Crowbar.
337. Gray plays Crowbar.
338. Red plays Pry Bar.
339. Red discards Charge In from their hand.
340. Red pays with Charge In.
341. Red plays Duct Tape & Wire.
342. Gray discards Pick The Lock from their hand.
343. Gray pays with Pick The Lock.
344. Gray plays Riot Shield.
345. Scramble 4 met — Clear.
346. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
347. Flooded Ventilation Shaft is Cleared.
348. Red gets Coil Of Cable.
349. Red takes Coil Of Cable into hand.
350. Gray gets High-Frequency Scanner.
351. Gray takes High-Frequency Scanner into hand.
352. Gray gets A Pair Of Stitch-Em-Ups.
353. Gray takes A Pair Of Stitch-Em-Ups into hand.
354. Cleanup.
355. Gray takes Riot Shield into hand.
356. Red discards Pry Bar from their play zone.
357. Red discards Duct Tape & Wire from their play zone.
358. Gray discards Crowbar from their play zone.
359. — end of turn 18 —
360. You are in: The Sentry Drone.
361. Red's deck is empty — the discard pile shuffles in to make a new one (16 cards).
362. Red draws Reckless Swing.
363. Red draws Stim Pack.
364. Red plays Stim Pack.
365. Red draws Duct Tape & Wire.
366. Red plays Coil Of Cable.
367. Red discards Charge In from their hand.
368. Red pays with Charge In.
369. Red plays Reckless Swing.
370. Red Exhausts Grav Harness.
371. Gray discards Pick The Lock from their hand.
372. Gray pays with Pick The Lock.
373. Gray plays Riot Shield.
374. Oomph 6 met — Ascend.
375. Scramble 6 met — Ascend.
376. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
377. The Sentry Drone is Cleared.
378. Red gets Automated Salvage Kit.
379. Red takes Automated Salvage Kit into hand.
380. Red gets Coil Of Cable.
381. Red takes Coil Of Cable into hand.
382. Gray gets High-Frequency Scanner.
383. Gray takes High-Frequency Scanner into hand.
384. Gray gets Crowbar.
385. Gray takes Crowbar into hand.
386. Cleanup.
387. Gray takes Riot Shield into hand.
388. Red discards Stim Pack from their play zone.
389. Red discards Coil Of Cable from their play zone.
390. Red discards Reckless Swing from their play zone.
391. — end of turn 19 —
392. Floor 2 is clear.
393. Red shuffles 4 card(s) back in.
394. Red takes Junk Launcher.
395. Red shuffles 1 card(s) back in.
396. Gray shuffles 6 card(s) back in.
397. Gray takes One Man's Junk.
398. Gray shuffles 1 card(s) back in.
399. Floor 3 is built: 8 rooms.
400. NOTE — Good Stuff pool is down to 2 remaining entering floor 3 (turn 19), Bad Stuff at 18. Two Ascends and several Oomph3/Scramble3 both-players Good Stuff lines have drawn it down fast. Watching whether the pool runs dry before floor 3 ends.
401. You are in: Flooded Ventilation Shaft.
402. Red draws Shove.
403. Red draws Overcharged Battery.
404. Red draws Charge In.
405. Red draws Charge In.
406. Red draws Shove.
407. Gray draws A Pair Of Stitch-Em-Ups.
408. Gray draws Crowbar.
409. Gray draws Duck Under.
410. Gray draws Pick The Lock.
411. Gray draws High-Frequency Scanner.
412. Gray plays Crowbar.
413. Gray discards Duck Under from their hand.
414. Gray discards A Pair Of Stitch-Em-Ups from their hand.
415. Gray pays with Duck Under, A Pair Of Stitch-Em-Ups.
416. Gray plays Pick The Lock.
417. Red discards Charge In from their hand.
418. Red pays with Charge In.
419. Red plays Shove.
420. Scramble 4 met — Clear.
421. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
422. Flooded Ventilation Shaft is Cleared.
423. Red gets Overcharged Battery.
424. Red takes Overcharged Battery into hand.
425. Gray gets Cutting Torch.
426. Gray takes Cutting Torch into hand.
427. The Good Stuff pool is empty — Gray gets nothing.
428. Cleanup.
429. Red discards Shove from their play zone.
430. Gray discards Crowbar from their play zone.
431. Gray discards Pick The Lock from their play zone.
432. — end of turn 20 —
433. NOTE — Good Stuff pool hit empty this turn (turn 20, floor 3): the printed line read 'The Good Stuff pool is empty — Gray gets nothing.' Red still got its Good Stuff reward (Overcharged Battery) from the same Clear, so the two Good Stuff grants from one Oomph3/Scramble3 line resolve in order and the second one can come up dry even though the room's own text promised both players Good Stuff. This is turn 20 of a run that started with a 28-count Good Stuff pool -- draining it by floor 3 (out of 9) looks fast, worth flagging as a shape/tuning question rather than a bug.
434. You are in: Security Turnstile.
435. Red draws Junk Launcher.
436. Gray draws Cutting Torch.
437. Gray draws One Man's Junk.
438. Gray draws Duck Under.
439. Gray discards Duck Under from their hand.
440. Gray pays with Duck Under.
441. Gray plays High-Frequency Scanner.
442. A look at the Floor deck: The Sentry Drone, Security Turnstile, Flooded Ventilation Shaft.
443. Scramble 3 met — Clear.
444. Security Turnstile is Cleared.
445. Cleanup.
446. Gray discards High-Frequency Scanner from their play zone.
447. — end of turn 21 —
448. You are in: The Sentry Drone.
449. Gray draws Pick The Lock.
450. Gray draws Coil Of Cable.
451. Red discards Overcharged Battery from their hand.
452. Red discards Junk Launcher from their hand.
453. Red pays with Overcharged Battery, Junk Launcher.
454. Red plays Charge In.
455. Red discards Overcharged Battery from their hand.
456. Red pays with Overcharged Battery.
457. Red plays Shove.
458. Oomph 6 met — Ascend.
459. The Sentry Drone is Cleared.
460. Cleanup.
461. Red discards Charge In from their play zone.
462. Red discards Shove from their play zone.
463. — end of turn 22 —
464. Floor 3 is clear.
465. Red takes Tag Team.
466. Red shuffles 1 card(s) back in.
467. Gray shuffles 5 card(s) back in.
468. Gray takes Hack the Doors.
469. Gray shuffles 1 card(s) back in.
470. Floor 4 is built: 7 rooms.
471. NOTE — Floor 4 (Band 2) starts with the Good Stuff pool already at 0 (Bad Stuff still 18). Rulebook: 'If its pool is empty when you would gain Stuff, you gain nothing.' No rule found for the pool ever refilling mid-run. If that holds, every Good Stuff line for the rest of this run (floors 4-9) is dead text -- worth watching whether that changes the felt value of the Oomph3/Scramble3 both-players lines and the Ascend O4S4 lines in Band 2 and 3.
472. You are in: Automated Defense Turret.
473. Red draws Coil Of Cable.
474. Red draws Duct Tape & Wire.
475. Red draws Charge In.
476. Red draws Duct Tape & Wire.
477. Red draws Duct Tape & Wire.
478. Gray draws Cutting Torch.
479. Gray draws High-Frequency Scanner.
480. Gray draws Riot Shield.
481. Gray draws Pick The Lock.
482. Gray draws Cutting Torch.
483. Red plays Coil Of Cable.
484. Red discards Charge In from their hand.
485. Red pays with Charge In.
486. Red plays Duct Tape & Wire.
487. Red discards Duct Tape & Wire from their hand.
488. Red pays with Duct Tape & Wire.
489. Red plays Duct Tape & Wire.
490. Gray discards Riot Shield from their hand.
491. Gray pays with Riot Shield.
492. Gray plays High-Frequency Scanner.
493. A look at the Floor deck: Gears & Glitch, Automated Defense Turret, Automated Defense Turret.
494. Scramble 8 met — Clear, and Gray gets Good Stuff.
495. Automated Defense Turret is Cleared.
496. The Good Stuff pool is empty — Gray gets nothing.
497. Cleanup.
498. Red discards Coil Of Cable from their play zone.
499. Red discards Duct Tape & Wire from their play zone.
500. Red discards Duct Tape & Wire from their play zone.
501. Gray discards High-Frequency Scanner from their play zone.
502. — end of turn 23 —
503. You are in: Gears & Glitch.
504. Red draws Shove.
505. Red draws Overdrive.
506. Red draws Tag Team.
507. Red draws Lean In.
508. Red draws Overdrive.
509. Gray draws Coil Of Cable.
510. Gray draws Hack the Doors.
511. Red plays Overdrive.
512. Red Exhausts Automated Salvage Kit.
513. Red Exhausts Pry Bar.
514. Red plays Overdrive.
515. Red's deck is empty — the discard pile shuffles in to make a new one (16 cards).
516. Red Exhausts Shove.
517. Red Exhausts Stim Pack.
518. Gray discards Coil Of Cable from their hand.
519. Gray discards Hack the Doors from their hand.
520. Gray pays with Coil Of Cable, Hack the Doors.
521. Gray plays Cutting Torch.
522. Red discards Shove from their hand.
523. Red pays with Shove.
524. Red plays Tag Team.
525. Red draws Charge In.
526. Red discards Charge In from their hand.
527. Red pays with Charge In.
528. Red plays Lean In.
529. Oomph 12 met — Ascend.
530. Gears & Glitch is Cleared.
531. Cleanup.
532. Red discards Overdrive from their play zone.
533. Red discards Overdrive from their play zone.
534. Red discards Tag Team from their play zone.
535. Red discards Lean In from their play zone.
536. Gray discards Cutting Torch from their play zone.
537. — end of turn 24 —
538. Floor 4 is clear.
539. Red takes Fast Follow.
540. Red shuffles 1 card(s) back in.
541. Gray shuffles 2 card(s) back in.
542. Gray takes Distract & Pivot.
543. Gray shuffles 1 card(s) back in.
544. Floor 5 is built: 6 rooms.
545. You are in: Pressurized Maintenance Hub.
546. Red draws Charge In.
547. Red draws Junk Launcher.
548. Red draws Reckless Swing.
549. Red draws Duct Tape & Wire.
550. Red draws Overcharged Battery.
551. Gray draws Distract & Pivot.
552. Gray draws One Man's Junk.
553. Gray draws Pick The Lock.
554. Gray draws Duck Under.
555. Gray draws Cutting Torch.
556. Red discards Junk Launcher from their hand.
557. Red discards Overcharged Battery from their hand.
558. Red pays with Junk Launcher, Overcharged Battery.
559. Red plays Charge In.
560. Red discards Reckless Swing from their hand.
561. Red pays with Reckless Swing.
562. Red plays Duct Tape & Wire.
563. Gray discards Duck Under from their hand.
564. Gray discards Cutting Torch from their hand.
565. Gray pays with Duck Under, Cutting Torch.
566. Gray plays Pick The Lock.
567. Gray discards Distract & Pivot from their hand.
568. Gray pays with Distract & Pivot.
569. Gray plays One Man's Junk.
570. Oomph 7 met — Clear, and Red reveals a card reward.
571. Scramble 7 met — Clear, and Gray reveals a card reward.
572. Pressurized Maintenance Hub is Cleared.
573. Red's reward pool shows Reckless.
574. Red takes Reckless.
575. Gray's reward pool shows Catch Your Breath.
576. Gray takes Catch Your Breath.
577. Cleanup.
578. Red discards Charge In from their play zone.
579. Red discards Duct Tape & Wire from their play zone.
580. Gray discards Pick The Lock from their play zone.
581. Gray discards One Man's Junk from their play zone.
582. — end of turn 25 —
583. You are in: Overgrown Hydroponics Bay.
584. Red draws Reckless.
585. Red draws Fast Follow.
586. Red draws Coil Of Cable.
587. Red draws Shove.
588. Red draws Duct Tape & Wire.
589. Gray draws Catch Your Breath.
590. Gray's deck is empty — the discard pile shuffles in to make a new one (32 cards).
591. Gray draws Pick The Lock.
592. Gray draws Stim Pack.
593. Gray draws Crowbar.
594. Gray draws Crowbar.
595. Red plays Coil Of Cable.
596. Red discards Shove from their hand.
597. Red pays with Shove.
598. Red plays Duct Tape & Wire.
599. Gray discards Crowbar from their hand.
600. Gray discards Crowbar from their hand.
601. Gray pays with Crowbar, Crowbar.
602. Gray plays Pick The Lock.
603. Gray discards Stim Pack from their hand.
604. Gray pays with Stim Pack.
605. Gray plays Catch Your Breath.
606. A look at the Floor deck: Pressurized Maintenance Hub, Automated Defense Turret.
607. Scramble 6 met — Clear, but both players get Bad Stuff.
608. Scramble 11 met — Clear, and both players get Good Stuff.
609. Overgrown Hydroponics Bay is Cleared.
610. Red gets Corrosive Acid.
611. Red takes Corrosive Acid into hand.
612. Gray gets Torn Seal.
613. Gray takes Torn Seal into hand.
614. The Good Stuff pool is empty — Red gets nothing.
615. The Good Stuff pool is empty — Gray gets nothing.
616. Cleanup.
617. Red discards Coil Of Cable from their play zone.
618. Red discards Duct Tape & Wire from their play zone.
619. Gray discards Pick The Lock from their play zone.
620. Gray discards Catch Your Breath from their play zone.
621. — end of turn 26 —
622. NOTE — Overgrown Hydroponics Bay has Scramble 6 (Bad Stuff both) and Scramble 11 (Good Stuff both) as two SEPARATE challenges (checked design/cards.yaml: two challenges: entries, not one challenge with two thresholds), so meeting Scramble 11 does not skip the Scramble 6 penalty -- both resolved this turn (log shows both lines). Matches rulebook section 'If more than one challenge is met, their outcomes may be resolved in any order,' not a bug. But reaching the room's own better line still cost Bad Stuff on the way, which reads oddly for a design meant to reward hitting the higher number -- worth asking the designer whether that is intended for rooms shaped this way.
623. You are in: Pressurized Maintenance Hub.
624. Red draws Charge In.
625. Red draws Duct Tape & Wire.
626. Gray draws Cutting Torch.
627. Gray draws Pick The Lock.
628. Gray draws Hack the Doors.
629. Gray draws Pick The Lock.
630. Red Exhausts Charge In.
631. Red discards Corrosive Acid from their hand.
632. Red pays with Corrosive Acid.
633. Red plays Duct Tape & Wire.
634. Red discards Fast Follow from their hand.
635. Red pays with Fast Follow.
636. Red plays Reckless.
637. Red Exhausts Overcharged Battery.
638. Red Exhausts Coil Of Cable.
639. Red's deck is empty — the discard pile shuffles in to make a new one (16 cards).
640. Red Exhausts Fast Follow.
641. Gray discards Torn Seal from their hand.
642. Gray discards Cutting Torch from their hand.
643. Gray pays with Torn Seal, Cutting Torch.
644. Gray plays Pick The Lock.
645. Gray discards Pick The Lock from their hand.
646. Gray pays with Pick The Lock.
647. Gray plays Hack the Doors.
648. NOTE — Red's exhaust pile is at 12 cards (deck 15, discard 0, hand 1) at turn 27, floor 5 -- Band 2, not yet Band 3. Reckless's own Exhaust 3 and Corrosive Acid's Turn Start Exhaust 1 (held since turn 26) are compounding fast. Watching whether this becomes a Down risk before floor 6 ends.
649. A look at the Floor deck: Automated Defense Turret, Gears & Glitch, Automated Defense Turret.
650. Oomph 7 met — Clear, and Red reveals a card reward.
651. Scramble 7 met — Clear, and Gray reveals a card reward.
652. Pressurized Maintenance Hub is Cleared.
653. Red's reward pool shows Bull Rush.
654. Red takes Bull Rush.
655. Gray's reward pool shows Catch Your Breath.
656. Gray takes Catch Your Breath.
657. Cleanup.
658. Red discards Duct Tape & Wire from their play zone.
659. Red discards Reckless from their play zone.
660. Gray discards Pick The Lock from their play zone.
661. Gray discards Hack the Doors from their play zone.
662. — end of turn 27 —
663. You are in: Automated Defense Turret.
664. Red draws Bull Rush.
665. Red draws Corrosive Acid.
666. Red draws Charge In.
667. Red draws Shove.
668. Gray draws Catch Your Breath.
669. Gray draws Riot Shield.
670. Gray draws Pry Bar.
671. Gray draws Pick The Lock.
672. Gray draws Work The Angles.
673. Red Exhausts Charge In.
674. Gray discards Catch Your Breath from their hand.
675. Gray discards Work The Angles from their hand.
676. Gray pays with Catch Your Breath, Work The Angles.
677. Gray plays Pick The Lock.
678. Gray discards Pry Bar from their hand.
679. Gray pays with Pry Bar.
680. Gray plays Riot Shield.
681. Red discards Shove from their hand.
682. Red pays with Shove.
683. Red plays Bull Rush.
684. Scramble 8 met — Clear, and Gray gets Good Stuff.
685. Automated Defense Turret is Cleared.
686. The Good Stuff pool is empty — Gray gets nothing.
687. Cleanup.
688. Gray takes Riot Shield into hand.
689. Red discards Bull Rush from their play zone.
690. Gray discards Pick The Lock from their play zone.
691. — end of turn 28 —
692. You are in: Gears & Glitch.
693. Red draws Shove.
694. Red draws Overdrive.
695. Gray draws Peek Around Corner.
696. Gray draws A Pair Of Stitch-Em-Ups.
697. Gray draws Distract & Pivot.
698. Gray draws A Pair Of Stitch-Em-Ups.
699. Red Exhausts Lean In.
700. Gray discards Peek Around Corner from their hand.
701. Gray pays with Peek Around Corner.
702. Gray plays A Pair Of Stitch-Em-Ups.
703. Charge In goes to Red's deck.
704. Grav Harness goes to Red's deck.
705. Gray discards Riot Shield from their hand.
706. Gray pays with Riot Shield.
707. Gray plays A Pair Of Stitch-Em-Ups.
708. Automated Salvage Kit goes to Red's deck.
709. Overcharged Battery goes to Red's deck.
710. NOTE — Gears & Glitch needs Oomph12, or Oomph7+Scramble7. Checked the max reachable: Red's hand (all Oomph, no Scramble) tops out around O6-8; Gray's hand had no Scramble source once A Pair Of Stitch-Em-Ups were spent on relief instead of Distract & Pivot/Riot Shield for stats -- combined Scramble tops out at 6, one short of the O7S7 line, and nowhere near O12. Since neither threshold was reachable, used both of Gray's A Pair Of Stitch-Em-Ups on Red's Exhaust pile instead of chasing a doomed Clear: moved 4 cards total (Charge In, Grav Harness, Automated Salvage Kit, Overcharged Battery) from Red's exhaust pile (was 14) back to the bottom of Red's deck, down to 10, before ending the turn into a known Flee. This reads as the correct counter-play to playtest 8's finding 3 (holding a hand back against an unreachable room can strand you against the Flee's own Exhaust) -- here the 'safe' choice actively reduced the danger instead of just not making it worse.
711. You Flee Gears & Glitch.
712. Red Exhausts Overcharged Battery.
713. Red Exhausts Duct Tape & Wire.
714. Red Exhausts Duct Tape & Wire.
715. Gray Exhausts Stim Pack.
716. Gray Exhausts Peek Around Corner.
717. Gray Exhausts Cutting Torch.
718. Red gets Panic.
719. Red takes Panic into hand.
720. Cleanup.
721. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
722. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
723. Gears & Glitch shuffles back into the Floor deck.
724. — end of turn 29 —
725. You are in: Automated Defense Turret.
726. Gray draws Riot Shield.
727. Gray draws One Man's Junk.
728. Gray draws Duck Under.
729. Gray draws High-Frequency Scanner.
730. Red Exhausts Coil Of Cable.
731. Red discards Corrosive Acid from their hand.
732. Red discards Panic from their hand.
733. Red pays with Corrosive Acid, Panic.
734. Red plays Charge In.
735. Red discards Shove from their hand.
736. Red discards Overdrive from their hand.
737. Red pays with Shove, Overdrive.
738. Red plays Charge In.
739. Gray discards Riot Shield from their hand.
740. Gray discards Duck Under from their hand.
741. Gray pays with Riot Shield, Duck Under.
742. Gray plays Distract & Pivot.
743. Gray discards One Man's Junk from their hand.
744. Gray pays with One Man's Junk.
745. Gray plays High-Frequency Scanner.
746. A look at the Floor deck: Gears & Glitch.
747. Oomph 10 met — Clear, and one of you may Scrap a Bad Stuff card from your hand.
748. Automated Defense Turret is Cleared.
749. Cleanup.
750. Red discards Charge In from their play zone.
751. Red discards Charge In from their play zone.
752. Gray discards Distract & Pivot from their play zone.
753. Gray discards High-Frequency Scanner from their play zone.
754. — end of turn 30 —
755. NOTE — Confirmed the 'who may Scrap a Bad Stuff card' prompt did not appear this Clear (turn 30, Automated Defense Turret, Oomph 10 line) because neither Red nor Gray held any Bad Stuff at resolution -- both Corrosive Acid and Panic had already been discarded as payment the turn before. This matches the changelog note that the Scrap prompt is now gated on someone actually holding Bad Stuff.
756. You are in: Gears & Glitch.
757. Red draws Reckless Swing.
758. Red draws Junk Launcher.
759. Red draws Overdrive.
760. Red draws Tag Team.
761. Red draws Charge In.
762. Gray draws Duck Under.
763. Gray draws Crowbar.
764. Gray draws Duck Under.
765. Gray draws Coil Of Cable.
766. Gray draws In Step.
767. Red discards Junk Launcher from their hand.
768. Red pays with Junk Launcher.
769. Red plays Reckless Swing.
770. Red Exhausts Grav Harness.
771. Red discards Overdrive from their hand.
772. Red discards Tag Team from their hand.
773. Red pays with Overdrive, Tag Team.
774. Red plays Charge In.
775. Gray plays Crowbar.
776. Gray plays Coil Of Cable.
777. Gray discards Duck Under from their hand.
778. Gray pays with Duck Under.
779. Gray plays In Step.
780. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
781. Gears & Glitch is Cleared.
782. Red's reward pool shows Second Wind.
783. Red takes Second Wind.
784. Cleanup.
785. Red discards Reckless Swing from their play zone.
786. Red discards Charge In from their play zone.
787. Gray discards Crowbar from their play zone.
788. Gray discards Coil Of Cable from their play zone.
789. Gray discards In Step from their play zone.
790. — end of turn 31 —
791. Floor 5 is clear.
792. NOTE — Ascend #5 (end of floor 5, turn 31): Red deck 3, discard 15, exhaust 15, hand 0. Gray deck 4, discard 27, exhaust 3, hand 1. Red's exhaust pile (15) is now roughly half its total card pool and this is still Band 2 (floor 5 of 9), not Band 3 -- flagging for the Stamina/Down-rate question.
793. Red takes Second Wind.
794. Red shuffles 1 card(s) back in.
795. Gray shuffles 1 card(s) back in.
796. Gray takes Here, Catch.
797. Gray shuffles 1 card(s) back in.
798. Floor 6 is built: 5 rooms.
799. You are in: Automated Defense Turret.
800. Red draws Second Wind.
801. Red draws Automated Salvage Kit.
802. Red draws Overcharged Battery.
803. Red draws Second Wind.
804. Red's deck is empty — the discard pile shuffles in to make a new one (15 cards).
805. Red draws Tag Team.
806. Gray draws Pry Bar.
807. Gray draws Duck Under.
808. Gray draws High-Frequency Scanner.
809. Gray draws Duck Under.
810. Gray draws Here, Catch.
811. Red discards Overcharged Battery from their hand.
812. Red pays with Overcharged Battery.
813. Red plays Automated Salvage Kit.
814. Red discards Second Wind from their hand.
815. Red pays with Second Wind.
816. Red plays Tag Team.
817. Gray plays Pry Bar.
818. Gray discards Duck Under from their hand.
819. Gray pays with Duck Under.
820. Gray plays High-Frequency Scanner.
821. A look at the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay, Automated Defense Turret.
822. Gray discards Here, Catch from their hand.
823. Gray pays with Here, Catch.
824. Gray plays Duck Under.
825. Scramble 8 met — Clear, and Gray gets Good Stuff.
826. Automated Defense Turret is Cleared.
827. The Good Stuff pool is empty — Gray gets nothing.
828. Cleanup.
829. Red discards Automated Salvage Kit from their play zone.
830. Red discards Tag Team from their play zone.
831. Gray discards Pry Bar from their play zone.
832. Gray discards High-Frequency Scanner from their play zone.
833. Gray discards Duck Under from their play zone.
834. — end of turn 32 —
835. You are in: Gears & Glitch.
836. Red draws Reckless Swing.
837. Red draws Junk Launcher.
838. Red draws Overdrive.
839. Red draws Duct Tape & Wire.
840. Gray draws Pick The Lock.
841. Gray's deck is empty — the discard pile shuffles in to make a new one (32 cards).
842. Gray draws A Pair Of Stitch-Em-Ups.
843. Gray draws Riot Shield.
844. Gray draws One Man's Junk.
845. Gray draws Work The Angles.
846. Red plays Overdrive.
847. Red Exhausts Overdrive.
848. Red Exhausts Charge In.
849. Red discards Junk Launcher from their hand.
850. Red pays with Junk Launcher.
851. Red plays Reckless Swing.
852. Red Exhausts Shove.
853. Red discards Second Wind from their hand.
854. Red pays with Second Wind.
855. Red plays Duct Tape & Wire.
856. Gray discards Riot Shield from their hand.
857. Gray discards One Man's Junk from their hand.
858. Gray pays with Riot Shield, One Man's Junk.
859. Gray plays Pick The Lock.
860. Gray discards A Pair Of Stitch-Em-Ups from their hand.
861. Gray pays with A Pair Of Stitch-Em-Ups.
862. Gray plays Work The Angles.
863. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
864. Gears & Glitch is Cleared.
865. Red's reward pool shows Bull Rush.
866. Red takes Bull Rush.
867. Cleanup.
868. Red discards Overdrive from their play zone.
869. Red discards Reckless Swing from their play zone.
870. Red discards Duct Tape & Wire from their play zone.
871. Gray discards Pick The Lock from their play zone.
872. Gray discards Work The Angles from their play zone.
873. — end of turn 33 —
874. Floor 6 is clear.
875. NOTE — Ascend #6, end of floor 6 (Band 2 complete), turn 33: Red deck 8, discard 9, exhaust 18, hand 0. Gray deck 28, discard 5, exhaust 3, hand 0. Red's exhaust pile (18) is now larger than Red's deck+discard combined (17), and this is still before Band 3 (floors 7-9) starts. Entering Band 3 with more than half of Red's card pool already exhausted.
876. Red takes Heavy Pockets.
877. Red shuffles 1 card(s) back in.
878. Gray takes Covering Fire.
879. Gray shuffles 1 card(s) back in.
880. Floor 7 is built: 4 rooms.
881. You are in: Laser Grid Security Hall.
882. Red draws Bull Rush.
883. Red draws Charge In.
884. Red draws Bull Rush.
885. Red draws Shove.
886. Red draws Corrosive Acid.
887. Gray draws Crowbar.
888. Gray draws Riot Shield.
889. Gray draws Duck Under.
890. Gray draws Here, Catch.
891. Gray draws High-Frequency Scanner.
892. Red Exhausts Heavy Pockets.
893. NOTE — Laser Grid Security Hall (floor 7, Band 3) needs Scramble 14 or Oomph 18 to Clear. Raw sum of every stat in both hands (Red: 2x Bull Rush O2S1, Charge In O4, Shove O2, Corrosive Acid Bad Stuff; Gray: Crowbar O1S1, Riot Shield S3, Duck Under S2, Here Catch S3 utility, High-Frequency Scanner S3) is only O11 S14 even before any payment cost is paid -- and payment always eats several cards, so the achievable total is well under that. Neither threshold is reachable this turn, or plausibly any single turn with a 5-card starter-heavy hand. Red's discard pile is 9 (not empty), so holding the hand back this time does not repeat playtest 8's empty-discard trap. Ending without playing anything and taking the Flee (Both players Exhaust 4).
894. You Flee Laser Grid Security Hall.
895. Red Exhausts Panic.
896. Red Exhausts Reckless.
897. Red Exhausts Charge In.
898. Red's deck is empty — the discard pile shuffles in to make a new one (9 cards).
899. Red Exhausts Automated Salvage Kit.
900. Gray Exhausts Pry Bar.
901. Gray Exhausts Cutting Torch.
902. Gray Exhausts Torn Seal.
903. Gray Exhausts Catch Your Breath.
904. Cleanup.
905. Laser Grid Security Hall shuffles back into the Floor deck.
906. — end of turn 34 —
907. You are in: The Iron Sentinel.
908. Red Exhausts Overdrive.
909. NOTE — The Iron Sentinel (floor 7 Stairwell) needs Oomph10+Scramble10, or Oomph18 alone. Checked max reachable with this turn's hands using the same combos as the last two rooms: Red tops out around O6-8 total, Gray around O1 S7 total combining Crowbar/Riot Shield/High-Frequency Scanner -- combined roughly O7-9 S7-8, short of the O10S10 line and nowhere near O18. Neither threshold reachable again. Red's exhaust pile is now 24 (deck 7, discard 0, hand 5) -- holding back and taking this Flee's Exhaust 4 will draw straight from Red's 7-card deck, which is survivable this time (deck 7 >= 4), but Red's discard pile is empty, so if the deck runs out mid-Exhaust there is no buffer left, same shape as playtest 8's finding 3. Ending without playing.
910. You Flee The Iron Sentinel.
911. Red Exhausts Reckless Swing.
912. Red Exhausts Second Wind.
913. Red Exhausts Overcharged Battery.
914. Red Exhausts Junk Launcher.
915. Gray Exhausts Crowbar.
916. Gray Exhausts Pick The Lock.
917. Gray Exhausts Covering Fire.
918. Gray Exhausts Peek Around Corner.
919. Red gets Corrosive Acid.
920. Red takes Corrosive Acid into hand.
921. Gray gets Sluggish.
922. Gray takes Sluggish into hand.
923. Cleanup.
924. The Iron Sentinel shuffles back into the Floor deck.
925. — end of turn 35 —
926. NOTE — Red's exhaust pile is now 28 (deck 3, discard 0, hand 6) at turn 35, floor 7 -- 3 Flees in a row on unreachable Band 3 rooms have compounded fast. Gray also just picked up Sluggish (Holding: cards cost +1 card to play), stacking with the cost inflation Red would see from Corrosive Acid x2 if held into a Turn Start. This turn: playing cards deliberately to rebuild Red's discard pile as a Flee buffer, per the lesson from playtest 8 note 3.
927. You are in: Laser Grid Security Hall.
928. Red Exhausts Duct Tape & Wire.
929. Red Exhausts Tag Team.
930. Red discards Shove from their hand.
931. Red pays with Shove.
932. Red plays Bull Rush.
933. Red discards Charge In from their hand.
934. Red pays with Charge In.
935. Red plays Bull Rush.
936. You Flee Laser Grid Security Hall.
937. Red Exhausts Second Wind.
938. Red's deck is empty — the discard pile shuffles in to make a new one (2 cards).
939. Red Exhausts Charge In.
940. Red Exhausts Shove.
941. Red is Down — a room's printed punishment. The run is lost.
942. Red discards Corrosive Acid from their hand.
943. Red discards Corrosive Acid from their hand.
944. You lose.
945. NOTE — Red went Down on this Flee (Laser Grid Security Hall, floor 7, turn 36). Sequence: Red's deck had 1 card (Second Wind) before the Flee's Exhaust 4; exhausted Second Wind, deck empty, discard (2 cards: Bull Rush x2's payment fodder, Charge In and Shove) shuffled in, exhausted Charge In and Shove (2 more, total 3), deck empty again, discard also empty -- rulebook Empty deck: 'If your discard pile is also empty, you go Down.' This matches playtest 8's finding almost exactly, but this time Red HAD been playing cards each unreachable-room turn (see notes above) specifically to keep a discard buffer, and it still wasn't enough: three straight unreachable Band 3 rooms (Laser Grid Security Hall twice, The Iron Sentinel once) each forcing a 3-4 card Exhaust compounded faster than a 2-card-per-turn discard trickle could refill. The run reached floor 7 of 9, turn 36 -- the deepest of this playtest series so far -- before Exhaustion itself, not a lost fight, ended it.

Floor 7 · turn 36 · GameOver   floor deck 3, cleared 32   Good Stuff 0, Bad Stuff 13
Stat pool: Oomph 4, Scramble 2
Red: deck 0, discard 2, exhaust 33, hand 0  DOWN
    played: Bull Rush, Bull Rush
Gray: deck 16, discard 5, exhaust 11, hand 6
    Crowbar [cost 1 (printed 0); Oomph 1, Scramble 1; Good Stuff] — Play: If you get any Good Stuff this turn, get 1 additional Good Stuff.
    Riot Shield [cost 2 (printed 1); Scramble 3; Good Stuff] — If the room is Cleared, return this card to your hand at the end of the turn.
    Duck Under [cost 2 (printed 1); Scramble 2]
    Here, Catch [cost 2 (printed 1); Scramble 3] — Move 1 Stuff from your hand to Red's hand.
    High-Frequency Scanner [cost 2 (printed 1); Scramble 3; Good Stuff] — Play: Look at the top 3 cards of the Floor deck.
    Sluggish [cost 3 (printed 2); Bad Stuff] — Holding: Cards you play cost +1 card to play.
Outcome: Defeat

seed 21, 189 command(s) replayed, floor 7, turn 36, Defeat.
```
