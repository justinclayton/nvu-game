# 16 — Cards as resource, health, or counters: a precedent survey

Reference notes for [issue 16](../issues/16-cards-as-resource-precedent-survey.md). Facts only, cited.
No application to North vs Up — that is ticket 04's job. Nothing here ranks the games or recommends
any of them.

## Scope

The subject is card games of **any genre and any era** that make the **cards themselves** do a job
normally done by a token, a dial, a cube, or a life track. Five mechanical families, per the ticket:

| Family | Definition used throughout |
| --- | --- |
| **Currency** | Cards spent from hand (or a pile) to pay a cost |
| **Health** | The deck, or a specific pile, *is* the life total |
| **Clock** | Cards running out ends the game, the round, or the run |
| **Damage** | Taking a hit inserts cards into, or removes cards from, a deck |
| **Counters / track** | Cards stand in for goods, wounds, progress, or score |

Games spanning families are filed under a **primary** family with cross-references. Section 6 lists
every game examined and **discarded**, with the reason — a discard is a finding, not an omission.
Section 7 records gaps and unverified claims.

**Excluded: Decipher's *Star Wars CCG* (1995).** [Ticket 01](01-decipher-force-pile.md) covers it in
full. It is referenced below only where another game is a documented descendant or departure, and
none of its facts are re-established here.

## Method and its limits

Roughly 50 games were examined; **31 qualified** under at least one family. Sources were pulled live
(rulebooks, publisher FAQ/errata pages, comprehensive rules, designer interviews) rather than
recalled. Three structural limits apply to everything below and are not repeated per entry:

1. **BoardGameGeek blocked automated fetching throughout** (HTTP 403/402). Every BGG citation below
   is therefore **search-index snippet level, not a full thread read**, and is marked accordingly.
2. **Several official rulebook PDFs would not parse as text** (San Juan, Race for the Galaxy,
   Bohnanza, This War of Mine, Cursed Court, ISS Vanguard FAQ, Under Falling Skies via mirror).
   Where this happened, rules transcription sites (UltraBoardGames, Rulepop, orderofgamers) and
   cross-checked secondary sources stand in, and confidence is lowered.
3. **Bookkeeping-cost figures are derived from rules text**, not from sourced player-reported counts,
   unless a source is named. No source found quantified "card moves per turn" for any game.

Confidence marks used: **[high]** primary rules text directly read; **[medium]** transcription or
multiply-corroborated secondary; **[low]** single community source or snippet-level only.

Two premises in the ticket's seed list were **falsified** by the research and are corrected in place:
Flesh and Blood's deck-out (§3.9) and Thunderstone's "Weakness" cards (§5.3). One publisher
attribution in the expanded candidate list was wrong (Fort is Leder Games, not Eagle-Gryphon).

---

## 1. Cards as currency

Cards spent from hand to pay a cost. The largest family by a wide margin, and the one where the
substitution is most often *total* — no coin, no mana token, no track exists at all.

### 1.1 San Juan (Alea/Rio Grande, Andreas Seyfarth, 2004)

The designer's own named example, and the purest one-card-three-jobs case found.

1. **Substitution.** Currency + counters/track + tableau piece, in one card family. "Each card in San
   Juan can be used in several ways: as money in a player's hand, as a building when placed face up
   in a player's play area, and as a good when placed face down on a production building."
   Critically, building costs are paid by discarding cards **equal in number, not value** — face
   value is irrelevant, only card count matters. — UltraBoardGames rules transcription
   (`ultraboardgames.com/san-juan/game-rules.php`) **[medium]**
2. **Zones and flow.** Payment cards → shared discard stack. Goods → face-down cards on production
   buildings in the tableau. Trader sells one good, discarding it face-down to the same stack and
   drawing cards equal to the tile price. **When the draw supply is exhausted the discard stack is
   reshuffled** — cards fully return to circulation.
3. **Who chooses.** Always the owning player; and because only card *count* matters, the choice of
   which card to spend is near-costless.
4. **Loss condition.** None resource-driven. The game ends when a player reaches 12 buildings.
5. **Known problems.** Martin Fowler's design-history article states flatly: "The first San Juan
   edition suffered from the Guild Hall building being overpowered — this imbalance was corrected in
   the second edition" (`martinfowler.com/articles/race-san-juan.html`) **[medium]**. Multiple BGG
   threads corroborate from the community side — "San Juan and the Overpowered Guild Hall" (389008),
   "To beat the Guild Hall, you need luck. Lots and lots of it" (123130), "Guild Hall — dominant
   winning approach (n>200)" (3196677), one indexed quote reading "This card is too strong… getting
   the guild hall in play will win a game for you" **[low — snippet only]**. Separately, a BGG thread
   "Unbeatable 2p strategy?" (396944) describes a violet-buildings/always-Builder line using
   Quarry + Carpenter + Library that players report makes the Builder role near-mandatory and
   two-player games "rather tedious" **[low — snippet only]**.
6. **Bookkeeping cost.** A Builder turn moves up to 6 cards hand→discard plus 1 hand→tableau (≈7
   moves). A Producer turn places a face-down good on every empty production building at once. Light
   overall, because a turn touches only one role's cards.

### 1.2 Race for the Galaxy (Rio Grande, Tom Lehmann, 2007)

**Directly relevant lineage note.** RftG and San Juan are **sibling designs from a shared prototype**,
not independent inventions. Lehmann and Seyfarth independently developed Puerto Rico card-game
prototypes at Alea's request; Lehmann's prototype originated "the scaled down 1–6 cost structure,
face-down discards, and cards as goods," Seyfarth used some of those ideas in San Juan, and
Lehmann's parallel prototype became RftG. — `martinfowler.com/articles/race-san-juan.html`;
Black Gate retrospective (`blackgate.com`, 2026-03-19) **[medium]**

1. **Substitution.** Currency + goods, plus a fourth job San Juan lacks: goods can be **consumed for
   VP chips** rather than only traded. Cost is again paid by discarding cards equal to the number,
   not the value. Military worlds are the documented exception — paid with a military *strength*
   total, not with card discards.
2. **Zones and flow.** Payment → central discard pile; goods → face-down cards on production worlds.
   Trade discards a good and draws cards (Alien tech 5, Genes 4, Rare elements 3, Novelty 2). Supply
   exhaustion triggers "immediately reshuffle the discards to form a new card supply." **Goods
   consumed for VP leave the card economy permanently** — real attrition, unlike San Juan.
   — UltraBoardGames **[medium]**
3. **Who chooses.** Player, for their own costs and goods; some card powers force other players to
   discard or consume, so choice is not always self-directed.
4. **Loss condition.** None resource-driven. Ends at 12 tableau cards or when the VP chip supply runs
   out.
5. **Known problems.** Reported: low interaction ("There's not much players can do either to help
   each other or to hurt each other" — Black Gate) and an iconography learning curve versus San
   Juan's plain text (Fowler) **[medium, single secondary source each]**. **A specific degenerate
   strategy or balance controversy comparable to San Juan's Guild Hall was searched for and not
   found** — record as not-found, not as absent.
6. **Bookkeeping cost.** Materially heavier than San Juan: multiple phases fire per round, every
   player who selected or piggybacks moves cards in each, Produce can place goods on every eligible
   world simultaneously, and Consume can chain multiple discards in one action.

### 1.3 Glory to Rome (Cambridge Games, Ed Carter & Carl Chudyk, 2005)

The most extreme overload found. **Also files under clock (§4.3).**

1. **Substitution.** One card becomes — depending only on which edge of your Camp it is tucked
   under — an order, a client, a raw material, a building foundation, or money. The official rules
   state it outright: "a card is never only a card. It becomes an order, a building, a client, raw
   material, or the action that drags everyone else into your plan." —
   `glory-to-rome.com/Glory_to_Rome_rules.html` **[high — official rules page, fetched as HTML]**
2. **Zones and flow.** Laborer: card → tucked under Camp's bottom edge, material name showing →
   Stockpile. Patron: card → tucked under left edge, role name showing → Clientele (capped by
   Influence). Merchant: material card → tucked under right edge face-down → Vault, where card
   values count as VP at game end (also capped by Influence). Craftsman/Architect: cards from hand or
   Stockpile → building. Jacks are wild role cards and **return to a separate Jacks pile at end of
   turn** — a distinct recycling path from normal discards.
3. **Who chooses.** The active player picks the led role; **every other player independently chooses
   whether to follow it with their own cards**. Simultaneous multiplayer conversion, not solitaire.
4. **Loss condition.** See §4.3 — deck exhaustion is one of four end triggers.
5. **Known problems.** Recurring BGG disputes over specific buildings: "Is 'Bridge' overpowered?"
   (421388), "I Seriously Hate Bridge" (815537), "Coliseum: playing correctly, or is this card
   overpowered?" (116399); indexed quotes include "I thought it was insanely overpowered" **[low —
   snippet only]**. A strategy blog characterises the game as **shifting-combo volatility rather than
   one fixed dominant line** — "one combo may be the dominant strategy in today's game while another
   will rule the day tomorrow" (Tao of Gaming, 2007) **[medium]** — an explicit contrast with San
   Juan's persistent single-card problem. Separately, and **not a gameplay flaw**: the 2012
   Kickstarter fourth edition was "badly mismanaged, resulting in the publisher going bankrupt,"
   sending the game permanently out of print (Wikipedia; Kotaku) **[medium]**.
6. **Bookkeeping cost.** Roughly one card-move per role step per participating player, but one
   player's turn triggers N parallel single-card moves as others follow. Many small moves, rather
   than few large ones.

### 1.4 Bohnanza (Rio Grande/Amigo, Uwe Rosenberg, 1997)

Different in kind from the rest of this family. **Also files under clock (§4.4).**

1. **Substitution.** Two distinct substitutions. (a) The **hand is a fixed-order FIFO queue** —
   "Cards in hand must be kept in the order in which they are dealt at all times; they may not be
   rearranged" — replacing the freely-sortable hand every other card game assumes. (b) Bean cards
   **are the tradeable goods themselves**; trading is card-for-card with no currency intermediary,
   and coins appear only at harvest. — Wikipedia; officialgamerules.org; UltraBoardGames **[medium —
   official PDF would not parse]**
2. **Zones and flow.** Hand (locked order) → planted field → at harvest, split between the player's
   **treasury** (coin-designated cards, permanently out of the card economy as score) and the discard
   pile (reshuffled back into the deck). Cards received in trade go straight to the trading area for
   planting and **cannot be traded onward**.
3. **Who chooses.** Partly **nobody** — the front of the queue must be planted, so card order, not
   the player, dictates the forced plays. Trade terms are freely negotiated multilaterally.
