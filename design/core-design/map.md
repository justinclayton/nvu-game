# Wayfinder map: North vs Up — core design

## Destination

A **locked core-design spec** for North vs Up: run and floor structure, turn and action
economy, the deck-as-energy-and-HP model, card acquisition, card anatomy, and 8–12 exemplar
cards — detailed enough to cut a paper prototype and run a first real playtest.

Everything past that first playtest (full card list, balance, art, production, digital
implementation) is a **later map**, not this one.

## Notes

**Domain.** A physical solo-or-cooperative deckbuilding roguelite. Players ascend the floors of
an abandoned tower overrun by alien monsters, running through rooms, finding items that grow the
deck, fighting enemies, and beating a floor boss to ascend. The intended feeling is *in over your
head, reacting to what's in front of you, with little time for deep strategy.*

**Standing rules for every session on this map:**

- **Provenance.** Every line in *Decisions so far* and every `## Answer` is tagged `[you]` or
  `[proposed by agent → you approved]`. This map exists partly because previous attempts lost
  track of which ideas were the designer's and which were an LLM's. Never let that blur again.
- **No unprompted invention.** The agent surfaces *questions* and labels recommendations as its
  own. The human rules. Nothing enters the map the human hasn't ruled on.
- **Plan, don't do.** Tickets resolve decisions. The destination is a spec, not a game.
- **Prototyping policy.** Numeric questions (drain rates, floor length, action counts) get a
  throwaway HTML simulator. Feel questions get index cards on a real table. Every prototype
  ticket states which kind it is.
- **Research is facts-only.** Research tickets return flat lists of facts with sources. No
  recommendations, no application to this game, no design opinions.
- **Declined method.** No survey of comparable games (Slay the Spire-likes, Aeon's End, Clank!,
  Star Realms). The human declined this deliberately. Only revisit if the human asks.
  - **One carve-out, granted 2026-08-14** `[you]`: prior art for *the mechanic* — card games of any
    genre that make the cards themselves stand in for tokens, health, or counters — is in scope, and
    is [ticket 16](issues/16-cards-as-resource-precedent-survey.md). This is not a reversal. A survey
    of *comparable games* — deckbuilders and roguelites as peers — stays declined. The test is
    whether the subject is one mechanic's precedent or another game's overall design.
- **Skills.** Every session invokes `/grilling` and `/domain-modeling`. Prototype tickets invoke
  `/prototype`. Research tickets are resolved by a `/research` subagent.
- **Glossary.** `CONTEXT.md` does not exist yet — create it at the repo root the moment the first
  domain term is actually settled (likely from ticket 04 or 05), and keep it a glossary only.
- **Previous attempts.** `previous-attempts-at-design/` is reference material, opened only when a
  ticket directs it. Its content and structure must not shape this map.

**Tracker.** Local markdown, overridden to this directory. See `docs/agents/issue-tracker.md`.

## Decisions so far

<!-- One line per closed ticket: the gist plus provenance, then the link. The detail lives in the
     ticket's ## Answer and is never restated here.

     Research tickets are tagged [research] — they establish facts and rule nothing. A fact only
     becomes a constraint on this design when a grilling ticket adopts it and the human says so. -->

