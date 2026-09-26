# Playtest 10: The band 3 wall

Recorded 2026-09-25. Rules version 0.2.4 (main at b0840bf). Two passes: a bot sweep with
`bin/nvu sim` and `bin/nvu fuzz`, then one run played by an agent standing in for a human
playtester, in the CLI (`bin/nvu`), seed 10, one shell call per decision. No seed was given; 10
follows the earlier runs' habit of seed equals playtest number. The agent run ended in **Defeat**
on turn 36, floor 7, when Red went `Down` drawing at Turn Start after eleven Flees on that floor.

This is the first run after the Good Stuff pool was raised and four Good Stuff cards were added
(#195). The pool started at 53 and ended at 16, so the empty-pool questions from playtest 9 never
came up.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

## The bot sweep

`bin/nvu fuzz --seeds 500`: no failures.

`bin/nvu sim --seeds 500` (greedy policy, seeds 1-500):

| | |
|---|---|
| Win rate | 0.0% (0/500) |
| Why runs ended | Defeat (Down): 500 |
| Floor reached | 4: 102 · 5: 94 · 6: 56 · 7: 240 · 8: 8 |
| Mean after each Ascend, Red | deck 11.5, live 22.5, exhaust 3.5 |
| Mean after each Ascend, Gray | deck 11.9, live 23.8, exhaust 1.9 |

Cards Exhausted across the sweep, by floor:

| Floor | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Red | 262 | 245 | 238 | 4021 | 3270 | 2332 | 5795 | 159 |
| Gray | 64 | 96 | 99 | 3425 | 2609 | 1803 | 4444 | 136 |

`bin/nvu sim --seeds 500 --policy random`: 0/500, and 367 of the 500 runs end on floor 4.

Every greedy run clears Band 1. Exhaust jumps about fifteenfold at floor 4, the first Band 2
floor, and again at floor 7, the first Band 3 floor, where almost half the runs end. Only 8 of
500 runs clear floor 7, and none clears floor 8. The most-played Good Stuff is Riot Shield (2282
plays), which the agent run leaned on too (note 3).

## How the run went

Band 1 (turns 1-8) cost nothing. Every room was Flooded Ventilation Shaft or The Sentry Drone,
every one Cleared on its Good Stuff line, and the Drone came up as the second or third room of
each floor, so floor 1 took two turns and floor 3 two turns. Crowbar doubled up the Stuff. No card
was Exhausted, and hands swelled to seven and eight cards (note 1).

Band 2 (turns 9-22) was a real puzzle but a fair one. Automated Defense Turret's Scramble 8 and
Overgrown Hydroponics Bay's Scramble 11 fell to Riot Shields, which return to hand on every Clear;
by floor 4 Gray held two and Red one (note 3). When Scramble 11 was out of reach I Cleared on
Scramble 6 and paid the Riot Shields with the Bad Stuff it handed out (note 4). Gears & Glitch was
the squeeze: floor 4 took Oomph 12 with Overdrive's Exhaust 2, floor 5 cost a Flee to my own
misplay (note 6), and floor 6 took Oomph 7 / Scramble 7 on the last card. Corrosive Acid, Spore
Cloud, Sluggish, and System Feedback all passed through the hands and were paid away. Band 3 began
at turn 23 with Red at 3 Exhausted and Gray at 5.

Floor 7 (turns 23-36) was four rooms: two Bio-Hazard Containment Vaults, Laser Grid Security Hall,
and The Iron Sentinel. The first Vault Cleared on Scramble 16 with In Step and two Pocket Dynamos.
Then The Iron Sentinel and Laser Grid came up and neither was reachable, eleven times over (notes
9-11). With three cards left in the Floor deck, a Fled room came straight back (note 11). The
second Vault Cleared on one lucky draw (note 13). From turn 28 on, every turn was spent on Stamina
and cycling rather than the room: Stitch-Em-Ups where the deck was deep enough to keep the cards,
paying Bad Stuff out of hand, and keeping hands cycling (notes 12, 14, 18, 19). Two of
the misses were by one point: The Iron Sentinel at Oomph 10 / Scramble 9 (note 19) and Laser
Grid's Oomph 18 at 17 (note 15).
Red ran out of cards first (note 20) and went Down at the start of turn 36 (note 21).

Playtest 9 ended the same way: turn 36, floor 7, Red Down after Laser Grid and The Iron Sentinel.

## Notes

1. **Band 1 is free.** `[agent]` (log 226)

   > Band 1 cleared in 8 turns with zero Exhaust on either side. Every room hit its Good Stuff line; the Sentry Drone came up as the 2nd or 3rd room of floors 2 and 3, so floor 3 (8 rooms) lasted two turns. Hands are fat with Good Stuff: Gray held 8 cards at turn 6. Nothing in the rulebook caps hand size.

   Rulebook, Floor deck: each floor holds one Stairwell among its 10, 9, or 8 cards, so the Drone
   turning up second or third is luck. Checked `design/cards.yaml`: every Band 1 card's cheapest
   line (Scramble 3, Scramble 4, Oomph 6 or Scramble 6) is reachable from an opening hand. Band 1 set up the
   run and asked nothing of it. The sim agrees: all 500 greedy runs clear it. The rulebook indeed has
   no hand limit; with Stuff going to hand, hands only grow while rooms keep Clearing. Not a finding
   on its own.

2. **Spore Cloud and Riot Shield at Cleanup.** `[agent]` (log 319)

   > Spore Cloud (Holding: at Cleanup discard down to 3) resolved before Riot Shield's end-of-turn return, so Gray ends the turn holding 4 (Pick The Lock, Stim Pack, Spore Cloud, Riot Shield). The rulebook's Cleanup lists only 'Discard your play zone' and gives no order for Cleanup-time card effects against each other or against that step. Is the returned Riot Shield meant to dodge Spore Cloud?

   Rulebook, Cleanup: "Discard your play zone: Move every card on your side of the play zone to your
   discard pile." Riot Shield says "at the end of the turn", Spore Cloud "At Cleanup". Neither the
   rulebook nor the Glossary orders them. Question for the designer: which resolves first, and does a
   card returned at end of turn count toward Spore Cloud's 3?

3. **Riot Shield carries Scramble.** `[agent]` (log 353)

   > Riot Shield is carrying Scramble. Gray now holds two and Red one; each returns to hand on a Clear, so it is a standing Scramble 3 for one card paid, turn after turn. Bad Stuff, meanwhile, costs almost nothing here: Torn Seal and Spore Cloud were both just used as payment for Riot Shield, which sends them to the discard pile to come back later.

   Card-level, for a later re-tune. Riot Shield (`cost 1; Scramble 3`, returns on a Clear) is the
   most-played Good Stuff in the sim sweep too (2282 plays across 500 runs). Bad Stuff with a cost of
   3 still pays a cost-1 card as one card, so a Holding penalty lasts only until the next cheap play.

4. **Clearing on a Bad Stuff line on purpose.** `[agent]` (log 361)

   > Third Overgrown Hydroponics Bay. Scramble 11 is out of reach (9 max, both hands have only Oomph left after the Riot Shields), so I take Scramble 6 on purpose: two Riot Shields paid with the two Bad Stuff we hold, both Shields come back, and we trade two Bad Stuff out for two new ones. Clearing on a Bad Stuff line is strictly better than Fleeing here.

   Checked `design/cards.yaml`: Overgrown Hydroponics Bay's Scramble 6 and Scramble 11 are two
   separate challenges, as playtest 9's note 7 found. Here the lower line was the better choice
   outright. Shape observation, no question.

5. **Where a room's card reward goes.** `[agent]` (log 433)

   > Pressurized Maintenance Hub's 'reveals a card reward' offered one card, take or skip, and the taken card went into the deck (Red deck 13 to 14). The rulebook never defines 'reveals a card reward'; only the Glossary does ('one card, take or skip'), and neither says where a taken card goes: top of deck, shuffled in, or discard, nor where a skipped one goes.

   The Glossary (Reward): "Comes from a Room's Threshold outcome (one card, take or skip)". The
   rulebook's Ascending step says a taken reward is shuffled into the deck, but nothing says the same
   for a room's reward. Both room rewards taken this run (Junk Launcher on turn 15, Distract & Pivot
   on turn 27) were drawn at the very next Turn Start, from decks of 14 and 25. That is consistent
   with going on top rather than being shuffled in. Question for the designer: where does a taken
   room reward go, and where does a skipped one go?

6. **Misplay, and a refusal that hides the cost.** `[agent]` (log 450)

   > Misplay: I meant Charge In then Junk Launcher (cost 2) for Oomph 12+, but after paying Charge In with Shove and Salvaged Blueprint, Red held only Charge In and Junk Launcher, one card short to pay for Junk Launcher. Oomph 6 / Scramble 8, one Oomph short of the 7/7 line, so we Flee. Not undoing a legal move. The refusal read 'Junk Launcher matches nothing, nothing is eligible here', which does not say the problem is the cost.

   The misplay is mine: I counted Charge In's payment twice. The rulebook is clear that a card's
   cost is paid from your own hand. The finding is the CLI's refusal text, listed under friction.

7. **Scrapping Bad Stuff reads as a cost.** `[agent]` (log 540)

   > Turret's Oomph 10 line offers to Scrap a Bad Stuff card, and I decline. Torn Seal has no text; in hand it is a free payment for any cost-1 card, and in the deck it is one more card of Stamina to absorb Exhaust. Scrapping Bad Stuff shrinks the deck, so with Stamina as HP the 'reward' reads as a cost. Is that intended?

   Rulebook: "Your deck is your HP total, called Stamina." Automated Defense Turret prints Scrap as
   the reward for its harder Oomph 10 line. With a textless Bad Stuff like Torn Seal, Scrapping it is
   one card less Stamina for no gain but a cleaner hand. Question for the designer: is Scrapping Bad
   Stuff meant to be a reward even for Bad Stuff with no Holding line?

8. **State entering Band 3.** `[agent]` (log 663)

   > Entering Band 3 at turn 22 with Red deck 28+, exhaust 3; Gray about 40 cards, exhaust 5. Band 2 took 14 turns and one Flee (my misplay). The Scramble side of Band 2 was never in doubt thanks to Riot Shield; the Oomph side was the squeeze every time.

   State only. Compare the sim's mean live cards after each Ascend (22.5 Red, 23.8 Gray). This run
   was well above the bot at the same point.