4. **Loss condition.** See §4.4.
5. **Known problems.** **Searched and not found.** Multiple targeted searches for complaints or house
   rules about the fixed-hand-order constraint returned nothing. Record as not-found; BGG's Bohnanza
   forum was not trawlable this pass (403).
6. **Bookkeeping cost.** Likely the highest-variance in this family: 2 forced plants + optional third,
   draw 2, then an **uncapped** trading phase where any number of cards can change hands among any
   players, then plant everything acquired. Harvest moves an entire field (often 3–8+ cards) at once.

### 1.5 7 Wonders (Repos, Antoine Bauza, 2010; 2nd ed. 2020)

1. **Substitution.** Cards discarded directly for a numeric currency (3 coins), and cards consumed as
   the **physical token marking wonder-stage completion**.
2. **Zones and flow.** Drafted card → one of three fates: own tableau (permanent, face up); tucked
   under the wonder board (permanent, face down, functions purely as a completion marker); or the
   central discard pile for 3 coins. **Each age deck is played through once with no reshuffle**, so
   discarded cards are effectively gone for that age — unlike San Juan and RftG. Forced discard rule:
   a player who can build neither the structure nor a wonder stage "is forced to discard the card and
   takes 3 coins from the bank." — official rulebook PDF; UltraBoardGames **[high/medium]**
3. **Who chooses.** The player, for their own card; the draft shapes which cards are available.
4. **Loss condition.** None — fixed 3-age structure.
5. **Known problems.** The most-repeated criticism is that **science scores exponentially while every
   other category scores roughly linearly** (The Thoughtful Gamer) **[medium]**. The community is
   **split, not unanimous**: a BGG thread "Science is bad (example)" (1874415) reportedly describes a
   player taking 10 of 12 science cards and finishing last **[low — snippet only]**. **Both positions
   are recorded; no side is picked.** The 2020 2nd edition adjusted several wonder-stage resource
   costs (e.g. Olympia stage 3 from 2 ore to 3 clay; Giza stage 2 from 3 wood to 2 clay + 1 bottle),
   characterised by reviewers as "minimal changes… mostly a cosmetic upgrade" rather than a science
   rebalance (Cardboard Mountain) **[medium; the two relevant BGG balance threads, 2485966 and
   2509060, could not be fetched]**.
6. **Bookkeeping cost.** The lightest here: exactly one card-fate decision per player per round, plus
   passing the whole remaining hand to a neighbour once per round.

### 1.6 Star Wars: Unlimited (FFG, 2024)

1. **Substitution.** Currency. Two cards are placed face-down as resources at setup; each Regroup
   Phase a player **may** place one more. Costs are paid by exhausting (turning sideways) resources,
   which ready at the start of the next round. A mana base built from your own playable cards.
   — SWU Quickstart Rules PDF; Comprehensive Rules PDF **[high]**
2. **Zones and flow.** Hand → resource zone **face-down, permanently**. Exhausted and readied each
   round, but a resourced card is gone as a playable card for the rest of the game barring specific
   effects. — TCGplayer **[medium]**
3. **Who chooses.** The player, for their own resources; no opponent input.
4. **Loss condition.** **Not** resourcing. Loss is base HP reaching zero (deck-out behaviour was not
   established from the sources retrieved).
5. **Known problems.** TCGplayer calls the resourcing decision "the most important decision in a game"
   and "not only crucial, it's also complicated" **[medium]** — a complexity observation, not a
   flaw claim. FFG has issued a Comprehensive Rules Update on Leader Units because "many new players
   assume that leader units enter/leave play like any other unit, only to be confused"
   (`starwarsunlimited.com/articles/comprehensive-rules-update`) **[high]** — adjacent card-state
   confusion, not the resource mechanic itself. **No banned/restricted card tied to the resource
   mechanic was found** in the official errata list.
6. **Bookkeeping cost.** ≤1 card moved per round, plus exhausting/readying a **growing face-down
   pile** every round. Low move count, persistent state tracking.

### 1.7 Disney Lorcana (Ravensburger, 2023)

Structurally near-identical to §1.6, but with a documented tournament-integrity consequence.

1. **Substitution.** Currency. Once per turn a player may place one **inkable** card (golden swirl)
   face-down into their Inkwell, **showing it to the opponent first**; inkwell cards are exerted for
   1 ink each to pay costs.
2. **Zones and flow.** Hand → Inkwell, face down, permanently. Comprehensive Rules: "Players cannot
   look at the front face of the cards that are in any player's inkwell and any cards in the Inkwell
   remain there until the end of the game." **[medium — quoted via search index of the official
   Comprehensive Rules PDF]**
3. **Who chooses.** The player — but must reveal the card to the opponent at the moment of inking, so
   the opponent has the information even though **neither** player may inspect the pile afterwards.
4. **Loss condition.** Not ink-related.
5. **Known problems — the strongest bookkeeping evidence in this family.** Ravensburger's official
   **Play Correction Guidelines** define an **"Inkwell Error"** (wrong card count in the inkwell) and
   prescribe judge remediation: investigate to identify the missing or extra card, and if it cannot
   be determined, "add a random card from the player's deck facedown without revealing its identity."
   (`cdn.ravensburger.com/lorcana/play-correction-guidelines-en`) **[high — official publisher
   document]** This is a publisher formally acknowledging that a permanently-hidden, unverifiable
   resource pile produces real errors at competitive tables. Separately, Hiram Flaversham (Toymaker)
   and Fortisphere were banned in April 2025 to "cut down on the strength of Item decks," with
   Fortisphere cited for "a draw-engine meta… creating a predictable and never-ending loop"
   (The Gamer; CBR; Lorcana Player) **[medium]** — **no source ties these bans to the inkwell
   mechanic, and that connection is explicitly not asserted here.**
6. **Bookkeeping cost.** 1 card per turn plus exert/ready of the growing pile — same shape as SWU,
   **plus** the distinctive burden that players must track from memory what is in a large opaque pile
   neither side may inspect. The official error procedure above is direct evidence this is nontrivial.

### 1.8 Flesh and Blood (Legend Story Studios)

1. **Substitution.** Currency, and the most fully-generalised version found: **every card carries a
   printed pitch value** (1/2/3, colour-coded red/yellow/blue). When short of resource points, a
   player pitches cards from hand one at a time, each generating its pitch value, until the cost is
   covered. — FaB Comprehensive Rules, Game Concepts and Zones sections
   (`rules.fabtcg.com`) **[high]**
2. **Zones and flow — the key departure from §1.6/§1.7.** Hand → **Pitch Zone**, which CR 3.14.1
   defines as "a public zone outside the arena, owned by a player." At end of turn **all pitched cards
   go to the bottom of the owner's deck, in an order the owner chooses**. Pitched cards therefore
   **return to circulation and will be redrawn** — they are not permanently spent, unlike Lorcana ink
   or SWU resources. **[high]**
3. **Who chooses.** The paying player, both which cards and in what order they will return.
4. **Loss condition — the ticket's premise is FALSIFIED.** The seed list states "deck-out as loss
   condition." **The Comprehensive Rules do not list deck exhaustion as a loss condition.** CR 4.4.3f
   specifies only "The turn-player draws cards until the number of cards in their hand is equal to
   their hero's intellect," with no empty-deck clause, and the loss-conditions section (4.5.3) does
   not mention it. Community confirmation: "You don't lose the game when you run out of cards in
   Flesh and Blood. If you are unable to draw fully up to hand size, you'll simply draw as much as
   you can and continue the game" (BGG thread 2383383). **Loss is life total reaching zero.**
   **[high — primary rules text checked directly]**
5. **Known problems.** "Fatigue" strategies are a named, discussed concern: an article describes
   attacks that "chip your opponent's life total gradually, but you are unable to finish the last few
   points of damage before your opponent turns the table on you, running your deck out of relevant
   threats," and notes blocking means "being down one of your best threats for the rest of the game";
   it calls such strategies "frustrating as you feel powerless" while treating them as a legitimate
   skill layer rather than a defect (FABREC) **[medium]**. **Pitch tracking of the opponent's cards
   is a recognised competitive skill burden** — "Pitch tracking is a huge part of competitive Flesh
   and Blood, but learning it is tricky" (TCGplayer); LSS itself publishes strategy content on
   "Pitch Stacking" (`fabtcg.com`) **[medium/high]**. Multiple B&R lists exist but target individual
   cards, **not the pitch system**.
6. **Bookkeeping cost.** **The heaviest per-turn of the constructed-CCG group**: a variable number of
   cards pitched per turn (potentially several per single card played), each moved hand → pitch zone
   → bottom of deck in a chosen order at end of turn. Contrast SWU/Lorcana's flat one-per-turn.

### 1.9 Marvel Champions: The Card Game (FFG)

1. **Substitution.** Currency. "Resources can be generated by discarding a card from hand, which
   generates a number of resources equal to the number of resource icons on the card." Three types
   (energy, mental, physical) plus wild. — UltraBoardGames rules summary; Rules Reference Guide
   **[medium]**
2. **Zones and flow.** Hand → discard pile, generally permanent. No automatic return rule (contrast
   FaB §1.8); recovery requires specific effects — e.g. Pepper Potts can exhaust to generate
   resources from the top discard-pile card **[medium]**.
3. **Who chooses.** The player, from their own hand; no opponent interaction.
4. **Loss condition.** Not tied to this mechanic — loss is scenario-based (hero defeat / villain
   victory).
5. **Known problems.** **Searched and not found.** No errata, FAQ ruling, or substantive community
   complaint specifically about the discard-for-resources mechanic surfaced. The nearest related
   erratum concerns hand size, not resourcing: Iron Man's ability was errata'd to read "(to a maximum
   of +6 hand size)" to settle an Assess the Situation interaction (Hall of Heroes rulings
   compilation) **[low/medium]**. **Read as not-found, not as confirmed-absent** — search-tool
   limits are a plausible explanation.
6. **Bookkeeping cost.** Variable cards discarded per turn as costs require; framed as part of playing
   a card rather than a separate zone step.

### 1.10 Arkham Horror: The Card Game (FFG) — commit mechanic only

**Primary economy discarded:** Arkham's general resource economy is **token-based, not cards** — the
core set includes 61 resource tokens and gaining 1 resource is an action. (Learn to Play PDF;
Arkham Horror LCG Wiki) **[medium]** The qualifying mechanic is narrower. **Primary family is
counters/track — see §5.4.**

### 1.11 Ashes Reborn (Plaid Hat Games) — secondary mechanic only

