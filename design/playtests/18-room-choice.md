# Playtest 18: Room choice on flip

Recorded 2026-10-19. Kit revision R35.C58-v1, the second commit for issue #276: on top of playtest
13's five floors of six cards, Turn Start reveals the top 3 rooms (or all that remain), the players
enter one and put the rest on the bottom in an order they choose, the Stairwell may be passed over
until it is the last card, and a Fled room goes to the bottom of the floor deck. Played by an agent
standing in for a human playtester, in the CLI (`bin/nvu`), one shell call per decision, on the same
seeds as playtest 17: 10 and 12. Two runs, one note.

Notes are the agents', verbatim, tagged `[agent]`, with their log line from `bin/nvu replay`.
Nothing here is a ruling. Suspected bugs were checked against `rulebook.md` and `cards.yaml` only;
the engine was not read. The greedy sim is not used as evidence.

## Results

| Seed | Outcome | Turns | Turns per floor | Flees per floor (1/2/3/4/5) | Stairwell passed over |
|---|---|---|---|---|---|
| 10 | Victory | 23 | 4, 6, 3, 5, 5 | 1 / 0 / 0 / 0 / 2 | 8 times |
| 12 | Victory | 23 | 6, 6, 5, 5, 1 | 0 / 0 / 0 / 0 / 0 | 13 times |

Compared with playtest 17 on the same seeds (seed 10 won in 19 turns with no Flee, seed 12 lost on
floor 1 in 6 turns with 2 Flees) and the 10-floor baseline (29 and 35 turns per win):

- **Turns per win.** Both seeds won, in 23 turns each: 79% of seed 10's 29 and 66% of seed 12's 35.
  The issue's target is near half. Room choice made floors longer than playtest 17's, because the
  players clear the Rooms for their rewards and fight the Stairwell last.
- **Flees.** Three in two runs. Only one came before floor 5, and it was a misplay (seed 10, note on
  floor 1). The two floor-5 Flees were on The Monolith Core, one Oomph short, and a Laser Grid Fled on
  purpose to keep a winning hand. The issue's target of at least one Flee before floor 5 is not met.
- **The Stairwell is a timing choice.** Both agents passed it over until a held hand guaranteed the
  kill. With the Exhaust pile refunded at every Ascend, floors 1 to 4 carried no stamina pressure.
  Seed 12 ended floor 5 on its first turn by entering The Monolith Core from the first reveal.
- **The choice comes before the draw.** On a floor's first turn it is blind. Both agents named this.

The two write-ups follow as the agents wrote them.

## Run: Seed 10, room choice (R35)

Recorded 2026-10-19. Kit revision `R35.C58-v1`. Played by an agent standing in for a human
playtester, in the CLI (`bin/nvu`), seed 10, one shell call per decision, run file
`design/playtests/18-room-choice-seed-10.json`. The run ended in **Victory** on turn 23, when The
Monolith Core fell to Oomph 16 / Scramble 10 on the second try.

Notes are the agent's, quoted as written into the run, tagged `[agent]`. Nothing here is a ruling.
Suspected bugs were checked against `rulebook.md` and `cards.yaml` only; the engine was not read.

Turns per floor: floor 1 turns 1-4 (4), floor 2 turns 5-10 (6), floor 3 turns 11-13 (3), floor 4
turns 14-18 (5), floor 5 turns 19-23 (5). Flees: floor 1 one (Flooded Ventilation Shaft, my
error), floor 5 two (The Monolith Core, then Laser Grid Security Hall on purpose), none on floors
2-4. I passed over a revealed Stairwell 8 times (1, 2, 1, 3, 1 by floor).

### How the run went

Floors 1 and 2 hold only two Room kinds (Security Turnstile and Flooded Ventilation Shaft), so the
room choice there was "cheap double reward, single reward, or boss now". I took the Shaft whenever
it showed and passed the Sentry Drone until a held hand could kill it. On floor 1 I miscast a
chained move and Fled the second Shaft (note 3); undo could not take it back. I then counted
Red's deck down to Charge, Overdrive, Overdrive and killed the Drone on turn 4 with Oomph 8. Floor
2 went clean in six turns: two Shafts, three Turnstiles, Drone last. I held Overdrive x2 and Cross
Punch in Red's hand for three turns as a banked boss kill while farming (note 8). Gray reached
"live 2" on turn 9 and I stopped short of a second reward rather than test the Down rule (note 9).

Floors 3 and 4 have no card-reward Rooms except the Pressurized Maintenance Hub, so on floor 3 I
took one Turret for Good Stuff and Scrap, then the boss as soon as the hand met both Gears &
Glitch challenges (turn 13). Floor 4 showed both Hubs, so I passed Gears & Glitch three times to
take two Hubs and two Turrets, picking up Zen Mode, Tag Team, Synergy Link and Pivot.

Floor 5 is where the room choice mattered. The choice comes before the draw, so on a fresh floor I
entered Smoldering Armory blind, then found the drawn hand would likely have beaten the Monolith
(note 18). On turn 21 the Monolith came up with a strong held hand and I entered it, but the hand
was one Oomph short with no payment cards left for Red; I Fled for Exhaust 5 each (note 20). I
miscounted the Floor deck and the Monolith did not come back the next flip (note 21). The hand
drawn on turn 22 beat the Monolith, so I entered Laser Grid, played nothing and Fled for Exhaust 4
each to bank that hand (note 22). Turn 23 showed the Monolith and the banked hand won with room to
spare.

### Notes

1. **Reward reveals show names only.** `[agent]` (log 27)

   > Reward reveal lists names only. Had to run bin/nvu card for each to see cost and text. Taking Momentum Shift: cost 1 Oomph 4 beats Charge.

   CLI friction, see below.

2. **Passing the Stairwell to farm.** `[agent]` (log 39)

   > Room choice: Sentry Drone (Oomph 8 or Scramble 8) showed on turn 2. Passing it: no card can reach 8 alone yet, and exhaust resets on Ascend, so farming rewards on this floor first looks right. Entering the second Flooded Ventilation Shaft (cheapest double reward).

   Rulebook 10, Ascending: "Shuffle ALL your cards into your deck, including your hand, discard
   pile, AND exhaust pile." Exhaust is a per-floor budget. With room choice, the right play on
   every floor was to spend that budget on reward rooms and fight the Stairwell last or when a
   held hand guarantees it. Question for the designer: is the Stairwell meant to be this easy to
   defer? On floors 1-4 I never fought it before I chose to.

3. **Chained move refused, then a Flee I did not intend.** `[agent]` (log 64)

   > My error: I chained moves and 'card Red Shove pay Shove' was refused (only one Shove left after Lean In paid with the other). The chained 'end' then Fled the room with Oomph 1 Scramble 3. undo refused: 'the last move revealed a card'. Wish: end should warn when no challenge is met, since Flee is costly. Gray now at exhaust 5, live 8.

   The refusal was correct. The cost came from `end` resolving a Flee with no confirmation.

4. **Spending Red's budget for a reward.** `[agent]` (log 79)

   > Spending 3 Red exhaust on Turnstile Oomph 5 for a Red reward, Gray holds. Red's remaining deck must be Charge, Overdrive, Overdrive, so next turn the Sentry Drone at Oomph 8 is reachable. 'live 6' mid-turn leaves out the 2 played cards; reads like I lost them.

   The deck count worked out exactly. The `live` number excludes the play zone mid-turn and
   returns after Cleanup.

5. **Floor 1 summary.** `[agent]` (log 129)

   > Floor 1 cleared turn 4. Room choice let me hold the Stairwell until I could count Red's deck down to Charge, Overdrive, Overdrive. Ascend fully heals, so exhaust is a per-floor budget: spend it on rewards, keep enough for the boss. 'Red shuffles 13 cards back in' while Red now has 15: unclear what 13 counts.

   Red had 13 starters plus Momentum Shift and Cross Punch taken this floor, and 15 after the
   Ascend. The "13" line likely counts something narrower (perhaps cards not already in the deck),
   but the CLI does not say. Question for the designer, not a rule issue.

6. **Two Room kinds on floors 1-2.** `[agent]` (log 132)

   > cards.yaml: Floors 1-2 draw from only two Room kinds (Security Turnstile x14, Flooded Ventilation Shaft x10). The room choice on these floors is really FVS vs Turnstile vs boss-now.

   Both floors were 2 Shafts, 3 Turnstiles and the Drone. Choosing among 3 revealed cards often
   meant choosing among 3 copies of one card (turns 3, 7).

7. **Peek on the Floor deck offers no discard.** `[agent]` (log 181)

   > Peek 1 on the Floor deck showed Security Turnstile and moved on. Rulebook Peek: 'Discard any number of them, then put the rest back in any order.' No discard choice was offered. Did the engine skip it for the Floor deck on purpose? And what would discarding a Room (or the Stairwell) even mean? Rulebook gap.

   See note 14: the discard step was missing on every pile I tried. Rulebook, Keywords, Peek:
   "Reveal the top X cards of ANY face-down pile. Discard any number of them, then put the rest
   back in any order." Suspected engine mismatch. Separately a rulebook question: where does a
   discarded Room, Stairwell or Stuff card go?

8. **Banking a boss kill in hand.** `[agent]` (log 244)

   > Passing the Sentry Drone again with a sure kill in hand (Overdrive x2 + Cross Punch). Greedy for one more Turnstile while the boss hand is held; held cards stay in hand so the boss kill keeps.

   Unspent cards stay in hand (About the game: "Cards you don't spend stay in your hand"). With
   room choice this turns a good hand into a deferred, guaranteed boss kill.

9. **Down while cards sit in the play zone.** `[agent]` (log 306)

   > Gray shows live 2 (deck 0, discard 0, hand 2) with 4 cards in the play zone. Hit 'n Run paying with Peek would reach Scramble 6, but would leave Gray with nothing in hand, deck or discard until Hit 'n Run's effect lands. Rulebook 9: 'If one player has no cards in their hand, deck, or discard pile, you go Down.' Do play-zone cards count? Is Down checked mid-play? Not risking it: stopping at Oomph 5 only. The 'live' number made this look scarier than it is, but I can't tell from the rulebook.

   Rulebook gap. Section 9 lists hand, deck and discard only; play zone and timing are not
   covered. It cost me a Gray card reward here.

10. **Floor 2 summary and challenge grouping.** `[agent]` (log 355)

    > Floor 2 cleared turn 10, no Flees. The Sentry auto-entered when it was the last card. Room lines in the CLI do not show which thresholds share a challenge; I had to read cards.yaml to learn Gears & Glitch's two lines are two challenges.

    Rulebook Turn Start 2: "If only one card is revealed, you must enter it." Matches. The
    grouping matters because of Outcome: "resolve the outcome of one threshold: of the thresholds
    met in that challenge, the one printed furthest down the card." Smoldering Armory (one
    challenge) paid only Oomph 16 when I met 10 and 16; Gears & Glitch (two challenges) paid both.
    Both matched the yaml.

11. **Scrap at Outcome misses the cards just played.** `[agent]` (log 403)

    > Turret Scrap: Gray's only option was the Pry Bar just gained, because all 5 played cards sit in the play zone until Cleanup and the discard was empty after a reshuffle. Scrap 'from your hand or discard pile' at Outcome mostly misses the cards you just used. Intended?

    Consistent with the rulebook order (Outcome before Cleanup). Question for the designer.

12. **Floor 3: boss as soon as possible.** `[agent]` (log 452)

    > Floor 3 room choice: only Hydroponics (Scramble 11, Good Stuff) left besides the boss. Red's held hand (Fast Follow x2, Overdrive, Charge, Overcharged Battery) plus Gray's Pry Bar already makes Oomph 12, so I take Gears & Glitch now rather than spend on Hydroponics.

13. **Floor 3 summary.** `[agent]` (log 496)

    > Floor 3 cleared turn 13, both Gears & Glitch challenges met. Floor 3 rooms give no card rewards (Turret and Hydroponics give Good Stuff or Scrap), so the boss is the only card-reward source there; with room choice that pushes me to fight the boss as soon as the hand allows.

14. **Peek 3 on the Floor deck.** `[agent]` (log 573)

    > Hack the Doors Peek 3 on the Floor deck: ordering offered, discard again not offered. With 3-room reveals at Turn Start, Peek 3 on the Floor deck only tells me what next turn's flip will show anyway.

    Peek 3 on the Floor deck now duplicates the Turn Start reveal. Shape observation.

15. **Peek discard missing on the Good Stuff pool too.** `[agent]` (log 675)

    > Peek on the Good Stuff pool: again only 'put those 3 back in the order you choose'. Rulebook Peek says 'Discard any number of them, then put the rest back in any order.' The discard step is missing on every pile I tried (Floor deck twice, Good Stuff pool). Engine mismatch? Also: I Know Kung Fu drew for Gray when Red played Lean In; matches 'every time a Scramble card is played', nice synergy.

    Suspected engine mismatch, first in the candidate list.

16. **Floor 4 summary.** `[agent]` (log 737)

    > Floor 4 cleared turn 18 through Oomph 7 and Scramble 7. Passed Gears & Glitch three times on floor 4 to take both Hubs and two Turrets first. Decks now Red 27, Gray 26 for floor 5.

17. **Bio-Hazard room rule missing from the reveal.** `[agent]` (log 740)

    > Floor 5 flip shows Bio-Hazard Containment Vault with only its thresholds. Its room rule ('Players may Scrap Good Stuff cards from their hand during Play to add +3 Oomph or +3 Scramble') is missing from the reveal; I only know it from bin/nvu card. Choosing the room blind of the hand (draw comes after the choice) makes the Monolith a gamble on a fresh floor, so Smoldering Armory (Oomph 10, Flee 3) first.

    CLI display issue. `bin/nvu card` prints the line; the flip does not.

