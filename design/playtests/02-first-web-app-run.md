# Playtest 2 — first web app run

Recorded: 2026-09-17. Rules version: 0.1.0. Played in the web app (`app/`), floor 1, one session, ended in a loss.

Notes are the designer's, verbatim, tagged `[you]`. Where a note was checked against the engine the
finding follows it, tagged `[agent]`. Rulings the designer made on reading those findings are tagged
`[you, 2026-09-17]` and are settled. Everything else is still a question. The rulebook
(`design/rulebook.md`) says what is true.

The run's event log is in the appendix; notes cite it by line.

## How the run went

Floor 1 built 13 rooms. Turns 1 and 2 cleared Sorting Room twice and turn 3 cleared Spill Of Cargo,
which drained the Good Stuff pool dry. Turn 4 cleared Ration Locker and every reward it owed paid
nothing, silently. Red hit Last Stand on turn 5 and went Down at that turn's Cleanup. Turn 6 turned
up the floor's Enemy room, which asks for Oomph 5 and nothing else, with Red Down and Gray holding
no Oomph at all. Gray fled, and fleeing in Last Stand is Down.

The run was already unwinnable by turn 4.

## Notes

1. **The app should have an exportable log and a way to inject playtest notes. I think our original
   prototype web thing had this — is it still around?** `[you]`

   `[agent]` It is: `prototype/encounter-sim.html` has an "Add note" box that writes into the log,
   and exports the run three ways, each stamping the settings it was played under. The web app keeps
   everything an export needs already — the session store holds the seed, the command log and the
   event log, so a run exports as replayable data rather than as text.

   `[you, 2026-09-17]` Decide what to port from the prototype, port it, then delete the prototype
   for clarity.

2. **On turn 2, why did Gray get two Good Stuff when Sorting Room cleared (Crowbar and Grav
   Harness)?** `[you]`

   `[agent]` Crowbar — *"If you get any Good Stuff this turn, get an additional one."* — is built as
   a standing trigger that listens while the card sits in a hand. It fired on its own arrival: the
   Good Stuff it counted was itself. The extra piece then landed after `Cleanup` had already printed,
   because card triggers do not resolve where they happen.

   The engine has no stack. Room outcomes are a queue, and card triggers are a second queue handed
   out once per command, at the end of it — which inside `END_PLAY` means after cleanup began.
   Nothing nests, nothing has priority.

   `[you, 2026-09-17]` Crowbar is an on-play effect, not a passive one. Its printed text should say
   so — `Play:` — and the engine should match. The trigger-timing problem is separate and general.

3. **A debug mode checkbox where I can inspect the states of all piles, regardless of whether
   they're face up (discard piles) or face down (floor deck, rewards pools, etc.)** `[you]`

4. **We seem to be not using all available space.** `[you]`

   `[agent]` The table is capped at `max-width: 1180px` and cards are a fixed 88px wide, with only
   two size tiers — full, and a compact one for narrow screens. On a wide display everything sits in
   the middle 1180px with the log stacked underneath rather than beside it.

5. **Overcharged Battery did not perform its text. It needs to reduce the costs of all cards to 0
   until the next card is played or the phase is ended. This probably needs to be a function built
   into the engine so that multiple cards can activate it. Maybe we abstract this functionality away
   from Last Stand so it can use this same mechanism as well?** `[you]`

   `[agent]` The discount exists but is scoped to the character who played the Battery. Red played
   it and then played nothing else, so it went nowhere and Gray paid full for Grav Harness
   (log 71–75). Cost already resolves in one place, and Last Stand is already a branch inside it, so
   the shared mechanism has somewhere to live.

   `[you, 2026-09-17]` This is an implementation clarification, not a ruling change. The card means
   what it says: the next card played, by either character.

6. **Why was a character asked to be chosen to draw a card after Grav Harness was played?** `[you]`

   `[agent]` Grav Harness reads *"One of you draws 1 card, (even if their hand is full)"* — the
   prompt is the "one of you", and the rule is right. The reason it read as unexplained is a display
   bug: a card face clips anything that overflows it, so Grav Harness showed no text at all and
   Crowbar showed half a sentence. The prompt came from text that could not be read.

7. **For Gray, swap the location of deck and discard piles to match Red, not mirror him. I found it
   confusing visually.** `[you]`

8. **The Good Stuff pool ran out during turn 4.** `[you]`

   `[agent]` The pool is one copy of each of the eight Good Stuff cards, for the whole run, and it
   never refills — spent Stuff is Scrapped at Ascending. Eight were gone by turn 3. Turn 4 met four
   reward lines and paid out nothing, and said nothing: taking from an empty pool is a silent no-op,
   so the log claimed rewards that were never handed over (log 108–112).

   `[you, 2026-09-17]` Add counts to the Good Stuff cards, scaled appropriately. Getting rewards is
   the best-feeling part of the game as reported by playtesters, so running out of Good Stuff is one
   of the worst things the game can do.

