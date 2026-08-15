# 01 — Establish how Decipher's Force pile actually worked

Type: research
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

Decipher's *Star Wars CCG* (1995) used the player's own cards as a unified resource — commonly
called Life Force. North vs Up intends to adapt "cards as energy" and "cards as HP" to a
deckbuilding roguelite (ticket 04). Before designing that adaptation, establish what the original
actually did, as **facts**, so we build on the real mechanic rather than a half-memory of it.

Establish:

1. **The zones.** Reserve Deck, Force Pile, Used Pile, Lost Pile, Hand — what each one was and
   what it represented.
2. **Activation.** How many cards moved per turn, what determined that number, and who chose.
3. **Spending.** What it physically cost to deploy a card or take an action, and where the spent
   cards went.
4. **Damage.** How battle damage, attrition, and "Force loss" were resolved — which zone cards
   were taken from, who chose them, and where they went.
5. **The loss condition.** Exactly what state ended the game, and how a player was drained toward
   it.
6. **The cycle.** Whether and how cards returned from Used/Force piles to the Reserve Deck, and
   what happened when a deck ran out mid-turn.
7. **Known problems.** What tempo issues, degenerate strategies, or player complaints the mechanic
   was known to produce — deck-thinning, drain-lock, first-turn advantage, bookkeeping burden.

## Constraints on the answer

- **Facts only.** No recommendations. No application to North vs Up. No design opinions.
- Cite sources. Prefer the actual rulebook / official rules documents over wiki summaries; where
  only community sources exist, say so.
- Where sources disagree or the rules changed across editions, record the disagreement rather than
  picking a side.
- Flat list. Do not organise the findings into a proposal.

## Deliverable

A research file in this repo, linked from this ticket, plus the answer summary below.

## Answer

`[research]` — facts only. **Nothing here is adopted.** Ticket 04 owns the ruling on what, if
anything, North vs Up takes from this.

Full findings, in two files because they rest on two different evidence bases:

- Rules as written, items 1–6 + turn structure —
  [`research/01a-swccg-life-force-rules.md`](../research/01a-swccg-life-force-rules.md)
- Known problems, item 7 —
  [`research/01b-swccg-life-force-known-problems.md`](../research/01b-swccg-life-force-known-problems.md)

Every rules claim comes from a primary document — Decipher's 1995 Premiere rulebook, its Nov 1996
FAQ, its Nov 1998 Rulebook v2.0 and Glossary v2.0, and the Players Committee's 2023 Advanced
Rulebook and 2018 Tournament Guide. PDFs were fetched from `res.starwarsccg.org` and md5-verified
against the live URLs before reading.

**Terminology correction:** SWCCG had **one edition**. "Second edition" in this ticket's framing
conflated Decipher's *Rulebook Version 2.0* (1998) with the Players Committee's *Beginner's
Rulebook 2nd Edition* (2021). They are separate documents, cited separately.

### The facts that carry the most weight

1. **"Life Force" is exactly three piles** — Reserve Deck + Force Pile + Used Pile. Hand, table,
   Lost Pile and out-of-play are explicitly excluded. **1 unit of Life Force = 1 card**; the game
   uses no tokens or counters at all. This wording is verbatim identical across 1995, 1998 and 2023.
2. **Spending and damage are different verbs with different destinations.** Spending moves cards
   Force Pile → Used Pile, face down, and they **come back**. Losing Force moves cards face **up**
   to the Lost Pile, which is the only one-way exit. Card text distinguishes "Use 1 Force to…" from
   "Lose 1 Force to…" precisely on this axis.
3. **The loss condition is a conjunction, not a single empty deck.** You lose only when all three
   piles are simultaneously empty, checked continuously. An empty Reserve Deck mid-turn is **not** a
   loss and triggers nothing — you simply can't draw or search from it, and destiny draws still
   happen and **fail**, resolving in the opponent's favour.
4. **There is no reshuffle anywhere in the game.** The deck is shuffled once at setup. The Used
   Pile goes to the **bottom** of the Reserve Deck, unshuffled, mandatory, both players, every turn.
   Deck order is therefore substantially knowable, and destiny draws recirculate in a known position.
5. **You draw from your resource, not from your library.** There is no draw step off the deck.
   Drawing happens only in phase 6, only out of the Force Pile, with unlimited hand size — so every
   card drawn is a card removed from the resource pool.
