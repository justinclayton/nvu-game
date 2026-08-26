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

## Open finding from ticket 12, 2026-08-25 — the Stuff room turn

**Nothing here is ruled.** This is a finding logged against a resolved ticket so it is not lost, and it
belongs to this ticket because it is composition. Found by a reviewer given only
[ticket 12's card sheet and rules summary](../prototypes/12-exemplar-card-set.md) — no tickets, no map
— who set up floor 1 and played it out.

### What happens

**Six of ten turns were "draw one, throw it away," and Gray went Down on turn 7 without a single Enemy
or Hazard touching them.**

A Stuff room has no threshold and no Flee line, so there is nothing to beat and nothing to decline. But
the turn still runs its full shape, and ticket 04's **minimum draw** means each standing character
still spends a card. So a Stuff turn costs the team **2 cards of stamina** and asks one thin question:
whose hand the Stuff goes into.

At floor 1 that is **9 of 13 rooms — 69% of the deck**, and it is the most Stuff the curve ever holds,
so the problem is at its worst exactly where a new player meets the game.

### Why it happens: two well-reasoned rulings colliding

Neither of these is wrong on its own.

- **This ticket removed the Stuff room's challenge** so the room would never be a disappointment.
- **Ticket 04 made the minimum draw mandatory** so declining a room would never be free and the drain
  would have no off switch.

Guaranteed payout plus mandatory cost equals a turn where you pay and choose nothing. Then
[ticket 11](11-card-anatomy.md) made Stuff the stat engine, which raised the stakes in both
directions: the room is now the supply line you cannot skip, *and* the most common thing you do.

### Two complaints, not one — and they belong to different tickets

The review ran them together and they should be split, because they have different fixes.

1. **The turn has no decision.** Structural, and this ticket's. Ticket 06 put the frantic pillar on
   *something acts on you every turn* — carried, per [ticket 07](07-turn-and-action-economy.md), by
   the flip alone. On a Stuff room the flip acts on nobody.
2. **The drain is lethal.** Numeric, and [ticket 10](10-sim-the-resource-economy.md)'s. Nine such turns
   is 18 cards against a combined starting pool that ticket 09 left unsized. If 2 cards is a fair price
   for a piece of Stuff worth 3–6 stats, this half evaporates on its own once decks are sized.

**One mitigation already in the design, which the rules never state and this ticket should:** a Stuff
room **leaves the floor deck permanently** — it becomes a card in a hand, so it is never Cleared and
never Fled. The deck shrinks as you strip-mine it and the Enemy gets closer. The tax is also a clock.

### The option space, none of them ruled

1. **Do nothing; treat it as ticket 10's number.** A Stuff turn is a breather between hazards, and
   paying 2 cards for the stat engine is a good trade. Cost: the game's most common turn stays empty
   of agency, which is what ticket 06's pillar can least afford.
2. **Lower the Stuff count.** One number, preserves every structure, keeps the 9 → 0 shape starting
   from a lower top. Cost: narrows this ticket's only escalation dial, and does not fix complaint 1.
3. **Exempt Stuff turns from the minimum draw.** Directly removes the tax. Cost: reintroduces the off
   switch ticket 04 closed deliberately, on 69% of floor 1 — probably the worst option on the table.
4. **Flip two Stuff, take one.** Gives the turn a real decision while keeping the guarantee, and reuses
   the ascend offer's shape rather than inventing anything. Cost: burns the Stuff pool twice as fast,
   and puts a small shopping moment inside the encounter — though no larger than the hazard reveal
   ticket 09 already cleared on those grounds.
5. **A Stuff room does not consume a turn: take the Stuff and flip again immediately.**
   `[the agent's recommendation, labelled as such]` It preserves everything this ticket wanted — Stuff
   guaranteed, never a disappointment, scarcity as the dial — and dissolves both complaints at once,
   because there is no longer a Stuff *turn* to be empty or to charge for. It also sharpens this
   ticket's escalation dial rather than blunting it: early floors are thick with free flips, late
   floors have none, so the same 9 → 0 curve now controls **how many turns a floor costs** as well as
   how much Stuff it yields. Cost: floor 1 gets substantially easier and shorter, which is a
   ticket 10 number; and a run of Stuff rooms can hand one character several pieces at once, which the
   hand cap turns into a real decision rather than a problem.

**What this does not touch:** the win condition, the Enemy room's Flee cost, the reshuffle, or the fact
that escalation runs on Stuff scarcity. Every option above leaves those alone.

### Ruled 2026-08-25 — option 6: the Stuff room gets a real gate

`[you]` **A Stuff room has a threshold. Pay stats or leave empty-handed.** The threshold sits
**below** what Hazard and Enemy rooms ask, so the room is the cheapest challenge in the deck, but it
is a challenge: you must draw and play to satisfy it.

This **reverses this ticket's ruling that a Stuff room is "the deck's one always-safe flip"**, and
the restatement of it under the ticket 09 amendment — *"what you find there is always worth
finding."* That guarantee is withdrawn deliberately. The disappointment it was protecting against is
now **self-inflicted rather than dealt**, and those are different feelings at a table.

**What decided it** `[you]`: the mandatory draw is defensible as *acting on the room costs you* and
indefensible as *walking between rooms costs you*. The earlier options 3 and 5 both fixed the
diegetic problem by making the walk free, which reopens the off switch
[ticket 04](04-deck-as-energy-and-hp-model.md) deliberately closed. This fixes it by making the turn
not a walk. Ticket 04's rule survives intact.

**It also answers complaint 1 outright.** The turn now has a decision — engage or bank the cards — so
[ticket 06](06-the-frantic-pillar.md)'s *something acts on you every turn* is carried on a Stuff room
by the threshold rather than by nothing.

**And it does not make complaint 2 worse, which is the non-obvious part.** Meeting a threshold costs
more cards than throwing one away, so this looks like it deepens the drain. It does not, because
**declining is still available and costs exactly what today's Stuff turn costs**: draw your minimum
one, play nothing, take nothing. The floor's floor price is unchanged and every card above it is
opt-in. The lethality question stays exactly where it was —
[ticket 10](10-sim-the-resource-economy.md)'s.

#### What this ruling now owes

Four consequences, none of them ruled, in the order they have to be settled.

1. **A Stuff room is currently not a card.** `[finding]` Per ticket 11 the Stuff room *is* the Good
   Stuff card — no threshold line, no Flee line — which is why [ticket 12](12-exemplar-card-set.md)
   printed four Good Stuff cards and no Stuff rooms at all. A threshold has to print somewhere.
   Either the Good Stuff card carries a threshold line **read only while it is in the room zone and
   ignored in hand**, or Stuff rooms become separate cards and the Stuff pool roughly doubles.
   `[the agent's recommendation, labelled as such]` the former: it costs no new components, and
   ticket 12's finding 1 already established that this card reads differently in the room zone than
   it does in hand.
2. **Which stat does it ask for?** `[finding]` Red produces `Power` and Gray produces `Scramble`, so
   a gate naming one stat taxes the other character a card for a threshold they cannot help meet —
   the compounding factor behind the review's floor-1 death. Options: the gate accepts **either**
   stat; the pool mixes both so the burden alternates; or the printed Stuff decides, so you pay in
   the currency of the thing you are reaching for. Unruled.
3. **Does a failed Stuff room leave the deck?** `[finding]` This ticket's own mitigation — *"the tax
   is also a clock"* — rests on a Stuff room leaving permanently because it becomes a card in a hand.
   Fail the gate and it is in nobody's hand. If it goes to the Fled pile it returns and re-pads the
   deck, which worsens the reshuffle problem directly. `[the agent's recommendation]` it leaves
   regardless: you looted the cache or you did not, and either way it is behind you. That keeps the
   clock running and keeps Flee lines off the card.
4. **How low is low?** A ticket 10 number. Ticket 12 needs a placeholder to reprint its rooms
   against.

#### What this does not fix

- **The hand-jam hole.** Holding five `Hold` cards still makes a character unable to draw, which is
  now free. A gate gives a reason to unjam but does not close the hole — it was opened by the `Down`
  ruling, not by dull Stuff rooms. It belongs to [ticket 14](14-down-and-revive.md).
- **The reshuffle lethality.** A fled Enemy on floor 1 cannot return for nine more turns. Ticket 10.

### Ruled 2026-08-25 — the Stuff room becomes a real room, and pays both characters

`[you]` **A Stuff room is its own card again, with its own flavour, and Good Stuff moves to a pool at
the side of the table like Bad Stuff.** The room prints a challenge; meeting it draws Good Stuff from
that pool. The room and the item are two different objects.

`[proposed by agent → you approved]` **The threshold is split per character**, not shared:

```
Sorting Room                    Stuff
Power 1:     Red takes 1 Good Stuff.
Scramble 1:  Gray takes 1 Good Stuff.
```

Rooms may also print a **second, richer tier** — *"Power or Scramble 3: that character takes 2 Good
Stuff"* — so a Stuff room can be worth leaning into.

**Why split rather than shared.** The alternative wording, *"Power 1 or Scramble 1: each character
takes 1 Good Stuff"*, was put and **declined**: one player pays and both get paid, so the table is
back to deciding who spends. That is the quarterbacking conversation in a new outfit. Under the split
form each character decides alone whether their own stamina is worth their own item, and nobody
else's outcome depends on the answer. It is the least quarterbackable structure in the game so far.

**What it kills, deliberately** `[you]`. Choosing whose hand the item lands in was never a real
decision — either one player has an opinion and says so, or the table alternates to even out the
stamina drain. Both are solved loops. Removing the choice loses nothing and removes the pressure.

**What it fixes that the threshold alone did not.** The original complaint was that most rooms are
"take the thing", which is dull, and floor 1 is mostly those rooms. A threshold made the turn cost
honest but left the room featureless. Giving the room its own card gives it a name, a flavour, and a
challenge **that is not tied to what you get** — the pool is drawn blind — so rooms can vary and the
gate stops telegraphing the prize.

#### Two of this ticket's open consequences are now answered

- **Where the threshold prints** — on the room card. Consequence 1 is closed. It is the two-card
  answer, so the pool counts change; see below.
- **Whether a failed Stuff room leaves the deck** — yes. Consequence 3 is closed, and it closes
  itself: the room and the item are different objects, so the room is **Cleared either way** and can
  never go to Fled. The clock this ticket wanted still runs.

Consequences 2 and 4 change shape rather than closing. See the new open list below.

#### What this costs, and none of it is ruled

1. **Stuff volume roughly doubles.** `[finding]` Nine rooms paying both characters is **18 pieces on
   floor 1** where the old design paid 9. Stuff scarcity is this ticket's escalation dial, so the
   9 → 0 curve has to be recalibrated — probably **fewer Stuff rooms**, since each is now worth about
   twice as much. A [ticket 10](10-sim-the-resource-economy.md) number, but a large one: it moves the
   primary escalation mechanism, not a detail.
2. **It collides with the hand cap, and the collision is interesting rather than obviously bad.**
   `[finding]` Eighteen pieces into two five-card hands means both characters sit **permanently over
   the cap**, so under the same-day amendment to [ticket 04](04-deck-as-energy-and-hp-model.md) every
   minimum draw is Exhausted instead of drawn. Floor 1 would be played almost entirely off scavenged
   gear, with your own deck switched off. That may be exactly the intended feeling. But it switches
   off the **modifiers** — the permanent cards the whole deckbuilding inversion is about — on the
   floor where you hold the most Stuff, which is the wrong way round. Worth watching at
   [ticket 20](20-encounter-tabletop-prototype.md)'s table before tuning it.
3. **Two pools where there was one.** A Stuff **room** pool sized by this ticket's room policy, plus a
   Good Stuff pool sized by how much is handed out per floor — which item 1 just doubled. Exact counts
   are [ticket 12](12-exemplar-card-set.md)'s, as this ticket ruled for the other room pools.

#### Still open after this

- **Which stat, revisited.** `[you]` The earlier ruling — the gate accepts **either** stat — survives
  in substance, because a character can meet a Power line with Power Stuff they are holding regardless
  of which stat their own deck leans toward. What the split form adds is *whose* stats are counted,
  not which. But the exact wording of a line like `Power 1: Red takes 1` needs settling: it must mean
  **the Power on Red's own side of the play zone**, or the free-rider returns. Marked precise by the
  agent, not yet confirmed.
- **How low is low**, still a ticket 10 number, now with a second tier to price as well.
- **Blind draw from the Good Stuff pool** is new. It removes the old flip's known prize and makes the
  reward swingier. Unremarked on so far and not ruled.
