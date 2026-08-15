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

- [Extract settled constraints from previous design attempts](issues/02-extract-constraints-from-previous-attempts.md)
  — `[research]` Three prior-stated constraints survive scrutiny: physical tabletop, 1–2 player
  co-op, and *resources are printed on cards or are the cards themselves*. Nearly all mechanics in
  those documents are **uncertain provenance**, one decision is a verified confabulation, and every
  quantitative claim cites a `prototype/NOTES.md` that is not in this repo. **Nothing here is
  adopted** — each item is an input to the ticket that owns it.
- [Establish how Decipher's Force pile actually worked](issues/01-decipher-force-pile-mechanics.md)
  — `[research]` Life Force is exactly three piles, and **spending is not damage**: spent cards
  recirculate face down, lost cards leave face up and only ever return by a named "retrieve". You
  draw *from* the resource, never from the library; nothing is ever reshuffled; and you lose only
  when all three piles are simultaneously empty. Its documented cost is procedural, not strategic —
  the deck size stops being a dial, and the scoring layer punishes spending your own resource. Five
  cross-edition rules conflicts and nine evidence gaps are recorded, not resolved. **Nothing here is
  adopted** — ticket 04 owns the ruling.

## Not yet specified

<!-- In scope, but not sharp enough to ticket. Graduates into tickets as the frontier advances. -->

- **Boss encounter design** beyond the structural distinction settled in ticket 08 — what a boss
  fight actually asks of the player. Ticket 13 settles the choices an *ordinary* floor presents;
  whether a boss inverts, narrows, or simply intensifies those stays fog until 13 and 08 land.
- **Roguelite meta-progression** — whether anything persists between runs at all, and whether it
  is even in scope for a core spec.
- **Death and run failure** — what happens when a run ends badly, and how long a run should be.
- **Room contents and item pickups** — the "find items" half of the pitch. May resolve entirely
  inside ticket 09; if it doesn't, it graduates.
- **Win condition beyond the boss** — how many floors, whether a run has an ending or is endless.
- **Solo automa** — only if ticket 03 lands on co-op-first.
- **Table footprint and component budget** — the physical constraints that will eventually bound
  card count and per-turn upkeep. The *floor layout's* share of this graduated into ticket 14,
  which produces the map's first hard footprint number; what remains here is everything else.
- **Whether "North vs Up" means anything mechanical**, or is purely a title.

## Out of scope

<!-- Ruled beyond the destination. Never graduates; returns only as a fresh effort. -->

- Full card list, enemy roster, and balance numbers — beyond the 8–12 exemplars in ticket 12.
- Art direction and visual design.
- Narrative and lore beyond the tower/alien premise.
- Production, manufacturing, and component sourcing.
- Any digital implementation of the game. (Throwaway simulators built to answer a design
  question are not this — those are prototypes and stay in scope.)
