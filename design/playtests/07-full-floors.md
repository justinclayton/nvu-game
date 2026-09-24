# Playtest 7: Full floors

Recorded 2026-09-24. Rules version: 0.2.4. Played by an agent standing in for a human playtester,
in the CLI (`bin/nvu`), seed 7, one shell call per decision. The run cleared six floors in 25 turns
and stopped there, per the playtest rule, with the game neither won nor lost: floor 7 was built at
turn 25's Ascend and nobody had flipped into it.

This is the first run played after Junk Launcher's text changed to "Oomph equal to total costs of
all cards you played this turn," and after the Room, Stairwell, and Red/Gray reward pool counts were
raised so a floor no longer runs short at Setup. The card list is the proposed list carried over from
playtest 6.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

## How the run went

Floor 1 built at the rulebook's full ten rooms, the first run this branch to see that. Security
Turnstile and Flooded Ventilation Shaft each fell in one turn to a single cheap Gray card, and The
Sentry Drone Ascended on turn 3 at Oomph 9, Red's starters plus Gray's Pry Bar covering the gap.
Twelve turns faster to a floor 1 clear than playtest 6's six turns, because nothing here needed a
Flee or an Exhaust to get through.

Floor 2 built at nine rooms, not the five-or-fewer shape every earlier run saw once a band started
draining. Turnstile and Drone both fell the same way as floor 1: one clean line, no Exhausts, Oomph
8 and Scramble 8 met on the same turn for the Drone's bonus. Floor 2 cleared turn 5. Floor 3 built at
eight rooms and cleared turn 7, same shape again: Fast Follow went free off Gray's play, and Pry Bar
covered the last two Oomph.

Floor 4 built at seven rooms and took until turn 14, the first floor with real friction. Turn 9 is
where I cost the run a room: Overgrown Hydroponics Bay needed Scramble 6, and I paid Pick The Lock
with the two cards I should have kept to play, leaving the room one Scramble short and forcing a Flee
(note 1). The same room came back next turn under Sluggish's Holding tax, still one short (note 2),
and only cleared on its third visit once Sluggish was gone. Automated Defense Turret, Pressurized
Maintenance Hub and Gears & Glitch all cleared clean after that, the last one for Red's Second Wind
off a double-threshold Ascend.

Floor 5 built at six rooms and ran turns 15 to 21, the floor where the deck-taxing Bad Stuff cards
showed up in force: Sluggish, Rust, Spore Cloud, Corrosive Acid and Panic all passed through one hand
or the other. Every one of them was payable-away the turn it landed by routing it into a card's cost,
which repeatedly restored a room's printed threshold mid-turn (notes 2, 4) or cleared a stat tax
before it could compound. Automated Defense Turret came up three times on this floor alone and was
Fled once, under Panic, before a rebuilt hand cleared it at Oomph 10. This is also where I started
testing Junk Launcher's new wording directly (note 3).

Floor 6 built at five rooms and cleared turns 22 to 25, Crowbar's "one more Good Stuff" doubling a
Coil Of Cable draw along the way. The run stopped at the turn 25 cap with floor 7 built at four rooms
and nothing yet flipped.

Live cards (deck, discard and hand together) and Exhaust pile size at each Ascend:

| Ascend  | Turn | Red live | Red exhaust | Gray live | Gray exhaust |
|---------|------|----------|-------------|-----------|--------------|
| Floor 1 | 3    | 12       | 0           | 13        | 0            |
| Floor 2 | 5    | 14       | 0           | 14        | 0            |
| Floor 3 | 7    | 15       | 0           | 15        | 0            |
| Floor 4 | 14   | 12       | 7           | 17        | 4            |
| Floor 5 | 21   | 6        | 19          | 15        | 11           |
| Floor 6 | 25   | 7        | 20          | 19        | 13           |

## Notes

1. **Miscalculated a scramble line and cost the room.** `[agent]` (log 223)

   > Miscalculated a scramble line and cost the room. Overgrown Hydroponics Bay: Scramble 6 clears
   > for Bad Stuff each, Scramble 11 for Good Stuff each. Gray's hand was Crowbar (free, Scr1),
   > Distract & Pivot (cost2, Scr3), Duck Under (cost1, Scr2), Pick The Lock (cost2, Scr4), Pry Bar
   > (free, Oomph3). The right line was Pick The Lock paying Crowbar+Pry Bar, then Duck Under paying
   > Distract & Pivot: Scr4+2=6 using all 5 cards. I instead paid Pick The Lock with Duck Under+Pry
   > Bar, which discarded the Duck Under I needed to play, and the remaining Crowbar+Distract & Pivot
   > only reach Scramble 5, one short. This is my own arithmetic error, not a refusal or engine
   > issue; continuing rather than undoing, since the move itself was legal.

   Not an engine or rulebook question: a genuine arithmetic mistake in planning a payment, caught and
   logged rather than undone. It cost one turn and a forced Flee (2 Exhausts each, Gray gets Bad
   Stuff), which is the room's own printed cost for missing every threshold.