9. **The Iron Sentinel out of reach.** `[agent]` (log 717)

   > Iron Sentinel on the second room of floor 7, unreachable: best is Oomph 8/Scramble 5 or Oomph 5/Scramble 7 against 10/10. Gray's five cards all cost 1, so at most two of them play. Hack the Doors and Catch Your Breath can't help with a Flee's Exhaust: all of the top 4 go regardless of order. I play only Second Wind to pull Charge In back, and keep Gray's hand intact for next turn.

   Arithmetic checked against the printed costs and stats in the hands. The Iron Sentinel needs
   Oomph 10 and Scramble 10 together; a starting-cost hand of five cards spends at most three of them
   as plays. Shape, see What the run showed.

10. **Laser Grid out of reach; Panic's display.** `[agent]` (log 746)

   > Laser Grid out of reach: Scramble 9 max against 14, Oomph 10ish against 18. Before fleeing I spend Heavy Pockets to shuffle Panic out of Red's hand (Panic had shown the room as 'Scramble 16 (printed 14)' and 'Oomph 18 and Scramble 2 (printed 0)'), and Hack the Doors to dump Faceful Of Slime from Gray's hand. Second Flee in a row; Band 3 rooms look out of reach for a 5-card hand without several free cards.

   Panic reads "Holding: Every room threshold requires +2 Scramble to be met." The CLI applied it to
   Oomph-only thresholds by adding a `Scramble 2` requirement. That is one literal reading; another is
   that it raises only thresholds that already print Scramble. The rulebook does not cover a modifier
   that adds a stat a threshold does not print. Question for the designer.

11. **A Fled room comes straight back.** `[agent]` (log 767)

   > Laser Grid again, immediately: the Fled room shuffled back into a 3-card Floor deck and came straight back up. Still out of reach (Scramble 8 at most), so a third Flee in a row, 12 cards Exhausted across the team in three turns. With the Floor deck this small, a Fled room returns about one turn in three, so there is no running from it.

   Rulebook, Flee: "shuffle the room card back into the Floor deck." Matches. With 2 or 3 cards left
   in the Floor deck, a Fled room comes back about one turn in three or better. Laser Grid came up six
   times on floor 7. Shape.

12. **A Flee with no plays freezes the hand.** `[agent]` (log 780)

   > Shape problem: a Flee where nobody plays leaves both hands full, so Turn Start draws nothing and the next room meets the exact same 10 cards. Flee Exhaust comes off the deck, never the hand, so holding cards feels safe, but it freezes the hand. From here I spend cards on Flee turns just to cycle them.

   Rulebook: Turn Start is "draw up to five... If you already hold 5 or more, do not draw." Matches.
   The effect is that a Flee you do not play into repeats the same hand against the next room. Shape;
   the counter is to play cards anyway (note 18), which has its own cost (note 19).

13. **Bio-Hazard on one draw.** `[agent]` (log 795)

   > Cleared Bio-Hazard at Oomph 16 against 15, entirely on one draw: Tag Team drew Overcharged Battery, which made the second Charge In free. Without that draw the best was 14. Gray Scrapped the team's last Riot Shield for the final +3.

   Shape: Band 3's Clear here was one draw's difference. See What the run showed.

14. **Stitch-Em-Ups into a short deck.** `[agent]` (log 821)

   > A Pair Of Stitch-Em-Ups on Red with Red's deck at 2: the 2 cards go to the bottom, so this turn's Flee (Exhaust 4) takes all four. The heal still leaves Red 2 cards up overall, but whatever I pick is exhausted again at once, so I pick the cheapest (Shove, Reckless Swing). The picker offers Panic and other Stuff as well as Red's own cards; the card text says 'cards', so that reads right.

   Checked `design/cards.yaml`: "Move 2 cards from that character's Exhaust pile to the bottom of
   their deck." The picker offering Stuff is consistent with "cards". Playing it into a short deck
   right before a Flee returns the cards only to Exhaust them again. Not a bug.