9. **Red was in Last Stand on turn 5 at the Draw phase.** `[you]`

   `[agent]` Floor 1 built 13 rooms — one Enemy, three Hazards, and nine Stuff rooms — against a
   12-card deck. The rulebook's Setup section says the first floor is 10 cards. At the pace played,
   Red's deck was empty on turn 5 with the Enemy room still buried.

   `[you, 2026-09-17]` The floor should be 10 rooms as the rulebook states. This is a bug.

10. **Why was Red still considered Down after Ruptured Coolant Line was cleared with the Scramble 4
    line?** `[you]`

    `[agent]` Red was not already Down — Red went Down at that Cleanup. Getting out of Last Stand
    costs Exhaust 2 off the rebuilt deck, and the rebuilt deck is your play zone. Red played nothing
    that turn, so the new deck was empty, and exhausting from an empty deck puts you Down. Clearing
    the room saved Red from the flee-in-Last-Stand rule but not from the price. The log then printed
    the two events in the wrong order: "Red is Down" before "Red gets out of last stand, 0 cards the
    poorer" (log 136–141).

    `[you, 2026-09-17]` Two problems, not one: the log order is a simple bug, and the mechanic itself
    does not hold up to this case. Last Stand was not created to solve a particular problem and is
    creating several, so whether to keep it is now open.

11. **Torn Seal should cost something to remove from your hand; we should make it cost 1 at least.**
    `[you]`

    `[agent]` It already costs 2. It read as free because Gray was in Last Stand, where every card
    ignores its cost.

    `[you, 2026-09-17]` Nothing to do.

12. **On turn 6 we saw the Enemy when Red was already Down, but the Enemy required only Oomph to
    succeed. Gray doesn't have enough cards that grant this, especially this early in the game. Does
    this mean we rethink "Red only starts with Oomph, Gray only starts with Scramble", or do we need
    to provide other options for success, or do we make sure that the Good Stuff is good enough?
    Players should never be in a position where they fail at floor 1.** `[you]`

    `[agent]` Gray's twelve starter cards carry no Oomph at all. The only Oomph Gray can reach is
    Good Stuff, and the pool was empty. With Red Down there was no line to play, and fleeing in Last
    Stand is Down.

    `[you, 2026-09-17]` Still open. Whether to rework the split at the Enemy level, the starter-card
    level, or somewhere else is its own question and needs thinking about on its own.

## What the run showed

Notes 8, 9 and 12 are one failure, not three. Four numbers compound:

- The floor is 13 rooms where the rulebook says 10.
- Each starting deck is 12 cards.
- The Good Stuff pool is 8 cards for a whole run and never refills.
- The floor-1 Enemy asks for Oomph 5 and nothing else, and Gray's starter deck has no Oomph.

Each is survivable alone. Together they make floor 1 losable before the Enemy room is ever turned
over, with no play available that would have changed it.

## Appendix: the run log

