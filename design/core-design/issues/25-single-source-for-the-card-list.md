# 25 — Put the card list in one place

Type: task
Status: open
Blocked by: —
Map: [core design map](../map.md)

## Question

Every card in this game is written down three times by hand, and the three copies have already
drifted apart. This ticket collapses them into one source.

The three copies are:

- **[The exemplar card set](../prototypes/12-exemplar-card-set.md)** — prose, one section per card,
  with the design reasoning attached.
- **[The cutting sheet](../../../prototype/12-exemplar-cards.html)** — hand-written HTML, one `div`
  per card, which is what actually gets printed and cut.
- **[The encounter simulator](../../../prototype/encounter-sim.html)** — a JavaScript array of card
  objects, which is what ticket 10 runs its numbers on.

Nothing generates any of them from any other, and nothing checks that they agree.

## Why this is a ticket and not a chore

**They have already drifted, and the simulator is the copy that is wrong.** Found on 2026-08-29
while dropping `Pack Rat`:

| Card | Deliverable and sheet | Simulator |
|---|---|---|
| `Pack Rat` | *keep up to 2 Stuff for the next floor* | *Stuff you hold is not set aside when you ascend* — no limit |
| `Scrap Sense` | *first Good Stuff played each turn has +2 Power and +2 Scramble; Exhaust if holding none at cleanup* | *when a Stuff room is Cleared, take 1 extra Good Stuff* — a different card |

`Scrap Sense`'s current text was a deliberate fix on 2026-08-25, made because the old version killed
itself on the game's most common turn. The simulator never received it.

**This blocks ticket 10.** [Ticket 10](10-sim-the-resource-economy.md) is charged with producing the
costs, stats and thresholds the whole set is holding as placeholders, and it produces them by running
the simulator. A simulator running cards that do not exist cannot produce a number anyone should
trust.

**And the bank is not in either prototype.** The twenty-two cards added to the
[card bank](../prototypes/12-card-bank.md) on 2026-08-27 appear in neither the sheet nor the
simulator, so neither prototype currently represents the game.

## What to decide

1. **Where the one source lives, and in what format.** A data file the sheet and the simulator both
   read is the obvious shape, but this is a paper-prototype repo and a build step is a real cost.
2. **What the source holds.** Name, owner, cost, stats, rarity, `Hold`, and rules text are the
   printable fields per ticket 11. Whether the *design reasoning* — the prose that makes the
   deliverable worth reading — lives alongside the card or stays separate.
3. **What happens to the three current copies.** Whether the sheet and the simulator become
   generated artefacts, and whether the deliverable's prose keeps a hand-written copy of the card
   text or renders it.
4. **How drift is caught** if the copies do not fully collapse.

## What to do

Reconcile the copies as part of the work, using the deliverable as the authority — it is the one the
rulings were made against. Fold the card bank's twenty-two cards in at the same time, so the sheet
and the simulator represent the whole designed set for the first time.

## Not this ticket

Card design, costs, stats and thresholds. This ticket moves text; it does not change any card.


## Part done 2026-08-29 — the YAML exists

`[you]` **[`design/cards.yaml`](../../cards.yaml) is the source**, written while ratifying
[ticket 12](12-exemplar-card-set.md). It holds all 48 designed cards — 25 exemplars, 23 bank — with a
documented field set, and the card bank's twenty-two are represented for the first time. Design
reasoning stays in prose, per this ticket's question 2.

**What is left:** questions 3 and 4. The cutting sheet and the encounter simulator still carry their own
hand-written copies, so the drift this ticket exists to stop is still possible. They have to be made to
read the YAML, or checked against it.

**This ticket still blocks [ticket 10](10-sim-the-resource-economy.md)**, because the simulator is the
copy that was wrong and it has not been reconciled yet.
