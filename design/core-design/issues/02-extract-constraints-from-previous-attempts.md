# 02 — Extract settled constraints from previous design attempts

Type: research
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

`previous-attempts-at-design/` holds three documents from earlier attempts at this game. Those
attempts are being deliberately abandoned as a *process*, but they may contain constraints the
designer already ruled in or out — and rediscovering those the hard way wastes the map.

Extract, and only extract:

1. **Settled decisions** — things the author appears to have decided, with the stated reason.
2. **Explicit exclusions** — things ruled out, with the stated reason.
3. **Hard constraints** — any stated numbers or limits: player count, target play time, component
   count, card count, price point, complexity ceiling, table size.
4. **Flagged open questions** — anything the author explicitly marked unresolved.
5. **Contradictions** — where the three documents disagree with each other.

Attribute every item to its source file and section.

## Constraints on the answer

- **Facts only.** No recommendations, no synthesis into a design, no evaluation of whether a
  decision was good.
- **Do not carry over structure or framing.** Do not reproduce the documents' organisation,
  headings, terminology, or narrative. The new map must not inherit their shape — that is the
  explicit reason this effort restarted.
- **Do not summarise the design.** A reader of this answer should learn what is *constrained*, not
  what the game was.
- Where something reads as an LLM's suggestion rather than the designer's decision, flag it as
  **uncertain provenance** rather than recording it as settled. The designer specifically lost
  track of which ideas were theirs; do not compound that.
- If a document contains nothing in these five categories, say so plainly.

## Deliverable

A research file in this repo, linked from this ticket, plus the answer summary below.

## Answer

Full findings: [`research/02-previous-attempt-constraints.md`](../research/02-previous-attempt-constraints.md)

- **Genuinely constrained, low risk:** physical tabletop game; 1–2 players, co-op, shared
  victory; and the low-complexity / no-extra-components rule stated as *resources printed on
  cards or being the cards*. That last one is the only constraint stated imperatively,
  designated a standing filter, and independently quoted back by both other documents.
- **Hard numbers are thin.** The only firm figures are the player count and a *proposed* 5–8
  minute, 6–10 room floor. There is **no** stated price point, table size, component count, total
  card count, session play time, run length, or numeric complexity ceiling anywhere.
- **All simulation figures are unverifiable.** Every deck-size and win-rate number cites
  `prototype/NOTES.md`, which is not in this repo.
- **Only one passage in ~860 lines names a human** (a counter-position in `mechanics-decisions.md`
  §3.2). "Locked" and "explicitly endorsed" are the documents asserting endorsement with no
  record of who endorsed, so nearly all mechanics are flagged **uncertain provenance** —
  including the activate/convert energy model and the whole floor-plan structure.
- **Six contradictions recorded**, chiefly: the two floor structures each assert authority over
  the other; the cost model recorded as locked was never tested and is conceded in its own
  document to collide with the component constraint; deck-as-life is a disposable strawman in one
  file and locked in another; and recruitment is a stated pillar that was measured as degenerate
  and never fixed.
- **Confabulation verified:** `mechanics-decisions.md` §3.5 attributes a decision ("bosses are
  unrecruitable") to the handoff that the handoff does not contain, then reasons onward from it.
