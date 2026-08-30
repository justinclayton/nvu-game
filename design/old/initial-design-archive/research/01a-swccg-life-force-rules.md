# 01a — SWCCG "Life Force" resource system: the rules as written

Partially resolves [ticket 01](../issues/01-decipher-force-pile-mechanics.md), items 1–6 plus turn
structure. Ticket item 7 ("Known problems") is **not** covered here — this file is rules-as-written
only.

Facts only. No application to North vs Up, no design commentary.

## Sources

All primary documents were downloaded and read as text. Cached PDFs were checked byte-for-byte
(md5) against the live URLs before use.

| Handle | Document | Date | Tier | URL |
| --- | --- | --- | --- | --- |
| **PREM95** | Decipher, SW:CCG Premiere rulebook, full text | 1995 | **1 (content) / 3 (hosting)** | http://www.armory.com/~jonlubbe/swccg-r.html |
| **FAQ96** | Decipher, "Answers To Frequently Asked Questions" | 27 Nov 1996 | **1** | https://res.starwarsccg.org/rules/premierefaq.pdf |
| **ANH96** | Decipher, *A New Hope* expansion rules insert | 1996 | **1** | https://res.starwarsccg.org/rules/anewhoperules.pdf |
| **RB2** | Decipher, SW:CCG Rulebook Version 2.0 | Nov 1998 | **1** | https://res.starwarsccg.org/rules/rulebookv2.pdf |
| **GLOS2** | Decipher, SW:CCG Glossary Version 2.0 | Nov 1998 | **1** | https://res.starwarsccg.org/rules/swccgglossary.pdf |
| **AR2023** | Players Committee, *Advanced Rulebook* (v3.0) | Aug 2023 | **1** | https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf |
| **BEG21** | Players Committee, *Beginner's Rulebook*, 2nd Edition | Aug 2021 | **1** | https://res.starwarsccg.org/rules/SWCCG-Beginners-Rulebook-v2.pdf |
| **TG18** | Players Committee, *Official Tournament Guide* 2.2 | Jul 2018 | **1** | https://res.starwarsccg.org/wp/wp-content/uploads/Star-Wars-CCG-Tournament-Guide-2.2.pdf |
| **WP** | Wikipedia, "Star Wars Customizable Card Game" | — | **2** | https://en.wikipedia.org/wiki/Star_Wars_Customizable_Card_Game |

### Provenance notes

- **PREM95** is a plain-text transcription on a personal site, not a PDF scan. Its *content* is
  tier 1: it ends with the Decipher/Lucasfilm 1995 copyright block, the Carta Mundi printer credit,
  and a sign-off from "Will 'Sandy' Wible, Official Online Network Representative for Decipher Inc."
  Its *hosting* is tier 3 — a transcription could contain errors I cannot detect. Every PREM95 claim
  below should be read with that caveat. The page is live (HTTP 200, 63KB, verified this session).
- **AR2023** self-describes as replacing "all previous rulebooks, glossaries, and rulings." It is
  the Players Committee's document, not Decipher's; its cover states "Not Endorsed or Sponsored by
  Lucasfilm."
- The ticket brief referred to a "Second Edition rulebook." **No such thing exists for SWCCG.** The
  game had one edition. What exists is Decipher's *Rulebook Version 2.0* (Nov 1998, = RB2) and the
  Players Committee's *Beginner's Rulebook 2nd Edition* (2021, = BEG21). Treated as two separate
  documents below.
- Tier markers on each bullet: **[P]** primary, **[S]** secondary, **[T]** tertiary. Era markers:
  **(95)** Premiere-era, **(98)** Decipher Nov 1998, **(PC)** Players Committee era.

---

## 1. The zones

- **[P](95/98/PC)** The basic unit of measurement is the card: "1 unit of Life Force = 1 card."
  There are no tokens or counters in the game. — PREM95; GLOS2 *Force*; AR2023 Ch.1 §A.
- **[P](95/98/PC)** **Life Force** is defined as exactly three piles: **Reserve Deck + Force Pile +
  Used Pile**. Cards in hand, on table, or in the Lost Pile are explicitly *not* Life Force.
  — PREM95 "Your Life Force"; GLOS2 *Life Force*; RB2 p.3; AR2023 p.9; BEG21 p.2.