- [Establish how Decipher's Force pile actually worked](issues/01-decipher-force-pile-mechanics.md)
  — `[research]` Reference on one card-as-resource economy, for ticket 04 only. The transferable
  parts: a card is a unit of resource; the resource pool is a set of named piles, and cards not in
  those piles don't count — so *drawing to hand costs you life*; the player taking a loss chooses
  which cards go; you lose when the pool is empty; spent cards return to the bottom of the deck
  unshuffled. **Two findings that earn their keep:** deck-thinning was never viable there — when the
  deck is the life total, thinning is self-harmful without any rule saying so, which is prior art
  for the inversion at the centre of ticket 04. And the economy broke four publicly-named times,
  every one a **recursion** — any card that puts resource back into the pool is a healing card and a
  refuelling card at once. **The warning:** every transfer was a card moved by hand, every turn. The
  bookkeeping cost is real, and ticket 04 owes an answer against the low-complexity constraint.
- [Extract settled constraints from previous design attempts](issues/02-extract-constraints-from-previous-attempts.md)
  — `[research]` Three prior-stated constraints survive scrutiny: physical tabletop, 1–2 player
  co-op, and *resources are printed on cards or are the cards themselves*. Nearly all mechanics in
  those documents are **uncertain provenance**, one decision is a verified confabulation, and every
  quantitative claim cites a `prototype/NOTES.md` that is not in this repo. **Nothing here is
  adopted** — each item is an input to the ticket that owns it.
- [Decide solo, co-op, or both](issues/03-solo-coop-or-both.md) — `[you]` **Two characters are
  always in play: Red** (stocky, aggressive, headstrong) **and Gray** (concerned, attuned,
  resourceful). Co-op = one player each; solo = one player runs both. Solo and co-op are therefore
  the *same game*, not two tunings. Ceiling is 2 players. Following from it
  `[proposed by agent → you approved]`: one deck and one health pool **per character**, so a
  character can be in trouble alone; **fully open information** (a solo player sees both hands
  anyway); **strict alternating turns**, Red then Gray; and **down, not dead** — a character at zero
  is revivable, the run ends only when both are down. Whether *energy* is shared or per-character is
  deliberately **not** decided — handed to ticket 04, which must define the term first.
- [Survey card games that use cards themselves as resource, health, or counters](issues/16-cards-as-resource-precedent-survey.md)
  — `[research]` Widens ticket 01's single data point: **31 qualifying games** across five families —
  cards as *currency*, *health*, *clock*, *damage*, *counters*. Requested by the human as a narrow
  carve-out from the declined-survey rule; San Juan was the human's example, the rest of the seed list
  was the agent's, and **three of the agent's seeds were factually wrong**. **The finding that matters
  most for ticket 04:** the recursion failure mode ticket 01 found in Decipher **recurs in three more
  games** — Necropotence restricted twice, Lorcana's Fortisphere banned for "a never-ending loop" —
  so it is a property of the economy, not of one game. **The finding that cuts against the map's
  current hypothesis:** in Undaunted, where damage removes cards, players **deliberately bait
  casualties as free deck-thinning**; losing health makes the deck better, and a published strategy
  guide recommends it. That is ticket 15's rubber-band hypothesis observed in the wild, working *too*
  well — it is evidence for the mechanism and a warning about its tuning at once. **On bookkeeping:**
  Ravensburger publishes an official *"Inkwell Error"* judge procedure for miscounts in a
  permanently-hidden resource pile — a publisher conceding the pile is unverifiable in practice.
  Three distinct answers to *who chooses which card is lost* are now on the table: player-picks,
  opponent-picks, and Undaunted's **fixed priority where neither player chooses**. **Nothing here is
  adopted** — facts only; a fact binds this design only when a grilling ticket adopts it and the
  human says so.

## Not yet specified

<!-- In scope, but not sharp enough to ticket. Graduates into tickets as the frontier advances. -->

- **Boss encounter design** beyond the structural distinction settled in ticket 08 — what a boss
  fight actually asks of the player.
- **Roguelite meta-progression** — whether anything persists between runs at all, and whether it
  is even in scope for a core spec.
- **Death and run failure** — what happens when a run ends badly, and how long a run should be.
- **Room contents and item pickups** — the "find items" half of the pitch. May resolve entirely
  inside ticket 09; if it doesn't, it graduates.
- **Win condition beyond the boss** — how many floors, whether a run has an ending or is endless.
- **Fixed duo or roster** — whether Red and Gray are the only two characters or one pairing drawn
  from a larger cast. Pending ticket 13; a roster would expand content scope considerably.
- **Table footprint and component budget** — the physical constraints that will eventually bound
  card count, board size, and per-turn upkeep.
- **Whether "North vs Up" means anything mechanical**, or is purely a title.

## Out of scope

<!-- Ruled beyond the destination. Never graduates; returns only as a fresh effort. -->

- Full card list, enemy roster, and balance numbers — beyond the 8–12 exemplars in ticket 12.
- Art direction and visual design.
- Narrative and lore beyond the tower/alien premise.
- Production, manufacturing, and component sourcing.
- Any digital implementation of the game. (Throwaway simulators built to answer a design
  question are not this — those are prototypes and stay in scope.)
