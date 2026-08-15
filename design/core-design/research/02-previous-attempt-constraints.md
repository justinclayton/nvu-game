# 02 — Constraints extracted from `previous-attempts-at-design/`

Resolves [ticket 02](../issues/02-extract-constraints-from-previous-attempts.md).

Sources, all read in full:

| Handle | File | Size | Last modified |
| --- | --- | --- | --- |
| **HANDOFF** | `previous-attempts-at-design/north-vs-up-game-design-handoff.md` | 363 lines | 2026-08-12 21:13 |
| **MECH** | `previous-attempts-at-design/mechanics-decisions.md` | 361 lines | 2026-08-12 21:14 |
| **TECH** | `previous-attempts-at-design/tech-approach-notes.md` | 133 lines | 2026-08-12 20:04 |

All three are dated the same day. TECH is the earliest file on disk, HANDOFF and MECH the
latest — but HANDOFF describes itself as the origin document and both later files cite it, so
the modification times reflect back-edits, not authoring order.

## How to read this file

Every item is attributed to a source file and section. Items carry one of two provenance marks:

- **(no mark)** — the source states this as a decision or a number, and the surrounding text
  does not read as unprompted model elaboration. This is *not* a claim that the designer wrote
  it; it is a claim that it is recorded as a decision and is not obviously invented.
- **[UNCERTAIN PROVENANCE]** — the passage reads as LLM output rather than a designer ruling:
  unprompted elaboration, a suspiciously complete system, evaluative or enthusiastic framing,
  generic design-doc boilerplate, or reasoning the document supplies on the decision's behalf.

Per the ticket, the bar is deliberately low: when in doubt, flagged. A flag is a request to
re-confirm with the designer, not a judgement that the idea is bad or wrong.

Two structural facts about the sources bear on every item below:

1. **The quantitative substrate is missing.** All three documents cite `prototype/NOTES.md` as
   the source of every number about deck sizes, win rates, and cost models. **That file does
   not exist in this repository** (`find . -name NOTES.md` returns nothing; the repo contains
   only `design/`, `docs/`, and `previous-attempts-at-design/`). Every simulation figure below
   is a second-hand quotation that cannot currently be verified.
2. **Only one passage in ~860 lines names the designer.** MECH §3.2 attributes a counter-position
   to "Justin's". Nowhere else in any of the three files is a position attributed to a named
   human. The documents' own labels — "Locked", "explicitly endorsed this session", "Decisions
   That Feel Established" — are the documents asserting endorsement, with no record of who
   endorsed. This is the single strongest reason to flag liberally.

---

## 1. Settled decisions

Recorded as decided, with the reason as stated in the source.

### 1.1 Form and audience

| # | Item | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| a | It is a **physical tabletop** card/board game; cooperative; deck-building; roguelike; run-based; with a narrative component. | HANDOFF §1 | Stated as the brief, no reason given. TECH §0 re-reads it back as "describes a physical tabletop game" and treats it as given. | — |
| b | **1–2 players, cooperating toward a shared victory condition.** | HANDOFF §1, §3 "Cooperative" | None stated. | — |
| c | The software effort's job is a **playtest/balance rig, not a shippable game** ("build physical-capable, hedge on shipping"). | TECH §0 | The open question is a rules question, not a rendering question; art and animation cannot answer it. | — |
| d | **Physical-capability is a hard constraint on the engine**, not a preference. | TECH §0, §1.5 | Follows from (a) and from HANDOFF's no-extra-components constraint. | — |

### 1.2 Consolidation principle

| # | Item | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| e | **Cards should carry as many functions as possible** rather than introducing separate tokens, tracks, or currencies. | HANDOFF §1, §3 "Low Complexity" | Mechanical cohesion; and it is the operative form of the low-complexity constraint. Restated as a filter for evaluating any future mechanic. | — |
| f | Resources should be **printed on cards, or be the cards themselves**. | HANDOFF §3 "Low Complexity" | Same. | — |
| g | "Cards should do multiple jobs" as a stated central philosophy, with a six-item list of jobs one card might hold at once. | HANDOFF §6 | "This is becoming a central design philosophy." | **[UNCERTAIN PROVENANCE]** — the principle duplicates (e), which is already stated in §1; §6 as a whole is advantages/tensions boilerplate. The *principle* is well-attested; this *elaboration* of it is not. |

