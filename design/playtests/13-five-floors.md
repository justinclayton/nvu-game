# Playtest 13: Five floors of six cards

Recorded 2026-10-19. Kit revision R34.C58-v1, the first commit for issue #276 (5 floors, every floor
deck 1 Stairwell and 5 Rooms, tiers 2-2-1, rooms still flipped one at a time and a Fled room still
shuffled back). Played by an agent standing in for a human playtester, in the CLI (`bin/nvu`), one
shell call per decision, on seeds 10 and 12: the seeds of playtests 11 and 12, the two agent wins
on the 10-floor game. Two runs, one note.

Notes are the agents', verbatim, tagged `[agent]`, with their log line from `bin/nvu replay`.
Nothing here is a ruling. Suspected bugs were checked against `rulebook.md` and `cards.yaml` only;
the engine was not read. The greedy sim is not used as evidence: under R33 it dies on floor 1 in
most runs, so it no longer measures the climb.

## Results

| Seed | Outcome | Turns | Turns per floor | Flees per floor (1/2/3/4/5) |
|---|---|---|---|---|
| 10 | Victory | 19 | 5, 4, 5, 1, 4 | 0 / 0 / 0 / 0 / 0 |
| 12 | Defeat on floor 1 | 6 | 6 | 2 / - / - / - / - |

Baseline on the 10-floor game: wins in 29 turns (playtest 11, seed 10) and 35 turns (playtest 12,
seed 12). The issue's target is turns per win near half of that, and at least one Flee before floor 5.

- **Turns per win.** One win in two runs, at 19 turns: 66% of seed 10's 29. The floor count halved,
  but the turn count fell by a third, because each floor now runs about as long as a Band 1 floor did.
- **Flees.** The win had none. The loss had two, both on The Sentry Drone, which a 6-card floor brought
  back on turns 3, 5 and 6. Seed 12 was a floor-1 Victory under rulebook section 9; the engine put Red
  Down on an Exhaust from an empty deck and discard with a card still in hand (seed 12, note 4).
- **Stairwell position sets floor length.** On a 6-card floor the Stairwell's place in the deck is the
  floor's length: floor 4 of seed 10 took one turn and skipped five Rooms; floor 1 of seed 12 met the
  Drone third and Fled it twice.

The two write-ups follow as the agents wrote them.

## Run: Seed 10, five floors of six cards

Recorded 2026-10-19. Kit revision R34.C58-v1. Played by an agent standing in for a human
playtester, in the CLI (`bin/nvu`), seed 10, one shell call per decision, run file
`design/playtests/13-five-floors-seed-10.json`. The run ended in **Victory** on turn 19, when The Monolith Core fell to
Oomph 13 / Scramble 10. There was no Flee in the whole run.

Notes are the agent's, verbatim, tagged `[agent]`, with their log line from `bin/nvu replay`.
Nothing here is a ruling. Suspected bugs were checked against `rulebook.md` and `cards.yaml`
only; the engine was not read.

### How the run went

| Floor | Turns | Turns spent | Stairwell position | Flees |
|---|---|---|---|---|
| 1 | 1-5 | 5 | 5th of 6 | 0 |
| 2 | 6-9 | 4 | 4th of 6 | 0 |
| 3 | 10-14 | 5 | 5th of 6 | 0 |
| 4 | 15 | 1 | 1st of 6 | 0 |
| 5 | 16-19 | 4 | 4th of 6 (stacked there by Hack the Doors) | 0 |

Floor 1 (turns 1-5). Two Turnstiles and two Flooded Ventilation Shafts, each cleared for every
reward on it. Gray paid heavily on turns 1 and 2 (Exhaust 3 each) and was down to 4 live cards by
turn 3. On the Drone turn I spent Gray's whole hand on two Pick The Locks for Scramble 8, since
Ascend refunds the Exhaust pile, and Red reached Oomph 10 with Overdrive, Momentum Shift and Fast
Follow. Gray showed live 0 for the rest of the turn (note 2). Rewards taken: Hit 'n Run, Quick
Vault x2, I Know Kung Fu x2 for Gray; Momentum Shift, Cross Punch, Fast Follow, Rhythm & Bruise,
It Pays To Be Reckless for Red.

Floor 2 (turns 6-9). The same tier 1 rooms, cleared cheaply: Overdrive plus It Pays To Be
Reckless gave Oomph 7 / Scramble 4 on turn 6, and Hit 'n Run recovered its own payer (note 4).
Momentum Shift plus Charge took the Drone at Oomph 8. Zen Mode came from the Drone's reward.

Floor 3 (turns 10-14). The first Turret showed Zen Mode with payers staying in hand (note 6),
and Zen plus two I Know Kung Fu became a draw loop (note 7). Two Overgrown Hydroponics Bays and a
second Turret cleared on Riot Shield, Overcharged Battery and Coil Of Cable. Gears & Glitch came
5th; Hack the Doors stacked Red's deck so Momentum Shift drew It Pays To Be Reckless, which then
counted three Exhausts for +6/+6 (note 8). Both challenges met at 16/12.

Floor 4 (turn 15). Gears & Glitch was the first flip. Kung Fu draws, two Overcharged Battery
effects and Pivot reached 12/10 and cleared both challenges. The floor's other five Rooms were
never flipped (note 9).

Floor 5 (turns 16-19). Two Bio-Hazard Vaults cleared without the Scrap-for-stats text: Overcharged
Battery made Gray's next card free twice (note 10), and the second went on Oomph 17. On the Laser
Grid, Zen Mode and Kung Fu reached Scramble 14, and Hack the Doors on the Floor deck let me put The
Monolith Core on top (note 11). I held It Pays To Be Reckless back for the next turn. The Monolith
fell at 13/10 off four Red Exhausts (note 12).

### Notes

1. **Peek 1 on the Floor deck offered no choice.** `[agent]` (log 25)

   > Peek 1 on the Floor deck showed Security Turnstile and gave no choice to discard it or keep it. Rulebook Peek says 'Discard any number of them, then put the rest back'. Was expecting a keep/discard prompt. Also: where does a discarded Room go, if that is allowed?

   Rulebook, Keywords, `Peek X`: "Reveal the top X cards of ANY face-down pile. Discard any number
   of them, then put the rest back in any order." The Floor deck is named as a valid pile under
   `any deck`. On Red's deck (log 500) Hack the Doors offered a discard, but as "discard one of
   these, or choose none", not "any number". On the Floor deck (log 713) it offered only the
   order. Questions for the designer: may a Peek discard a Room from the Floor deck, and where does
   it go? Is the discard one card or any number?

