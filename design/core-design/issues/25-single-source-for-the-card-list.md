# 25 — Put the card list in one place

Type: task
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

Every card in this game is written down three times by hand, and the three copies have already
drifted apart. This ticket collapses them into one source.

The three copies are:

- **[The exemplar card set](../prototypes/12-exemplar-card-set.md)** — prose, one section per card,
  with the design reasoning attached.
- **[The cutting sheet](../../../prototype/card-sheet.html)** — hand-written HTML, one `div`
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


## Answer

`[agent, 2026-08-29, under your instruction to take this ticket and work autonomously]`

The three copies are now one. **`design/cards.yaml` is the source; the cutting sheet and the
simulator are views of it, and the prose is checked against it.** One command,
`node tools/cards.mjs check`, fails if any of that stops being true.

### 3 — what happened to the three copies

**The cutting sheet is generated.** `prototype/card-sheet.html` no longer contains a single
hand-written card. It loads `prototype/cards.js` and renders every card in the list, sorting them
into the cutting sections by filter. A card in the list that lands in no section is reported in red
at the top of the page, so a new card can never silently fail to print.

**The simulator is generated.** `prototype/encounter-sim.html` no longer holds its five card arrays.
It loads the same `cards.js` and *shapes* the data for its engine — which starter is the cheap one,
a room's threshold as a number, a Flee line read back from the printed sentence into who pays and
how much. A Flee line it cannot read throws rather than simulating a card that is not the designed
one. `prototype/sim-sweep.js` loads `cards.js` into the same VM, so the headless driver and the page
run one card list as well as one engine.

**The prose keeps its own copy, and the copy is checked.** The deliverable and the card bank are
worth reading because the card sits next to the reasoning for it, and generating them would cost
that. So they stay hand-written — and `check` parses their card lines back and compares name, cost,
rarity, stats, `Hold` and the quoted rules text against the YAML, in both directions: a card in the
prose that is not in the list is an error, and so is a player card in the list with no entry in the
prose. This is a judgement call and the cheap one to reverse if you would rather they were rendered.

**`prototype/cards.js` is generated and committed.** These pages are opened from `file://`, where
`fetch` of a data file is blocked, so a plain `<script>` tag is the only way to load the list without
a server. Committing the generated file keeps the repo's no-build-step property: clone, double-click,
print.

### 4 — how drift is caught

    node tools/cards.mjs check

fails, naming the file and line, when

- `prototype/cards.js` is stale against `design/cards.yaml`,
- either prose file disagrees with the list about a card, or lists a card the YAML does not have,
- a player card in the list has no entry in its prose file,
- `meta.exemplar_count` no longer matches the exemplars, or
- either prototype stops rendering the whole list — both pages' render code is run against a DOM
  stub and asked how many cards it drew.

It found five real disagreements the first time it was run, all of them formatting rather than
design, and one genuine one: the sheet was printing the Stuff rooms as *"A character takes 1"* where
the deliverable prints *"Red takes 1 Good Stuff."* The deliverable won, per this ticket.

### The reconciliation

The simulator's drifted card text is gone: it now displays what the deliverable ruled. Verified card
by card that **every engine-visible field is byte-identical to before** — name, owner, cost, rarity,
stats, `Hold`, conditional-stat flag, starter tier, and every room's stat, thresholds, second tier
and Flee — so nothing ticket 10 has already measured moved. Only the displayed text changed, to the
correct text.

The bank's cards now appear in both prototypes for the first time: printed on the sheet as a
separate pile, and shown on the simulator's Cards tab. **They are not simulated** — they are
candidates, not ratified design, and putting them in a pool would change the numbers ticket 10 is
asking for. That is the second judgement call in this ticket and also cheap to reverse.

### This unblocks ticket 10

The simulator runs the ratified exemplar set, as ruled, with no copy of a card anywhere near it.

### What this ticket did not do

No card changed. No cost, stat or threshold moved. Every number in the list is still a placeholder.
