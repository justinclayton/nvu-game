# Playtest 11: The first rooftop

Recorded 2026-09-25. Rules version 0.2.5 (main at 4cb67e8). Played by an agent standing in for a
human playtester, in the CLI (`bin/nvu`), seed 10, one shell call per decision. The run ended in
**Victory** on turn 29, when The Monolith Core fell to Oomph 14 / Scramble 11. It is the first
agent run to reach the rooftop.

Seed 10 is the seed playtest 10 lost on floor 7, turn 36. Since then, rules 0.2.5 made Good Stuff
and card rewards a pick from a spread of 3, sent a taken card reward to the discard pile, and added
six Red and Gray reward cards. The Floor decks dealt differently this time, so this is not the same
run replayed.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

For context, `bin/nvu sim --seeds 500` (greedy) on the same build: 0/500 wins, 357 runs ending on
floor 7. The bot on seed 10 alone dies on floor 7. The bot almost never plays the co-op cards this
run leaned on: Rhythm & Bruise 2 plays across 500 runs, Covering Fire 4, Synergy Link 1, and In
Step does not appear in its list.

## How the run went

Band 1 (turns 1-7) cost nothing again. The Sentry Drone was the first room of floor 1, so the floor
lasted one turn, and it came up third on floors 2 and 3. Every Drone Cleared on its Oomph 4 /
Scramble 4 line for 2 Good Stuff each. With a pick from 3, I could choose what I kept: Cutting
Torch, Pry Bar, Grav Harness, Riot Shields, Overcharged Batteries. By floor 3 both hands were mostly
Good Stuff (note 3).

Band 2 (turns 8-20) was clean: no Flee and no Exhaust on either side. Riot Shields covered the
Turret's Scramble 8 four times. The Gears & Glitch stairwell came last on floor 4 (seven turns),
first on floor 5 (one turn), and fourth on floor 6. The turn that stood out was Hydroponics'
Scramble 11 on floor 5: Gray's Covering Fire and In Step, fed by Red playing two cheap cards (note
4). The second Hydroponics was out of reach and I took Scramble 6 and its Bad Stuff (note 5).
Entering Band 3, neither side had lost a card (note 6).

Floor 7 (turns 21-22) took two turns. Smoldering Armory's Oomph 16 fell to two Overcharged
Batteries chained into Grav Harness, Tag Team and Cutting Torch (note 7). The Iron Sentinel came
second. Its 10/10 was one Scramble short, so I took the Oomph 18 line and its Exhaust 3 each, with
Rhythm & Bruise counting four Gray cards (note 8).

Floor 8 (turns 23-26) had three rooms. The Bio-Hazard Vault Cleared on Scramble 15 without scrapping
anything, on In Step counting three Red plays. The Iron Sentinel then cost the run's first Flee:
Scramble 13 was there, Oomph stopped at 8 (note 9). Smoldering Armory took Oomph 10 while Red paid
off Spore Cloud and My Head Is Quantum Spinning, and the Sentinel came back last and fell at 11/15
(note 10).

Floor 9 (turns 27-28) had two rooms. Laser Grid came first and missed Scramble 14 by one, the
second Flee (note 11). The Iron Sentinel fell at exactly 11/11, found by ordering the plays (note
12). Floor 10's Monolith Core took one turn: Crowbar and Covering Fire, then Fast Follow, Rhythm &
Bruise and Duct Tape & Wire from Red, then In Step for 6 (note 13). Red finished with 16 cards
Exhausted, Gray with 13.

## Notes

1. **Floor 1 in one turn.** `[agent]` (log 12)

   > Sentry Drone is the very first room of floor 1, so floor 1 lasts one turn. Going for Oomph 4 / Scramble 4 for 2 Good Stuff each.

   Rulebook, Floor deck: the Stairwell is shuffled in with the Rooms, so it can come up first.
   Matches. Shape: see What the run showed.

2. **Riot Shield returns before the end of the turn.** `[agent]` (log 185)

   > Riot Shield came back to hand during Outcome, before the Good Stuff reveal, not 'at the end of the turn' as printed. The stat pool line then reads 'Oomph 5, Scramble 0' though Scramble 6 was just met: the Shields' Scramble left the pool with them. Harmless here, but the timing doesn't match the card, and the display misreports what cleared the room.

   `design/cards.yaml`, Riot Shield: "If the room is Cleared, return this card to your hand at the
   end of the turn." The rulebook's turn has no step named "end of the turn"; the nearest is Cleanup
   ("Cleanup (end of turn)"). The log shows the return inside Outcome, before the Good Stuff reveal
   and before Cleanup. The same happened on every Clear with a Riot Shield in play, and the stat pool
   line after Outcome dropped the Shields' Scramble each time. Possible engine mismatch. It matters
   against Spore Cloud (playtest 10, note 2) and any other effect that counts the hand at Cleanup.
   Question for the designer: is "the end of the turn" Cleanup, and does the Shield return before
   or after Discard your play zone?

3. **Band 1 is still free.** `[agent]` (log 205)

   > Band 1 over in 7 turns, zero Exhaust again. Two of the three floors ended on their first or third room. The spread-of-3 Good Stuff pick means both hands are nearly all Good Stuff now; I kept what I picked and cycled starters to pay.

   Same finding as playtest 10, note 1. New in 0.2.5: the pick from 3 let me steer toward free and
   both-stat Stuff, which paid off in Band 3.

4. **Covering Fire and In Step.** `[agent]` (log 442)

   > Hydroponics Scramble 11 reached on a Covering Fire / In Step chain: Red played two cheap cards only to feed Gray draws and In Step's count. The co-op cards are the first thing in the run that felt like teamwork rather than two piles of stats.

   Shape, and the main positive finding. Red's plays had value only through Gray's cards.

5. **Clearing on the Bad Stuff line.** `[agent]` (log 566)

   > Hydroponics again: Scramble 11 is out of reach (Gray 6 max, Red 3 via Riot Shield), so I take Scramble 6 and its Bad Stuff over a Flee.

   Same choice as playtest 10, note 4. No question.

6. **State entering Band 3.** `[agent]` (log 611)

   > Band 2 cleared in 13 turns (turns 8-20) with no Flee and zero Exhaust on either side. Entering Band 3 with Red deck ~29, Gray ~36, both exhaust 0. Much stronger than playtest 10 at the same point (Red exhaust 3, Gray 5).

   State only. The bot's mean after each Ascend is about 23.5 live cards for Red and 24.3 for Gray.

7. **Overcharged Battery crosses players.** `[agent]` (log 643)

   > Overcharged Battery played by Gray made Red's next card free (Grav Harness at cost 0). The card says 'The next card played this turn', not 'you play', so crossing players reads right. Smoldering Armory Oomph 16 cleared on the first Band 3 room: two Batteries chained into Grav Harness, Tag Team, Cutting Torch.

   `design/cards.yaml`: "The next card played this turn is played for free." The engine applied it
   to whichever player played next, and the moves list showed Red's cards at `cost 0`. That matches
   the text. It also means the free play is lost on a card that was free anyway: Pry Bar played
   right after would use it up. Not a bug; a sequencing trap worth knowing.

8. **The Iron Sentinel's Oomph 18 line.** `[agent]` (log 675)

   > Iron Sentinel on the 2nd room of floor 7. 10/10 is one Scramble short: Gray tops out at Scramble 7 (Emergency Power Core 3, Pick The Lock 4) and Red's only Scramble is Cross Punch's 2. Going for Oomph 18 instead: Gray plays out wide so Rhythm & Bruise counts 4 Gray cards. Exhaust 3 each beats a Flee's Exhaust 4 plus Bad Stuff.

   Arithmetic checked against the printed cards. Oomph came to 21. The Oomph 18 line is a real
   option when it ascends: Exhaust 3 is less than a Flee's Exhaust 4, and the floor ends.

9. **One hand can't carry 10/10.** `[agent]` (log 776)

   > Iron Sentinel on floor 8, 2nd room. Double Covering Fire drew Gray 4 cards off Red's 2 plays, and Scramble 13 was in reach, but Oomph stops at 8: Red's five cards can make at most Oomph 6 as plays (two cost-2 cards and one payer too few) and none of Gray's 7 draws carried Oomph. Fleeing. The 10/10 line needs both hands to carry both stats; one hand of cost-2 cards can't.

   Shape. A hand holding two cost-2 cards spends four of its five cards on one play's payment
   and another's, so its stats cap low. See What the run showed.