### 1.3 Fiction

| # | Item | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| h | Title: **North vs Up**. | HANDOFF §2 | None. | — |
| i | Setting: an isolated militaristic nation loosely modelled on North Korea; plant-like alien creatures drawn by the nation's nuclear arsenal; players are low-level military guards who stumble on the invasion; the state suppresses it to avoid panic and preserve the appearance of control; the military may eventually turn on the players. | HANDOFF §2 | None stated. | — |
| j | Location: the nation's tallest skyscraper, modelled on real monumental-but-unused engineering projects; never really inhabited; overrun by creatures, vegetation, and a giant alien tree growing through it. Players ascend it. | HANDOFF §2 | None stated. | — |

Note: the fiction is the least model-smelling material in any of the three files — specific,
idiosyncratic, and not the kind of thing an assistant volunteers. It is recorded here unflagged
for that reason, but it is also **outside this map's scope** (the map lists narrative and lore
beyond the tower/alien premise as out of scope).

### 1.4 Mechanics recorded as decided

MECH labels its §1 "Locked — explicitly endorsed this session". That label is the document's own
claim. The items are listed here because the document records them as settled; the reasoning
attached to each is in almost every case supplied by the document rather than quoted from anyone.

| # | Item | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| k | Damage is **not a number on a track**. An attack forces cards into a one-way pile, removed for the rest of the run. | MECH §1.1 | Implements (e)/(f): no HP track, no tokens. Also noted as already built in the prototype engine. | — |
| l | **Deck size is the life total.** | MECH §1.3 | Named as "the load-bearing consolidation the handoff asks for", quoting HANDOFF §1 accurately. | — |
| m | Cards are the energy pool: activate N face-down at turn start, convert face-down cards to hand 1:1 (that conversion *is* the draw), pay costs by moving face-down cards to discard. | MECH §1.2 | Transplanted from Decipher SWCCG; makes hand size player-chosen; makes shuffling irrelevant to the mechanic; gives every card a floor value so there are no dead cards. | **[UNCERTAIN PROVENANCE]** — see §5.2. MECH §3.4 itself concedes this model was never tested and calls it "the mechanic this session actually fell in love with", which is the document's own enthusiasm, not a recorded ruling. |
| n | The **thinning rubber band is accepted deliberately** — a damaged deck cycles faster, so the losing player gets more consistent. | MECH §1.4 | "Free anti-snowball"; softens individual losses without letting games run forever, *conditional on* healing staying scarce. | **[UNCERTAIN PROVENANCE]** — the phrasing "The stated reasoning:" is the document reporting a reason without saying whose. |
| o | Consequently, **healing must stay scarce and expensive** — treated as a downstream hard constraint. | MECH §1.4 | It is the only dial holding the rubber band in check; cheap healing stalls the design. | **[UNCERTAIN PROVENANCE]** — derived by the document from (n). |
| p | The curse/wound analogue ("Junk") is **fully functional as energy and useless in hand** — it applies dilution, not damage. | MECH §1.5 | In a design where deck size is HP, a Slay-the-Spire-style deck-bloating curse would function as *healing*, so the curse has to fail at a different job. | **[UNCERTAIN PROVENANCE]** — the reasoning is genuinely tight, which is itself a tell; it is presented as an "insight that makes it work" with no attribution. |
| q | Junk is acquired **emergently through searching**, not on a timer. | MECH §1.6 | Greed becomes the clock; pressure scales to player activity; variable per run rather than a fixed curve. | **[UNCERTAIN PROVENANCE]** — the *exclusion* (no per-turn tick) is recorded as a rejection and is listed in §2 below; the replacement is accompanied by "This is a better version of the clock and should be treated as the primary pacing mechanism", which is the document evaluating its own proposal. |
| r | Floor structure: a non-linear floor plan of connected rooms with backtracking, fight-or-flee at will, environmental hazards, healing spots, ending by beating a boss room which fully heals for the next floor; framed as one continuous combat round rather than a sequence of encounters. | MECH §1.7 | Exploration and combat stop being separate node types. | **[UNCERTAIN PROVENANCE]** — and *contested even inside its own document*: MECH §3.1 says §1.7 "is a proposal to replace that decision, not yet ratified", while §1.7 sits under the heading "Locked". See §5.1. |

