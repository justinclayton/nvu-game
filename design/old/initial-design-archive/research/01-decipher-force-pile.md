# Decipher Star Wars CCG — the Life Force system

Reference notes for [issue 01](../issues/01-decipher-force-pile-mechanics.md). Facts only, cited.
No application to North vs Up — that's ticket 04's job.

Scope note: this covers how the mechanic worked. The "known problems" research was cut as
out-of-scope; if it's ever wanted, the veins are Decipher's archived errata pages on
web.archive.org and `rec.games.trading-cards.*` on Usenet.

## Sources

| Tag | Document | Class |
|---|---|---|
| **[P95]** | Premiere rulebook text, © 1995 Decipher — `http://www.armory.com/~jonlubbe/swccg-r.html` | Official Decipher text, community-hosted mirror |
| **[FAQ96]** | *Answers to Frequently Asked Questions*, 27 Nov 1996 — `https://res.starwarsccg.org/rules/premierefaq.pdf` | Official Decipher |
| **[ESB]** | *ESB Introductory Two-Player Game* rulebook — `https://res.starwarsccg.org/rules/esb2prules.pdf` | Official Decipher |
| **[RB2]** | *Rulebook Version 2.0*, Nov 1998 — `https://res.starwarsccg.org/rules/rulebookv2.pdf` | Official Decipher |
| **[GL2]** | *Glossary Version 2.0*, Nov 1998 — `https://res.starwarsccg.org/rules/swccgglossary.pdf` | Official Decipher |
| **[GS02]** | *Glossary Supplement*, 29 Jan 2002 — `https://res.starwarsccg.org/rules/swccgglossarysupplement.pdf` | Official Decipher (last Decipher-era ruleset) |
| **[PC23]** | *Advanced Rulebook 2023* — `https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf` | Players Committee (post-Decipher) |
| **[TG22]** | *Tournament Guide 2.2*, July 2018 — `https://res.starwarsccg.org/wp/wp-content/uploads/Star-Wars-CCG-Tournament-Guide-2.2.pdf` | Players Committee |

The PC-hosted PDFs are byte-identical to Decipher's own hosted files (MD5-checked against Wayback
captures of `decipher.com`), so [RB2]/[GL2] can be treated as official Decipher text.

---

## 1. The zones

1. **1 unit of Force = 1 card.** "The basic unit of measurement in the game is 1 Force (1 unit of
   Force = 1 card)." — [RB2] p.2. Decipher's pitch: "The elegant design of the game uses the cards
   themselves as a natural scorekeeper; no tokens or counters are necessary."
2. **Life Force = Reserve Deck + Force Pile + Used Pile.** Exactly those three. — [GL2] *Life
   Force*; unchanged wording in [P95], [ESB], [PC23].
3. **Hand, table and Lost Pile are NOT part of Life Force.** — [RB2] p.4; [P95]; [ESB]; [GL2].
4. **Reserve Deck** — the 60-card deck itself; "represents the total Force available to you
   throughout the game." — [GL2].
5. **Force Pile** — "represents the amount of Force that is available for you to use to perform
   various actions. Cards flow from your Force Pile and then to your hand or your Used Pile. You may
   accumulate Force in your Force Pile over multiple turns." — [RB2] p.3. Face down, unseen.
6. **Used Pile** — "this temporary pile holds cards 'used' during a turn." Receives spent Force,
   destiny draws, and 'used' Interrupts. — [GL2].
7. **Lost Pile** — face up; "generally not available for the rest of the game, but you can use
   certain cards to retrieve some of them." — [RB2] p.4.
8. **Hand** — starts at 8, drawn from the Reserve Deck. **No hand size limit, ever.** — [RB2] p.4.
9. **Intended flow:** "cards will flow from your Reserve Deck to your Force Pile to your Used Pile
   and back again to the bottom of your Reserve Deck." — [RB2] p.3.