18. **Blind choice cost a turn.** `[agent]` (log 804)

    > After entering Armory blind, the combined hand (Red: Salvage Kit, Reckless Swing, Charge, Tag Team, Overdrive; Gray: Pivot, I'll Take That, Duct Tape, Duck Under, Pry Bar) would likely have beaten the Monolith. The choice comes before the draw, so on floor 5 I am guessing which turn my hand will be good.

    Rulebook Turn Start: reveal, enter, pass the rest, then draw. Question for the designer: is the
    choice meant to be blind of the coming draw? On the first turn of a floor both hands are
    empty, so that choice is fully blind.

19. **Informed choice.** `[agent]` (log 848)

    > Monolith showed with a held hand of Scramble 11 (Coil, Salvage Kit, Pick The Lock, Duct Tape) and Oomph 8 if paid for. Here the choice is informed: 5 of the 10 cards are known before the draw. Taking it.

20. **One Oomph short.** `[agent]` (log 858)

    > Monolith: best line is Oomph 9 (Overdrive 3 + Second Wind 4 paid with both Coils + Duct Tape 2), one short of 10, and Scramble would then fall short too. Red has no spare payment cards; Gray's Pick The Locks cannot pay for Red. Will Flee (Exhaust 5 each). Setting up next turn: Red plays Salvage Kit paying Second Wind and keeps Coil, Coil, Overdrive; Gray plays Pick The Lock paying Pick The Lock + Peek and keeps Pick The Lock, Duct Tape. Next flip shows all 3 remaining rooms, so I can re-enter the Monolith at once.

    The plan's last sentence was wrong (note 21). The Flee took Momentum Shift, two Fast Follows,
    Kung Fu, Synergy Link and Zen Mode off the decks.

21. **Floor deck order is not shown.** `[agent]` (log 885)

    > My miscount: the Floor deck held 4 (Laser, Laser, Bio-Hazard, Monolith), so the Monolith did not come back this flip. The CLI never lists the Floor deck order, though every card in it is known to me from earlier flips; a 'floor deck' line in show would have saved this.

22. **A deliberate Flee to bank a hand.** `[agent]` (log 895)

    > Deliberate Flee of Laser Grid (Exhaust 4 each) with no cards played. The drawn hand beats the Monolith (Red: Coil, Coil, Cross Punch paid by Charge + Overdrive = Oomph 8 Scramble 6; Gray: Quick Vault, Kung Fu, Pick The Lock = Oomph 5 Scramble 4). Hands carry over and no draw happens at 5, so fleeing banks the hand for the next flip, which must show the Monolith. Room choice plus hand carry-over makes a deliberate Flee a real move.

    It worked. The Flee costs Exhaust from the top of the deck, not from the hand, so a strong
    hand survives it. Question for the designer: is "Flee a cheap room to keep a boss hand" an
    intended line?

23. **Win, and an unnamed draw prompt.** `[agent]` (log 933)

    > Monolith: Oomph 16 Scramble 10 from the banked hand. The Kung Fu draw prompt on Red's Coil says 'Draw 1 card?' without naming who draws (Gray).

### What the run showed

- Room choice plus hand carry-over makes the Stairwell a timing decision. On floors 1-4 I fought
  it only when a held hand guaranteed the kill, and I never Fled a Stairwell there. Exhaust resets
  on Ascend, so the rest of the floor is a budget to spend on rewards. Floors felt like "farm, then
  cash in", not "survive".
- The choice is made before the draw. On a fresh floor it is fully blind; later it is half
  informed by held cards. On floor 5 this cost one turn (note 18) and a Monolith Flee (note 20).
- A deliberate Flee of a cheap room is a strong move: it keeps both hands for the next flip (note
  22). With all remaining rooms revealed at once late in a floor, the player can steer to the
  Stairwell on demand.

### The CLI as a playtest tool

Friction, worst first:

1. `end` resolves a Flee with no warning when no challenge is met, and undo cannot take it back
   once the Flee revealed a card (note 3).
2. No view of the Floor deck order, though all of it is known from earlier flips and from the
   "to the bottom" lines (note 21).
3. Reward and Good Stuff reveals print names only. Every choice needed `bin/nvu card` calls.
4. Room reveals hide which thresholds share a challenge, and drop room rule text such as
   Bio-Hazard's (notes 10, 17).
5. Draw prompts from another player's effect do not say who draws (note 23).
6. `live` excludes the play zone mid-turn, which reads as card loss (notes 4, 9). The Ascend line
   "shuffles 13 cards back in" does not match the new deck size (note 5).
7. Passing `--run FILE` as one shell word failed with a raw Node stack trace
   (`ERR_PARSE_ARGS_UNKNOWN_OPTION`) instead of a usage line.

What it got right: `choose <Room> [rest...]` is short and sets the bottom order in one move; the
"To the bottom" line confirms it; the Stairwell auto-enters as the last card; refusals name the
reason and the eligible candidates; both Good Stuff reveals show before either choice, as the
rulebook says.

### Candidate issues

Engine mismatches:

- Peek never offers the discard step (Floor deck twice, Good Stuff pool). Rulebook Peek: "Discard
  any number of them, then put the rest back in any order." (notes 7, 15)

Rulebook questions:

- Does a card in the play zone count against Going Down, and when is Down checked? (note 9)
- What happens to a Room, Stairwell or Stuff card discarded by Peek? (note 7)
- Is the room choice meant to be made before the draw? (note 18)
- Is a Scrap at Outcome meant to miss the cards in the play zone? (note 11)

Shape, independent of tuning:

- Stairwell deferral plus Ascend's full reset makes floors 1-4 low risk: 0 Stairwell Flees in 18
  turns. Floor 5's Monolith Flee (5 each) was the only real danger. (notes 2, 8)
- Deliberate Flee of a cheap room banks a winning hand. (note 22)
- Floors 1-2 draw from two Room kinds and floors 3-4 have one card-reward Room (Hub), so the
  3-card choice is often between copies. (notes 6, 13)
- Peek 3 on the Floor deck now duplicates the Turn Start reveal. (note 14)

Card observations for a later re-tune:

- Overdrive (cost 0, Oomph 3) and Fast Follow (free after any Gray card) carried most boss kills.
- I Know Kung Fu (cost 1, Oomph 5, draws on any Scramble card by either player) and Quick Vault
  (free, draw 2) gave Gray the hand depth Red lacked.
- Red ran out of payment cards on the Monolith (note 20); Red's strong cards all need payers.

### Appendix

`bin/nvu replay design/playtests/18-room-choice-seed-10.json` (run file `design/playtests/18-room-choice-seed-10.json`), verbatim:

```
  1. Floor 1 is built: 6 rooms.
  2. Turn Start phase starts.
  3. Revealed: Security Turnstile, Security Turnstile, Flooded Ventilation Shaft.
  4. You are in: Flooded Ventilation Shaft.
  5. To the bottom of the Floor deck: Security Turnstile, Security Turnstile.
  6. Red draws Overdrive.
  7. Red draws Charge.
  8. Red draws Shove.
  9. Red draws Charge.
 10. Red draws Shove.
 11. Gray draws Pick The Lock.
 12. Gray draws Pick The Lock.
 13. Gray draws Peek Around Corner.
 14. Gray draws Duck Under.
 15. Gray draws Pick The Lock.
 16. Turn Start phase ends.
 17. Play phase starts.
 18. Red plays Overdrive.
 19. Overdrive triggers: Red Exhausts Shove.
 20. Gray pays with Peek Around Corner, Duck Under, Exhausting them.
 21. Gray plays Pick The Lock.
 22. Play phase ends.
 23. Outcome phase starts.
 24. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
 25. Flooded Ventilation Shaft is Cleared.
 26. Flooded Ventilation Shaft triggers: Red's reward pool shows Brute Recycle, Momentum Shift, Momentum Shift.
 27. NOTE — Reward reveal lists names only. Had to run bin/nvu card for each to see cost and text. Taking Momentum Shift: cost 1 Oomph 4 beats Charge.
 28. Red takes Momentum Shift into their discard pile.
 29. Flooded Ventilation Shaft triggers: Gray's reward pool shows I'll Take That, Hit 'n Run, Synergy Link.
 30. Gray takes Hit 'n Run into their discard pile.
 31. Outcome phase ends.
 32. Cleanup phase starts.
 33. Red discards Overdrive from their play zone.
 34. Gray discards Pick The Lock from their play zone.
 35. Cleanup phase ends.
 36. — end of turn 1 —
 37. Turn Start phase starts.
 38. Revealed: Flooded Ventilation Shaft, The Sentry Drone, Security Turnstile.
 39. NOTE — Room choice: Sentry Drone (Oomph 8 or Scramble 8) showed on turn 2. Passing it: no card can reach 8 alone yet, and exhaust resets on Ascend, so farming rewards on this floor first looks right. Entering the second Flooded Ventilation Shaft (cheapest double reward).
 40. You are in: Flooded Ventilation Shaft.
 41. To the bottom of the Floor deck: Security Turnstile, The Sentry Drone.
 42. Red draws Lean In.
 43. Gray draws Peek Around Corner.
 44. Gray draws Duck Under.
 45. Gray draws Pick The Lock.
 46. Turn Start phase ends.
 47. Play phase starts.
 48. Gray pays with Peek Around Corner, Exhausting it.
 49. Gray plays Duck Under.
 50. Red pays with Shove, Exhausting it.
 51. Red plays Lean In.
 52. Play phase ends.
 53. Outcome phase starts.
 54. You Flee Flooded Ventilation Shaft.
 55. Flooded Ventilation Shaft triggers: Gray Exhausts Work The Angles.
 56. Flooded Ventilation Shaft triggers: Gray Exhausts Duck Under.
 57. Outcome phase ends.
 58. Cleanup phase starts.
 59. Red discards Lean In from their play zone.
 60. Gray discards Duck Under from their play zone.
 61. Flooded Ventilation Shaft goes to the bottom of the Floor deck.
 62. Cleanup phase ends.
 63. — end of turn 2 —
 64. NOTE — My error: I chained moves and 'card Red Shove pay Shove' was refused (only one Shove left after Lean In paid with the other). The chained 'end' then Fled the room with Oomph 1 Scramble 3. undo refused: 'the last move revealed a card'. Wish: end should warn when no challenge is met, since Flee is costly. Gray now at exhaust 5, live 8.
 65. Turn Start phase starts.
 66. Revealed: Security Turnstile, Security Turnstile, Security Turnstile.
 67. You are in: Security Turnstile.
 68. To the bottom of the Floor deck: Security Turnstile, Security Turnstile.
 69. Red draws Shove.
 70. Red draws Charge.
 71. Gray draws Pick The Lock.
 72. Gray draws Duck Under.
 73. Turn Start phase ends.
 74. Play phase starts.
 75. Red pays with Shove, Charge, Exhausting them.
 76. Red plays Charge.
 77. Red pays with Charge, Exhausting it.
 78. Red plays Shove.
 79. NOTE — Spending 3 Red exhaust on Turnstile Oomph 5 for a Red reward, Gray holds. Red's remaining deck must be Charge, Overdrive, Overdrive, so next turn the Sentry Drone at Oomph 8 is reachable. 'live 6' mid-turn leaves out the 2 played cards; reads like I lost them.
 80. Play phase ends.
 81. Outcome phase starts.
 82. Oomph 5 met — Red reveals a card reward.
 83. Security Turnstile is Cleared.
 84. Security Turnstile triggers: Red's reward pool shows Heavy Pockets, Junk Launcher, Cross Punch.
 85. Red takes Cross Punch into their discard pile.
 86. Outcome phase ends.
 87. Cleanup phase starts.
 88. Red discards Charge from their play zone.
 89. Red discards Shove from their play zone.
 90. Cleanup phase ends.
 91. — end of turn 3 —
 92. Turn Start phase starts.
 93. Revealed: The Sentry Drone, Flooded Ventilation Shaft, Security Turnstile.
 94. You are in: The Sentry Drone.
 95. To the bottom of the Floor deck: Flooded Ventilation Shaft, Security Turnstile.
 96. Red draws Overdrive.
 97. Red draws Overdrive.
 98. Red draws Charge.
 99. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
100. Red draws Shove.
101. Red draws Cross Punch.
102. Turn Start phase ends.
103. Play phase starts.
104. Red plays Overdrive.
105. Overdrive triggers: Red Exhausts Momentum Shift.
106. Red plays Overdrive.
107. Overdrive triggers: Red Exhausts Charge.
108. Red pays with Charge, Exhausting it.
109. Red plays Shove.
110. Play phase ends.
111. Outcome phase starts.
112. Oomph 8 met — Ascend, and both players reveal a card reward.
113. The Sentry Drone is Cleared.
114. The Sentry Drone triggers: Red's reward pool shows Brute Recycle, Set 'Em Up, Fast Follow.
115. Red takes Fast Follow into their discard pile.
116. The Sentry Drone triggers: Gray's reward pool shows Pivot, Quick Vault, One Man's Junk.
117. Gray takes Quick Vault into their discard pile.
118. Outcome phase ends.
119. Cleanup phase starts.
120. Red discards Overdrive from their play zone.
121. Red discards Overdrive from their play zone.
122. Red discards Shove from their play zone.
123. Cleanup phase ends.
124. — end of turn 4 —
125. Floor 1 is clear.
126. Red shuffles 13 cards back in.
127. Gray shuffles 14 cards back in.
128. Floor 2 is built: 6 rooms.
129. NOTE — Floor 1 cleared turn 4. Room choice let me hold the Stairwell until I could count Red's deck down to Charge, Overdrive, Overdrive. Ascend fully heals, so exhaust is a per-floor budget: spend it on rewards, keep enough for the boss. 'Red shuffles 13 cards back in' while Red now has 15: unclear what 13 counts.
130. Turn Start phase starts.
131. Revealed: Flooded Ventilation Shaft, Security Turnstile, Security Turnstile.
132. NOTE — cards.yaml: Floors 1-2 draw from only two Room kinds (Security Turnstile x14, Flooded Ventilation Shaft x10). The room choice on these floors is really FVS vs Turnstile vs boss-now.
133. You are in: Flooded Ventilation Shaft.
134. To the bottom of the Floor deck: Security Turnstile, Security Turnstile.
135. Red draws Shove.
136. Red draws Fast Follow.
137. Red draws Lean In.
138. Red draws Charge.
139. Red draws Shove.
140. Gray draws Pick The Lock.
141. Gray draws Pick The Lock.
142. Gray draws Pick The Lock.
143. Gray draws Duck Under.
144. Gray draws Duck Under.
145. Turn Start phase ends.
146. Play phase starts.
147. Gray pays with Duck Under, Exhausting it.
148. Gray plays Duck Under.
149. Red plays Fast Follow.
150. Red pays with Shove, Exhausting it.
151. Red plays Lean In.
152. Play phase ends.
153. Outcome phase starts.
154. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
155. Flooded Ventilation Shaft is Cleared.
156. Flooded Ventilation Shaft triggers: Red's reward pool shows Second Wind, Rhythm & Bruise, Rhythm & Bruise.
157. Red takes Second Wind into their discard pile.
158. Flooded Ventilation Shaft triggers: Gray's reward pool shows Catch Your Breath, Covering Fire, I Know Kung Fu.
159. Gray takes I Know Kung Fu into their discard pile.
160. Outcome phase ends.
161. Cleanup phase starts.
162. Red discards Fast Follow from their play zone.
163. Red discards Lean In from their play zone.
164. Gray discards Duck Under from their play zone.
165. Cleanup phase ends.
166. — end of turn 5 —
167. Turn Start phase starts.
168. Revealed: The Sentry Drone, Security Turnstile, Flooded Ventilation Shaft.
169. You are in: Flooded Ventilation Shaft.
170. To the bottom of the Floor deck: Security Turnstile, The Sentry Drone.
171. Red draws Cross Punch.
172. Red draws Momentum Shift.
173. Red draws Charge.
174. Gray draws Peek Around Corner.
175. Gray draws Hit 'n Run.
176. Turn Start phase ends.
177. Play phase starts.
178. Gray pays with Pick The Lock, Exhausting it.
179. Gray plays Peek Around Corner.
180. Peek Around Corner triggers: A look at the Floor deck: Security Turnstile.
181. NOTE — Peek 1 on the Floor deck showed Security Turnstile and moved on. Rulebook Peek: 'Discard any number of them, then put the rest back in any order.' No discard choice was offered. Did the engine skip it for the Floor deck on purpose? And what would discarding a Room (or the Stairwell) even mean? Rulebook gap.
182. Gray pays with Pick The Lock, Exhausting it.
183. Gray plays Hit 'n Run.
184. Hit 'n Run triggers: Gray shuffles 1 card back in.
185. Red pays with Charge, Exhausting it.
186. Red plays Shove.
187. Play phase ends.
188. Outcome phase starts.
189. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
190. Flooded Ventilation Shaft is Cleared.
191. Flooded Ventilation Shaft triggers: Red's reward pool shows Fast Follow, It Pays To Be Reckless, Tag Team.
192. Red takes Fast Follow into their discard pile.
193. Flooded Ventilation Shaft triggers: Gray's reward pool shows Pivot, Pack Mule, Quick Vault.
194. Gray takes Quick Vault into their discard pile.
195. Outcome phase ends.
196. Cleanup phase starts.
197. Red discards Shove from their play zone.
198. Gray discards Peek Around Corner from their play zone.
199. Gray discards Hit 'n Run from their play zone.
200. Cleanup phase ends.
201. — end of turn 6 —
202. Turn Start phase starts.
203. Revealed: Security Turnstile, Security Turnstile, Security Turnstile.
204. You are in: Security Turnstile.
205. To the bottom of the Floor deck: Security Turnstile, Security Turnstile.
206. Red draws Overdrive.
207. Red draws Charge.
208. Gray draws Pick The Lock.
209. Gray draws Duck Under.
210. Gray draws Pick The Lock.
211. Gray draws Duck Under.
212. Turn Start phase ends.
213. Play phase starts.
214. Gray pays with Pick The Lock, Duck Under, Exhausting them.
215. Gray plays Pick The Lock.
216. Gray pays with Pick The Lock, Exhausting it.
217. Gray plays Duck Under.
218. Red pays with Charge, Exhausting it.
219. Red plays Momentum Shift.
220. Momentum Shift triggers: Red draws Overdrive.
221. Momentum Shift triggers: Red draws Overdrive.
222. Momentum Shift triggers: Red Exhausts Charge.
223. Red plays Overdrive.
224. Overdrive triggers: Red Exhausts Charge.
225. Play phase ends.
226. Outcome phase starts.
227. Scramble 5 met — Gray reveals a card reward.
228. Oomph 5 met — Red reveals a card reward.
229. Security Turnstile is Cleared.
230. Security Turnstile triggers: Gray's reward pool shows I Know Kung Fu, Pack Mule, Sharing Is Caring.
231. Gray takes I Know Kung Fu into their discard pile.
232. Security Turnstile triggers: Red's reward pool shows Junk Launcher, Heavy Pockets, Reckless Swing.
233. Red takes Reckless Swing into their discard pile.
234. Outcome phase ends.
235. Cleanup phase starts.
236. Red discards Momentum Shift from their play zone.
237. Red discards Overdrive from their play zone.
238. Gray discards Pick The Lock from their play zone.
239. Gray discards Duck Under from their play zone.
240. Cleanup phase ends.
241. — end of turn 7 —
242. Turn Start phase starts.
243. Revealed: The Sentry Drone, Security Turnstile, Security Turnstile.
244. NOTE — Passing the Sentry Drone again with a sure kill in hand (Overdrive x2 + Cross Punch). Greedy for one more Turnstile while the boss hand is held; held cards stay in hand so the boss kill keeps.
245. You are in: Security Turnstile.
246. To the bottom of the Floor deck: The Sentry Drone, Security Turnstile.
247. Red draws Shove.
248. Red draws Shove.
249. Gray draws Quick Vault.
250. Gray draws Pick The Lock.
251. Gray draws Work The Angles.
252. Gray draws Peek Around Corner.
253. Gray's deck is empty — the discard pile shuffles in to make a new one (8 cards).
254. Gray draws Duck Under.
255. Turn Start phase ends.
256. Play phase starts.
257. Gray plays Quick Vault.
258. Quick Vault triggers: Gray draws I Know Kung Fu.
259. Quick Vault triggers: Gray draws I Know Kung Fu.
260. Gray pays with Peek Around Corner, Exhausting it.
261. Gray plays I Know Kung Fu.
262. Gray pays with Work The Angles, Exhausting it.
263. Gray plays Duck Under.
264. I Know Kung Fu triggers: Gray draws Pick The Lock.
265. Gray pays with Pick The Lock, I Know Kung Fu, Exhausting them.
266. Gray plays Pick The Lock.
267. I Know Kung Fu triggers: Gray draws Quick Vault.
268. Play phase ends.
269. Outcome phase starts.
270. Scramble 5 met — Gray reveals a card reward.
271. Oomph 5 met — Red reveals a card reward.
272. Security Turnstile is Cleared.
273. Security Turnstile triggers: Gray's reward pool shows Catch Your Breath, In Step, Hit 'n Run.
274. Gray takes Hit 'n Run into their discard pile.
275. Security Turnstile triggers: Red's reward pool shows Fast Follow, Tag Team, Reckless Swing.
276. Red takes Reckless Swing into their discard pile.
277. Outcome phase ends.
278. Cleanup phase starts.
279. Gray discards Quick Vault from their play zone.
280. Gray discards I Know Kung Fu from their play zone.
281. Gray discards Duck Under from their play zone.
282. Gray discards Pick The Lock from their play zone.
283. Cleanup phase ends.
284. — end of turn 8 —
285. Turn Start phase starts.
286. Revealed: The Sentry Drone, Security Turnstile.
287. You are in: Security Turnstile.
288. To the bottom of the Floor deck: The Sentry Drone.
289. Gray draws Peek Around Corner.
290. Gray draws Hit 'n Run.
291. Gray draws Duck Under.
292. Gray's deck is empty — the discard pile shuffles in to make a new one (5 cards).
293. Gray draws Pick The Lock.
294. Turn Start phase ends.
295. Play phase starts.
296. Gray plays Quick Vault.
297. Quick Vault triggers: Gray draws Hit 'n Run.
298. Quick Vault triggers: Gray draws Quick Vault.
299. Gray plays Quick Vault.
300. Quick Vault triggers: Gray draws Duck Under.
301. Quick Vault triggers: Gray draws I Know Kung Fu.
302. Gray pays with Hit 'n Run, Exhausting it.
303. Gray plays I Know Kung Fu.
304. Gray pays with Duck Under, Duck Under, Exhausting them.
305. Gray plays Pick The Lock.
306. NOTE — Gray shows live 2 (deck 0, discard 0, hand 2) with 4 cards in the play zone. Hit 'n Run paying with Peek would reach Scramble 6, but would leave Gray with nothing in hand, deck or discard until Hit 'n Run's effect lands. Rulebook 9: 'If one player has no cards in their hand, deck, or discard pile, you go Down.' Do play-zone cards count? Is Down checked mid-play? Not risking it: stopping at Oomph 5 only. The 'live' number made this look scarier than it is, but I can't tell from the rulebook.
307. Play phase ends.
308. Outcome phase starts.
309. Oomph 5 met — Red reveals a card reward.
310. Security Turnstile is Cleared.
311. Security Turnstile triggers: Red's reward pool shows Break Through, Reckless Swing, Break Through.
312. Red takes Reckless Swing into their discard pile.
313. Outcome phase ends.
314. Cleanup phase starts.
315. Gray discards Quick Vault from their play zone.
316. Gray discards Quick Vault from their play zone.
317. Gray discards I Know Kung Fu from their play zone.
318. Gray discards Pick The Lock from their play zone.
319. Cleanup phase ends.
320. — end of turn 9 —
321. Turn Start phase starts.
322. You are in: The Sentry Drone.
323. Gray's deck is empty — the discard pile shuffles in to make a new one (4 cards).
324. Gray draws I Know Kung Fu.
325. Gray draws Quick Vault.
326. Gray draws Quick Vault.
327. Turn Start phase ends.
328. Play phase starts.
329. Gray pays with Quick Vault, Exhausting it.
330. Gray plays I Know Kung Fu.
331. Red plays Overdrive.
332. Overdrive triggers: Red's deck is empty — the discard pile shuffles in to make a new one (10 cards).
333. Overdrive triggers: Red Exhausts Shove.
334. Red plays Overdrive.
335. Overdrive triggers: Red Exhausts Fast Follow.
336. Play phase ends.
337. Outcome phase starts.
338. Oomph 8 met — Ascend, and both players reveal a card reward.
339. The Sentry Drone is Cleared.
340. The Sentry Drone triggers: Red's reward pool shows Cross Punch, Bull Rush, Bull Rush.
341. Red takes Bull Rush into their discard pile.
342. The Sentry Drone triggers: Gray's reward pool shows I'll Take That, In Step, Synergy Link.
343. Gray takes I'll Take That into their discard pile.
344. Outcome phase ends.
345. Cleanup phase starts.
346. Red discards Overdrive from their play zone.
347. Red discards Overdrive from their play zone.
348. Gray discards I Know Kung Fu from their play zone.
349. Cleanup phase ends.
350. — end of turn 10 —
351. Floor 2 is clear.
352. Red shuffles 13 cards back in.
353. Gray shuffles 18 cards back in.
354. Floor 3 is built: 6 rooms.
355. NOTE — Floor 2 cleared turn 10, no Flees. The Sentry auto-entered when it was the last card. Room lines in the CLI do not show which thresholds share a challenge; I had to read cards.yaml to learn Gears & Glitch's two lines are two challenges.
356. Turn Start phase starts.
357. Revealed: Overgrown Hydroponics Bay, Overgrown Hydroponics Bay, Automated Defense Turret.
358. You are in: Automated Defense Turret.
359. To the bottom of the Floor deck: Overgrown Hydroponics Bay, Overgrown Hydroponics Bay.
360. Red draws Overdrive.
361. Red draws Shove.
362. Red draws Shove.
363. Red draws Reckless Swing.
364. Red draws Charge.
365. Gray draws Quick Vault.
366. Gray draws Pick The Lock.
367. Gray draws Duck Under.
368. Gray draws Work The Angles.
369. Gray draws Hit 'n Run.
370. Turn Start phase ends.
371. Play phase starts.
372. Gray plays Quick Vault.
373. Quick Vault triggers: Gray draws Peek Around Corner.
374. Quick Vault triggers: Gray draws Quick Vault.
375. Gray plays Quick Vault.
376. Quick Vault triggers: Gray draws Pick The Lock.
377. Quick Vault triggers: Gray draws Hit 'n Run.
378. Gray pays with Peek Around Corner, Work The Angles, Exhausting them.
379. Gray plays Pick The Lock.
380. Gray pays with Duck Under, Exhausting it.
381. Gray plays Hit 'n Run.
382. Hit 'n Run triggers: Gray shuffles 1 card back in.
383. Gray pays with Pick The Lock, Exhausting it.
384. Gray plays Hit 'n Run.
385. Hit 'n Run triggers: Gray shuffles 1 card back in.
386. Red plays Overdrive.
387. Overdrive triggers: Red Exhausts Lean In.
388. Red pays with Shove, Exhausting it.
389. Red plays Reckless Swing.
390. Reckless Swing triggers: Red Exhausts Shove.
391. Play phase ends.
392. Outcome phase starts.
393. Scramble 8 met — Both players get Good Stuff.
394. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
395. Automated Defense Turret is Cleared.
396. Automated Defense Turret triggers: Red reveals Good Stuff: Duct Tape & Wire, Riot Shield, Coil Of Cable.
397. Automated Defense Turret triggers: Gray reveals Good Stuff: Pry Bar, Crowbar, Stim Pack.
398. Red gets Coil Of Cable.
399. Red takes Coil Of Cable into hand.
400. Gray gets Pry Bar.
401. Gray takes Pry Bar into hand.
402. Shove is Scrapped.
403. NOTE — Turret Scrap: Gray's only option was the Pry Bar just gained, because all 5 played cards sit in the play zone until Cleanup and the discard was empty after a reshuffle. Scrap 'from your hand or discard pile' at Outcome mostly misses the cards you just used. Intended?
404. Outcome phase ends.
405. Cleanup phase starts.
406. Red discards Overdrive from their play zone.
407. Red discards Reckless Swing from their play zone.
408. Gray discards Quick Vault from their play zone.
409. Gray discards Quick Vault from their play zone.
410. Gray discards Pick The Lock from their play zone.
411. Gray discards Hit 'n Run from their play zone.
412. Gray discards Hit 'n Run from their play zone.
413. Cleanup phase ends.
414. — end of turn 11 —
415. Turn Start phase starts.
416. Revealed: Overgrown Hydroponics Bay, Automated Defense Turret, Gears & Glitch.
417. You are in: Automated Defense Turret.
418. To the bottom of the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay.
419. Red draws Fast Follow.
420. Red draws Fast Follow.
421. Red draws Overdrive.
422. Gray draws Pick The Lock.
423. Gray draws Duck Under.
424. Gray draws Pick The Lock.
425. Gray draws Peek Around Corner.
426. Turn Start phase ends.
427. Play phase starts.
428. Red plays Coil Of Cable.
429. Gray pays with Pry Bar, Peek Around Corner, Exhausting them.
430. Gray plays Pick The Lock.
431. Gray pays with Pick The Lock, Exhausting it.
432. Gray plays Duck Under.
433. Play phase ends.
434. Outcome phase starts.
435. Scramble 8 met — Both players get Good Stuff.
436. Automated Defense Turret is Cleared.
437. Automated Defense Turret triggers: Red reveals Good Stuff: Cutting Torch, Overcharged Battery, Cutting Torch.
438. Automated Defense Turret triggers: Gray reveals Good Stuff: Pry Bar, Coil Of Cable, Overcharged Battery.
439. Red gets Overcharged Battery.
440. Red takes Overcharged Battery into hand.
441. Gray gets Pry Bar.
442. Gray takes Pry Bar into hand.
443. Outcome phase ends.
444. Cleanup phase starts.
445. Red discards Coil Of Cable from their play zone.
446. Gray discards Pick The Lock from their play zone.
447. Gray discards Duck Under from their play zone.
448. Cleanup phase ends.
449. — end of turn 12 —
450. Turn Start phase starts.
451. Revealed: Overgrown Hydroponics Bay, Overgrown Hydroponics Bay, Gears & Glitch.
452. NOTE — Floor 3 room choice: only Hydroponics (Scramble 11, Good Stuff) left besides the boss. Red's held hand (Fast Follow x2, Overdrive, Charge, Overcharged Battery) plus Gray's Pry Bar already makes Oomph 12, so I take Gears & Glitch now rather than spend on Hydroponics.
453. You are in: Gears & Glitch.
454. To the bottom of the Floor deck: Overgrown Hydroponics Bay, Overgrown Hydroponics Bay.
455. Gray draws I Know Kung Fu.
456. Gray draws Duck Under.
457. Gray draws Duck Under.
458. Gray draws Pick The Lock.
459. Turn Start phase ends.
460. Play phase starts.
461. Gray pays with Duck Under, Exhausting it.
462. Gray plays Duck Under.
463. Gray pays with I Know Kung Fu, Pry Bar, Exhausting them.
464. Gray plays Pick The Lock.
465. Red plays Fast Follow.
466. Red plays Fast Follow.
467. Red pays with Overdrive, Exhausting it.
468. Red plays Overcharged Battery.
469. Red plays Charge.
470. Play phase ends.
471. Outcome phase starts.
472. Oomph 12 met — Ascend, and both players reveal a card reward.
473. Oomph 7 and Scramble 7 met — Ascend; one player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
474. Gears & Glitch is Cleared.
475. Gears & Glitch triggers: Red's reward pool shows Set 'Em Up, Second Wind, Brute Recycle.
476. Red takes Second Wind into their discard pile.
477. Gears & Glitch triggers: Gray's reward pool shows One Man's Junk, Hack the Doors, Covering Fire.
478. Gray takes Hack the Doors into their discard pile.
479. Gears & Glitch triggers: Red's reward pool shows Momentum Shift, Heavy Pockets, Junk Launcher.
480. Red takes Momentum Shift into their discard pile.
481. Duck Under is Scrapped.
482. Outcome phase ends.
483. Cleanup phase starts.
484. Red discards Fast Follow from their play zone.
485. Red discards Fast Follow from their play zone.
486. Red discards Overcharged Battery from their play zone.
487. Red discards Charge from their play zone.
488. Gray discards Duck Under from their play zone.
489. Gray discards Pick The Lock from their play zone.
490. Cleanup phase ends.
491. — end of turn 13 —
492. Floor 3 is clear.
493. Red shuffles 13 cards back in.
494. Gray shuffles 17 cards back in.
495. Floor 4 is built: 6 rooms.
496. NOTE — Floor 3 cleared turn 13, both Gears & Glitch challenges met. Floor 3 rooms give no card rewards (Turret and Hydroponics give Good Stuff or Scrap), so the boss is the only card-reward source there; with room choice that pushes me to fight the boss as soon as the hand allows.
497. Turn Start phase starts.
498. Revealed: Gears & Glitch, Automated Defense Turret, Automated Defense Turret.
499. You are in: Automated Defense Turret.
500. To the bottom of the Floor deck: Automated Defense Turret, Gears & Glitch.
501. Red draws Overdrive.
502. Red draws Reckless Swing.
503. Red draws Momentum Shift.
504. Red draws Charge.
505. Red draws Charge.
506. Gray draws Pick The Lock.
507. Gray draws Quick Vault.
508. Gray draws I Know Kung Fu.
509. Gray draws Duck Under.
510. Gray draws Peek Around Corner.
511. Turn Start phase ends.
512. Play phase starts.
513. Gray plays Quick Vault.
514. Quick Vault triggers: Gray draws Pick The Lock.
515. Quick Vault triggers: Gray draws I Know Kung Fu.
516. Gray pays with Peek Around Corner, I Know Kung Fu, Exhausting them.
517. Gray plays Pick The Lock.
518. Gray pays with I Know Kung Fu, Duck Under, Exhausting them.
519. Gray plays Pick The Lock.
520. Red plays Overdrive.
521. Overdrive triggers: Red Exhausts Bull Rush.
522. Red pays with Charge, Exhausting it.
523. Red plays Reckless Swing.
524. Reckless Swing triggers: Red Exhausts Overdrive.
525. Red pays with Charge, Exhausting it.
526. Red plays Momentum Shift.
527. Momentum Shift triggers: Red draws Reckless Swing.
528. Momentum Shift triggers: Red draws Cross Punch.
529. Momentum Shift triggers: Red Exhausts Reckless Swing.
530. Play phase ends.
531. Outcome phase starts.
532. Scramble 8 met — Both players get Good Stuff.
533. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
534. Automated Defense Turret is Cleared.
535. Automated Defense Turret triggers: Red reveals Good Stuff: Overcharged Battery, Stim Pack, A Pair Of Stitch-Em-Ups.
536. Automated Defense Turret triggers: Gray reveals Good Stuff: Riot Shield, Pry Bar, Pry Bar.
537. Red gets Overcharged Battery.
538. Red takes Overcharged Battery into hand.
539. Gray gets Pry Bar.
540. Gray takes Pry Bar into hand.
541. Outcome phase ends.
542. Cleanup phase starts.
543. Red discards Overdrive from their play zone.
544. Red discards Reckless Swing from their play zone.
545. Red discards Momentum Shift from their play zone.
546. Gray discards Quick Vault from their play zone.
547. Gray discards Pick The Lock from their play zone.
548. Gray discards Pick The Lock from their play zone.
549. Cleanup phase ends.
550. — end of turn 14 —
551. Turn Start phase starts.
552. Revealed: Pressurized Maintenance Hub, Automated Defense Turret, Pressurized Maintenance Hub.
553. You are in: Pressurized Maintenance Hub.
554. To the bottom of the Floor deck: Pressurized Maintenance Hub, Automated Defense Turret.
555. Red draws Overcharged Battery.
556. Red draws Shove.
557. Red draws Fast Follow.
558. Gray draws Pick The Lock.
559. Gray draws Duck Under.
560. Gray draws Hack the Doors.
561. Gray draws Pick The Lock.
562. Turn Start phase ends.
563. Play phase starts.
564. Gray pays with Duck Under, Exhausting it.
565. Gray plays Hack the Doors.
566. Hack the Doors triggers: A look at the Floor deck: Automated Defense Turret, Gears & Glitch, Pressurized Maintenance Hub.
567. Gray pays with Pry Bar, Pick The Lock, Exhausting them.
568. Gray plays Pick The Lock.
569. Red pays with Shove, Exhausting it.
570. Red plays Overcharged Battery.
571. Red plays Cross Punch.
572. Cross Punch triggers: Red Exhausts Charge.
573. NOTE — Hack the Doors Peek 3 on the Floor deck: ordering offered, discard again not offered. With 3-room reveals at Turn Start, Peek 3 on the Floor deck only tells me what next turn's flip will show anyway.
574. Play phase ends.
575. Outcome phase starts.
576. Oomph 7 met — Red reveals a card reward.
577. Scramble 7 met — Gray reveals a card reward.
578. Pressurized Maintenance Hub is Cleared.
579. Pressurized Maintenance Hub triggers: Red's reward pool shows Brute Recycle, Set 'Em Up, Rhythm & Bruise.
580. Red takes Brute Recycle into their discard pile.
581. Pressurized Maintenance Hub triggers: Gray's reward pool shows Zen Mode, Hack the Doors, I'll Take That.
582. Gray takes Zen Mode into their discard pile.
583. Outcome phase ends.
584. Cleanup phase starts.
585. Red discards Overcharged Battery from their play zone.
586. Red discards Cross Punch from their play zone.
587. Gray discards Hack the Doors from their play zone.
588. Gray discards Pick The Lock from their play zone.
589. Cleanup phase ends.
590. — end of turn 15 —
591. Turn Start phase starts.
592. Revealed: Pressurized Maintenance Hub, Automated Defense Turret, Gears & Glitch.
593. You are in: Pressurized Maintenance Hub.
594. To the bottom of the Floor deck: Automated Defense Turret, Gears & Glitch.
595. Red draws Coil Of Cable.
596. Red draws Second Wind.
597. Red draws Fast Follow.
598. Gray draws I'll Take That.
599. Gray draws Work The Angles.
600. Gray draws Hit 'n Run.
601. Gray draws Pick The Lock.
602. Gray draws Pry Bar.
603. Turn Start phase ends.
604. Play phase starts.
605. Gray plays Pry Bar.
606. Red plays Fast Follow.
607. Red plays Fast Follow.
608. Red plays Coil Of Cable.
609. Gray pays with Work The Angles, Exhausting it.
610. Gray plays Hit 'n Run.
611. Hit 'n Run triggers: Gray shuffles 1 card back in.
612. Gray pays with Pick The Lock, Exhausting it.
613. Gray plays I'll Take That.
614. I'll Take That triggers: Red shuffles 1 card back in.
615. Play phase ends.
616. Outcome phase starts.
617. Oomph 7 met — Red reveals a card reward.
618. Scramble 7 met — Gray reveals a card reward.
619. Pressurized Maintenance Hub is Cleared.
620. Pressurized Maintenance Hub triggers: Red's reward pool shows Rhythm & Bruise, It Pays To Be Reckless, Tag Team.
621. Red takes Tag Team into their discard pile.
622. Pressurized Maintenance Hub triggers: Gray's reward pool shows Synergy Link, Pivot, One Man's Junk.
623. Gray takes Synergy Link into their discard pile.
624. Outcome phase ends.
625. Cleanup phase starts.
626. Red discards Fast Follow from their play zone.
627. Red discards Fast Follow from their play zone.
628. Red discards Coil Of Cable from their play zone.
629. Gray discards Pry Bar from their play zone.
630. Gray discards Hit 'n Run from their play zone.
631. Gray discards I'll Take That from their play zone.
632. Cleanup phase ends.
633. — end of turn 16 —
634. Turn Start phase starts.
635. Revealed: Automated Defense Turret, Automated Defense Turret, Gears & Glitch.
636. You are in: Automated Defense Turret.
637. To the bottom of the Floor deck: Gears & Glitch, Automated Defense Turret.
638. Red draws Shove.
639. Red draws Lean In.
640. Red draws Overdrive.
641. Red draws Reckless Swing.
642. Gray draws I Know Kung Fu.
643. Gray draws Hit 'n Run.
644. Gray draws Pry Bar.
645. Gray draws Peek Around Corner.
646. Gray draws Quick Vault.
647. Turn Start phase ends.
648. Play phase starts.
649. Gray plays Quick Vault.
650. Quick Vault triggers: Gray draws Duck Under.
651. Quick Vault triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (10 cards).
652. Quick Vault triggers: Gray draws Pry Bar.
653. Gray pays with Pry Bar, Exhausting it.
654. Gray plays I Know Kung Fu.
655. Gray pays with Pry Bar, Exhausting it.
656. Gray plays Hit 'n Run.
657. Hit 'n Run triggers: Gray shuffles 1 card back in.
658. I Know Kung Fu triggers: Gray draws Pick The Lock.
659. Red plays Overdrive.
660. Overdrive triggers: Red Exhausts Momentum Shift.
661. Red pays with Shove, Exhausting it.
662. Red plays Lean In.
663. I Know Kung Fu triggers: Gray draws Quick Vault.
664. Gray plays Quick Vault.
665. Quick Vault triggers: Gray draws Pick The Lock.
666. Quick Vault triggers: Gray draws Synergy Link.
667. Gray pays with Peek Around Corner, Exhausting it.
668. Gray plays Synergy Link.
669. Synergy Link triggers: Gray draws Hit 'n Run.
670. Synergy Link triggers: Gray draws Hack the Doors.
671. I Know Kung Fu triggers: Gray draws Pick The Lock.
672. Gray pays with Duck Under, Exhausting it.
673. Gray plays Hack the Doors.
674. Hack the Doors triggers: A look at the Good Stuff pool: Pocket Dynamo, Pocket Dynamo, Duct Tape & Wire.
675. NOTE — Peek on the Good Stuff pool: again only 'put those 3 back in the order you choose'. Rulebook Peek says 'Discard any number of them, then put the rest back in any order.' The discard step is missing on every pile I tried (Floor deck twice, Good Stuff pool). Engine mismatch? Also: I Know Kung Fu drew for Gray when Red played Lean In; matches 'every time a Scramble card is played', nice synergy.
676. I Know Kung Fu triggers: Gray draws Zen Mode.
677. Play phase ends.
678. Outcome phase starts.
679. Scramble 8 met — Both players get Good Stuff.
680. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
681. Automated Defense Turret is Cleared.
682. Automated Defense Turret triggers: Red reveals Good Stuff: Pocket Dynamo, Duct Tape & Wire, Pocket Dynamo.
683. Automated Defense Turret triggers: Gray reveals Good Stuff: Emergency Breaker, Pocket Dynamo, Duct Tape & Wire.
684. Red gets Duct Tape & Wire.
685. Red takes Duct Tape & Wire into hand.
686. Gray gets Duct Tape & Wire.
687. Gray takes Duct Tape & Wire into hand.
688. Outcome phase ends.
689. Cleanup phase starts.
690. Red discards Overdrive from their play zone.
691. Red discards Lean In from their play zone.
692. Gray discards Quick Vault from their play zone.
693. Gray discards I Know Kung Fu from their play zone.
694. Gray discards Hit 'n Run from their play zone.
695. Gray discards Quick Vault from their play zone.
696. Gray discards Synergy Link from their play zone.
697. Gray discards Hack the Doors from their play zone.
698. Cleanup phase ends.
699. — end of turn 17 —
700. Turn Start phase starts.
701. Revealed: Gears & Glitch, Automated Defense Turret.
702. You are in: Gears & Glitch.
703. To the bottom of the Floor deck: Automated Defense Turret.
704. Red draws Charge.
705. Red draws Second Wind.
706. Turn Start phase ends.
707. Play phase starts.
708. Gray pays with Pick The Lock, Zen Mode, Exhausting them.
709. Gray plays Pick The Lock.
710. Gray pays with Duct Tape & Wire, Exhausting it.
711. Gray plays Hit 'n Run.
712. Hit 'n Run triggers: Gray shuffles 1 card back in.
713. Red pays with Charge, Exhausting it.
714. Red plays Duct Tape & Wire.
715. Red pays with Second Wind, Exhausting it.
716. Red plays Reckless Swing.
717. Reckless Swing triggers: Red Exhausts Shove.
718. Play phase ends.
719. Outcome phase starts.
720. Oomph 7 and Scramble 7 met — Ascend; one player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
721. Gears & Glitch is Cleared.
722. Gears & Glitch triggers: Gray's reward pool shows Catch Your Breath, Covering Fire, Pivot.
723. Gray takes Pivot into their discard pile.
724. Lean In is Scrapped.
725. Outcome phase ends.
726. Cleanup phase starts.
727. Red discards Duct Tape & Wire from their play zone.
728. Red discards Reckless Swing from their play zone.
729. Gray discards Pick The Lock from their play zone.
730. Gray discards Hit 'n Run from their play zone.
731. Cleanup phase ends.
732. — end of turn 18 —
733. Floor 4 is clear.
734. Red shuffles 26 cards back in.
735. Gray shuffles 23 cards back in.
736. Floor 5 is built: 6 rooms.
737. NOTE — Floor 4 cleared turn 18 through Oomph 7 and Scramble 7. Passed Gears & Glitch three times on floor 4 to take both Hubs and two Turrets first. Decks now Red 27, Gray 26 for floor 5.
738. Turn Start phase starts.
739. Revealed: Smoldering Armory, Bio-Hazard Containment Vault, The Monolith Core.
740. NOTE — Floor 5 flip shows Bio-Hazard Containment Vault with only its thresholds. Its room rule ('Players may Scrap Good Stuff cards from their hand during Play to add +3 Oomph or +3 Scramble') is missing from the reveal; I only know it from bin/nvu card. Choosing the room blind of the hand (draw comes after the choice) makes the Monolith a gamble on a fresh floor, so Smoldering Armory (Oomph 10, Flee 3) first.
741. You are in: Smoldering Armory.
742. To the bottom of the Floor deck: The Monolith Core, Bio-Hazard Containment Vault.
743. Red draws Second Wind.
744. Red draws Momentum Shift.
745. Red draws Overdrive.
746. Red draws Reckless Swing.
747. Red draws Bull Rush.
748. Gray draws Pivot.
749. Gray draws Work The Angles.
750. Gray draws Duct Tape & Wire.
751. Gray draws I'll Take That.
752. Gray draws Pry Bar.
753. Turn Start phase ends.
754. Play phase starts.
755. Gray plays Pry Bar.
756. Gray pays with Work The Angles, Exhausting it.
757. Gray plays Duct Tape & Wire.
758. Red plays Overdrive.
759. Overdrive triggers: Red Exhausts Shove.
760. Red pays with Second Wind, Exhausting it.
761. Red plays Momentum Shift.
762. Momentum Shift triggers: Red draws Overcharged Battery.
763. Momentum Shift triggers: Red draws Brute Recycle.
764. Momentum Shift triggers: Red Exhausts Brute Recycle.
765. Red pays with Reckless Swing, Exhausting it.
766. Red plays Overcharged Battery.
767. Red plays Bull Rush.
768. Play phase ends.
769. Outcome phase starts.
770. Oomph 16 met — Both players reveal a card reward, and both players get Good Stuff.
771. Smoldering Armory is Cleared.
772. Smoldering Armory triggers: Red's reward pool shows Junk Launcher, Heavy Pockets, Fast Follow.
773. Red takes Fast Follow into their discard pile.
774. Smoldering Armory triggers: Gray's reward pool shows Pack Mule, Pack Mule, Sharing Is Caring.
775. Gray takes Pack Mule into their discard pile.
776. Smoldering Armory triggers: Red reveals Good Stuff: A Pair Of Stitch-Em-Ups, Salvaged Blueprint, Automated Salvage Kit.
777. Smoldering Armory triggers: Gray reveals Good Stuff: Stim Pack, Crowbar, Duct Tape & Wire.
778. Red gets Automated Salvage Kit.
779. Red takes Automated Salvage Kit into hand.
780. Gray gets Duct Tape & Wire.
781. Gray takes Duct Tape & Wire into hand.
782. Outcome phase ends.
783. Cleanup phase starts.
784. Red discards Overdrive from their play zone.
785. Red discards Momentum Shift from their play zone.
786. Red discards Overcharged Battery from their play zone.
787. Red discards Bull Rush from their play zone.
788. Gray discards Pry Bar from their play zone.
789. Gray discards Duct Tape & Wire from their play zone.
790. Cleanup phase ends.
791. — end of turn 19 —
792. Turn Start phase starts.
793. Revealed: Smoldering Armory, Laser Grid Security Hall, Laser Grid Security Hall.
794. You are in: Smoldering Armory.
795. To the bottom of the Floor deck: Laser Grid Security Hall, Laser Grid Security Hall.
796. Red draws Reckless Swing.
797. Red draws Charge.
798. Red draws Tag Team.
799. Red draws Overdrive.
800. Gray draws Duck Under.
801. Gray draws Pry Bar.
802. Turn Start phase ends.
803. Play phase starts.
804. NOTE — After entering Armory blind, the combined hand (Red: Salvage Kit, Reckless Swing, Charge, Tag Team, Overdrive; Gray: Pivot, I'll Take That, Duct Tape, Duck Under, Pry Bar) would likely have beaten the Monolith. The choice comes before the draw, so on floor 5 I am guessing which turn my hand will be good.
805. Gray plays Pry Bar.
806. Gray pays with Duck Under, Exhausting it.
807. Gray plays Duct Tape & Wire.
808. Red pays with Charge, Exhausting it.
809. Red plays Tag Team.
810. Tag Team triggers: Red draws Second Wind.
811. Tag Team triggers: Gray draws Quick Vault.
812. Gray plays Quick Vault.
813. Quick Vault triggers: Gray draws Pick The Lock.
814. Quick Vault triggers: Gray draws Pick The Lock.
815. Gray pays with I'll Take That, Pick The Lock, Exhausting them.
816. Gray plays Pivot.
817. Red plays Reckless Swing.
818. Reckless Swing triggers: Red Exhausts Shove.
819. Red plays Overdrive.
820. Overdrive triggers: Red Exhausts Charge.
821. Play phase ends.
822. Outcome phase starts.
823. Oomph 16 met — Both players reveal a card reward, and both players get Good Stuff.
824. Smoldering Armory is Cleared.
825. Smoldering Armory triggers: Red's reward pool shows Tag Team, Break Through, Break Through.
826. Red takes Tag Team into their discard pile.
827. Smoldering Armory triggers: Gray's reward pool shows Catch Your Breath, In Step, In Step.
828. Gray takes In Step into their discard pile.
829. Smoldering Armory triggers: Red reveals Good Stuff: Scrap Magnet, Coil Of Cable, Scrap Magnet.
830. Smoldering Armory triggers: Gray reveals Good Stuff: Duct Tape & Wire, Grav Harness, Cutting Torch.
831. Red gets Coil Of Cable.
832. Red takes Coil Of Cable into hand.
833. Gray gets Duct Tape & Wire.
834. Gray takes Duct Tape & Wire into hand.
835. Outcome phase ends.
836. Cleanup phase starts.
837. Red discards Tag Team from their play zone.
838. Red discards Reckless Swing from their play zone.
839. Red discards Overdrive from their play zone.
840. Gray discards Pry Bar from their play zone.
841. Gray discards Duct Tape & Wire from their play zone.
842. Gray discards Quick Vault from their play zone.
843. Gray discards Pivot from their play zone.
844. Cleanup phase ends.
845. — end of turn 20 —
846. Turn Start phase starts.
847. Revealed: The Monolith Core, Bio-Hazard Containment Vault, Laser Grid Security Hall.
848. NOTE — Monolith showed with a held hand of Scramble 11 (Coil, Salvage Kit, Pick The Lock, Duct Tape) and Oomph 8 if paid for. Here the choice is informed: 5 of the 10 cards are known before the draw. Taking it.
849. You are in: The Monolith Core.
850. To the bottom of the Floor deck: Laser Grid Security Hall, Bio-Hazard Containment Vault.
851. Red draws Coil Of Cable.
852. Red draws Overdrive.
853. Gray draws Peek Around Corner.
854. Gray draws Pick The Lock.
855. Gray draws Pick The Lock.
856. Turn Start phase ends.
857. Play phase starts.
858. NOTE — Monolith: best line is Oomph 9 (Overdrive 3 + Second Wind 4 paid with both Coils + Duct Tape 2), one short of 10, and Scramble would then fall short too. Red has no spare payment cards; Gray's Pick The Locks cannot pay for Red. Will Flee (Exhaust 5 each). Setting up next turn: Red plays Salvage Kit paying Second Wind and keeps Coil, Coil, Overdrive; Gray plays Pick The Lock paying Pick The Lock + Peek and keeps Pick The Lock, Duct Tape. Next flip shows all 3 remaining rooms, so I can re-enter the Monolith at once.
859. Red pays with Second Wind, Exhausting it.
860. Red plays Automated Salvage Kit.
861. Gray pays with Pick The Lock, Peek Around Corner, Exhausting them.
862. Gray plays Pick The Lock.
863. Play phase ends.
864. Outcome phase starts.
865. You Flee The Monolith Core.
866. The Monolith Core triggers: Red Exhausts Duct Tape & Wire.
867. The Monolith Core triggers: Red Exhausts Fast Follow.
868. The Monolith Core triggers: Red Exhausts Momentum Shift.
869. The Monolith Core triggers: Red Exhausts Shove.
870. The Monolith Core triggers: Red Exhausts Fast Follow.
871. The Monolith Core triggers: Gray Exhausts I Know Kung Fu.
872. The Monolith Core triggers: Gray Exhausts Duck Under.
873. The Monolith Core triggers: Gray Exhausts Hit 'n Run.
874. The Monolith Core triggers: Gray Exhausts Synergy Link.
875. The Monolith Core triggers: Gray Exhausts Zen Mode.
876. Outcome phase ends.
877. Cleanup phase starts.
878. Red discards Automated Salvage Kit from their play zone.
879. Gray discards Pick The Lock from their play zone.
880. The Monolith Core goes to the bottom of the Floor deck.
881. Cleanup phase ends.
882. — end of turn 21 —
883. Turn Start phase starts.
884. Revealed: Laser Grid Security Hall, Laser Grid Security Hall, Bio-Hazard Containment Vault.
885. NOTE — My miscount: the Floor deck held 4 (Laser, Laser, Bio-Hazard, Monolith), so the Monolith did not come back this flip. The CLI never lists the Floor deck order, though every card in it is known to me from earlier flips; a 'floor deck' line in show would have saved this.
886. You are in: Laser Grid Security Hall.
887. To the bottom of the Floor deck: Laser Grid Security Hall, Bio-Hazard Containment Vault.
888. Red draws Charge.
889. Red draws Cross Punch.
890. Gray draws Quick Vault.
891. Gray draws I Know Kung Fu.
892. Gray draws Hit 'n Run.
893. Turn Start phase ends.
894. Play phase starts.
895. NOTE — Deliberate Flee of Laser Grid (Exhaust 4 each) with no cards played. The drawn hand beats the Monolith (Red: Coil, Coil, Cross Punch paid by Charge + Overdrive = Oomph 8 Scramble 6; Gray: Quick Vault, Kung Fu, Pick The Lock = Oomph 5 Scramble 4). Hands carry over and no draw happens at 5, so fleeing banks the hand for the next flip, which must show the Monolith. Room choice plus hand carry-over makes a deliberate Flee a real move.
896. Play phase ends.
897. Outcome phase starts.
898. You Flee Laser Grid Security Hall.
899. Laser Grid Security Hall triggers: Red Exhausts Overcharged Battery.
900. Laser Grid Security Hall triggers: Red Exhausts Charge.
901. Laser Grid Security Hall triggers: Red Exhausts Reckless Swing.
902. Laser Grid Security Hall triggers: Red's deck is empty — the discard pile shuffles in to make a new one (10 cards).
903. Laser Grid Security Hall triggers: Red Exhausts Reckless Swing.
904. Laser Grid Security Hall triggers: Gray Exhausts Peek Around Corner.
905. Laser Grid Security Hall triggers: Gray Exhausts Duck Under.
906. Laser Grid Security Hall triggers: Gray Exhausts Hack the Doors.
907. Laser Grid Security Hall triggers: Gray Exhausts Pick The Lock.
908. Outcome phase ends.
909. Cleanup phase starts.
910. Laser Grid Security Hall goes to the bottom of the Floor deck.
911. Cleanup phase ends.
912. — end of turn 22 —
913. Turn Start phase starts.
914. Revealed: The Monolith Core, Laser Grid Security Hall, Bio-Hazard Containment Vault.
915. You are in: The Monolith Core.
916. To the bottom of the Floor deck: Laser Grid Security Hall, Bio-Hazard Containment Vault.
917. Turn Start phase ends.
918. Play phase starts.
919. Gray plays Quick Vault.
920. Quick Vault triggers: Gray draws Pry Bar.
921. Quick Vault triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (9 cards).
922. Quick Vault triggers: Gray draws Pivot.
923. Gray pays with Hit 'n Run, Exhausting it.
924. Gray plays I Know Kung Fu.
925. Gray plays Pry Bar.
926. Gray pays with Pivot, Duct Tape & Wire, Exhausting them.
927. Gray plays Pick The Lock.
928. Red plays Coil Of Cable.
929. Red plays Coil Of Cable.
930. Red pays with Charge, Overdrive, Exhausting them.
931. Red plays Cross Punch.
932. Cross Punch triggers: Red Exhausts Momentum Shift.
933. NOTE — Monolith: Oomph 16 Scramble 10 from the banked hand. The Kung Fu draw prompt on Red's Coil says 'Draw 1 card?' without naming who draws (Gray).
934. Play phase ends.
935. Outcome phase starts.
936. Oomph 10 and Scramble 10 met — You Win!
937. The Monolith Core is Cleared.
938. Outcome phase ends.
939. Cleanup phase starts.
940. Red discards Coil Of Cable from their play zone.
941. Red discards Coil Of Cable from their play zone.
942. Red discards Cross Punch from their play zone.
943. Gray discards Quick Vault from their play zone.
944. Gray discards I Know Kung Fu from their play zone.
945. Gray discards Pry Bar from their play zone.
946. Gray discards Pick The Lock from their play zone.
947. Cleanup phase ends.
948. — end of turn 23 —
949. Floor 5 is clear.
950. You reach the rooftop. You win.

Floor 5 · turn 23 · GameOver   floor deck 3, cleared 20   Good Stuff 39, Bad Stuff 18
Red: live 11 (deck 8, discard 3, hand 0), exhaust 20
Gray: live 12 (deck 8, discard 4, hand 0), exhaust 18
Outcome: Victory

seed 10, 255 commands replayed, recorded on R35.C58-v1, floor 5, turn 23, Victory.
```

## Run: Seed 12, room choice (R35)

Recorded 2026-10-19. Kit revision `R35.C58-v1`. Played by an agent standing in for a human
playtester, in the CLI (`bin/nvu play ... --run design/playtests/18-room-choice-seed-12.json`), seed 12, one shell call per
decision. The run ended in **Victory** on turn 23, when The Monolith Core fell to Oomph 10 /
Scramble 12 on the first turn of floor 5. There were no Flees.

Notes are the agent's, quoted as written, tagged `[agent]`. Nothing here is a ruling. Suspected
bugs were checked against `rulebook.md` and `cards.yaml` only; the engine was not read.

### How the run went

| Floor | Turns | Turns spent | Flees | Stairwell passed over |
|---|---|---|---|---|
| 1 | 1-6 | 6 | 0 | 4 |
| 2 | 7-12 | 6 | 0 | 4 |
| 3 | 13-17 | 5 | 0 | 2 |
| 4 | 18-22 | 5 | 0 | 3 |
| 5 | 23 | 1 | 0 | 0 |

Floors 1 and 2 were six turns each: every Room cleared, Stairwell last. Exhaust resets at every
Ascend, so on these floors a Room costs nothing that lasts and pays one or two card rewards. The
choice became "enter the Room with the most rewards, send the Drone to the bottom". The Drone was
passed over eight times. Once (turn 4) the choice hurt: I entered a Shaft and then drew a hand that
beat the Drone outright. On turn 5 the choice worked as intended: Red already held Reckless Swing
and two Charge, a guaranteed Oomph 9, so I took the last Shaft and left the Drone as the forced last
card. Zen Mode came from the floor 1 Drone and dominated Gray's play from floor 2 on (notes 6, 7).

Floors 3 and 4 were five turns each. The choice was now used to dodge a room: the Overgrown
Hydroponics Bay (Scramble 11, Good Stuff only, Flee gives Bad Stuff that survives Ascend) was never
entered on floor 3, because the Stairwell could be taken while the Bay was still in the deck. On
floor 4 I cleared one Bay when the hand was there, and took Gears & Glitch over the second.

Floor 5 was one turn. The Monolith Core was in the first reveal. Nothing on floor 5 lasts past a
win, and a Flee costs Exhaust 5 from decks of 27 and 31, so I entered the Core blind. Sharing Is
Caring, two Quick Vaults, Momentum Shift and Synergy Link put enough cards on the table for Oomph 10
/ Scramble 12. The three floor 5 Rooms were never faced.

### Notes

1. `[agent]` "Turn 1 room choice happens before the draw, so I pick blind to my hand. Taking
   Security Turnstile: both its challenges can pay out, two rewards. Shaft then Drone to the bottom
   so I see the Drone last." (log line 4)
   - Matches the rulebook order: reveal, enter, pass, then draw. On turn 1 the choice has no hand
     information at all. Later, held cards inform it.
2. `[agent]` "Drone revealed in the middle. Passing over it: Exhaust resets at Ascend, so every room
   cleared before the Stairwell is a free reward. Gray is at 8 live though, so I am watching stamina
   for the Drone." (line 81)
   - Question for the designer: with Exhaust reset at every Ascend, is any floor 1-4 Room ever
     worth skipping on stamina grounds? In this run it never was.
3. `[agent]` "Blind choice bit me: after entering the Shaft I drew Reckless Swing + 2 Charge, which
   beats the Drone's Oomph 8 this turn. The room choice is made before the draw, so it cannot react
   to the hand. Fine on floor 1, but it makes the choice weaker than it looks." (line 129)
   - Question: is the choice meant to come before the draw? Drawing first would make the choice
     read the hand; choosing first makes it a bet.
4. `[agent]` "Red holds Reckless Swing + 2 Charge, a guaranteed Oomph 9 next turn whatever is
   drawn. So I take the last Shaft for 2 more rewards and leave the Drone as the forced last card.
   Held cards make the blind choice informed." (line 153)
   - The best room-choice moment of the run. Cards kept in hand are what make the choice a decision.
5. `[agent]` "Floor 1 done in 6 turns, all 6 rooms cleared, 10 rewards taken. On floor 1-2 Exhaust
   is free because Ascend resets it, so the room choice reduces to: clear every Room, Stairwell
   last." (line 206)
6. `[agent]` "Zen Mode: Gray played Pick The Lock paying Duck Under + IKKF and both stayed in hand
   ('Zen Mode stops it: Gray Exhausts nothing'). ... Is a payer that is not exhausted meant to stay
   in hand, or go to discard? Staying in hand makes Gray's whole hand nearly free." (line 321)
   - Rulebook, Play: "move that number of cards from your hand to your Exhaust pile". Zen Mode:
     "While this is in play, you don't exhaust cards." Neither says where a payer goes when it is
     not exhausted. The engine leaves it in hand, so one payer can pay for every card in turn.
     Question for the designer: should the payer stay in hand, go to discard, or should Zen Mode
     stop only deck Exhaust (Overdrive, Reckless Swing)?
7. `[agent]` "Zen Mode turned Gray's 4-card hand into S12 for 1 Exhaust (Zen's own payer). Payers
   stay in hand, so each payer can pay again. This is the strongest card in the run by far."
   (line 430)
8. `[agent]` "Drone Scramble 8 scrap: Gray's only choices were good cards. The weak ones (Duck
   Under) were in the play zone or Exhaust, and Outcome comes before Cleanup, so a scrap reward
   rarely reaches the cards you used to clear the room. Declined." (line 435)
   - Consistent with the rulebook ("from their hand or discard pile", Outcome before Cleanup).
     Question: is that the intent? Scrap rewards mostly offered cards I wanted to keep.