### 1.5 Software decisions (tooling, not game rules)

Recorded for completeness; the map places digital implementation out of scope, so these
constrain nothing about the game itself.

| # | Item | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| s | Headless deterministic rules engine in plain TypeScript; no framework; throwaway UI (CLI first). | TECH §1 | Determinism buys mass simulation; logic stays portable; the open question is rules. | **[UNCERTAIN PROVENANCE]** — a complete architecture recommendation with a rationale list, an ASCII diagram, and an options table. Textbook model output. |
| t | Pure reducers, seed carried in state, run replayable from `(seed, action log)`; data-driven cards over a small effect vocabulary. | TECH §1 | Replayability; a card needing new engine code is a design smell. | **[UNCERTAIN PROVENANCE]** — same. |
| u | Co-op is hot-seat only for now. | TECH §1 | Networking is a real cost and should not drive the framework choice this early. | **[UNCERTAIN PROVENANCE]** |

---

## 2. Explicit exclusions

Things the sources rule out, with the reason given.

### 2.1 Ruled out for the game

| # | Ruled out | Source | Stated reason | Provenance |
| --- | --- | --- | --- | --- |
| a | **Too many independent systems; unnecessary rules layers; any mechanic requiring additional physical components.** | HANDOFF §1, §3 "Low Complexity" | Stated as "A major design constraint", quoted imperatively: "Strive for a lower-complexity game." Explicitly designated a filter for evaluating future mechanics. | — (the strongest and most clearly designer-owned constraint in the corpus) |
| b | A separate HP track or damage tokens. | MECH §1.1 | Follows from (a) — damage is expressed in cards instead. | — |
| c | **An automatic per-turn accumulation of the curse card as the floor's clock.** Explicitly labelled "Rejected". | MECH §1.6 | Preferred a clock driven by player activity rather than a linear timer. | — (recorded as an explicit rejection; the replacement it names is flagged at 1.4(q)) |
| d | Cheap or plentiful healing. | MECH §1.4 | It is the only check on the thinning rubber band. | **[UNCERTAIN PROVENANCE]** — derived, not ruled. |
| e | **Charging cards for movement.** | MECH §2.4 | Would break the "flee at whim" promise; cost it in opportunity and consequence instead. | **[UNCERTAIN PROVENANCE]** — MECH §2 is explicitly "proposals raised but not yet ruled on", so this is a proposed exclusion, not a made one. |
| f | Consumables living inside the deck. | MECH §2.9 | An exile-on-play cost would double-tax them and nobody would use them. | **[UNCERTAIN PROVENANCE]** — same; §2 is unruled. |
| g | Total re-randomization of room contents. | MECH §3.2 | Risks reading as noise rather than chaos; if no plan survives, players stop planning and disengage. | **[UNCERTAIN PROVENANCE]** — argued, not ruled; the section is titled as an open disagreement. |

### 2.2 Ruled out for the software effort