1. **Substitution.** **The primary resource system is a 10-die custom dice pool, not cards** — this
   game is a partial qualifier only. The qualifying mechanic is **Meditate**, a side action: "discard
   cards to change the facings of your dice… you can discard as many cards as you want to change as
   many dice as you want," discarding from hand, draw pile, **or the spellboard** (an in-play ready
   spell). — Plaid Hat product page; `wiki.ashes.live` rulebook pages; community rules explainer
   **[medium]**
2. **Zones and flow.** Hand / deck top / spellboard → discard pile, permanently.
3. **Who chooses.** The player, including which of three zones to draw the cost from.
4. **Loss condition.** Not card-based — Phoenixborn health reaching zero.
5. **Known problems.** **None found specific to Meditate.** Ashes has had general errata and ban-list
   updates (Plaid Hat, April 2025) but nothing retrieved ties them to this mechanic.
6. **Bookkeeping cost.** **Uncapped by rule** — "as many cards as you want" — bounded only by hand and
   deck size.

### 1.12 Star Wars: The Card Game (FFG LCG, 2012) — edge battles only

Distinct from §1.6 despite the shared IP. **The primary resource system does not qualify** — resources
come from focus tokens on ready affiliation and objective cards, a tap system.

1. **Substitution.** Currency, but by a mechanism found nowhere else in this survey: hand cards are
   **secretly bid** in a **blind auction**. "Players vie for initiative by secretly bidding cards from
   their hand facedown, one at a time… they compare the number of Force icons on the cards they've
   bid, the cards they bid are discarded, and the winner gains the edge." Players alternate placing
   one card face-down or passing until both pass consecutively. — FFG forum archive **[medium]**
2. **Zones and flow.** Hand → edge stack face-down → **all bid cards from both players are discarded**
   on resolution. No persistent pile between turns.
3. **Who chooses.** **Both players, blind, against each other** — the only genuinely interactive,
   bluff-bearing spend in this family. Everything else here is a solitaire decision.
4. **Loss condition.** Not tied to edge battles.
5. **Known problems.** A reviewer notes the mechanic inverts normal hand economy: "unlike other card
   battle games where your hand of cards is a precious resource to be judiciously conserved, you
   probably want to dump most of your hand absolutely every turn" **[low]**. Designer Eric Lang
   described edge battles as adding "a psychological element that is sometimes game-defining, other
   times peripheral" (Theology of Games interview, 2012) **[medium]**. A 2022 retrospective praises
   the mechanic and reports no criticisms; the game's 2018 discontinuation is attributed to Disney's
   decanonisation of the Expanded Universe, **not** to the mechanic (Spalanz) **[medium]**.
6. **Bookkeeping cost.** 0 to a full hand per edge battle, one card at a time, with edge battles
   recurring at multiple points per round. **Transient rather than cumulative** — nothing to maintain
   between turns.

### 1.13 Etherfields (Awaken Realms)

**Also files under health/clock — see §4.8.**

1. **Substitution.** Currency. Cards in hand are spent to generate **Intent** (three types: Awareness,
   Wrath, Cunning), used to move models, play other cards, and interact with objects. — Awaken Realms
   rulebook PDF; orderofgamers summary **[medium]**
2. **Zones and flow.** Hand → discard pile, **and the order of discarding matters** — the official FAQ
   carries a dedicated thread, "Order of discarding Influence cards" (`etherfields-secrets.com`)
   **[medium]**.
3. **Who chooses.** The player, including the discard ordering.
4. **Loss condition.** See §4.8 — running the deck empty costs HP or permanent cards.
5. **Known problems.** The rulebook itself is criticised: "the rulebook for Etherfields is filled with
   beautiful artwork and packed with info, but its layout is problematic and confusing"
   (BoardGameQuest) **[medium]**. The existence of **multiple dedicated official-FAQ threads about
   the empty-deck interaction** is itself evidence of recurring rules friction, though no source
   calls the mechanic broken **[medium]**.
6. **Bookkeeping cost.** Multiple cards discarded per turn to generate Intent (a cited example spends
   3 cards to activate 1), plus discard-order tracking, plus periodic full reshuffles with a penalty
   to resolve. **Heavy relative to the other campaign games surveyed.**

### 1.14 Inscryption (Daniel Mullins Games)

1. **Substitution.** Currency, paid in **already-played creatures**. Cards have a **Blood cost** (1–3);
   to pay it the player **sacrifices creatures on the board**, killing them. Most creatures yield
   1 Blood; those with the Worthy Sacrifice sigil yield 3. A parallel resource, **Bones**, is
   generated automatically whenever a controlled creature is sacrificed or dies. — Inscryption Wiki;
   TechRaptor guide **[medium]**
2. **Zones and flow.** Board → dead, permanently. The game supplies a dedicated free fuel stream:
   0-cost 0/1 **Squirrel** cards from a separate draw source, existing specifically to be sacrificed
   without competing with main-deck draws.
3. **Who chooses.** The player, from their own board.
4. **Loss condition.** Not sacrifice-related.
5. **Known problems.** The Squirrel-sacrifice loop is a documented community "game breaker": sigils
   such as Fecundity (a free extra squirrel in hand on death) combined with squirrel-boosting effects
   generate near-infinite free sacrifice fuel, "reducing or completely eliminating the need to draw
   additional squirrels for sacrifices" (TV Tropes) **[low — community characterisation; no official
   statement calling this a design flaw was found]**.
6. **Bookkeeping cost.** Digital; automatic. Per play: N creatures removed plus N Bone triggers.
7. **Origin.** The mechanic is the game's seed, not a later addition: Mullins built it for the 2018
   Ludum Dare theme "sacrifices must be made" — "I wanted to make a card game that involved
   sacrificing as a mechanic, but I wanted to push the theme further by having your avatar sacrifice
   body parts as a game mechanic" (Game Developer interview) **[high — designer statement]**.

### 1.15 Magic: The Gathering — the Necropotence family (the inverse substitution)

The ticket asks for this explicitly as the **inverse**: not cards standing in for life, but **life
standing in for cards**. **MTG also files under clock — see §4.1.**

1. **Substitution.** Currency, running backwards. Necropotence (BBB, enchantment) reads: "Skip your
   draw step. Whenever you discard a card, exile that card from your graveyard. **Pay 1 life: Exile
   the top card of your library face down.** Put that card into your hand at the beginning of your
   next end step." Life total becomes the currency that buys card advantage. — Scryfall; MTG Salvation
   rulings mirror **[high]**
2. **Zones and flow.** Library → exile face-down → hand at the next end step. Life is spent and does
   not return.
3. **Who chooses.** The controller, freely and repeatedly.
4. **Loss condition.** Indirect — life spent is life not available to survive on.
5. **Known problems — the best-documented in this entire survey.** Necropotence has been restricted or
   banned repeatedly across three decades:
   - **Restricted in Vintage effective 2000-10-01** (announced by the DCI 2000-09-01). DCI reasoning
     as quoted by Eternal Central's history of the format: "Over the past 3 years, this card has
     become more and more dominant in the Type I format." Demonic Consultation was restricted in the
     same announcement because "In a format where all the other 'tutor' cards are restricted…
     Demonic Consultation stood out as a powerhouse." **[medium — secondary source quoting the
     original DCI announcement, not the primary WotC text]**
   - Currently also **banned in Legacy and Premodern** (draftsim; mtg.fandom B&R timeline)
     **[medium]**.
   - Historical dominance: rose to prominence in 1996's "Black Summer"; at the March 2000 Magic
     Invitational **9 of 16 competitors played "Necro-Donate"** (Eternal Central) **[medium]**.
   - **Still being restricted in 2026.** A WotC Banned & Restricted announcement dated **2026-02-09**
     addressed Necropotence in Timeless, citing that "Mono-Black Necropotence variants had emerged as
     the clear strongest decks in Timeless… while allowing decks to reliably assemble their combos
     while making it impossible to compete with on a card-advantage axis."
     (`magic.wizards.com/en/news/announcements/banned-and-restricted-february-9-2026`) **[high —
     current primary WotC source]** Twenty-six years after its first restriction, the same card is
     still drawing bans.
6. **Bookkeeping cost.** Trivial — a life payment and an exile trigger; no card relocation beyond
   replacing the draw step.
7. **Adjacent family, not researched in depth.** Phyrexian mana (pay 2 life instead of a coloured
   mana) and Bargain-style sacrifice costs were named as comparators but **were not verified in
   detail this pass** — see §7.

### 1.16 Gloomhaven / Frosthaven (Cephalofair, Isaac Childres) — damage negation

Cards **lost** from hand to negate incoming damage are a card-for-effect spend. **Primary family is
clock — see §4.5**, where the exhaustion rule and the Gloomhaven/Frosthaven differences are recorded.

---

## 2. Cards as health

The deck, or a specific pile, **is** the life total. The rarest family — and notably, several games
widely assumed to belong here do not (see §6).

### 2.1 Coup (Indie Boards & Cards, Rikki Tahta)

The cleanest cards-as-life-total in the survey, and the lightest.

1. **Substitution.** Health **and** action economy on the same two cards. "Facedown cards in front of
   a player represent who they influence at court. The characters printed on their face down cards
   represents which characters that player influences and their abilities." Two face-down cards
   **are** a two-point life total; there is no HP token or track in the box at all. — official rules
   text via `coups.app/rules` **[high — direct quote]**
2. **Zones and flow.** Face-down → **face-up in place** on losing an influence. Lost cards stay on the
   table face-up, so each lost "hit point" becomes **public information** about what that player held.
   The Ambassador action is the only way to change which characters you hold: draw 2 from the Court
   deck, optionally swap either or both, return 2.
3. **Who chooses — explicitly the victim.** "Each player always chooses which of their own cards they
   wish to reveal when they lose an influence." **[high — direct quote]** Not the attacker, not
   random.
4. **Loss condition — this mechanic is the entire elimination rule.** "When a player has lost all
   their influence and both their cards are face up in front of them, they are immediately out of the
   game." **[high — direct quote]**
5. **Known problems — a documented two-player degeneracy.** A strategy site reports: "the official
   rules for two players aren't so great. The main issue identified is related to the Assassin
   character: the Assassin character is so overpowered that the game essentially always comes down to
   one decision," plus a first-player advantage the official 2-player variant fails to fix — "these
   changes seem like they would help, but in reality they don't significantly make the game better at
   two" (Shelf Gamer) **[medium — single fan strategy site, not a publisher post-mortem]**.
   Community fixes proposed on BGG (thread 2394590) **raise total influence from 2 to as many as 5–6
   per player** specifically to blunt the instant-loss swinginess of a 2-card life total: "Players
   aren't out of the game instantly after their first mistake" **[low — snippet only]**. **No official
   Indie Boards & Cards errata or FAQ was located** — recorded as unconfirmed, not absent.