9. `[agent]` "CLI friction: card rewards use 'take', but Good Stuff picks use 'choose'. 'take Coil
   Of Cable' was refused. Two verbs for the same 'pick one of 3' act." (line 572)
10. `[agent]` "Choosing Gears & Glitch over the Hydroponics Bay (S11 for Good Stuff only, Flee gives
    Bad Stuff that survives Ascend). Since the Stairwell can be entered whenever it is revealed,
    the choice lets me skip a bad-value room for good. The Bay is never faced." (line 642)
11. `[agent]` "Riot Shield returned to hand at the start of Outcome, printed before the room's
    rewards. Card says 'at the end of the Outcome phase'. Order matters: it is now in hand and
    offered to the Turret's scrap. Question: should it return after the outcomes resolve?" (line 837)
    - Possible engine mismatch with the printed text "at the end of the Outcome phase". The log
      shows "Riot Shield triggers: Gray takes Riot Shield into hand" before the Turret's Good
      Stuff and scrap, and Riot Shield was then offered as a scrap choice.
12. `[agent]` "Floor 5 turn 1: Monolith Core is in the first reveal. Nothing on floor 5 carries
    forward past a win, so the Rooms are only worth it as practice. Fleeing the Core costs Exhaust 5
    each from decks of 27/31. Entering the Core blind on turn 1 of the floor." (line 933)