- **[P](PC)** AR2023 adds two things to Life Force that the Decipher documents do not name:
  Unresolved Destiny Draws, and the sabacc hand (AR2023 Appendix C). — AR2023 p.9.

| Zone | Physical state | Visibility | Part of Life Force? | Fiction |
| --- | --- | --- | --- | --- |
| **Reserve Deck** | Face-down deck on table | Hidden, order hidden | Yes | "The total Force available to you throughout the game" |
| **Force Pile** | Face-down pile | Hidden | Yes | "Force energy available for you to use performing various game actions" |
| **Used Pile** | Face-down pile | Hidden | Yes | Force already expended this turn |
| **Lost Pile** | Face-**up** pile | Contents visible; may not be searched | **No** | Force permanently drained/destroyed; "lost" not "killed" |
| **Hand** | Held | Hidden from opponent | **No** | — |
| **Out of play** | Separate area beside Lost Pile | Inspectable by both players | **No** | Removed from the game entirely |
| **Table** | Face up | Public | **No** | Locations, characters, ships in play |

- **[P](95/98/PC)** Reserve Deck: 60-card deck minus starting card(s), shuffled, placed face down.
  Deck size is exactly 60. PREM95 says "shuffle the remaining 59 cards" (one starting location
  removed); RB2/GLOS2/AR2023 generalise to "starting card(s)" because later sets added Objectives
  and Starting Interrupts/Effects that also come out pre-shuffle. — PREM95; GLOS2 *Reserve Deck*;
  AR2023 p.9; BEG21 p.2.
- **[P](95/98)** Force Pile cards are put there **face down** and "Do not look at the cards or put
  them into your hand." — PREM95 Phase One; RB2 p.4; GLOS2 *activate phase*.
- **[P](95/98/PC)** Activated Force goes on **top** of the Force Pile, never the bottom, even when
  cards are held over from a previous turn. — FAQ96 §"Activation"; GLOS2 *activating Force*;
  AR2023 p.39.
- **[P](95/98/PC)** Lost Pile is face up and both players may see what goes into it: "Both you and
  your opponent are allowed to see the cards you place in your Lost Pile." — PREM95 "Losing Force";
  RB2 p.4.