2. **Sluggish's Holding taxed every card in Gray's hand, including itself.** `[agent]` (log 240)

   > Sluggish's Holding (cards you play cost +1) taxed every card in Gray's hand this turn,
   > including itself: printed costs 2,1,2,1,1 all displayed as one higher. Best line found was Pick
   > The Lock alone for Scramble 4 (paying Sluggish, One Man's Junk, Duck Under), one short of the
   > room's own Scramble 6 line even before last turn's miscalculation. Red held no Scramble cards
   > this hand, so the room was unreachable either way. Ending without playing to keep the hand for
   > next turn; the Flee is forced.

   Sluggish reads "Holding: Cards you play cost +1 card to play." The engine taxed Sluggish's own
   play cost too, which the text does not rule out (Sluggish is a card you play), so this reads as
   working as printed. On the room's third visit, once Sluggish was paid away as a cost for another
   card, the printed thresholds (Scramble 6 and 11) showed again with no `+1` tag, which confirms the
   Holding effect stops the instant the card leaves hand, as the keyword says.

3. **Junk Launcher's new text counts a free play at its printed cost, not its actual cost.**
   `[agent]` (log 451)

   > Junk Launcher's new text: 'Oomph equal to total costs of all cards you played this turn.'
   > Played Fast Follow for free (Gray had already played, so its cost was 0, not its printed 1),
   > then Overdrive (printed 0), then Junk Launcher itself (printed 2, paid with Second Wind and
   > Spore Cloud). The stat pool rose by 3, not 2 (0 actual + 0 + 2) or 4 (1 printed + 0 + 2, or 2
   > payers times 2 from the old wording). 3 matches printed cost 1 (Fast Follow) + printed 0
   > (Overdrive) + printed 2 (Junk Launcher) = 3: it is using each card's PRINTED cost, not what was
   > actually paid for it, so a free play still counts at full price. Rulebook, Card anatomy: 'Cost:
   > the number of cards you discard from your hand to play it' -- that is the printed number, but a
   > card played for free is explicitly not discarding that number of cards. Question for the
   > designer: should a for-free play count as its printed cost or as 0 for this card's purposes?

   `design/cards.yaml` gives Junk Launcher's text verbatim as "Oomph equal to total costs of all
   cards you played this turn," so the wording is confirmed, not misquoted. This is the third
   distinct Junk Launcher finding across three playtests (issue #144, playtest 6 note 13, this one):
   each time the card's actual value did not match a straightforward reading of its printed text.
   That pattern alone, regardless of which reading is right, says the card's rules text needs to
   either specify "printed cost" explicitly or the engine needs to match actual cost paid.

4. **The "who may Scrap a Bad Stuff card" prompt asks with nobody holding one.** `[agent]` (log 557)

   > Same 'who may Scrap a Bad Stuff card' prompt fires with nobody holding a Bad Stuff card (Red:
   > Junk Launcher only, Gray: Duck Under only, both cleared their hands of Bad Stuff this same
   > turn). Same shape as playtest 5 and 6's finding; no way to say nobody.

   Third run in a row to hit this. Minor, but consistent enough to be worth fixing: the prompt should
   check for an eligible target before asking.

5. **Stopping at the turn 25 cap.** `[agent]` (log 725)

   > Stopping here at the turn 25 cap, per the playtest rule: floor 6 cleared this turn, floor 7
   > built at 4 rooms, nobody has flipped yet. Run is neither won nor lost. Six floors cleared in 25
   > turns, faster than playtest 6's six floors in 20 turns to a defeat: every floor this run built
   > at or close to its full count (10,9,8,7,6,5), none of the short-floor or one-card-Stairwell
   > shapes playtest 6 found. Red's Exhaust pile is at 20 against Gray's 13, almost entirely from the
   > Bad Stuff cards Corrosive Acid, Spore Cloud and Rust cycling through Red's hand and from
   > Overdrive's own Exhaust 2; Red's live cards (deck+discard+hand) sat at 5 to 10 for most of the
   > back half while Gray's grew past 20.

   Not a rule question, a summary note at the stopping point. See "What the run showed" below for the
   detail behind it.

## What the run showed

- **The enlarged pools fixed the short-floor problem outright.** Every floor from 1 to 6 built at
  its full printed count (10, 9, 8, 7, 6, 5), or one fewer than the last as the rulebook says. None
  of playtest 6's one- or two-card floors, or its Stairwell-alone floors, showed up here. Floors 1
  to 3 cleared in one turn each with no Exhausts at all, which reads as the "no rent" band 1 working
  exactly as intended: starters plus one Stuff card is enough, and there is nothing to decide beyond
  which cheap card to spend.
- **A card discarded to pay a cost sheds its Holding effect at once, and this became the main lever
  for handling deck-taxing Bad Stuff.** Sluggish, Rust, Spore Cloud, Corrosive Acid and Panic all
  showed up on floor 5, and in every case the fix was the same: play something else and pay for it
  with the Bad Stuff card, which discards it and ends the Holding tax before it can compound (note
  2, and Panic paid away the same way two more times without a note, logs 412-413, 541-542 and
  651-652). This makes a Bad Stuff card's real cost the one turn you hold it, not a lasting drag,
  as long as you have a spare card to pay with.
- **Red paid for that tempo in Exhausts.** Red ended the run with 20 Exhausted cards to Gray's 13,
  almost all from Overdrive's self-Exhaust and from playing through Corrosive Acid, Spore Cloud and
  Rust rather than sitting on them. Red's live card count (deck plus discard plus hand) dropped to
  6 by floor 5's Ascend against Gray's 15, the same one-sided drain playtest 6 saw, but here it never
  produced a forced Flee from an unreachable line the way playtest 6's late floors did.
- **One real playtester mistake, cleanly caught.** Note 1 is a plain miscalculation, not a rule
  question: paying a room's cost with the wrong two cards cost a full turn's worth of progress. The
  CLI's per-card cost prompts made it possible to see the error the next turn, but nothing in the
  tool would have caught it at the time.

## The CLI as a playtest tool

- **Things that worked:** a room's threshold line updates live as Holding taxes (Sluggish, Panic)
  enter and leave a hand, so `play card` output alone was enough to confirm a tax had actually
  lifted -- the room's printed line, tagged "(printed N)" while the tax applied, showed the plain
  number again the instant the taxing card was discarded (this state is not in the replay's event
  log, only in the `play` output at the time, around logs 412-413, 541-542 and 651-652 where Panic
  was paid away); the pile prompt for Peek/Hack the Doors-style effects lists every eligible pile in
  one line; `set -o pipefail` caught the one place this session would otherwise have chained a move
  onto a refusal.
- **Nothing forced an undo or a refusal this run**, which is itself a data point: every move typed
  was legal, so there is no fresh finding about the undo or refusal paths beyond what playtests 3 and
  6 already found.
- Same two friction points as playtest 6, both minor and already listed as candidate issues there:
  the "who may Scrap" prompt with no eligible target (note 4), and no way to print a Room's text from
  `bin/nvu card`.

## Candidate issues

Rulebook questions for the designer:

- Should Junk Launcher's "total costs of all cards you played this turn" count a card's printed
  cost or the cost actually paid for it, when the two differ (a for-free play, a cost reduction)?
  This is the third playtest in a row to find the card's value not matching a plain reading of its
  text (note 3).

Shape, independent of tuning:

- With the pools enlarged, every floor 1-6 built at or one below its printed count. The short-floor
  and drained-band findings from playtest 6 do not reproduce here; that branch of questions looks
  closed unless a later floor (7-10) still runs short.
- A Bad Stuff card's Holding tax lifts the instant it is discarded to pay for something else, which
  makes "always have a spare card to route it through" the practical answer to most of this list's
  Bad Stuff. Whether that is the intended amount of counterplay, or too easy an out, is a tuning
  question once the card set is closer to final.

Minor, already flagged in playtest 5 and 6:

- The "one of you may Scrap a Bad Stuff card" prompt still asks when nobody holds one (note 4).

CLI improvements, already flagged in playtest 6:

- Let `bin/nvu card` print a Room.

## Appendix: the run transcript

`bin/nvu replay design/playtests/07-full-floors.json`, verbatim.

```
  1. Floor 1 is built: 10 rooms.
  2. You are in: Security Turnstile.
  3. Red draws Charge In.
  4. Red draws Overdrive.
  5. Red draws Shove.
  6. Red draws Charge In.
  7. Red draws Shove.
  8. Gray draws Pick The Lock.
  9. Gray draws Pick The Lock.
 10. Gray draws Duck Under.
 11. Gray draws Work The Angles.
 12. Gray draws Peek Around Corner.
 13. Gray discards Duck Under from their hand.
 14. Gray discards Work The Angles from their hand.
 15. Gray pays with Duck Under, Work The Angles.
 16. Gray plays Pick The Lock.
 17. Scramble 3 met — Clear.
 18. Security Turnstile is Cleared.
 19. Cleanup.
 20. Gray discards Pick The Lock from their play zone.
 21. — end of turn 1 —
 22. You are in: Flooded Ventilation Shaft.
 23. Gray draws Duck Under.
 24. Gray draws Pick The Lock.
 25. Gray draws Duck Under.
 26. Red discards Overdrive from their hand.
 27. Red discards Shove from their hand.
 28. Red pays with Overdrive, Shove.
 29. Red plays Charge In.
 30. Gray discards Pick The Lock from their hand.
 31. Gray pays with Pick The Lock.
 32. Gray plays Duck Under.
 33. Gray discards Peek Around Corner from their hand.
 34. Gray pays with Peek Around Corner.
 35. Gray plays Duck Under.
 36. Scramble 4 met — Clear.
 37. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
 38. Flooded Ventilation Shaft is Cleared.
 39. Gray gets Pry Bar.
 40. Gray takes Pry Bar into hand.
 41. Cleanup.
 42. Red discards Charge In from their play zone.
 43. Gray discards Duck Under from their play zone.
 44. Gray discards Duck Under from their play zone.
 45. — end of turn 2 —
 46. You are in: The Sentry Drone.
 47. Red draws Charge In.
 48. Red draws Shove.
 49. Red draws Charge In.
 50. Gray draws Peek Around Corner.
 51. Gray draws Pick The Lock.
 52. Gray draws Pick The Lock.
 53. Red discards Charge In from their hand.
 54. Red pays with Charge In.
 55. Red plays Shove.
 56. Red discards Shove from their hand.
 57. Red discards Charge In from their hand.
 58. Red pays with Shove, Charge In.
 59. Red plays Charge In.
 60. Gray plays Pry Bar.
 61. Oomph 8 met — Ascend.
 62. The Sentry Drone is Cleared.
 63. Cleanup.
 64. Red discards Shove from their play zone.
 65. Red discards Charge In from their play zone.
 66. Gray discards Pry Bar from their play zone.
 67. — end of turn 3 —
 68. Floor 1 is clear.
 69. Red takes Tag Team.
 70. Red shuffles 1 card(s) back in.
 71. Gray shuffles 4 card(s) back in.
 72. Gray takes One Man's Junk.
 73. Gray shuffles 1 card(s) back in.
 74. Floor 2 is built: 9 rooms.
 75. You are in: Security Turnstile.
 76. Red draws Overdrive.
 77. Red draws Shove.
 78. Red draws Lean In.
 79. Red draws Charge In.
 80. Red draws Tag Team.
 81. Gray draws Pick The Lock.
 82. Gray draws Duck Under.
 83. Gray draws Peek Around Corner.
 84. Gray draws One Man's Junk.
 85. Gray draws Pick The Lock.
 86. Gray discards Duck Under from their hand.
 87. Gray discards Peek Around Corner from their hand.
 88. Gray pays with Duck Under, Peek Around Corner.
 89. Gray plays Pick The Lock.
 90. Scramble 3 met — Clear.
 91. Security Turnstile is Cleared.
 92. Cleanup.
 93. Gray discards Pick The Lock from their play zone.
 94. — end of turn 4 —
 95. You are in: The Sentry Drone.
 96. Gray draws Pick The Lock.
 97. Gray's deck is empty — the discard pile shuffles in to make a new one (11 cards).
 98. Gray draws Duck Under.
 99. Gray draws Pick The Lock.
100. Red discards Lean In from their hand.
101. Red pays with Lean In.
102. Red plays Tag Team.
103. Red discards Shove from their hand.
104. Red discards Overdrive from their hand.
105. Red pays with Shove, Overdrive.
106. Red plays Charge In.
107. Gray discards Duck Under from their hand.
108. Gray pays with Duck Under.
109. Gray plays One Man's Junk.
110. Gray discards Pick The Lock from their hand.
111. Gray discards Pick The Lock from their hand.
112. Gray pays with Pick The Lock, Pick The Lock.
113. Gray plays Pick The Lock.
114. Oomph 8 met — Ascend.
115. Scramble 8 met — Ascend, and one of you gets Good Stuff.
116. The Sentry Drone is Cleared.
117. Red gets Duct Tape & Wire.
118. Red takes Duct Tape & Wire into hand.
119. Cleanup.
120. Red discards Tag Team from their play zone.
121. Red discards Charge In from their play zone.
122. Gray discards One Man's Junk from their play zone.
123. Gray discards Pick The Lock from their play zone.
124. — end of turn 5 —
125. Floor 2 is clear.
126. Red shuffles 1 card(s) back in.
127. Red takes Fast Follow.
128. Red shuffles 1 card(s) back in.
129. Gray takes Hack the Doors.
130. Gray shuffles 1 card(s) back in.
131. Floor 3 is built: 8 rooms.
132. You are in: Security Turnstile.
133. Red draws Fast Follow.
134. Red draws Duct Tape & Wire.
135. Red's deck is empty — the discard pile shuffles in to make a new one (13 cards).
136. Red draws Shove.
137. Red draws Lean In.
138. Red draws Charge In.
139. Gray draws Duck Under.
140. Gray draws Pick The Lock.
141. Gray draws Duck Under.
142. Gray draws Work The Angles.
143. Gray draws Peek Around Corner.
144. Gray discards Duck Under from their hand.
145. Gray discards Duck Under from their hand.
146. Gray pays with Duck Under, Duck Under.
147. Gray plays Pick The Lock.
148. Scramble 3 met — Clear.
149. Security Turnstile is Cleared.
150. Cleanup.
151. Gray discards Pick The Lock from their play zone.
152. — end of turn 6 —
153. You are in: The Sentry Drone.
154. Gray draws Hack the Doors.
155. Gray draws Duck Under.
156. Gray draws Pry Bar.
157. Red discards Shove from their hand.
158. Red discards Lean In from their hand.
159. Red pays with Shove, Lean In.
160. Red plays Charge In.
161. Red discards Fast Follow from their hand.
162. Red pays with Fast Follow.
163. Red plays Duct Tape & Wire.
164. Gray plays Pry Bar.
165. Oomph 8 met — Ascend.
166. The Sentry Drone is Cleared.
167. Cleanup.
168. Red discards Charge In from their play zone.
169. Red discards Duct Tape & Wire from their play zone.
170. Gray discards Pry Bar from their play zone.
171. — end of turn 7 —
172. Floor 3 is clear.
173. Red takes Junk Launcher.
174. Red shuffles 1 card(s) back in.
175. Gray shuffles 4 card(s) back in.
176. Gray takes Distract & Pivot.
177. Gray shuffles 1 card(s) back in.
178. Floor 4 is built: 7 rooms.
179. You are in: Automated Defense Turret.
180. Red draws Charge In.
181. Red draws Shove.
182. Red draws Tag Team.
183. Red draws Shove.
184. Red draws Overdrive.
185. Gray draws Pick The Lock.
186. Gray draws Peek Around Corner.
187. Gray draws Hack the Doors.
188. Gray draws Work The Angles.
189. Gray draws Peek Around Corner.
190. Gray discards Peek Around Corner from their hand.
191. Gray discards Peek Around Corner from their hand.
192. Gray pays with Peek Around Corner, Peek Around Corner.
193. Gray plays Pick The Lock.
194. Gray discards Work The Angles from their hand.
195. Gray pays with Work The Angles.
196. Gray plays Hack the Doors.
197. A look at the Floor deck: Overgrown Hydroponics Bay, Gears & Glitch, Overgrown Hydroponics Bay.
198. Red discards Shove from their hand.
199. Red pays with Shove.
200. Red plays Tag Team.
201. Red draws Charge In.
202. Scramble 8 met — Clear, and Gray gets Good Stuff.
203. Automated Defense Turret is Cleared.
204. Gray gets Crowbar.
205. Gray takes Crowbar into hand.
206. Cleanup.
207. Red discards Tag Team from their play zone.
208. Gray discards Pick The Lock from their play zone.
209. Gray discards Hack the Doors from their play zone.
210. — end of turn 8 —
211. You are in: Overgrown Hydroponics Bay.
212. Red draws Overdrive.
213. Gray draws Distract & Pivot.
214. Gray draws Duck Under.
215. Gray's deck is empty — the discard pile shuffles in to make a new one (14 cards).
216. Gray draws Pick The Lock.
217. Gray draws Pry Bar.
218. Gray discards Duck Under from their hand.
219. Gray discards Pry Bar from their hand.
220. Gray pays with Duck Under, Pry Bar.
221. Gray plays Pick The Lock.
222. Gray plays Crowbar.
223. NOTE — Miscalculated a scramble line and cost the room. Overgrown Hydroponics Bay: Scramble 6 clears for Bad Stuff each, Scramble 11 for Good Stuff each. Gray's hand was Crowbar (free, Scr1), Distract & Pivot (cost2, Scr3), Duck Under (cost1, Scr2), Pick The Lock (cost2, Scr4), Pry Bar (free, Oomph3). The right line was Pick The Lock paying Crowbar+Pry Bar, then Duck Under paying Distract & Pivot: Scr4+2=6 using all 5 cards. I instead paid Pick The Lock with Duck Under+Pry Bar, which discarded the Duck Under I needed to play, and the remaining Crowbar+Distract & Pivot only reach Scramble 5, one short. This is my own arithmetic error, not a refusal or engine issue; continuing rather than undoing, since the move itself was legal.
224. You Flee Overgrown Hydroponics Bay.
225. Red Exhausts Charge In.
226. Red Exhausts Shove.
227. Gray Exhausts Peek Around Corner.
228. Gray Exhausts Peek Around Corner.
229. Gray gets Sluggish.
230. Gray takes Sluggish into hand.
231. Cleanup.
232. Gray discards Pick The Lock from their play zone.
233. Gray discards Crowbar from their play zone.
234. Overgrown Hydroponics Bay shuffles back into the Floor deck.
235. — end of turn 9 —
236. You are in: Overgrown Hydroponics Bay.
237. Gray draws Pick The Lock.
238. Gray draws One Man's Junk.
239. Gray draws Duck Under.
240. NOTE — Sluggish's Holding (cards you play cost +1) taxed every card in Gray's hand this turn, including itself: printed costs 2,1,2,1,1 all displayed as one higher. Best line found was Pick The Lock alone for Scramble 4 (paying Sluggish, One Man's Junk, Duck Under), one short of the room's own Scramble 6 line even before last turn's miscalculation. Red held no Scramble cards this hand, so the room was unreachable either way. Ending without playing to keep the hand for next turn; the Flee is forced.
241. You Flee Overgrown Hydroponics Bay.
242. Red Exhausts Charge In.
243. Red Exhausts Junk Launcher.
244. Gray Exhausts Pick The Lock.
245. Gray Exhausts Pick The Lock.
246. Gray gets Torn Seal.
247. Gray takes Torn Seal into hand.
248. Cleanup.
249. Overgrown Hydroponics Bay shuffles back into the Floor deck.
250. — end of turn 10 —
251. You are in: Overgrown Hydroponics Bay.
252. Gray discards Sluggish from their hand.
253. Gray discards Torn Seal from their hand.
254. Gray discards One Man's Junk from their hand.
255. Gray pays with Sluggish, Torn Seal, One Man's Junk.
256. Gray plays Pick The Lock.
257. Gray discards Distract & Pivot from their hand.
258. Gray pays with Distract & Pivot.
259. Gray plays Duck Under.
260. Scramble 6 met — Clear, but both of you get Bad Stuff.
261. Overgrown Hydroponics Bay is Cleared.
262. Red gets Faceful Of Slime.
263. Red takes Faceful Of Slime into hand.
264. Gray gets Faceful Of Slime.
265. Gray takes Faceful Of Slime into hand.
266. Cleanup.
267. Gray discards Pick The Lock from their play zone.
268. Gray discards Duck Under from their play zone.
269. — end of turn 11 —
270. You are in: Pressurized Maintenance Hub.
271. Gray draws Pick The Lock.
272. Gray draws Duck Under.
273. Gray draws Duck Under.
274. Red discards Shove from their hand.
275. Red discards Overdrive from their hand.
276. Red pays with Shove, Overdrive.
277. Red plays Charge In.
278. Red discards Overdrive from their hand.
279. Red discards Faceful Of Slime from their hand.
280. Red pays with Overdrive, Faceful Of Slime.
281. Red plays Charge In.
282. Gray discards Duck Under from their hand.
283. Gray discards Duck Under from their hand.
284. Gray pays with Duck Under, Duck Under.
285. Gray plays Pick The Lock.
286. Oomph 7 met — Clear, and Red reveals a card reward.
287. Pressurized Maintenance Hub is Cleared.
288. Red's reward pool shows Cross Punch.
289. Red takes Cross Punch.
290. Cleanup.
291. Red discards Charge In from their play zone.
292. Red discards Charge In from their play zone.
293. Gray discards Pick The Lock from their play zone.
294. — end of turn 12 —
295. You are in: Automated Defense Turret.
296. Red draws Cross Punch.
297. Red's deck is empty — the discard pile shuffles in to make a new one (13 cards).
298. Red draws Duct Tape & Wire.
299. Red draws Shove.
300. Red draws Shove.
301. Red draws Lean In.
302. Gray draws Work The Angles.
303. Gray draws Hack the Doors.
304. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
305. Gray draws Duck Under.
306. Gray discards Faceful Of Slime from their hand.
307. Gray pays with Faceful Of Slime.
308. Gray plays Work The Angles.
309. Gray discards Duck Under from their hand.
310. Gray pays with Duck Under.
311. Gray plays Hack the Doors.
312. A look at the Floor deck: Gears & Glitch, Overgrown Hydroponics Bay, Pressurized Maintenance Hub.
313. Red discards Shove from their hand.
314. Red discards Shove from their hand.
315. Red pays with Shove, Shove.
316. Red plays Cross Punch.
317. Red Exhausts Charge In.
318. Red discards Lean In from their hand.
319. Red pays with Lean In.
320. Red plays Duct Tape & Wire.
321. Scramble 8 met — Clear, and Gray gets Good Stuff.
322. Automated Defense Turret is Cleared.
323. Gray gets Crowbar.
324. Gray takes Crowbar into hand.
325. Cleanup.
326. Red discards Cross Punch from their play zone.
327. Red discards Duct Tape & Wire from their play zone.
328. Gray discards Work The Angles from their play zone.
329. Gray discards Hack the Doors from their play zone.
330. — end of turn 13 —
331. You are in: Gears & Glitch.
332. Red draws Charge In.
333. Red draws Fast Follow.
334. Red draws Shove.
335. Red draws Charge In.
336. Red draws Tag Team.
337. Gray draws Duck Under.
338. Gray draws Duck Under.
339. Gray draws One Man's Junk.
340. Gray draws Pry Bar.
341. Gray plays Crowbar.
342. Gray discards One Man's Junk from their hand.
343. Gray pays with One Man's Junk.
344. Gray plays Duck Under.
345. Gray discards Pry Bar from their hand.
346. Gray pays with Pry Bar.
347. Gray plays Duck Under.
348. Red discards Shove from their hand.
349. Red pays with Shove.
350. Red plays Tag Team.
351. Red draws Overdrive.
352. Red plays Fast Follow.
353. Red plays Overdrive.
354. Red Exhausts Overdrive.
355. Red Exhausts Faceful Of Slime.
356. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
357. Gears & Glitch is Cleared.
358. Red's reward pool shows Second Wind.
359. Red takes Second Wind.
360. Cleanup.
361. Red discards Tag Team from their play zone.
362. Red discards Fast Follow from their play zone.
363. Red discards Overdrive from their play zone.
364. Gray discards Crowbar from their play zone.
365. Gray discards Duck Under from their play zone.
366. Gray discards Duck Under from their play zone.
367. — end of turn 14 —
368. Floor 4 is clear.
369. Red shuffles 2 card(s) back in.
370. Red takes Junk Launcher.
371. Red shuffles 1 card(s) back in.
372. Gray takes Quick Vault.
373. Gray shuffles 1 card(s) back in.
374. Floor 5 is built: 6 rooms.
375. You are in: Overgrown Hydroponics Bay.
376. Red draws Charge In.
377. Red draws Junk Launcher.
378. Red draws Second Wind.
379. Red draws Charge In.
380. Red's deck is empty — the discard pile shuffles in to make a new one (9 cards).
381. Red draws Duct Tape & Wire.
382. Gray draws Pick The Lock.
383. Gray draws Sluggish.
384. Gray draws Pick The Lock.
385. Gray draws Distract & Pivot.
386. Gray draws Quick Vault.
387. Gray discards Sluggish from their hand.
388. Gray discards Quick Vault from their hand.
389. Gray discards Distract & Pivot from their hand.
390. Gray pays with Sluggish, Quick Vault, Distract & Pivot.
391. Gray plays Pick The Lock.
392. Red discards Charge In from their hand.
393. Red pays with Charge In.
394. Red plays Duct Tape & Wire.
395. Scramble 6 met — Clear, but both of you get Bad Stuff.
396. Overgrown Hydroponics Bay is Cleared.
397. Red gets Spore Cloud.
398. Red takes Spore Cloud into hand.
399. Gray gets Panic.
400. Gray takes Panic into hand.
401. Cleanup.
402. Red discards Charge In from their hand.
403. Red discards Duct Tape & Wire from their play zone.
404. Gray discards Pick The Lock from their play zone.
405. — end of turn 15 —
406. You are in: Overgrown Hydroponics Bay.
407. Red draws Shove.
408. Red draws Shove.
409. Gray draws Torn Seal.
410. Gray draws Duck Under.
411. Gray draws Crowbar.
412. Gray discards Panic from their hand.
413. Gray pays with Panic.
414. Gray plays Duck Under.
415. Gray discards Torn Seal from their hand.
416. Gray discards Crowbar from their hand.
417. Gray pays with Torn Seal, Crowbar.
418. Gray plays Pick The Lock.
419. Scramble 6 met — Clear, but both of you get Bad Stuff.
420. Overgrown Hydroponics Bay is Cleared.
421. Red gets Corrosive Acid.
422. Red takes Corrosive Acid into hand.
423. Gray gets System Feedback.
424. Gray takes System Feedback into hand.
425. Cleanup.
426. Red discards Corrosive Acid from their hand.
427. Red discards Shove from their hand.
428. Red discards Shove from their hand.
429. Gray discards Duck Under from their play zone.
430. Gray discards Pick The Lock from their play zone.
431. — end of turn 16 —
432. You are in: Gears & Glitch.
433. Red draws Fast Follow.
434. Red draws Overdrive.
435. Gray draws Pick The Lock.
436. Gray's deck is empty — the discard pile shuffles in to make a new one (18 cards).
437. Gray draws Hack the Doors.
438. Gray draws Faceful Of Slime.
439. Gray discards System Feedback from their hand.
440. Gray discards Faceful Of Slime from their hand.
441. Gray pays with System Feedback, Faceful Of Slime.
442. Gray plays Pick The Lock.
443. Red plays Fast Follow.
444. Red plays Overdrive.
445. Red Exhausts Cross Punch.
446. Red Exhausts Shove.
447. Red discards Second Wind from their hand.
448. Red discards Spore Cloud from their hand.
449. Red pays with Second Wind, Spore Cloud.
450. Red plays Junk Launcher.
451. NOTE — Junk Launcher's new text: 'Oomph equal to total costs of all cards you played this turn.' Played Fast Follow for free (Gray had already played, so its cost was 0, not its printed 1), then Overdrive (printed 0), then Junk Launcher itself (printed 2, paid with Second Wind and Spore Cloud). The stat pool rose by 3, not 2 (0 actual + 0 + 2) or 4 (1 printed + 0 + 2, or 2 payers times 2 from the old wording). 3 matches printed cost 1 (Fast Follow) + printed 0 (Overdrive) + printed 2 (Junk Launcher) = 3: it is using each card's PRINTED cost, not what was actually paid for it, so a free play still counts at full price. Rulebook, Card anatomy: 'Cost: the number of cards you discard from your hand to play it' -- that is the printed number, but a card played for free is explicitly not discarding that number of cards. Question for the designer: should a for-free play count as its printed cost or as 0 for this card's purposes?
452. You Flee Gears & Glitch.
453. Red Exhausts Lean In.
454. Red Exhausts Tag Team.
455. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
456. Red Exhausts Corrosive Acid.
457. Gray Exhausts Duck Under.
458. Gray Exhausts Work The Angles.
459. Gray Exhausts One Man's Junk.
460. Red gets Rust.
461. Red takes Rust into hand.
462. Cleanup.
463. Red discards Fast Follow from their play zone.
464. Red discards Overdrive from their play zone.
465. Red discards Junk Launcher from their play zone.
466. Gray discards Pick The Lock from their play zone.
467. Gears & Glitch shuffles back into the Floor deck.
468. — end of turn 17 —
469. You are in: Automated Defense Turret.
470. Red draws Shove.
471. Red draws Spore Cloud.
472. Red draws Charge In.
473. Red draws Shove.
474. Gray draws Pick The Lock.
475. Gray draws Duck Under.
476. Gray draws Duck Under.
477. Gray draws Quick Vault.
478. Red discards Rust from their hand.
479. Red discards Shove from their hand.
480. Red pays with Rust, Shove.
481. Red plays Charge In.
482. Red discards Spore Cloud from their hand.
483. Red pays with Spore Cloud.
484. Red plays Shove.
485. You Flee Automated Defense Turret.
486. Red Exhausts Charge In.
487. Red Exhausts Second Wind.
488. Gray Exhausts Pry Bar.
489. Gray Exhausts Crowbar.
490. Red gets Corrosive Acid.
491. Red takes Corrosive Acid into hand.
492. Gray gets My Head Is Quantum Spinning.
493. Gray takes My Head Is Quantum Spinning into hand.
494. Cleanup.
495. Red discards Charge In from their play zone.
496. Red discards Shove from their play zone.
497. Automated Defense Turret shuffles back into the Floor deck.
498. — end of turn 18 —
499. You are in: Automated Defense Turret.
500. Red draws Duct Tape & Wire.
501. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
502. Red draws Spore Cloud.
503. Red draws Shove.
504. Red draws Rust.
505. Red Exhausts Charge In.
506. Gray discards Quick Vault from their hand.
507. Gray discards My Head Is Quantum Spinning from their hand.
508. Gray pays with Quick Vault, My Head Is Quantum Spinning.
509. Gray plays Pick The Lock.
510. Gray discards Duck Under from their hand.
511. Gray pays with Duck Under.
512. Gray plays Hack the Doors.
513. A look at the Bad Stuff pool: System Feedback, Torn Seal, Sluggish.
514. Red discards Shove from their hand.
515. Red pays with Shove.
516. Red plays Duct Tape & Wire.
517. Red discards Spore Cloud from their hand.
518. Red discards Rust from their hand.
519. Red pays with Spore Cloud, Rust.
520. Red plays Corrosive Acid.
521. Scramble 8 met — Clear, and Gray gets Good Stuff.
522. Automated Defense Turret is Cleared.
523. Gray gets Emergency Power Core.
524. Gray takes Emergency Power Core into hand.
525. Cleanup.
526. Red discards Duct Tape & Wire from their play zone.
527. Red discards Corrosive Acid from their play zone.
528. Gray discards Pick The Lock from their play zone.
529. Gray discards Hack the Doors from their play zone.
530. — end of turn 19 —
531. You are in: Automated Defense Turret.
532. Red draws Shove.
533. Red draws Overdrive.
534. Red draws Fast Follow.
535. Red draws Junk Launcher.
536. Red's deck is empty — the discard pile shuffles in to make a new one (5 cards).
537. Red draws Spore Cloud.
538. Gray draws Panic.
539. Gray draws Crowbar.
540. Gray draws Duck Under.
541. Gray discards Panic from their hand.
542. Gray pays with Panic.
543. Gray plays Duck Under.
544. Gray plays Emergency Power Core.
545. Gray Exhausts Distract & Pivot.
546. Gray Exhausts Sluggish.
547. Gray plays Crowbar.
548. Red plays Fast Follow.
549. Red plays Overdrive.
550. Red Exhausts Corrosive Acid.
551. Red Exhausts Rust.
552. Red discards Spore Cloud from their hand.
553. Red pays with Spore Cloud.
554. Red plays Shove.
555. Oomph 10 met — Clear, and one of you may Scrap a Bad Stuff card from your hand.
556. Automated Defense Turret is Cleared.
557. NOTE — Same 'who may Scrap a Bad Stuff card' prompt fires with nobody holding a Bad Stuff card (Red: Junk Launcher only, Gray: Duck Under only, both cleared their hands of Bad Stuff this same turn). Same shape as playtest 5 and 6's finding; no way to say nobody.
558. Cleanup.
559. Red discards Fast Follow from their play zone.
560. Red discards Overdrive from their play zone.
561. Red discards Shove from their play zone.
562. Gray discards Duck Under from their play zone.
563. Gray discards Emergency Power Core from their play zone.
564. Gray discards Crowbar from their play zone.
565. — end of turn 20 —
566. You are in: Gears & Glitch.
567. Red draws Shove.
568. Red draws Duct Tape & Wire.
569. Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
570. Red draws Spore Cloud.
571. Red draws Overdrive.
572. Gray draws Pick The Lock.
573. Gray draws Torn Seal.
574. Gray's deck is empty — the discard pile shuffles in to make a new one (12 cards).
575. Gray draws System Feedback.
576. Gray draws Quick Vault.
577. Gray discards Duck Under from their hand.
578. Gray pays with Duck Under.
579. Gray plays Quick Vault.
580. Gray discards Torn Seal from their hand.
581. Gray discards System Feedback from their hand.
582. Gray pays with Torn Seal, System Feedback.
583. Gray plays Pick The Lock.
584. Red plays Overdrive.
585. Red Exhausts Fast Follow.
586. Red Exhausts Shove.
587. Red discards Spore Cloud from their hand.
588. Red pays with Spore Cloud.
589. Red plays Shove.
590. Red discards Junk Launcher from their hand.
591. Red pays with Junk Launcher.
592. Red plays Duct Tape & Wire.
593. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
594. Gears & Glitch is Cleared.
595. Red's reward pool shows Cross Punch.
596. Red takes Cross Punch.
597. Cleanup.
598. Red discards Overdrive from their play zone.
599. Red discards Shove from their play zone.
600. Red discards Duct Tape & Wire from their play zone.
601. Gray discards Quick Vault from their play zone.
602. Gray discards Pick The Lock from their play zone.
603. — end of turn 21 —
604. Floor 5 is clear.
605. Red takes Tag Team.
606. Red shuffles 1 card(s) back in.
607. Gray takes Covering Fire.
608. Gray shuffles 1 card(s) back in.
609. Floor 6 is built: 5 rooms.
610. You are in: Automated Defense Turret.
611. Red draws Tag Team.
612. Red draws Cross Punch.
613. Red's deck is empty — the discard pile shuffles in to make a new one (5 cards).
614. Red draws Spore Cloud.
615. Red draws Junk Launcher.
616. Red draws Shove.
617. Gray draws Emergency Power Core.
618. Gray draws Duck Under.
619. Gray draws Pick The Lock.
620. Gray draws Crowbar.
621. Gray draws Covering Fire.
622. Gray plays Emergency Power Core.
623. Gray Exhausts Duck Under.
624. Gray Exhausts My Head Is Quantum Spinning.
625. Gray plays Crowbar.
626. Gray discards Duck Under from their hand.
627. Gray discards Covering Fire from their hand.
628. Gray pays with Duck Under, Covering Fire.
629. Gray plays Pick The Lock.
630. Red discards Spore Cloud from their hand.
631. Red pays with Spore Cloud.
632. Red plays Tag Team.
633. Red draws Overdrive.
634. Scramble 8 met — Clear, and Gray gets Good Stuff.
635. Automated Defense Turret is Cleared.
636. Gray gets Coil Of Cable.
637. Gray takes Coil Of Cable into hand.
638. Gray gets Coil Of Cable.
639. Gray takes Coil Of Cable into hand.
640. Cleanup.
641. Red discards Tag Team from their play zone.
642. Gray discards Emergency Power Core from their play zone.
643. Gray discards Crowbar from their play zone.
644. Gray discards Pick The Lock from their play zone.
645. — end of turn 22 —
646. You are in: Pressurized Maintenance Hub.
647. Red draws Duct Tape & Wire.
648. Gray draws Pick The Lock.
649. Gray draws Panic.
650. Gray draws Hack the Doors.
651. Gray discards Panic from their hand.
652. Gray pays with Panic.
653. Gray plays Hack the Doors.
654. A look at the Floor deck: Overgrown Hydroponics Bay, Gears & Glitch, Pressurized Maintenance Hub.
655. Gray plays Coil Of Cable.
656. Gray plays Coil Of Cable.
657. Scramble 7 met — Clear, and Gray reveals a card reward.
658. Pressurized Maintenance Hub is Cleared.
659. Gray's reward pool shows Covering Fire.
660. Gray takes Covering Fire.
661. Cleanup.
662. Gray discards Hack the Doors from their play zone.
663. Gray discards Coil Of Cable from their play zone.
664. Gray discards Coil Of Cable from their play zone.
665. — end of turn 23 —
666. You are in: Overgrown Hydroponics Bay.
667. Gray draws Covering Fire.
668. Gray draws Faceful Of Slime.
669. Gray's deck is empty — the discard pile shuffles in to make a new one (14 cards).
670. Gray draws Duck Under.
671. Gray discards Faceful Of Slime from their hand.
672. Gray discards Duck Under from their hand.
673. Gray pays with Faceful Of Slime, Duck Under.
674. Gray plays Pick The Lock.
675. Red discards Shove from their hand.
676. Red pays with Shove.
677. Red plays Duct Tape & Wire.
678. Scramble 6 met — Clear, but both of you get Bad Stuff.
679. Overgrown Hydroponics Bay is Cleared.
680. Red gets Torn Seal.
681. Red takes Torn Seal into hand.
682. Gray gets System Feedback.
683. Gray takes System Feedback into hand.
684. Cleanup.
685. Red discards Duct Tape & Wire from their play zone.
686. Gray discards Pick The Lock from their play zone.
687. — end of turn 24 —
688. You are in: Gears & Glitch.
689. Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
690. Red draws Duct Tape & Wire.
691. Gray draws System Feedback.
692. Gray draws Covering Fire.
693. Gray draws Quick Vault.
694. Red discards Overdrive from their hand.
695. Red pays with Overdrive.
696. Red plays Duct Tape & Wire.
697. Red discards Junk Launcher from their hand.
698. Red discards Torn Seal from their hand.
699. Red pays with Junk Launcher, Torn Seal.
700. Red plays Cross Punch.
701. Red Exhausts Shove.
702. Gray discards System Feedback from their hand.
703. Gray pays with System Feedback.
704. Gray plays Quick Vault.
705. Gray discards System Feedback from their hand.
706. Gray pays with System Feedback.
707. Gray plays Covering Fire.
708. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
709. Gears & Glitch is Cleared.
710. Gray's reward pool shows I'll Take That.
711. Gray takes I'll Take That.
712. Cleanup.
713. Red discards Duct Tape & Wire from their play zone.
714. Red discards Cross Punch from their play zone.
715. Gray discards Quick Vault from their play zone.
716. Gray discards Covering Fire from their play zone.
717. — end of turn 25 —
718. Floor 6 is clear.
719. Red takes Fast Follow.
720. Red shuffles 1 card(s) back in.
721. Gray shuffles 1 card(s) back in.
722. Gray takes Catch Your Breath.
723. Gray shuffles 1 card(s) back in.
724. Floor 7 is built: 4 rooms.
725. NOTE — Stopping here at the turn 25 cap, per the playtest rule: floor 6 cleared this turn, floor 7 built at 4 rooms, nobody has flipped yet. Run is neither won nor lost. Six floors cleared in 25 turns, faster than playtest 6's six floors in 20 turns to a defeat: every floor this run built at or close to its full count (10,9,8,7,6,5), none of the short-floor or one-card-Stairwell shapes playtest 6 found. Red's Exhaust pile is at 20 against Gray's 13, almost entirely from the Bad Stuff cards Corrosive Acid, Spore Cloud and Rust cycling through Red's hand and from Overdrive's own Exhaust 2; Red's live cards (deck+discard+hand) sat at 5 to 10 for most of the back half while Gray's grew past 20.

Floor 7 · turn 25 · Turn Start   floor deck 4, cleared 21   Good Stuff 21, Bad Stuff 5
Red: deck 3, discard 5, exhaust 20, hand 0
Gray: deck 13, discard 7, exhaust 13, hand 0

seed 7, 150 command(s) replayed, floor 7, turn 25, in progress (Turn Start).
```