13. `[agent]` "Victory turn 23, zero Flees. The Core fell on the first turn of floor 5 to a blind
    entry. ..." (line 997)

### What the run showed

1. Room choice plus Exhaust reset at Ascend removes all pressure on floors 1-4. Rooms are free
   rewards, Flee never happens, and the Stairwell is simply sent to the bottom. 23 turns, 0 Flees,
   about 25 card rewards and 9 Good Stuff.
2. Floor 5 can end on its first turn. With the Core in the first reveal and decks at full stamina,
   entering it is correct, and the tier 3 Rooms are never played. Question: should the Core be
   barred until some Rooms are cleared, or should floor 5 not reset into a fresh full deck?
3. Zen Mode, as the engine resolves it, makes Gray's payments free for the rest of the turn. It
   decided several turns.

### The CLI as a playtest tool

Friction, worst first:

1. `--run` on every call. In zsh, a variable holding `--run design/playtests/18-room-choice-seed-12.json` is passed as one
   argument, and the CLI printed a raw Node `TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]` stack trace
   instead of a usage line. I wrapped the CLI in a script.
2. Two verbs for one act: `take` for card rewards, `choose` for Good Stuff picks (note 9).
3. One Peek is three or four calls: discard one card, discard another or `choose none`, then
   `order`. Every "may draw" trigger (IKKF, Tag Team for each player, Synergy Link) is its own call.