| # | Ruled out | Source | Stated reason |
| --- | --- | --- | --- |
| h | Non-physically-representable state; only zones, orientation, adjacency/stacking, and a small capped set of counters are expressible. | TECH §1.5 | Makes non-physical state unexpressible, so no separate lint pass is needed. |
| i | Arbitrary RNG (`rng.pick(...)`). Randomness only via `shuffle`, `draw`, `roll`. | TECH §1.5 | Every random outcome must be something two people at a table can physically perform. |
| j | Hidden per-turn upkeep. | TECH §1.5 | A human has to remember it, so duration effects need a token or a card placement. |
| k | Arithmetic beyond small integers. | TECH §1.5 | "If a human needs a calculator, the mechanic is wrong." |
| l | **Hidden information — "skipped".** | TECH §1.5 | It is co-op, the sim policy sees everything anyway, open hands is a legitimate co-op design, and it is not worth the engine complexity. (See §5.3 — this collides with later proposals.) |
| m | Godot 4 (for now). | TECH §2 | Editor-first workflow is a tax when the open question is rules, not visuals. Named as the right choice *later* if the target becomes a digital game. |
| n | `boardgame.io` as a dependency. | TECH §2 | Last npm release 0.50.2, Nov 2022 — four years without a release; repo activity is dependabot/lint chores. Concepts to be borrowed, dependency skipped. |
| o | Phaser / PixiJS. | TECH §2 | Rendering libraries; solve a problem not yet had. |
| p | Unity. | TECH §2 | Heavier than Godot here; licensing noise; no advantage for a 2D card game. |
| q | Tabletop Simulator / screentop.gg / Tabletopia as *build targets*. | TECH §2 | Complements for getting humans playtesting, not build targets. TTS is paid and some playtest conventions dropped support for it. |
| r | Out of the first vertical slice: map/floors, narrative branching, trading, art, animation, save files, networking, hidden information. Print-and-play exporter deferred. | TECH §3 | Card data model will churn before exporting is worth it; the core-loop question does not need paper to be answered. |

All of §2.2 is **[UNCERTAIN PROVENANCE]** as a block — an options table with verdict column,
a rationale list, and a milestone plan are the most characteristic model-generated artefacts in
the corpus. The *constraint they enforce* (physical-capability, item 1.1(d)) is separately
attested in TECH §0 as a decision.

---

## 3. Hard constraints — every stated number or limit

### 3.1 Stated as design constraints

| Quantity | Value | Source |
| --- | --- | --- |
| Player count | **1–2**, cooperative, shared victory condition | HANDOFF §1, §3 |
| Complexity ceiling | Qualitative only: "strive for a lower-complexity game"; avoid extra systems, extra rules layers, extra physical components | HANDOFF §1, §3 |
| Component budget | Qualitative only: "no extra components", resources on cards or as cards | HANDOFF §1, §3; quoted back in MECH §3.6 |
| Arithmetic ceiling | Small integers only — "if a human needs a calculator, the mechanic is wrong" | TECH §1.5 |
| Counter budget | "a small capped set of counters" — cap unspecified | TECH §1.5 |
| Starting deck | "a **small** deck of simple cards" — no number | HANDOFF §3 |
| Floor count | "**Many more floors** than Slay the Spire" — no number | MECH §1.7 |

### 3.2 Stated as proposals or targets, not as settled constraints

All of the following sit in MECH §2 ("proposals raised but not yet ruled on") or §3 (open
questions). They are numbers on the table, not numbers agreed.

| Quantity | Value | Source | Note |
| --- | --- | --- | --- |
| Rooms per floor | **6–10** | MECH §2.9 | Listed under "Miscellaneous" within the unruled section |
| Time per floor | **5–8 minutes**; "the concept dies if a floor takes 20" | MECH §2.9, and again §2.2 | The only play-time figure anywhere in the corpus. It is a *floor* target, not a session target — **no total play time is stated anywhere.** |
| Actions per turn | 1 flagged as possibly too slow on a 10-room floor; **2–3** floated as an alternative | MECH §2.9 | Explicitly unresolved |
| Activation count | **5** cards per turn (used as the working example throughout) | MECH §1.2, §2.8 | Appears as an illustration, never as a ruling |
| Loss threshold | Lose if the pool would fall below the activation count; "a floor around **10–12** cards" | MECH §2.8 | Proposed fix for a stall failure mode |
| Attack values | **1–5** | MECH §3.4 (quoting prototype Finding 5) | Simulation output |
| Block values | **1–3** | MECH §3.4 (quoting Finding 5) | Simulation output |
| Card cost range | **0–4** wanted, for tuning resolution | MECH §3.4 (quoting Finding 6) | Simulation output |