6. **Bookkeeping cost.** Among the lightest found: exactly 2 cards per player, **flipped in place**,
   never removed from the table, no separate token.

### 2.2 Legendary Encounters: Alien (Upper Deck)

The one game in this survey where a card-based system is **literally and solely** the loss condition.
**Also files under damage — the mechanic is dual by construction.**

1. **Substitution.** Health/damage. Strike cards physically **accumulate under the player's avatar
   card** as the running damage total, replacing what would be a damage dial or token pile.
2. **Zones and flow.** A **separate shared Strike deck** (not the player's own deck) → drawn one at a
   time on being hit → placed **under the avatar card**, accumulating for the rest of the game. On
   defeat, "remove all your cards from the game" — deck, hand, discard, and strike pile alike. —
   Legendary Encounters: ALIEN rules summary v1.1 (orderofgamers) **[medium — retrieved via proxy
   after direct 403s; cross-confirmed by BGG thread 1614609]**
3. **Who chooses.** **Nobody** — forced and random. "When an enemy strikes you, draw 1 card from the
   strike deck and apply the damage by placing the card under your avatar card."
4. **Loss condition — direct.** "If your avatar ever has DAMAGE equal to or greater than its HEALTH
   (heart icon), you are defeated and out of the game… You no longer take turns and remove all your
   cards from the game." **[medium — direct quote from the fetched rules summary]**
5. **Known problems.** Player elimination is a recognised community complaint, with fan variants
   circulating to remove it entirely (BGG video, "Legendary Encounters: Alien — No more player
   elimination") **[low]**. This targets the **elimination outcome**, not the card-pile-as-tracker
   bookkeeping; **no source criticising the pile-as-damage-tracker specifically was found.**
6. **Bookkeeping cost.** One card moved per hit received, potentially several per round — **but the
   damage total must be computed by summing values across an accumulated pile rather than read off a
   single dial**, which is inherently higher-friction than a numeric tracker.
7. **Note.** The game's ordinary economy (Recruit and Attack points) is pool-based and does **not**
   qualify. Whether the non-Alien Legendary Encounters titles share the identical Strike mechanic
   **was not verified** — see §7.

### 2.3 ISS Vanguard (Awaken Realms)

1. **Substitution.** Health/damage. **Injury cards are the entire crew-health system** — there is no
   separate HP number or dial. An injury places an Injury Card **plus a matching yellow Injury Die**
   into one of **three numbered slots** beside the crew member's tray. — `myissvanguard.wordpress.com`
   **[medium — fan blog; the official rulebook would not parse. The "no separate HP tracker" claim is
   the weakest link and is flagged in §7.]**
2. **Zones and flow.** Injury card + die → a numbered slot, where it stays. Whenever that crew member
   rolls their Section dice they **also roll all their Injury dice**, resolving each against its
   slotted card in order. Healing is reported as sparse — "I did not see that many ways to actually
   heal the injuries," limited to same-sector Medkits, some Discovery cards, and select Section cards.
3. **Who chooses.** Semi-random — injuries arrive via dice results and events; matching multiple
   injury dice to multiple slotted cards can involve choice.
4. **Loss condition.** Graduated and card-gated. **Third** injury: the crew member "immediately
   become[s] 'dying'" — miniature laid on its side, dice pool capped, a success token discarded. A
   **fourth** injury has nowhere to go (only three slots exist), so a success token is discarded
   instead, and a character then has "a chance of dying after the scenario" (Shelfside) **[medium]**.
5. **Known problems.** Reviews describe the broader game as bookkeeping-heavy, with ship management
   run through "a literal binder full of cards" that players "slot in and out of binder pages"
   **[low/medium]**. A critical BGG review ("ISS Vanguard Is Not A Game," thread 3417626) **exists but
   could not be fetched (403)** — recorded as an unverified lead, its substance not reported as fact.
6. **Bookkeeping cost.** Per injury: 1 card + 1 die placed. Per activation while injured: roll all
   injury dice, match each to its slotted card, apply each effect. Plus the separate binder layer.

### 2.4 Love Letter (AEG, Seiji Kanai)

The minimal case: **one card is simultaneously your identity, your action, and your entire life
total.**

1. **Substitution.** A single held card carries identity, the turn's action, and the elimination
   condition. There is no other state for a player in a round.
2. **Zones and flow.** Setup sets one card aside face-down unseen (plus extra face-up cards at low
   player counts "so the process of elimination cannot be used to prove which cards are left"); each
   player holds one face-down card. On a turn, draw the top card (briefly holding two), play one,
   resolve its printed effect. — Wikipedia; UltraBoardGames **[medium — no primary AEG/Z-Man rulebook
   PDF was fetched directly]**
3. **Who chooses.** The player picks which of two held cards to play; the card's identity then
   determines whether elimination is forced on self, on an opponent, or is a guess (Guard).
4. **Loss condition.** A player is eliminated from the round exactly when they lose their single card
   to a forced discard — e.g. the Princess rule: discarding it "by any means, including this card's
   own effect" eliminates you. The round otherwise ends when the deck runs out, highest card held
   winning **[medium — strategy-site paraphrase, BoardGameArena tips page]**.
5. **Known problems.** A specific vulnerability is discussed: "If an opponent play[s] a Priest when
   you hold a Princess you won't be able to play it and can easily be guessed on their next turn if
   they play a Guard" **[low]**. Guard-guessing is documented as probabilistic in the opening, with
   community advice to bias early guesses toward middle-value cards "because these cards appear
   twice, while King and up only appear once" **[low]**. **No official designer post-mortem or errata
   was located.**
6. **Bookkeeping cost.** The lowest possible: one card drawn, up to one discarded, per turn. The whole
   resource system is 1 (momentarily 2) cards.

---

## 3. Cards as clock

Cards running out ends the game, the round, or the run. Note how often the designers **soften** it.

### 3.1 Magic: The Gathering — drawing from an empty library

1. **Substitution.** Clock. The library is a finite countdown that kills you when it empties.
2. **Zones and flow.** Library → hand, one-way during a normal game.
3. **Who chooses.** Nobody — it is a state-based action, checked automatically.
4. **Loss condition — verified against the current primary text.** Comprehensive Rules **104.3c**:
   "If a player is required to draw more cards than are left in their library, they draw the
   remaining cards and then lose the game the next time a player would receive priority. (This is a
   state-based action. See rule 704.)" — `media.wizards.com/2026/downloads/MagicCompRules 20260807.txt`
   **[high — official rules file, fetched directly]**
   **Recorded disagreement on citation, not substance:** secondary sources cite this rule under older
   numbering (704.5b, 704.5g) because WotC renumbers state-based actions periodically. **104.3c is
   the current, directly-verified number.** The rule triggers on *attempting* to draw with an empty
   library regardless of cause, and a player can survive indefinitely at zero cards if never required
   to draw.
5. **Known problems.** Deck-out as a deliberate win condition ("mill") is a long-standing archetype;
   no errata treats the loss rule itself as a mistake.
6. **Bookkeeping cost.** Zero ongoing; the deck's physical thickness is the display.

### 3.2 Hearthstone (Blizzard) — fatigue, and a designer's stated reason for softening

The clearest recorded case of a designer **rejecting** instant deck-out death and replacing it.

1. **Substitution.** Clock converted into escalating damage. Drawing from an empty deck deals
   **Fatigue** damage instead of causing an immediate loss: 1, then 2, then 3, and so on, so
   cumulative damage follows N(N+1)/2. Damage **never resets** even if the deck is restocked. —
   `hearthstone.wiki.gg/wiki/Fatigue` **[medium — wiki, multiply corroborated]**
2. **Zones and flow.** Deck → hand until empty; thereafter each attempted draw is a damage event.
3. **Who chooses.** Nobody — automatic.
4. **Loss condition.** Fatigue kills via the normal health total rather than by an instant deck-out
   rule.
5. **Known problems and origin.** The design reason is on record. In early playtesting Jeff Kaplan
   nearly won a match and then **instantly lost by drawing from an empty deck**, which "felt hollow"
   because every prior good decision was erased by a binary loss; Team 5 concluded they needed "a
   different solution for running out of cards," producing escalating Fatigue so "every decision made
   and every point of damage inflicted matters" while the game still ends. Attributed to Ben Brode
   **[medium — widely corroborated secondhand; the original PC Gamer article was paywalled and could
   not be read directly]**. The mechanic is also stated to be borrowed from World of Warcraft's
   out-of-bounds fatigue debuff. Only one official patch touching fatigue was found: **Patch
   4.0.0.10833 (2015-11-10)** fixed hero-replacement effects (Jaraxxus, Majordomo) incorrectly
   resetting the fatigue counter to 1. The base 1/2/3/4 formula appears **unchanged since 2014**.
   Persistent community complaint: fatigue-driven control mirrors are tedious — "Priest mirror
   matches are… basically two people staring at the screen waiting for the other person to do
   something" (Blizzard official forums thread 156681; HearthPwn) **[medium — community, but
   consistent across independent threads spanning 2014–2026]**.
6. **Bookkeeping cost.** Zero — digital, tracked and displayed automatically.

### 3.3 Glory to Rome — deck exhaustion as an end trigger

Cross-reference §1.3. "The game ends when any of the following occur: **The draw deck runs out** …
All Site cards have been claimed … A Catacomb is completed … Any player has a completed Forum
structure and at least one of each client type." — official rules page **[high]** Unlike San Juan and
RftG, whose discards reshuffle indefinitely, Glory to Rome's deck genuinely runs dry and ends the
game.

### 3.4 Bohnanza — the third exhaustion

Cross-reference §1.4. "The discard pile is reshuffled and re-used as the deck; **this happens twice.
The game ends instantly the third time the deck runs out.**" — Wikipedia; officialgamerules.org
**[medium]** A counted, three-strike clock rather than a single depletion.

### 3.5 Gloomhaven / Frosthaven — exhaustion

1. **Substitution.** Clock **and** currency (§1.16). Hand cards are the round-by-round fuel; running
   out of them removes a character from the scenario, entirely separately from HP.
2. **Zones and flow.** Hand → discard (normal play) or **lost pile** (permanent, when played for a
   "lost" effect or lost to negate damage). **Short Rest** loses one **random** card from the discard
   pile; **Long Rest** lets the player **choose** which discarded card to lose and returns the rest to
   hand.
3. **Who chooses.** Player, for the two cards played each round and for Long Rest losses; **random**
   for Short Rest.
4. **Loss condition — two independent routes, one of them purely card-based.** "A character can become
   exhausted in one of two ways: If a character ever drops below one hit point on the hit point
   tracker, **or if, at the beginning of a round, a player cannot play two cards from his or her hand
   and also cannot rest.**" — community transcription of the printed rulebook (GitHub
   `m-ender/gloomhaven-rules`) **[medium — unofficial transcription, matches multiple independent
   paraphrases]**. The official Gloomhaven 2E FAQ confirms the two are decoupled: "Exhaustion due to
   insufficient cards **does not affect a character's current hit point total**," that scenario
   rewards are still granted if the scenario is completed, and that "**If all characters become
   exhausted during a scenario, the scenario is lost.**" — `cephalofairgames.github.io/gloomhaven2e-faq`
   **[high — official FAQ]** A single character exhausting is a soft loss; only total exhaustion loses
   the scenario.