10. **Piles may be counted at any time, by either player, but not browsed.** "At any time, you may
    count the cards in your own hand, pile or deck… You may request that your opponent count his own
    hand, pile or deck, and tell you the correct count." — [GL2] *counting cards*. [PC23] adds: "you
    may not look through any deck, pile, or stack unless permitted to by a rule or card (even if
    it's face up, such as the Lost Pile)."
11. **PC-era only:** [PC23] also counts Unresolved Destiny Draws and the sabacc hand as Life Force,
    and defines a per-player "out of play" area.

---

## 2. Activation

12. **First phase of your turn.** Six phases: Activate, Control, Deploy, Battle, Move, Draw. —
    [RB2] p.4.
13. **The number = your Force icons on all locations, + 1 for yourself.** "Count your Force icons on
    all locations on table (Blue lightsabers for the Light Side; red lightsabers for the Dark Side).
    Add 1 to represent your personal Force." — [RB2] p.4. [GL2] adds a third source: the Force icon
    on your Jedi Master.
14. **The act:** move that many cards "one at a time and face down from the top of your Reserve Deck
    to the top of your Force Pile. **Do not look at the cards** or put them into your hand." —
    [RB2] p.4.
15. **Optional and partial.** "You do not have to activate all of the Force you are entitled to,
    although most of the time you will want to." — [RB2] p.4.
16. **But card-forced activation is mandatory and maximal.** "when other cards or rules (e.g., Blue
    Milk) instruct you to activate Force, you must activate all of it (or as much as possible)." —
    [GL2].
17. **Presence is not required to generate Force**, only icons. — [GL2]; [FAQ96] §2.1.
18. **The player chooses how much, never which cards** — they come off the top, unseen. — [RB2].
19. **Activated cards go on TOP of the Force Pile**, even over Force saved from earlier turns. —
    [FAQ96] §2.1.
20. **Icons are a two-way risk.** "Force icons are a double-edged sword. The more Force icons on your
    side of a location, the more Life Force you can activate… But if your opponent gains control of
    that location, you lose more Force there whenever your opponent initiates a Force drain." —
    [RB2] p.5. Same sentence in [P95] and [ESB]. **Ramping your economy raises your damage taken.**
21. **The rules warn against over-activating.** "if you activate all the cards in your Reserve Deck,
    you will not be able to draw destiny if a battle occurs. When you reach this point in the game,
    consider leaving some cards in your Reserve Deck." — [GL2] *activate phase*.
22. **Granularity changed:** 1996 — "Activating Force during the activate phase is all one action"
    ([FAQ96]); 1998 onward — "Activating each unit of Force is a separate action" ([GL2], [PC23]).
23. **PC-era:** the activation count locks once counted; only 'beginning of turn' effects change it.
    — [PC23].

---

## 3. Spending ("using Force")

24. **Spending moves cards Force Pile → Used Pile**, one at a time, face down. — [RB2] p.3.
25. **The Force Pile is the ONLY pile you spend from.** "You may deploy as many cards as you like,
    **as long as you have enough Force in your Force Pile** to cover their deploy costs." — [RB2]
    p.6. If you didn't activate it, you can't spend it.
26. **There is no "pay from Force Pile then fall back to the Reserve Deck" rule.** Confirmed
    positively: four Decipher corpora were text-searched for every plausible phrasing with zero
    hits. The Reserve Deck *is* a legal source for **losing** Force — never for **using** it. That's
    the likely origin of the half-memory.
27. **Costs must be payable at initiation or the action doesn't happen.** "If a player cannot pay all
    costs, the action is not initiated and none of the costs are paid." — [PC23].
28. **What things cost** ([RB2] unless noted):
    - Character / vehicle / starship: the number printed in the white deploy-cost box.
    - Locations: **free**, any number per turn.
    - Weapons, devices, effects, Interrupts: **free unless the card's text states a cost.**
    - Initiating a battle: **exactly 1 Force**, always.
    - Firing a weapon: whatever the weapon's text says.
    - Landspeed / hyperspeed / shuttling / transferring: **1 Force** (a vehicle carries its
      passengers for that same 1).
    - Landing or taking off: 1 Force, **free at a docking bay**.
    - Embarking / disembarking: **free**.
    - Docking bay transit: the amount printed on the docking bay.
29. **Spending ≠ losing.** "Use" goes to the Used Pile and recirculates; "lose" goes to the Lost Pile
    and is gone. Some card costs are Force *loss* rather than Force *use*, and loss paid as a cost of
    initiation "must be paid in full" — it can't be reduced or substituted. — [PC23].
30. **Force can be held over and spent on the opponent's turn** — to fire weapons, play Interrupts,
    or 'react'. "You will often want to leave some cards in your Force Pile to use during your
    opponent's turn." — [RB2] p.12.
31. **Drawing to hand is also paid out of the Force Pile.** Draw Phase: "If you have cards left in
    your Force Pile, you may draw any number of them into your hand, one at a time." — [RB2] p.12.
    So Force Pile cards have three exits: spent, drawn, or saved. **Drawing removes them from Life
    Force.**
32. **Destiny draws come off the Reserve Deck, not the Force Pile** — "take the top card from your
    Reserve Deck, reveal its destiny number… then place it face down on top of your Used Pile." —
    [RB2] p.8. A second, competing drain on the same deck.

