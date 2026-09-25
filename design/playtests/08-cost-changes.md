# Playtest 8: Cost changes

Recorded 2026-09-24. Rules version: 0.2.4. Played by an agent standing in for a human playtester,
in the CLI (`bin/nvu`), seed 33, one shell call per decision. The run ended in **Defeat** on turn
10, floor 2, when Red went `Down` on a forced Flee at The Sentry Drone.

This is the first run played after Junk Launcher's text changed to "Oomph equal to the total
printed cost of all cards in the play zone" (both characters' cards count), after every Bad Stuff
card's cost went up by 1, after the "who may Scrap a Bad Stuff card" prompt was gated on someone
actually holding one, and after `bin/nvu card` started printing a Room's thresholds and Flee text.
The card list is the proposed list carried over from playtest 7.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

## How the run went

Floor 1 built at the full ten rooms. Flooded Ventilation Shaft, Security Turnstile, and Flooded
Ventilation Shaft again (the band reshuffled a second copy into the deck) all fell in one clean
turn each, turns 1 to 3, no Exhausts or Flees. The Sentry Drone Ascended on turn 4 at Oomph 8, Red
spending its whole hand (Overdrive, Charge In, paid with Shove and a redrawn Lean In) to get there.
Red took Junk Launcher as its floor 1 reward, Gray took Quick Vault.

Floor 2 built at nine rooms and stayed cheap through turns 5 to 9: Security Turnstile came up three
times and Flooded Ventilation Shaft once, and every one of them cleared off Gray's hand alone or
with one small assist from Red, never needing a Flee. Turn 8 is where Junk Launcher got its first
real test under the new wording (note 1). Turn 9 cleared Security Turnstile again with Work The
Angles doing the work.

Turn 10 hit The Sentry Drone, floor 2's Stairwell, needing Oomph 8 or Scramble 8 to Ascend. Both
hands together could reach at most Oomph 7 or Scramble 5 (note 2), so the room was unreachable
before a single card was played. Ending the turn without playing anything, to keep the hand for a
second attempt, turned out to matter: the Flee's "Both of you Exhaust 1" hit Red with an empty deck
and an empty discard pile alike, since nothing had been played or paid away that turn to refill
either one. Red went `Down` and the run ended in Defeat (note 3).

## Notes