### 3.3 Simulation figures (second-hand; source file absent)

Quoted identically in TECH §0 and MECH §3.4, both citing `prototype/NOTES.md`, **which is not
present in this repository**.

| Figure | Value |
| --- | --- |
| Deck-size cost per extra job the deck performs | ~**+14 cards** |
| Deck size by cost model | energy **14** / discard **28** / bleed **42** |
| Projected deck size for the untested activate/convert model | **~42, possibly more** |
| Leading cost model on tension-per-component | `discard`, at a **28-card** deck |
| Share of wins that were close, under cards-as-cost models | **87–100%** (vs **0%** under the energy model) |
| Recruit-vs-kill dominance, in all three tested models | recruiting chosen **68–80%** of the time |
| First-slice scope | ~**10** cards, ~**4** effect primitives, **1** enemy | (TECH §3 — a build scope, not a game constraint) |

### 3.4 Never stated anywhere

Named explicitly because the ticket asks for them and the corpus is silent:

- **No price point.** No cost target, MSRP, or production budget appears in any of the three files.
- **No table size or footprint.** MECH §3.6 refers to "face-down room tiles laid out on the table"
  but gives no dimensions, tile size, or footprint limit.
- **No total card count** for the finished game. Every card number in the corpus is either a
  simulated *deck* size or the ~10-card first-slice scope.