5. **Recorded edition differences (Gloomhaven vs Frosthaven).** The Frosthaven official FAQ states
   "Cards without lost icons in your active area count as being in your discard pile for the purposes
   of whether you can long rest and what is eligible to lose during a long rest, but don't have to be
   returned to your hand when resting" — Frosthaven's active area changes the Long Rest arithmetic.
   A community rules-diff document additionally states "cards in the active area cannot be lost to
   negate damage," i.e. Frosthaven **narrows** which cards can be spent as damage-negation currency.
   **[medium — no authoritative side-by-side official changelog was accessible; both fetches were
   partial. Recorded as a difference, without picking a canonical version.]**
6. **Known problems.** **No designer post-mortem or erratum admitting a mistake in the exhaustion rule
   was found.** The official FAQ entries located are edge-case clarifications (Battle Goals, Mastery,
   summons), not corrections. High Steam-forum discussion volume around the rule suggests real-world
   confusion **[low — inferred from thread volume, not a stated complaint]**.
7. **Bookkeeping cost.** 2 cards played per character per round routed to two different piles, plus
   rest handling: draw or choose 1 to lose permanently and return the remainder to hand.

### 3.6 Aeon's End (Indie Boards & Cards, Kevin Riley)

**Life is NOT cards here — discard that sub-hypothesis.** Each player takes **10 life tokens**;
Gravehold and the Nemesis use **life dials**. — Aeon's End Wiki rules; Fandom Life page **[medium]**
Two things do qualify. **Also files under damage — see §4.3.**

1. **Substitution (clock).** The **nemesis deck** is a literal countdown that can win the game for the
   players: "Aeon's End can be won by either reducing the nemesis to zero health **OR by exhausting
   the nemesis deck of all cards with no cards in play.**" — Aeon's End Wiki **[medium]**
2. **Zones and flow.** The nemesis deck draws down each nemesis turn and **does not reshuffle**: if a
   draw is required and it is empty, "the Nemesis triggers the Unleash effect three times" instead —
   an explicit anti-reshuffle punishment.
3. **Who chooses.** Nobody — the nemesis is automated.
4. **Loss condition.** Loss is Gravehold reaching 0 life or all players exhausted; the deck clock is a
   **win** condition for players, not a loss. An unusual inversion worth recording.
5. **Known problems.** **Not found this pass.**
6. **Bookkeeping cost.** One nemesis card per nemesis turn.

### 3.7 5-Minute Dungeon (Wonder Forge / Ravensburger)

A rare **hard, unforgiving** card clock with no reshuffle at all.

1. **Substitution.** Clock. The deck's physical exhaustion — not a counted value — is a loss.
2. **Zones and flow.** Draw pile → played to match dungeon symbols or discarded for a hero power →
   discard pile, **which is never reshuffled**: "Discard piles do not get shuffled back into the draw
   pile once the draw pile is empty, meaning that if your deck ever runs out you can no longer draw
   cards — unless someone plays a card that gives you cards from your discard pile." — Geeky Hobbies
   rules summary, corroborated by UltraBoardGames **[medium]**
3. **Who chooses.** Fully cooperative, real-time, no turn order — self-directed under time pressure.
4. **Loss condition — three routes, one card-based.** "Players lose if they are unable to defeat the
   final boss before the timer runs out, **or if all of the players run out of cards**, or if your
   party is unable to match the symbols of a card in the Dungeon." **[medium]**
5. **Known problems.** Multiple independent reviews report high difficulty and loss rates — "the
   majority of the games we played ending up in a loss, just against the first, weakest, boss" — and
   draw-luck roadblocks: "you might end up hitting a roadblock fairly early on, or right when you hit
   the boss" (Sprites and Dice; Co-op Board Games) **[medium]**. Reviewers also flag the real-time
   format as hard on mixed-skill groups. **No errata or forum thread specifically about the
   deck-as-clock was located.**
6. **Bookkeeping cost.** **Formally near-zero — nothing is counted** — but the physical tempo is the
   highest in the survey: continuous card-slapping for five minutes, no turns.

### 3.8 Sleeping Gods (Red Raven Games, Ryan Laukat)

1. **Substitution.** Clock only — health and ship damage are tokens and cubes, not cards.
2. **Zones and flow.** An 18-card Event deck built at setup by drawing 6 "deadly," 6 "perilous," and
   6 "mild" cards, stacked mild-on-top. One card is drawn and resolved per turn; some persist near
   the ship board until a discard condition is met. — Rulepop rules summary **[medium]**
3. **Who chooses.** Random (order fixed at setup).
4. **Loss condition — none.** The deck is a **pure pacing device**: "After you have drawn all cards
   from the event deck, finish the current player's turn. On the next turn, read paragraph 1 in the
   storybook instead of drawing an event card." The deck exhausts **three times** over a campaign,
   each time redirecting to the next storybook paragraph rather than reshuffling or ending anything.
   Defeat is separate: crew at 0 health, or 11 damage cubes on the ship. **[medium]**
5. **Known problems.** A reviewer on overall load: "This game felt like work. I felt like I was doing
   my taxes," citing "so many tokens to keep track of (command, fatigue) and 8 characters (!) to
   manage and ability cards and the ship board and the event deck" (coopgestalt.com) **[medium —
   single reviewer; the complaint is about total bookkeeping, of which the event deck is one part]**.
6. **Bookkeeping cost.** One draw-and-resolve per turn, plus set-asides for persistent effects whose
   discard conditions must be tracked.

### 3.9 Legendary: Marvel / DC (Upper Deck) — deck-out is a DRAW, not a loss

**A seed-list premise corrected.** The expanded candidate list assumed "Villain deck runs out =
heroes lose." The available sourcing says otherwise.

1. **Substitution.** Clock (villain deck as timer) + counters/track (the Mastermind's 4 Tactics cards
   are a literal 4-hit-point boss damage track).
2. **Zones and flow.** One villain-deck card is revealed at the start of each player's turn (villain,
   bystander, scheme twist, or master strike). Four Tactics cards sit face-down under the Mastermind;
   a successful attack draws one, and "when all four of these tactics are gone, the Mastermind is
   defeated and the game is won." Player hero decks reshuffle from their own discard **with no
   penalty**. — gamerules.com **[medium — rules-summary site; the official Upper Deck PDF was not
   retrieved as parseable text]**
3. **Who chooses.** Nobody — the villain reveal is forced and automatic.
4. **Loss condition — two distinct triggers, and the deck one is a draw.** (a) "**If either the
   Villain deck or the Hero deck run out of cards, and the players cannot successfully finish the
   Mastermind by the end of that turn, the game is a draw.**" (b) Separately, scheme completion is a
   genuine loss: "If players fail to stop the mastermind in time, then they will complete their scheme
   and evil wins!" **[medium — the "draw" wording was consistent across three independent search
   results but was not confirmed against a primary Upper Deck rulebook; flagged in §7.]**
5. **Known problems.** Reviewer criticisms surfaced are general deckbuilder complaints, **not aimed at
   the villain-deck clock**: all-or-nothing attacking producing dead turns where a player "has great
   cards but still can't do anything," market-affordability dead turns, thin player-to-player
   cooperation, and thematic dissonance from mixing unrelated heroes **[low/medium — search
   paraphrases of review content]**. A BGG thread "Legendary: bad deck builder, bad game" (1422210)
   **exists but could not be fetched** — unverified lead.
6. **Bookkeeping cost.** One forced villain-deck flip per player turn plus normal deckbuilder moves.

### 3.10 Etherfields — the empty-deck penalty

Cross-reference §1.13. Deck exhaustion is **not** a loss but carries a priced penalty: "If your
Influence deck runs out of cards at any time, you reshuffle your Discard pile into a new deck and
draw the remaining required cards, **but you will suffer a penalty of either 1 damage OR sealing 3
cards**." A dedicated official FAQ thread ("Drawing/discarding cards from an empty deck out of the
Draw step") confirms this is codified, not merely inferred. — `etherfields-secrets.com` **[medium]**
Notable as a hybrid: cycling the currency deck too fast **converts directly into HP loss or permanent
card loss**.

### 3.11 Mage Knight — the round-by-round fatigue curve

Cross-reference §4.2. Wounds accumulating in the deck are simultaneously a damage record and a
dilution clock across the round structure.

---

## 4. Cards as damage

Taking a hit inserts cards into, or removes cards from, a deck.

### 4.1 Undaunted: Normandy / North Africa / Reinforcements (Osprey, Trevor Benjamin & David Thompson)

The most-cited example of cards-are-units-and-casualties-are-card-removal.

1. **Substitution.** Damage. The cards **are** the squads; a hit permanently removes a specific unit
   card from the target's deck.
2. **Zones and flow — a fixed removal priority, not a free choice.** On a successful attack the
   defender suffers a casualty, removed in this **exact sequence**: (1) a matching-unit card from the
   defender's **hand**; failing that (2) from the **discard pile**; failing that (3) from the **deck**
   (which is then shuffled); failing that (4) **the combat counter itself is removed from the board**.
   Only one card is removed per successful attack regardless of how many dice hit. Removed cards leave
   the game; Bolster reintroduces *different* reserve cards for a unit type at a spawn point, it does
   not resurrect removed cards. — rulebook via UltraBoardGames, cross-checked against the official PDF
   **[medium/high]**
3. **Who chooses — neither player picks the card.** The **attacker chooses the target unit/counter**,
   which determines *whose* zones are hit; the **specific card removed is determined by the rules
   priority above**, not selected by either player. This is a materially different answer from
   "opponent chooses."
4. **Loss condition.** **Not** deck-out — "whenever you need to draw a card and your deck is empty,
   shuffle your discard pile into a deck." Games are won on scenario objectives and counter
   elimination.
5. **Recorded edition difference.** In **North Africa**, if a combat counter is removed from the
   board, **all remaining cards for that unit are removed from the game at once**, and unlike
   Normandy the counter cannot respawn via Bolster — a stricter casualty rule reflecting the
   asymmetric LRDG-vs-Italian design. — The Players' Aid coverage **[medium]**