4. `live` excludes the play zone, so mid-turn counts read low (Red "live 8" with 12 cards).
5. When only one room is revealed, `flip` auto-enters it. Correct per the rulebook, but the output
   has no "Revealed:" line in the same place, which broke my filter.

What it got right: the room-choice prompt lists the rooms and explains the bottom-order argument;
the refusal on `take` named the expected verb; `Zen Mode stops it` made an unusual rule visible;
the replay numbered the notes in line.

### Candidate issues

- Engine mismatch (suspected): Riot Shield returns to hand before the room's outcomes resolve, not
  at the end of the Outcome phase (note 11).
- Rulebook gap: where does a payer go when Zen Mode stops the Exhaust (note 6)?
- Rulebook question: should the room choice come before or after the Turn Start draw (note 3)?
- Rulebook question: can the floor 5 Core be entered on the floor's first turn (What the run
  showed, 2)?
- Shape: with Exhaust reset at every Ascend, floors 1-4 have no Flee risk and no stamina tension.
- Shape: scrap rewards rarely reach weak cards, because those cards are in the play zone (note 8).
- Card, for a later re-tune: Zen Mode is far stronger than any other reward.
- Card, for a later re-tune: Overgrown Hydroponics Bay (Scramble 11 for Good Stuff only) is a room
  players will skip whenever the Stairwell is revealed with it.

### Appendix

`bin/nvu replay design/playtests/18-room-choice-seed-12.json`:

```
  1. Floor 1 is built: 6 rooms.
  2. Turn Start phase starts.
  3. Revealed: Flooded Ventilation Shaft, Security Turnstile, The Sentry Drone.
  4. NOTE — Turn 1 room choice happens before the draw, so I pick blind to my hand. Taking Security Turnstile: both its challenges can pay out, two rewards. Shaft then Drone to the bottom so I see the Drone last.
  5. You are in: Security Turnstile.
  6. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
  7. Red draws Charge.
  8. Red draws Charge.
  9. Red draws Overdrive.
 10. Red draws Shove.
 11. Red draws Overdrive.
 12. Gray draws Duck Under.
 13. Gray draws Duck Under.
 14. Gray draws Pick The Lock.
 15. Gray draws Duck Under.
 16. Gray draws Pick The Lock.
 17. Turn Start phase ends.
 18. Play phase starts.
 19. Red plays Overdrive.
 20. Overdrive triggers: Red Exhausts Charge.
 21. Red plays Overdrive.
 22. Overdrive triggers: Red Exhausts Overdrive.
 23. Gray pays with Duck Under, Duck Under, Exhausting them.
 24. Gray plays Pick The Lock.
 25. Gray pays with Pick The Lock, Exhausting it.
 26. Gray plays Duck Under.
 27. Play phase ends.
 28. Outcome phase starts.
 29. Scramble 5 met — Gray reveals a card reward.
 30. Oomph 5 met — Red reveals a card reward.
 31. Security Turnstile is Cleared.
 32. Security Turnstile triggers: Gray's reward pool shows In Step, Quick Vault, Pack Mule.
 33. Gray takes Quick Vault into their discard pile.
 34. Security Turnstile triggers: Red's reward pool shows Bull Rush, Reckless Swing, Second Wind.
 35. Red takes Reckless Swing into their discard pile.
 36. Outcome phase ends.
 37. Cleanup phase starts.
 38. Red discards Overdrive from their play zone.
 39. Red discards Overdrive from their play zone.
 40. Gray discards Pick The Lock from their play zone.
 41. Gray discards Duck Under from their play zone.
 42. Cleanup phase ends.
 43. — end of turn 1 —
 44. Turn Start phase starts.
 45. Revealed: Flooded Ventilation Shaft, Security Turnstile, Flooded Ventilation Shaft.
 46. You are in: Security Turnstile.
 47. To the bottom of the Floor deck: Flooded Ventilation Shaft, Flooded Ventilation Shaft.
 48. Red draws Shove.
 49. Red draws Lean In.
 50. Gray draws Pick The Lock.
 51. Gray draws Peek Around Corner.
 52. Gray draws Work The Angles.
 53. Gray draws Pick The Lock.
 54. Gray draws Pick The Lock.
 55. Turn Start phase ends.
 56. Play phase starts.
 57. Gray pays with Pick The Lock, Peek Around Corner, Exhausting them.
 58. Gray plays Pick The Lock.
 59. Gray pays with Pick The Lock, Exhausting it.
 60. Gray plays Work The Angles.
 61. Red pays with Shove, Shove, Exhausting them.
 62. Red plays Charge.
 63. Play phase ends.
 64. Outcome phase starts.
 65. Scramble 5 met — Gray reveals a card reward.
 66. Oomph 5 met — Red reveals a card reward.
 67. Security Turnstile is Cleared.
 68. Security Turnstile triggers: Gray's reward pool shows I Know Kung Fu, Covering Fire, Synergy Link.
 69. Gray takes I Know Kung Fu into their discard pile.
 70. Security Turnstile triggers: Red's reward pool shows Heavy Pockets, Set 'Em Up, Junk Launcher.
 71. Red takes Heavy Pockets into their discard pile.
 72. Outcome phase ends.
 73. Cleanup phase starts.
 74. Red discards Charge from their play zone.
 75. Gray discards Pick The Lock from their play zone.
 76. Gray discards Work The Angles from their play zone.
 77. Cleanup phase ends.
 78. — end of turn 2 —
 79. Turn Start phase starts.
 80. Revealed: Flooded Ventilation Shaft, The Sentry Drone, Flooded Ventilation Shaft.
 81. NOTE — Drone revealed in the middle. Passing over it: Exhaust resets at Ascend, so every room cleared before the Stairwell is a free reward. Gray is at 8 live though, so I am watching stamina for the Drone.
 82. You are in: Flooded Ventilation Shaft.
 83. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
 84. Red draws Charge.
 85. Red draws Shove.
 86. Red draws Shove.
 87. Gray draws Duck Under.
 88. Gray draws Peek Around Corner.
 89. Gray's deck is empty — the discard pile shuffles in to make a new one (6 cards).
 90. Gray draws I Know Kung Fu.
 91. Gray draws Work The Angles.
 92. Gray draws Duck Under.
 93. Turn Start phase ends.
 94. Play phase starts.
 95. Red pays with Shove, Exhausting it.
 96. Red plays Lean In.
 97. Red pays with Charge, Exhausting it.
 98. Red plays Shove.
 99. Gray pays with Peek Around Corner, Exhausting it.
100. Gray plays Duck Under.
101. Play phase ends.
102. Outcome phase starts.
103. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
104. Flooded Ventilation Shaft is Cleared.
105. Flooded Ventilation Shaft triggers: Red's reward pool shows Cross Punch, Second Wind, Momentum Shift.
106. Red takes Momentum Shift into their discard pile.
107. Flooded Ventilation Shaft triggers: Gray's reward pool shows Hit 'n Run, One Man's Junk, Pivot.
108. Gray takes Pivot into their discard pile.
109. Outcome phase ends.
110. Cleanup phase starts.
111. Red discards Lean In from their play zone.
112. Red discards Shove from their play zone.
113. Gray discards Duck Under from their play zone.
114. Cleanup phase ends.
115. — end of turn 3 —
116. Turn Start phase starts.
117. Revealed: Flooded Ventilation Shaft, Flooded Ventilation Shaft, The Sentry Drone.
118. You are in: Flooded Ventilation Shaft.
119. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
120. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
121. Red draws Charge.
122. Red draws Reckless Swing.
123. Red draws Shove.
124. Red draws Heavy Pockets.
125. Gray draws Pick The Lock.
126. Gray draws Pick The Lock.
127. Turn Start phase ends.
128. Play phase starts.
129. NOTE — Blind choice bit me: after entering the Shaft I drew Reckless Swing + 2 Charge, which beats the Drone's Oomph 8 this turn. The room choice is made before the draw, so it cannot react to the hand. Fine on floor 1, but it makes the choice weaker than it looks.
130. Red pays with Shove, Exhausting it.
131. Red plays Heavy Pockets.
132. Gray pays with Pick The Lock, Exhausting it.
133. Gray plays Work The Angles.
134. Gray pays with Pick The Lock, Exhausting it.
135. Gray plays Duck Under.
136. Play phase ends.
137. Outcome phase starts.
138. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
139. Flooded Ventilation Shaft is Cleared.
140. Flooded Ventilation Shaft triggers: Red's reward pool shows Reckless Swing, Brute Recycle, Brute Recycle.
141. Red takes Reckless Swing into their discard pile.
142. Flooded Ventilation Shaft triggers: Gray's reward pool shows Hack the Doors, Catch Your Breath, In Step.
143. Gray takes Hack the Doors into their discard pile.
144. Outcome phase ends.
145. Cleanup phase starts.
146. Red discards Heavy Pockets from their play zone.
147. Gray discards Work The Angles from their play zone.
148. Gray discards Duck Under from their play zone.
149. Cleanup phase ends.
150. — end of turn 4 —
151. Turn Start phase starts.
152. Revealed: Flooded Ventilation Shaft, The Sentry Drone.
153. NOTE — Red holds Reckless Swing + 2 Charge, a guaranteed Oomph 9 next turn whatever is drawn. So I take the last Shaft for 2 more rewards and leave the Drone as the forced last card. Held cards make the blind choice informed.
154. You are in: Flooded Ventilation Shaft.
155. To the bottom of the Floor deck: The Sentry Drone.
156. Red draws Overdrive.
157. Red draws Overdrive.
158. Gray draws Quick Vault.
159. Gray's deck is empty — the discard pile shuffles in to make a new one (5 cards).
160. Gray draws Duck Under.
161. Gray draws Work The Angles.
162. Gray draws Hack the Doors.
163. Turn Start phase ends.
164. Play phase starts.
165. Gray pays with Duck Under, Exhausting it.
166. Gray plays Hack the Doors.
167. Hack the Doors triggers: A look at the Red deck: Lean In, Momentum Shift.
168. Red plays Overdrive.
169. Overdrive triggers: Red Exhausts Lean In.
170. Play phase ends.
171. Outcome phase starts.
172. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
173. Flooded Ventilation Shaft is Cleared.
174. Flooded Ventilation Shaft triggers: Red's reward pool shows Set 'Em Up, Heavy Pockets, Fast Follow.
175. Red takes Fast Follow into their discard pile.
176. Flooded Ventilation Shaft triggers: Gray's reward pool shows Hit 'n Run, I'll Take That, Pivot.
177. Gray takes Pivot into their discard pile.
178. Outcome phase ends.
179. Cleanup phase starts.
180. Red discards Overdrive from their play zone.
181. Gray discards Hack the Doors from their play zone.
182. Cleanup phase ends.
183. — end of turn 5 —
184. Turn Start phase starts.
185. You are in: The Sentry Drone.
186. Red draws Momentum Shift.
187. Gray draws Duck Under.
188. Gray draws Pivot.
189. Turn Start phase ends.
190. Play phase starts.
191. Gray plays Quick Vault.
192. Quick Vault triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (2 cards).
193. Quick Vault triggers: Gray draws Hack the Doors.
194. Quick Vault triggers: Gray draws Pivot.
195. Red pays with Overdrive, Exhausting it.
196. Red plays Reckless Swing.
197. Reckless Swing triggers: Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
198. Reckless Swing triggers: Red Exhausts Reckless Swing.
199. Red pays with Charge, Momentum Shift, Exhausting them.
200. Red plays Charge.
201. Play phase ends.
202. Outcome phase starts.
203. Oomph 8 met — Ascend, and both players reveal a card reward.
204. The Sentry Drone is Cleared.
205. The Sentry Drone triggers: Red's reward pool shows Bull Rush, Fast Follow, Junk Launcher.
206. NOTE — Floor 1 done in 6 turns, all 6 rooms cleared, 10 rewards taken. On floor 1-2 Exhaust is free because Ascend resets it, so the room choice reduces to: clear every Room, Stairwell last.
207. Red takes Fast Follow into their discard pile.
208. The Sentry Drone triggers: Gray's reward pool shows Hack the Doors, Zen Mode, One Man's Junk.
209. Gray takes Zen Mode into their discard pile.
210. Outcome phase ends.
211. Cleanup phase starts.
212. Red discards Reckless Swing from their play zone.
213. Red discards Charge from their play zone.
214. Gray discards Quick Vault from their play zone.
215. Cleanup phase ends.
216. — end of turn 6 —
217. Floor 1 is clear.
218. Red shuffles 15 cards back in.
219. Gray shuffles 18 cards back in.
220. Floor 2 is built: 6 rooms.
221. Turn Start phase starts.
222. Revealed: The Sentry Drone, Flooded Ventilation Shaft, Security Turnstile.
223. You are in: Security Turnstile.
224. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
225. Red draws Shove.
226. Red draws Fast Follow.
227. Red draws Heavy Pockets.
228. Red draws Charge.
229. Red draws Reckless Swing.
230. Gray draws Quick Vault.
231. Gray draws Pick The Lock.
232. Gray draws Peek Around Corner.
233. Gray draws Pick The Lock.
234. Gray draws Pick The Lock.
235. Turn Start phase ends.
236. Play phase starts.
237. Gray plays Quick Vault.
238. Quick Vault triggers: Gray draws Duck Under.
239. Quick Vault triggers: Gray draws Work The Angles.
240. Gray pays with Peek Around Corner, Work The Angles, Exhausting them.
241. Gray plays Pick The Lock.
242. Gray pays with Pick The Lock, Exhausting it.
243. Gray plays Duck Under.
244. Red plays Fast Follow.
245. Red pays with Heavy Pockets, Exhausting it.
246. Red plays Shove.
247. Play phase ends.
248. Outcome phase starts.
249. Scramble 5 met — Gray reveals a card reward.
250. Oomph 5 met — Red reveals a card reward.
251. Security Turnstile is Cleared.
252. Security Turnstile triggers: Gray's reward pool shows Sharing Is Caring, I Know Kung Fu, Pack Mule.
253. Gray takes I Know Kung Fu into their discard pile.
254. Security Turnstile triggers: Red's reward pool shows Momentum Shift, Rhythm & Bruise, Tag Team.
255. Red takes Tag Team into their discard pile.
256. Outcome phase ends.
257. Cleanup phase starts.
258. Red discards Fast Follow from their play zone.
259. Red discards Shove from their play zone.
260. Gray discards Quick Vault from their play zone.
261. Gray discards Pick The Lock from their play zone.
262. Gray discards Duck Under from their play zone.
263. Cleanup phase ends.
264. — end of turn 7 —
265. Turn Start phase starts.
266. Revealed: Security Turnstile, Flooded Ventilation Shaft, Flooded Ventilation Shaft.
267. You are in: Security Turnstile.
268. To the bottom of the Floor deck: Flooded Ventilation Shaft, Flooded Ventilation Shaft.
269. Red draws Overdrive.
270. Red draws Fast Follow.
271. Red draws Reckless Swing.
272. Gray draws Pivot.
273. Gray draws Hack the Doors.
274. Gray draws Duck Under.
275. Gray draws I Know Kung Fu.
276. Turn Start phase ends.
277. Play phase starts.
278. Gray pays with Pivot, Exhausting it.
279. Gray plays Hack the Doors.
280. Hack the Doors triggers: A look at the Red deck: Shove, Overdrive, Charge.
281. Gray pays with Pick The Lock, Exhausting it.
282. Gray plays Duck Under.
283. Red plays Fast Follow.
284. Red plays Overdrive.
285. Overdrive triggers: Red Exhausts Shove.
286. Play phase ends.
287. Outcome phase starts.
288. Scramble 5 met — Gray reveals a card reward.
289. Oomph 5 met — Red reveals a card reward.
290. Security Turnstile is Cleared.
291. Security Turnstile triggers: Gray's reward pool shows I'll Take That, Covering Fire, Catch Your Breath.
292. Gray takes I'll Take That into their discard pile.
293. Security Turnstile triggers: Red's reward pool shows Tag Team, Rhythm & Bruise, Reckless Swing.
294. Red takes Tag Team into their discard pile.
295. Outcome phase ends.
296. Cleanup phase starts.
297. Red discards Fast Follow from their play zone.
298. Red discards Overdrive from their play zone.
299. Gray discards Hack the Doors from their play zone.
300. Gray discards Duck Under from their play zone.
301. Cleanup phase ends.
302. — end of turn 8 —
303. Turn Start phase starts.
304. Revealed: Flooded Ventilation Shaft, The Sentry Drone, Flooded Ventilation Shaft.
305. You are in: Flooded Ventilation Shaft.
306. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
307. Red draws Charge.
308. Red draws Overdrive.
309. Gray draws Pick The Lock.
310. Gray draws Zen Mode.
311. Gray draws Duck Under.
312. Gray draws Peek Around Corner.
313. Turn Start phase ends.
314. Play phase starts.
315. Gray pays with Peek Around Corner, Exhausting it.
316. Gray plays Zen Mode.
317. Zen Mode stops it: Gray Exhausts nothing.
318. Gray plays Pick The Lock.
319. Red plays Overdrive.
320. Overdrive triggers: Red Exhausts Charge.
321. NOTE — Zen Mode: Gray played Pick The Lock paying Duck Under + IKKF and both stayed in hand ('Zen Mode stops it: Gray Exhausts nothing'). So with Zen Mode in play the payers are not moved at all, they remain usable. Rulebook says pay = move cards to Exhaust; Zen card says 'you don't exhaust cards'. Is a payer that is not exhausted meant to stay in hand, or go to discard? Staying in hand makes Gray's whole hand nearly free.
322. Play phase ends.
323. Outcome phase starts.
324. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
325. Flooded Ventilation Shaft is Cleared.
326. Flooded Ventilation Shaft triggers: Red's reward pool shows Cross Punch, Fast Follow, It Pays To Be Reckless.
327. Red takes Cross Punch into their discard pile.
328. Flooded Ventilation Shaft triggers: Gray's reward pool shows Synergy Link, Quick Vault, In Step.
329. Gray takes Synergy Link into their discard pile.
330. Outcome phase ends.
331. Cleanup phase starts.
332. Red discards Overdrive from their play zone.
333. Gray discards Zen Mode from their play zone.
334. Gray discards Pick The Lock from their play zone.
335. Cleanup phase ends.
336. — end of turn 9 —
337. Turn Start phase starts.
338. Revealed: Flooded Ventilation Shaft, Flooded Ventilation Shaft, The Sentry Drone.
339. You are in: Flooded Ventilation Shaft.
340. To the bottom of the Floor deck: Flooded Ventilation Shaft, The Sentry Drone.
341. Red draws Overdrive.
342. Gray draws Pivot.
343. Gray draws Pick The Lock.
344. Gray draws Duck Under.
345. Turn Start phase ends.
346. Play phase starts.
347. Gray pays with Duck Under, Duck Under, Exhausting them.
348. Gray plays Pick The Lock.
349. Red plays Overdrive.
350. Overdrive triggers: Red Exhausts Charge.
351. Play phase ends.
352. Outcome phase starts.
353. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
354. Flooded Ventilation Shaft is Cleared.
355. Flooded Ventilation Shaft triggers: Red's reward pool shows Break Through, Break Through, Bull Rush.
356. Red takes Break Through into their discard pile.
357. Flooded Ventilation Shaft triggers: Gray's reward pool shows Pack Mule, Covering Fire, Synergy Link.
358. Gray takes Pack Mule into their discard pile.
359. Outcome phase ends.
360. Cleanup phase starts.
361. Red discards Overdrive from their play zone.
362. Gray discards Pick The Lock from their play zone.
363. Cleanup phase ends.
364. — end of turn 10 —
365. Turn Start phase starts.
366. Revealed: Flooded Ventilation Shaft, The Sentry Drone.
367. You are in: Flooded Ventilation Shaft.
368. To the bottom of the Floor deck: The Sentry Drone.
369. Red draws Momentum Shift.
370. Gray's deck is empty — the discard pile shuffles in to make a new one (12 cards).
371. Gray draws Hack the Doors.
372. Gray draws I Know Kung Fu.
373. Gray draws Pack Mule.
374. Turn Start phase ends.
375. Play phase starts.
376. Gray pays with Pack Mule, Exhausting it.
377. Gray plays I Know Kung Fu.
378. Gray pays with Pivot, Exhausting it.
379. Gray plays Hack the Doors.
380. Hack the Doors triggers: A look at the Gray deck: Synergy Link, Quick Vault, Pick The Lock.
381. I Know Kung Fu triggers: Gray draws Quick Vault.
382. Play phase ends.
383. Outcome phase starts.
384. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
385. Flooded Ventilation Shaft is Cleared.
386. Flooded Ventilation Shaft triggers: Red's reward pool shows Second Wind, Set 'Em Up, Junk Launcher.
387. Red takes Second Wind into their discard pile.
388. Flooded Ventilation Shaft triggers: Gray's reward pool shows Hit 'n Run, One Man's Junk, Catch Your Breath.
389. Gray takes Hit 'n Run into their discard pile.
390. Outcome phase ends.
391. Cleanup phase starts.
392. Gray discards I Know Kung Fu from their play zone.
393. Gray discards Hack the Doors from their play zone.
394. Cleanup phase ends.
395. — end of turn 11 —
396. Turn Start phase starts.
397. You are in: The Sentry Drone.
398. Gray draws Synergy Link.
399. Gray draws Pick The Lock.
400. Gray draws Pick The Lock.
401. Turn Start phase ends.
402. Play phase starts.
403. Red pays with Momentum Shift, Exhausting it.
404. Red plays Reckless Swing.
405. Reckless Swing triggers: Red Exhausts Shove.
406. Red pays with Charge, Exhausting it.
407. Red plays Reckless Swing.
408. Reckless Swing triggers: Red Exhausts Shove.
409. Gray plays Quick Vault.
410. Quick Vault triggers: Gray draws Zen Mode.
411. Quick Vault triggers: Gray draws Duck Under.
412. Gray pays with I Know Kung Fu, Exhausting it.
413. Gray plays Synergy Link.
414. Synergy Link triggers: Gray draws Pick The Lock.
415. Synergy Link triggers: Gray draws Duck Under.
416. Gray pays with Duck Under, Exhausting it.
417. Gray plays Zen Mode.
418. Zen Mode stops it: Gray Exhausts nothing.
419. Gray plays Pick The Lock.
420. Zen Mode stops it: Gray Exhausts nothing.
421. Gray plays Pick The Lock.
422. Zen Mode stops it: Gray Exhausts nothing.
423. Gray plays Duck Under.
424. Play phase ends.
425. Outcome phase starts.
426. Oomph 8 met — Ascend, and both players reveal a card reward.
427. Scramble 8 met — Ascend, and both players may Scrap a card from their hand or discard pile.
428. The Sentry Drone is Cleared.
429. The Sentry Drone triggers: Red's reward pool shows Cross Punch, Second Wind, Brute Recycle.
430. NOTE — Zen Mode turned Gray's 4-card hand into S12 for 1 Exhaust (Zen's own payer). Payers stay in hand, so each payer can pay again. This is the strongest card in the run by far.
431. Red takes Cross Punch into their discard pile.
432. The Sentry Drone triggers: Gray's reward pool shows In Step, Hit 'n Run, I'll Take That.
433. Gray takes I'll Take That into their discard pile.
434. Shove is Scrapped.
435. NOTE — Drone Scramble 8 scrap: Gray's only choices were good cards. The weak ones (Duck Under) were in the play zone or Exhaust, and Outcome comes before Cleanup, so a scrap reward rarely reaches the cards you used to clear the room. Declined.
436. Outcome phase ends.
437. Cleanup phase starts.
438. Red discards Reckless Swing from their play zone.
439. Red discards Reckless Swing from their play zone.
440. Gray discards Quick Vault from their play zone.
441. Gray discards Synergy Link from their play zone.
442. Gray discards Zen Mode from their play zone.
443. Gray discards Pick The Lock from their play zone.
444. Gray discards Pick The Lock from their play zone.
445. Gray discards Duck Under from their play zone.
446. Cleanup phase ends.
447. — end of turn 12 —
448. Floor 2 is clear.
449. Red shuffles 22 cards back in.
450. Gray shuffles 23 cards back in.
451. Floor 3 is built: 6 rooms.
452. Turn Start phase starts.
453. Revealed: Pressurized Maintenance Hub, Automated Defense Turret, Automated Defense Turret.
454. You are in: Pressurized Maintenance Hub.
455. To the bottom of the Floor deck: Automated Defense Turret, Automated Defense Turret.
456. Red draws Fast Follow.
457. Red draws Second Wind.
458. Red draws Cross Punch.
459. Red draws Charge.
460. Red draws Reckless Swing.
461. Gray draws Pack Mule.
462. Gray draws Hack the Doors.
463. Gray draws Duck Under.
464. Gray draws Pick The Lock.
465. Gray draws Work The Angles.
466. Turn Start phase ends.
467. Play phase starts.
468. Gray pays with Work The Angles, Exhausting it.
469. Gray plays Hack the Doors.
470. Hack the Doors triggers: A look at the Red deck: Fast Follow, Reckless Swing, Tag Team.
471. Gray pays with Duck Under, Pack Mule, Exhausting them.
472. Gray plays Pick The Lock.
473. Red plays Fast Follow.
474. Red pays with Charge, Exhausting it.
475. Red plays Reckless Swing.
476. Reckless Swing triggers: Red Exhausts Fast Follow.
477. Play phase ends.
478. Outcome phase starts.
479. Oomph 7 met — Red reveals a card reward.
480. Scramble 7 met — Gray reveals a card reward.
481. Pressurized Maintenance Hub is Cleared.
482. Pressurized Maintenance Hub triggers: Red's reward pool shows Brute Recycle, Set 'Em Up, Heavy Pockets.
483. Red takes Brute Recycle into their discard pile.
484. Pressurized Maintenance Hub triggers: Gray's reward pool shows Hack the Doors, One Man's Junk, Sharing Is Caring.
485. Gray takes Hack the Doors into their discard pile.
486. Outcome phase ends.
487. Cleanup phase starts.
488. Red discards Fast Follow from their play zone.
489. Red discards Reckless Swing from their play zone.
490. Gray discards Hack the Doors from their play zone.
491. Gray discards Pick The Lock from their play zone.
492. Cleanup phase ends.
493. — end of turn 13 —
494. Turn Start phase starts.
495. Revealed: Overgrown Hydroponics Bay, Gears & Glitch, Pressurized Maintenance Hub.
496. You are in: Pressurized Maintenance Hub.
497. To the bottom of the Floor deck: Overgrown Hydroponics Bay, Gears & Glitch.
498. Red draws Reckless Swing.
499. Red draws Tag Team.
500. Red draws Lean In.
501. Gray draws Zen Mode.
502. Gray draws Pick The Lock.
503. Gray draws Peek Around Corner.
504. Gray draws Pivot.
505. Gray draws Duck Under.
506. Turn Start phase ends.
507. Play phase starts.
508. Gray pays with Peek Around Corner, Exhausting it.
509. Gray plays Zen Mode.
510. Zen Mode stops it: Gray Exhausts nothing.
511. Gray plays Pivot.
512. Zen Mode stops it: Gray Exhausts nothing.
513. Gray plays Duck Under.
514. Red plays Tag Team.
515. Tag Team triggers: Red draws Tag Team.
516. Tag Team triggers: Gray draws Hit 'n Run.
517. Zen Mode stops it: Gray Exhausts nothing.
518. Gray plays Hit 'n Run.
519. Hit 'n Run triggers: Gray shuffles 1 card back in.
520. Red pays with Lean In, Exhausting it.
521. Red plays Reckless Swing.
522. Reckless Swing triggers: Red Exhausts Shove.
523. Play phase ends.
524. Outcome phase starts.
525. Oomph 7 met — Red reveals a card reward.
526. Scramble 7 met — Gray reveals a card reward.
527. Pressurized Maintenance Hub is Cleared.
528. Pressurized Maintenance Hub triggers: Red's reward pool shows Bull Rush, Junk Launcher, Momentum Shift.
529. Red takes Momentum Shift into their discard pile.
530. Pressurized Maintenance Hub triggers: Gray's reward pool shows Pack Mule, Covering Fire, Catch Your Breath.
531. Gray takes Pack Mule into their discard pile.
532. Outcome phase ends.
533. Cleanup phase starts.
534. Red discards Tag Team from their play zone.
535. Red discards Reckless Swing from their play zone.
536. Gray discards Zen Mode from their play zone.
537. Gray discards Pivot from their play zone.
538. Gray discards Duck Under from their play zone.
539. Gray discards Hit 'n Run from their play zone.
540. Cleanup phase ends.
541. — end of turn 14 —
542. Turn Start phase starts.
543. Revealed: Automated Defense Turret, Automated Defense Turret, Overgrown Hydroponics Bay.
544. You are in: Automated Defense Turret.
545. To the bottom of the Floor deck: Automated Defense Turret, Overgrown Hydroponics Bay.
546. Red draws Heavy Pockets.
547. Red draws Charge.
548. Gray draws Pick The Lock.
549. Gray draws I'll Take That.
550. Gray draws Pack Mule.
551. Gray draws Peek Around Corner.
552. Turn Start phase ends.
553. Play phase starts.
554. Gray pays with Peek Around Corner, Exhausting it.
555. Gray plays Pack Mule.
556. Gray pays with Pick The Lock, Exhausting it.
557. Gray plays I'll Take That.
558. Red pays with Heavy Pockets, Exhausting it.
559. Red plays Tag Team.
560. Tag Team triggers: Red draws Overdrive.
561. Tag Team triggers: Gray draws I Know Kung Fu.
562. Red pays with Second Wind, Charge, Exhausting them.
563. Red plays Cross Punch.
564. Cross Punch triggers: Red Exhausts Charge.
565. Play phase ends.
566. Outcome phase starts.
567. Scramble 8 met — Both players get Good Stuff.
568. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
569. Automated Defense Turret is Cleared.
570. Automated Defense Turret triggers: Red reveals Good Stuff: Coil Of Cable, Scrap Magnet, Duct Tape & Wire.
571. Automated Defense Turret triggers: Gray reveals Good Stuff: Duct Tape & Wire, Overcharged Battery, High-Frequency Scanner.
572. NOTE — CLI friction: card rewards use 'take', but Good Stuff picks use 'choose'. 'take Coil Of Cable' was refused. Two verbs for the same 'pick one of 3' act.
573. Red gets Coil Of Cable.
574. Red takes Coil Of Cable into hand.
575. Gray gets Overcharged Battery.
576. Gray takes Overcharged Battery into hand.
577. Overdrive is Scrapped.
578. Duck Under is Scrapped.
579. Outcome phase ends.
580. Cleanup phase starts.
581. Red discards Tag Team from their play zone.
582. Red discards Cross Punch from their play zone.
583. Gray discards Pack Mule from their play zone.
584. Gray discards I'll Take That from their play zone.
585. Cleanup phase ends.
586. — end of turn 15 —
587. Turn Start phase starts.
588. Revealed: Gears & Glitch, Automated Defense Turret, Overgrown Hydroponics Bay.
589. You are in: Automated Defense Turret.
590. To the bottom of the Floor deck: Overgrown Hydroponics Bay, Gears & Glitch.
591. Red draws Overdrive.
592. Red draws Charge.
593. Red draws Momentum Shift.
594. Red draws Break Through.
595. Gray draws Pivot.
596. Gray draws Duck Under.
597. Turn Start phase ends.
598. Play phase starts.
599. Gray pays with Duck Under, Exhausting it.
600. Gray plays I Know Kung Fu.
601. Gray pays with Pick The Lock, Exhausting it.
602. Gray plays Overcharged Battery.
603. I Know Kung Fu triggers: Gray draws Pick The Lock.
604. Gray plays Pivot.
605. I Know Kung Fu triggers: Gray draws Synergy Link.
606. Red plays Momentum Shift.
607. Momentum Shift triggers: Red draws Shove.
608. Momentum Shift triggers: Red draws Overdrive.
609. Momentum Shift triggers: Red Exhausts Shove.
610. Red plays Coil Of Cable.
611. I Know Kung Fu triggers: Gray draws I'll Take That.
612. Gray pays with Pick The Lock, Exhausting it.
613. Gray plays Synergy Link.
614. Synergy Link triggers: Gray draws Duck Under.
615. Synergy Link triggers: Gray draws Quick Vault.
616. I Know Kung Fu triggers: Gray draws Pick The Lock.
617. Play phase ends.
618. Outcome phase starts.
619. Scramble 8 met — Both players get Good Stuff.
620. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
621. Automated Defense Turret is Cleared.
622. Automated Defense Turret triggers: Red reveals Good Stuff: Stim Pack, Scrap Magnet, Pocket Dynamo.
623. Automated Defense Turret triggers: Gray reveals Good Stuff: High-Frequency Scanner, A Pair Of Stitch-Em-Ups, Crowbar.
624. Red gets Stim Pack.
625. Red takes Stim Pack into hand.
626. Gray gets High-Frequency Scanner.
627. Gray takes High-Frequency Scanner into hand.
628. Overdrive is Scrapped.
629. Duck Under is Scrapped.
630. Outcome phase ends.
631. Cleanup phase starts.
632. Red discards Momentum Shift from their play zone.
633. Red discards Coil Of Cable from their play zone.
634. Gray discards I Know Kung Fu from their play zone.
635. Gray discards Overcharged Battery from their play zone.
636. Gray discards Pivot from their play zone.
637. Gray discards Synergy Link from their play zone.
638. Cleanup phase ends.
639. — end of turn 16 —
640. Turn Start phase starts.
641. Revealed: Overgrown Hydroponics Bay, Gears & Glitch.
642. NOTE — Choosing Gears & Glitch over the Hydroponics Bay (S11 for Good Stuff only, Flee gives Bad Stuff that survives Ascend). Since the Stairwell can be entered whenever it is revealed, the choice lets me skip a bad-value room for good. The Bay is never faced.
643. You are in: Gears & Glitch.
644. To the bottom of the Floor deck: Overgrown Hydroponics Bay.
645. Red draws Cross Punch.
646. Gray draws I Know Kung Fu.
647. Turn Start phase ends.
648. Play phase starts.
649. Red plays Stim Pack.
650. Stim Pack triggers: Red draws Shove.
651. Gray plays Quick Vault.
652. Quick Vault triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
653. Quick Vault triggers: Gray draws Zen Mode.
654. Quick Vault triggers: Gray draws Pack Mule.
655. Gray pays with Pack Mule, Exhausting it.
656. Gray plays Zen Mode.
657. Zen Mode stops it: Gray Exhausts nothing.
658. Gray plays I Know Kung Fu.
659. Zen Mode stops it: Gray Exhausts nothing.
660. Gray plays I'll Take That.
661. I Know Kung Fu triggers: Gray draws Hit 'n Run.
662. Zen Mode stops it: Gray Exhausts nothing.
663. Gray plays High-Frequency Scanner.
664. High-Frequency Scanner triggers: A look at the Floor deck: Overgrown Hydroponics Bay.
665. I Know Kung Fu triggers: Gray draws I Know Kung Fu.
666. Zen Mode stops it: Gray Exhausts nothing.
667. Gray plays Pick The Lock.
668. I Know Kung Fu triggers: Gray draws Pack Mule.
669. Zen Mode stops it: Gray Exhausts nothing.
670. Gray plays Hit 'n Run.
671. Hit 'n Run triggers: Gray shuffles 1 card back in.
672. I Know Kung Fu triggers: Gray draws Hack the Doors.
673. Red plays Overdrive.
674. Overdrive triggers: Red's deck is empty — the discard pile shuffles in to make a new one (10 cards).
675. Overdrive triggers: Red Exhausts Momentum Shift.
676. Red pays with Charge, Break Through, Exhausting them.
677. Red plays Cross Punch.
678. Cross Punch triggers: Red Exhausts Momentum Shift.
679. Play phase ends.
680. Outcome phase starts.
681. Oomph 12 met — Ascend, and both players reveal a card reward.
682. Oomph 7 and Scramble 7 met — Ascend; one player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
683. Gears & Glitch is Cleared.
684. Gears & Glitch triggers: Red's reward pool shows Rhythm & Bruise, Rhythm & Bruise, Reckless Swing.
685. Red takes Reckless Swing into their discard pile.
686. Gears & Glitch triggers: Gray's reward pool shows Quick Vault, In Step, Covering Fire.
687. Gray takes Quick Vault into their discard pile.
688. Gears & Glitch triggers: Gray's reward pool shows Synergy Link, One Man's Junk, Catch Your Breath.
689. Gray takes Synergy Link into their discard pile.
690. Shove is Scrapped.
691. Outcome phase ends.
692. Cleanup phase starts.
693. Red discards Stim Pack from their play zone.
694. Red discards Overdrive from their play zone.
695. Red discards Cross Punch from their play zone.
696. Gray discards Quick Vault from their play zone.
697. Gray discards Zen Mode from their play zone.
698. Gray discards I Know Kung Fu from their play zone.
699. Gray discards I'll Take That from their play zone.
700. Gray discards High-Frequency Scanner from their play zone.
701. Gray discards Pick The Lock from their play zone.
702. Gray discards Hit 'n Run from their play zone.
703. Cleanup phase ends.
704. — end of turn 17 —
705. Floor 3 is clear.
706. Red shuffles 17 cards back in.
707. Gray shuffles 20 cards back in.
708. Floor 4 is built: 6 rooms.
709. Turn Start phase starts.
710. Revealed: Automated Defense Turret, Overgrown Hydroponics Bay, Pressurized Maintenance Hub.
711. You are in: Pressurized Maintenance Hub.
712. To the bottom of the Floor deck: Automated Defense Turret, Overgrown Hydroponics Bay.
713. Red draws Charge.
714. Red draws Cross Punch.
715. Red draws Coil Of Cable.
716. Red draws Lean In.
717. Red draws Shove.
718. Gray draws Synergy Link.
719. Gray draws Peek Around Corner.
720. Gray draws Pick The Lock.
721. Gray draws Duck Under.
722. Gray draws I Know Kung Fu.
723. Turn Start phase ends.
724. Play phase starts.
725. Red plays Coil Of Cable.
726. Red pays with Shove, Lean In, Exhausting them.
727. Red plays Cross Punch.
728. Cross Punch triggers: Red Exhausts Break Through.
729. Gray pays with Peek Around Corner, Duck Under, Exhausting them.
730. Gray plays Pick The Lock.
731. Play phase ends.
732. Outcome phase starts.
733. Oomph 7 met — Red reveals a card reward.
734. Scramble 7 met — Gray reveals a card reward.
735. Pressurized Maintenance Hub is Cleared.
736. Pressurized Maintenance Hub triggers: Red's reward pool shows Fast Follow, It Pays To Be Reckless, Break Through.
737. Red takes It Pays To Be Reckless into their discard pile.
738. Pressurized Maintenance Hub triggers: Gray's reward pool shows In Step, Hit 'n Run, One Man's Junk.
739. Gray declines the reward.
740. Outcome phase ends.
741. Cleanup phase starts.
742. Red discards Coil Of Cable from their play zone.
743. Red discards Cross Punch from their play zone.
744. Gray discards Pick The Lock from their play zone.
745. Cleanup phase ends.
746. — end of turn 18 —
747. Turn Start phase starts.
748. Revealed: Overgrown Hydroponics Bay, Automated Defense Turret, Gears & Glitch.
749. You are in: Automated Defense Turret.
750. To the bottom of the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay.
751. Red draws Tag Team.
752. Red draws Fast Follow.
753. Red draws Overdrive.
754. Red draws Heavy Pockets.
755. Gray draws Quick Vault.
756. Gray draws Hack the Doors.
757. Gray draws I'll Take That.
758. Turn Start phase ends.
759. Play phase starts.
760. Gray plays Quick Vault.
761. Quick Vault triggers: Gray draws Pick The Lock.
762. Quick Vault triggers: Gray draws Synergy Link.
763. Gray pays with Pick The Lock, Exhausting it.
764. Gray plays I Know Kung Fu.
765. Red plays Fast Follow.
766. Red plays Overdrive.
767. Overdrive triggers: Red Exhausts Charge.
768. Gray pays with Synergy Link, Exhausting it.
769. Gray plays Hack the Doors.
770. Hack the Doors triggers: A look at the Red deck: Reckless Swing, Fast Follow, Shove.
771. Hack the Doors triggers: Red discards Shove from their deck.
772. I Know Kung Fu triggers: Gray draws High-Frequency Scanner.
773. Gray pays with Synergy Link, Exhausting it.
774. Gray plays High-Frequency Scanner.
775. High-Frequency Scanner triggers: A look at the Floor deck: Automated Defense Turret, Overgrown Hydroponics Bay, Gears & Glitch.
776. I Know Kung Fu triggers: Gray draws Zen Mode.
777. Gray pays with Zen Mode, Exhausting it.
778. Gray plays I'll Take That.
779. I Know Kung Fu triggers: Gray draws I Know Kung Fu.
780. Play phase ends.
781. Outcome phase starts.
782. Scramble 8 met — Both players get Good Stuff.
783. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
784. Automated Defense Turret is Cleared.
785. Automated Defense Turret triggers: Red reveals Good Stuff: Cutting Torch, Pry Bar, Stim Pack.
786. Automated Defense Turret triggers: Gray reveals Good Stuff: Riot Shield, Cutting Torch, Riot Shield.
787. Red gets Pry Bar.
788. Red takes Pry Bar into hand.
789. Gray gets Riot Shield.
790. Gray takes Riot Shield into hand.
791. Shove is Scrapped.
792. Outcome phase ends.
793. Cleanup phase starts.
794. Red discards Fast Follow from their play zone.
795. Red discards Overdrive from their play zone.
796. Gray discards Quick Vault from their play zone.
797. Gray discards I Know Kung Fu from their play zone.
798. Gray discards Hack the Doors from their play zone.
799. Gray discards High-Frequency Scanner from their play zone.
800. Gray discards I'll Take That from their play zone.
801. Cleanup phase ends.
802. — end of turn 19 —
803. Turn Start phase starts.
804. Revealed: Automated Defense Turret, Overgrown Hydroponics Bay, Gears & Glitch.
805. You are in: Automated Defense Turret.
806. To the bottom of the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay.
807. Red draws Reckless Swing.
808. Gray draws Pivot.
809. Gray draws Hack the Doors.
810. Gray draws I'll Take That.
811. Turn Start phase ends.
812. Play phase starts.
813. Gray pays with Pivot, Exhausting it.
814. Gray plays I Know Kung Fu.
815. Gray pays with I'll Take That, Exhausting it.
816. Gray plays Riot Shield.
817. I Know Kung Fu triggers: Gray draws Peek Around Corner.
818. Gray pays with Peek Around Corner, Exhausting it.
819. Gray plays Hack the Doors.
820. Hack the Doors triggers: A look at the Gray deck: Work The Angles, Overcharged Battery, Pick The Lock.
821. Hack the Doors triggers: Gray discards Work The Angles from their deck.
822. I Know Kung Fu triggers: Gray draws Overcharged Battery.
823. Red plays Pry Bar.
824. Red pays with Heavy Pockets, Exhausting it.
825. Red plays Tag Team.
826. Tag Team triggers: Red draws Fast Follow.
827. Tag Team triggers: Gray draws Pick The Lock.
828. I Know Kung Fu triggers: Gray draws Pack Mule.
829. Play phase ends.
830. Outcome phase starts.
831. Scramble 8 met — Both players get Good Stuff.
832. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
833. Automated Defense Turret is Cleared.
834. Riot Shield triggers: Gray takes Riot Shield into hand.
835. Automated Defense Turret triggers: Red reveals Good Stuff: Pry Bar, Coil Of Cable, High-Frequency Scanner.
836. Automated Defense Turret triggers: Gray reveals Good Stuff: Salvaged Blueprint, Duct Tape & Wire, A Pair Of Stitch-Em-Ups.
837. NOTE — Riot Shield returned to hand at the start of Outcome, printed before the room's rewards. Card says 'at the end of the Outcome phase'. Order matters: it is now in hand and offered to the Turret's scrap. Question: should it return after the outcomes resolve?
838. Red gets Coil Of Cable.
839. Red takes Coil Of Cable into hand.
840. Gray gets Duct Tape & Wire.
841. Gray takes Duct Tape & Wire into hand.
842. Overdrive is Scrapped.
843. Work The Angles is Scrapped.
844. Outcome phase ends.
845. Cleanup phase starts.
846. Red discards Pry Bar from their play zone.
847. Red discards Tag Team from their play zone.
848. Gray discards I Know Kung Fu from their play zone.
849. Gray discards Hack the Doors from their play zone.
850. Cleanup phase ends.
851. — end of turn 20 —
852. Turn Start phase starts.
853. Revealed: Overgrown Hydroponics Bay, Gears & Glitch, Overgrown Hydroponics Bay.
854. You are in: Overgrown Hydroponics Bay.
855. To the bottom of the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay.
856. Red draws Charge.
857. Turn Start phase ends.
858. Play phase starts.
859. Gray pays with Pack Mule, Exhausting it.
860. Gray plays Overcharged Battery.
861. Gray plays Pick The Lock.
862. Gray pays with Duct Tape & Wire, Exhausting it.
863. Gray plays Riot Shield.
864. Red plays Coil Of Cable.
865. Red plays Fast Follow.
866. Play phase ends.
867. Outcome phase starts.
868. Scramble 11 met — Both players get Good Stuff.
869. Overgrown Hydroponics Bay is Cleared.
870. Riot Shield triggers: Gray takes Riot Shield into hand.
871. Overgrown Hydroponics Bay triggers: Red reveals Good Stuff: Coil Of Cable, Pry Bar, Coil Of Cable.
872. Overgrown Hydroponics Bay triggers: Gray reveals Good Stuff: Cutting Torch, Emergency Breaker, Scrap Magnet.
873. Red gets Coil Of Cable.
874. Red takes Coil Of Cable into hand.
875. Gray gets Cutting Torch.
876. Gray takes Cutting Torch into hand.
877. Outcome phase ends.
878. Cleanup phase starts.
879. Red discards Coil Of Cable from their play zone.
880. Red discards Fast Follow from their play zone.
881. Gray discards Overcharged Battery from their play zone.
882. Gray discards Pick The Lock from their play zone.
883. Cleanup phase ends.
884. — end of turn 21 —
885. Turn Start phase starts.
886. Revealed: Gears & Glitch, Overgrown Hydroponics Bay.
887. You are in: Gears & Glitch.
888. To the bottom of the Floor deck: Overgrown Hydroponics Bay.
889. Red draws Brute Recycle.
890. Gray draws Pack Mule.
891. Gray draws Quick Vault.
892. Gray draws Pick The Lock.
893. Turn Start phase ends.
894. Play phase starts.
895. Gray plays Quick Vault.
896. Quick Vault triggers: Gray draws Pivot.
897. Quick Vault triggers: Gray draws Duck Under.
898. Gray pays with Pack Mule, Duck Under, Exhausting them.
899. Gray plays Cutting Torch.
900. Gray pays with Pick The Lock, Riot Shield, Exhausting them.
901. Gray plays Pivot.
902. Red plays Reckless Swing.
903. Reckless Swing triggers: Red Exhausts Reckless Swing.
904. Red plays Coil Of Cable.
905. Red pays with Charge, Exhausting it.
906. Red plays Brute Recycle.
907. Brute Recycle triggers: Charge is Scrapped.
908. Brute Recycle triggers: Red draws Tag Team.
909. Play phase ends.
910. Outcome phase starts.
911. Oomph 12 met — Ascend, and both players reveal a card reward.
912. Gears & Glitch is Cleared.
913. Gears & Glitch triggers: Red's reward pool shows Bull Rush, Set 'Em Up, Junk Launcher.
914. Red takes Bull Rush into their discard pile.
915. Gears & Glitch triggers: Gray's reward pool shows Sharing Is Caring, Covering Fire, Catch Your Breath.
916. Gray takes Sharing Is Caring into their discard pile.
917. Outcome phase ends.
918. Cleanup phase starts.
919. Red discards Reckless Swing from their play zone.
920. Red discards Coil Of Cable from their play zone.
921. Red discards Brute Recycle from their play zone.
922. Gray discards Quick Vault from their play zone.
923. Gray discards Cutting Torch from their play zone.
924. Gray discards Pivot from their play zone.
925. Cleanup phase ends.
926. — end of turn 22 —
927. Floor 4 is clear.
928. Red shuffles 20 cards back in.
929. Gray shuffles 29 cards back in.
930. Floor 5 is built: 6 rooms.
931. Turn Start phase starts.
932. Revealed: The Monolith Core, Laser Grid Security Hall, Smoldering Armory.
933. NOTE — Floor 5 turn 1: Monolith Core is in the first reveal. Nothing on floor 5 carries forward past a win, so the Rooms are only worth it as practice. Fleeing the Core costs Exhaust 5 each from decks of 27/31. Entering the Core blind on turn 1 of the floor.
934. You are in: The Monolith Core.
935. To the bottom of the Floor deck: Smoldering Armory, Laser Grid Security Hall.
936. Red draws Momentum Shift.
937. Red draws Reckless Swing.
938. Red draws Second Wind.
939. Red draws Lean In.
940. Red draws Cross Punch.
941. Gray draws Pack Mule.
942. Gray draws Quick Vault.
943. Gray draws Sharing Is Caring.
944. Gray draws Peek Around Corner.
945. Gray draws High-Frequency Scanner.
946. Turn Start phase ends.
947. Play phase starts.
948. Gray plays Quick Vault.
949. Quick Vault triggers: Gray draws Quick Vault.
950. Quick Vault triggers: Gray draws Hack the Doors.
951. Gray plays Sharing Is Caring.
952. Gray plays Quick Vault.
953. Quick Vault triggers: Gray draws Pick The Lock.
954. Quick Vault triggers: Gray draws Synergy Link.
955. Red pays with Second Wind, Exhausting it.
956. Red plays Reckless Swing.
957. Reckless Swing triggers: Red Exhausts Break Through.
958. Red pays with Cross Punch, Exhausting it.
959. Red plays Momentum Shift.
960. Momentum Shift triggers: Red draws Charge.
961. Momentum Shift triggers: Red draws Shove.
962. Momentum Shift triggers: Red Exhausts Shove.
963. Red pays with Peek Around Corner, Exhausting it.
964. Red plays Lean In.
965. Gray pays with Pick The Lock, Exhausting it.
966. Gray plays Synergy Link.
967. Synergy Link triggers: Gray draws Pick The Lock.
968. Synergy Link triggers: Gray draws I'll Take That.
969. Gray pays with Charge, Exhausting it.
970. Gray plays Hack the Doors.
971. Hack the Doors triggers: A look at the Floor deck: Bio-Hazard Containment Vault, Bio-Hazard Containment Vault, Smoldering Armory.
972. Gray pays with Pick The Lock, Exhausting it.
973. Gray plays Pack Mule.
974. Gray pays with I'll Take That, Exhausting it.
975. Gray plays High-Frequency Scanner.
976. High-Frequency Scanner triggers: A look at the Floor deck: Smoldering Armory, Bio-Hazard Containment Vault, Bio-Hazard Containment Vault.
977. Play phase ends.
978. Outcome phase starts.
979. Oomph 10 and Scramble 10 met — You Win!
980. The Monolith Core is Cleared.
981. Outcome phase ends.
982. Cleanup phase starts.
983. Red discards Reckless Swing from their play zone.
984. Red discards Momentum Shift from their play zone.
985. Red discards Lean In from their play zone.
986. Gray discards Quick Vault from their play zone.
987. Gray discards Sharing Is Caring from their play zone.
988. Gray discards Quick Vault from their play zone.
989. Gray discards Synergy Link from their play zone.
990. Gray discards Hack the Doors from their play zone.
991. Gray discards Pack Mule from their play zone.
992. Gray discards High-Frequency Scanner from their play zone.
993. Cleanup phase ends.
994. — end of turn 23 —
995. Floor 5 is clear.
996. You reach the rooftop. You win.
997. NOTE — Victory turn 23, zero Flees. The Core fell on the first turn of floor 5 to a blind entry. Sharing Is Caring + two Quick Vaults + Momentum Shift gave 11+ usable cards. Floor 5's Rooms were never seen.

Floor 5 · turn 23 · GameOver   floor deck 5, cleared 23   Good Stuff 41, Bad Stuff 18
Red: live 22 (deck 19, discard 3, hand 0), exhaust 5
Gray: live 27 (deck 20, discard 7, hand 0), exhaust 4
Outcome: Victory

seed 12, 295 commands replayed, recorded on R35.C58-v1, floor 5, turn 23, Victory.
```