- **No component count.** The component constraint is qualitative throughout ("no extra
  components"), never a number.
- **No total play time** for a session or a run — only the 5–8 minute per-floor target.
- **No numeric complexity ceiling** (no weight rating, no rulebook page target, no teach-time target).
- **No age range, no box size, no run length in floors.**

---

## 4. Flagged open questions

Only items the sources *themselves* mark as unresolved.

### 4.1 Marked open in HANDOFF

| # | Question | Section | Exact framing |
| --- | --- | --- | --- |
| a | **What is the core gameplay loop?** | §5, restated §7 | "currently the most important unresolved question"; §7 closes "The next major design task is to determine the core gameplay loop before adding too many secondary systems." A structure is later pinned in the same section — see §5.1. |
| b | How solo play and two-player play differ in implementation | §3 "Cooperative" | "remains open" |
| c | Recruitment rules and balance | §3 "Multiple Combat Resolutions" | "still open" |
| d | Implementation of the trade-multiple-cards-for-one mechanic | §4 "Trading / Bartering" | "The specific implementation remains open" |
| e | How cards are acquired | §3 "Deckbuilding" | Hedged: "cards will **likely** be acquired primarily through rewards" |

### 4.2 Marked open in MECH

| # | Question | Section |
| --- | --- | --- |
| f | Whether the floor-plan structure replaces the pinned branching-map structure. "**The handoff needs updating or this needs downgrading to an alternative.** Flagged, not decided." | §3.1 |
| g | Hidden room contents vs. a fully visible map — labelled an "active disagreement", the only place a designer position is named. | §3.2 |
| h | The form of room re-randomization, if any: static loot with roaming monsters, vs. stable room identity with drifting contents. | §3.2 |
| i | What the end-of-floor full heal actually restores. §2.7 proposes an answer; §3.3 says it "Needs a decision." | §3.3 |
| j | Whether the untested activate/convert cost model survives a re-run of the cost-model bake-off. "Action: run the bake-off again ... before committing." | §3.4 |
| k | Whether at-will fleeing is dominated the same way recruiting was measured to be (68–80%). "Needs testing, not assertion." | §3.5 |
| l | Whether persistent monster damage justifies its component cost — "the one item here with a real cost", a wound marker or dial per monster. | §3.6 |
| m | Whether the greed-driven clock can be skipped by a cautious player who searches nothing; needs a second enforcer. | §1.6 ("One check it needs") |
| n | Turn granularity — one action per turn may feel deliberate rather than frantic. | §2.9 |
| o | **Untouched entirely:** two-player co-op on a floor plan (do heroes move independently? split up?), narrative gating, and how recruitment survives in a structure built around fleeing. | §3.7 |
| p | The whole of §2 (nine proposals) is by the document's own definition unruled: persistent monster damage, when to approach the boss, deck size vs. deck quality as the build axis, movement economy, choice of damage source, the enemy-attack vocabulary, curse-persists-but-HP-resets, a hard deck-size floor as the loss condition, and the miscellany. | §2 preamble |

### 4.3 Marked open in TECH

| # | Question | Section |
| --- | --- | --- |
| q | The core loop, cited as "The doc's own #1 open question ... combat-centric vs exploration-centric vs hybrid" — the same question as (a), still open at the time TECH was written. | §1 |
| r | **The kill-vs-recruit choice is "broken in all three models"** — recruiting dominant at 68–80% because it ends the fight. Reported as a result, with no fix recorded. | §0 |
| s | Whether the deck-is-life assumption survives: "This is a guess, explicitly expected to be replaced. The effect vocabulary must not hard-code it." | §1 |
| t | Whether the eventual target is a digital game (A) or a physical one (B) — resolved only as "hedge", not chosen. | §0 |

---

## 5. Contradictions between the documents

### 5.1 Floor structure — the documented, acknowledged conflict

- **HANDOFF §5 "DECISION (2026-08-12)":** structure is pinned to a Slay-the-Spire-style map —
  branching path choices across a floor, a mix of combat and non-combat nodes, a boss combat at
  the end of each floor. Hedged in place: "Pinned for now rather than settled."
- **MECH §1.7**, filed under *Locked*: a floor is a non-linear floor plan with backtracking,
  played as one continuous combat round, with many more and much shorter floors.
- Both documents flag the collision. MECH §3.1: "They are not compatible ... Flagged, not
  decided." HANDOFF §5 "CHALLENGED": "**Not yet ratified — this pin stands until it is.**"

**The unresolved part is which document wins.** MECH lists the new structure under "Locked"
while its own §3.1 calls it an unratified proposal, and HANDOFF asserts the older pin still
stands. As it stands the corpus asserts both structures simultaneously.

### 5.2 Cost model — a three-way collision, only partly acknowledged

- **TECH §0** reports `discard` as the leading candidate on tension-per-component, at a 28-card
  deck, from a three-model bake-off that actually ran.
- **MECH §1.2** locks activate/convert — **a fourth model that was never tested** (MECH §3.4
  says so outright).
- **MECH §3.4** projects that model at ~42 cards or more and states that this "collides head-on
  with the handoff's low-complexity / few-components constraint, exactly as `bleed` did."

So the model recorded as locked is (i) untested, (ii) projected to land at the deck size the
bake-off's rejected model produced, and (iii) acknowledged in the same document to conflict with
**HANDOFF §1/§3's component constraint** — which is the best-attested designer constraint in the
whole corpus. MECH §3.4's own remedy is to re-run the bake-off "before committing", which
contradicts §1.2 having committed.

### 5.3 Hidden information

- **TECH §1.5** rules hidden information out as an engine feature: "Hidden information:
  **skipped**", reasoning that it is co-op and open hands is legitimate.
- **MECH §1.7 and §3.2** propose hidden room contents revealed on entry, and **MECH §3.6** rates
  fog of war "fine" for a physical build. **MECH §1.2** additionally has cards activated
  *face-down*, which is hidden information by construction.

The two may be reconcilable — TECH plausibly means hidden information *between the two co-op
players*, while MECH means information hidden from *both* by the game — but neither document
draws that distinction, and MECH §3.6 reviews its additions against TECH's constraints without
noticing this one. Recorded as an unreconciled conflict on the page.

### 5.4 Status of deck-as-life

- **TECH §1** introduces deck-is-life as "**Strawman v1**", "a guess, explicitly expected to be
  replaced", and instructs that the effect vocabulary must not hard-code it.
- **MECH §1.3** files "Deck size is the life total" under *Locked*.

A provisional placeholder in the earlier document is a locked decision in the later one, with no
recorded step in between that promoted it.

### 5.5 Recruitment

- **HANDOFF §3 "Multiple Combat Resolutions"** and §4 "Enemy Cards" make weaken-then-recruit a
  central pillar, and §1 lists "multiple ways to resolve encounters" as a defining goal.
- **TECH §0** reports recruitment as measurably broken in every model tested (68–80% dominance).
- **MECH §1.7** builds a floor structure around fleeing at will, and **MECH §3.7** lists "how
  recruitment survives in a structure where you're constantly fleeing fights" as untouched.

A stated pillar of the design is simultaneously (a) measured as degenerate, (b) unaddressed, and
(c) structurally undermined by the newer floor proposal.

### 5.6 A fabricated cross-reference — verified

**MECH §3.5 states:** "The handoff's existing fix for recruit — **bosses are unrecruitable** —
has an obvious sibling here..."

**HANDOFF contains no such fix.** Grepping HANDOFF for `boss` and `unrecruit` returns exactly two
hits, both in §5, both about a boss combat ending a floor; neither says anything about
recruitability. MECH §3.5 then reasons *from* this non-existent prior decision to derive a new
one ("you cannot flee the boss room").

This is direct evidence of a confabulated citation inside the corpus, and it is the clearest
single justification for treating MECH's attributions of decisions to HANDOFF — and its "Locked"
label generally — as claims to re-verify rather than as records. MECH's other two cross-references
to HANDOFF (the "cards should represent as many things as possible" quote at §1.3, and the
3-weak-for-1-strong trade at §2.3) **do** check out against HANDOFF §1 and §4 respectively.

### 5.7 Not a contradiction, but worth recording

HANDOFF §3 "Cards as Additional Resources" carries a block marked **"RESOLVED (2026-08-12) — see
`mechanics-decisions.md`"**, back-edited into the older document. So HANDOFF simultaneously
defers to MECH on the resource mechanic (§3) and overrides MECH on floor structure (§5). Neither
document is consistently the authority.

---

## 6. Provenance summary

Material that reads as the designer's own, and that this map can lean on with the least risk:

- The brief itself: physical, 1–2 player co-op, deckbuilding roguelike, run-based, narrative
  component (HANDOFF §1).
- The low-complexity / no-extra-components constraint, including its stated form — resources on
  cards or as cards. This is the only constraint stated imperatively, designated a standing
  filter, *and* independently quoted back by both other documents (HANDOFF §1 and §3; quoted in
  TECH §0 and MECH §3.6).
- The fiction and the tower premise (HANDOFF §2).
- The intent to adapt Decipher SWCCG's cards-as-resources idea — the *goal*, not any particular
  implementation of it (HANDOFF §3).
- One position in one argument: not being convinced a fully visible map must feel puzzle-y
  (MECH §3.2, the only named attribution in the corpus).
- The rejection of a per-turn curse tick as a floor clock (MECH §1.6, recorded as an explicit
  "Rejected").

Material flagged for re-confirmation with the designer:

- Every mechanic in MECH §1 except the deck-as-life consolidation and the no-HP-track rule —
  in particular the activate/convert model, the accepted rubber band, the curse-as-usable-energy
  definition, the search-driven clock, and the whole floor-plan structure.
- The entirety of MECH §2 and the argued portions of §3, by the document's own labelling.
- HANDOFF §4 (promising ideas), §5's Option A/B/hybrid analysis, §6 (tensions), and §7 (the
  eight-item priority list) — the four most boilerplate-shaped sections in the corpus.
- The whole of TECH beyond its §0 decision — architecture, options table, physicality
  enforcement rules, and milestone plan.
- Every number in §3.3 above, pending recovery of `prototype/NOTES.md`.