10. **The Iron Sentinel on the second try.** `[agent]` (log 865)

   > Iron Sentinel 10/10 cleared on the second try. Gray's Overcharged Battery made Red's Grav Harness free, Set 'Em Up fed +2 into Coil Of Cable. Both hands had to put up both stats; this time they could.

   Shape. The Fled Sentinel was the last card in a two-card Floor deck, so it came straight back,
   as in playtest 10, note 11. This time the second draw was good enough.

11. **Laser Grid, one short.** `[agent]` (log 906)

   > Laser Grid, floor 9 first room: best Scramble is 13 against 14 (Battery into a free Pick The Lock, Riot Shield paid with I'll Take That), Red's hand already spent on Oomph 11 to feed Covering Fire. Oomph 18 is further off. One short, Flee. Keeping Gray's hand for the stairwell.

   Arithmetic only. The Flee's Exhaust 4 each came off the decks, not the held hand, so Gray's
   hand carried the next turn's Sentinel (note 12).

12. **The Iron Sentinel by sequencing.** `[agent]` (log 948)

   > Iron Sentinel on floor 9 at exactly 11/11, found only by ordering: Battery's free play spent on Gray's own Pick The Lock, Red's Pry Bar and Fast Follow before Grav Harness, and Riot Shield paid with I'll Take That so its forced Stuff shuffle never fires. Sequencing mattered more than any draw this turn.

   Shape, positive. The decision was which card each cost and free play landed on, not which
   cards to hold.

13. **Rhythm & Bruise counts live.** `[agent]` (log 992)

   > Rhythm & Bruise went from Oomph 6 to 8 when Gray played In Step after it: it counts Gray's cards live, not at the moment it was played. Its text opens with 'Play:', which reads as a one-time effect when played. Playtest 10 saw Junk Launcher fixed at play. Two conditional-stat cards, two timings?

   `design/cards.yaml`, Rhythm & Bruise: "Play: Gains Oomph +2 for each card Gray has played this
   turn. If Gray played 2 or more cards, draw 1 card." The stat pool went from Oomph 12 to 14 when
   In Step (no Oomph) was played after it, so Rhythm & Bruise went from 6 to 8. On floor 7 it was
   played last, so the difference never showed. The rulebook's Keywords do not define `Play:`.
   Playtest 10, note 16 found Junk Launcher fixed when played. Possible engine mismatch, or two
   intended timings. Questions for the designer: what does `Play:` mean, and is a conditional stat
   fixed when played or counted at Outcome? The draw half of the card fired at play either way.

## What the run showed

1. **The 10/10 stairwells are a sequencing puzzle, and both hands need both stats.** The Iron
   Sentinel fell three times: once on Oomph 18 (note 8), twice on 10/10 (notes 10, 12), and cost
   one Flee (note 9). Every Clear came from ordering plays so a free play or a +2 landed on the
   right card. Both Band 3 Flees missed by one or two points, and the floor 8 miss came from
   one hand holding only one stat.
2. **The 0.2.5 reward cards turn Red and Gray into a team.** Covering Fire, In Step, Rhythm &
   Bruise, Set 'Em Up and Overcharged Battery all pay off only through the other player's plays,
   and they carried Hydroponics' Scramble 11, the Bio-Hazard Vault, both 10/10 Sentinels and the
   Monolith Core. The greedy bot barely plays them and still wins 0 of 500, so the bot's win rate
   is no longer a good proxy for how hard the game is.
3. **Stairwell position still decides floor length.** Floors 1, 5 and 10 lasted one turn; floor 4
   lasted seven. Band 1 and Band 2 cost nothing here, so all the danger sat in floors 7-9. A
   losing run would likely have been one where the Sentinel came last on a floor with Laser Grid.

## The CLI as a playtest tool

Friction, worst first:

1. The moves list after every play still prints every payment combination as its own line. I
   piped every call through `grep -v '^card '` to keep the output readable.
2. The stat pool shown after Outcome drops a returned Riot Shield's stats (note 2), so the table
   no longer shows what Cleared the room.
3. No live-card count per character. Band 3 decisions turned on it; I summed deck, discard and hand
   by hand.
4. A conditional stat's current value is not shown. I learned Rhythm & Bruise's value only by
   reading the stat pool before and after (note 13). Printing `Rhythm & Bruise (Oomph 8)` in the
   play zone would settle it at a glance.
5. `play card` prints the full table after every play. For a five-play turn I only needed the stat
   pool line and any draws.

What worked: the moves list showed Red's cards at `cost 0` after Gray's Overcharged Battery, which
answered "whose next card?" before I committed (note 7). `play pile Gray hand` was the right size
for checking a hand mid-turn. Staged choices (Grav Harness's "one of you draws", Momentum Shift's
Exhaust, Spore Cloud's discard) each blocked the run and said what they waited on. `play take` and
the paired Good Stuff reveals were never confusing.

## Candidate issues

Engine mismatches (possible):

- Riot Shield returns to hand during Outcome, not "at the end of the turn" (note 2).
- Rhythm & Bruise counts Gray's cards played after it, though its text starts with `Play:`; Junk
  Launcher was fixed at play in playtest 10 (note 13).

Rulebook questions:

- What is "the end of the turn": Cleanup, and before or after Discard your play zone (note 2)?
- What does `Play:` mean? It is on many cards and not in Keywords (note 13).
- Is a conditional stat fixed when played or counted at Outcome (note 13; playtest 10, note 16)?

Shape, independent of tuning:

- Band 1 costs nothing (note 3), again.
- Band 3 10/10 lines need both stats from both hands; a hand of cost-2 cards caps low (note 9).
- Stairwell position sets floor length, one turn to seven (notes 1, 10).
- The greedy bot does not play the co-op cards, so its win rate understates the game (What the
  run showed, 2).

Card observations for a later re-tune:

- Overcharged Battery crossing players is strong and the best sequencing lever in the run (notes 7,
  10, 12).
- Covering Fire with Red playing cheap cards drew Gray up to 4 cards a turn (note 9).
- Riot Shield again carried Band 2's Scramble.

CLI:

- Collapse the payment combinations in the moves list (friction 1).
- Keep a returned card's stats in the post-Outcome stat pool (friction 2).
- Print a live-card total per character (friction 3).
- Show a conditional stat's current value in the play zone (friction 4).

## Appendix: the run transcript

`bin/nvu replay design/playtests/11-first-rooftop.json`, verbatim.

```
   1. Floor 1 is built: 10 rooms.
   2. You are in: The Sentry Drone.
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
  13. NOTE — Sentry Drone is the very first room of floor 1, so floor 1 lasts one turn. Going for Oomph 4 / Scramble 4 for 2 Good Stuff each.
  14. Red discards Shove from their hand.
  15. Red discards Shove from their hand.
  16. Red pays with Shove, Shove.
  17. Red plays Charge In.
  18. Gray discards Duck Under from their hand.
  19. Gray discards Peek Around Corner from their hand.
  20. Gray pays with Duck Under, Peek Around Corner.
  21. Gray plays Pick The Lock.
  22. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
  23. The Sentry Drone is Cleared.
  24. Red reveals Good Stuff: Cutting Torch, Pry Bar, Pocket Dynamo.
  25. Gray reveals Good Stuff: Scrap Magnet, Coil Of Cable, Duct Tape & Wire.
  26. Red gets Cutting Torch.
  27. Red takes Cutting Torch into hand.
  28. Gray gets Coil Of Cable.
  29. Gray takes Coil Of Cable into hand.
  30. Red reveals Good Stuff: Crowbar, Stim Pack, Pry Bar.
  31. Gray reveals Good Stuff: Coil Of Cable, Riot Shield, Stim Pack.
  32. Red gets Pry Bar.
  33. Red takes Pry Bar into hand.
  34. Gray gets Riot Shield.
  35. Gray takes Riot Shield into hand.
  36. Cleanup.
  37. Red discards Charge In from their play zone.
  38. Gray discards Pick The Lock from their play zone.
  39. — end of turn 1 —
  40. Floor 1 is clear.
  41. Red shuffles 4 card(s) back in.
  42. Red takes Fast Follow into their discard pile.
  43. Gray shuffles 4 card(s) back in.
  44. Gray takes One Man's Junk into their discard pile.
  45. Floor 2 is built: 9 rooms.
  46. You are in: Security Turnstile.
  47. Red draws Charge In.
  48. Red draws Charge In.
  49. Red draws Cutting Torch.
  50. Red draws Charge In.
  51. Red draws Overdrive.
  52. Gray draws Duck Under.
  53. Gray draws Work The Angles.
  54. Gray draws Pick The Lock.
  55. Gray draws Pick The Lock.
  56. Gray draws Pick The Lock.
  57. Gray discards Duck Under from their hand.
  58. Gray discards Work The Angles from their hand.
  59. Gray pays with Duck Under, Work The Angles.
  60. Gray plays Pick The Lock.
  61. Red discards Charge In from their hand.
  62. Red discards Overdrive from their hand.
  63. Red pays with Charge In, Overdrive.
  64. Red plays Charge In.
  65. Scramble 3 met — Clear.
  66. Security Turnstile is Cleared.
  67. Cleanup.
  68. Red discards Charge In from their play zone.
  69. Gray discards Pick The Lock from their play zone.
  70. — end of turn 2 —
  71. You are in: Security Turnstile.
  72. Red draws Shove.
  73. Red draws Lean In.
  74. Red draws Charge In.
  75. Gray draws Duck Under.
  76. Gray draws Peek Around Corner.
  77. Gray draws Riot Shield.
  78. Gray discards Peek Around Corner from their hand.
  79. Gray pays with Peek Around Corner.
  80. Gray plays Riot Shield.
  81. Red discards Shove from their hand.
  82. Red discards Lean In from their hand.
  83. Red pays with Shove, Lean In.
  84. Red plays Charge In.
  85. Scramble 3 met — Clear.
  86. Security Turnstile is Cleared.
  87. Gray takes Riot Shield into hand.
  88. Cleanup.
  89. Red discards Charge In from their play zone.
  90. — end of turn 3 —
  91. You are in: The Sentry Drone.
  92. Red draws Overdrive.
  93. Red draws Pry Bar.
  94. Red draws Shove.
  95. Gray draws Pick The Lock.
  96. Gray discards Pick The Lock from their hand.
  97. Gray discards Pick The Lock from their hand.
  98. Gray pays with Pick The Lock, Pick The Lock.
  99. Gray plays Pick The Lock.
 100. Red discards Shove from their hand.
 101. Red discards Overdrive from their hand.
 102. Red pays with Shove, Overdrive.
 103. Red plays Charge In.
 104. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
 105. The Sentry Drone is Cleared.
 106. Red reveals Good Stuff: Grav Harness, Crowbar, Cutting Torch.
 107. Gray reveals Good Stuff: Pry Bar, Emergency Power Core, Overcharged Battery.
 108. Red gets Grav Harness.
 109. Red takes Grav Harness into hand.
 110. Gray gets Overcharged Battery.
 111. Gray takes Overcharged Battery into hand.
 112. Red reveals Good Stuff: Riot Shield, Scrap Magnet, Automated Salvage Kit.
 113. Gray reveals Good Stuff: Scrap Magnet, Duct Tape & Wire, Stim Pack.
 114. Red gets Riot Shield.
 115. Red takes Riot Shield into hand.
 116. Gray gets Stim Pack.
 117. Gray takes Stim Pack into hand.
 118. Cleanup.
 119. Red discards Charge In from their play zone.
 120. Gray discards Pick The Lock from their play zone.
 121. — end of turn 4 —
 122. Floor 2 is clear.
 123. Red shuffles 4 card(s) back in.
 124. Red takes Tag Team into their discard pile.
 125. Gray shuffles 4 card(s) back in.
 126. Gray takes One Man's Junk into their discard pile.
 127. Floor 3 is built: 8 rooms.
 128. You are in: Security Turnstile.
 129. Red draws Grav Harness.
 130. Red draws Riot Shield.
 131. Red draws Cutting Torch.
 132. Red draws Pry Bar.
 133. Red's deck is empty — the discard pile shuffles in to make a new one (14 cards).
 134. Red draws Lean In.
 135. Gray draws Overcharged Battery.
 136. Gray draws Riot Shield.
 137. Gray draws Stim Pack.
 138. Gray draws Duck Under.
 139. Gray draws Duck Under.
 140. Gray discards Duck Under from their hand.
 141. Gray pays with Duck Under.
 142. Gray plays Riot Shield.
 143. Red discards Lean In from their hand.
 144. Red pays with Lean In.
 145. Red plays Riot Shield.
 146. Scramble 3 met — Clear.
 147. Security Turnstile is Cleared.
 148. Gray takes Riot Shield into hand.
 149. Red takes Riot Shield into hand.
 150. Cleanup.
 151. — end of turn 5 —
 152. You are in: Security Turnstile.
 153. Red draws Charge In.
 154. Gray draws Coil Of Cable.
 155. Gray discards Duck Under from their hand.
 156. Gray pays with Duck Under.
 157. Gray plays Riot Shield.
 158. Red discards Charge In from their hand.
 159. Red pays with Charge In.
 160. Red plays Riot Shield.
 161. Scramble 3 met — Clear.
 162. Security Turnstile is Cleared.
 163. Gray takes Riot Shield into hand.
 164. Red takes Riot Shield into hand.
 165. Cleanup.
 166. — end of turn 6 —
 167. You are in: The Sentry Drone.
 168. Red draws Shove.
 169. Gray's deck is empty — the discard pile shuffles in to make a new one (14 cards).
 170. Gray draws Duck Under.
 171. Gray discards Duck Under from their hand.
 172. Gray pays with Duck Under.
 173. Gray plays Riot Shield.
 174. Red discards Shove from their hand.
 175. Red pays with Shove.
 176. Red plays Riot Shield.
 177. Red plays Pry Bar.
 178. Gray plays Stim Pack.
 179. Gray draws One Man's Junk.
 180. Scramble 6 met — Ascend.
 181. Oomph 4 and Scramble 4 met — Ascend, and both players get 2 Good Stuff!
 182. The Sentry Drone is Cleared.
 183. Gray takes Riot Shield into hand.
 184. Red takes Riot Shield into hand.
 185. Red reveals Good Stuff: Overcharged Battery, Emergency Breaker, Stim Pack.
 186. Gray reveals Good Stuff: Pocket Dynamo, Duct Tape & Wire, Riot Shield.
 187. NOTE — Riot Shield came back to hand during Outcome, before the Good Stuff reveal, not 'at the end of the turn' as printed. The stat pool line then reads 'Oomph 5, Scramble 0' though Scramble 6 was just met: the Shields' Scramble left the pool with them. Harmless here, but the timing doesn't match the card, and the display misreports what cleared the room.
 188. Red gets Overcharged Battery.
 189. Red takes Overcharged Battery into hand.
 190. Gray gets Riot Shield.
 191. Gray takes Riot Shield into hand.
 192. Red reveals Good Stuff: High-Frequency Scanner, High-Frequency Scanner, Duct Tape & Wire.
 193. Gray reveals Good Stuff: Salvaged Blueprint, Stim Pack, Pocket Dynamo.
 194. Red gets Duct Tape & Wire.
 195. Red takes Duct Tape & Wire into hand.
 196. Gray gets Stim Pack.
 197. Gray takes Stim Pack into hand.
 198. Cleanup.
 199. Red discards Pry Bar from their play zone.
 200. Gray discards Stim Pack from their play zone.
 201. — end of turn 7 —
 202. Floor 3 is clear.
 203. Red shuffles 5 card(s) back in.
 204. Red takes Momentum Shift into their discard pile.
 205. Gray shuffles 6 card(s) back in.
 206. Gray takes Here, Catch into their discard pile.
 207. Floor 4 is built: 7 rooms.
 208. NOTE — Band 1 over in 7 turns, zero Exhaust again. Two of the three floors ended on their first or third room. The spread-of-3 Good Stuff pick means both hands are nearly all Good Stuff now; I kept what I picked and cycled starters to pay.
 209. You are in: Pressurized Maintenance Hub.
 210. Red draws Overdrive.
 211. Red draws Fast Follow.
 212. Red draws Duct Tape & Wire.
 213. Red draws Charge In.
 214. Red draws Charge In.
 215. Gray draws Riot Shield.
 216. Gray draws Pick The Lock.
 217. Gray draws Duck Under.
 218. Gray draws Pick The Lock.
 219. Gray draws Pick The Lock.
 220. Gray discards Duck Under from their hand.
 221. Gray pays with Duck Under.
 222. Gray plays Riot Shield.
 223. Gray discards Pick The Lock from their hand.
 224. Gray discards Pick The Lock from their hand.
 225. Gray pays with Pick The Lock, Pick The Lock.
 226. Gray plays Pick The Lock.
 227. Red plays Fast Follow.
 228. Red discards Charge In from their hand.
 229. Red discards Overdrive from their hand.
 230. Red pays with Charge In, Overdrive.
 231. Red plays Charge In.
 232. Oomph 7 met — Clear, and Red reveals a card reward.
 233. Scramble 7 met — Clear, and Gray reveals a card reward.
 234. Pressurized Maintenance Hub is Cleared.
 235. Gray takes Riot Shield into hand.
 236. Red's reward pool shows Junk Launcher, Second Wind, Brute Recycle.
 237. Red takes Second Wind into their discard pile.
 238. Gray's reward pool shows Synergy Link, Here, Catch, Covering Fire.
 239. Gray takes Covering Fire into their discard pile.
 240. Cleanup.
 241. Red discards Fast Follow from their play zone.
 242. Red discards Charge In from their play zone.
 243. Gray discards Pick The Lock from their play zone.
 244. — end of turn 8 —
 245. You are in: Automated Defense Turret.
 246. Red draws Overcharged Battery.
 247. Red draws Shove.
 248. Red draws Tag Team.
 249. Red draws Cutting Torch.
 250. Gray draws Pick The Lock.
 251. Gray draws Peek Around Corner.
 252. Gray draws One Man's Junk.
 253. Gray draws Peek Around Corner.
 254. Gray discards Peek Around Corner from their hand.
 255. Gray pays with Peek Around Corner.
 256. Gray plays Riot Shield.
 257. Gray discards Peek Around Corner from their hand.
 258. Gray discards One Man's Junk from their hand.
 259. Gray pays with Peek Around Corner, One Man's Junk.
 260. Gray plays Pick The Lock.
 261. Red discards Shove from their hand.
 262. Red pays with Shove.
 263. Red plays Tag Team.
 264. Red draws Shove.
 265. Scramble 8 met — Clear, and Gray gets Good Stuff.
 266. Automated Defense Turret is Cleared.
 267. Gray takes Riot Shield into hand.
 268. Gray reveals Good Stuff: A Pair Of Stitch-Em-Ups, Crowbar, Coil Of Cable.
 269. Gray gets A Pair Of Stitch-Em-Ups.
 270. Gray takes A Pair Of Stitch-Em-Ups into hand.
 271. Cleanup.
 272. Red discards Tag Team from their play zone.
 273. Gray discards Pick The Lock from their play zone.
 274. — end of turn 9 —
 275. You are in: Automated Defense Turret.
 276. Red draws Charge In.
 277. Gray draws Duck Under.
 278. Gray draws Stim Pack.
 279. Gray draws Riot Shield.
 280. Gray plays Stim Pack.
 281. Gray draws Coil Of Cable.
 282. Gray plays Coil Of Cable.
 283. Gray discards Duck Under from their hand.
 284. Gray pays with Duck Under.
 285. Gray plays Riot Shield.
 286. Red discards Shove from their hand.
 287. Red pays with Shove.
 288. Red plays Duct Tape & Wire.
 289. Scramble 8 met — Clear, and Gray gets Good Stuff.
 290. Automated Defense Turret is Cleared.
 291. Gray takes Riot Shield into hand.
 292. Gray reveals Good Stuff: Crowbar, A Pair Of Stitch-Em-Ups, A Pair Of Stitch-Em-Ups.
 293. Gray gets Crowbar.
 294. Gray takes Crowbar into hand.
 295. Cleanup.
 296. Red discards Duct Tape & Wire from their play zone.
 297. Gray discards Stim Pack from their play zone.
 298. Gray discards Coil Of Cable from their play zone.
 299. — end of turn 10 —
 300. You are in: Automated Defense Turret.
 301. Red draws Overdrive.
 302. Red draws Riot Shield.
 303. Gray draws Overcharged Battery.
 304. Gray plays Crowbar.
 305. Red discards Overdrive from their hand.
 306. Red pays with Overdrive.
 307. Red plays Riot Shield.
 308. Gray discards Overcharged Battery from their hand.
 309. Gray pays with Overcharged Battery.
 310. Gray plays Riot Shield.
 311. Red discards Charge In from their hand.
 312. Red pays with Charge In.
 313. Red plays Overcharged Battery.
 314. Scramble 8 met — Clear, and Gray gets Good Stuff.
 315. Automated Defense Turret is Cleared.
 316. Red takes Riot Shield into hand.
 317. Gray takes Riot Shield into hand.
 318. Gray reveals Good Stuff: High-Frequency Scanner, Overcharged Battery, Crowbar.
 319. Gray gets Overcharged Battery.
 320. Gray takes Overcharged Battery into hand.
 321. Gray reveals Good Stuff: Coil Of Cable, Pry Bar, Cutting Torch.
 322. Gray gets Pry Bar.
 323. Gray takes Pry Bar into hand.
 324. Cleanup.
 325. Red discards Overcharged Battery from their play zone.
 326. Gray discards Crowbar from their play zone.
 327. — end of turn 11 —
 328. You are in: Pressurized Maintenance Hub.
 329. Red draws Shove.
 330. Red draws Grav Harness.
 331. Red draws Charge In.
 332. Gray plays Pry Bar.
 333. Gray discards A Pair Of Stitch-Em-Ups from their hand.
 334. Gray pays with A Pair Of Stitch-Em-Ups.
 335. Gray plays Overcharged Battery.
 336. Gray plays Riot Shield.
 337. Red discards Shove from their hand.
 338. Red discards Charge In from their hand.
 339. Red pays with Shove, Charge In.
 340. Red plays Grav Harness.
 341. Red's deck is empty — the discard pile shuffles in to make a new one (19 cards).
 342. Red draws Pry Bar.
 343. Oomph 7 met — Clear, and Red reveals a card reward.
 344. Scramble 7 met — Clear, and Gray reveals a card reward.
 345. Pressurized Maintenance Hub is Cleared.
 346. Gray takes Riot Shield into hand.
 347. Red's reward pool shows Rhythm & Bruise, Fast Follow, Reckless.
 348. Red takes Fast Follow into their discard pile.
 349. Gray's reward pool shows Catch Your Breath, In Step, Hit 'n Run.
 350. Gray takes In Step into their discard pile.
 351. Cleanup.
 352. Red discards Grav Harness from their play zone.
 353. Gray discards Pry Bar from their play zone.
 354. Gray discards Overcharged Battery from their play zone.
 355. — end of turn 12 —
 356. You are in: Automated Defense Turret.
 357. Red draws Charge In.
 358. Red draws Charge In.
 359. Gray draws Work The Angles.
 360. Gray draws Duck Under.
 361. Gray draws Pick The Lock.
 362. Gray discards Work The Angles from their hand.
 363. Gray pays with Work The Angles.
 364. Gray plays Riot Shield.
 365. Gray discards Duck Under from their hand.
 366. Gray pays with Duck Under.
 367. Gray plays Riot Shield.
 368. Red discards Charge In from their hand.
 369. Red pays with Charge In.
 370. Red plays Riot Shield.
 371. Scramble 8 met — Clear, and Gray gets Good Stuff.
 372. Automated Defense Turret is Cleared.
 373. Gray takes Riot Shield into hand.
 374. Gray takes Riot Shield into hand.
 375. Red takes Riot Shield into hand.
 376. Gray reveals Good Stuff: Salvaged Blueprint, Emergency Breaker, Duct Tape & Wire.
 377. Gray gets Duct Tape & Wire.
 378. Gray takes Duct Tape & Wire into hand.
 379. Cleanup.
 380. — end of turn 13 —
 381. You are in: Gears & Glitch.
 382. Red draws Momentum Shift.
 383. Gray draws One Man's Junk.
 384. Red plays Pry Bar.
 385. Red discards Charge In from their hand.
 386. Red discards Momentum Shift from their hand.
 387. Red pays with Charge In, Momentum Shift.
 388. Red plays Cutting Torch.
 389. Gray discards One Man's Junk from their hand.
 390. Gray pays with One Man's Junk.
 391. Gray plays Riot Shield.
 392. Gray discards Duct Tape & Wire from their hand.
 393. Gray discards Riot Shield from their hand.
 394. Gray pays with Duct Tape & Wire, Riot Shield.
 395. Gray plays Pick The Lock.
 396. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
 397. Gears & Glitch is Cleared.
 398. Gray takes Riot Shield into hand.
 399. Red's reward pool shows Brute Recycle, Junk Launcher, Heavy Pockets.
 400. Red takes Brute Recycle into their discard pile.
 401. Cleanup.
 402. Red discards Pry Bar from their play zone.
 403. Red discards Cutting Torch from their play zone.
 404. Gray discards Pick The Lock from their play zone.
 405. — end of turn 14 —
 406. Floor 4 is clear.
 407. Red shuffles 1 card(s) back in.
 408. Red takes Fast Follow into their discard pile.
 409. Gray shuffles 1 card(s) back in.
 410. Gray takes Distract & Pivot into their discard pile.
 411. Floor 5 is built: 6 rooms.
 412. You are in: Overgrown Hydroponics Bay.
 413. Red draws Charge In.
 414. Red draws Shove.
 415. Red draws Lean In.
 416. Red draws Charge In.
 417. Red draws Shove.
 418. Gray draws Riot Shield.
 419. Gray's deck is empty — the discard pile shuffles in to make a new one (28 cards).
 420. Gray draws Peek Around Corner.
 421. Gray draws In Step.
 422. Gray draws Covering Fire.
 423. Gray draws Riot Shield.
 424. Gray discards Peek Around Corner from their hand.
 425. Gray pays with Peek Around Corner.
 426. Gray plays Covering Fire.
 427. Red discards Shove from their hand.
 428. Red pays with Shove.
 429. Red plays Lean In.
 430. Gray draws Duct Tape & Wire.
 431. Red discards Charge In from their hand.
 432. Red pays with Charge In.
 433. Red plays Shove.
 434. Gray draws Pick The Lock.
 435. Gray discards Duct Tape & Wire from their hand.
 436. Gray pays with Duct Tape & Wire.
 437. Gray plays In Step.
 438. Gray discards Riot Shield from their hand.
 439. Gray discards Riot Shield from their hand.
 440. Gray pays with Riot Shield, Riot Shield.
 441. Gray plays Pick The Lock.
 442. Scramble 11 met — Clear, and both players get Good Stuff.
 443. Overgrown Hydroponics Bay is Cleared.
 444. Red reveals Good Stuff: Coil Of Cable, Pry Bar, Pry Bar.
 445. Gray reveals Good Stuff: Pocket Dynamo, Scrap Magnet, Duct Tape & Wire.
 446. NOTE — Hydroponics Scramble 11 reached on a Covering Fire / In Step chain: Red played two cheap cards only to feed Gray draws and In Step's count. The co-op cards are the first thing in the run that felt like teamwork rather than two piles of stats.
 447. Red gets Pry Bar.
 448. Red takes Pry Bar into hand.
 449. Gray gets Duct Tape & Wire.
 450. Gray takes Duct Tape & Wire into hand.
 451. Cleanup.
 452. Red discards Lean In from their play zone.
 453. Red discards Shove from their play zone.
 454. Gray discards Covering Fire from their play zone.
 455. Gray discards In Step from their play zone.
 456. Gray discards Pick The Lock from their play zone.
 457. — end of turn 15 —
 458. You are in: Gears & Glitch.
 459. Red draws Shove.
 460. Red draws Fast Follow.
 461. Red draws Second Wind.
 462. Gray draws Duck Under.
 463. Gray draws Peek Around Corner.
 464. Gray draws Here, Catch.
 465. Gray draws Coil Of Cable.
 466. Gray plays Coil Of Cable.
 467. Gray discards Peek Around Corner from their hand.
 468. Gray pays with Peek Around Corner.
 469. Gray plays Duct Tape & Wire.
 470. Gray discards Duck Under from their hand.
 471. Gray pays with Duck Under.
 472. Gray plays Here, Catch.
 473. Red plays Fast Follow.
 474. Red plays Pry Bar.
 475. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
 476. Gears & Glitch is Cleared.
 477. Gray's reward pool shows In Step, Hack the Doors, Hack the Doors.
 478. Gray takes In Step into their discard pile.
 479. Cleanup.
 480. Red discards Fast Follow from their play zone.
 481. Red discards Pry Bar from their play zone.
 482. Gray discards Coil Of Cable from their play zone.
 483. Gray discards Duct Tape & Wire from their play zone.
 484. Gray discards Here, Catch from their play zone.
 485. — end of turn 16 —
 486. Floor 5 is clear.
 487. Red shuffles 3 card(s) back in.
 488. Red takes Cross Punch into their discard pile.
 489. Gray takes Synergy Link into their discard pile.
 490. Floor 6 is built: 5 rooms.
 491. You are in: Automated Defense Turret.
 492. Red draws Riot Shield.
 493. Red draws Overdrive.
 494. Red draws Shove.
 495. Red draws Overcharged Battery.
 496. Red draws Shove.
 497. Gray draws Pick The Lock.
 498. Gray draws Pick The Lock.
 499. Gray draws Duck Under.
 500. Gray draws Pick The Lock.
 501. Gray draws Stim Pack.
 502. Gray plays Stim Pack.
 503. Gray draws Distract & Pivot.
 504. Red discards Overdrive from their hand.
 505. Red pays with Overdrive.
 506. Red plays Overcharged Battery.
 507. Red plays Riot Shield.
 508. Red discards Shove from their hand.
 509. Red pays with Shove.
 510. Red plays Shove.
 511. Gray discards Pick The Lock from their hand.
 512. Gray discards Duck Under from their hand.
 513. Gray pays with Pick The Lock, Duck Under.
 514. Gray plays Pick The Lock.
 515. Scramble 8 met — Clear, and Gray gets Good Stuff.
 516. Automated Defense Turret is Cleared.
 517. Red takes Riot Shield into hand.
 518. Gray reveals Good Stuff: Crowbar, Stim Pack, Coil Of Cable.
 519. Gray gets Coil Of Cable.
 520. Gray takes Coil Of Cable into hand.
 521. Cleanup.
 522. Red discards Overcharged Battery from their play zone.
 523. Red discards Shove from their play zone.
 524. Gray discards Stim Pack from their play zone.
 525. Gray discards Pick The Lock from their play zone.
 526. — end of turn 17 —
 527. You are in: Pressurized Maintenance Hub.
 528. Red draws Second Wind.
 529. Red draws Charge In.
 530. Red draws Tag Team.
 531. Red draws Duct Tape & Wire.
 532. Gray draws Stim Pack.
 533. Gray draws Duck Under.
 534. Gray plays Stim Pack.
 535. Gray draws Crowbar.
 536. Gray plays Coil Of Cable.
 537. Gray discards Duck Under from their hand.
 538. Gray discards Pick The Lock from their hand.
 539. Gray pays with Duck Under, Pick The Lock.
 540. Gray plays Distract & Pivot.
 541. Red discards Second Wind from their hand.
 542. Red pays with Second Wind.
 543. Red plays Charge In.
 544. Red discards Duct Tape & Wire from their hand.
 545. Red pays with Duct Tape & Wire.
 546. Red plays Tag Team.
 547. Red draws Charge In.
 548. Oomph 7 met — Clear, and Red reveals a card reward.
 549. Scramble 7 met — Clear, and Gray reveals a card reward.
 550. Pressurized Maintenance Hub is Cleared.
 551. Red's reward pool shows Break Through, Rhythm & Bruise, Bull Rush.
 552. Red takes Rhythm & Bruise into their discard pile.
 553. Gray's reward pool shows Distract & Pivot, Covering Fire, Quick Vault.
 554. Gray takes Covering Fire into their discard pile.
 555. Cleanup.
 556. Red discards Charge In from their play zone.
 557. Red discards Tag Team from their play zone.
 558. Gray discards Stim Pack from their play zone.
 559. Gray discards Coil Of Cable from their play zone.
 560. Gray discards Distract & Pivot from their play zone.
 561. — end of turn 18 —
 562. You are in: Overgrown Hydroponics Bay.
 563. Red draws Overdrive.
 564. Red's deck is empty — the discard pile shuffles in to make a new one (25 cards).
 565. Red draws Pry Bar.
 566. Red draws Charge In.
 567. Gray draws Pick The Lock.
 568. Gray draws One Man's Junk.
 569. Gray draws Overcharged Battery.
 570. Gray draws Duck Under.
 571. NOTE — Hydroponics again: Scramble 11 is out of reach (Gray 6 max, Red 3 via Riot Shield), so I take Scramble 6 and its Bad Stuff over a Flee.
 572. Red discards Overdrive from their hand.
 573. Red pays with Overdrive.
 574. Red plays Riot Shield.
 575. Gray discards Duck Under from their hand.
 576. Gray discards One Man's Junk from their hand.
 577. Gray pays with Duck Under, One Man's Junk.
 578. Gray plays Pick The Lock.
 579. Scramble 6 met — Clear, but both players get Bad Stuff.
 580. Overgrown Hydroponics Bay is Cleared.
 581. Red takes Riot Shield into hand.
 582. Red gets My Head Is Quantum Spinning.
 583. Red takes My Head Is Quantum Spinning into hand.
 584. Gray gets Rust.
 585. Gray takes Rust into hand.
 586. Cleanup.
 587. Gray discards Pick The Lock from their play zone.
 588. — end of turn 19 —
 589. You are in: Gears & Glitch.
 590. Gray draws Work The Angles.
 591. Gray draws Pry Bar.
 592. Gray discards Rust from their hand.
 593. Gray pays with Rust.
 594. Gray plays Work The Angles.
 595. Gray plays Pry Bar.
 596. Gray plays Crowbar.
 597. Red plays Pry Bar.
 598. Red discards My Head Is Quantum Spinning from their hand.
 599. Red discards Charge In from their hand.
 600. Red pays with My Head Is Quantum Spinning, Charge In.
 601. Red plays Charge In.
 602. Oomph 12 met — Ascend.
 603. Gears & Glitch is Cleared.
 604. Cleanup.
 605. Red discards Pry Bar from their play zone.
 606. Red discards Charge In from their play zone.
 607. Gray discards Work The Angles from their play zone.
 608. Gray discards Pry Bar from their play zone.
 609. Gray discards Crowbar from their play zone.
 610. — end of turn 20 —
 611. Floor 6 is clear.
 612. Red shuffles 1 card(s) back in.
 613. Red takes Set 'Em Up into their discard pile.
 614. Gray shuffles 1 card(s) back in.
 615. Gray takes I'll Take That into their discard pile.
 616. Floor 7 is built: 4 rooms.
 617. NOTE — Band 2 cleared in 13 turns (turns 8-20) with no Flee and zero Exhaust on either side. Entering Band 3 with Red deck ~29, Gray ~36, both exhaust 0. Much stronger than playtest 10 at the same point (Red exhaust 3, Gray 5).
 618. You are in: Smoldering Armory.
 619. Red draws Duct Tape & Wire.
 620. Red draws Grav Harness.
 621. Red draws Brute Recycle.
 622. Red draws Charge In.
 623. Red draws Tag Team.
 624. Gray draws A Pair Of Stitch-Em-Ups.
 625. Gray draws One Man's Junk.
 626. Gray draws Overcharged Battery.
 627. Gray draws Overcharged Battery.
 628. Gray's deck is empty — the discard pile shuffles in to make a new one (32 cards).
 629. Gray draws Duck Under.
 630. Gray discards A Pair Of Stitch-Em-Ups from their hand.
 631. Gray pays with A Pair Of Stitch-Em-Ups.
 632. Gray plays Overcharged Battery.
 633. Gray plays Overcharged Battery.
 634. Red plays Grav Harness.
 635. Red draws Cutting Torch.
 636. Red discards Duct Tape & Wire from their hand.
 637. Red pays with Duct Tape & Wire.
 638. Red plays Tag Team.
 639. Red draws Lean In.
 640. Red discards Charge In from their hand.
 641. Red discards Lean In from their hand.
 642. Red pays with Charge In, Lean In.
 643. Red plays Cutting Torch.
 644. Gray discards Duck Under from their hand.
 645. Gray pays with Duck Under.
 646. Gray plays One Man's Junk.
 647. Oomph 16 met — Clear; both players reveal a card reward, and both players get Good Stuff.
 648. Smoldering Armory is Cleared.
 649. Red's reward pool shows Reckless, Set 'Em Up, Second Wind.
 650. NOTE — Overcharged Battery played by Gray made Red's next card free (Grav Harness at cost 0). The card says 'The next card played this turn', not 'you play', so crossing players reads right. Smoldering Armory Oomph 16 cleared on the first Band 3 room: two Batteries chained into Grav Harness, Tag Team, Cutting Torch.
 651. Red takes Set 'Em Up into their discard pile.
 652. Gray's reward pool shows Catch Your Breath, Hit 'n Run, I'll Take That.
 653. Gray takes Hit 'n Run into their discard pile.
 654. Red reveals Good Stuff: Stim Pack, Crowbar, Cutting Torch.
 655. Gray reveals Good Stuff: Pry Bar, Emergency Power Core, Scrap Magnet.
 656. Red gets Cutting Torch.
 657. Red takes Cutting Torch into hand.
 658. Gray gets Emergency Power Core.
 659. Gray takes Emergency Power Core into hand.
 660. Cleanup.
 661. Red discards Grav Harness from their play zone.
 662. Red discards Tag Team from their play zone.
 663. Red discards Cutting Torch from their play zone.
 664. Gray discards Overcharged Battery from their play zone.
 665. Gray discards Overcharged Battery from their play zone.
 666. Gray discards One Man's Junk from their play zone.
 667. — end of turn 21 —
 668. You are in: The Iron Sentinel.
 669. Red draws Momentum Shift.
 670. Red draws Shove.
 671. Red draws Cross Punch.
 672. Gray draws Stim Pack.
 673. Gray draws Duck Under.
 674. Gray draws Duck Under.
 675. Gray draws Pick The Lock.
 676. Gray plays Stim Pack.
 677. Gray draws Work The Angles.
 678. Red discards Shove from their hand.
 679. Red pays with Shove.
 680. Red plays Momentum Shift.
 681. Red draws Rhythm & Bruise.
 682. Red draws Fast Follow.
 683. NOTE — Iron Sentinel on the 2nd room of floor 7. 10/10 is one Scramble short: Gray tops out at Scramble 7 (Emergency Power Core 3, Pick The Lock 4) and Red's only Scramble is Cross Punch's 2. Going for Oomph 18 instead: Gray plays out wide so Rhythm & Bruise counts 4 Gray cards. Exhaust 3 each beats a Flee's Exhaust 4 plus Bad Stuff.
 684. Red Exhausts Brute Recycle.
 685. Gray plays Emergency Power Core.
 686. Gray Exhausts Pick The Lock.
 687. Gray Exhausts Peek Around Corner.
 688. Gray discards Duck Under from their hand.
 689. Gray pays with Duck Under.
 690. Gray plays Duck Under.
 691. Gray discards Pick The Lock from their hand.
 692. Gray pays with Pick The Lock.
 693. Gray plays Work The Angles.
 694. Red plays Fast Follow.
 695. Red discards Cutting Torch from their hand.
 696. Red pays with Cutting Torch.
 697. Red plays Rhythm & Bruise.
 698. Red draws Shove.
 699. Oomph 18 met — Ascend, but both players Exhaust 3.
 700. The Iron Sentinel is Cleared.
 701. Red Exhausts Fast Follow.
 702. Red Exhausts Charge In.
 703. Red Exhausts Shove.
 704. Gray Exhausts Peek Around Corner.
 705. Gray Exhausts Rust.
 706. Gray Exhausts Duct Tape & Wire.
 707. Cleanup.
 708. Red discards Momentum Shift from their play zone.
 709. Red discards Fast Follow from their play zone.
 710. Red discards Rhythm & Bruise from their play zone.
 711. Gray discards Stim Pack from their play zone.
 712. Gray discards Emergency Power Core from their play zone.
 713. Gray discards Duck Under from their play zone.
 714. Gray discards Work The Angles from their play zone.
 715. — end of turn 22 —
 716. Floor 7 is clear.
 717. Red shuffles 2 card(s) back in.
 718. Red takes Cross Punch into their discard pile.
 719. Gray takes Hack the Doors into their discard pile.
 720. Floor 8 is built: 3 rooms.
 721. You are in: Bio-Hazard Containment Vault.
 722. Red draws Fast Follow.
 723. Red draws Riot Shield.
 724. Red draws Shove.
 725. Red draws Overdrive.
 726. Red draws Pry Bar.
 727. Gray draws Pry Bar.
 728. Gray draws Coil Of Cable.
 729. Gray draws In Step.
 730. Gray draws Riot Shield.
 731. Gray draws Pick The Lock.
 732. Gray plays Coil Of Cable.
 733. Red plays Fast Follow.
 734. Red plays Pry Bar.
 735. Red discards Shove from their hand.
 736. Red pays with Shove.
 737. Red plays Riot Shield.
 738. Gray discards Pry Bar from their hand.
 739. Gray pays with Pry Bar.
 740. Gray plays Riot Shield.
 741. Gray discards Pick The Lock from their hand.
 742. Gray pays with Pick The Lock.
 743. Gray plays In Step.
 744. Scramble 15 met — Clear, and one of you reveals a card reward.
 745. Bio-Hazard Containment Vault is Cleared.
 746. Red takes Riot Shield into hand.
 747. Gray takes Riot Shield into hand.
 748. Gray's reward pool shows Catch Your Breath, Hit 'n Run, Distract & Pivot.
 749. Gray takes Distract & Pivot into their discard pile.
 750. Cleanup.
 751. Red discards Fast Follow from their play zone.
 752. Red discards Pry Bar from their play zone.
 753. Gray discards Coil Of Cable from their play zone.
 754. Gray discards In Step from their play zone.
 755. — end of turn 23 —
 756. You are in: The Iron Sentinel.
 757. Red draws Charge In.
 758. Red draws Shove.
 759. Red draws Cross Punch.
 760. Gray draws Stim Pack.
 761. Gray draws Pick The Lock.
 762. Gray draws Covering Fire.
 763. Gray draws Pick The Lock.
 764. Gray discards Pick The Lock from their hand.
 765. Gray pays with Pick The Lock.
 766. Gray plays Covering Fire.
 767. Gray plays Stim Pack.
 768. Gray draws Covering Fire.
 769. Gray discards Riot Shield from their hand.
 770. Gray pays with Riot Shield.
 771. Gray plays Covering Fire.
 772. Red plays Overdrive.
 773. Red Exhausts Second Wind.
 774. Red Exhausts Overcharged Battery.
 775. Gray draws Duck Under.
 776. Gray draws Riot Shield.
 777. Red discards Shove from their hand.
 778. Red discards Charge In from their hand.
 779. Red pays with Shove, Charge In.
 780. Red plays Cross Punch.
 781. Red's deck is empty — the discard pile shuffles in to make a new one (24 cards).
 782. Red Exhausts Duct Tape & Wire.
 783. Gray draws In Step.
 784. Gray draws I'll Take That.
 785. NOTE — Iron Sentinel on floor 8, 2nd room. Double Covering Fire drew Gray 4 cards off Red's 2 plays, and Scramble 13 was in reach, but Oomph stops at 8: Red's five cards can make at most Oomph 6 as plays (two cost-2 cards and one payer too few) and none of Gray's 7 draws carried Oomph. Fleeing. The 10/10 line needs both hands to carry both stats; one hand of cost-2 cards can't.
 786. Gray discards Duck Under from their hand.
 787. Gray pays with Duck Under.
 788. Gray plays In Step.
 789. You Flee The Iron Sentinel.
 790. Red Exhausts Rhythm & Bruise.
 791. Red Exhausts Lean In.
 792. Red Exhausts Charge In.
 793. Red Exhausts Overdrive.
 794. Gray Exhausts One Man's Junk.
 795. Gray Exhausts Distract & Pivot.
 796. Gray Exhausts Synergy Link.
 797. Gray Exhausts Here, Catch.
 798. Red gets Spore Cloud.
 799. Red takes Spore Cloud into hand.
 800. Gray gets Spore Cloud.
 801. Gray takes Spore Cloud into hand.
 802. Cleanup.
 803. Gray discards I'll Take That from their hand.
 804. Red discards Overdrive from their play zone.
 805. Red discards Cross Punch from their play zone.
 806. Gray discards Covering Fire from their play zone.
 807. Gray discards Stim Pack from their play zone.
 808. Gray discards Covering Fire from their play zone.
 809. Gray discards In Step from their play zone.
 810. The Iron Sentinel shuffles back into the Floor deck.
 811. — end of turn 24 —
 812. You are in: Smoldering Armory.
 813. Red draws Momentum Shift.
 814. Red draws Cutting Torch.
 815. Red draws My Head Is Quantum Spinning.
 816. Gray draws Duct Tape & Wire.
 817. Gray draws Crowbar.
 818. Red discards Spore Cloud from their hand.
 819. Red discards My Head Is Quantum Spinning from their hand.
 820. Red pays with Spore Cloud, My Head Is Quantum Spinning.
 821. Red plays Cutting Torch.
 822. Gray plays Crowbar.
 823. Gray discards Spore Cloud from their hand.
 824. Gray pays with Spore Cloud.
 825. Gray plays Duct Tape & Wire.
 826. Red discards Riot Shield from their hand.
 827. Red pays with Riot Shield.
 828. Red plays Momentum Shift.
 829. Red draws Fast Follow.
 830. Red draws Set 'Em Up.
 831. Red Exhausts Set 'Em Up.
 832. Red plays Fast Follow.
 833. Oomph 10 met — Clear, and Red gets Good Stuff.
 834. Smoldering Armory is Cleared.
 835. Red reveals Good Stuff: Automated Salvage Kit, Scrap Magnet, Duct Tape & Wire.
 836. Red gets Duct Tape & Wire.
 837. Red takes Duct Tape & Wire into hand.
 838. Cleanup.
 839. Red discards Cutting Torch from their play zone.
 840. Red discards Momentum Shift from their play zone.
 841. Red discards Fast Follow from their play zone.
 842. Gray discards Crowbar from their play zone.
 843. Gray discards Duct Tape & Wire from their play zone.
 844. — end of turn 25 —
 845. You are in: The Iron Sentinel.
 846. Red draws Grav Harness.
 847. Red draws Charge In.
 848. Red draws Set 'Em Up.
 849. Red draws Shove.
 850. Gray draws Coil Of Cable.
 851. Gray's deck is empty — the discard pile shuffles in to make a new one (29 cards).
 852. Gray draws Stim Pack.
 853. Gray draws Duck Under.
 854. Gray plays Stim Pack.
 855. Gray draws Overcharged Battery.
 856. Gray discards Duck Under from their hand.
 857. Gray pays with Duck Under.
 858. Gray plays Overcharged Battery.
 859. Red plays Grav Harness.
 860. Red draws Cross Punch.
 861. Red discards Shove from their hand.
 862. Red pays with Shove.
 863. Red plays Set 'Em Up.
 864. Gray plays Coil Of Cable.
 865. Gray discards Pick The Lock from their hand.
 866. Gray pays with Pick The Lock.
 867. Gray plays Riot Shield.
 868. Red discards Cross Punch from their hand.
 869. Red pays with Cross Punch.
 870. Red plays Duct Tape & Wire.
 871. Oomph 10 and Scramble 10 met — Ascend, and both players reveal a card reward.
 872. The Iron Sentinel is Cleared.
 873. Gray takes Riot Shield into hand.
 874. Red's reward pool shows Junk Launcher, Brute Recycle, Rhythm & Bruise.
 875. NOTE — Iron Sentinel 10/10 cleared on the second try. Gray's Overcharged Battery made Red's Grav Harness free, Set 'Em Up fed +2 into Coil Of Cable. Both hands had to put up both stats; this time they could.
 876. Red takes Rhythm & Bruise into their discard pile.
 877. Gray's reward pool shows Quick Vault, Synergy Link, Here, Catch.
 878. Gray takes Quick Vault into their discard pile.
 879. Cleanup.
 880. Red discards Grav Harness from their play zone.
 881. Red discards Set 'Em Up from their play zone.
 882. Red discards Duct Tape & Wire from their play zone.
 883. Gray discards Stim Pack from their play zone.
 884. Gray discards Overcharged Battery from their play zone.
 885. Gray discards Coil Of Cable from their play zone.
 886. — end of turn 26 —
 887. Floor 8 is clear.
 888. Red shuffles 1 card(s) back in.
 889. Red takes Heavy Pockets into their discard pile.
 890. Gray shuffles 1 card(s) back in.
 891. Gray takes Quick Vault into their discard pile.
 892. Floor 9 is built: 2 rooms.
 893. You are in: Laser Grid Security Hall.
 894. Red draws Charge In.
 895. Red draws Cutting Torch.
 896. Red draws Pry Bar.
 897. Red draws Fast Follow.
 898. Red draws Shove.
 899. Gray draws Pick The Lock.
 900. Gray draws Coil Of Cable.
 901. Gray draws Covering Fire.
 902. Gray draws Duck Under.
 903. Gray draws Duct Tape & Wire.
 904. Gray plays Coil Of Cable.
 905. Gray discards Duck Under from their hand.
 906. Gray pays with Duck Under.
 907. Gray plays Covering Fire.
 908. Red plays Pry Bar.
 909. Gray draws Riot Shield.
 910. Red plays Fast Follow.
 911. Gray draws I'll Take That.
 912. Red discards Charge In from their hand.
 913. Red discards Shove from their hand.
 914. Red pays with Charge In, Shove.
 915. Red plays Cutting Torch.
 916. Gray draws Overcharged Battery.
 917. NOTE — Laser Grid, floor 9 first room: best Scramble is 13 against 14 (Battery into a free Pick The Lock, Riot Shield paid with I'll Take That), Red's hand already spent on Oomph 11 to feed Covering Fire. Oomph 18 is further off. One short, Flee. Keeping Gray's hand for the stairwell.
 918. You Flee Laser Grid Security Hall.
 919. Red Exhausts Tag Team.
 920. Red Exhausts Charge In.
 921. Red Exhausts Shove.
 922. Red Exhausts Charge In.
 923. Gray Exhausts Stim Pack.
 924. Gray Exhausts Riot Shield.
 925. Gray Exhausts Pick The Lock.
 926. Gray Exhausts One Man's Junk.
 927. Cleanup.
 928. Red discards Pry Bar from their play zone.
 929. Red discards Fast Follow from their play zone.
 930. Red discards Cutting Torch from their play zone.
 931. Gray discards Coil Of Cable from their play zone.
 932. Gray discards Covering Fire from their play zone.
 933. Laser Grid Security Hall shuffles back into the Floor deck.
 934. — end of turn 27 —
 935. You are in: The Iron Sentinel.
 936. Red draws Pry Bar.
 937. Red's deck is empty — the discard pile shuffles in to make a new one (20 cards).
 938. Red draws Cutting Torch.
 939. Red draws Spore Cloud.
 940. Red draws Grav Harness.
 941. Red draws Fast Follow.
 942. Gray discards Duct Tape & Wire from their hand.
 943. Gray pays with Duct Tape & Wire.
 944. Gray plays Overcharged Battery.
 945. Gray plays Pick The Lock.
 946. Red plays Pry Bar.
 947. Red plays Fast Follow.
 948. Red discards Spore Cloud from their hand.
 949. Red discards Cutting Torch from their hand.
 950. Red pays with Spore Cloud, Cutting Torch.
 951. Red plays Grav Harness.
 952. Gray draws Duck Under.
 953. Gray discards I'll Take That from their hand.
 954. Gray pays with I'll Take That.
 955. Gray plays Riot Shield.
 956. Oomph 10 and Scramble 10 met — Ascend, and both players reveal a card reward.
 957. The Iron Sentinel is Cleared.
 958. Gray takes Riot Shield into hand.
 959. Red's reward pool shows Reckless Swing, Tag Team, Reckless Swing.
 960. NOTE — Iron Sentinel on floor 9 at exactly 11/11, found only by ordering: Battery's free play spent on Gray's own Pick The Lock, Red's Pry Bar and Fast Follow before Grav Harness, and Riot Shield paid with I'll Take That so its forced Stuff shuffle never fires. Sequencing mattered more than any draw this turn.
 961. Red takes Tag Team into their discard pile.
 962. Gray's reward pool shows Hack the Doors, Catch Your Breath, Hit 'n Run.
 963. Gray takes Hit 'n Run into their discard pile.
 964. Cleanup.
 965. Red discards Pry Bar from their play zone.
 966. Red discards Fast Follow from their play zone.
 967. Red discards Grav Harness from their play zone.
 968. Gray discards Overcharged Battery from their play zone.
 969. Gray discards Pick The Lock from their play zone.
 970. — end of turn 28 —
 971. Floor 9 is clear.
 972. Red takes Bull Rush into their discard pile.
 973. Gray shuffles 2 card(s) back in.
 974. Gray takes Here, Catch into their discard pile.
 975. Floor 10 is built: 1 rooms.
 976. You are in: The Monolith Core.
 977. Red draws Cross Punch.
 978. Red draws Fast Follow.
 979. Red draws Duct Tape & Wire.
 980. Red draws Rhythm & Bruise.
 981. Red draws Overdrive.
 982. Gray draws In Step.
 983. Gray draws Distract & Pivot.
 984. Gray draws Duck Under.
 985. Gray draws Covering Fire.
 986. Gray draws Crowbar.
 987. Gray plays Crowbar.
 988. Gray discards Duck Under from their hand.
 989. Gray pays with Duck Under.
 990. Gray plays Covering Fire.
 991. Red plays Fast Follow.
 992. Gray draws Hack the Doors.
 993. Red discards Overdrive from their hand.
 994. Red pays with Overdrive.
 995. Red plays Rhythm & Bruise.
 996. Red draws Charge In.
 997. Gray draws Hit 'n Run.
 998. Red discards Charge In from their hand.
 999. Red pays with Charge In.
1000. Red plays Duct Tape & Wire.
1001. Gray draws Spore Cloud.
1002. Gray discards Hack the Doors from their hand.
1003. Gray pays with Hack the Doors.
1004. Gray plays In Step.
1005. NOTE — Rhythm & Bruise went from Oomph 6 to 8 when Gray played In Step after it: it counts Gray's cards live, not at the moment it was played. Its text opens with 'Play:', which reads as a one-time effect when played. Playtest 10 saw Junk Launcher fixed at play. Two conditional-stat cards, two timings?
1006. Oomph 10 and Scramble 10 met — You Win!
1007. The Monolith Core is Cleared.
1008. Cleanup.
1009. Red discards Fast Follow from their play zone.
1010. Red discards Rhythm & Bruise from their play zone.
1011. Red discards Duct Tape & Wire from their play zone.
1012. Gray discards Crowbar from their play zone.
1013. Gray discards Covering Fire from their play zone.
1014. Gray discards In Step from their play zone.
1015. — end of turn 29 —
1016. Floor 10 is clear.
1017. You reach the rooftop. You win.

Floor 10 · turn 29 · GameOver   floor deck 0, cleared 27   Good Stuff 30, Bad Stuff 14
Red: deck 10, discard 12, exhaust 16, hand 1
    Cross Punch [cost 2; Oomph 4, Scramble 2] — Exhaust 1.
Gray: deck 8, discard 21, exhaust 13, hand 3
    Distract & Pivot [cost 2; Oomph 2, Scramble 3] — The next card Red plays this turn costs 1 fewer card to play.
    Hit 'n Run [cost 1; Oomph 1, Scramble 2] — Shuffle a Gray card from your Exhaust pile into your deck.
    Spore Cloud [cost 3; Bad Stuff] — Holding: At Cleanup, discard cards other than this one until you hold 3.
Outcome: Victory

seed 10, 238 command(s) replayed, floor 10, turn 29, Victory.
```