```
1. Floor 1 is built: 13 rooms.
2. You are in: Sorting Room.
3. Red draws Overdrive.
4. Gray draws Peek Around Corner.
5. Red draws Charge In.
6. Gray draws Pick The Lock.
7. Gray draws Duck Under.
8. Red draws Overdrive.
9. Red draws Shove.
10. Gray draws Peek Around Corner.
11. Gray draws Duck Under.
12. Red draws Shove.
13. Red discards Shove from their hand.
14. Red pays with Shove.
15. Red plays Shove.
16. Gray discards Duck Under from their hand.
17. Gray pays with Duck Under.
18. Gray plays Duck Under.
19. Oomph 2 met — Red gets Good Stuff.
20. Scramble 2 met — Gray gets Good Stuff.
21. Sorting Room is Cleared.
22. Red gets A Pair Of Stich-Em-Ups.
23. Red takes A Pair Of Stich-Em-Ups into hand.
24. Gray gets Cutting Torch.
25. Gray takes Cutting Torch into hand.
26. Cleanup.
27. Red discards Shove from their play zone.
28. Gray discards Duck Under from their play zone.
29. — end of turn 1 —
30. You are in: Sorting Room.
31. Red draws Shove.
32. Gray draws Pick The Lock.
33. Gray discards Pick The Lock from their hand.
34. Gray pays with Pick The Lock.
35. Gray plays Peek Around Corner.
36. A look at Gray's deck: Duck Under.
37. Gray discards Pick The Lock from their hand.
38. Gray pays with Pick The Lock.
39. Gray plays Peek Around Corner.
40. A look at Red's deck: Charge In.
41. Red discards Charge In from their hand.
42. Red pays with Charge In.
43. Red plays A Pair Of Stich-Em-Ups.
44. Duck Under goes to Gray's deck.
45. Duck Under goes to Gray's deck.
46. Red plays Overdrive.
47. Red discards Charge In from their deck.
48. Red discards Shove from their deck.
49. Oomph 2 met — Red gets Good Stuff.
50. Scramble 2 met — Gray gets Good Stuff.
51. Sorting Room is Cleared.
52. Red gets Overcharged Battery.
53. Red takes Overcharged Battery into hand.
54. Gray gets Crowbar.
55. Gray takes Crowbar into hand.
56. Cleanup.
57. Gray gets Grav Harness.
58. Gray takes Grav Harness into hand.
59. Red discards A Pair Of Stich-Em-Ups from their play zone.
60. Red discards Overdrive from their play zone.
61. Gray discards Peek Around Corner from their play zone.
62. Gray discards Peek Around Corner from their play zone.
63. — end of turn 2 —
64. You are in: Spill Of Cargo.
65. Red draws Charge In.
66. Gray draws Duck Under.
67. Gray draws Duck Under.
68. Red draws Shove.
69. Red discards Charge In from their hand.
70. Red pays with Charge In.
71. Red plays Overcharged Battery.
72. Gray discards Duck Under from their hand.
73. Gray discards Duck Under from their hand.
74. Gray pays with Duck Under, Duck Under.
75. Gray plays Grav Harness.
76. Gray draws Pick The Lock.
77. Gray discards Crowbar from their hand.
78. Gray discards Cutting Torch from their hand.
79. Gray pays with Crowbar, Cutting Torch.
80. Gray plays Pick The Lock.
81. Scramble 3 met — Both of you get Good Stuff.
82. Scramble 5 met — Gray gets 2 instead.
83. Spill Of Cargo is Cleared.
84. Red gets Pry Bar.
85. Red takes Pry Bar into hand.
86. Gray gets Coil Of Cable.
87. Gray takes Coil Of Cable into hand.
88. Gray gets Riot Shield.
89. Gray takes Riot Shield into hand.
90. Cleanup.
91. Red discards Overcharged Battery from their play zone.
92. Gray discards Grav Harness from their play zone.
93. Gray discards Pick The Lock from their play zone.
94. — end of turn 3 —
95. You are in: Ration Locker.
96. Red draws Charge In.
97. Gray draws Pick The Lock.
98. Gray draws Duck Under.
99. Gray draws Pick The Lock.
100. Gray discards Pick The Lock from their hand.
101. Gray pays with Pick The Lock.
102. Gray plays Riot Shield.
103. Red discards Overdrive from their hand.
104. Red discards Shove from their hand.
105. Red pays with Overdrive, Shove.
106. Red plays Charge In.
107. Gray plays Coil Of Cable.
108. Oomph 2 met — Red gets Good Stuff.
109. Scramble 2 met — Gray gets Good Stuff.
110. Oomph 4 met — Red gets 2 instead.
111. Scramble 4 met — Gray gets 2 instead.
112. Ration Locker is Cleared.
113. Cleanup.
114. Gray takes Riot Shield into hand.
115. Red discards Charge In from their play zone.
116. Gray discards Coil Of Cable from their play zone.
117. — end of turn 4 —
118. You are in: Ruptured Coolant Line.
119. Red draws Charge In.
120. Red's deck is empty — last stand.
121. Gray draws Duck Under.
122. Gray discards Duck Under from their hand.
123. Gray pays with Duck Under.
124. Gray plays Riot Shield.
125. Gray discards Pick The Lock from their hand.
126. Gray pays with Pick The Lock.
127. Gray plays Duck Under.
128. Scramble 4 met — Clear, but both of you get Bad Stuff.
129. Ruptured Coolant Line is Cleared.
130. Red gets Spore Cloud.
131. Red takes Spore Cloud into hand.
132. Gray gets Torn Seal.
133. Gray takes Torn Seal into hand.
134. Cleanup.
135. Gray takes Riot Shield into hand.
136. Red is Down — the price of getting out.
137. Red discards Shove from their hand.
138. Red discards Pry Bar from their hand.
139. Red discards Charge In from their hand.
140. Red discards Spore Cloud from their hand.
141. Red gets out of last stand, 0 cards the poorer.
142. Gray discards Duck Under from their play zone.
143. — end of turn 5 —
144. You are in: Gross Thing That Looks Like A Cherry.
145. Gray draws Duck Under.
146. Gray's deck is empty — last stand.
147. Gray plays Torn Seal.
148. Gray plays Riot Shield.
149. Gray plays Duck Under.
150. You Flee Gross Thing That Looks Like A Cherry.
151. Gray is Down — a room's printed punishment.
152. Cleanup.
153. Gray discards Torn Seal from their play zone.
154. Gray discards Riot Shield from their play zone.
155. Gray discards Duck Under from their play zone.
```