6. **Known problems — including a documented inversion of the mechanic's intent.** A BGG "Complete
   Guide to Deck Building Strategy in Undaunted: Normandy" (thread 2435022) explicitly recommends
   **deliberately taking casualties as deck-thinning**: "Every casualty means you get to draw your
   non-scout cards more often." Experienced players bait attacks onto weak units because forced
   removal functions as a free trash action **[medium — fetched via proxy]**. Separately, a narrative
   review thread reports a **snowballing tempo problem** tied directly to the hand-first removal
   priority: repeatedly drawing the Platoon Sergeant granted more actions, which inflicted more
   hand-casualties, which further increased the action advantage **[low — single forum anecdote]**.
   A BGG "FAQ and/or Errata" thread (2731415) shows **no consolidated official errata thread existed**
   at time of posting, and the substantive ambiguity raised concerned the Control action, not
   casualties. **No official erratum amending the casualty mechanic was located.**
7. **Designer intent — partially verified.** The rulebook states the named individual soldier cards
   exist "to add to the sense that you are in command of real soldiers and not pure abstractions"
   **[medium]**. A September 2019 designer interview with David Thompson describes the mechanic
   ("you find its matching card and remove it from your deck… they remove the cards from your deck and
   make that element less effective") but, as fetched, **contained no explicit design-rationale
   passage**; two further interviews returned blank or unusable content. See §7.
8. **Bookkeeping cost.** 1 card relocated per successful attack, **plus a shuffle whenever the card
   must be pulled from the deck** — friction that grows as decks thin.

### 4.2 Mage Knight (WizKids, Vlaada Chvátil)

Damage **and** clock: wounds enter the deck and stay there.

1. **Substitution.** Unabsorbed combat damage brings **Wound cards** from a finite shared Wound pile
   into the player's hand — a card standing in for a damage counter, which then dilutes future draws.
2. **Zones and flow.** Wound pile → hand (or onto a Unit). Wounds behave as normal deck cards for
   reshuffling: at end of round "Each player shuffles all his Deed cards (the ones he had in his hand,
   discard pile and Deed deck when the previous Round ended), and forms a new Deed deck," so "even if
   you manage to discard them… they still remain in your deck, so you will eventually draw them again
   during the next Round." Removal is **only via Healing, and only from hand**: "You can only heal
   Wound cards you have in your hand (not ones in your discard pile or Deed deck)." — official rules
   transcription, UltraBoardGames **[medium]**
3. **Who chooses — the player, deliberately.** "It is up to you how to assign this damage (whether you
   put some Units in harm's way, or have your Hero take all the damage), but you must assign the
   entire damage total from unblocked enemies." Units must be assigned first if chosen. Conversion is
   **damage ÷ Hero Armor, rounded up** — a computed rate, not 1:1.
4. **Loss condition — none; two graduated penalties instead.** Combat knock-out: "If, during one
   combat, your Hero takes a number of Wounds equal to or greater than his unmodified Hand limit… he
   is immediately knocked out and you discard all non-Wound cards from your hand." Scoring: "Each
   player loses 2 Fame for each Wound card in his deck (not on his Units). The player who lost the
   most Fame this way loses an additional 3 Fame for receiving the Greatest Beating." **[medium]**
5. **Known problems.** **No citable Chvátil quote on the Wounds-as-clock rationale was found** despite
   targeted searching (the 2011 Opinionated Gamers interview covers his general philosophy, not
   Wounds). Community complaints consistently describe Wound-clogged decks as slow and ineffective and
   the end-of-round reshuffle of Wounds as recurring friction (BGG thread 1140962) **[low/medium —
   community only]**.
6. **Bookkeeping cost.** Per combat: count unblocked damage, divide by armor and round up, draw that
   many cards from a shared physical pile, place in hand or on a Unit. **Per round: a full deck
   reshuffle merging hand + discard + deck, Wounds included.**

### 4.3 Aeon's End — hand destruction

Cross-reference §3.6. Nemesis cards force **destroy** or **discard** effects on player hands — e.g.
Agony Field destroys one hand card costing 2+, or on full charge "any player discards three cards in
hand and then draws one." A general ruling: "If a nemesis card says 'Any player destroys five cards
in hand,' and no player has five or more cards, the player with the most cards in hand must destroy
all of their cards in hand." **Destroy is permanent removal from the game**, as distinct from discard,
which reshuffles. — Aeon's End Wiki **[medium]** This is damage aimed at the **engine**, not at a
life total. Separately, an **exhausted** player (0 life) must **destroy one of their breaches**
permanently — "Destroyed breaches can be returned to the box – there is no way to regain a destroyed
breach" within a game — tying token-tracked life loss to a permanent card-slot casualty.

### 4.4 Thunderstone (AEG) — Disease cards

Cross-reference §5.3, where the corrected mechanic and the falsified "Weakness" premise are recorded.

### 4.5 Dominion — Curse cards

Cross-reference §5.2. A Curse is simultaneously negative score and deck clutter.

### 4.6 Legendary Encounters — Strike cards

Cross-reference §2.2. Damage and health are the same accumulating pile.

---

## 5. Cards as counters and track

Cards standing in for goods, wounds, progress, or score.

### 5.1 Arkham Horror: The Card Game — committing cards to skill tests

The tightest "a card stands in for a number" case found.

1. **Substitution.** Counters/track. "Most cards have skill symbols on the upper left, and you can
   commit cards that have the correct symbol for the skill that is tested, which increases your skill
   value for that test by the number of matching icons committed… **you do not pay a card's resource
   cost when committing it.**" A card is spent purely as a numeric bonus. — Arkham Horror LCG Wiki,
   Skill test **[medium]**
2. **Zones and flow.** Hand → committed (a temporary status, not a persistent pile) → **discard pile
   after the test resolves, pass or fail**. No automatic return; recursion requires specific effects.
3. **Who chooses — with a cooperative wrinkle.** The testing investigator may commit multiple of their
   own cards; **each other investigator at the same location may commit exactly one** card with a
   matching or wild icon to assist. No other game in this survey lets teammates spend into your
   number.
4. **Loss condition.** Not tied to this mechanic — loss is scenario-based.
5. **Known problems.** **Searched and not found** for balance or bookkeeping complaints. A community
   "Common Rule Mistakes" page does confirm the icon-matching rule is a frequent misplay — committing
   a multi-icon card and expecting both icons to count, when "only those that match the skill being
   tested count" **[low — rules-clarity friction, not a balance claim]**. Read as not-found.
6. **Bookkeeping cost.** **The highest-frequency commit-and-discard cycle in the survey**: 0 to several
   cards by the tester plus up to 1 per assisting investigator, **on every skill test**, and skill
   tests recur many times per round — not once per turn.

### 5.2 Dominion (Rio Grande, Donald X. Vaccarino)

1. **Substitution.** Counters/track — **victory points are literal cards counted from your deck at game
   end** — plus a damage-adjacent attack vector in the Curse.
2. **Zones and flow.** A Curse is worth **−1 VP** and has no other function; it is "dead weight
   whenever you draw them into your hand," so it is simultaneously a negative score counter **and**
   deck clutter. Gained Curses go to the gaining player's **discard pile** and cycle like any card.
   The Curse pile scales with player count: 10 for 2 players, 20 for 3, 30 for 4. — Dominion Strategy
   Wiki **[medium]**
3. **Who chooses — nobody, and deliberately so.** Witch gives each opponent a Curse; it is inflicted
   on **all** other players simultaneously and is not optional. Vaccarino has stated Witch was
   designed so "no other player shares in benefiting from me playing it," reducing kingmaking
   relative to games like Risk, and that curse counts are "probably 10 because it's a round number;
   it seemed like enough pain" **[medium — search-synthesised from the Dominion Strategy interview,
   not directly re-fetched; see §7]**.
4. **Loss condition.** Curses do not end the game; the 3-empty-piles (or empty Province pile) rule
   does. Curses affect **who** wins, not **when** it ends — **except** that the Curse pile is itself
   one of the piles that can empty, so a curse-heavy game can end sooner.
5. **Known problems.** No errata or ban on Witch/Curse; treated as intended core design. On
   bookkeeping, a BGG "Keeping Score" thread (1141520) is mostly about tracking score live for
   children, but contains the telling admission "Keeping track is indeed part of the advanced strategy
   of Dominion. But it's not essential to keep track of the score to play well nor enjoy the game" —
   implying many players defer all counting to the end **[low]**. **A verbatim "counting my deck at
   the end is tedious" complaint was not recovered** — see §7.
6. **Bookkeeping cost.** **Zero per turn beyond normal deckbuilding; potentially minutes per player at
   game end.** Every player must sort and count their entire deck — hand, discard, and draw pile
   combined, often 40–60+ cards — by VP-bearing type. Players "can count cards in your own Deck but
   cannot look through it."

### 5.3 Thunderstone (AEG, Mike Elliott / Jay Cormier)

**Seed-list premise falsified.** The expanded candidate list named "Weakness" cards. **There is no
Weakness card type in Thunderstone.** The game classifies cards as Heroes, Village cards, Monster
cards, Basic cards, Experience Point cards, and **Disease** cards. — Yucata.de rules page **[medium —
fetched directly]** The underlying pattern exists under the name Disease.

1. **Substitution.** Counters/track plus damage-adjacent: **Disease cards** carry a −1 penalty to
   Attack or Magic Attack while sitting in the deck (the Dominion Curse pattern), and **defeated
   Monster cards go into the victor's own discard pile as literal trophy/VP cards**.
2. **Zones and flow — and a real design difference from Dominion.** Diseases are inflicted by specific
   monster abilities and cycle through the deck, **but can be destroyed during rest actions**,
   returning to a shared Disease stack. Thunderstone lets you **cure** the negative card; base-set
   Dominion does not. Also verified against the ticket's framing: **failing to defeat a monster does
   not inject a damage card** — "the Monster retreats into the Dungeon: place the Monster card on the
   bottom of the Dungeon Deck."
3. **Who chooses.** Neither player — Diseases come from monster card abilities in a shared PvE
   structure.
4. **Loss condition.** Not Disease-related; the game ends when the Thunderstone card (seeded at the
   bottom of the Dungeon Deck) is reached.
5. **Known problems.** **Not found this pass.** A BGG thread "Weak points in the Thunderstone balance"
   (494007) exists but was not fetched — unverified lead.
6. **Bookkeeping cost.** Endgame full-deck count, arguably worse than Dominion's since Gold, VP, and
   hand-size interact; 1 card per Disease acquisition; 1 card back to a shared stack per cure.