6. **Activation is optional but Decipher concedes it is usually a non-choice**: "you do not have to
   activate all of the Force you are entitled to, *although most of the time you will want to*." The
   one documented reason to hold back is **library preservation** (keeping cards to draw destiny
   with), not economy.
7. **Force accumulates across turns.** Only the Used Pile is swept; the Force Pile carries over, and
   both rulebooks advise deliberately banking Force to be able to react on the opponent's turn.
8. **Damage has three distinct mechanisms** — weapon hits (forfeit regardless of who wins),
   attrition (payable **only** by forfeiting cards from the battle, hits both players), and battle
   damage (loser only, payable by forfeit *or* Force loss). Force loss is always the losing player's
   choice of source, but only the **top** card of any pile — free choice applies to the hand only.
9. **Force drain is the primary damage engine** and is positional: it costs 0 to initiate, needs
   only uncontested presence, and its size equals the opponent's Force icons at that location. The
   same icons that fund your activation fund their drain against you — Decipher's own rulebook calls
   this "a double-edged sword."

### Documented problems (item 7)

- **The scoring layer punishes spending your own resource.** Timed games are won by whoever has more
  Life Force left; tournament Differential = cards remaining; the first tiebreak is fewer cards in
  the Lost Pile; and conceding is *banned* so a differential always exists.
- **Force activation is the only cost in the game with its own take-back clause** (deactivate /
  reactivate freely within the phase) — circumstantial evidence that players reconsidered it often.
  The guide does not say why the rule exists.
- **Handling burden is real and procedural, not shuffling.** Five zones per player, ten across the
  table; activation and Lost Pile movement are one card at a time; both players recirculate every
  turn; the Tournament Guide devotes a whole section to pile orientation and counting. No shuffling
  complaints exist — the design is deliberately shuffle-free.
- **Deck size is not a strategic dial.** The deck is fixed at 60 because it *is* the life total, so
  the usual deck-thinning trade-off has no expression. Every SWCCG win is mechanically a mill win.
- **1998 Worlds (documented by Decipher designer Chuck Kallenbach):** Operatives stacked Force drain,
  no card limit meant ~30 copies of one card, "drained for 8+ a turn", one deck was unbeatable,
  playtesters' drain warnings were ignored, Decipher declined to act mid-event, and four cards were
  errata'd after. Decipher never banned cards, preferring counter-cards; 500+ Decipher-era cards
  ultimately carried errata.
- **Disputed:** one reviewer calls the Force system "brilliant" with decisions that sharpen late; a
  forum account calls the draw economy trivially solved ("Activate Force; Draw all the cards"). The
  severity of the Operatives incident is disputed by a participant. Recorded, not resolved.

### Recorded conflicts, not resolved

- **Zero-icon drains:** 1995 says you cannot drain where the opponent has no Force icons; 1998
  onward says you drain for zero and may modify it upward. A genuine rules change.
- **Attrition vs battle damage:** 1995 says attrition is "not in addition to" battle damage;
  FAQ96 onward treats them as separate quantities. No source narrates the change.
- **Activation granularity:** FAQ96 calls activation one discrete action; 1998 onward makes each
  unit a separate action, with knock-on effects for response windows.
- **Counting the Lost Pile:** FAQ96 forbids it; the 2023 Advanced Rulebook permits it.
- **Who recirculates:** the 1995 text is singular and ambiguous; 1998 onward says both players.
- 1995's own opening paragraph states a looser loss condition ("no cards left in his deck") that
  contradicts the three-pile definition ten paragraphs later in the same document.

### Not established

- **Every 1995-specific claim rests on a single online transcription** of the Premiere rulebook. No
  scan of the physical 1995 booklet is mirrored anywhere reachable; the official mirror hosts the
  1998 rulebook onward.
- Nine item-7 gaps, chiefly: quantified first-player advantage, any battle-free "drain-lock" deck
  named as a competitive problem, measured turn/game length in practice, analysis paralysis
  attributed to the activation choice specifically, and **any designer retrospective on the Life
  Force mechanic itself** (as opposed to on the 1998 incident).
- These gaps are partly an artefact of access: `forum.starwarsccg.org`, BoardGameGeek forums,
  Reddit, TVTropes and Wookieepedia all refused automated fetch. A session driving a real browser
  could likely close several of them.
