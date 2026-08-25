# 22 — Decide what is in a floor deck, and how it escalates

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

A floor is a deck now. What is in it?

Decide:

1. **Size.** How many cards a floor deck holds, and whether that is fixed, variable, or scaled by
   floor. This is the ticket that has to make a floor play in **5–7 minutes** — every card in the
   deck is at least one turn, and a card that comes back around is more.
2. **Composition.** What kinds of card a floor deck contains. Ticket 05's *one enemy per floor* is
   now ambiguous: the deck may be one monster shown many ways, a monster plus its lesser company, or
   a mix of threats and non-threats. Rule on whether every floor card is an enemy, and if not, what
   else a card can be — an obstacle, a hazard, an opportunity, a piece of the floor itself.
3. **The last card.** Whether the deck has a climax — a card that must be beaten last, or is worth
   more, or ends the floor when defeated — or whether the shuffle means the floor simply runs out.
   Ticket 05 collapsed "boss" and "room enemy" into one thing; this is where that ruling either
   holds or is revisited.
4. **Escalation.** How a floor deck gets harder floor to floor, across ten floors. Ticket 05 set
   enemy difficulty as one axis and left a second axis open; **the pyramid tower answered it
   spatially and died with the spatial floor**, so the second axis is open again. Deck composition is
   the obvious candidate — more cards, nastier mix, harsher reshuffles — but that is a candidate, not
   a decision. **Name the axes explicitly** `[from ticket 08]`: an individual threat can get harder by
   what it takes to defeat, by what it costs to fail, or by how it behaves, and the deck can get
   harder by what it holds. Say which of those the game uses and which it deliberately leaves flat,
   and keep every point on the curve inside ticket 07's upkeep budget.
5. **The reshuffle.** Ticket 18 rules that the discard pile shuffles back in when the draw pile
   empties. Decide whether anything about the deck changes when that happens — whether a second pass
   is the same floor again or a worse one — and how many passes a floor is expected to take.
6. **Setup.** What a human physically does to build a floor deck and clear it away, ten times a run,
   inside the 5–7 minute budget. This ticket produces the map's **first hard component number**: how
   many floor cards a copy of the game needs.
7. **Where the deck comes from.** Whether each floor has its own printed deck, floors are built from
   one shared pool, or a floor deck is assembled by rule at setup.

## Settled upstream by ticket 21 — do not relitigate

`[you, 2026-08-23]` Ticket 21 resolved first, so **this ticket owes the sibling reconciliation
check** — read its Answer and record explicitly how this ticket sits against it. What lands here:

- **Item 2 is half-answered.** There are three room kinds at level 1: **combat** (`Power X`),
  **hazard** (`Scramble X`), and **item rooms**. What is left is the *mix* — how many of each, and
  whether the ratio shifts floor to floor.
- **Item rooms are the only reward-bearing room**, and carry **no punishment** by default. They are
  the deck's one always-safe-to-decline card, which makes them the lever on how generous a floor is.
- **Two escalation dials were left here deliberately.** A room's **challenge** and its **punishment**
  are independent numbers, so a room can be cheap to beat and brutal to fail; and **multi-stat rooms**
  (`Power 3, Scramble 2`, both required) are legal but **none are printed at level 1** — so the first
  playtest moves one variable. Both are yours to spend.
- **Rooms have no behaviour**, so there is no per-room upkeep to budget beyond flipping and reading.
- **Every room is one turn minimum**, and a Fled room is more, so deck size is the floor-length dial
  almost by itself.

## Must satisfy

- The encounter loop settled in [ticket 18](18-floor-encounter-decisions.md).
- Ticket 05's run structure: **ten floors**, **5–7 minutes each**, a **card reward** on clearing.
- Ticket 02's best-attested prior constraint — *low complexity; no extra physical components,
  resources are printed on cards or are the cards themselves.* A floor deck is cards, which is the
  right side of that constraint; the number of them is what needs watching.

## Notes for the session

- Sibling of [ticket 21](21-defeating-a-floor-card.md) — see the note there. Deck size and defeat
  difficulty trade directly against each other and against the five-minute budget.
- The reshuffle is a difficulty multiplier hiding as a bookkeeping rule. A deck the players are
  struggling with gets *longer*, not shorter. Decide whether that is the intended pressure or a
  death spiral, and say which.

## Provenance

`[proposed by agent → awaiting your approval, 2026-08-23]` Created to hold the questions
[ticket 18](18-floor-encounter-decisions.md) explicitly left open, plus the escalation axis that fell
back open when the pyramid tower was abandoned. Nothing in it is decided.

## Answer

Resolved by grilling session, 2026-08-24. **The win condition changed underneath this ticket, and
most of what follows is a consequence of that one change.**

### The win condition — supersedes ticket 18's "every room Cleared"

`[you]` **A floor deck holds exactly one combat room, and clearing it ends the floor.** Ticket 18's
original rule — the encounter is over only when the whole deck is exhausted — no longer holds; see
that ticket's *Superseded in part* note. The combat room is the climax item 3 asked about: the card
that ends the floor when defeated. This vindicates ticket 05's original "boss and room enemy
collapse into one thing" rather than reopening it — there really is one enemy per floor, and
beating it is what grants passage. Hazard and item rooms are never mandatory: a floor can end with
either kind still sitting uncleared in the deck. They are the resources on the way to the fight, not
obstacles between the players and the exit.