- **[P](PC)** AR2023 general rule: "you may not look through any deck, pile, or stack unless
  permitted to by a rule or card (**even if it's face up, such as the Lost Pile**)." A player *may*
  count any of their own decks/piles/hands at any time, and may request a count from the opponent.
  — AR2023 p.9.
- **[P](95)** **Conflict with the above.** FAQ96 states flatly: "You **may not count the Lost Pile**.
  You may count the Used Pile, Force Pile and Reserve Deck." AR2023 permits counting any pile.
  Both readings recorded; not resolved. — FAQ96 §"Different Piles"; AR2023 p.9.
- **[P](95)** FAQ96 also states "You may not examine the cards in any of your piles, including the
  Lost Pile" — consistent with AR2023 on examining, inconsistent on counting.
- **[P](98/PC)** **Out of play** exists as a zone distinct from the Lost Pile: cards "taken out of
  the game entirely," placed in a per-player area next to the Lost Pile. Its only ongoing game
  effect is (a) cards that specifically reference the out-of-play state, and (b) a unique
  character/vehicle/starship out of play blocks that player from deploying any other version of that
  persona for the rest of the game. Both players may inspect out-of-play areas. — GLOS2 *out of
  play*; AR2023 p.27.
- **[P](PC)** Some cards carry "May not be placed in Reserve Deck" / "May not be placed into Life
  Force"; such cards may **never** enter the owner's Life Force, Lost Pile, or hand. — AR2023 p.36.
- **[P](95/98/PC)** No zone is shared. Each player has their own set. Locations on the table are
  shared/contested space, oriented so blue-lightsaber icons face the Light player and red face the
  Dark player. — RB2 p.2.
- **[P](PC)** A card in hand, Life Force, or Lost Pile is called a **"unit of Force"** and is never
  "on table," even if momentarily revealed (e.g. a destiny draw). It has no card characteristics
  while in that state unless a rule specifically looks for them there. — AR2023 p.26.

---

## 2. Activation

- **[P](95/98/PC)** Activation = moving cards **one at a time, face down, from the top of your
  Reserve Deck to the top of your Force Pile**. — PREM95 Phase One; RB2 p.4; GLOS2 *activating
  Force*; AR2023 p.39; BEG21 p.3.
- **[P](95/98/PC)** The number is **Force generation**, computed at the start of your Activate Phase:
  - Count the Force icons (lightsaber symbols) on **your side** of every location on table — blue
    for Light, red for Dark;
  - **+1** for "the personal Force you generate yourself";
  - **(98/PC)** **+1 for each of your Jedi Masters** (Light) / Dark Jedi Masters (Dark);
  - plus/minus any card modifiers to Force generation.
  — PREM95 Phase One; RB2 p.4; GLOS2 *Force generation*; AR2023 p.39–40; BEG21 p.3.
- **[P](95/98/PC)** **Activation is optional and partial.** "You do not have to activate all the
  Force you are entitled to." — RB2 p.4; GLOS2 *activate phase*; FAQ96 §"Activation"; AR2023 p.39;
  BEG21 p.3 ("You may activate less than the maximum if you wish").
- **[P](95/98/PC)** The active player alone activates, during their own Activate Phase (phase 1 of
  6). Cards can also grant off-phase activation, in which case it is mandatory: "when other cards or
  rules (e.g., Blue Milk) instruct you to activate Force, you must activate all of it (or as much as
  possible)." — GLOS2 *activating Force*; AR2023 p.39.
- **[P](95/98/PC)** **Presence is not required to generate Force.** You activate from Force icons at
  a location even with no cards there. — GLOS2 *activating Force*; FAQ96 §"Activation"; AR2023 p.39.
- **[P](PC)** Granularity conflict, recorded not resolved:
  - **FAQ96**: "Activating Force is **all one discrete game action**."
  - **GLOS2 / AR2023**: "**Activating each unit of Force is a separate action**," and AR2023's
    worked example has a player activate 3, play a card with them, then activate the remaining 5
    within the same phase.
  This is a substantive reversal between 1996 and 1998, with knock-on effects for response windows.
- **[P](PC)** AR2023 freezes the count: the generation total "may not be altered after the count is
  completed," and only 'beginning of turn' actions can change it. Not stated in PREM95/RB2.
  — AR2023 p.39.
- **[P](95/98/PC)** Force in the Force Pile **accumulates across turns**; it is not emptied at end of
  turn. "You may accumulate Force in your Force Pile over multiple turns." — RB2 p.3;
  GLOS2 *Force Pile*; AR2023 p.9.
- **[P](95/98/PC)** Force icons are explicitly two-edged: more icons on your side of a location = more
  you can activate, but also more your opponent can Force drain you for there if they take control.
  — PREM95 Phase Two note; RB2 p.5.

---

## 3. Spending

- **[P](95/98/PC)** To "use Force" for a cost, you move that many cards **one at a time, face down,
  from the top of your Force Pile to the top of your Used Pile**. That physical transfer *is* the
  payment. — PREM95 Phase Three; RB2 p.3; GLOS2 *Used Pile*; BEG21 p.3.
- **[P](95/98/PC)** Payment can only come from the **Force Pile**. Not from hand, not from Reserve
  Deck, not from Used Pile. FAQ96 is explicit that this is the only legal reason to move cards
  between Life Force piles: "You may not move cards around any of the piles in your Life Force unless
  for a specific action. Force may not be 'used', moving cards from the Force Pile to the Used Pile,
  unless paying for a specific Force expenditure." — FAQ96 §"Using Force".
- **[P](95/98/PC)** Things that cost Force:
  - **Deploying** characters/vehicles/starships — cost printed in a box on the card.
  - **Locations** — **free**, no deploy cost, unlimited number per deploy phase.
  - **Weapons and devices** — free unless a cost is printed in game text.
  - **Effects / Epic Events / Jedi Tests** — free unless game text says e.g. "Use 1 Force to deploy."
  - **Initiating a battle** — exactly **1 Force**, every time.
  - **Firing a weapon** — as stated on the weapon.
  - **Movement** — generally **1 Force** per regular move (landspeed, hyperspeed, shuttling,
    transferring, landing/taking off); docking bay transit costs the amount printed on the docking
    bay; embarking/disembarking is free.
  - **Interrupts** — free unless a cost is listed in game text.
  — PREM95 Phases Three/Four/Five; RB2 pp.5–7, p.10; BEG21 p.3.
- **[P](98/PC)** **Force draining costs 0 Force** to initiate (a value that cards can nonetheless
  modify or reset). — AR2023 p.41.
- **[P](95/98/PC)** Spent cards land in the **Used Pile face down** and therefore return to the
  Reserve Deck at end of turn. Spending is *not* damage — the cards come back. Contrast
  "lose N Force," which sends cards face up to the Lost Pile instead. ANH96 makes the distinction
  explicit for card text: "**'Lose 1 Force to…'** — Similar to '**Use 1 Force to…**,' except that the
  card may come from your hand or your Life Force and must go to your **Lost Pile** instead of your
  **Used Pile**." — ANH96; RB2 pp.3–4.
- **[P](95/98/PC)** Interrupts sort into the same two buckets: a **Used** interrupt goes face down to
  the Used Pile after resolving; a **Lost** interrupt goes face up to the Lost Pile. ANH96 introduced
  "Used **Or** Lost Interrupt" (player's choice). — RB2 p.9 sidebar; ANH96.
- **[P](95)** If a battle is interrupted/stopped, Force already expended stays spent: "all cards
  expended for the battle remain in players' Used Piles," and Force spent on a cancelled interrupt
  "remains in his Used Pile." — PREM95.
- **[P](PC)** AR2023 generalises this: paying the deploy cost is part of *initiation*, "so if the
  deploy is canceled the Force has still been used." If a player cannot pay all costs, the action is
  not initiated and **none** of the costs are paid. — AR2023 p.15, p.47.
- **[P](95/98/PC)** Force left in the Force Pile at end of your turn is usable during the
  **opponent's** turn — to 'react', to fire weapons, to play interrupts. Both rulebooks advise
  deliberately withholding some. — PREM95 Phase Six; RB2 p.12; GLOS2 *Force Pile*.
- **[P](95)** Consequently a player who empties their Force Pile cannot react: "If he did not leave
  enough cards in his Force Pile, he cannot 'react.'" — PREM95 Phase Four.

---

## 4. Damage

Three distinct mechanisms. They differ in which zone supplies the cards and who chooses.

### 4a. Force loss (the general mechanism)

- **[P](95/98/PC)** "Losing Force" = discarding cards **face up to your Lost Pile, one at a time**.
  — PREM95; GLOS2 *Losing Force*; RB2 p.4; AR2023 p.10.
- **[P](95/98/PC)** **The losing player chooses** where each card comes from: from **hand** (free
  choice of which card) and/or from the **top of** the Reserve Deck, Force Pile, or Used Pile —
  any combination. Choice within a Life Force pile is *not* free: only the top card. — RB2 p.4;
  GLOS2 *Losing Force*; AR2023 p.10; BEG21 p.2.
- **[P](PC)** AR2023 extends the legal sources to the sabacc hand and the player's most recent
  Unresolved Destiny Draw. — AR2023 p.10.
- **[P](95/98/PC)** Everything that goes to the Lost Pile is **revealed** — the pile is face up and
  both players may see the cards go in. A card lost from hand is thereby exposed. — PREM95.
- **[P](PC)** "Losing Force - From X": if a card requires loss from a specific place and there aren't
  enough cards there, lose what you can from there and the remainder from anywhere legal.
  — AR2023 p.10.
- **[P](PC)** "Losing Force" means losing *cards as units of Force*, not losing a specific named
  card. Card effects that reduce Force loss do not apply to effects that remove specific named cards
  from hand. — AR2023 p.10.

### 4b. Force drain (direct, no battle)

- **[P](95/98/PC)** During your **Control Phase**, at each location you **control**, you may initiate
  one Force drain. Control = you have presence there (total ability ≥ 1) and your opponent does not.
  — PREM95 Phase Two; RB2 p.5; AR2023 p.41; BEG21 p.3.
- **[P](95/98/PC)** Amount = the number of Force icons on **your opponent's** side of that location,
  plus/minus any Force drain modifiers. The opponent then loses that much Force (§4a rules — their
  choice of source, into their Lost Pile). — RB2 p.5; GLOS2 *Force drain*; AR2023 p.41.
- **[P](95/98/PC)** Drains are announced and resolved **one at a time**; each completes before the
  next is initiated. — RB2 p.5; PREM95.
- **[P](95)** vs **[P](98/PC)** — conflict on zero-icon locations:
  - **PREM95**: "If an opponent's Force icons are canceled … or your opponent has no Force icon, **you
    can't drain Force** from that location."
  - **GLOS2 / AR2023**: "A location without Force icons is considered to have '**zero**' Force icons.
    Thus, you can actually **drain there for zero Force**, and you can use modifiers to increase that
    Force drain."
  A genuine rules change between 1995 and 1998, load-bearing for drain-modifier decks. Both recorded.
- **[P](98/PC)** Each of your cards at the drain location "participates" in that drain, and each card
  may participate in only **one** Force drain per turn — so a character that drained at one location
  cannot enable a drain at a second location it later moves to. — GLOS2 *Force drain*; AR2023 p.41.
- **[P](98/PC)** Modifiers to "Force drain" and to "Force generation" are independent; only modifiers
  to **Force icons** move both. — GLOS2; AR2023 p.40.
- **[P](95/98/PC)** Control is checked continuously, not only in the Control Phase. — FAQ96; RB2 p.5.

### 4c. Battle: weapon hits, attrition, battle damage

- **[P](95/98/PC)** A battle costs **1 Force** to initiate, requires both players to occupy the
  location (total ability ≥ 1 each), and resolves in three ordered segments: **weapons → power →
  damage**. Each character/vehicle/starship may battle only once per turn; no location may be
  battled at twice in one turn. — PREM95 Phase Four; RB2 pp.7–8; AR2023 p.53ff.
- **[P](95/98/PC)** **Weapon 'hits'.** A successful weapon turns the target sideways; it keeps
  fighting, still adds power, and **must be forfeited to its owner's Lost Pile in the damage
  segment regardless of who wins**. Forfeiting a card also loses everything on/aboard it. — RB2 p.8;
  PREM95.
- **[P](95/98/PC)** **Battle destiny.** A player with combined ability ≥ 4 at the location may draw
  battle destiny, which is added to their total power **and** determines attrition against the
  opponent. — PREM95; GLOS2; AR2023 p.55.
- **[P](95/98/PC)** **Attrition.** Applies to **both** players regardless of who wins ("in Episode V,
  the Dark Side clearly won the Battle of Hoth, yet they still lost some Imperial walkers to
  attrition"). Attrition against you = **your opponent's total battle destiny**, plus modifiers.
  - **Attrition can only be satisfied by forfeiting cards from the battle location.** It cannot be
    paid out of hand or Life Force.
  - The owner chooses which cards to forfeit and in what order.
  - Forfeited cards go **face up to the owner's Lost Pile**.
  - If your opponent successfully completed **no** battle destiny draw, there is **no attrition**
    against you at all — a state distinct from attrition of 0 (0 can be modified upward; "no
    attrition" cannot).
  - If you have no cards left to forfeit, or all remaining cards are immune, any unsatisfied
    attrition is **ignored**.
  - You may have to over-forfeit: attrition 5 against three forfeit-3 cards means forfeiting two
    (total 6).
  — GLOS2 *battle — damage segment*; AR2023 p.56; PREM95 "Attrition".
- **[P](95/98/PC)** **Battle damage.** Applies **only to the loser**. Amount = winner's total power
  minus loser's total power.
  - Satisfiable **either** by forfeiting cards from the battle (each card counts up to its printed
    forfeit value) **or** by losing Force (each card lost = 1 point), **or any mix**.
  - Force lost this way follows §4a: loser's choice, from hand and/or the **top** of Force Pile /
    Used Pile / Reserve Deck, face up to the Lost Pile.
  - Cards forfeited for weapon hits or attrition **also** count toward battle damage simultaneously:
    "if you forfeit a 'hit' card whose forfeit value is 5, this simultaneously satisfies attrition of
    up to 5 **and** battle damage of up to 5."
  - Over-forfeit again possible: battle damage 4, only card has forfeit 6 → forfeit it, or lose 4.
  — RB2 pp.8–9; GLOS2; AR2023 pp.56–57.
- **[P](98/PC)** The three factors are named as one list — "weapon 'hits,' attrition and battle
  damage" — and RB2 flags attrition as "probably the most complicated concept in the Star Wars
  Customizable Card Game for new players." — RB2 p.9.
- **[P](95)** vs **[P](96/98/PC)** — **documented change in how attrition and battle damage stack.**
  - **PREM95** treats attrition as a *constraint on the form of payment* rather than an extra cost
    for the loser: "**Attrition loss incurred by the loser of a battle is not in addition to 'battle
    damage'**, but it can affect the way he absorbs the 'battle damage' by forcing the forfeiture of
    cards."
  - **FAQ96** (13 months later) already reads them as separate quantities: "After forfeiting all
    cards present in a battle, if attrition remains it is ignored. **If battle damage remains, it
    must still be satisfied.**" It also rules "A card may not be forfeited from a battle unless there
    is either attrition or battle damage still unsatisfied."
  - **GLOS2 / AR2023** carry FAQ96's reading forward, and reconcile the overlap by the
    forfeit-counts-toward-both rule quoted above.
  Recorded as a real drift between the 1995 printed rulebook and everything after Nov 1996.
- **[P](95/98/PC)** **Immunity to attrition** ("Immune to attrition < X"): if attrition against you
  is below X, that card cannot be forced to forfeit for attrition. It checks the **original**
  attrition value, not the remainder after other forfeits. An immune card may still be forfeited
  voluntarily. Immunity does not protect against battle damage or weapon hits. — PREM95; FAQ96 §2.4.1;
  AR2023 p.61.
- **[P](95/98/PC)** **Ties.** If total powers tie, there is no winner and no loser, therefore no
  battle damage — but attrition still applies to both sides. — PREM95; AR2023 p.55.

### 4d. Destiny draws (an incidental drain on the Reserve Deck)

- **[P](95/98/PC)** To "draw destiny": take the **top card of your Reserve Deck**, reveal its destiny
  number to both players, then place it **face down on your Used Pile**. Locations and other cards
  without a destiny number count as 0. — PREM95; RB2 p.8 sidebar; AR2023.
- This is not damage — the card stays in Life Force and recirculates — but it is a per-battle
  Reserve-Deck-to-Used-Pile transfer that is not activation and not spending.
- **[P](S)** Because destiny cards are revealed and then recirculate in a known position, "a skillful
  player can legally count cards, remembering where the high-destiny cards are in the deck." — WP
  (tier 2; I found no primary statement of this).

---

## 5. The loss condition

- **[P](95/98/PC)** **You lose when your Reserve Deck, Force Pile, and Used Pile are all
  simultaneously empty.** Verbatim and unchanged across all three eras: "If these three piles are
  totally depleted, you lose the game!" — PREM95; GLOS2 *Life Force*; RB2 p.3; AR2023 p.9; BEG21 p.2.
- **[P](98)** RB2 states the check is continuous: "**If at any time** your opponent's entire Life
  Force — Reserve Deck, Force Pile and Used Pile — is depleted, you win the game!" — RB2 p.12.
- **[P](95/98/PC)** Cards in **hand**, on **table**, in the **Lost Pile**, and **out of play** do not
  count. A player can therefore lose with a full hand and a board full of characters. — all sources.
- **[P](95/98/PC)** **An empty Reserve Deck alone is not a loss** — only the three-pile conjunction is.
  See §6.
- Mechanisms that drive a player toward zero:
  - **[P]** **Force drain** — the primary engine; direct, repeatable every Control Phase, needs only
    uncontested presence at a location with opponent Force icons.
  - **[P]** **Battle damage** paid out of Life Force.
  - **[P]** **Card-driven "lose N Force"** effects (the ANH96 "Lose 1 Force to…" template and many
    interrupts/effects).
  - **[P]** Forfeiting cards from table costs no Life Force directly, but each forfeited card is a
    card that will not return.
- **[P](95)** PREM95's own opening paragraph gives a **looser and internally inconsistent** version
  of the loss condition — "deplete your opponent's Life Force (**when he has no cards left in his
  deck**)" — which contradicts the precise three-pile definition given ten paragraphs later in the
  same document. Recorded, not resolved; the three-pile definition is the one every later document
  repeats.
- **[P](95)** Margin of victory was part of the original scoring: PREM95 recommends two-game matches
  scored by "the winner's margin of victory," i.e. cards of Life Force remaining.
- **[P](PC)** Tournament layer (not base rules): TG18 §3.10 "Differential" scores +1 per card of Life
  Force remaining for the winner and −1 for the loser, capped at 59. If a game hits the time limit,
  the result goes to "the player with more Life Force remaining." Further ties break on (a) fewer
  cards in Lost Pile, (b) fewer cards in hand, (c) a hand of sabacc. — TG18.

---

## 6. The cycle

- **[P](95/98/PC)** **The only recirculation route is Used Pile → bottom of Reserve Deck.** At end of
  turn you place your Used Pile, **as a group**, beneath your Reserve Deck. It is **not shuffled**.
  — PREM95; GLOS2 *Re-circulating*; RB2 p.12; AR2023 p.9; BEG21 p.2.
- **[P](95/98/PC)** Full loop: Reserve Deck → (activate) → Force Pile → (use) → Used Pile →
  (recirculate) → bottom of Reserve Deck. RB2: "cards will flow from your Reserve Deck to your Force
  Pile to your Used Pile and back again to the bottom of your Reserve Deck."
- **[P](98/PC)** Recirculation is **mandatory**, and both players do it at the end of **every** turn,
  not just their own. "If you forget, your opponent can insist that you re-circulate." AR2023 adds a
  penalty: a player who forgets and is not reminded before the next action resolves "may not
  re-circulate until the end of the next turn." — RB2 p.12; GLOS2; AR2023 p.9.
- **[P](95)** **Ambiguity in the 1995 text on who recirculates.** PREM95 says only "At the end of each
  turn, **you** re-circulate your Used Pile" and, in Phase Six, "When you are through, put the Used
  Pile under your Reserve Deck" — both singular, both in the context of the active player's turn.
  RB2 is explicit that "**Both players** then re-circulate their Used Piles," and GLOS2 says "at the
  end of **each player's** turn." Whether Premiere intended one-player-per-turn or both is not
  established from the 1995 text alone; recorded as ambiguity.
- **[P](95/98/PC)** **The Force Pile does not recirculate.** It carries over. Only the Used Pile is
  swept at end of turn. — RB2 p.3.
- **[P](95/98/PC)** **There is no automatic reshuffle anywhere in the game.** The Reserve Deck is
  shuffled once at setup. After that, shuffling only happens when a specific card instructs it
  ("reshuffle" / the older "shuffle, cut, and replace"). Deck order is therefore substantially known
  to an attentive player. — AR2023 p.9 *Shuffle & Reshuffle*; GLOS2.
- **[P](98/PC)** **Retrieve** is the one route out of the Lost Pile: "Act of taking the top card of
  your Lost Pile and placing it face down on your **Used Pile**." Retrieved cards re-enter Life Force
  (via the Used Pile, so they recirculate next end-of-turn). Retrieval is always revealed to both
  players. Specific-card retrieval searches the Lost Pile without reordering it. — AR2023 p.11;
  BEG21 p.2. RB2 p.4 confirms in general terms: lost cards "are generally not available for the rest
  of the game, but you can use certain cards to retrieve some of them."
- **[P](PC)** **What happens when the Reserve Deck empties mid-turn** — AR2023 "Empty Deck Or Pile"
  (p.10). Nothing special happens; the deck is simply empty. Specifically, with an empty Reserve
  Deck you may not:
  - initiate any action that deploys, takes, exchanges, or steals a card from it;
  - initiate any action that searches, peeks, glances, examines, reveals, selects, or looks at a card
    in it;
  - initiate any action that draws a card from it (**destiny draws excepted**);
  - play a card to shuffle it;
  - use game text that says "if you are about to draw."
  An action may still be *initiated* if there is at least one card there; if there are too few to
  finish, "simply complete what is possible and then end the action."
- **[P](PC)** **Destiny draws with an empty Reserve Deck still happen and simply fail.** "An empty
  Reserve Deck does not stop you from drawing destiny, that destiny draw simply fails." A failed
  destiny draw means the player has no destiny total, and "the action resolves in favor of their
  opponent" — i.e. the result is whatever is in the opponent's immediate favour. If both players fail
  the same action, the action has no result. — AR2023 pp.10, 31.
- **[P](95)** Premiere-era equivalent for the Draw Phase: "You may only draw cards during your draw
  phase if you have any cards remaining in the Force Pile to draw." — FAQ96 §2.6.
- **[P](98/PC)** Both GLOS2 and AR2023 attach the same explicit strategic warning to activation:
  "if you activate all the cards in your Reserve Deck, you will not be able to draw destiny if a
  battle occurs. When you reach this point in the game, consider leaving some cards in your Reserve
  Deck so you can draw destiny." — GLOS2 *activate phase*; AR2023 p.39.
- **[P](95)** FAQ96 note on shuffling side-effects: if the Reserve Deck is counted while one of the
  opponent's cards is inserted in it, "shuffle, cut and replace afterward."

---

## 7. Turn structure

- **[P](95/98/PC)** **The Dark Side player takes the first turn of the game.** — PREM95; RB2 p.3;
  BEG21 p.2.
- **[P](95/98/PC)** Players alternate complete turns. Each turn is **six phases in fixed order**:

  | # | Phase | What happens | Where the resource moves |
  | --- | --- | --- | --- |
  | 1 | **Activate** | Count Force generation; activate up to that many | Reserve Deck → Force Pile |
  | 2 | **Control** | Force drains at each location you control | *Opponent's* hand/Life Force → their Lost Pile |
  | 3 | **Deploy** | Play cards from hand onto the table | Force Pile → Used Pile (cost); hand → table |
  | 4 | **Battle** | Initiate battles; weapons → power → damage | Force Pile → Used Pile (1/battle); table + hand/Life Force → Lost Pile (hits/attrition/damage); Reserve Deck → Used Pile (destiny) |
  | 5 | **Move** | Move characters/vehicles/starships between locations | Force Pile → Used Pile |
  | 6 | **Draw** | Draw any number from Force Pile into hand; then recirculate | Force Pile → hand; Used Pile → bottom of Reserve Deck |

  — PREM95 "Taking Turns"; RB2 pp.4–12; AR2023 p.38; BEG21 p.3.
- **[P](95/98/PC)** "Doing things in each of these phases is **optional**." — RB2 p.3.
- **[P](95/98/PC)** **Drawing cards happens only in phase 6, and only out of the Force Pile.** There
  is no draw step at the start of the turn and no draw from the Reserve Deck. Hand size is
  **unlimited** and entirely player-chosen — every card drawn is a card no longer available as Force.
  — PREM95 Phase Six; RB2 p.12; GLOS2; AR2023 p.73.
- **[P](PC)** Drawing each card is a separate action; you may draw, act, and resume drawing. Drawing
  is optional unless a card requires it. — AR2023 p.73.
- **[P](95/98/PC)** Turn ends by announcing "**The Force is with you!**" after both players have
  recirculated. — PREM95; RB2 p.12; AR2023 p.73.
- **[P](PC)** AR2023 formalises the wrapper around the six phases as: Mandatory Start of Turn Events
  → Optional Start of Turn Events → the six phases → Mandatory End of Turn Events → Optional End of
  Turn Events. — AR2023 p.38.
- **[P](95/98/PC)** **Interrupts and 'reacts' break the phase structure.** An interrupt may be played
  "during any phase, even during your opponent's turn," paid from the Force Pile. A 'react' lets the
  defender move or deploy cards to a battle location immediately after a battle is initiated, also
  paid from the Force Pile. This is why players deliberately end their turn with Force banked.
  — RB2 p.9 sidebar; PREM95 "Reacting".

---

## Not established

- **Whether the 1995 Premiere rulebook intended both players or only the active player to recirculate
  at end of turn.** Tried: full read of PREM95 (both the "Re-circulating" section and Phase Six), and
  FAQ96 (which does not address it). The text is singular and ambiguous. RB2 and GLOS2 (1998) both
  say both players, but I found no document stating whether that was a clarification or a change.
- **Whether the 1995 rulebook's "attrition is not in addition to battle damage" wording was a
  designer intent later reversed, or a drafting error clarified by FAQ96.** Tried: PREM95, FAQ96,
  GLOS2, AR2023, plus targeted web search for documented 1995→1998 rules-change lists. No source
  narrates the change; only the before and after texts exist.
- **A scanned or transcribed copy of the physical 1995 Premiere rulebook other than PREM95.** Tried:
  the Players Committee rules index at starwarsccg.org/rules/ (HTTP 403 to automated fetch) and web
  search. The starwarsccg.org mirror hosts the 1998 RB2 and later documents, not the 1995 booklet.
  All 1995-specific claims here rest on the single PREM95 transcription.
- **Any Decipher-era statement on whether a player may count their own Lost Pile.** FAQ96 says no;
  AR2023 says yes; GLOS2 does not address it.