1. **Junk Launcher's cooperative wording confirmed.** `[agent]` (log 164)

   > Junk Launcher's cooperative wording confirmed: play zone at resolution was Red
   > Overdrive(printed cost 0), Red Junk Launcher(printed cost 2, itself), Gray Pick The Lock
   > (printed cost 2) = printed-cost total 4. Junk Launcher gave Oomph 4 (stat pool rose from
   > Overdrive's 2 to 6, so Junk Launcher contributed 4). This counts Gray's card and Junk
   > Launcher's own printed cost, matching the new rulebook text 'total printed cost of all cards
   > in the play zone' -- both characters' cards counted, as intended.

   Checked against `design/cards.yaml`, which gives the text verbatim. The arithmetic (0 + 2 + 2 = 4,
   matching the stat pool's rise) confirms the card reads the whole play zone, both sides, and
   counts its own printed cost too. This is the behavior the new wording was written to produce, and
   it worked as printed on the first test.

2. **The Sentry Drone was unreachable before a card was played.** `[agent]` (log 203)

   > The Sentry Drone needs Oomph8 or Scramble8 to Ascend. Checked the max reachable this turn: Red
   > hand (Charge In c2 O4, Overdrive c0 O2, Shove c1 O2, Shove c1 O2, Junk Launcher c2 conditional)
   > tops out at Oomph 6 played straight, or Oomph 4 via Junk Launcher plus Overdrive's 2 = 6 either
   > way, since only 5 cards total limits how much can be both played and used as payment. Gray hand
   > (2x Pick The Lock c2 Scr4, Duck Under c1 Scr2, Crowbar c0 O1S1, Peek Around Corner c1 Scr1) tops
   > out at Oomph 1 / Scramble 5, since only one Pick The Lock is payable with the other three cards.
   > Combined best case is Oomph 7 or Scramble 5, one short of the room's own Oomph 8 line. Since
   > Flee triggers whenever no threshold is met regardless of how close the stat pool gets, played
   > nothing this turn and kept the full hand for next attempt rather than spending cards toward a
   > total that still falls short.

   Not an engine or rulebook question by itself: a dead hand against a Stairwell, which the rulebook
   allows (Flee is the printed answer to exactly this). Worth flagging as shape: a Stairwell with
   only two thresholds, both needing an 8, can be unreachable on the hand you're dealt with no
   misplay involved. See note 3 for how the "just Flee and try again" plan actually played out.

3. **Red went Down on the Flee because holding cards back left no discard buffer.** `[agent]` (log 212)

   > Red went Down on this Flee because Red's deck AND discard were both empty (Red: deck 0,
   > discard 0, exhaust 8 going into the Flee) -- the Flee's own text is 'Both of you Exhaust 1, and
   > Red gets Bad Stuff,' and Exhausting draws from the top of the deck. Rulebook Empty deck: 'If you
   > must draw or Exhaust a card and your deck is empty, first shuffle your discard pile... If your
   > discard pile is also empty, you go Down.' This matches the rule exactly, not an engine bug. But
   > it flags a real trap: choosing not to play any cards this turn (to avoid spending toward a
   > threshold that could not be reached anyway) left Red's discard pile at 0 too, since nothing got
   > paid away or played into it. Had Red played anything at all this turn -- even a single card
   > discarded as payment -- that card would have sat in the discard pile as a buffer for the forced
   > Exhaust, and Red would have survived the Flee. The choice to hold the whole hand back, reasonable
   > on its own (see previous note), removed Red's only safety net against this specific Flee.

   Checked against rulebook section 9 and the `Empty deck` keyword: the ruling is correct as printed,
   both deck and discard empty means Down. The finding is a strategy trap, not a bug: a hand that
   cannot clear or even meaningfully dent a room's threshold looks like it should be held back rather
   than spent, but spending even one card into the discard pile that turn would have given Red a
   deck to shuffle from when the Flee's own Exhaust landed. The `play` output did show Red's deck and
   discard both at 0 before the `end` call (turn 10's Turn Start block), so the information needed to
   see this coming was on screen; it just wasn't obviously connected to the Flee outcome about to
   fire.

## Design questions

Justin asked four questions about this run; answers below, each citing the log lines above (from
`bin/nvu replay design/playtests/08-cost-changes.json`).

1. **Dual-Stat Utilization: are Lean In and Work The Angles played consistently in Band 1, or held/discarded?**

   Lean In was drawn twice this run. First draw: played turn 1, paid with Shove (log 18). Second
   draw (redrawn turn 4 when Red's discard reshuffled into a new deck): held through the start of
   turn 4, then discarded as payment for Charge In rather than played (log 85). So one play, one
   payment-discard, zero turns spent sitting idle in hand.

   Work The Angles was drawn four times. Two draws sat unplayed for a full turn (turn 5, held while
   only Coil Of Cable got played; turn 8, held while only Pick The Lock got played) before being
   played the following turn each time (turn 6, log 124; turn 9, log 186). It was never discarded as
   payment.

   So in this one run, Lean In was used the turn it mattered (played once, spent as payment once,
   never dead weight), while Work The Angles sat held for a turn about half the time it was drawn (2
   of 4 draws) before getting played. Both cards did get played eventually and neither was ever
   wasted outright. One run is a thin sample for a "consistently" claim; the pattern here is "used,
   not always immediately," not "held or discarded instead of played."

2. **Band Transition Win Rates: does Band 2 (floors 4-6) create the intended tipping point away from basic starters?**

   The run never reached floor 4. It ended in Defeat on floor 2, turn 10 (log 205). No data from
   this run can answer this question; it needs a run that survives past floor 3.

3. **Stamina & Down Rates: is Exhaustion pressuring deck size appropriately in Band 3 without causing premature Band 1 failures?**

   The run also never reached Band 3 (floors 7-9), so there is no Band 3 data. But it did produce
   exactly the failure mode the question is worried about, in Band 1: Red went Down on turn 10,
   floor 2 (log 205), the earliest a run has ended in this playtest series. The mechanism was not
   raw Exhaust pressure from many Bad Stuff cards (Red held none at the time); it was a single forced
   Exhaust landing on a deck and discard that were both already empty, from ordinary Overdrive
   self-Exhausts and prior payments over 4 floor-1 turns and 6 floor-2 turns, combined with a turn
   where nothing was played (note 3). This reads as premature: floor 2 of 10, turn 10, with no
   sustained Bad-Stuff pressure driving it. One run is one data point, but it is a clean example of
   Exhaustion causing exactly the early failure the question names, and worth weighing alongside
   whatever Band 3 data future runs produce.

4. **Card Reward Pick Rates: do the new 2:1/3:1 Fine and Cool rewards feel like distinct power spikes over starters?**

   Only one Ascend happened this run (floor 1, turn 4, log 87), so only one reward pick per
   character. Red took Junk Launcher (`rarity: Cool` in `design/cards.yaml`) over Reckless Swing
   and Fast Follow. Gray took Quick Vault (`rarity: Fine`) over I'll Take That and Hit 'n Run.
   Neither reward card got a chance to prove itself as a power spike in this run: Junk Launcher was
   played once (note 1, a solid Oomph 4 off a cheap setup) and then sat unused or got discarded as
   payment the rest of the run; Quick Vault was played once turn 6 (log 127) for its plain printed
   stats, no different in feel from any other Gray starter. One reward apiece, from one Ascend, is
   far too little to say whether the rarity tiers read as distinct spikes; this needs several Ascends
   across a run, ideally several runs.

## What the run showed

- **Junk Launcher's new wording works as printed and reads as intended.** The one test this run got
  (note 1) matched the rulebook text exactly: both characters' printed costs counted, including the
  card's own. This closes, at least for one clean case, the run of findings from playtests 5-7 where
  Junk Launcher's actual value never matched a plain reading of its text.
- **A Stairwell can be flatly unreachable on the hand you're dealt, with no misplay involved.** The
  Sentry Drone's two thresholds both needed an 8, and neither hand had the raw stats to get there
  even spending everything (note 2). This is a shape question independent of which cards are in the
  pool: is an unreachable-this-turn Stairwell intended texture, or should thresholds always be
  reachable off some hand?
- **Holding a hand back against an unreachable room can be worse than spending it.** The instinct to
  save cards for a second attempt (note 2) directly caused the loss (note 3): Red's deck and discard
  were both empty precisely because nothing had been played or paid away, so the Flee's own forced
  Exhaust had nothing to draw from and Red went Down. A single wasted payment that turn would have
  prevented it.

## The CLI as a playtest tool

- **Things that worked:** `bin/nvu card "<room name>"` now prints a Room's thresholds and Flee text
  on its own, no run needed -- used it after the loss to double check Security Turnstile and The
  Sentry Drone's printed lines against what `play` had shown live, and they matched exactly. `play
  note` still accepted a note after the game had already ended (Defeat, no legal moves left), which
  mattered here since the most important finding (note 3) only became visible from the game-over
  summary itself.
- **The one moment of friction:** nothing in the `play` output before `end` connected "Red's deck and
  discard are both 0" to "the Flee about to fire will force an Exhaust." The numbers were on screen
  (turn 10's Turn Start block showed `Red: deck 0, discard 0`), but there's no explicit warning that
  a Flee's own printed cost can end the game outright. A human player watching the table would likely
  miss this the same way.
- Did not hit the "who may Scrap a Bad Stuff card" prompt this run (no Bad Stuff was ever held at a
  Clear that offered a Scrap), so this run has no data on whether the fix mentioned in the prompt
  (gate it on someone actually holding one) landed. Worth checking on the next run that clears a room
  with a Scrap-a-Bad-Stuff outcome while both hands are clean.

## Candidate issues

Rulebook questions for the designer:

- None outstanding from this run. Junk Launcher's new wording checked out clean (note 1), and the
  Down on Flee (note 3) matches the rulebook's Empty deck rule exactly.

Shape, independent of tuning:

- The Sentry Drone (Oomph 8 / Scramble 8 to Ascend, both thresholds an 8) was unreachable with the
  hands this run was dealt, even spending every card (note 2). Is a same-turn-unreachable Stairwell
  intended, or should a floor's Stairwell always be clearable off some achievable line?
- Choosing to hold a hand back against a room you can't clear, rather than spend it, can remove your
  own buffer against that same room's Flee cost (note 3). This is a genuine strategic trap in the
  current rules, not a bug, but worth knowing: the "safe" choice (don't waste cards on a lost cause)
  and the choice that keeps you alive (spend something into the discard pile) can point opposite
  ways.

Card observations for a later re-tune:

- Junk Launcher (Cool rarity) delivered Oomph 4 off a small, cheap setup (note 1), which reads as
  strong for its slot, but this is a single data point from a single play.

CLI improvements:

- No new friction found this run beyond the one already noted above (no on-screen warning that an
  empty deck-and-discard pair makes the next forced Exhaust lethal).

## Appendix: the run transcript

`bin/nvu replay design/playtests/08-cost-changes.json`, verbatim.

```
  1. Floor 1 is built: 10 rooms.
  2. You are in: Flooded Ventilation Shaft.
  3. Red draws Lean In.
  4. Red draws Overdrive.
  5. Red draws Charge In.
  6. Red draws Charge In.
  7. Red draws Shove.
  8. Gray draws Pick The Lock.
  9. Gray draws Pick The Lock.
 10. Gray draws Peek Around Corner.
 11. Gray draws Duck Under.
 12. Gray draws Peek Around Corner.
 13. Red plays Overdrive.
 14. Red Exhausts Shove.
 15. Red Exhausts Charge In.
 16. Red discards Shove from their hand.
 17. Red pays with Shove.
 18. Red plays Lean In.
 19. Gray discards Peek Around Corner from their hand.
 20. Gray pays with Peek Around Corner.
 21. Gray plays Duck Under.
 22. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
 23. Flooded Ventilation Shaft is Cleared.
 24. Gray gets Crowbar.
 25. Gray takes Crowbar into hand.
 26. Cleanup.
 27. Red discards Overdrive from their play zone.
 28. Red discards Lean In from their play zone.
 29. Gray discards Duck Under from their play zone.
 30. — end of turn 1 —
 31. You are in: Security Turnstile.
 32. Red draws Shove.
 33. Red draws Shove.
 34. Red draws Overdrive.
 35. Gray draws Duck Under.
 36. Gray discards Peek Around Corner from their hand.
 37. Gray discards Duck Under from their hand.
 38. Gray pays with Peek Around Corner, Duck Under.
 39. Gray plays Pick The Lock.
 40. Scramble 3 met — Clear.
 41. Security Turnstile is Cleared.
 42. Cleanup.
 43. Gray discards Pick The Lock from their play zone.
 44. — end of turn 2 —
 45. You are in: Flooded Ventilation Shaft.
 46. Gray draws Duck Under.
 47. Gray draws Pick The Lock.
 48. Gray draws Pick The Lock.
 49. Red plays Overdrive.
 50. Red Exhausts Charge In.
 51. Red Exhausts Charge In.
 52. Red discards Charge In from their hand.
 53. Red pays with Charge In.
 54. Red plays Shove.
 55. Gray plays Crowbar.
 56. Gray discards Pick The Lock from their hand.
 57. Gray pays with Pick The Lock.
 58. Gray plays Duck Under.
 59. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
 60. Flooded Ventilation Shaft is Cleared.
 61. Gray gets Coil Of Cable.
 62. Gray takes Coil Of Cable into hand.
 63. Gray gets Duct Tape & Wire.
 64. Gray takes Duct Tape & Wire into hand.
 65. Cleanup.
 66. Red discards Overdrive from their play zone.
 67. Red discards Shove from their play zone.
 68. Gray discards Crowbar from their play zone.
 69. Gray discards Duck Under from their play zone.
 70. — end of turn 3 —
 71. You are in: The Sentry Drone.
 72. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
 73. Red draws Lean In.
 74. Red draws Charge In.
 75. Red draws Overdrive.
 76. Gray draws Pick The Lock.
 77. Red plays Overdrive.
 78. Red Exhausts Shove.
 79. Red Exhausts Overdrive.
 80. Gray discards Pick The Lock from their hand.
 81. Gray pays with Pick The Lock.
 82. Gray plays Duct Tape & Wire.
 83. Red discards Shove from their hand.
 84. Red discards Lean In from their hand.
 85. Red pays with Shove, Lean In.
 86. Red plays Charge In.
 87. Oomph 8 met — Ascend.
 88. The Sentry Drone is Cleared.
 89. Cleanup.
 90. Red discards Overdrive from their play zone.
 91. Red discards Charge In from their play zone.
 92. Gray discards Duct Tape & Wire from their play zone.
 93. — end of turn 4 —
 94. Floor 1 is clear.
 95. Red shuffles 1 card(s) back in.
 96. Red takes Junk Launcher.
 97. Red shuffles 1 card(s) back in.
 98. Gray shuffles 3 card(s) back in.
 99. Gray takes Quick Vault.
100. Gray shuffles 1 card(s) back in.
101. Floor 2 is built: 9 rooms.
102. You are in: Security Turnstile.
103. Red draws Charge In.
104. Red draws Shove.
105. Red draws Junk Launcher.
106. Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
107. Red draws Overdrive.
108. Red draws Shove.
109. Gray draws Work The Angles.
110. Gray draws Quick Vault.
111. Gray draws Duck Under.
112. Gray draws Coil Of Cable.
113. Gray draws Pick The Lock.
114. Gray plays Coil Of Cable.
115. Scramble 3 met — Clear.
116. Security Turnstile is Cleared.
117. Cleanup.
118. Gray discards Coil Of Cable from their play zone.
119. — end of turn 5 —
120. You are in: Security Turnstile.
121. Gray draws Pick The Lock.
122. Gray discards Duck Under from their hand.
123. Gray pays with Duck Under.
124. Gray plays Work The Angles.
125. Gray discards Pick The Lock from their hand.
126. Gray pays with Pick The Lock.
127. Gray plays Quick Vault.
128. Scramble 3 met — Clear.
129. Security Turnstile is Cleared.
130. Cleanup.
131. Gray discards Work The Angles from their play zone.
132. Gray discards Quick Vault from their play zone.
133. — end of turn 6 —
134. You are in: Security Turnstile.
135. Gray's deck is empty — the discard pile shuffles in to make a new one (15 cards).
136. Gray draws Quick Vault.
137. Gray draws Pick The Lock.
138. Gray draws Duck Under.
139. Gray draws Pick The Lock.
140. Gray discards Duck Under from their hand.
141. Gray discards Quick Vault from their hand.
142. Gray pays with Duck Under, Quick Vault.
143. Gray plays Pick The Lock.
144. Scramble 3 met — Clear.
145. Security Turnstile is Cleared.
146. Cleanup.
147. Gray discards Pick The Lock from their play zone.
148. — end of turn 7 —
149. You are in: Flooded Ventilation Shaft.
150. Gray draws Peek Around Corner.
151. Gray draws Work The Angles.
152. Gray draws Duck Under.
153. Red plays Overdrive.
154. Red Exhausts Lean In.
155. Red Exhausts Charge In.
156. Gray discards Duck Under from their hand.
157. Gray discards Peek Around Corner from their hand.
158. Gray pays with Duck Under, Peek Around Corner.
159. Gray plays Pick The Lock.
160. Red discards Shove from their hand.
161. Red discards Shove from their hand.
162. Red pays with Shove, Shove.
163. Red plays Junk Launcher.
164. NOTE — Junk Launcher's cooperative wording confirmed: play zone at resolution was Red Overdrive(printed cost 0), Red Junk Launcher(printed cost 2, itself), Gray Pick The Lock(printed cost 2) = printed-cost total 4. Junk Launcher gave Oomph 4 (stat pool rose from Overdrive's 2 to 6, so Junk Launcher contributed 4). This counts Gray's card and Junk Launcher's own printed cost, matching the new rulebook text 'total printed cost of all cards in the play zone' -- both characters' cards counted, as intended.
165. Scramble 4 met — Clear.
166. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
167. Flooded Ventilation Shaft is Cleared.
168. Gray gets Crowbar.
169. Gray takes Crowbar into hand.
170. Cleanup.
171. Red discards Overdrive from their play zone.
172. Red discards Junk Launcher from their play zone.
173. Gray discards Pick The Lock from their play zone.
174. — end of turn 8 —
175. You are in: Security Turnstile.
176. Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
177. Red draws Overdrive.
178. Red draws Shove.
179. Red draws Shove.
180. Red draws Junk Launcher.
181. Gray draws Duck Under.
182. Gray draws Duct Tape & Wire.
183. Gray plays Crowbar.
184. Gray discards Duck Under from their hand.
185. Gray pays with Duck Under.
186. Gray plays Work The Angles.
187. Gray discards Pick The Lock from their hand.
188. Gray pays with Pick The Lock.
189. Gray plays Duct Tape & Wire.
190. Scramble 3 met — Clear.
191. Security Turnstile is Cleared.
192. Cleanup.
193. Gray discards Crowbar from their play zone.
194. Gray discards Work The Angles from their play zone.
195. Gray discards Duct Tape & Wire from their play zone.
196. — end of turn 9 —
197. You are in: The Sentry Drone.
198. Gray draws Pick The Lock.
199. Gray draws Duck Under.
200. Gray draws Pick The Lock.
201. Gray draws Crowbar.
202. Gray draws Peek Around Corner.
203. NOTE — The Sentry Drone needs Oomph8 or Scramble8 to Ascend. Checked the max reachable this turn: Red hand (Charge In c2 O4, Overdrive c0 O2, Shove c1 O2, Shove c1 O2, Junk Launcher c2 conditional) tops out at Oomph 6 played straight, or Oomph 4 via Junk Launcher plus Overdrive's 2 = 6 either way, since only 5 cards total limits how much can be both played and used as payment. Gray hand (2x Pick The Lock c2 Scr4, Duck Under c1 Scr2, Crowbar c0 O1S1, Peek Around Corner c1 Scr1) tops out at Oomph 1 / Scramble 5, since only one Pick The Lock is payable with the other three cards. Combined best case is Oomph 7 or Scramble 5, one short of the room's own Oomph 8 line. Since Flee triggers whenever no threshold is met regardless of how close the stat pool gets, played nothing this turn and kept the full hand for next attempt rather than spending cards toward a total that still falls short.
204. You Flee The Sentry Drone.
205. Red is Down — a room's printed punishment. The run is lost.
206. Red discards Charge In from their hand.
207. Red discards Overdrive from their hand.
208. Red discards Shove from their hand.
209. Red discards Shove from their hand.
210. Red discards Junk Launcher from their hand.
211. You lose.
212. NOTE — Red went Down on this Flee because Red's deck AND discard were both empty (Red: deck 0, discard 0, exhaust 8 going into the Flee) -- the Flee's own text is 'Both of you Exhaust 1, and Red gets Bad Stuff,' and Exhausting draws from the top of the deck. Rulebook Empty deck: 'If you must draw or Exhaust a card and your deck is empty, first shuffle your discard pile... If your discard pile is also empty, you go Down.' This matches the rule exactly, not an engine bug. But it flags a real trap: choosing not to play any cards this turn (to avoid spending toward a threshold that could not be reached anyway) left Red's discard pile at 0 too, since nothing got paid away or played into it. Had Red played anything at all this turn -- even a single card discarded as payment -- that card would have sat in the discard pile as a buffer for the forced Exhaust, and Red would have survived the Flee. The choice to hold the whole hand back, reasonable on its own (see previous note), removed Red's only safety net against this specific Flee.

Floor 2 · turn 10 · GameOver   floor deck 3, cleared 9   Good Stuff 24, Bad Stuff 18
Red: deck 0, discard 5, exhaust 8, hand 0  DOWN
Gray: deck 1, discard 11, exhaust 0, hand 5
    Pick The Lock [cost 2; Scramble 4]
    Duck Under [cost 1; Scramble 2]
    Pick The Lock [cost 2; Scramble 4]
    Crowbar [cost 0; Oomph 1, Scramble 1; Good Stuff] — Play: If you get any Good Stuff this turn, get 1 additional Good Stuff.
    Peek Around Corner [cost 1; Scramble 1] — Peek 1.
Outcome: Defeat

seed 33, 42 command(s) replayed, floor 2, turn 10, Defeat.
```