`[you]` **Combat rooms always carry a punishment, printed on the card as its Flee cost.** Full text
in [ticket 21's amendment](21-defeating-a-floor-card.md); in short, this is the existing *Exhaust X
from deck* punishment, not a new mechanic, guaranteed present for this one room kind and framed
diegetically — failing or declining a combat room is fleeing it, with a few scrapes to show. It is
why the first encounter with a floor's combat room is expected to end in flight: the players see it,
cannot meet its `Power` yet, and pay the Flee cost rather than lose for nothing.

### 1. Size and 2. composition

`[you]` **Size is a resource-count question now, not a turn-budget one** — the floor ends on the
combat room's defeat, not on exhausting the deck. Composition is fixed in shape, variable in
generosity:

- **Combat: exactly 1**, every floor.
- **Hazard: flat 3**, every floor, floor 1 through floor 10.
- **Item: 9 at floor 1, decreasing by 1 per floor, reaching 0 at floor 10.**

| Floor | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Item | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| Total rooms | 13 | 12 | 11 | 10 | 9 | 8 | 7 | 6 | 5 | 4 |

(Combat and hazard add 4 to every row's total.)

### 3. The last card

Answered above: the combat room is the climax. Not decided separately.

### 4. Escalation

`[you]` **Escalation is resource scarcity, not a harder fight.** Item count is the dial: −1 per
floor, hitting zero by floor 10, so the last floors test whether a run's permanent card rewards
(ticket 05's ascend reward) can carry the fight without floor items to lean on. Hazard count stays
flat — the shrinking total room count (13 down to 4) is itself the pyramid ticket 05 lost when the
spatial tower died, recovered here through composition rather than topology.

`[you]` **The combat room's `Power` requirement is deliberately left untuned.** It depends on how
much a synergy-built deck can move the stat pool, which neither ticket 11 (card anatomy) nor ticket
12 (exemplars) has answered yet. Ticket 10's simulator is the right tool to tune it once real cards
exist — not this ticket.

### 5. The reshuffle

`[you]` **Unchanged from the standing answer.** Nothing about the deck's contents changes when the
Fled pile shuffles back in; the players are weaker, not the deck harder. This still holds under the
new win condition — a Fled combat room reshuffles back in exactly as printed, met again once the
players have drawn more from what else is left in the deck.

### 6. Setup and the component number

`[you]` **Floor decks are assembled at setup from three shared pools** (combat, hazard, item), not
printed as ten bespoke decks — see item 7. **Pool size targets uncommon repeats within a single
run, not zero repeats.** A run draws each pool 10 times (combat), 30 times (hazard), and 45 times
(item) across its ten floors; eliminating repeats entirely would mean printing a card for every
draw — 85 unique cards — which outruns what ticket 12's 8–12 exemplars can validate and collides
with ticket 02's low-complexity constraint. The target instead: roughly 1.5–2× the largest
single-floor draw for hazards and items (so on the order of 15–18 hazards, 12–15 items), and a
combat pool closer to one-per-floor (around 10) since the fiction wants each floor's threat to read
as a different monster. **Exact counts are left to ticket 12's exemplar set**; this ticket sets the
policy, not the printed number.

### 7. Where the deck comes from

`[you]` **A shared pool per room kind, assembled by rule at setup.** Building a floor deck draws its
fixed counts — 1 combat, 3 hazard, and however many items that floor calls for — from the three
pools and shuffles them together. The same physical card can appear on floor 2 and again on floor 9.

### Amendment to ticket 21

Making the combat room the win condition forced three changes to ticket 21's room-kind rules. Full
text lives in [ticket 21's amendment](21-defeating-a-floor-card.md); summarized:

- Item rooms lost their challenge entirely — the item is guaranteed on the flip, though the turn's
  mandatory draw still costs stamina.
- Hazard rooms gained a second, higher threshold: clear-and-leave versus
  clear-and-pay-a-permanent-card-reward, locking in only once the players declare the play phase
  done.
- Hazard rooms, not item rooms, are now where a floor's permanent card rewards are found — item
  rooms remain the source of Hold items to hand.

### An input for tickets 11 and 13, not decided here

`[you]` During this session, surfaced while exploring why the scratch deck didn't produce the
*in-over-your-head, need-to-gear-up* feeling: **stats live on floor rooms, not on starter or
acquired player cards.** Item and hazard rooms are the primary source of `Power`/`Scramble`; a
character's own deck is proposed to do more interesting things by default instead — healing,
drawing extra, moving cards around, effects rather than stats. This directly bears on ticket 11's
card anatomy and ticket 13's Red/Gray asymmetry, and **is not itself decided by this ticket** — it
is handed down as context for whichever session opens those, the same way ticket 06 hands down
constraints rather than deciding them for later tickets.

### Sibling check

Ticket 21 resolved first and left this ticket three room kinds, one reward-bearing type, and two
escalation dials (multi-stat rooms, independent failure-cost tuning). This ticket used neither of
those dials — it escalates through item scarcity instead — and in the process reopened and amended
ticket 21's reward and challenge rules directly, rather than layering a contradiction on top
silently.

### Amended by ticket 09, 2026-08-24

[Ticket 09](09-card-acquisition-and-deckbuilding.md) specified the mid-floor reward this ticket
created but left unspecified, and renamed a term running through this ticket's composition table.

- **`Item` is renamed `Stuff`.** `[you]` The escalation dial is **Stuff scarcity**: the *Item* row
  of the composition table is the **Stuff** row, falling from 9 at floor 1 to 0 at floor 10. The
  room is still called an `Item room` for now, provisionally. Nothing about the counts changes.
- **Stuff rooms hold Good Stuff only.** `[you]` Bad Stuff — junk, slime, a torn seal — comes from a
  separate pool *outside* the floor deck, handed over by a room's printed punishment. So this
  ticket's ruling that a Stuff room is the deck's one always-safe flip holds fully: what you find
  there is always worth finding.
- **The pool policy now covers five pools, not three.** `[you]` Alongside the combat, hazard, and
  Stuff room pools this ticket sized, there are now **two per-character permanent card reward
  pools** — one Red, one Gray — plus the Bad Stuff pool. The reward pools are sized by a different
  rule than the room pools: large enough that a card declined and sent to the bottom is
  **essentially never seen again in that run**. Exact counts stay with ticket 12, as this ticket
  ruled for the room pools.
- **The hazard room's high threshold is now specified.** `[you]` It reveals the top card of a reward
  pool face up; the players may add it to the top of that character's deck or skip it. Which
  character or characters reveal is **printed on the hazard card**. The exemplar set starts with one
  standard line: *"One character reveals reward. You may add it to the top of your deck or skip
  it."*

Unchanged: the win condition, the composition counts, escalation through scarcity, the reshuffle,
and the combat room's untuned `Power`.

## Amended by ticket 11, 2026-08-25

**Your Stuff curve is now the primary escalation mechanism, not a generosity setting.**

This ticket set Stuff count falling from 9 at floor 1 to 0 at floor 10, and framed escalation as
*resource scarcity, not a harder fight*. It also handed down, undecided, that *floor rooms rather than
player cards may be the primary stat source*.

[Ticket 11](11-card-anatomy.md) took that up and ruled it `[you]`: **player cards are effect-forward,
and Stuff always provides the bulk of the raw stats.** A permanent deck is modifiers; the base they
act on is scavenged fresh every floor. So this ticket's 9 → 0 curve is not just fewer nice things —
it is the steady removal of the thing a clever deck needs in order to function. Late floors starve the
build the player spent the run assembling.

Two consequences for this ticket:

- **Floor 10's bottom-of-curve number needs verifying.** `[you, ticket 11]` The *shape* is ruled —
  floor 10 is meant to be a desperate scrape — but it must be winnable, and 0 may prove impossible
  rather than desperate. Handed to [ticket 10](10-sim-the-resource-economy.md); 2 or 3 is a one-number
  fix if the sim says so.
- **Whether Enemy rooms may also carry a reward tier is now open, and belongs here.** Raised by the
  human while ratifying the room card format `[you, ticket 11]`. A room card is a list of
  `threshold: outcome` lines, so the anatomy supports it for free — this ticket owns whether
  composition uses it.

**Rename**, per ticket 11: **combat room → Enemy room**, **item room → Stuff room**. And this ticket's
**Flee cost** and ticket 21's **punishment** are one field, printed once as the room's **Flee line**.

## Handed down by ticket 10, 2026-08-25

[Ticket 10](10-sim-the-resource-economy.md) was resolved against this ticket's open numbers and then
reopened the same day, because its card model was invented and the numbers described the invention.
**Nothing it reported about this ticket stands as a measurement.** Two things are worth carrying
anyway, both as questions rather than answers.

**1. Ticket 11's floor-10 question is still open.** Whether the bottom of the 9 → 0 Stuff curve is
desperate or impossible was handed to ticket 10 and is not answered; the earlier note claiming zero
is winnable is **withdrawn**. It returns once [ticket 12](12-exemplar-card-set.md) supplies cards.

**2. The gap between a hazard's two thresholds is probably a strong dial, and this ticket set no
number for it.** The high threshold is the mid-floor reward, and the mid-floor reward is most of how a
deck grows during a run, so the gap prices deck growth directly. Ticket 11 gave the room card a format
that supports any gap; this ticket owns which one gets printed. Worth knowing it is likely
load-bearing rather than flavour, even though the size of the effect is not settled.

**Also still open, and now sharper:** this ticket's untuned Enemy `Power` cannot be picked without
knowing whether player throughput grows at all over a run. That is
[ticket 23](23-power-growth-across-a-run.md), and this ticket's escalation-through-scarcity ruling is
one of its inputs — scarcity makes the player weaker, and if nothing makes them stronger, `Power`
cannot rise either.