15. **Laser Grid's Oomph 18 line, one short.** `[agent]` (log 868)

   > Laser Grid a fourth time. Tried the Oomph 18 line (Clear, but Exhaust 2, better than a Flee's 4): Cutting Torch, Fast Follow, Pocket Dynamo, then Junk Launcher. Best reachable is 17 with Overdrive, one short. Junk Launcher came to 6. Spending the rest only to cycle the hands.

   The note's "came to 6" was the projection before the play; the actual value was 5 (note 16).
   Shape: another one-point miss.

16. **When Junk Launcher counts.** `[agent]` (log 869)

   > Junk Launcher counted the play zone when it was played: Oomph 9 to 14 (+5 = Cutting Torch 2, Fast Follow 1, Pocket Dynamo 0, Junk Launcher 2). High-Frequency Scanner played after it added nothing to it. The card text ('Oomph equal to the total printed cost of all cards in the play zone') and the rulebook ('Stats on played cards add together', checked at Outcome) don't say whether a conditional stat is fixed at play or counted at Outcome. Question for the designer.

   Question for the designer: is a conditional stat like Junk Launcher's fixed when the card is
   played, or counted at Outcome from everything then in the play zone? The rulebook's Outcome says
   "Players add their combined stats they accumulated this turn", which reads as either.

17. **The Iron Sentinel again.** `[agent]` (log 911)

   > Iron Sentinel: Oomph 12 / Scramble 5 without the Overdrives, 16 with both. Neither 10/10 nor Oomph 18 is in reach, so a fifth Flee on floor 7. Red's hand is now two Overdrives and Torn Seal, cards I won't play into a Flee, so Red draws only 2 next turn.

   Arithmetic only. Two Overdrives in hand are Oomph 4 that cost Exhaust 4, into a room whose Flee
   already Exhausts 4.

18. **Cycling on a Flee turn.** `[agent]` (log 1004)

   > Laser Grid a fifth time, out of reach. Spent the turn on Stamina and cycling: Stitch-Em-Ups on Red while Red's deck is 10 deep, so the bottom 2 survive this Flee; Fast Follow free through Sluggish (rulebook: 'for free' ignores cost modifiers); Charge In paid with both Overdrives and Sluggish to clear Red's dead hand.

   Rulebook, Keywords: "`for free`: Play the card without paying, whatever cost modifiers you hold."
   Fast Follow under Sluggish played for free. Matches.

19. **Flee Exhaust and the play zone.** `[agent]` (log 1093)

   > Iron Sentinel with Panic paid away: best split is Oomph 10 / Scramble 9 or Oomph 12 / Scramble 8, one Scramble short of 10/10 again. Found a timing edge: a Flee's Exhaust resolves at Outcome, before Cleanup moves the play zone to the discard pile. So cards in hand or in play are safe, and cards paid as a cost go to the discard, where a short deck's reshuffle feeds them to the Exhaust. On a doomed turn, free plays are safe and paying is not.

   Rulebook, Each Turn: Outcome (Flee, with its Exhaust) comes before Cleanup ("Discard your play
   zone"). The engine matched that order. So on a turn you will Flee, a card paid as a cost is exposed
   to the Exhaust when the deck is short, and a card played or held is not. Not a bug; a consequence
   that a player can use, noted so the designer can decide whether it is wanted.

20. **Red out of Stamina.** `[agent]` (log 1128)

   > Laser Grid again, out of reach, and Red is out of Stamina: 6 live cards, plus 2 from Stitch-Em-Ups. A Flee Exhausts 4, and the 4 left can't cover next turn's draw to 5, so Red goes Down at the next Turn Start whatever I do. Red pays Riot Shield with Rust only so this Flee doesn't end the run on the spot.

   Rulebook, Going Down: "If you must draw or Exhaust a card and your deck and discard pile are both
   empty, you go Down." With 8 live cards, a Flee's Exhaust 4 leaves 4, and Turn Start needs to draw
   up to 5. No line avoids it. Matches.

21. **Defeat, and the hand after Down.** `[agent]` (log 1154)

   > Defeat, turn 36, floor 7: Red went Down drawing at Turn Start. Floor 7 had 4 rooms. We cleared the two Bio-Hazards and Fled Laser Grid (x6) and The Iron Sentinel (x5) eleven times in 13 turns. After the Down, the log shows Red's hand discarded; the rulebook doesn't say anything happens to it. Harmless, but not in the rules.

   The log shows Red's hand discarded after "Red is Down". The rulebook ends the game at Down and
   says nothing about the hand. Harmless. A transcript question, not a rules one.

## What the run showed

1. **Band 3 is a wall, and Band 1 is not a step.** The agent run, playtest 9, and the bot sweep all
   end on floor 7. The run reached Band 3 in better shape than the bot's average (notes 8, 9) and
   still could not reach Laser Grid's Scramble 14 or The Iron Sentinel's 10/10 on eleven turns out
   of thirteen. The two Clears it did get were Bio-Hazard Vaults, one of them on a single draw
   (note 13). Band 1 asked nothing (note 1), so the curve runs flat, then steep at floor 4, then a
   cliff at floor 7. The sim's Exhaust-by-floor table shows the same two steps.
2. **A small Floor deck turns one bad room into a loop.** With 2 or 3 cards left in the Floor deck,
   a Fled room returns about one turn in three (note 11). Each return costs a Flee's Exhaust 4, so
   Stamina drains at 8 cards a turn across the team with no way to route around the room.
3. **Flee turns have a hidden tempo rule.** Holding cards keeps the hand frozen (note 12), paying
   feeds the discard to the next Exhaust (note 19), and free plays are the only safe way to cycle.
   Both follow from the printed turn order. Whether that is the intended feel is for the designer.

## The CLI as a playtest tool

Friction, worst first:

1. A move the hand cannot pay for is refused as `"Junk Launcher" matches nothing — nothing is
   eligible here` (note 6). It should say the card costs 2 and the hand holds 1 other card.
2. No live-card count. Stamina is the game's HP, and every Band 3 decision turned on it, but the
   table shows deck, discard, exhaust, and hand separately. I summed them by hand each turn.
3. The moves list after each play prints every payment combination as its own line. With a
   five-card hand that is the bulk of the output; I filtered it out with `grep`.
4. The Stitch-Em-Ups prompt reads `Heal which character?`. "Heal" is not on the card.
5. `Ordered Distract & Pivot, Quick Vault, Here, Catch.` is ambiguous when a card name holds a
   comma.
6. The Turn Start table after a turn ends shows the old turn number (`turn 1 · Turn Start` after
   turn 1 ends), then the flip shows `turn 2`.

What worked: `(printed N)` on every modified cost and threshold, which made Panic and Sluggish
readable at a glance. The Hack the Doors and High-Frequency Scanner peeks print the cards in
order. `play take` / `play skip` for a room reward and the staged Ascend picks never got confused.
A pending choice (Spore Cloud's discard, Stitch-Em-Ups' picks) blocks further moves and says what
it waits on.

## Candidate issues

Engine mismatches: none found. Every rule checked against the rulebook matched.

Rulebook questions:

- Where does a taken room reward go, and a skipped one (note 5)? The two taken this run were drawn
  at the next Turn Start.
- Is a conditional stat such as Junk Launcher's fixed at play or counted at Outcome (note 16)?
- Does Panic's "+2 Scramble" add a Scramble requirement to an Oomph-only threshold (note 10)?
- In what order do Cleanup-time effects resolve: Spore Cloud's discard, Riot Shield's return, and
  Discard your play zone (note 2)?
- Is Scrapping a textless Bad Stuff meant to read as a reward when it costs a card of Stamina (note
  7)?
- Nothing happens to a hand at Down in the rulebook; the log discards it (note 21). Transcript only.

Shape, independent of tuning:

- Band 3 rooms are out of reach of a five-card hand most turns, and two runs in a row died on floor
  7 at turn 36 (notes 9-11, 15, 17, 19). The bot sweep: 0/500 wins, 240 runs ending on floor 7.
- A Fled room returns quickly from a short Floor deck, so late floors loop (note 11).
- Flee-turn tempo: frozen hands versus paying into the Exhaust (notes 12, 19).
- Band 1 costs nothing and gives a lot of Stuff (note 1).

Card observations for a later re-tune:

- Riot Shield is the backbone of Scramble in Band 2 (note 3), in the sim as well as this run.
- Bad Stuff's cost barely matters, since it pays a cost-1 card as one card (note 3).
- Overdrive's Exhaust 2 is rarely worth it in Band 3, where the Flee already Exhausts 4 (note 17).

CLI:

- Say why a card cannot be paid for (friction 1).
- Print a live-card total per character (friction 2).
- Collapse the payment combinations in the moves list (friction 3).

## Appendix: the run transcript

`bin/nvu replay design/playtests/10-band-three-wall.json`, verbatim.

```
   1. Floor 1 is built: 10 rooms.
   2. You are in: Flooded Ventilation Shaft.
   3. Red draws Lean In.
   4. Red draws Charge In.
   5. Red draws Shove.
   6. Red draws Charge In.
   7. Red draws Shove.
   8. Gray draws Pick The Lock.
   9. Gray draws Pick The Lock.
  10. Gray draws Peek Around Corner.
  11. Gray draws Duck Under.
  12. Gray draws Pick The Lock.
  13. Red discards Shove from their hand.
  14. Red discards Shove from their hand.
  15. Red pays with Shove, Shove.
  16. Red plays Charge In.
  17. Gray discards Peek Around Corner from their hand.
  18. Gray discards Duck Under from their hand.
  19. Gray pays with Peek Around Corner, Duck Under.
  20. Gray plays Pick The Lock.
  21. Scramble 4 met — Clear.
  22. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
  23. Flooded Ventilation Shaft is Cleared.
  24. Red gets Riot Shield.
  25. Red takes Riot Shield into hand.
  26. Gray gets Crowbar.
  27. Gray takes Crowbar into hand.
  28. Cleanup.
  29. Red discards Charge In from their play zone.
  30. Gray discards Pick The Lock from their play zone.
  31. — end of turn 1 —
  32. You are in: The Sentry Drone.
  33. Red draws Shove.
  34. Red draws Charge In.
  35. Gray draws Peek Around Corner.
  36. Gray draws Duck Under.
  37. Gray plays Crowbar.
  38. Gray discards Peek Around Corner from their hand.
  39. Gray discards Duck Under from their hand.
  40. Gray pays with Peek Around Corner, Duck Under.
  41. Gray plays Pick The Lock.
  42. Red discards Shove from their hand.
  43. Red discards Lean In from their hand.
  44. Red pays with Shove, Lean In.
  45. Red plays Charge In.
  46. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
  47. The Sentry Drone is Cleared.
  48. Red gets Crowbar.
  49. Red takes Crowbar into hand.
  50. Red gets Overcharged Battery.
  51. Red takes Overcharged Battery into hand.
  52. Gray gets Pry Bar.
  53. Gray takes Pry Bar into hand.
  54. Gray gets Scrap Magnet.
  55. Gray takes Scrap Magnet into hand.
  56. Gray gets Crowbar.
  57. Gray takes Crowbar into hand.
  58. Cleanup.
  59. Red discards Charge In from their play zone.
  60. Gray discards Crowbar from their play zone.
  61. Gray discards Pick The Lock from their play zone.
  62. — end of turn 2 —
  63. Floor 1 is clear.
  64. Red shuffles 4 card(s) back in.
  65. Red takes Fast Follow.
  66. Red shuffles 1 card(s) back in.
  67. Gray shuffles 4 card(s) back in.
  68. Gray takes Hack the Doors.
  69. Gray shuffles 1 card(s) back in.
  70. Floor 2 is built: 9 rooms.
  71. You are in: Flooded Ventilation Shaft.
  72. Red draws Crowbar.
  73. Red draws Charge In.
  74. Red draws Riot Shield.
  75. Red draws Shove.
  76. Red draws Fast Follow.
  77. Gray draws Pick The Lock.
  78. Gray draws Crowbar.
  79. Gray draws Pick The Lock.
  80. Gray draws Duck Under.
  81. Gray draws Hack the Doors.
  82. Gray plays Crowbar.
  83. Red plays Fast Follow.
  84. Red plays Crowbar.
  85. Red discards Shove from their hand.
  86. Red pays with Shove.
  87. Red plays Riot Shield.
  88. Scramble 4 met — Clear.
  89. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
  90. Flooded Ventilation Shaft is Cleared.
  91. Red gets Overcharged Battery.
  92. Red takes Overcharged Battery into hand.
  93. Red gets Pry Bar.
  94. Red takes Pry Bar into hand.
  95. Gray gets Stim Pack.
  96. Gray takes Stim Pack into hand.
  97. Gray gets A Pair Of Stitch-Em-Ups.
  98. Gray takes A Pair Of Stitch-Em-Ups into hand.
  99. Cleanup.
 100. Red takes Riot Shield into hand.
 101. Red discards Fast Follow from their play zone.
 102. Red discards Crowbar from their play zone.
 103. Gray discards Crowbar from their play zone.
 104. — end of turn 3 —
 105. You are in: Flooded Ventilation Shaft.
 106. Red draws Overdrive.
 107. Red plays Pry Bar.
 108. Red discards Overdrive from their hand.
 109. Red pays with Overdrive.
 110. Red plays Riot Shield.
 111. Gray plays Stim Pack.
 112. Gray draws Scrap Magnet.
 113. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
 114. Flooded Ventilation Shaft is Cleared.
 115. Red gets Duct Tape & Wire.
 116. Red takes Duct Tape & Wire into hand.
 117. Gray gets Riot Shield.
 118. Gray takes Riot Shield into hand.
 119. Cleanup.
 120. Red takes Riot Shield into hand.
 121. Red discards Pry Bar from their play zone.
 122. Gray discards Stim Pack from their play zone.
 123. — end of turn 4 —
 124. You are in: Flooded Ventilation Shaft.
 125. Red draws Overcharged Battery.
 126. Red discards Charge In from their hand.
 127. Red pays with Charge In.
 128. Red plays Overcharged Battery.
 129. Red plays Duct Tape & Wire.
 130. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
 131. Flooded Ventilation Shaft is Cleared.
 132. Red gets A Pair Of Stitch-Em-Ups.
 133. Red takes A Pair Of Stitch-Em-Ups into hand.
 134. Gray gets High-Frequency Scanner.
 135. Gray takes High-Frequency Scanner into hand.
 136. Cleanup.
 137. Red discards Overcharged Battery from their play zone.
 138. Red discards Duct Tape & Wire from their play zone.
 139. — end of turn 5 —
 140. You are in: The Sentry Drone.
 141. Red draws Charge In.
 142. Red draws Charge In.
 143. Red discards A Pair Of Stitch-Em-Ups from their hand.
 144. Red pays with A Pair Of Stitch-Em-Ups.
 145. Red plays Overcharged Battery.
 146. Red plays Charge In.
 147. Gray discards A Pair Of Stitch-Em-Ups from their hand.
 148. Gray discards Scrap Magnet from their hand.
 149. Gray pays with A Pair Of Stitch-Em-Ups, Scrap Magnet.
 150. Gray plays Pick The Lock.
 151. Oomph 6 met — Ascend.
 152. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
 153. The Sentry Drone is Cleared.
 154. Red gets Cutting Torch.
 155. Red takes Cutting Torch into hand.
 156. Red gets Salvaged Blueprint.
 157. Red takes Salvaged Blueprint into hand.
 158. Gray gets Pocket Dynamo.
 159. Gray takes Pocket Dynamo into hand.
 160. Gray gets Pry Bar.
 161. Gray takes Pry Bar into hand.
 162. Cleanup.
 163. Red discards Overcharged Battery from their play zone.
 164. Red discards Charge In from their play zone.
 165. Gray discards Pick The Lock from their play zone.
 166. — end of turn 6 —
 167. Floor 2 is clear.
 168. Red shuffles 4 card(s) back in.
 169. Red takes Fast Follow.
 170. Red shuffles 1 card(s) back in.
 171. Gray shuffles 7 card(s) back in.
 172. Gray takes One Man's Junk.
 173. Gray shuffles 1 card(s) back in.
 174. Floor 3 is built: 8 rooms.
 175. You are in: Flooded Ventilation Shaft.
 176. Red draws Cutting Torch.
 177. Red draws Riot Shield.
 178. Red draws Fast Follow.
 179. Red draws Overdrive.
 180. Red draws Salvaged Blueprint.
 181. Gray draws Duck Under.
 182. Gray draws High-Frequency Scanner.
 183. Gray draws Duck Under.
 184. Gray draws Work The Angles.
 185. Gray draws Riot Shield.
 186. Gray discards Duck Under from their hand.
 187. Gray pays with Duck Under.
 188. Gray plays Riot Shield.
 189. Red plays Fast Follow.
 190. Oomph 3 and Scramble 3 met — Clear, and both players get Good Stuff.
 191. Flooded Ventilation Shaft is Cleared.
 192. Red gets Coil Of Cable.
 193. Red takes Coil Of Cable into hand.
 194. Gray gets Overcharged Battery.
 195. Gray takes Overcharged Battery into hand.
 196. Cleanup.
 197. Gray takes Riot Shield into hand.
 198. Red discards Fast Follow from their play zone.
 199. — end of turn 7 —
 200. You are in: The Sentry Drone.
 201. Red plays Coil Of Cable.
 202. Red discards Overdrive from their hand.
 203. Red discards Salvaged Blueprint from their hand.
 204. Red pays with Overdrive, Salvaged Blueprint.
 205. Red plays Cutting Torch.
 206. Gray discards Duck Under from their hand.
 207. Gray pays with Duck Under.
 208. Gray plays Riot Shield.
 209. Scramble 6 met — Ascend.
 210. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
 211. The Sentry Drone is Cleared.
 212. Red gets Duct Tape & Wire.
 213. Red takes Duct Tape & Wire into hand.
 214. Red gets Duct Tape & Wire.
 215. Red takes Duct Tape & Wire into hand.
 216. Gray gets Salvaged Blueprint.
 217. Gray takes Salvaged Blueprint into hand.
 218. Gray gets Riot Shield.
 219. Gray takes Riot Shield into hand.
 220. Cleanup.
 221. Gray takes Riot Shield into hand.
 222. Red discards Coil Of Cable from their play zone.
 223. Red discards Cutting Torch from their play zone.
 224. — end of turn 8 —
 225. Floor 3 is clear.
 226. NOTE — Band 1 cleared in 8 turns with zero Exhaust on either side. Every room hit its Good Stuff line; the Sentry Drone came up as the 2nd or 3rd room of floors 2 and 3, so floor 3 (8 rooms) lasted two turns. Hands are fat with Good Stuff: Gray held 8 cards at turn 6. Nothing in the rulebook caps hand size.
 227. Red shuffles 3 card(s) back in.
 228. Red takes Tag Team.
 229. Red shuffles 1 card(s) back in.
 230. Gray shuffles 6 card(s) back in.
 231. Gray takes In Step.
 232. Gray shuffles 1 card(s) back in.
 233. Floor 4 is built: 7 rooms.
 234. You are in: Automated Defense Turret.
 235. Red draws Charge In.
 236. Red draws Tag Team.
 237. Red draws Riot Shield.
 238. Red draws Duct Tape & Wire.
 239. Red draws Duct Tape & Wire.
 240. Gray draws One Man's Junk.
 241. Gray draws In Step.
 242. Gray draws Pick The Lock.
 243. Gray draws Hack the Doors.
 244. Gray draws Riot Shield.
 245. Gray discards Hack the Doors from their hand.
 246. Gray pays with Hack the Doors.
 247. Gray plays Riot Shield.
 248. Red discards Duct Tape & Wire from their hand.
 249. Red pays with Duct Tape & Wire.
 250. Red plays Riot Shield.
 251. Red discards Charge In from their hand.
 252. Red pays with Charge In.
 253. Red plays Tag Team.
 254. Red's deck is empty — the discard pile shuffles in to make a new one (24 cards).
 255. Red draws Shove.
 256. Scramble 8 met — Clear, and Gray gets Good Stuff.
 257. Automated Defense Turret is Cleared.
 258. Gray gets Pocket Dynamo.
 259. Gray takes Pocket Dynamo into hand.
 260. Cleanup.
 261. Gray takes Riot Shield into hand.
 262. Red takes Riot Shield into hand.
 263. Red discards Tag Team from their play zone.
 264. — end of turn 9 —
 265. You are in: Automated Defense Turret.
 266. Red draws Shove.
 267. Red draws Overcharged Battery.
 268. Red discards Shove from their hand.
 269. Red pays with Shove.
 270. Red plays Overcharged Battery.
 271. Red plays Riot Shield.
 272. Gray discards One Man's Junk from their hand.
 273. Gray pays with One Man's Junk.
 274. Gray plays In Step.
 275. Gray plays Pocket Dynamo.
 276. Gray draws Salvaged Blueprint.
 277. Scramble 8 met — Clear, and Gray gets Good Stuff.
 278. Automated Defense Turret is Cleared.
 279. Gray gets Coil Of Cable.
 280. Gray takes Coil Of Cable into hand.
 281. Cleanup.
 282. Red takes Riot Shield into hand.
 283. Red discards Overcharged Battery from their play zone.
 284. Gray discards In Step from their play zone.
 285. Gray discards Pocket Dynamo from their play zone.
 286. — end of turn 10 —
 287. You are in: Overgrown Hydroponics Bay.
 288. Red draws Lean In.
 289. Red draws Charge In.
 290. Gray draws High-Frequency Scanner.
 291. Gray plays Coil Of Cable.
 292. Gray discards Salvaged Blueprint from their hand.
 293. Gray pays with Salvaged Blueprint.
 294. Gray plays Riot Shield.
 295. Red discards Shove from their hand.
 296. Red pays with Shove.
 297. Red plays Riot Shield.
 298. Red discards Lean In from their hand.
 299. Red pays with Lean In.
 300. Red plays Duct Tape & Wire.
 301. Scramble 6 met — Clear, but both players get Bad Stuff.
 302. Scramble 11 met — Clear, and both players get Good Stuff.
 303. Overgrown Hydroponics Bay is Cleared.
 304. Red gets Torn Seal.
 305. Red takes Torn Seal into hand.
 306. Gray gets Spore Cloud.
 307. Gray takes Spore Cloud into hand.
 308. Red gets Coil Of Cable.
 309. Red takes Coil Of Cable into hand.
 310. Gray gets Stim Pack.
 311. Gray takes Stim Pack into hand.
 312. Cleanup.
 313. Gray discards High-Frequency Scanner from their hand.
 314. Gray takes Riot Shield into hand.
 315. Red takes Riot Shield into hand.
 316. Red discards Duct Tape & Wire from their play zone.
 317. Gray discards Coil Of Cable from their play zone.
 318. — end of turn 11 —
 319. NOTE — Spore Cloud (Holding: at Cleanup discard down to 3) resolved before Riot Shield's end-of-turn return, so Gray ends the turn holding 4 (Pick The Lock, Stim Pack, Spore Cloud, Riot Shield). The rulebook's Cleanup lists only 'Discard your play zone' and gives no order for Cleanup-time card effects against each other or against that step. Is the returned Riot Shield meant to dodge Spore Cloud?
 320. You are in: Overgrown Hydroponics Bay.
 321. Red draws Overdrive.
 322. Gray draws Pry Bar.
 323. Gray plays Stim Pack.
 324. Gray draws Riot Shield.
 325. Red plays Coil Of Cable.
 326. Red discards Torn Seal from their hand.
 327. Red pays with Torn Seal.
 328. Red plays Riot Shield.
 329. Gray discards Spore Cloud from their hand.
 330. Gray pays with Spore Cloud.
 331. Gray plays Riot Shield.
 332. Gray discards Pry Bar from their hand.
 333. Gray pays with Pry Bar.
 334. Gray plays Riot Shield.
 335. Scramble 6 met — Clear, but both players get Bad Stuff.
 336. Scramble 11 met — Clear, and both players get Good Stuff.
 337. Overgrown Hydroponics Bay is Cleared.
 338. Red gets System Feedback.
 339. Red takes System Feedback into hand.
 340. Gray gets Torn Seal.
 341. Gray takes Torn Seal into hand.
 342. Red gets Cutting Torch.
 343. Red takes Cutting Torch into hand.
 344. Gray gets Cutting Torch.
 345. Gray takes Cutting Torch into hand.
 346. Cleanup.
 347. Red takes Riot Shield into hand.
 348. Gray takes Riot Shield into hand.
 349. Gray takes Riot Shield into hand.
 350. Red discards Coil Of Cable from their play zone.
 351. Gray discards Stim Pack from their play zone.
 352. — end of turn 12 —
 353. NOTE — Riot Shield is carrying Scramble. Gray now holds two and Red one; each returns to hand on a Clear, so it is a standing Scramble 3 for one card paid, turn after turn. Bad Stuff, meanwhile, costs almost nothing here: Torn Seal and Spore Cloud were both just used as payment for Riot Shield, which sends them to the discard pile to come back later.
 354. You are in: Overgrown Hydroponics Bay.
 355. Gray discards Torn Seal from their hand.
 356. Gray pays with Torn Seal.
 357. Gray plays Riot Shield.
 358. Red discards System Feedback from their hand.
 359. Red pays with System Feedback.
 360. Red plays Riot Shield.
 361. NOTE — Third Overgrown Hydroponics Bay. Scramble 11 is out of reach (9 max, both hands have only Oomph left after the Riot Shields), so I take Scramble 6 on purpose: two Riot Shields paid with the two Bad Stuff we hold, both Shields come back, and we trade two Bad Stuff out for two new ones. Clearing on a Bad Stuff line is strictly better than Fleeing here.
 362. Scramble 6 met — Clear, but both players get Bad Stuff.
 363. Overgrown Hydroponics Bay is Cleared.
 364. Red gets Faceful Of Slime.
 365. Red takes Faceful Of Slime into hand.
 366. Gray gets Corrosive Acid.
 367. Gray takes Corrosive Acid into hand.
 368. Cleanup.
 369. Gray takes Riot Shield into hand.
 370. Red takes Riot Shield into hand.
 371. — end of turn 13 —
 372. You are in: Gears & Glitch.
 373. Gray Exhausts Work The Angles.
 374. Red plays Overdrive.
 375. Red Exhausts A Pair Of Stitch-Em-Ups.
 376. Red Exhausts Charge In.
 377. Red discards Faceful Of Slime from their hand.
 378. Red discards Charge In from their hand.
 379. Red pays with Faceful Of Slime, Charge In.
 380. Red plays Cutting Torch.
 381. Gray discards Corrosive Acid from their hand.
 382. Gray discards Pick The Lock from their hand.
 383. Gray pays with Corrosive Acid, Pick The Lock.
 384. Gray plays Cutting Torch.
 385. Oomph 12 met — Ascend.
 386. Gears & Glitch is Cleared.
 387. Cleanup.
 388. Red discards Overdrive from their play zone.
 389. Red discards Cutting Torch from their play zone.
 390. Gray discards Cutting Torch from their play zone.
 391. — end of turn 14 —
 392. Floor 4 is clear.
 393. Red shuffles 1 card(s) back in.
 394. Red takes Second Wind.
 395. Red shuffles 1 card(s) back in.
 396. Gray shuffles 2 card(s) back in.
 397. Gray takes Hack the Doors.
 398. Gray shuffles 1 card(s) back in.
 399. Floor 5 is built: 6 rooms.
 400. You are in: Pressurized Maintenance Hub.
 401. Red draws Charge In.
 402. Red draws Charge In.
 403. Red draws Shove.
 404. Red draws Coil Of Cable.
 405. Red draws Fast Follow.
 406. Gray draws Pocket Dynamo.
 407. Gray draws Hack the Doors.
 408. Gray draws Pick The Lock.
 409. Gray draws Riot Shield.
 410. Gray draws Pry Bar.
 411. Gray plays Pry Bar.
 412. Red plays Fast Follow.
 413. Red plays Coil Of Cable.
 414. Gray discards Hack the Doors from their hand.
 415. Gray pays with Hack the Doors.
 416. Gray plays Riot Shield.
 417. Gray plays Pocket Dynamo.
 418. Gray draws Overcharged Battery.
 419. Oomph 7 met — Clear, and Red reveals a card reward.
 420. Scramble 7 met — Clear, and Gray reveals a card reward.
 421. Pressurized Maintenance Hub is Cleared.
 422. Red's reward pool shows Junk Launcher.
 423. Red takes Junk Launcher.
 424. Gray's reward pool shows I'll Take That.
 425. Gray takes I'll Take That.
 426. Cleanup.
 427. Gray takes Riot Shield into hand.
 428. Red discards Fast Follow from their play zone.
 429. Red discards Coil Of Cable from their play zone.
 430. Gray discards Pry Bar from their play zone.
 431. Gray discards Pocket Dynamo from their play zone.
 432. — end of turn 15 —
 433. NOTE — Pressurized Maintenance Hub's 'reveals a card reward' offered one card, take or skip, and the taken card went into the deck (Red deck 13 to 14). The rulebook never defines 'reveals a card reward'; only the Glossary does ('one card, take or skip'), and neither says where a taken card goes: top of deck, shuffled in, or discard, nor where a skipped one goes.
 434. You are in: Gears & Glitch.
 435. Red draws Junk Launcher.
 436. Red draws Salvaged Blueprint.
 437. Gray draws I'll Take That.
 438. Gray draws Riot Shield.
 439. Gray discards I'll Take That from their hand.
 440. Gray pays with I'll Take That.
 441. Gray plays Overcharged Battery.
 442. Gray plays Pick The Lock.
 443. Gray discards Riot Shield from their hand.
 444. Gray pays with Riot Shield.
 445. Gray plays Riot Shield.
 446. Red discards Shove from their hand.
 447. Red discards Salvaged Blueprint from their hand.
 448. Red pays with Shove, Salvaged Blueprint.
 449. Red plays Charge In.
 450. NOTE — Misplay: I meant Charge In then Junk Launcher (cost 2) for Oomph 12+, but after paying Charge In with Shove and Salvaged Blueprint, Red held only Charge In and Junk Launcher, one card short to pay for Junk Launcher. Oomph 6 / Scramble 8, one Oomph short of the 7/7 line, so we Flee. Not undoing a legal move. The refusal read 'Junk Launcher matches nothing, nothing is eligible here', which does not say the problem is the cost.
 451. You Flee Gears & Glitch.
 452. Red Exhausts Duct Tape & Wire.
 453. Red Exhausts Overcharged Battery.
 454. Red Exhausts Cutting Torch.
 455. Gray's deck is empty — the discard pile shuffles in to make a new one (33 cards).
 456. Gray Exhausts Pick The Lock.
 457. Gray Exhausts Duck Under.
 458. Gray Exhausts Peek Around Corner.
 459. Red gets System Feedback.
 460. Red takes System Feedback into hand.
 461. Cleanup.
 462. Red discards Charge In from their play zone.
 463. Gray discards Overcharged Battery from their play zone.
 464. Gray discards Pick The Lock from their play zone.
 465. Gray discards Riot Shield from their play zone.
 466. Gears & Glitch shuffles back into the Floor deck.
 467. — end of turn 16 —
 468. You are in: Gears & Glitch.
 469. Red draws Pry Bar.
 470. Red draws Overdrive.
 471. Gray draws One Man's Junk.
 472. Gray draws Riot Shield.
 473. Gray draws Stim Pack.
 474. Gray draws Spore Cloud.
 475. Gray draws Duck Under.
 476. Gray plays Stim Pack.
 477. Gray draws Pick The Lock.
 478. Red discards System Feedback from their hand.
 479. Red discards Overdrive from their hand.
 480. Red pays with System Feedback, Overdrive.
 481. Red plays Charge In.
 482. Red plays Pry Bar.
 483. Gray discards Spore Cloud from their hand.
 484. Gray discards Duck Under from their hand.
 485. Gray pays with Spore Cloud, Duck Under.
 486. Gray plays Pick The Lock.
 487. Gray discards One Man's Junk from their hand.
 488. Gray pays with One Man's Junk.
 489. Gray plays Riot Shield.
 490. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
 491. Gears & Glitch is Cleared.
 492. Gray's reward pool shows Catch Your Breath.
 493. Gray takes Catch Your Breath.
 494. Cleanup.
 495. Gray takes Riot Shield into hand.
 496. Red discards Charge In from their play zone.
 497. Red discards Pry Bar from their play zone.
 498. Gray discards Stim Pack from their play zone.
 499. Gray discards Pick The Lock from their play zone.
 500. — end of turn 17 —
 501. Floor 5 is clear.
 502. Red shuffles 1 card(s) back in.
 503. Red takes Reckless Swing.
 504. Red shuffles 1 card(s) back in.
 505. Gray shuffles 1 card(s) back in.
 506. Gray takes One Man's Junk.
 507. Gray shuffles 1 card(s) back in.
 508. Floor 6 is built: 5 rooms.
 509. You are in: Automated Defense Turret.
 510. Red draws Second Wind.
 511. Red draws Riot Shield.
 512. Red draws Duct Tape & Wire.
 513. Red draws Fast Follow.
 514. Red draws Crowbar.
 515. Gray draws Torn Seal.
 516. Gray draws Stim Pack.
 517. Gray draws Pry Bar.
 518. Gray draws Crowbar.
 519. Gray draws Duck Under.
 520. Gray plays Stim Pack.
 521. Gray draws High-Frequency Scanner.
 522. Gray plays Crowbar.
 523. Gray plays Pry Bar.
 524. Gray discards Duck Under from their hand.
 525. Gray pays with Duck Under.
 526. Gray plays High-Frequency Scanner.
 527. A look at the Floor deck: Automated Defense Turret, Automated Defense Turret, Gears & Glitch.
 528. Red plays Fast Follow.
 529. Red plays Crowbar.
 530. Red discards Second Wind from their hand.
 531. Red pays with Second Wind.
 532. Red plays Riot Shield.
 533. Scramble 8 met — Clear, and Gray gets Good Stuff.
 534. Oomph 10 met — Clear, and one of you may Scrap a Bad Stuff card from your hand.
 535. Automated Defense Turret is Cleared.
 536. Gray gets Stim Pack.
 537. Gray takes Stim Pack into hand.
 538. Gray gets Crowbar.
 539. Gray takes Crowbar into hand.
 540. NOTE — Turret's Oomph 10 line offers to Scrap a Bad Stuff card, and I decline. Torn Seal has no text; in hand it is a free payment for any cost-1 card, and in the deck it is one more card of Stamina to absorb Exhaust. Scrapping Bad Stuff shrinks the deck, so with Stamina as HP the 'reward' reads as a cost. Is that intended?
 541. Cleanup.
 542. Red takes Riot Shield into hand.
 543. Red discards Fast Follow from their play zone.
 544. Red discards Crowbar from their play zone.
 545. Gray discards Stim Pack from their play zone.
 546. Gray discards Crowbar from their play zone.
 547. Gray discards Pry Bar from their play zone.
 548. Gray discards High-Frequency Scanner from their play zone.
 549. — end of turn 18 —
 550. You are in: Automated Defense Turret.
 551. Red draws Junk Launcher.
 552. Red draws Shove.
 553. Red draws Reckless Swing.
 554. Gray draws Crowbar.
 555. Gray draws Hack the Doors.
 556. Gray plays Stim Pack.
 557. Gray draws Riot Shield.
 558. Gray plays Crowbar.
 559. Gray plays Crowbar.
 560. Gray discards Torn Seal from their hand.
 561. Gray pays with Torn Seal.
 562. Gray plays Hack the Doors.
 563. A look at the Floor deck: Automated Defense Turret, Gears & Glitch, Overgrown Hydroponics Bay.
 564. Red discards Shove from their hand.
 565. Red pays with Shove.
 566. Red plays Riot Shield.
 567. Scramble 8 met — Clear, and Gray gets Good Stuff.
 568. Automated Defense Turret is Cleared.
 569. Gray gets Scrap Magnet.
 570. Gray takes Scrap Magnet into hand.
 571. Gray gets Pry Bar.
 572. Gray takes Pry Bar into hand.
 573. Gray gets Duct Tape & Wire.
 574. Gray takes Duct Tape & Wire into hand.
 575. Cleanup.
 576. Red takes Riot Shield into hand.
 577. Gray discards Stim Pack from their play zone.
 578. Gray discards Crowbar from their play zone.
 579. Gray discards Crowbar from their play zone.
 580. Gray discards Hack the Doors from their play zone.
 581. — end of turn 19 —
 582. You are in: Automated Defense Turret.
 583. Red draws Charge In.
 584. Gray draws Coil Of Cable.
 585. Gray plays Coil Of Cable.
 586. Gray discards Scrap Magnet from their hand.
 587. Gray pays with Scrap Magnet.
 588. Gray plays Riot Shield.
 589. Red discards Reckless Swing from their hand.
 590. Red pays with Reckless Swing.
 591. Red plays Riot Shield.
 592. Scramble 8 met — Clear, and Gray gets Good Stuff.
 593. Automated Defense Turret is Cleared.
 594. Gray gets A Pair Of Stitch-Em-Ups.
 595. Gray takes A Pair Of Stitch-Em-Ups into hand.
 596. Cleanup.
 597. Gray takes Riot Shield into hand.
 598. Red takes Riot Shield into hand.
 599. Gray discards Coil Of Cable from their play zone.
 600. — end of turn 20 —
 601. You are in: Overgrown Hydroponics Bay.
 602. Red's deck is empty — the discard pile shuffles in to make a new one (27 cards).
 603. Red draws System Feedback.
 604. Gray draws Pry Bar.
 605. Gray discards Pry Bar from their hand.
 606. Gray pays with Pry Bar.
 607. Gray plays A Pair Of Stitch-Em-Ups.
 608. Cutting Torch goes to Red's deck.
 609. Overcharged Battery goes to Red's deck.
 610. Gray discards Pry Bar from their hand.
 611. Gray pays with Pry Bar.
 612. Gray plays Riot Shield.
 613. Red discards System Feedback from their hand.
 614. Red pays with System Feedback.
 615. Red plays Riot Shield.
 616. Scramble 6 met — Clear, but both players get Bad Stuff.
 617. Overgrown Hydroponics Bay is Cleared.
 618. Red gets Sluggish.
 619. Red takes Sluggish into hand.
 620. Gray gets Corrosive Acid.
 621. Gray takes Corrosive Acid into hand.
 622. Cleanup.
 623. Gray takes Riot Shield into hand.
 624. Red takes Riot Shield into hand.
 625. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
 626. — end of turn 21 —
 627. You are in: Gears & Glitch.
 628. Gray draws Cutting Torch.
 629. Gray draws Pick The Lock.
 630. Gray Exhausts Peek Around Corner.
 631. Red discards Sluggish from their hand.
 632. Red discards Junk Launcher from their hand.
 633. Red pays with Sluggish, Junk Launcher.
 634. Red plays Riot Shield.
 635. Red discards Charge In from their hand.
 636. Red pays with Charge In.
 637. Red plays Duct Tape & Wire.
 638. Gray discards Corrosive Acid from their hand.
 639. Gray discards Pick The Lock from their hand.
 640. Gray pays with Corrosive Acid, Pick The Lock.
 641. Gray plays Cutting Torch.
 642. Gray discards Duct Tape & Wire from their hand.
 643. Gray pays with Duct Tape & Wire.
 644. Gray plays Riot Shield.
 645. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
 646. Gears & Glitch is Cleared.
 647. Red's reward pool shows Heavy Pockets.
 648. Red takes Heavy Pockets.
 649. Cleanup.
 650. Red takes Riot Shield into hand.
 651. Gray takes Riot Shield into hand.
 652. Red discards Duct Tape & Wire from their play zone.
 653. Gray discards Cutting Torch from their play zone.
 654. — end of turn 22 —
 655. Floor 6 is clear.
 656. Red shuffles 1 card(s) back in.
 657. Red takes Fast Follow.
 658. Red shuffles 1 card(s) back in.
 659. Gray shuffles 1 card(s) back in.
 660. Gray takes Quick Vault.
 661. Gray shuffles 1 card(s) back in.
 662. Floor 7 is built: 4 rooms.
 663. NOTE — Entering Band 3 at turn 22 with Red deck 28+, exhaust 3; Gray about 40 cards, exhaust 5. Band 2 took 14 turns and one Flee (my misplay). The Scramble side of Band 2 was never in doubt thanks to Riot Shield; the Oomph side was the squeeze every time.
 664. You are in: Bio-Hazard Containment Vault.
 665. Red draws Shove.
 666. Red draws Coil Of Cable.
 667. Red draws Duct Tape & Wire.
 668. Red draws Overdrive.
 669. Red draws Fast Follow.
 670. Gray draws I'll Take That.
 671. Gray draws Scrap Magnet.
 672. Gray draws A Pair Of Stitch-Em-Ups.
 673. Gray draws In Step.
 674. Gray draws Pocket Dynamo.
 675. Red plays Coil Of Cable.
 676. Gray plays Pocket Dynamo.
 677. Gray draws Pocket Dynamo.
 678. Red plays Fast Follow.
 679. Red discards Shove from their hand.
 680. Red pays with Shove.
 681. Red plays Duct Tape & Wire.
 682. Gray plays Pocket Dynamo.
 683. Gray draws Hack the Doors.
 684. Gray discards A Pair Of Stitch-Em-Ups from their hand.
 685. Gray pays with A Pair Of Stitch-Em-Ups.
 686. Gray plays I'll Take That.
 687. Gray discards Scrap Magnet from their hand.
 688. Gray pays with Scrap Magnet.
 689. Gray plays In Step.
 690. Scramble 15 met — Clear, and one of you reveals a card reward.
 691. Bio-Hazard Containment Vault is Cleared.
 692. Red's reward pool shows Junk Launcher.
 693. Red takes Junk Launcher.
 694. Cleanup.
 695. Red discards Coil Of Cable from their play zone.
 696. Red discards Fast Follow from their play zone.
 697. Red discards Duct Tape & Wire from their play zone.
 698. Gray discards Pocket Dynamo from their play zone.
 699. Gray discards Pocket Dynamo from their play zone.
 700. Gray discards I'll Take That from their play zone.
 701. Gray discards In Step from their play zone.
 702. — end of turn 23 —
 703. You are in: The Iron Sentinel.
 704. Red draws Junk Launcher.
 705. Red draws Charge In.
 706. Red draws Second Wind.
 707. Red draws Lean In.
 708. Gray draws Riot Shield.
 709. Gray draws One Man's Junk.
 710. Gray draws Duck Under.
 711. Gray draws Catch Your Breath.
 712. Red discards Lean In from their hand.
 713. Red discards Junk Launcher from their hand.
 714. Red pays with Lean In, Junk Launcher.
 715. Red plays Second Wind.
 716. Red shuffles 1 card(s) back in.
 717. NOTE — Iron Sentinel on the second room of floor 7, unreachable: best is Oomph 8/Scramble 5 or Oomph 5/Scramble 7 against 10/10. Gray's five cards all cost 1, so at most two of them play. Hack the Doors and Catch Your Breath can't help with a Flee's Exhaust: all of the top 4 go regardless of order. I play only Second Wind to pull Charge In back, and keep Gray's hand intact for next turn.
 718. You Flee The Iron Sentinel.
 719. Red Exhausts Coil Of Cable.
 720. Red Exhausts Reckless Swing.
 721. Red Exhausts Shove.
 722. Red Exhausts Overcharged Battery.
 723. Gray Exhausts Quick Vault.
 724. Gray Exhausts Corrosive Acid.
 725. Gray Exhausts Pick The Lock.
 726. Gray Exhausts Salvaged Blueprint.
 727. Red gets Panic.
 728. Red takes Panic into hand.
 729. Gray gets Faceful Of Slime.
 730. Gray takes Faceful Of Slime into hand.
 731. Cleanup.
 732. Red discards Second Wind from their play zone.
 733. The Iron Sentinel shuffles back into the Floor deck.
 734. — end of turn 24 —
 735. You are in: Laser Grid Security Hall.
 736. Red draws Charge In.
 737. Red draws Heavy Pockets.
 738. Red discards Overdrive from their hand.
 739. Red pays with Overdrive.
 740. Red plays Heavy Pockets.
 741. Red shuffles 1 card(s) back in.
 742. Gray discards Faceful Of Slime from their hand.
 743. Gray pays with Faceful Of Slime.
 744. Gray plays Hack the Doors.
 745. A look at the Gray reward pool: Distract & Pivot, Quick Vault, Here, Catch.
 746. NOTE — Laser Grid out of reach: Scramble 9 max against 14, Oomph 10ish against 18. Before fleeing I spend Heavy Pockets to shuffle Panic out of Red's hand (Panic had shown the room as 'Scramble 16 (printed 14)' and 'Oomph 18 and Scramble 2 (printed 0)'), and Hack the Doors to dump Faceful Of Slime from Gray's hand. Second Flee in a row; Band 3 rooms look out of reach for a 5-card hand without several free cards.
 747. You Flee Laser Grid Security Hall.
 748. Red Exhausts Crowbar.
 749. Red Exhausts Panic.
 750. Red Exhausts Fast Follow.
 751. Red Exhausts Fast Follow.
 752. Gray's deck is empty — the discard pile shuffles in to make a new one (34 cards).
 753. Gray Exhausts Crowbar.
 754. Gray Exhausts A Pair Of Stitch-Em-Ups.
 755. Gray Exhausts Duck Under.
 756. Gray Exhausts Pry Bar.
 757. Cleanup.
 758. Red discards Heavy Pockets from their play zone.
 759. Gray discards Hack the Doors from their play zone.
 760. Laser Grid Security Hall shuffles back into the Floor deck.
 761. — end of turn 25 —
 762. You are in: Laser Grid Security Hall.
 763. Red draws Tag Team.
 764. Red draws Shove.
 765. Red draws Pry Bar.
 766. Gray draws Hack the Doors.
 767. NOTE — Laser Grid again, immediately: the Fled room shuffled back into a 3-card Floor deck and came straight back up. Still out of reach (Scramble 8 at most), so a third Flee in a row, 12 cards Exhausted across the team in three turns. With the Floor deck this small, a Fled room returns about one turn in three, so there is no running from it.
 768. You Flee Laser Grid Security Hall.
 769. Red Exhausts Cutting Torch.
 770. Red Exhausts Riot Shield.
 771. Red Exhausts Cutting Torch.
 772. Red Exhausts Charge In.
 773. Gray Exhausts I'll Take That.
 774. Gray Exhausts Torn Seal.
 775. Gray Exhausts Stim Pack.
 776. Gray Exhausts Coil Of Cable.
 777. Cleanup.
 778. Laser Grid Security Hall shuffles back into the Floor deck.
 779. — end of turn 26 —
 780. NOTE — Shape problem: a Flee where nobody plays leaves both hands full, so Turn Start draws nothing and the next room meets the exact same 10 cards. Flee Exhaust comes off the deck, never the hand, so holding cards feels safe, but it freezes the hand. From here I spend cards on Flee turns just to cycle them.
 781. You are in: Bio-Hazard Containment Vault.
 782. Gray discards Duck Under from their hand.
 783. Gray pays with Duck Under.
 784. Gray plays One Man's Junk.
 785. Red discards Shove from their hand.
 786. Red pays with Shove.
 787. Red plays Tag Team.
 788. Red draws Overcharged Battery.
 789. Red discards Charge In from their hand.
 790. Red pays with Charge In.
 791. Red plays Overcharged Battery.
 792. Red plays Charge In.
 793. Red plays Pry Bar.
 794. Gray Scraps Riot Shield for +3 Oomph.
 795. NOTE — Cleared Bio-Hazard at Oomph 16 against 15, entirely on one draw: Tag Team drew Overcharged Battery, which made the second Charge In free. Without that draw the best was 14. Gray Scrapped the team's last Riot Shield for the final +3.
 796. Oomph 15 met — Clear, and one of you reveals a card reward.
 797. Bio-Hazard Containment Vault is Cleared.
 798. Gray's reward pool shows Distract & Pivot.
 799. Gray takes Distract & Pivot.
 800. Cleanup.
 801. Red discards Tag Team from their play zone.
 802. Red discards Overcharged Battery from their play zone.
 803. Red discards Charge In from their play zone.
 804. Red discards Pry Bar from their play zone.
 805. Gray discards One Man's Junk from their play zone.
 806. — end of turn 27 —
 807. You are in: Laser Grid Security Hall.
 808. Red draws Torn Seal.
 809. Red draws Overdrive.
 810. Red draws System Feedback.
 811. Red draws Shove.
 812. Red draws Salvaged Blueprint.
 813. Gray draws Distract & Pivot.
 814. Gray draws Cutting Torch.
 815. Gray draws A Pair Of Stitch-Em-Ups.
 816. Gray discards Catch Your Breath from their hand.
 817. Gray pays with Catch Your Breath.
 818. Gray plays A Pair Of Stitch-Em-Ups.
 819. Shove goes to Red's deck.
 820. Reckless Swing goes to Red's deck.
 821. NOTE — A Pair Of Stitch-Em-Ups on Red with Red's deck at 2: the 2 cards go to the bottom, so this turn's Flee (Exhaust 4) takes all four. The heal still leaves Red 2 cards up overall, but whatever I pick is exhausted again at once, so I pick the cheapest (Shove, Reckless Swing). The picker offers Panic and other Stuff as well as Red's own cards; the card text says 'cards', so that reads right.
 822. Red discards Torn Seal from their hand.
 823. Red pays with Torn Seal.
 824. Red plays Salvaged Blueprint.
 825. Red draws Charge In.
 826. Red draws Faceful Of Slime.
 827. Faceful Of Slime goes to Red's deck.
 828. Red discards System Feedback from their hand.
 829. Red pays with System Feedback.
 830. Red plays Shove.
 831. You Flee Laser Grid Security Hall.
 832. Red Exhausts Faceful Of Slime.
 833. Red Exhausts Shove.
 834. Red Exhausts Reckless Swing.
 835. Red's deck is empty — the discard pile shuffles in to make a new one (22 cards).
 836. Red Exhausts Overcharged Battery.
 837. Gray Exhausts Stim Pack.
 838. Gray Exhausts Scrap Magnet.
 839. Gray Exhausts Crowbar.
 840. Gray Exhausts Duck Under.
 841. Cleanup.
 842. Red discards Salvaged Blueprint from their play zone.
 843. Red discards Shove from their play zone.
 844. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
 845. Laser Grid Security Hall shuffles back into the Floor deck.
 846. — end of turn 28 —
 847. You are in: Laser Grid Security Hall.
 848. Red draws Fast Follow.
 849. Red draws Lean In.
 850. Red draws Junk Launcher.
 851. Gray draws Pocket Dynamo.
 852. Gray draws High-Frequency Scanner.
 853. Gray discards Distract & Pivot from their hand.
 854. Gray discards Hack the Doors from their hand.
 855. Gray pays with Distract & Pivot, Hack the Doors.
 856. Gray plays Cutting Torch.
 857. Red plays Fast Follow.
 858. Gray plays Pocket Dynamo.
 859. Gray draws Pick The Lock.
 860. Red discards Lean In from their hand.
 861. Red discards Charge In from their hand.
 862. Red pays with Lean In, Charge In.
 863. Red plays Junk Launcher.
 864. Gray discards Pick The Lock from their hand.
 865. Gray pays with Pick The Lock.
 866. Gray plays High-Frequency Scanner.
 867. A look at the Floor deck: The Iron Sentinel.
 868. NOTE — Laser Grid a fourth time. Tried the Oomph 18 line (Clear, but Exhaust 2, better than a Flee's 4): Cutting Torch, Fast Follow, Pocket Dynamo, then Junk Launcher. Best reachable is 17 with Overdrive, one short. Junk Launcher came to 6. Spending the rest only to cycle the hands.
 869. NOTE — Junk Launcher counted the play zone when it was played: Oomph 9 to 14 (+5 = Cutting Torch 2, Fast Follow 1, Pocket Dynamo 0, Junk Launcher 2). High-Frequency Scanner played after it added nothing to it. The card text ('Oomph equal to the total printed cost of all cards in the play zone') and the rulebook ('Stats on played cards add together', checked at Outcome) don't say whether a conditional stat is fixed at play or counted at Outcome. Question for the designer.
 870. You Flee Laser Grid Security Hall.
 871. Red Exhausts Sluggish.
 872. Red Exhausts System Feedback.
 873. Red Exhausts Shove.
 874. Red Exhausts Heavy Pockets.
 875. Gray Exhausts Pick The Lock.
 876. Gray Exhausts Corrosive Acid.
 877. Gray Exhausts Pick The Lock.
 878. Gray Exhausts In Step.
 879. Cleanup.
 880. Red discards Fast Follow from their play zone.
 881. Red discards Junk Launcher from their play zone.
 882. Gray discards Cutting Torch from their play zone.
 883. Gray discards Pocket Dynamo from their play zone.
 884. Gray discards High-Frequency Scanner from their play zone.
 885. Laser Grid Security Hall shuffles back into the Floor deck.
 886. — end of turn 29 —
 887. You are in: The Iron Sentinel.
 888. Red draws Torn Seal.
 889. Red draws System Feedback.
 890. Red draws Overdrive.
 891. Red draws Shove.
 892. Gray draws Pry Bar.
 893. Gray draws Pocket Dynamo.
 894. Gray draws Stim Pack.
 895. Gray draws Scrap Magnet.
 896. Gray draws Spore Cloud.
 897. Gray plays Stim Pack.
 898. Gray draws Duct Tape & Wire.
 899. Red discards System Feedback from their hand.
 900. Red pays with System Feedback.
 901. Red plays Shove.
 902. Gray plays Pocket Dynamo.
 903. Gray draws One Man's Junk.
 904. Gray plays Pry Bar.
 905. Gray discards Spore Cloud from their hand.
 906. Gray pays with Spore Cloud.
 907. Gray plays One Man's Junk.
 908. Gray discards Scrap Magnet from their hand.
 909. Gray pays with Scrap Magnet.
 910. Gray plays Duct Tape & Wire.
 911. NOTE — Iron Sentinel: Oomph 12 / Scramble 5 without the Overdrives, 16 with both. Neither 10/10 nor Oomph 18 is in reach, so a fifth Flee on floor 7. Red's hand is now two Overdrives and Torn Seal, cards I won't play into a Flee, so Red draws only 2 next turn.
 912. You Flee The Iron Sentinel.
 913. Red Exhausts Coil Of Cable.
 914. Red Exhausts Pry Bar.
 915. Red Exhausts Duct Tape & Wire.
 916. Red Exhausts Charge In.
 917. Gray Exhausts Riot Shield.
 918. Gray Exhausts Faceful Of Slime.
 919. Gray Exhausts Crowbar.
 920. Gray Exhausts Overcharged Battery.
 921. Red gets Panic.
 922. Red takes Panic into hand.
 923. Gray gets Rust.
 924. Gray takes Rust into hand.
 925. Cleanup.
 926. Red discards Shove from their play zone.
 927. Gray discards Stim Pack from their play zone.
 928. Gray discards Pocket Dynamo from their play zone.
 929. Gray discards Pry Bar from their play zone.
 930. Gray discards One Man's Junk from their play zone.
 931. Gray discards Duct Tape & Wire from their play zone.
 932. The Iron Sentinel shuffles back into the Floor deck.
 933. — end of turn 30 —
 934. You are in: The Iron Sentinel.
 935. Red draws Charge In.
 936. Gray draws Pry Bar.
 937. Gray's deck is empty — the discard pile shuffles in to make a new one (18 cards).
 938. Gray draws Stim Pack.
 939. Gray draws One Man's Junk.
 940. Gray draws Hack the Doors.
 941. Red discards Panic from their hand.
 942. Red discards Torn Seal from their hand.
 943. Red pays with Panic, Torn Seal.
 944. Red plays Charge In.
 945. Gray discards Rust from their hand.
 946. Gray pays with Rust.
 947. Gray plays One Man's Junk.
 948. Gray plays Stim Pack.
 949. Gray draws Pocket Dynamo.
 950. Gray plays Pry Bar.
 951. Gray plays Pocket Dynamo.
 952. Gray draws Duck Under.
 953. Gray discards Duck Under from their hand.
 954. Gray pays with Duck Under.
 955. Gray plays Hack the Doors.
 956. A look at the Red deck: Second Wind, Duct Tape & Wire, Junk Launcher.
 957. You Flee The Iron Sentinel.
 958. Red Exhausts Second Wind.
 959. Red Exhausts Duct Tape & Wire.
 960. Red Exhausts Junk Launcher.
 961. Red Exhausts Tag Team.
 962. Gray Exhausts High-Frequency Scanner.
 963. Gray Exhausts One Man's Junk.
 964. Gray Exhausts Hack the Doors.
 965. Gray Exhausts Pry Bar.
 966. Red gets Sluggish.
 967. Red takes Sluggish into hand.
 968. Gray gets Spore Cloud.
 969. Gray takes Spore Cloud into hand.
 970. Cleanup.
 971. Red discards Charge In from their play zone.
 972. Gray discards One Man's Junk from their play zone.
 973. Gray discards Stim Pack from their play zone.
 974. Gray discards Pry Bar from their play zone.
 975. Gray discards Pocket Dynamo from their play zone.
 976. Gray discards Hack the Doors from their play zone.
 977. The Iron Sentinel shuffles back into the Floor deck.
 978. — end of turn 31 —
 979. You are in: Laser Grid Security Hall.
 980. Red draws Charge In.
 981. Red's deck is empty — the discard pile shuffles in to make a new one (11 cards).
 982. Red draws Fast Follow.
 983. Gray draws Pick The Lock.
 984. Gray draws Pocket Dynamo.
 985. Gray draws A Pair Of Stitch-Em-Ups.
 986. Gray draws Cutting Torch.
 987. Gray discards Spore Cloud from their hand.
 988. Gray pays with Spore Cloud.
 989. Gray plays A Pair Of Stitch-Em-Ups.
 990. Riot Shield goes to Red's deck.
 991. Charge In goes to Red's deck.
 992. Red plays Fast Follow.
 993. Gray plays Pocket Dynamo.
 994. Gray draws Duct Tape & Wire.
 995. Gray discards Pick The Lock from their hand.
 996. Gray discards Duct Tape & Wire from their hand.
 997. Gray pays with Pick The Lock, Duct Tape & Wire.
 998. Gray plays Cutting Torch.
 999. Red discards Overdrive from their hand.
1000. Red discards Overdrive from their hand.
1001. Red discards Sluggish from their hand.
1002. Red pays with Overdrive, Overdrive, Sluggish.
1003. Red plays Charge In.
1004. NOTE — Laser Grid a fifth time, out of reach. Spent the turn on Stamina and cycling: Stitch-Em-Ups on Red while Red's deck is 10 deep, so the bottom 2 survive this Flee; Fast Follow free through Sluggish (rulebook: 'for free' ignores cost modifiers); Charge In paid with both Overdrives and Sluggish to clear Red's dead hand.
1005. You Flee Laser Grid Security Hall.
1006. Red Exhausts Charge In.
1007. Red Exhausts Torn Seal.
1008. Red Exhausts Shove.
1009. Red Exhausts Shove.
1010. Gray Exhausts Scrap Magnet.
1011. Gray Exhausts Distract & Pivot.
1012. Gray Exhausts Catch Your Breath.
1013. Gray Exhausts Spore Cloud.
1014. Cleanup.
1015. Red discards Fast Follow from their play zone.
1016. Red discards Charge In from their play zone.
1017. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
1018. Gray discards Pocket Dynamo from their play zone.
1019. Gray discards Cutting Torch from their play zone.
1020. Laser Grid Security Hall shuffles back into the Floor deck.
1021. — end of turn 32 —
1022. You are in: The Iron Sentinel.
1023. Red draws Charge In.
1024. Red draws Junk Launcher.
1025. Red draws Lean In.
1026. Red draws Salvaged Blueprint.
1027. Red draws Panic.
1028. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
1029. Gray draws Spore Cloud.
1030. Gray draws Cutting Torch.
1031. Gray draws Pocket Dynamo.
1032. Gray draws Rust.
1033. Gray draws Duct Tape & Wire.
1034. Gray discards Spore Cloud from their hand.
1035. Gray discards Rust from their hand.
1036. Gray pays with Spore Cloud, Rust.
1037. Gray plays Cutting Torch.
1038. Red discards Panic from their hand.
1039. Red pays with Panic.
1040. Red plays Salvaged Blueprint.
1041. Red draws System Feedback.
1042. Red draws Riot Shield.
1043. System Feedback goes to Red's deck.
1044. Red discards Lean In from their hand.
1045. Red discards Junk Launcher from their hand.
1046. Red pays with Lean In, Junk Launcher.
1047. Red plays Charge In.
1048. Gray plays Pocket Dynamo.
1049. Gray draws A Pair Of Stitch-Em-Ups.
1050. Gray discards Duct Tape & Wire from their hand.
1051. Gray pays with Duct Tape & Wire.
1052. Gray plays A Pair Of Stitch-Em-Ups.
1053. Riot Shield goes to Gray's deck.
1054. Pry Bar goes to Gray's deck.
1055. You Flee The Iron Sentinel.
1056. Red Exhausts System Feedback.
1057. Red Exhausts Charge In.
1058. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
1059. Red Exhausts Junk Launcher.
1060. Red Exhausts Charge In.
1061. Gray Exhausts Duck Under.
1062. Gray Exhausts Pocket Dynamo.
1063. Gray Exhausts Pry Bar.
1064. Gray Exhausts Pick The Lock.
1065. Red gets My Head Is Quantum Spinning.
1066. Red takes My Head Is Quantum Spinning into hand.
1067. Gray gets My Head Is Quantum Spinning.
1068. Gray takes My Head Is Quantum Spinning into hand.
1069. Cleanup.
1070. Red discards Salvaged Blueprint from their play zone.
1071. Red discards Charge In from their play zone.
1072. Gray discards Cutting Torch from their play zone.
1073. Gray discards Pocket Dynamo from their play zone.
1074. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
1075. The Iron Sentinel shuffles back into the Floor deck.
1076. — end of turn 33 —
1077. You are in: The Iron Sentinel.
1078. Red draws Panic.
1079. Red draws Fast Follow.
1080. Red draws Overdrive.
1081. Gray draws Hack the Doors.
1082. Gray draws One Man's Junk.
1083. Gray draws Stim Pack.
1084. Gray draws Riot Shield.
1085. Red discards Panic from their hand.
1086. Red pays with Panic.
1087. Red plays Riot Shield.
1088. Gray plays Stim Pack.
1089. Gray draws Pry Bar.
1090. Red Exhausts Sluggish.
1091. Red plays Fast Follow.
1092. Gray plays Pry Bar.
1093. NOTE — Iron Sentinel with Panic paid away: best split is Oomph 10 / Scramble 9 or Oomph 12 / Scramble 8, one Scramble short of 10/10 again. Found a timing edge: a Flee's Exhaust resolves at Outcome, before Cleanup moves the play zone to the discard pile. So cards in hand or in play are safe, and cards paid as a cost go to the discard, where a short deck's reshuffle feeds them to the Exhaust. On a doomed turn, free plays are safe and paying is not.
1094. You Flee The Iron Sentinel.
1095. Red Exhausts Lean In.
1096. Red Exhausts Overdrive.
1097. Red's deck is empty — the discard pile shuffles in to make a new one (3 cards).
1098. Red Exhausts Panic.
1099. Red Exhausts Charge In.
1100. Gray's deck is empty — the discard pile shuffles in to make a new one (6 cards).
1101. Gray Exhausts Spore Cloud.
1102. Gray Exhausts Duct Tape & Wire.
1103. Gray Exhausts Rust.
1104. Gray Exhausts Cutting Torch.
1105. Red gets Rust.
1106. Red takes Rust into hand.
1107. The Bad Stuff pool is empty — Gray gets nothing.
1108. Cleanup.
1109. Red discards Riot Shield from their play zone.
1110. Red discards Fast Follow from their play zone.
1111. Gray discards Stim Pack from their play zone.
1112. Gray discards Pry Bar from their play zone.
1113. The Iron Sentinel shuffles back into the Floor deck.
1114. — end of turn 34 —
1115. You are in: Laser Grid Security Hall.
1116. Red draws Salvaged Blueprint.
1117. Red's deck is empty — the discard pile shuffles in to make a new one (2 cards).
1118. Red draws Riot Shield.
1119. Gray draws A Pair Of Stitch-Em-Ups.
1120. Gray discards My Head Is Quantum Spinning from their hand.
1121. Gray pays with My Head Is Quantum Spinning.
1122. Gray plays A Pair Of Stitch-Em-Ups.
1123. Fast Follow goes to Red's deck.
1124. Charge In goes to Red's deck.
1125. Red discards Rust from their hand.
1126. Red pays with Rust.
1127. Red plays Riot Shield.
1128. NOTE — Laser Grid again, out of reach, and Red is out of Stamina: 6 live cards, plus 2 from Stitch-Em-Ups. A Flee Exhausts 4, and the 4 left can't cover next turn's draw to 5, so Red goes Down at the next Turn Start whatever I do. Red pays Riot Shield with Rust only so this Flee doesn't end the run on the spot.
1129. You Flee Laser Grid Security Hall.
1130. Red Exhausts Fast Follow.
1131. Red Exhausts Fast Follow.
1132. Red Exhausts Charge In.
1133. Red's deck is empty — the discard pile shuffles in to make a new one (1 cards).
1134. Red Exhausts Rust.
1135. Gray Exhausts Pocket Dynamo.
1136. Gray's deck is empty — the discard pile shuffles in to make a new one (3 cards).
1137. Gray Exhausts My Head Is Quantum Spinning.
1138. Gray Exhausts Stim Pack.
1139. Gray Exhausts Pry Bar.
1140. Cleanup.
1141. Red discards Riot Shield from their play zone.
1142. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
1143. Laser Grid Security Hall shuffles back into the Floor deck.
1144. — end of turn 35 —
1145. You are in: Laser Grid Security Hall.
1146. Red's deck is empty — the discard pile shuffles in to make a new one (1 cards).
1147. Red draws Riot Shield.
1148. Red is Down — drew from an empty deck and discard pile. The run is lost.
1149. Red discards My Head Is Quantum Spinning from their hand.
1150. Red discards Overdrive from their hand.
1151. Red discards Salvaged Blueprint from their hand.
1152. Red discards Riot Shield from their hand.
1153. You lose.
1154. NOTE — Defeat, turn 36, floor 7: Red went Down drawing at Turn Start. Floor 7 had 4 rooms. We cleared the two Bio-Hazards and Fled Laser Grid (x6) and The Iron Sentinel (x5) eleven times in 13 turns. After the Down, the log shows Red's hand discarded; the rulebook doesn't say anything happens to it. Harmless, but not in the rules.

Floor 7 · turn 36 · GameOver   floor deck 1, cleared 23   Good Stuff 16, Bad Stuff 0
Room: Laser Grid Security Hall (room)
    Scramble 14: Clear, and Gray reveals a card reward.
    Oomph 18: Clear, but both players Exhaust 2.
    Flee: Both players Exhaust 4.
Red: deck 0, discard 4, exhaust 41, hand 0  DOWN
Gray: deck 0, discard 1, exhaust 47, hand 3
    Hack the Doors [cost 1; Scramble 3] — Look at top 3 cards of any deck, put back in any order.
    One Man's Junk [cost 1; Oomph 2, Scramble 2] — If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1.
    Riot Shield [cost 1; Scramble 3; Good Stuff] — If the room is Cleared, return this card to your hand at the end of the turn.
Outcome: Defeat

seed 10, 241 command(s) replayed, floor 7, turn 36, Defeat.
```