2. **Gray at live 0 mid-turn, not Down.** `[agent]` (log 164)

   > Stairwell turn: I spent Gray's whole hand to reach Scramble 8 (Exhaust is free on the Ascend turn, since Ascend shuffles the Exhaust pile back). Gray now shows live 0: hand, deck and discard all empty, two Picks in the play zone. Rulebook 9 says that is Down, but does not say WHEN Down is checked. The game did not end. Is Down checked only at draw, at Cleanup, or at any moment?

   Rulebook 9: "If one player has no cards in their hand, deck, or discard pile, you go `Down`."
   Read literally, Gray was Down from the last payment until Cleanup. The engine let the turn
   finish. Question for the designer: when is Down checked? If it is "at any moment", the engine
   is wrong; if it is "when you need a card and have none" (the About section's wording), the
   rule 9 line should say so.

3. **The Ascend turn is the cheapest turn.** `[agent]` (log 193)

   > Floor 1 done in 5 turns, no Flee. Drone came 5th of 6. Spent heavily on the Ascend turn because Ascend refunds Exhaust; that makes the stairwell turn the cheapest turn on the floor, which feels backwards.

   Rulebook 10, step 1 shuffles the Exhaust pile back. Every stairwell turn in the run was played
   as "spend everything". Shape, not a bug.

4. **Hit 'n Run can refund its own payer.** `[agent]` (log 215)

   > Hit 'n Run paid with Duck Under shuffles that same Duck Under back: the card costs nothing net. Payment resolves before the card's text, so its own payment is in the Exhaust pile. Intended?

   Rulebook, Play: pay first, then "Resolve effects triggered by playing or paying for a card
   after that card's own text." The payment is in the Exhaust pile when the text resolves, so the
   engine matches the order. Question for the designer: is a net-zero Hit 'n Run intended?

5. **Floor 2 cost nothing lasting.** `[agent]` (log 322)

   > Floor 2 done in 4 turns (6-9), no Flee. Floors 1-2 cost nothing lasting: tier 1 rooms are all reward, and Exhaust refunds at each Ascend.

6. **Zen Mode leaves payers in hand.** `[agent]` (log 348)

   > Zen Mode in play: Gray paid Pick The Lock with Pick The Lock and I Know Kung Fu, and both payers STAYED IN HAND (not Exhausted, not discarded). So every Gray card is free while Zen Mode is in play. Card text: 'you don't exhaust cards'. Rulebook Play: pay by moving cards 'from your hand to your Exhaust pile'. Is the payment skipped (cards stay in hand), or should payers go to discard? As built it is a turn of unlimited free plays.

   `cards.yaml`, Zen Mode: "While this is in play, you don't exhaust cards." The rulebook defines
   paying only as moving cards to the Exhaust pile, so it does not say what a payment is when
   Exhaust is blocked. The engine still requires enough other cards in hand to name as payers
   (refused at log ~352: "Pick The Lock costs 2; you hold 1 other card."). Question for the
   designer: under Zen Mode, do payers stay in hand, go to discard, or is the card's cost still
   paid some other way?

7. **Zen Mode plus two I Know Kung Fu is a loop.** `[agent]` (log 361)

   > Zen Mode plus two I Know Kung Fu: every Scramble card (Red's too) draws Gray 2, and with Zen every Gray card is free once the hand holds enough cards to name as payers. That is a loop that can play out Gray's deck. I stopped at Scramble 11. Earlier I sequenced wrong: played both Kung Fu before Pick The Lock and was refused Pick ('costs 2; you hold 1 other card') since payers must still be in hand.

   I Know Kung Fu: "every time a Scramble card is played this turn, you may draw a card." The
   engine counted Red's Lean In and Overcharged Battery as Scramble cards and drew Gray a card for
   each Kung Fu. That reading fits the card text. Combined with note 6 it is the strongest engine
   in the run; it carried the Laser Grid on floor 5 too.

8. **It Pays To Be Reckless counts every Red Exhaust.** `[agent]` (log 509)

   > It Pays To Be Reckless counted every Red Exhaust this turn, payments and Momentum Shift's hand Exhaust included: 3 Exhausts = +6/+6. On an Ascend turn those Exhausts are refunded, so the card is free stats exactly when it matters most.

   Matches the card text ("for every card you exhaust this turn"). The table showed "Oomph 4 now,
   Scramble 4 now" while it sat in hand, which made it easy to plan.

9. **Stairwell first on floor 4.** `[agent]` (log 565)

   > Floor 4: Gears & Glitch was the FIRST flip. Cleared both challenges at 12/10 on turn 15, so floor 4 is one turn and its 5 Rooms (and their rewards) are never seen. With 6-card floors, stairwell position swings a floor from 1 turn to 6.

10. **Overcharged Battery frees the partner's card.** `[agent]` (log 622)

    > Bio-Hazard Vault Scramble 16 with no Scrap: Overcharged Battery's 'next card played this turn' applies to the partner's card too (Gray's Pick The Lock and Pack Mule went free). Two Batteries made two Gray cards free. Reading the card, 'next card played' is not limited to Red, so it matches; flagging it as the strongest cross-player lever in the run.

11. **Peek can stack the Floor deck.** `[agent]` (log 715)

    > Hack the Doors on the Floor deck: saw Monolith Core, Smoldering Armory, Laser Grid and could reorder but was not offered a discard (on Red's deck, turn 14, it offered one). Peek 1 on the Floor deck, turn 1, offered neither. Rulebook Peek: 'Discard any number of them, then put the rest back in any order.' Is the Floor deck exempt from the discard? Put Monolith on top: Peek lets the team pick when the floor boss arrives.

    See note 1 for the rule question. The reorder itself matches the rulebook. It let me choose the
    turn the Monolith arrived, which decided the run.

12. **The Monolith fell on a held card.** `[agent]` (log 752)

    > Monolith Core on turn 19 at Oomph 13 / Scramble 10, exactly the Scramble needed. It Pays To Be Reckless gave +8/+8 off four Red Exhausts (Overdrive, two Shoves paying Rhythm & Bruise, its own). The win came because Hack the Doors let me stack the Monolith on top of a turn where both hands were ready.

### What the run showed

1. **Five six-card floors made a 19-turn run with no Flee.** Floors took 5, 4, 5, 1 and 4 turns.
   Tier 1 and tier 2 rooms never forced a Flee, and Exhaust refunds at every Ascend, so stamina
   only mattered inside floor 1 (Gray at 4 live on turn 3, 0 live on turn 5). The run never felt
   in danger after floor 1. Question for the designer: is a no-Flee win on the first try the
   intended difficulty for R34?
2. **Stairwell position and Peek decide floor length.** With 6 cards, a stairwell on top makes a
   one-turn floor (floor 4) and skips five rewards. Hack the Doors on the Floor deck let me choose
   when the Monolith came. Both levers are bigger with 6-card floors than with the old 10-floor
   tower.
3. **Free-play effects dominate.** Zen Mode (payers stay in hand), Overcharged Battery (partner's
   next card free), Hit 'n Run (refunds its own payer) and It Pays To Be Reckless (refunded on the
   Ascend turn) carried every hard room. Two of these rest on rule gaps (notes 2 and 6).

### The CLI as a playtest tool

Friction, worst first:

1. Arguments are inconsistent about quoting. `play card Red Overdrive` and `pay Pick Pick` work
   unquoted, but `play take Momentum Shift` fails ("play take wants one name") and prints the
   whole help text. Passing `--run` through a shell variable failed with a raw Node stack trace
   (`ERR_PARSE_ARGS_UNKNOWN_OPTION`), not a usage line.
2. Peek prompts differ by pile with no explanation: Peek 1 on the Floor deck printed the card and
   moved on, Hack the Doors on Red's deck asked for one discard then the order, Hack the Doors on
   the Floor deck asked only for the order (notes 1, 11). I could not tell from the output whether
   the Floor deck discard was a rule or an omission.
3. `live` excludes the play zone, so mid-turn it reads lower than the real count (Gray "live 0"
   on turn 5 with two cards in play). It was hard to judge Down risk from the table.
4. The moves list shows discounted costs for every Red card after Pivot ("cost 0" on both Bull
   Rush and Riot Shield) when only the next one is discounted.
5. A note's log line is not printed when it is written; I found them with `replay` and grep.

What worked: the moves list now prints one line per card with a `pay <N of: ...>` template, not
every payment combination. Staged choices (Kung Fu draws, Momentum Shift's Exhaust, reward picks,
Peek order) blocked the run and named what they waited on. "Zen Mode stops it: Gray Exhausts
nothing." made the Zen behaviour visible at once. It Pays To Be Reckless showing "Oomph 4 now" in
hand settled its counting before I played it.

### Candidate issues

Engine mismatches (possible):

- Gray at hand, deck and discard all empty mid-turn was not Down (note 2). Depends on when Down is
  checked.
- Peek on the Floor deck offers no discard; Peek on a character deck offers one card, not "any
  number" (notes 1, 11).

Rulebook questions:

- When is Down checked (note 2)?
- Under Zen Mode, where do payers go (note 6)?
- May a Peek discard a Room, and where does it go (note 1)?
- Is a Hit 'n Run that refunds its own payer intended (note 4)?

Shape, independent of tuning:

- No Flee in 19 turns; stamina only bit inside floor 1 (What the run showed, 1).
- Stairwell first makes a one-turn floor with no rewards (note 9).
- The Ascend turn is free to spend on, so stairwell turns are the cheapest (note 3).

Card observations for a later re-tune:

- Zen Mode with I Know Kung Fu is a loop (notes 6, 7).
- Overcharged Battery frees the partner's card (note 10).
- It Pays To Be Reckless decided two stairwells (notes 8, 12).
- Hack the Doors on the Floor deck chooses the boss turn (note 11).

CLI:

- Make every name argument accept unquoted words, and print a usage line, not a stack trace, for a
  bad option (friction 1).
- Say in the Peek prompt why a discard is or is not offered (friction 2).
- Count the play zone in `live`, or print it beside it (friction 3).
- Show Pivot's discount only on the card it will apply to (friction 4).

### Appendix: the run transcript

`bin/nvu replay design/playtests/13-five-floors-seed-10.json`:

```
  1. Floor 1 is built: 6 rooms.
  2. Turn Start phase starts.
  3. You are in: Security Turnstile.
  4. Red draws Overdrive.
  5. Red draws Charge.
  6. Red draws Shove.
  7. Red draws Charge.
  8. Red draws Shove.
  9. Gray draws Pick The Lock.
 10. Gray draws Pick The Lock.
 11. Gray draws Peek Around Corner.
 12. Gray draws Duck Under.
 13. Gray draws Pick The Lock.
 14. Turn Start phase ends.
 15. Play phase starts.
 16. Red plays Overdrive.
 17. Overdrive triggers: Red Exhausts Shove.
 18. Red pays with Shove, Exhausting it.
 19. Red plays Shove.
 20. Gray pays with Pick The Lock, Pick The Lock, Exhausting them.
 21. Gray plays Pick The Lock.
 22. Gray pays with Duck Under, Exhausting it.
 23. Gray plays Peek Around Corner.
 24. Peek Around Corner triggers: A look at the Floor deck: Security Turnstile.
 25. NOTE — Peek 1 on the Floor deck showed Security Turnstile and gave no choice to discard it or keep it. Rulebook Peek says 'Discard any number of them, then put the rest back'. Was expecting a keep/discard prompt. Also: where does a discarded Room go, if that is allowed?
 26. Play phase ends.
 27. Outcome phase starts.
 28. Scramble 5 met — Gray reveals a card reward.
 29. Oomph 5 met — Red reveals a card reward.
 30. Security Turnstile is Cleared.
 31. Security Turnstile triggers: Gray's reward pool shows I'll Take That, Hit 'n Run, Synergy Link.
 32. Gray takes Hit 'n Run into their discard pile.
 33. Security Turnstile triggers: Red's reward pool shows Brute Recycle, Momentum Shift, Momentum Shift.
 34. Red takes Momentum Shift into their discard pile.
 35. Outcome phase ends.
 36. Cleanup phase starts.
 37. Red discards Overdrive from their play zone.
 38. Red discards Shove from their play zone.
 39. Gray discards Pick The Lock from their play zone.
 40. Gray discards Peek Around Corner from their play zone.
 41. Cleanup phase ends.
 42. — end of turn 1 —
 43. Turn Start phase starts.
 44. You are in: Security Turnstile.
 45. Red draws Lean In.
 46. Red draws Shove.
 47. Red draws Charge.
 48. Gray draws Peek Around Corner.
 49. Gray draws Duck Under.
 50. Gray draws Pick The Lock.
 51. Gray draws Work The Angles.
 52. Gray draws Duck Under.
 53. Turn Start phase ends.
 54. Play phase starts.
 55. Red pays with Shove, Lean In, Exhausting them.
 56. Red plays Charge.
 57. Gray pays with Duck Under, Duck Under, Exhausting them.
 58. Gray plays Pick The Lock.
 59. Gray pays with Peek Around Corner, Exhausting it.
 60. Gray plays Work The Angles.
 61. Play phase ends.
 62. Outcome phase starts.
 63. Scramble 5 met — Gray reveals a card reward.
 64. Oomph 5 met — Red reveals a card reward.
 65. Security Turnstile is Cleared.
 66. Security Turnstile triggers: Gray's reward pool shows Pivot, Quick Vault, One Man's Junk.
 67. Gray takes Quick Vault into their discard pile.
 68. Security Turnstile triggers: Red's reward pool shows Heavy Pockets, Junk Launcher, Cross Punch.
 69. Red takes Cross Punch into their discard pile.
 70. Outcome phase ends.
 71. Cleanup phase starts.
 72. Red discards Charge from their play zone.
 73. Gray discards Pick The Lock from their play zone.
 74. Gray discards Work The Angles from their play zone.
 75. Cleanup phase ends.
 76. — end of turn 2 —
 77. Turn Start phase starts.
 78. You are in: Flooded Ventilation Shaft.
 79. Red draws Overdrive.
 80. Red draws Overdrive.
 81. Red draws Charge.
 82. Gray draws Pick The Lock.
 83. Gray draws Duck Under.
 84. Gray's deck is empty — the discard pile shuffles in to make a new one (6 cards).
 85. Gray draws Work The Angles.
 86. Gray draws Quick Vault.
 87. Gray draws Hit 'n Run.
 88. Turn Start phase ends.
 89. Play phase starts.
 90. Gray plays Quick Vault.
 91. Quick Vault triggers: Gray draws Pick The Lock.
 92. Quick Vault triggers: Gray draws Peek Around Corner.
 93. Gray pays with Peek Around Corner, Exhausting it.
 94. Gray plays Hit 'n Run.
 95. Hit 'n Run triggers: Gray shuffles 1 card back in.
 96. Gray pays with Duck Under, Exhausting it.
 97. Gray plays Work The Angles.
 98. Red plays Overdrive.
 99. Overdrive triggers: Red's deck is empty — the discard pile shuffles in to make a new one (5 cards).
100. Overdrive triggers: Red Exhausts Charge.
101. Play phase ends.
102. Outcome phase starts.
103. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
104. Flooded Ventilation Shaft is Cleared.
105. Flooded Ventilation Shaft triggers: Red's reward pool shows Brute Recycle, Set 'Em Up, Fast Follow.
106. Red takes Fast Follow into their discard pile.
107. Flooded Ventilation Shaft triggers: Gray's reward pool shows Catch Your Breath, Covering Fire, I Know Kung Fu.
108. Gray takes I Know Kung Fu into their discard pile.
109. Outcome phase ends.
110. Cleanup phase starts.
111. Red discards Overdrive from their play zone.
112. Gray discards Quick Vault from their play zone.
113. Gray discards Hit 'n Run from their play zone.
114. Gray discards Work The Angles from their play zone.
115. Cleanup phase ends.
116. — end of turn 3 —
117. Turn Start phase starts.
118. You are in: Flooded Ventilation Shaft.
119. Red draws Momentum Shift.
120. Gray draws Pick The Lock.
121. Gray draws Pick The Lock.
122. Gray's deck is empty — the discard pile shuffles in to make a new one (4 cards).
123. Gray draws Hit 'n Run.
124. Turn Start phase ends.
125. Play phase starts.
126. Gray pays with Pick The Lock, Pick The Lock, Exhausting them.
127. Gray plays Pick The Lock.
128. Red plays Overdrive.
129. Overdrive triggers: Red Exhausts Cross Punch.
130. Play phase ends.
131. Outcome phase starts.
132. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
133. Flooded Ventilation Shaft is Cleared.
134. Flooded Ventilation Shaft triggers: Red's reward pool shows Second Wind, Rhythm & Bruise, Rhythm & Bruise.
135. Red takes Rhythm & Bruise into their discard pile.
136. Flooded Ventilation Shaft triggers: Gray's reward pool shows Pivot, Pack Mule, Quick Vault.
137. Gray takes Quick Vault into their discard pile.
138. Outcome phase ends.
139. Cleanup phase starts.
140. Red discards Overdrive from their play zone.
141. Gray discards Pick The Lock from their play zone.
142. Cleanup phase ends.
143. — end of turn 4 —
144. Turn Start phase starts.
145. You are in: The Sentry Drone.
146. Red draws Overdrive.
147. Gray draws Quick Vault.
148. Gray draws I Know Kung Fu.
149. Gray draws Work The Angles.
150. Turn Start phase ends.
151. Play phase starts.
152. Gray plays Quick Vault.
153. Quick Vault triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (2 cards).
154. Quick Vault triggers: Gray draws Quick Vault.
155. Quick Vault triggers: Gray draws Pick The Lock.
156. Gray pays with I Know Kung Fu, Quick Vault, Exhausting them.
157. Gray plays Pick The Lock.
158. Gray pays with Work The Angles, Hit 'n Run, Exhausting them.
159. Gray plays Pick The Lock.
160. Red plays Overdrive.
161. Overdrive triggers: Red Exhausts Shove.
162. Red pays with Charge, Exhausting it.
163. Red plays Momentum Shift.
164. NOTE — Stairwell turn: I spent Gray's whole hand to reach Scramble 8 (Exhaust is free on the Ascend turn, since Ascend shuffles the Exhaust pile back). Gray now shows live 0: hand, deck and discard all empty, two Picks in the play zone. Rulebook 9 says that is Down, but does not say WHEN Down is checked. The game did not end. Is Down checked only at draw, at Cleanup, or at any moment?
165. Momentum Shift triggers: Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
166. Momentum Shift triggers: Red draws Fast Follow.
167. Momentum Shift triggers: Red draws Overdrive.
168. Momentum Shift triggers: Red Exhausts Charge.
169. Red plays Fast Follow.
170. Play phase ends.
171. Outcome phase starts.
172. Oomph 8 met — Ascend, and both players reveal a card reward.
173. Scramble 8 met — Ascend, and both players may Scrap a card from their hand or discard pile.
174. The Sentry Drone is Cleared.
175. The Sentry Drone triggers: Red's reward pool shows Fast Follow, It Pays To Be Reckless, Tag Team.
176. Red takes It Pays To Be Reckless into their discard pile.
177. The Sentry Drone triggers: Gray's reward pool shows I Know Kung Fu, Pack Mule, Sharing Is Caring.
178. Gray takes I Know Kung Fu into their discard pile.
179. Outcome phase ends.
180. Cleanup phase starts.
181. Red discards Overdrive from their play zone.
182. Red discards Momentum Shift from their play zone.
183. Red discards Fast Follow from their play zone.
184. Gray discards Quick Vault from their play zone.
185. Gray discards Pick The Lock from their play zone.
186. Gray discards Pick The Lock from their play zone.
187. Cleanup phase ends.
188. — end of turn 5 —
189. Floor 1 is clear.
190. Red shuffles 15 cards back in.
191. Gray shuffles 17 cards back in.
192. Floor 2 is built: 6 rooms.
193. NOTE — Floor 1 done in 5 turns, no Flee. Drone came 5th of 6. Spent heavily on the Ascend turn because Ascend refunds Exhaust; that makes the stairwell turn the cheapest turn on the floor, which feels backwards.
194. Turn Start phase starts.
195. You are in: Security Turnstile.
196. Red draws Overdrive.
197. Red draws Fast Follow.
198. Red draws It Pays To Be Reckless.
199. Red draws Charge.
200. Red draws Overdrive.
201. Gray draws Hit 'n Run.
202. Gray draws Quick Vault.
203. Gray draws Pick The Lock.
204. Gray draws Quick Vault.
205. Gray draws Duck Under.
206. Turn Start phase ends.
207. Play phase starts.
208. Red plays Overdrive.
209. Overdrive triggers: Red Exhausts Shove.
210. Red plays It Pays To Be Reckless.
211. It Pays To Be Reckless triggers: Red Exhausts Shove.
212. Gray pays with Duck Under, Exhausting it.
213. Gray plays Hit 'n Run.
214. Hit 'n Run triggers: Gray shuffles 1 card back in.
215. NOTE — Hit 'n Run paid with Duck Under shuffles that same Duck Under back: the card costs nothing net. Payment resolves before the card's text, so its own payment is in the Exhaust pile. Intended?
216. Play phase ends.
217. Outcome phase starts.
218. Scramble 5 met — Gray reveals a card reward.
219. Oomph 5 met — Red reveals a card reward.
220. Security Turnstile is Cleared.
221. Security Turnstile triggers: Gray's reward pool shows Catch Your Breath, In Step, Hit 'n Run.
222. Gray takes Hit 'n Run into their discard pile.
223. Security Turnstile triggers: Red's reward pool shows Junk Launcher, Heavy Pockets, Reckless Swing.
224. Red takes Reckless Swing into their discard pile.
225. Outcome phase ends.
226. Cleanup phase starts.
227. Red discards Overdrive from their play zone.
228. Red discards It Pays To Be Reckless from their play zone.
229. Gray discards Hit 'n Run from their play zone.
230. Cleanup phase ends.
231. — end of turn 6 —
232. Turn Start phase starts.
233. You are in: Flooded Ventilation Shaft.
234. Red draws Lean In.
235. Red draws Charge.
236. Gray draws Pick The Lock.
237. Gray draws Duck Under.
238. Turn Start phase ends.
239. Play phase starts.
240. Gray plays Quick Vault.
241. Quick Vault triggers: Gray draws Duck Under.
242. Quick Vault triggers: Gray draws Pick The Lock.
243. Red plays Fast Follow.
244. Gray pays with Duck Under, Duck Under, Exhausting them.
245. Gray plays Pick The Lock.
246. Play phase ends.
247. Outcome phase starts.
248. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
249. Flooded Ventilation Shaft is Cleared.
250. Flooded Ventilation Shaft triggers: Red's reward pool shows Fast Follow, Tag Team, Reckless Swing.
251. Red takes Tag Team into their discard pile.
252. Flooded Ventilation Shaft triggers: Gray's reward pool shows I'll Take That, In Step, Synergy Link.
253. Gray takes I'll Take That into their discard pile.
254. Outcome phase ends.
255. Cleanup phase starts.
256. Red discards Fast Follow from their play zone.
257. Gray discards Quick Vault from their play zone.
258. Gray discards Pick The Lock from their play zone.
259. Cleanup phase ends.
260. — end of turn 7 —
261. Turn Start phase starts.
262. You are in: Flooded Ventilation Shaft.
263. Red draws Momentum Shift.
264. Gray draws Work The Angles.
265. Gray draws Peek Around Corner.
266. Turn Start phase ends.
267. Play phase starts.
268. Gray plays Quick Vault.
269. Quick Vault triggers: Gray draws Duck Under.
270. Quick Vault triggers: Gray draws Duck Under.
271. Gray pays with Duck Under, Duck Under, Exhausting them.
272. Gray plays Pick The Lock.
273. Red plays Overdrive.
274. Overdrive triggers: Red Exhausts Charge.
275. Play phase ends.
276. Outcome phase starts.
277. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
278. Flooded Ventilation Shaft is Cleared.
279. Flooded Ventilation Shaft triggers: Red's reward pool shows Break Through, Reckless Swing, Break Through.
280. Red takes Reckless Swing into their discard pile.
281. Flooded Ventilation Shaft triggers: Gray's reward pool shows One Man's Junk, Hack the Doors, Covering Fire.
282. Gray takes Hack the Doors into their discard pile.
283. Outcome phase ends.
284. Cleanup phase starts.
285. Red discards Overdrive from their play zone.
286. Gray discards Quick Vault from their play zone.
287. Gray discards Pick The Lock from their play zone.
288. Cleanup phase ends.
289. — end of turn 8 —
290. Turn Start phase starts.
291. You are in: The Sentry Drone.
292. Red draws Shove.
293. Gray draws Pick The Lock.
294. Gray draws Peek Around Corner.
295. Turn Start phase ends.
296. Play phase starts.
297. Red pays with Shove, Exhausting it.
298. Red plays Momentum Shift.
299. Momentum Shift triggers: Red draws Cross Punch.
300. Momentum Shift triggers: Red draws Shove.
301. Momentum Shift triggers: Red Exhausts Shove.
302. Red pays with Lean In, Charge, Exhausting them.
303. Red plays Charge.
304. Play phase ends.
305. Outcome phase starts.
306. Oomph 8 met — Ascend, and both players reveal a card reward.
307. The Sentry Drone is Cleared.
308. The Sentry Drone triggers: Red's reward pool shows Cross Punch, Bull Rush, Bull Rush.
309. Red takes Bull Rush into their discard pile.
310. The Sentry Drone triggers: Gray's reward pool shows Zen Mode, Hack the Doors, I'll Take That.
311. Gray takes Zen Mode into their discard pile.
312. Outcome phase ends.
313. Cleanup phase starts.
314. Red discards Momentum Shift from their play zone.
315. Red discards Charge from their play zone.
316. Cleanup phase ends.
317. — end of turn 9 —
318. Floor 2 is clear.
319. Red shuffles 18 cards back in.
320. Gray shuffles 18 cards back in.
321. Floor 3 is built: 6 rooms.
322. NOTE — Floor 2 done in 4 turns (6-9), no Flee. Floors 1-2 cost nothing lasting: tier 1 rooms are all reward, and Exhaust refunds at each Ascend.
323. Turn Start phase starts.
324. You are in: Automated Defense Turret.
325. Red draws Shove.
326. Red draws Cross Punch.
327. Red draws Charge.
328. Red draws Tag Team.
329. Red draws Lean In.
330. Gray draws Pick The Lock.
331. Gray draws Pick The Lock.
332. Gray draws I Know Kung Fu.
333. Gray draws Quick Vault.
334. Gray draws I Know Kung Fu.
335. Turn Start phase ends.
336. Play phase starts.
337. Gray plays Quick Vault.
338. Quick Vault triggers: Gray draws Pick The Lock.
339. Quick Vault triggers: Gray draws Duck Under.
340. Red pays with Shove, Exhausting it.
341. Red plays Tag Team.
342. Tag Team triggers: Red draws Charge.
343. Tag Team triggers: Gray draws Zen Mode.
344. Gray pays with Duck Under, Exhausting it.
345. Gray plays Zen Mode.
346. Zen Mode stops it: Gray Exhausts nothing.
347. Gray plays Pick The Lock.
348. NOTE — Zen Mode in play: Gray paid Pick The Lock with Pick The Lock and I Know Kung Fu, and both payers STAYED IN HAND (not Exhausted, not discarded). So every Gray card is free while Zen Mode is in play. Card text: 'you don't exhaust cards'. Rulebook Play: pay by moving cards 'from your hand to your Exhaust pile'. Is the payment skipped (cards stay in hand), or should payers go to discard? As built it is a turn of unlimited free plays.
349. Zen Mode stops it: Gray Exhausts nothing.
350. Gray plays I Know Kung Fu.
351. Zen Mode stops it: Gray Exhausts nothing.
352. Gray plays I Know Kung Fu.
353. Red pays with Charge, Exhausting it.
354. Red plays Lean In.
355. I Know Kung Fu triggers: Gray draws Duck Under.
356. I Know Kung Fu triggers: Gray draws Pick The Lock.
357. Zen Mode stops it: Gray Exhausts nothing.
358. Gray plays Pick The Lock.
359. I Know Kung Fu triggers: Gray draws Quick Vault.
360. I Know Kung Fu triggers: Gray draws Peek Around Corner.
361. NOTE — Zen Mode plus two I Know Kung Fu: every Scramble card (Red's too) draws Gray 2, and with Zen every Gray card is free once the hand holds enough cards to name as payers. That is a loop that can play out Gray's deck. I stopped at Scramble 11. Earlier I sequenced wrong: played both Kung Fu before Pick The Lock and was refused Pick ('costs 2; you hold 1 other card') since payers must still be in hand.
362. Play phase ends.
363. Outcome phase starts.
364. Scramble 8 met — Both players get Good Stuff.
365. Oomph 10 met — Both players may Scrap a card from their hand or discard pile.
366. Automated Defense Turret is Cleared.
367. Automated Defense Turret triggers: Red reveals Good Stuff: Duct Tape & Wire, Riot Shield, Coil Of Cable.
368. Automated Defense Turret triggers: Gray reveals Good Stuff: Pry Bar, Crowbar, Stim Pack.
369. Red gets Riot Shield.
370. Red takes Riot Shield into hand.
371. Gray gets Pry Bar.
372. Gray takes Pry Bar into hand.
373. Outcome phase ends.
374. Cleanup phase starts.
375. Red discards Tag Team from their play zone.
376. Red discards Lean In from their play zone.
377. Gray discards Quick Vault from their play zone.
378. Gray discards Zen Mode from their play zone.
379. Gray discards Pick The Lock from their play zone.
380. Gray discards I Know Kung Fu from their play zone.
381. Gray discards I Know Kung Fu from their play zone.
382. Gray discards Pick The Lock from their play zone.
383. Cleanup phase ends.
384. — end of turn 10 —
385. Turn Start phase starts.
386. You are in: Overgrown Hydroponics Bay.
387. Red draws Fast Follow.
388. Red draws Momentum Shift.
389. Turn Start phase ends.
390. Play phase starts.
391. Gray plays Quick Vault.
392. Quick Vault triggers: Gray draws Peek Around Corner.
393. Quick Vault triggers: Gray draws Pick The Lock.
394. Gray pays with Peek Around Corner, Peek Around Corner, Exhausting them.
395. Gray plays Pick The Lock.
396. Gray pays with Duck Under, Pry Bar, Exhausting them.
397. Gray plays Pick The Lock.
398. Red pays with Charge, Exhausting it.
399. Red plays Riot Shield.
400. Play phase ends.
401. Outcome phase starts.
402. Scramble 11 met — Both players get Good Stuff.
403. Overgrown Hydroponics Bay is Cleared.
404. Riot Shield triggers: Red takes Riot Shield into hand.
405. Overgrown Hydroponics Bay triggers: Red reveals Good Stuff: Cutting Torch, Overcharged Battery, Cutting Torch.
406. Overgrown Hydroponics Bay triggers: Gray reveals Good Stuff: Pry Bar, Coil Of Cable, Overcharged Battery.
407. Red gets Overcharged Battery.
408. Red takes Overcharged Battery into hand.
409. Gray gets Coil Of Cable.
410. Gray takes Coil Of Cable into hand.
411. Outcome phase ends.
412. Cleanup phase starts.
413. Gray discards Quick Vault from their play zone.
414. Gray discards Pick The Lock from their play zone.
415. Gray discards Pick The Lock from their play zone.
416. Cleanup phase ends.
417. — end of turn 11 —
418. Turn Start phase starts.
419. You are in: Overgrown Hydroponics Bay.
420. Gray draws I'll Take That.
421. Gray draws Work The Angles.
422. Gray draws Hit 'n Run.
423. Turn Start phase ends.
424. Play phase starts.
425. Red pays with Cross Punch, Exhausting it.
426. Red plays Overcharged Battery.
427. Red plays Riot Shield.
428. Gray plays Coil Of Cable.
429. Gray pays with Work The Angles, Exhausting it.
430. Gray plays Hit 'n Run.
431. Hit 'n Run triggers: Gray shuffles 1 card back in.
432. Gray pays with Pick The Lock, Exhausting it.
433. Gray plays I'll Take That.
434. Play phase ends.
435. Outcome phase starts.
436. Scramble 11 met — Both players get Good Stuff.
437. Overgrown Hydroponics Bay is Cleared.
438. Riot Shield triggers: Red takes Riot Shield into hand.
439. Overgrown Hydroponics Bay triggers: Red reveals Good Stuff: Overcharged Battery, Stim Pack, A Pair Of Stitch-Em-Ups.
440. Overgrown Hydroponics Bay triggers: Gray reveals Good Stuff: Riot Shield, Pry Bar, Pry Bar.
441. Red gets Overcharged Battery.
442. Red takes Overcharged Battery into hand.
443. Gray gets Riot Shield.
444. Gray takes Riot Shield into hand.
445. Outcome phase ends.
446. Cleanup phase starts.
447. Red discards Overcharged Battery from their play zone.
448. Gray discards Coil Of Cable from their play zone.
449. Gray discards Hit 'n Run from their play zone.
450. Gray discards I'll Take That from their play zone.
451. Cleanup phase ends.
452. — end of turn 12 —
453. Turn Start phase starts.
454. You are in: Automated Defense Turret.
455. Red draws Charge.
456. Gray draws Hit 'n Run.
457. Gray draws Duck Under.
458. Gray draws Pry Bar.
459. Gray draws Duck Under.
460. Turn Start phase ends.
461. Play phase starts.
462. Red pays with Charge, Exhausting it.
463. Red plays Overcharged Battery.
464. Red plays Riot Shield.
465. Gray pays with Duck Under, Exhausting it.
466. Gray plays Riot Shield.
467. Gray pays with Duck Under, Exhausting it.
468. Gray plays Hit 'n Run.
469. Hit 'n Run triggers: Gray shuffles 1 card back in.
470. Play phase ends.
471. Outcome phase starts.
472. Scramble 8 met — Both players get Good Stuff.
473. Automated Defense Turret is Cleared.
474. Riot Shield triggers: Red takes Riot Shield into hand.
475. Riot Shield triggers: Gray takes Riot Shield into hand.
476. Automated Defense Turret triggers: Red reveals Good Stuff: Pocket Dynamo, Pocket Dynamo, Duct Tape & Wire.
477. Automated Defense Turret triggers: Gray reveals Good Stuff: Emergency Breaker, Pocket Dynamo, Duct Tape & Wire.
478. Red gets Duct Tape & Wire.
479. Red takes Duct Tape & Wire into hand.
480. Gray gets Duct Tape & Wire.
481. Gray takes Duct Tape & Wire into hand.
482. Outcome phase ends.
483. Cleanup phase starts.
484. Red discards Overcharged Battery from their play zone.
485. Gray discards Hit 'n Run from their play zone.
486. Cleanup phase ends.
487. — end of turn 13 —
488. Turn Start phase starts.
489. You are in: Gears & Glitch.
490. Red draws Rhythm & Bruise.
491. Gray draws Pick The Lock.
492. Gray draws Hack the Doors.
493. Turn Start phase ends.
494. Play phase starts.
495. Gray plays Pry Bar.
496. Gray pays with Duct Tape & Wire, Exhausting it.
497. Gray plays Riot Shield.
498. Gray pays with Pick The Lock, Exhausting it.
499. Gray plays Hack the Doors.
500. Hack the Doors triggers: A look at the Red deck: Bull Rush, Reckless Swing, It Pays To Be Reckless.
501. Red plays Fast Follow.
502. Red pays with Duct Tape & Wire, Exhausting it.
503. Red plays Momentum Shift.
504. Momentum Shift triggers: Red draws It Pays To Be Reckless.
505. Momentum Shift triggers: Red draws Bull Rush.
506. Momentum Shift triggers: Red Exhausts Rhythm & Bruise.
507. Red plays It Pays To Be Reckless.
508. It Pays To Be Reckless triggers: Red Exhausts Reckless Swing.
509. NOTE — It Pays To Be Reckless counted every Red Exhaust this turn, payments and Momentum Shift's hand Exhaust included: 3 Exhausts = +6/+6. On an Ascend turn those Exhausts are refunded, so the card is free stats exactly when it matters most.
510. Play phase ends.
511. Outcome phase starts.
512. Oomph 12 met — Ascend, and both players reveal a card reward.
513. Oomph 7 and Scramble 7 met — Ascend; one player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
514. Gears & Glitch is Cleared.
515. Riot Shield triggers: Gray takes Riot Shield into hand.
516. Gears & Glitch triggers: Red's reward pool shows Set 'Em Up, Second Wind, Brute Recycle.
517. Red takes Second Wind into their discard pile.
518. Gears & Glitch triggers: Gray's reward pool shows Synergy Link, Pivot, One Man's Junk.
519. Gray takes Pivot into their discard pile.
520. Gears & Glitch triggers: Gray's reward pool shows Catch Your Breath, Covering Fire, Pivot.
521. Gray takes Pivot into their discard pile.
522. Outcome phase ends.
523. Cleanup phase starts.
524. Red discards Fast Follow from their play zone.
525. Red discards Momentum Shift from their play zone.
526. Red discards It Pays To Be Reckless from their play zone.
527. Gray discards Pry Bar from their play zone.
528. Gray discards Hack the Doors from their play zone.
529. Cleanup phase ends.
530. — end of turn 14 —
531. Floor 3 is clear.
532. Red shuffles 18 cards back in.
533. Gray shuffles 27 cards back in.
534. Floor 4 is built: 6 rooms.
535. NOTE — Floor 3 done in 5 turns (10-14), no Flee. Gears & Glitch came 5th of 6. Both stairwell challenges met at Oomph 16 / Scramble 12.
536. Turn Start phase starts.
537. You are in: Gears & Glitch.
538. Red draws Overcharged Battery.
539. Red draws Charge.
540. Red draws Fast Follow.
541. Red draws Bull Rush.
542. Red draws Riot Shield.
543. Gray draws Quick Vault.
544. Gray draws Pick The Lock.
545. Gray draws I'll Take That.
546. Gray draws Coil Of Cable.
547. Gray draws I Know Kung Fu.
548. Turn Start phase ends.
549. Play phase starts.
550. Gray plays Quick Vault.
551. Quick Vault triggers: Gray draws Pick The Lock.
552. Quick Vault triggers: Gray draws Hit 'n Run.
553. Gray pays with Pick The Lock, Exhausting it.
554. Gray plays I Know Kung Fu.
555. Gray plays Coil Of Cable.
556. I Know Kung Fu triggers: Gray draws Pivot.
557. Red plays Fast Follow.
558. Red pays with Charge, Exhausting it.
559. Red plays Overcharged Battery.
560. I Know Kung Fu triggers: Gray draws Pick The Lock.
561. Gray plays Pivot.
562. I Know Kung Fu triggers: Gray draws Quick Vault.
563. Red plays Riot Shield.
564. I Know Kung Fu triggers: Gray draws Work The Angles.
565. NOTE — Floor 4: Gears & Glitch was the FIRST flip. Cleared both challenges at 12/10 on turn 15, so floor 4 is one turn and its 5 Rooms (and their rewards) are never seen. With 6-card floors, stairwell position swings a floor from 1 turn to 6.
566. Play phase ends.
567. Outcome phase starts.
568. Oomph 12 met — Ascend, and both players reveal a card reward.
569. Oomph 7 and Scramble 7 met — Ascend; one player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
570. Gears & Glitch is Cleared.
571. Riot Shield triggers: Red takes Riot Shield into hand.
572. Gears & Glitch triggers: Red's reward pool shows Momentum Shift, Heavy Pockets, Junk Launcher.
573. Red takes Momentum Shift into their discard pile.
574. Gears & Glitch triggers: Gray's reward pool shows Pack Mule, Pack Mule, Sharing Is Caring.
575. Gray takes Pack Mule into their discard pile.
576. Gears & Glitch triggers: Red's reward pool shows Brute Recycle, Set 'Em Up, Second Wind.
577. Red takes Second Wind into their discard pile.
578. Outcome phase ends.
579. Cleanup phase starts.
580. Red discards Fast Follow from their play zone.
581. Red discards Overcharged Battery from their play zone.
582. Gray discards Quick Vault from their play zone.
583. Gray discards I Know Kung Fu from their play zone.
584. Gray discards Coil Of Cable from their play zone.
585. Gray discards Pivot from their play zone.
586. Cleanup phase ends.
587. — end of turn 15 —
588. Floor 4 is clear.
589. Red shuffles 7 cards back in.
590. Gray shuffles 12 cards back in.
591. Floor 5 is built: 6 rooms.
592. Turn Start phase starts.
593. You are in: Bio-Hazard Containment Vault.
594. Red draws Overdrive.
595. Red draws Shove.
596. Red draws Overcharged Battery.
597. Red draws Fast Follow.
598. Red draws Overcharged Battery.
599. Gray draws Pack Mule.
600. Gray draws I'll Take That.
601. Gray draws Peek Around Corner.
602. Gray draws Quick Vault.
603. Gray draws Quick Vault.
604. Turn Start phase ends.
605. Play phase starts.
606. Gray plays Quick Vault.
607. Quick Vault triggers: Gray draws Pick The Lock.
608. Quick Vault triggers: Gray draws Pick The Lock.
609. Gray plays Quick Vault.
610. Quick Vault triggers: Gray draws Pry Bar.
611. Quick Vault triggers: Gray draws Peek Around Corner.
612. Red pays with Shove, Exhausting it.
613. Red plays Overcharged Battery.
614. Gray plays Pick The Lock.
615. Red pays with Overdrive, Exhausting it.
616. Red plays Overcharged Battery.
617. Gray plays Pack Mule.
618. Gray pays with Peek Around Corner, Peek Around Corner, Exhausting them.
619. Gray plays Pick The Lock.
620. Gray pays with Pry Bar, Exhausting it.
621. Gray plays I'll Take That.
622. NOTE — Bio-Hazard Vault Scramble 16 with no Scrap: Overcharged Battery's 'next card played this turn' applies to the partner's card too (Gray's Pick The Lock and Pack Mule went free). Two Batteries made two Gray cards free. Reading the card, 'next card played' is not limited to Red, so it matches; flagging it as the strongest cross-player lever in the run.
623. Play phase ends.
624. Outcome phase starts.
625. Scramble 15 met — One player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
626. Bio-Hazard Containment Vault is Cleared.
627. Bio-Hazard Containment Vault triggers: Red's reward pool shows Rhythm & Bruise, Fast Follow, Tag Team.
628. Red takes Tag Team into their discard pile.
629. Outcome phase ends.
630. Cleanup phase starts.
631. Red discards Overcharged Battery from their play zone.
632. Red discards Overcharged Battery from their play zone.
633. Gray discards Quick Vault from their play zone.
634. Gray discards Quick Vault from their play zone.
635. Gray discards Pick The Lock from their play zone.
636. Gray discards Pack Mule from their play zone.
637. Gray discards Pick The Lock from their play zone.
638. Gray discards I'll Take That from their play zone.
639. Cleanup phase ends.
640. — end of turn 16 —
641. Turn Start phase starts.
642. You are in: Bio-Hazard Containment Vault.
643. Red draws Charge.
644. Red draws Momentum Shift.
645. Red draws Reckless Swing.
646. Red draws Overdrive.
647. Gray draws Hit 'n Run.
648. Gray draws Pivot.
649. Gray draws Pivot.
650. Gray draws Duck Under.
651. Gray draws Coil Of Cable.
652. Turn Start phase ends.
653. Play phase starts.
654. Gray plays Coil Of Cable.
655. Red plays Fast Follow.
656. Red plays Overdrive.
657. Overdrive triggers: Red Exhausts Shove.
658. Gray pays with Duck Under, Hit 'n Run, Exhausting them.
659. Gray plays Pivot.
660. Red plays Reckless Swing.
661. Reckless Swing triggers: Red Exhausts Duct Tape & Wire.
662. Red pays with Charge, Exhausting it.
663. Red plays Momentum Shift.
664. Momentum Shift triggers: Red draws Charge.
665. Momentum Shift triggers: Red draws Momentum Shift.
666. Momentum Shift triggers: Red Exhausts Charge.
667. Play phase ends.
668. Outcome phase starts.
669. Oomph 15 met — One player reveals a card reward, and the other may Scrap a card from their hand or discard pile.
670. Bio-Hazard Containment Vault is Cleared.
671. Bio-Hazard Containment Vault triggers: Gray's reward pool shows Catch Your Breath, In Step, In Step.
672. Gray takes In Step into their discard pile.
673. Outcome phase ends.
674. Cleanup phase starts.
675. Red discards Fast Follow from their play zone.
676. Red discards Overdrive from their play zone.
677. Red discards Reckless Swing from their play zone.
678. Red discards Momentum Shift from their play zone.
679. Gray discards Coil Of Cable from their play zone.
680. Gray discards Pivot from their play zone.
681. Cleanup phase ends.
682. — end of turn 17 —
683. Turn Start phase starts.
684. You are in: Laser Grid Security Hall.
685. Red draws It Pays To Be Reckless.
686. Red draws Charge.
687. Red draws Lean In.
688. Red draws Bull Rush.
689. Gray draws Pick The Lock.
690. Gray draws Zen Mode.
691. Gray draws I Know Kung Fu.
692. Gray draws Hit 'n Run.
693. Turn Start phase ends.
694. Play phase starts.
695. Gray pays with Hit 'n Run, Exhausting it.
696. Gray plays Zen Mode.
697. Zen Mode stops it: Gray Exhausts nothing.
698. Gray plays I Know Kung Fu.
699. Red pays with Charge, Exhausting it.
700. Red plays Lean In.
701. I Know Kung Fu triggers: Gray draws Work The Angles.
702. Red pays with Momentum Shift, Exhausting it.
703. Red plays Bull Rush.
704. I Know Kung Fu triggers: Gray draws Pick The Lock.
705. Zen Mode stops it: Gray Exhausts nothing.
706. Gray plays Pick The Lock.
707. I Know Kung Fu triggers: Gray draws Hack the Doors.
708. Zen Mode stops it: Gray Exhausts nothing.
709. Gray plays Pick The Lock.
710. I Know Kung Fu triggers: Gray draws I Know Kung Fu.
711. Zen Mode stops it: Gray Exhausts nothing.
712. Gray plays Hack the Doors.
713. Hack the Doors triggers: A look at the Floor deck: The Monolith Core, Smoldering Armory, Laser Grid Security Hall.
714. I Know Kung Fu triggers: Gray draws Duck Under.
715. NOTE — Hack the Doors on the Floor deck: saw Monolith Core, Smoldering Armory, Laser Grid and could reorder but was not offered a discard (on Red's deck, turn 14, it offered one). Peek 1 on the Floor deck, turn 1, offered neither. Rulebook Peek: 'Discard any number of them, then put the rest back in any order.' Is the Floor deck exempt from the discard? Put Monolith on top: Peek lets the team pick when the floor boss arrives.
716. Play phase ends.
717. Outcome phase starts.
718. Scramble 14 met — Both players reveal a card reward.
719. Laser Grid Security Hall is Cleared.
720. Laser Grid Security Hall triggers: Red's reward pool shows Junk Launcher, Heavy Pockets, Fast Follow.
721. Red takes Heavy Pockets into their discard pile.
722. Laser Grid Security Hall triggers: Gray's reward pool shows Synergy Link, One Man's Junk, Covering Fire.
723. Gray takes Synergy Link into their discard pile.
724. Outcome phase ends.
725. Cleanup phase starts.
726. Red discards Lean In from their play zone.
727. Red discards Bull Rush from their play zone.
728. Gray discards Zen Mode from their play zone.
729. Gray discards I Know Kung Fu from their play zone.
730. Gray discards Pick The Lock from their play zone.
731. Gray discards Pick The Lock from their play zone.
732. Gray discards Hack the Doors from their play zone.
733. Cleanup phase ends.
734. — end of turn 18 —
735. Turn Start phase starts.
736. You are in: The Monolith Core.
737. Red draws Shove.
738. Red draws Overdrive.
739. Red draws Rhythm & Bruise.
740. Red draws Shove.
741. Gray draws Duck Under.
742. Turn Start phase ends.
743. Play phase starts.
744. Gray pays with Duck Under, Exhausting it.
745. Gray plays Duck Under.
746. Red plays Overdrive.
747. Overdrive triggers: Red Exhausts Riot Shield.
748. Red pays with Shove, Shove, Exhausting them.
749. Red plays Rhythm & Bruise.
750. Red plays It Pays To Be Reckless.
751. It Pays To Be Reckless triggers: Red Exhausts Reckless Swing.
752. NOTE — Monolith Core on turn 19 at Oomph 13 / Scramble 10, exactly the Scramble needed. It Pays To Be Reckless gave +8/+8 off four Red Exhausts (Overdrive, two Shoves paying Rhythm & Bruise, its own). The win came because Hack the Doors let me stack the Monolith on top of a turn where both hands were ready.
753. Play phase ends.
754. Outcome phase starts.
755. Oomph 10 and Scramble 10 met — You Win!
756. The Monolith Core is Cleared.
757. Outcome phase ends.
758. Cleanup phase starts.
759. Red discards Overdrive from their play zone.
760. Red discards Rhythm & Bruise from their play zone.
761. Red discards It Pays To Be Reckless from their play zone.
762. Gray discards Duck Under from their play zone.
763. Cleanup phase ends.
764. — end of turn 19 —
765. Floor 5 is clear.
766. You reach the rooftop. You win.

Floor 5 · turn 19 · GameOver   floor deck 2, cleared 19   Good Stuff 43, Bad Stuff 18
Red: live 18 (deck 5, discard 13, hand 0), exhaust 12
Gray: live 23 (deck 4, discard 16, hand 3), exhaust 7
    Pivot [cost 2; Oomph 2, Scramble 3] — The next card Red plays this turn costs 1 fewer card to play.
    Work The Angles [cost 1; Oomph 1, Scramble 1]
    I Know Kung Fu [cost 1; Oomph 5] — Play: every time a Scramble card is played this turn, you may draw a card.
Outcome: Victory

seed 10, 216 commands replayed, recorded on R34.C58-v1, floor 5, turn 19, Victory.
```

## Run: Seed 12, five floors of six cards

Recorded 2026-10-19. Kit revision R34.C58-v1. Played by an agent standing in for a human
playtester, in the CLI (`bin/nvu`), seed 12, run file `design/playtests/13-five-floors-seed-12.json`. The run ended in
**Defeat** on turn 6, floor 1: Red went Down to an Overdrive's Exhaust 1 on the same play that put
the Stat pool at Oomph 10 against The Sentry Drone's Oomph 8.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `rulebook.md` and `cards.yaml` only;
the engine was not read.

### How the run went

Floor 1 (turns 1-6). Turn 1, Flooded Ventilation Shaft: Overdrive plus Pick The Lock met Oomph 3 and
Scramble 3. Red took Bull Rush, Gray took Quick Vault. Turn 2, Security Turnstile: two Overdrives
met Oomph 5 and Red took Set 'Em Up. I skipped Gray's Scramble 5 line to save Gray's hand.

Turn 3 flipped The Sentry Drone, the third of six cards. Starter hands cannot reach it: Red's best
was Oomph 6 because every Charge needs two payers, Gray added 1, and Scramble topped out at 6. I
Fled with nothing played (note 1). The Flee gave Red Sluggish and Gray Rust. Sluggish raised its own
cost to 3 (note 2).

Turn 4, the Shaft again. Red was stuck at a hand of 6 and could only pay. Shove plus Gray's Work The
Angles and Duck Under met it for 4 Exhausts in total, against 2 for the Flee. Red took Cross Punch,
Gray took I Know Kung Fu.

Turn 5, the Drone again with 4 cards in the floor deck, and still out of reach (Oomph 4, Scramble
6). Red's hand would have stayed at 5 or more with Sluggish plus new Bad Stuff, so Red would draw
nothing next turn. I paid 3 to Scrap Sluggish, then Fled (note 3). The Flee gave Red System
Feedback and Gray My Head Is Quantum Spinning. Red was at 6 live cards.

Turn 6, the Drone a third time with 3 cards in the floor deck. Red's hand was Bull Rush, System
Feedback, Overdrive, Overdrive, Set 'Em Up, deck 1, discard 0. Overdrive (net Oomph 2 after
System Feedback), then Bull Rush paid with Set 'Em Up (+3 for the deck Exhaust) put the pool at
Oomph 7. The second Overdrive made it Oomph 10, but its Exhaust 1 found an empty deck and an empty
discard, and the engine put Red Down with System Feedback still in hand (note 4).

### Notes

1. **Drone out of reach on turn 3.** `[agent]` (log 64)
   > Sentry Drone flipped 3rd on floor 1. Red max is Oomph 6 from Charge x3 + Shove x2 (every Charge needs 2 payers), Gray adds 1. Scramble max 6. Fleeing without playing anything: playing partial would just waste cards.

   Floor 1 is now 6 cards, so the Stairwell comes early often. A starter hand of five tops out at
   Oomph 7 or Scramble 6 here, so a turn-1 to turn-3 Drone is a forced Flee. Shape, not a bug.

2. **Sluggish taxes itself.** `[agent]` (log 79)
   > Sluggish shows cost 3 (printed 2): its own Holding raises its own cost to Scrap it. Is that intended? Rulebook says Holding applies while the card is in hand, so it seems to follow, but it makes getting rid of Sluggish cost 3 cards.

   `cards.yaml`: "Holding: Cards you play cost +1 card to play." The rulebook says a Holding effect
   applies while the card is in hand, and Sluggish is in hand when you play it. The reading holds.
   Question for the designer: is Sluggish meant to cost 3 to clear?

3. **Clearing Sluggish to keep drawing.** `[agent]` (log 115)
   > Drone again on turn 5, still out of reach (Oomph max 4, Scramble max 6). Red's hand is 5 with Sluggish, so Red would not draw next turn and would add Bad Stuff on top. Paying 3 to Scrap Sluggish now so Red can draw again, then Fleeing.

   Draw up to five means a Bad Stuff card held in a full hand blocks a draw every turn. Each Drone
   Flee adds one more. Two Flees on a Stairwell put both players into this spiral by turn 5.

4. **Down with a card in hand.** `[agent]` (log 149)
   > Red went Down while still holding System Feedback in hand. Section 9 says Down is no cards in hand, deck or discard. I played the 2nd Overdrive expecting Exhaust 1 from an empty deck and empty discard to do nothing, for Oomph 9 and the Ascend. Also: Scramble showed 1 after Bull Rush (+2) though the pool showed Scramble 0 before; System Feedback's -1 from Overdrive seems to have been held as -1 below zero.

   Rulebook section 9: "If one player has no cards in their hand, deck, or discard pile, you go
   `Down`." Red held System Feedback. The keyword `Exhaust X cards from your deck` only says "If your
   deck is empty, see `Empty deck`", and Empty Deck only reshuffles the discard. The intro says "If
   you need a card and have none left, you go `Down`", which fits the engine, but section 9 does not.
   Playtest 10 quotes an older Going Down line ("If you must draw or Exhaust a card and your deck and
   discard pile are both empty, you go Down"). The engine seems to still follow that line. The final
   table also shows the Oomph 8 line ticked at Oomph 10 with the outcome Defeat, and the log
   discards System Feedback from hand after the Down, which playtest 10 also saw.

   On the Scramble: the pool read Oomph 2, Scramble 0 after System Feedback's -1/-1, then Scramble 1
   after Bull Rush's Scramble 2. Card anatomy floors card numbers at zero but says nothing about the
   Stat pool. Question: can the pool go below zero, and if so, should the table show it?

### What the run showed

- The R34 rulebook and the engine disagree on when a player goes Down. Under section 9 this run was
  a Victory on floor 1, turn 6. Under the engine it was a Defeat.
- A 6-card floor deck with the Stairwell shuffled back after each Flee brings the Stairwell back
  fast: the Drone came on turns 3, 5 and 6, with 4, 3 and 3 cards in the deck. Each Drone Flee costs
  an Exhaust and a Bad Stuff per player, so a Stairwell drawn before the deck has grown is a cost
  spiral, not a delay.
- Starter decks cannot meet a floor 1 Stairwell's 8 alone. The run had to buy reward cards with
  Exhausts to have a chance, which left Red at 6 live cards by turn 6.

### The CLI as a playtest tool

Friction, worst first:

1. No warning before a move that ends the run. The move list offered `card Red Overdrive` with Red's
   deck and discard empty and gave no hint that it was fatal. A line like "Exhaust 1 will put Red
   Down" would have caught it.
2. An unknown option prints a raw Node `TypeError` stack trace with `app/src` paths, not a usage
   line. I hit it passing `--run` through a shell variable.
3. `live` excludes the play zone, so mid-turn counts drop and jump back at Cleanup (Red read live 8,
   then 11). The Stat pool also hides a below-zero value (note 4).
4. A hand of 5 or more draws nothing at Turn Start, and the log says nothing. A line such as "Red
   holds 6, draws none" would help.

Got right: the move list with payers spelled out made every turn fast to plan. Printed cost next to
modified cost (`cost 3 (printed 2)`) made Sluggish's effect plain. `bin/nvu card` answered every
reward choice in one call.

### Candidate issues

Engine mismatches:
- Down on an Exhaust from an empty deck and discard while the hand holds a card. Rulebook section 9
  says Down needs an empty hand too (note 4).

Rulebook questions:
- Does Exhaust from an empty deck with an empty discard do anything? The keyword and Empty Deck do
  not say. The intro line and section 9 read differently.
- Can the Stat pool go below zero, and does a below-zero value carry (note 4)?
- Is Sluggish meant to raise its own cost (note 2)?
- What happens to the hand at Down (seen again, as in playtest 10)?

Tuning-independent shape:
- A Stairwell flipped in the first three turns of floor 1 is a forced Flee, and on a 6-card floor
  it returns quickly. The run spent 3 of 6 turns on the Drone.
- Bad Stuff held in a full hand blocks draws, so each Stairwell Flee compounds.

Card observations, for a later re-tune:
- The Sentry Drone's 8 is above any five-card starter hand (Oomph 7, Scramble 6 here).
- Overdrive's free Oomph 3 drains a 12-card deck fast. Red used it 4 times in 6 turns.

### Appendix: the run transcript

Run file: `design/playtests/13-five-floors-seed-12.json`, output of `bin/nvu replay design/playtests/13-five-floors-seed-12.json`.

```
  1. Floor 1 is built: 6 rooms.
  2. Turn Start phase starts.
  3. You are in: Flooded Ventilation Shaft.
  4. Red draws Charge.
  5. Red draws Charge.
  6. Red draws Overdrive.
  7. Red draws Shove.
  8. Red draws Overdrive.
  9. Gray draws Duck Under.
 10. Gray draws Duck Under.
 11. Gray draws Pick The Lock.
 12. Gray draws Duck Under.
 13. Gray draws Pick The Lock.
 14. Turn Start phase ends.
 15. Play phase starts.
 16. Red plays Overdrive.
 17. Overdrive triggers: Red Exhausts Charge.
 18. Gray pays with Duck Under, Duck Under, Exhausting them.
 19. Gray plays Pick The Lock.
 20. Play phase ends.
 21. Outcome phase starts.
 22. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
 23. Flooded Ventilation Shaft is Cleared.
 24. Flooded Ventilation Shaft triggers: Red's reward pool shows Bull Rush, Reckless Swing, Second Wind.
 25. Red takes Bull Rush into their discard pile.
 26. Flooded Ventilation Shaft triggers: Gray's reward pool shows In Step, Quick Vault, Pack Mule.
 27. Gray takes Quick Vault into their discard pile.
 28. Outcome phase ends.
 29. Cleanup phase starts.
 30. Red discards Overdrive from their play zone.
 31. Gray discards Pick The Lock from their play zone.
 32. Cleanup phase ends.
 33. — end of turn 1 —
 34. Turn Start phase starts.
 35. You are in: Security Turnstile.
 36. Red draws Overdrive.
 37. Gray draws Pick The Lock.
 38. Gray draws Peek Around Corner.
 39. Gray draws Work The Angles.
 40. Turn Start phase ends.
 41. Play phase starts.
 42. Red plays Overdrive.
 43. Overdrive triggers: Red Exhausts Shove.
 44. Red plays Overdrive.
 45. Overdrive triggers: Red Exhausts Lean In.
 46. Play phase ends.
 47. Outcome phase starts.
 48. Oomph 5 met — Red reveals a card reward.
 49. Security Turnstile is Cleared.
 50. Security Turnstile triggers: Red's reward pool shows Heavy Pockets, Set 'Em Up, Junk Launcher.
 51. Red takes Set 'Em Up into their discard pile.
 52. Outcome phase ends.
 53. Cleanup phase starts.
 54. Red discards Overdrive from their play zone.
 55. Red discards Overdrive from their play zone.
 56. Cleanup phase ends.
 57. — end of turn 2 —
 58. Turn Start phase starts.
 59. You are in: The Sentry Drone.
 60. Red draws Charge.
 61. Red draws Shove.
 62. Turn Start phase ends.
 63. Play phase starts.
 64. NOTE — Sentry Drone flipped 3rd on floor 1. Red max is Oomph 6 from Charge x3 + Shove x2 (every Charge needs 2 payers), Gray adds 1. Scramble max 6. Fleeing without playing anything: playing partial would just waste cards.
 65. Play phase ends.
 66. Outcome phase starts.
 67. You Flee The Sentry Drone.
 68. The Sentry Drone triggers: Red Exhausts Shove.
 69. The Sentry Drone triggers: Gray Exhausts Pick The Lock.
 70. The Sentry Drone triggers: Red gets Sluggish.
 71. The Sentry Drone triggers: Red takes Sluggish into hand.
 72. The Sentry Drone triggers: Gray gets Rust.
 73. The Sentry Drone triggers: Gray takes Rust into hand.
 74. Outcome phase ends.
 75. Cleanup phase starts.
 76. The Sentry Drone shuffles back into the Floor deck.
 77. Cleanup phase ends.
 78. — end of turn 3 —
 79. NOTE — Sluggish shows cost 3 (printed 2): its own Holding raises its own cost to Scrap it. Is that intended? Rulebook says Holding applies while the card is in hand, so it seems to follow, but it makes getting rid of Sluggish cost 3 cards.
 80. Turn Start phase starts.
 81. You are in: Flooded Ventilation Shaft.
 82. Turn Start phase ends.
 83. Play phase starts.
 84. Gray pays with Pick The Lock, Exhausting it.
 85. Gray plays Work The Angles.
 86. Gray pays with Peek Around Corner, Exhausting it.
 87. Gray plays Duck Under.
 88. Red pays with Charge, Charge, Exhausting them.
 89. Red plays Shove.
 90. Play phase ends.
 91. Outcome phase starts.
 92. Oomph 3 and Scramble 3 met — Both players reveal a card reward.
 93. Flooded Ventilation Shaft is Cleared.
 94. Flooded Ventilation Shaft triggers: Red's reward pool shows Cross Punch, Second Wind, Momentum Shift.
 95. Red takes Cross Punch into their discard pile.
 96. Flooded Ventilation Shaft triggers: Gray's reward pool shows I Know Kung Fu, Covering Fire, Synergy Link.
 97. Gray takes I Know Kung Fu into their discard pile.
 98. Outcome phase ends.
 99. Cleanup phase starts.
100. Red discards Shove from their play zone.
101. Gray discards Work The Angles from their play zone.
102. Gray discards Duck Under from their play zone.
103. Cleanup phase ends.
104. — end of turn 4 —
105. Turn Start phase starts.
106. You are in: The Sentry Drone.
107. Red's deck is empty — the discard pile shuffles in to make a new one (7 cards).
108. Red draws Shove.
109. Red draws Bull Rush.
110. Gray draws Pick The Lock.
111. Gray draws Duck Under.
112. Gray draws Peek Around Corner.
113. Turn Start phase ends.
114. Play phase starts.
115. NOTE — Drone again on turn 5, still out of reach (Oomph max 4, Scramble max 6). Red's hand is 5 with Sluggish, so Red would not draw next turn and would add Bad Stuff on top. Paying 3 to Scrap Sluggish now so Red can draw again, then Fleeing.
116. Red pays with Charge, Shove, Shove, Exhausting them.
117. Sluggish is Scrapped.
118. Play phase ends.
119. Outcome phase starts.
120. You Flee The Sentry Drone.
121. The Sentry Drone triggers: Red Exhausts Overdrive.
122. The Sentry Drone triggers: Gray's deck is empty — the discard pile shuffles in to make a new one (5 cards).
123. The Sentry Drone triggers: Gray Exhausts Pick The Lock.
124. The Sentry Drone triggers: Red gets System Feedback.
125. The Sentry Drone triggers: Red takes System Feedback into hand.
126. The Sentry Drone triggers: Gray gets My Head Is Quantum Spinning.
127. The Sentry Drone triggers: Gray takes My Head Is Quantum Spinning into hand.
128. Outcome phase ends.
129. Cleanup phase starts.
130. The Sentry Drone shuffles back into the Floor deck.
131. Cleanup phase ends.
132. — end of turn 5 —
133. Turn Start phase starts.
134. You are in: The Sentry Drone.
135. Red draws Overdrive.
136. Red draws Overdrive.
137. Red draws Set 'Em Up.
138. Turn Start phase ends.
139. Play phase starts.
140. Red plays Overdrive.
141. Overdrive triggers: Red Exhausts Cross Punch.
142. Red pays with Set 'Em Up, Exhausting it.
143. Red plays Bull Rush.
144. Red plays Overdrive.
145. Overdrive triggers: Red is Down — Overdrive. The run is lost.
146. Overdrive triggers: Red discards System Feedback from their hand.
147. Play phase ends.
148. Overdrive triggers: You lose.
149. NOTE — Red went Down while still holding System Feedback in hand. Section 9 says Down is no cards in hand, deck or discard. I played the 2nd Overdrive expecting Exhaust 1 from an empty deck and empty discard to do nothing, for Oomph 9 and the Ascend. Also: Scramble showed 1 after Bull Rush (+2) though the pool showed Scramble 0 before; System Feedback's -1 from Overdrive seems to have been held as -1 below zero.

Floor 1 · turn 6 · GameOver   floor deck 2, cleared 3   Good Stuff 51, Bad Stuff 14
Room: The Sentry Drone (stairwell)
  ✔ Oomph 8: Ascend, and both players reveal a card reward.
    Scramble 8: Ascend, and both players may Scrap a card from their hand or discard pile.
    Flee: Both players Exhaust 1, and both players get Bad Stuff.
Stat pool: Oomph 10, Scramble 1
Red: live 1 (deck 0, discard 1, hand 0), exhaust 12  DOWN
    played: Overdrive, Bull Rush, Overdrive
Gray: live 10 (deck 4, discard 0, hand 6), exhaust 6
    Pick The Lock [cost 2; Scramble 4]
    Rust [cost 3; Bad Stuff] — Holding: Stuff cards you play have -1 Oomph and -1 Scramble. Can't be used to pay for other cards. Play: Scrap this card.
    Pick The Lock [cost 2; Scramble 4]
    Duck Under [cost 1; Scramble 2]
    Peek Around Corner [cost 1; Scramble 1] — Peek 1.
    My Head Is Quantum Spinning [cost 2; Bad Stuff] — Holding: Whenever your partner draws a card during Play, Exhaust 1. Can't be used to pay for other cards. Play: Scrap this card.
Outcome: Defeat

seed 12, 27 commands replayed, recorded on R34.C58-v1, floor 1, turn 6, Defeat.
```