7. **Recorded uncertainty.** A **Curse** mechanic reportedly exists in **Thunderstone Advance** (a
   separate, later product line with a distinct ruleset), described as "a −1 Attack penalty for each
   Curse revealed when a player visits the dungeon" **[low — single unverified source; different
   product from base Thunderstone]**.

### 5.4 No Thanks! (AMIGO, Thorsten Gimmler)

1. **Substitution.** Spans **counters/track** (collected number cards **are** the score — there is no
   score pad or track in the base game) and **currency** (chips spent to decline a card).
2. **Zones and flow.** Deck numbered 3–35 with **nine cards removed at random before setup**. Each
   turn: place one of your chips on the face-up card to decline it and pass, **or** take the card plus
   all chips accumulated on it and flip the next card. Taken cards go permanently to a personal
   collection; runs of consecutive cards score only the lowest value of the run. — Wikipedia and
   convergent retailer/rules summaries **[medium]**
3. **Who chooses.** Fully player-chosen every turn; randomness lives only in card order.
4. **Loss condition.** No elimination. Cards **are** the score: "all cards are worth positive points
   equal to their printed value… All chips the player possesses at the end of the game are worth −1
   point each," lowest total wins.
5. **Known problems.** A named community strategy, **"milking"** — deliberately declining a card you
   know is worthless to you (e.g. holding 34 makes an appearing 35 unrunnable for you) to force
   another player to take it or drain their chips — is described in a BGG strategy thread (475499) as
   "a robust strategy," **not** as game-breaking **[low — snippet only]**. No official errata, bans, or
   designer post-mortems surfaced.
6. **Bookkeeping cost.** One card-or-chip move per turn. Endgame is a single arithmetic pass (sum
   cards with run discounting, subtract chips) — no running upkeep.

### 5.5 For Sale (Ravensburger / FX Schmid, Stefan Dorra)

1. **Substitution.** Two card types doing two token jobs: **Property cards** are the goods whose values
   determine payout ranking, and **Currency/check cards are literally the money** — no coin tokens are
   used for the final payout.
2. **Zones and flow.** Phase 1: properties equal to the player count are revealed; players bid coins
   in turn order; a player who passes takes the lowest remaining property and **recovers half their
   bid**, while the last bidder takes the highest property and pays in full. Phase 2: players
   simultaneously reveal one property each; highest revealed property takes the highest-valued
   currency card, descending from there; played properties are discarded. Score = currency card values
   + leftover coins. — UltraBoardGames **[medium]**
3. **Who chooses.** Fully player-chosen in both phases; Phase 2 is a simultaneous bluffing/timing
   decision.
4. **Loss condition.** None — highest total wins.
5. **Known problems — a genuine cross-edition rules discrepancy.** "The rounding rule preferred by the
   designer Stefan Dorra is that players get back half of their bid rounded **DOWN** (not UP)… the
   original Ravensburger/FX Schmid edition (1997/98) has slightly different rules than later English
   editions" **[medium — BGG-sourced edition history, exact thread not fetched]**. **Both versions are
   recorded; no side is picked.**
6. **Bookkeeping cost.** Very low — one bid/claim per player per Phase-1 round, one simultaneous reveal
   per Phase-2 round, and **the cards themselves are the running tally** until the final sum.

### 5.6 San Juan, Race for the Galaxy, Glory to Rome — goods and vault

Cross-references. San Juan (§1.1) and RftG (§1.2) both place **face-down cards on production buildings
as goods** — a card standing in for a commodity cube. Glory to Rome (§1.3) tucks cards into a **Vault**
whose card values count directly as victory points — a card standing in for a score token.

---

## 6. Examined and discarded

Each of these was checked against the five families and did not qualify. A discard is a finding.

| Game | Why it does not qualify | Confidence |
| --- | --- | --- |
| **Puerto Rico** | Uses doubloons (54 physical coins), wooden plantation tiles, and reusable role cards that are never spent. San Juan is explicitly the adaptation that replaced this with cards. Confirmed as the ticket predicted. | **[medium]** |
| **Illuminati** (SJ Games) | "Megabucks" are **token/chit currency placed on top of group cards** as a treasury marker; components include dedicated money chits (170 tokens in Deluxe). The card is a passive holder, never spent or converted. | **[medium]** |
| **Star Realms / Hero Realms** | Trade and Combat are **numeric pools** generated by playing cards; the card is never the currency. Scrap is a destruction sink, not a conversion. Authority (life) is a die/counter. *One partial exception noted:* Hero Realms Champions with **Guard** are stunned to the discard pile instead of the player taking damage — a single card-type damage buffer, not a general substitution. | **[medium]** |
| **Ascension** | Identical shape to Star Realms — Runes and Power are fungible numeric pools, explicitly spendable across multiple purchases. | **[medium]** |
| **Android: Netrunner** | **The seed hypothesis is falsified.** Credits are a numeric bank resource; the basic "click for credit" action involves no card at all. Face-down Corp installs are *unrezzed*, i.e. hidden, not currency. Economy cards like Daily Casts and Kati Jones **host credit tokens on a card** (the Illuminati pattern). Operations/Events are played-and-trashed for a one-time payout — a universal card-game pattern, not a currency-track substitution. | **[medium/high]** |
| **Res Arcana** (found while tracing Lehmann's lineage) | Essences are physical gem tokens produced by artifact cards; cards are engines, tokens are spent. | **[medium]** |
| **KeyForge** | Æmber is tracked by **physical Æmber tokens** pooled on the Identity Card; chains use a numeric chain tracker. No deckbuilding, no hand-cards-as-resource mechanic. | **[medium]** |
| **A Game of Thrones LCG** (1st/2nd ed.) | Gold is a numeric pool derived from the revealed Plot card plus income icons, tracked with **gold tokens**. Bestow explicitly places gold tokens on a card that are "not part of the player's Gold pool." No hand-cards-as-resource mechanic. | **[medium]** |
| **Slay the Spire** (digital) | **Verified, not assumed.** No deck-exhaustion loss exists: when the draw pile empties, the discard pile is automatically reshuffled in, always. Exhaust is a separate deliberate thinning keyword unconnected to health. | **[high]** |
| **Monster Train** | Health is the **Pyre**, a separate numeric HP track damaged by enemies reaching it; loss is Pyre at 0. Cards cycle normally. (An unrelated 3-round unit timer exists but is a per-unit combat clock.) | **[medium]** |
| **Balatro** | **Verified with a caveat.** The clock is **Hands** (plays remaining), not the deck; the deck recycles normally. **Discards** are a genuine capped, spendable resource, but they are turn-economy, not health/damage/clock, and running out of them is harmless in itself. Recorded as a bordering counters-track case, not a qualifier. | **[high]** |
| **Champions of Midgard** | Damage uses **physical Damage tokens** on monster cards; player losses discard **Viking Warrior dice**. | **[high]** |
| **Cursed Court** | Noble cards are hidden-information outcome determinants; betting uses Influence tokens and Betting Crowns. | **[medium/high — publisher is Atlas Games; the rulebook PDF would not parse, so four independent reviews stand in]** |
| **Deep Space D-6** | Dice-primary. Threat cards are enemy stat blocks whose HP is tracked by **sliding the card along a printed track**; the player's engine is six Crew dice. | **[high]** |
| **Fort** (**Leder Games**, not Eagle-Gryphon — the candidate list's attribution was wrong) | Resources ("Stuff": pizza, toys) are **tokens**; cards are recruited units providing actions. *Notable adjacent mechanic:* cards left unplayed go to a public **Yard** where rivals may steal them into their own decks — a real card-as-contested-resource idea, but theft, not any of the five families. | **[high]** |
| **Sentinels of the Multiverse** | **Confirmed as the ticket predicted.** HP uses a **spinner/dial** (Definitive Edition) or loose tokens; third-party "HP tracker cards" are an accessory, not a rule. Deck-out is explicitly **never** a loss: "If a deck ever runs out of cards, simply shuffle that deck's Trash, make it the new deck, and continue playing" — the game is designed so players don't lose "for fiddly reasons, like running out of cards." *One narrow exception:* the promo villain **Wager Master** reportedly has a deck-exhaustion win condition. | **[high; the Wager Master exception is **[low]** and community-sourced]** |
| **Cthulhu: Death May Die** | Discarded on all three checked angles. Sanity/health are **tentacle tokens on a printed track**; the Insanity card is a static trait, not a counter. The **Mythos discard reshuffles automatically** every time the Elder One advances. Discovery deck depletion is a soft constraint, per the official FAQ: "No, you only reshuffle if an effect instructs you to do so. If the deck is depleted Investigators don't Investigate anymore." | **[high]** |
| **This War of Mine: The Board Game** | Hunger, fatigue, illness, misery, and wounds use **40 State tokens** with graduated dot indicators. The Fate deck resolves events that adjust those tokens; it is not itself the resource. | **[medium]** |
| **Tainted Grail** | Health, Energy, and Terror are **printed tracks with markers on the Character Tray**. "You Are Dying" / "You Are Going Insane" cards attach only as reminders once a marker hits its critical zone. | **[medium]** |
| **Under Falling Skies** | **No card component exists in the game at all** — dice, ship tokens, an excavator token, and tiles only, per the official CGE component list. | **[high]** |
| **Roll Player Adventures** | Wounds use **95 Stamina Markers** accumulated against a printed health value; the story clock is numbered **Storybook paragraphs**, not cards. Its card decks are conventional item/ability pools. | **[medium]** |
| **Middara** | HP and stamina use tokens counted against a **static printed value** on the character card — a conventional token track. | **[medium — no primary rulebook text was read; rests on BGG community threads]** |
| **Sleeping Gods (health), Aeon's End (life), Arkham Horror (economy), Ashes (primary economy), Star Wars LCG (primary economy)** | Partial discards recorded in place at §3.8, §3.6, §1.10, §1.11, §1.12 — in each case the game qualifies on one mechanic while the mechanic one might *expect* to qualify does not. | — |

---

## 7. Gaps and unverified claims

Recorded per the map's standing rule: a thing not verified is a gap, never a silent omission.

### 7.1 Sources that could not be reached

- **BoardGameGeek blocked automated fetching for the entire research window** (HTTP 403/402). Every
  BGG citation in this document is snippet-level. Affected specifically: San Juan Guild Hall and 2p
  threads; Glory to Rome Bridge/Coliseum threads; 7 Wonders science and 2nd-edition balance threads
  (2485966, 2509060); Bohnanza's forum, never trawled; Dominion "Keeping Score" (partially recovered
  via proxy); Thunderstone balance (494007, title only); Legendary "bad deck builder, bad game"
  (1422210, title only); ISS Vanguard critical review (3417626, title only); Coup 2-player variant
  (2394590); No Thanks! strategy (475499).
- **Rulebook PDFs that would not parse as text:** San Juan, Race for the Galaxy, Bohnanza, This War of
  Mine, Cursed Court (Atlas Games), ISS Vanguard FAQ, Under Falling Skies (via mirror), Legendary
  Marvel (Upper Deck), Love Letter (AEG/Z-Man). Transcription sites stand in; confidence lowered.
- **Paywalled or blocked:** the PC Gamer article containing Ben Brode's original account of the
  Hearthstone fatigue origin; MTG Gatherer (403, routed via Scryfall and the MTG Salvation rulings
  mirror); mtg.fandom (402); FFG's official "Getting the Edge on Edge Battles" article (403 twice);
  the Star Wars LCG FAQ PDF (exceeded fetch size).

### 7.2 Specific claims flagged as unverified

1. **Undaunted designer rationale.** The candidate list asserted "published designer interviews about
   the casualty mechanic specifically." Interviews **exist** (The Players' Aid 2019; Tabletop Gaming
   "Hand of Brothers"; EpochXP) but the two follow-up fetches returned blank or unusable content, and
   the one that loaded described the mechanic without a "why we chose this" passage. **The rulebook's
   own stated intent is the only sourced rationale.**