---

## 4. Damage, attrition and Force loss

### Losing Force generally

33. "Whenever you are required to lose Force, you must discard cards face up to your Lost Pile, one
    at a time." — [RB2] p.4.
34. **The player losing chooses, from a restricted menu.** "You may choose cards to be lost from your
    hand or from the top of your Reserve Deck, Force Pile or Used Pile." — [RB2] p.4; identical in
    [P95], [ESB], [GL2]. Note the asymmetry: **any** card from hand, but only the **top** card of a
    Life Force pile.
35. **The player causing the loss never chooses.** — [RB2] p.5; [FAQ96] §2.2.
36. **"Lose Force" means cards-as-units**, not a specific named card. — [GL2].
37. **Retrieval runs Lost Pile → Used Pile.** "Retrieving a card (or retrieving 1 Force) is defined
    as taking the top card of your Lost Pile and placing it face down on your Used Pile." — [GL2].
    So retrieval puts cards back *into* Life Force.

### Force drain

38. **Drain happens in your Control Phase at locations you control.** Control = you have total
    ability ≥ 1 there (droids excluded) and your opponent does not. — [RB2] p.5.
39. **Amount = the OPPONENT'S Force icons at that location**, ± modifiers. Not "yours minus theirs" —
    no source states any subtraction. — [RB2] p.5; [P95].
40. **Announced and resolved one at a time.** — [RB2] p.5.
41. **Changed rule:** 1995 — you could **not** drain where the opponent had no icons ([P95]). 1996
    onward — a location with no icons counts as zero, you may drain for zero, and modifiers can raise
    it ([FAQ96], [GL2], [PC23]).
42. **Each of your cards with ability may participate in only one Force drain per turn.** — [GL2];
    tightened by [CRD00]/[GS02] to "each of your cards."
43. **Force generation and Force drain at a location are independently modifiable.** Cards that
    modify *icons* affect both. — [GL2].

### Battle

44. **A battle exists to deplete Life Force.** Requires both players at the location with ability ≥1;
    costs 1 Force; once per turn per location. Three segments: weapons, power, damage. — [RB2] pp.7-8.
45. **Three separate loss sources in the damage segment:** weapon hits, attrition, battle damage.
46. **Weapon hits** — cards 'hit' must be forfeited. They still add power first.
47. **Attrition = the opponent's total battle destiny.** Only *battle* destiny causes it. —
    [GL2].
48. **Attrition is satisfiable ONLY by forfeiting cards from the battle.** You cannot pay it with
    Force. If you have nothing left to forfeit, "any remaining attrition against you is ignored." —
    [GL2].
49. **Battle damage = winner's power − loser's power**, and hits **only the loser**. — [RB2] p.9.
50. **Battle damage can be paid EITHER way, freely mixed** — by forfeiting cards that were in the
    battle (each absorbs up to its printed forfeit value) **or** by losing Force (each card = 1). —
    [RB2] p.9. This is the key contrast with attrition.
51. **One forfeited card can pay two debts at once** — a forfeit value of 5 satisfies up to 5
    attrition *and* up to 5 battle damage simultaneously. — [GL2].
52. **Excess forfeit is wasted; you may not over-forfeit voluntarily.** — [RB2] p.9; [GL2].
53. **Damage-segment actions alternate between players** (1998 onward; in 1996 the attacker did all
    of theirs first). Immunity to attrition checks the **original** total, not the remainder. —
    [GL2], [FAQ96].
54. **"Immune to attrition < N"** is a printed card property. — [GL2].

---

## 5. The loss condition

55. **"If at any time your opponent's entire Life Force — Reserve Deck, Force Pile and Used Pile — is
    depleted, you win the game!"** — [RB2] p.12.
56. **Cards in hand do not save you.** Hand is excluded from Life Force, so a player holding cards
    with all three piles empty has lost. — [RB2] p.4 + p.12.
57. **Checked continuously**, not at end of turn — "at any time".
58. **The 1995/1997 booklets contradict themselves**, opening with "when he has no cards left in his
    deck" and then defining Life Force as three piles a page later. [RB2]/[GL2] resolve it in favour
    of the three-pile definition. — [P95], [ESB].
59. **Two routes to draining someone:** Force drain in the opponent's control phase, and battle
    damage in their battle phase — plus card-driven "lose X Force" text.
60. **Self-inflicted depletion is real**, since activation, destiny draws and your own costs all eat
    the same deck (fact 21).