2. **Mage Knight designer rationale.** No citable Chvátil quote on Wounds-as-clock was found despite
   targeted searching.
3. **Legendary Marvel/DC deck-out = draw.** Consistent across three independent search results but
   **never confirmed against a primary Upper Deck rulebook**. Well-supported, not certain.
4. **ISS Vanguard "injury cards are the sole health system."** Asserted by a fan blog; the official
   rulebook was not parseable. This is the load-bearing claim of §2.3 and is the weakest in that
   section.
5. **Dominion / Vaccarino Curse quotes.** Search-synthesised from the Dominion Strategy interview,
   **not re-fetched directly**. Recommended verification target:
   `dominionstrategy.com/2012/12/21/interview-with-donald-x-vaccarino-part-ii-dominion/`.
6. **DCI's original Necropotence restriction wording.** Quoted via Eternal Central's format history,
   not from a surviving primary WotC announcement. (The **2026** WotC announcement, by contrast, is
   primary and directly verified.)
7. **Gloomhaven vs Frosthaven exhaustion differences.** No authoritative official side-by-side
   changelog was reachable; both fetches were partial. **Both readings are recorded in §3.5 without
   picking one.**
8. **Thunderstone Advance "Curse."** Single unverified source, and a different product line from base
   Thunderstone.
9. **Sentinels' Wager Master deck-exhaustion win condition.** Community-sourced; no primary card text.
10. **Legendary Encounters beyond *Alien*.** Whether Firefly, Predator, and Big Trouble in Little China
    share the identical Strike-card damage mechanic was **not verified** — a shared engine is likely
    but unconfirmed.
11. **Phyrexian mana and Bargain-family costs (MTG).** Named as inverse-substitution comparators but
    **not researched in depth this pass**; only Necropotence itself was established.
12. **Middara.** The discard rests on BGG community threads; no primary rulebook text was read.
13. **Curious Cargo.** Grouped with ISS Vanguard in the candidate list, but **no separate research on
    its own rules was found**. It was **not** independently verified and should be treated as
    unexamined rather than discarded.

### 7.3 Sections that are thin

- **Race for the Galaxy — known problems.** No documented balance controversy of San Juan's
  specificity was found. Not-found, not absent.
- **Bohnanza — known problems.** Nothing found at all, despite targeted searches for complaints about
  the fixed-hand-order rule.
- **Marvel Champions and Arkham Horror LCG — known problems.** Community complaint threads about their
  card-as-resource mechanics were sparse in search results; this may reflect tool limits rather than
  contented players.
- **Aeon's End, Thunderstone, 5-Minute Dungeon, Ashes (Meditate) — known problems.** Nothing specific
  to the qualifying mechanic surfaced.
- **Love Letter, No Thanks!, For Sale, Coup — known problems.** With the single exception of Dorra's
  For Sale rounding note, **no official designer or publisher post-mortem, errata, or FAQ was located
  for any of the four**. All "known problems" for these rest on community strategy sites.
- **Dominion endgame-counting tedium.** A verbatim complaint was not recovered; the section reports
  only the indirect evidence.

### 7.4 Corrections to the ticket's own premises

Recorded because the ticket asked for confirmation-or-discard of each seed, and three seeds were wrong:

1. **Flesh and Blood does not have deck-out as a loss condition.** Verified directly against the
   Comprehensive Rules (§1.8).
2. **Thunderstone has no "Weakness" card type.** The analogous mechanic is **Disease**, and it is
   curable, unlike Dominion's Curse (§5.3).
3. **Legendary Marvel/DC deck exhaustion produces a draw, not a heroes-lose** (§3.9) **[medium]**.

Two further corrections to the expanded candidate list: **Fort** is published by **Leder Games**, not
Eagle-Gryphon; and **Netrunner's** "cards installed face-down as credits" premise does not hold.

---

## 8. Bibliography

Grouped by class, matching the rigor convention of `01-decipher-force-pile.md`. Inline citations above
name the source at the point of use; this list is the index.

**Official rules, comprehensive rules, and publisher documents (directly fetched)**

- *Magic: The Gathering* Comprehensive Rules, 2026-08-07 — `media.wizards.com/2026/downloads/MagicCompRules 20260807.txt`
- WotC Banned & Restricted Announcement, 2026-02-09 — `magic.wizards.com/en/news/announcements/banned-and-restricted-february-9-2026`
- *Flesh and Blood* Comprehensive Rules — `rules.fabtcg.com` (Game Concepts, Zones, Game Structure)
- *Disney Lorcana* Play Correction Guidelines — `cdn.ravensburger.com/lorcana/play-correction-guidelines-en`
- *Disney Lorcana* Comprehensive Rules (eff. 2025-02-28) — `lorcana.gg` hosted PDF
- *Star Wars: Unlimited* Quickstart Rules and Comprehensive Rules PDFs; Comprehensive Rules Update — `starwarsunlimited.com/articles/comprehensive-rules-update`; `starwarsunlimited.gg/errata`
- *Gloomhaven* 2E official FAQ — `cephalofairgames.github.io/gloomhaven2e-faq`; *Frosthaven* FAQ — `cephalofairgames.github.io/frosthaven-faq`
- *Glory to Rome* official rules — `glory-to-rome.com/Glory_to_Rome_rules.html`
- *7 Wonders* rulebook PDF; *Undaunted: Normandy* rulebook PDF; *Star Realms* rulebook PDF
- *Under Falling Skies* rules and component list — `czechgames.com`
- *Etherfields* official FAQ forum — `etherfields-secrets.com`
- NISEI *Netrunner* Comprehensive Rules PDF; NetrunnerDB card text
- *Ashes Reborn* — Plaid Hat product pages, `wiki.ashes.live`, April 2025 errata/OP update
- *Cthulhu: Death May Die* official FAQ via Dized; *Champions of Midgard* rules via Dized
- *Sentinels of the Multiverse* Definitive Edition setup rules via Dized

**Designer statements and interviews**

- Daniel Mullins on Inscryption's sacrifice origin — Game Developer, "How game jam sacrifices became Inscryption"
- Ben Brode on Hearthstone fatigue's origin — reported via `hearthstone.wiki.gg` (original PC Gamer piece paywalled)
- Eric Lang on *Star Wars: The Card Game* edge battles — Theology of Games, 2012
- Donald X. Vaccarino on Curses and Witch — Dominion Strategy interview, 2012 (search-synthesised, **not re-fetched**)
- David Thompson on Undaunted casualties — The Players' Aid, 2019 (mechanic described; rationale passage not present)
- Vlaada Chvátil — Opinionated Gamers, 2011 (general philosophy only; **no Wounds-specific quote found**)

**Design histories and secondary analysis**

- Martin Fowler, "Race for the Galaxy and San Juan" — `martinfowler.com/articles/race-san-juan.html`
- Eternal Central, "Schools of Magic: History of Vintage – 2000"
- Black Gate, "Guns or Butter: Race for the Galaxy," 2026-03-19
- Tao of Gaming, Glory to Rome building analysis, 2007
- Spalanz, "Remembering the Star Wars LCG," 2022
- FABREC, "The Genius of Flesh and Blood's Pitch System" and "Fighting Fatigue in Flesh and Blood"
- TCGplayer, "Choosing What to Resource in Star Wars Unlimited" and "Learning Pitch Tracking in Flesh and Blood"
- Cardboard Mountain on the 7 Wonders 2nd-edition changes; The Thoughtful Gamer on 7 Wonders science

**Rules transcriptions and wikis (used where official PDFs would not parse)**

- UltraBoardGames — San Juan, Race for the Galaxy, Bohnanza, 7 Wonders, Puerto Rico, Mage Knight,
  Undaunted, Marvel Champions, Fort, Tainted Grail, Deep Space D-6, Android: Netrunner
- Yucata.de (Thunderstone), Rulepop (Sleeping Gods), officialgamerules.org (Bohnanza, Dominion),
  gamerules.com (Legendary Marvel), Geeky Hobbies (5-Minute Dungeon), orderofgamers (Legendary
  Encounters: Alien, Puerto Rico, Etherfields), `coups.app/rules` (Coup)
- Fan wikis: `hearthstone.wiki.gg`, `slaythespire.wiki.gg`, `aeonsend.wiki.gg` and Fandom,
  `arkhamhorrorlcg.fandom.com`, `inscryption.fandom.com`, `dominionstrategy.miraheze.org`,
  `archonarcana.com` (KeyForge), `balatrowiki.org`, `monster-train.fandom.com`, `thronesdb.com`,
  `ancur.fandom.com`, Scryfall and MTG Salvation (Necropotence rulings)
- GitHub `m-ender/gloomhaven-rules` (community transcription of the printed rulebook)

**Community sources (all marked low/medium in-line)**

- BoardGameGeek threads, snippet-level only — thread numbers cited at point of use
- Blizzard official forums (thread 156681) and HearthPwn on fatigue mirrors
- Reviews: coopgestalt.com (Sleeping Gods), BoardGameQuest (Etherfields), Shelfside (ISS Vanguard),
  Geekdad (Cursed Court), Sprites and Dice and Co-op Board Games (5-Minute Dungeon), Shelf Gamer
  (Coup 2-player), BoardGameArena tips (Love Letter), TV Tropes (Inscryption squirrel loop)