61. **Tournament scoring uses remaining Life Force as the margin.** Differential = the winner's
    remaining Life Force, capped at 59; a true tie is equal Life Force, broken by fewer cards in Lost
    Pile, then fewer in hand, then a hand of Sabacc. Games are 60-75 minutes. — [TG22]. Decipher's
    own earlier rule was the "hands down" timeout: play stops, most Life Force wins.

---

## 6. The cycle and deck-out

62. **Recirculation: the Used Pile goes under the Reserve Deck at the end of EVERY player's turn, for
    BOTH players.** "unlike the Force Pile, the Used Pile does not accumulate cards from turn to
    turn." — [RB2] p.3.
63. **It's a block move, not a shuffle.** "Moving the cards in the Used Pile, **as a group**, to the
    bottom of the Reserve Deck." — [GL2]. **The deck is therefore never reshuffled by the normal
    cycle** — card order is preserved end to end.
64. **Mandatory, and the opponent can insist.** A player who forgets and isn't reminded "may not
    re-circulate until the end of the next turn." — [GL2]; [RB2] p.12.
65. **The Force Pile does NOT recirculate** — it persists and accumulates across turns. — [RB2] p.3.
66. **The Lost Pile does NOT recirculate** — cards escape only via explicit retrieval. — [RB2] p.4.
67. **Net shape: a loop with a leak.** Cards leave the loop by being lost, drawn to hand, or deployed
    to table; they re-enter via recirculation (Used → Reserve) and retrieval (Lost → Used).
    *(Synthesis of the cited rules; no single sentence states it this way.)*
68. **An empty Reserve Deck does not end the game** — only all three piles empty does. You can have
    an empty deck and still hold Force Pile and Used Pile cards.
69. **Destiny draws just fail on an empty Reserve Deck.** "that destiny draw fails (is resolved in
    the favor of the opponent, often meaning the action that required the destiny draw has no
    result)." — [GL2].
70. **Empty-pile rules** ([GS02], carried into [PC23]): with an empty deck or pile you may not
    initiate any action that deploys, takes, exchanges, steals, searches, peeks, examines, reveals,
    selects, looks at, or draws from it (destiny excepted). **Partial fulfilment applies:** if there
    aren't enough cards, "simply complete what is possible and then end the action."
71. **Activation stops at what's available** — a player told to activate 2 with 1 card left activates
    1. — [PC23].
72. **Every pile transfer is one card at a time, never as a group.** — [ESB] p.16; [RB2].
73. **Deck size is fixed at 60 and both players must match**, "because each card represents one unit
    of Life Force." — [ESB] p.16.

---

## 7. Rule changes across editions

**Stable 1995 → 2023:** the three-pile Life Force definition; the loss condition; losing Force
(face up, one at a time, chosen by the loser, from hand or pile tops); activation (icons + 1, face
down, unseen, optional); spending (Force Pile → Used Pile); recirculation (unshuffled block, every
turn, mandatory); Force drain amount (opponent's icons); attrition-vs-battle-damage payment
asymmetry; the "double-edged sword" framing of Force icons.

**Changed:**

| Rule | Before | After |
|---|---|---|
| Zero-icon Force drains | Forbidden ([P95], 1995) | Allowed for zero, modifiable upward ([FAQ96] 1996 onward) |
| Activation granularity | One action total ([FAQ96]) | One action per card ([GL2] 1998 onward) |
| Damage-segment order | Attacker does all of theirs first ([FAQ96]) | Strict alternation from the initiator ([GL2]) |
| Counting the Lost Pile | Not allowed ([FAQ96]) | Allowed face down ([GL2] 1998, [GS02] 2002) |
| Empty deck/pile handling | Not codified | Codified in [GS02] (2002), carried into [PC23] |
| What counts as Life Force | Three piles | [PC23] adds Unresolved Destiny Draws + sabacc hand |
| Force generation sources | Icons + 1 ([ESB]) | Icons + 1 + Jedi Master ([GL2] onward) |

---

## Notes on reliability

- Sections 1-6 are near-entirely primary rulebook text.
- **The original 1995 Premiere rulebook exists only as a plain-text transcription** ([P95]); not
  verified character-perfect against the printed booklet.
- Community summaries of this game are frequently wrong — several state the win condition includes
  emptying the opponent's **hand**. It does not. Prefer the rulebooks.
- Things that do **not** exist, despite appearing in secondary accounts: a SWCCG "Rules Version 1.8"
  (1.x numbering belongs to Decipher's *Star Trek* line), a document called "Star Wars CCG Complete
  Rules", and a "5-Force start" rule.
