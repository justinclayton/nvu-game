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
- **Minimise play zones** `[you, ticket 05]`. A designer philosophy, not a game rule. A new zone is a
  cost to be justified, never a free tool. Where a game would normally reach for another zone, a
  counter, or a track, look first for a way to express it with the cards and zones that already
  exist — deck-as-stamina and items-as-Held-cards-in-hand are the pattern. The constraint is
  meant to force creative representation, so treat "we need somewhere to put this" as a design
  prompt rather than a shopping list.
- **Skills.** Every session invokes `/grilling` and `/domain-modeling`. Prototype tickets invoke
  `/prototype`. Research tickets are resolved by a `/research` subagent.
- **Glossary.** [`CONTEXT.md`](../../CONTEXT.md) exists at the repo root, created from ticket 04.
  It is a glossary only. Add a term the moment a ticket settles it, tagged with that ticket; never
  add a term still under argument.
- **Previous attempts.** `previous-attempts-at-design/` is reference material, opened only when a
  ticket directs it. Its content and structure must not shape this map.
- **Abandoned ideas.** [`abandoned/`](abandoned/README.md) holds design that was ruled on and then
  dropped when the direction changed. **Nothing in it is current**, it is never linked from
  *Decisions so far*, and a session opens it only when a ticket names a file in it. It exists so that
  dropping an idea does not also drop the record of whose it was and why it went.

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
  **Researched twice, independently.** A second pass verified the rules against primary PDFs and
  corroborates every load-bearing point; both are preserved in the ticket. It adds that **spending is
  not damage** (spent cards recirculate face down; lost cards leave face up), that the loss condition
  is a *conjunction* of three empty piles rather than one empty deck, and that the cost of the system
  was procedural rather than strategic — deck size stops being a dial, and the scoring layer punishes
  spending your own resource. Five cross-edition rules conflicts and nine evidence gaps are recorded,
  not resolved.
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
  anyway); ~~strict alternating turns~~ — **superseded by ticket 21**, both characters now act
  simultaneously and collaboratively, either of them in any order, which makes *solo is mechanically
  identical to co-op* more true rather than less; and **down, not dead** — a character at zero
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
- [Design the deck-as-energy-and-HP model](issues/04-deck-as-energy-and-hp-model.md) — `[you]` The
  hypothesis **survives in its pure form**. Your deck **is** your **stamina**; there is no energy
  number and the word "energy" is retired. Three zones, no discard pile: **deck**, **hand**, face-up
  **exhaust pile**. At the start of your turn you decide how many cards to **draw** from deck to
  hand — the core decision, since every card drawn is stamina spent whether used or not. Playing
  an X-cost card **exhausts X cards from your hand**; damage **exhausts X cards from your deck**
  (chosen costs from hand, unchosen punishment from deck). **The whole hand exhausts at end of turn**,
  with **Hold** as the exception. Nothing returns during a floor; clearing a floor restores the
  exhaust pile. You are **exhausted** — down, not dead — when you begin a turn and cannot draw,
  which leaves you one **last stand** turn. **Stamina is per-character**, and solo is mechanically
  identical to co-op. **The deckbuilding inversion is the design**: a card you add is +1 floor-time
  and −1 consistency. **No structural anti-recursion rule** — declined deliberately, over the agent's
  recommendation, with the dissent recorded. Low-complexity adopted as a **strong preference**. Zero
  components; health is one visible stack; no shuffling during a floor. Two rulings made here belong
  to other tickets and are recorded on them: **a floor is one continuous encounter** on a 2D plan,
  ended by ascending (ticket 05), and **persistent effects live in your hand** via Hold, costing
  hand space and always temptingly burnable as fuel (ticket 11).
- [Explore damage-as-thinning as a built-in rubber band](issues/15-damage-as-thinning-rubber-band.md)
  — `[you]` **Resolved against the hypothesis**, deliberately, by ticket 04. The player does *not*
  choose which cards damage takes: it comes off the top of the deck, face up. The cull costs a
  decision on every hit in a game built on frequent hits, and its payoff largely evaporated once the
  deck stopped recycling. The information it was reaching for arrives instead from the face-up
  exhaust pile. "Bracing" survives as an unadopted candidate. **Ticket 16 ran concurrently and was
  not available to that session; read afterwards it independently supports the resolution** — in
  Undaunted, a published guide recommends baiting casualties as free deck-thinning, which is this
  hypothesis working *too* well in the wild.

- [Define the run and floor structure](issues/05-run-and-floor-structure.md) — `[you]` **One enemy per
  floor, and killing it grants passage** — the diegetic reason varies for flavour, the structure
  doesn't. "Boss" and "room enemy" collapse into one thing: a floor *is* a monster plus a map you run
  around on. Stated as a default with design space left to deviate. **Ten floors, fixed**, at a hard
  budget of **5–7 minutes each** (~60–75 minute run) — adopted explicitly to stop the design
  over-complicating itself, so tickets 22 and 07 must fit inside it. **Clearing a floor offers
  permanent card rewards**, Slay the Spire style, and `[proposed by agent → you approved]` **declining
  is always allowed**, which makes the player set their own deck size and gives thinning-by-omission
  for free. Removal is not ruled out but is never a default. **Escalation scales enemy difficulty**;
  a second axis is open and waits on ticket 22. **Nothing bad carries between floors** — the
  card-specific exception, placeholder keyword *Curse*, was **retired by ticket 09**, so the default
  is now absolute. Surfaced here and
  promoted to the standing Notes: **minimise play zones**, a designer philosophy rather than a game
  rule. **Four of this ticket's rulings were superseded by ticket 18's floor-deck model** — the 2D
  floor plan, scavenged items, Red and Gray moving independently, and the open question of whether
  damage to the enemy persists across a break-off. See the ticket's *Superseded in part* section.

- [Decide what creates the frantic, in-over-your-head pressure](issues/06-source-of-frantic-pressure.md)
  — `[you]` The pillar is carried by two things at once, and neither is enough alone.
  **You get poorer every turn**: ticket 04's drain, ratified rather than chosen
  again, but **widened so that most moves cost stamina in some form**, not just card play (a
  constraint on ticket 07, *Define the turn and action economy within a floor*). And **something
  acts on you every turn** — now carried structurally by the floor card flipped at the start of each
  turn. There
  is **no wall clock** of any kind; that was rejected outright. **"You cannot simply leave"** was a
  requirement laid on ticket 08 and is **now satisfied by the encounter's shape**: the floor deck must
  be beaten to advance and a card you failed against is shuffled back in. **Hazards are a
  tool, not a requirement** — how heavily to use them is a balance-time question, and the agent's
  recommendation to bind a weaker rule, that a floor's pressure must not come from the enemy alone,
  was declined with the dissent recorded. The pressure is **both diegetic and structural**. **The
  pyramid tower was abandoned with the spatial floor**, so the second axis of escalation ticket 05
  left open is open again and sits with ticket 22. What survives of that thread is the negative half:
  **no rule makes a higher floor cost more per action.** The pressure is
  allowed to **close and kill you**, but the honest failure is *"I spent badly," never "I was
  slow"*, with **revive as the safety valve** at a cost ticket 14 (*Design the down and revive
  rules*) sets. **Instruction overridden** `[you]`: the ticket demanded a one-line testable filter
  that tickets 07, 08, 09, and 11 could be checked against, and the human rejected every draft —
  **no tests; these get decided when we talk specifics** — so 06 hands down constraints argued case
  by case, not a formula. **Whether you see the whole floor when you arrive** was deferred here and
  has since been answered by ticket 18: you see one card, one turn ahead.

- [Decide what a floor encounter is and what it presents to the player](issues/18-floor-encounter-decisions.md)
  — `[you]` **A floor encounter is a deck of cards the players play against**, and beating the deck is
  what grants passage to the next floor. The deck is shuffled at the start of the encounter. At the
  **start of each turn** a **floor card** is flipped face up, telling the players what they face
  before they spend anything; they then take their draw phase and try to **defeat** it. Defeat it and
  it is **exhausted** from the floor deck and may pay a **reward**; fail and the players take a
  **negative consequence** and it goes to the floor deck's **discard pile**, which is **shuffled back
  in when the draw pile runs out**. That failure branch is the point — being outmatched, backing off,
  and meeting the same thing again later is the **scrambling and fleeing** the frantic pillar wants,
  and it falls out of the deck's structure instead of needing a chase rule. **This replaced the
  floor-as-2D-plan model wholesale**: no rooms, no movement, no routing, no scavenging, and Red and
  Gray no longer move independently because there is nowhere to move. Ticket 06's *"you cannot simply
  leave"* is now satisfied structurally, and its deferred *do you see the whole floor on arrival* is
  answered — you see one card, one turn ahead. **The pyramid tower went with the spatial floor**, so
  ticket 05's second axis of escalation is open again. What defeating a card takes, what failing
  costs, and what a floor deck holds are deliberately **not** decided here — they are tickets 21 and
  22. The abandoned spatial model is preserved in
  [`abandoned/`](abandoned/spatial-floor-model.md).

- [Decide how enemies are represented and how they act](issues/08-enemy-representation-and-behaviour.md)
  — `[you]` **Closed without a session, absorbed rather than answered.** The floor-deck model settled
  representation, arrival, and persistence outright — an enemy is a card in the floor deck, it arrives
  on the flip, and a card that beat you returns through the reshuffle rather than following you
  anywhere. Everything still open moved: **behaviour** and both **damage** questions to ticket 21,
  **escalation axes** and **whether a floor deck is one monster or many** to ticket 22. Ticket 06's
  **"you cannot simply leave"** is discharged by the encounter's shape, so **no pursuit rule is
  owed**. Nothing was decided and nothing dropped.

- [Decide what defeating a floor card takes, and what failing it costs](issues/21-defeating-a-floor-card.md)
  — `[you]` **A floor deck is a deck of rooms** — rooms came back, not as geography but as cards met
  in the shuffle's order. Three kinds at level 1: **combat** (`Power X`), **hazard** (`Scramble X`),
  and **item rooms**, whose card is the room in the room zone and the item once it is in hand. A room
  prints a **named threshold** rather than a bare number, so the question at each flip is *do we have
  the right thing*, not *do we have enough*. **Cost and stats are separate, unrelated numbers**:
  playing a card Exhausts cards from hand equal to its cost, then puts it face up in the **play zone**
  where its stats join a **shared pool** across both characters — which is what leaves room for stats
  that are not simple numbers, and that is where build synergy comes from. Most cards carry one stat.
  The threshold is **checked continuously**, excess evaporates, and rooms are **all-or-nothing** with
  no memory — the reshuffle carries the chip-it-down feel instead of a damage track. Failure is
  **printed per room**, normally *"1 character Exhausts X from deck"* with the **team choosing who
  absorbs the whole amount**; **declining is failing without trying**, and you can bail mid-draw.
  **Item rooms are the only reward**, pay into a chosen character's hand with `Hold`, and carry **no
  punishment** — the deck's one always-safe decline. **An item never enters the deck**, ruled
  deliberately: the deck is stamina, so that would be the game's only heal and exactly the recursion
  that broke four games in tickets 01 and 16. **Rooms have no behaviour beyond the flip.** New
  vocabulary: **Cleared** (out of the floor deck for good; all rooms Cleared ends the encounter),
  **Fled** (the discard that shuffles back), plus two renames of ticket 04's keywords — **`Convert` →
  `Draw`** and **`Retain` → `Hold`**. Settled here but owned elsewhere: **the turn's five phases**
  (ticket 07) and **the end of strict alternating turns** (ticket 03) — both characters now act
  simultaneously, either in any order. **Two findings logged rather than fixed:** the play phase is
  near-pure execution because cleanup exhausts the hand anyway, accepted knowingly with `Hold` as its
  saving grace; and quarterbacking is a real co-op risk under open information. Both go to ticket 20.

- [Decide what is in a floor deck, and how it escalates](issues/22-floor-deck-composition.md) —
  `[you]` **The win condition changed underneath this ticket.** A floor deck now holds exactly one
  **combat room**, and clearing it ends the floor — not exhausting the whole deck, as ticket 18
  first stated (see that ticket's *Superseded in part* note). Composition is fixed in shape and
  variable in generosity: **1 combat, 3 hazard flat every floor, and item count falling from 9 at
  floor 1 to 0 at floor 10** — the pyramid ticket 05 lost when the spatial tower died, recovered
  here through room count rather than topology. Escalation is **resource scarcity, not a harder
  fight**; the combat room's `Power` requirement is deliberately left untuned pending ticket 11's
  card anatomy and ticket 12's exemplars. Floor decks are assembled at setup from **three shared
  pools** rather than ten bespoke printed decks, sized so repeats are *uncommon* within a single run
  rather than eliminated — full non-repetition would be 85 unique cards, against ticket 02's
  low-complexity constraint. **Amends [ticket 21](issues/21-defeating-a-floor-card.md)**: item rooms
  lost their challenge (the item is now guaranteed on the flip), hazard rooms gained a second,
  higher threshold paying a permanent card reward mid-floor, and every combat room now carries a
  punishment framed on the card as its **Flee cost**. **Handed down, not decided, for tickets 11 and
  13**: floor rooms, not player cards, may be the primary stat source, with starter decks doing
  effects instead.

- [Design the card acquisition and deckbuilding model](issues/09-card-acquisition-and-deckbuilding.md)
  — `[you]` Most of this ticket was already settled upstream; what it actually decided is small, and
  what it *discovered* is not. **Permanent card rewards are per-character**: Red chooses one of three
  from a Red reward pool, Gray one of three from a Gray pool, because a character can only build
  toward something if the cards they are offered are theirs. That commits the design to **card-level
  Red/Gray asymmetry**, so ticket 13 now owns only *how* they differ, not *whether*. Pools are
  **flat** — no rarity tiers, no escalation by floor — since ticket 22 already put escalation on one
  dial and a second would reopen it. The ascend reward goes **into the deck** before the shuffle; the
  mid-floor reward ticket 22 created is a **reveal, not a shop** — top card face up, take it or skip
  it, onto the **top of the deck**, with which character reveals **printed on the hazard card**. That
  mid-floor card **is +1 stamina immediately**, which is the first mechanic judged under ticket 04's
  *no guard rail, balance per-mechanic* ruling; it is **accepted**, because the source is finite and
  every use permanently worsens the deck it heals. **No voluntary thinning**, deliberately: declining
  already thins for free, a trash pile is a new zone, and under deck-as-stamina removal is
  *self-damage that makes you better* — the exact Undaunted failure ticket 16 found in the wild.
  Starting decks are **per character and allowed to differ**; **12–15 cards is provisional and owned
  by ticket 10**, and there is **no ceiling**. **Deck growth is left uncapped on purpose** — the
  inversion is supposed to govern it, which is a claim nothing has tested, so ticket 10 is **charged
  with proving it** against the arithmetic that a run could add forty cards to a fifteen-card deck.
  **The discovery: the design needed a word for a bad card, and finding it reorganised items.** A bad
  card cannot go in your deck, because the deck is stamina — junk in the deck is a punishment that
  heals you. So **`Item` is renamed `Stuff`** — tools, junk, and slime under one plain word — and
  **Stuff splits by where it came from**: **Good Stuff** lives in the floor deck and is what an Item
  room hands you, so an Item room is never a disappointment; **Bad Stuff** lives in a pool *outside*
  the floor deck and arrives only as a room's printed punishment. Bad Stuff behaves like any other
  Stuff — `Hold`, playable, ordinary fuel — and differs only in contributing **no stats**, so it is an
  effective cut to your hand size that you must pay to undo. **There is no keyword for it**; it is a
  design concept, and per-card text does the rest. **`Curse` is retired** and its naming debt
  discharged by deletion: nothing bad crosses a floor boundary. **Amends tickets 21 and 22** with the
  rename and the two-pool split, and hands ticket 07 a recommendation of **max hand size 5** — which
  07 owns, because a rule with that reach should not be set as a side-effect of designing junk.

- [Define the turn and action economy within a floor](issues/07-turn-and-action-economy.md) — `[you]`
  Tickets 04, 18, 21 and 09 had already eaten most of this ticket, so what it decided is the
  turn's remaining edges — and one of them reopened an upstream rule. **Maximum hand size is 5, and
  `Hold` cards count against it**, which is the only thing that ever gives `Hold` a price; it is a
  **draw-phase limit only**, so Stuff shoves you above the cap and locks your draw rather than
  fizzling. **A floor begins with empty hands.** **No action currency** — cost is the only one.
  **Interrupts dissolve**: both characters already act simultaneously against a room that has no
  behaviour, so there is no window outside the turn to react in. **The turn belongs to the floor,
  not to a character** — one flip, one draw, one play, one cleanup, both characters throughout, no
  turn order and no lead, which closes the last of what ticket 03 left open. A **down** character is
  skipped entirely and **every punishment falls on the survivor** — an explicit death spiral, with
  ticket 14 as the valve; `[you]` **ascending heals a down character to full**, so 14 now owns only
  *mid-floor* revival. The **play zone splits by character** into one shared stat pool so cleanup
  never has to sort, and `[you]` Red's and Gray's own cards are visually distinguished besides,
  because **neutral cards** cannot be sorted by sight at all. **Ticket 06's principle has collapsed
  into ticket 04's drain** — the moves it was written against died with the spatial floor, no price
  list was invented to rescue it, and what survives is a relocation: the forced minimum draw charges
  the drain **against turns, not actions**. **The upstream reopening: ticket 17's "once per character
  per floor" was an agent assumption**, and last stand is now **once per turn with a 2-card exit
  cost** — which answers 17's own warning that surviving *rewards* emptying your deck, since each
  trip nets −2 permanently and the exploit becomes a loop converging on death. `[you]` **Ticket 21's
  "Stuff never enters a deck" was overstated** — a deck is not Stuff's entry *route*, but a last
  stand shuffles played Stuff back like anything else; logged as a known heal, not reopened.
  **Upkeep counted honestly:** zero counters, zero trackers, zero mid-floor shuffling — but **14
  table locations**, accepted `[you]` and handed to the footprint fog as its first real number.

## Not yet specified

<!-- In scope, but not sharp enough to ticket. Graduates into tickets as the frontier advances. -->

- **Floors that deviate from the default** — every floor is a deck to be beaten, and beating it grants
  passage. The rule may be broken later, and what a deviation would look like is open, as is whether
  the tower's last floor is one. This stays fog until tickets 21, 22, and 08 establish what makes
  floor decks differ at all.
- **Roguelite meta-progression** — whether anything persists between runs at all, and whether it
  is even in scope for a core spec.
- **Death and run failure** — what happens when a run ends badly. A run is ten floors and 60–75
  minutes, and the run-level arc is deckbuilding rather than wearing down, so what
  remains is only what failure costs and what, if anything, a failed run leaves behind. That last
  part may turn out to be meta-progression's question rather than this one's.
- **Fixed duo or roster** — whether Red and Gray are the only two characters or one pairing drawn
  from a larger cast. Pending ticket 13. A roster is now considerably more expensive than it was:
  ticket 09 gave each character their own reward pool, so every additional character is a whole pool
  of printed cards rather than a different starting deck.
- **Table footprint and component budget** — the physical constraints that will eventually bound
  card count and per-turn upkeep. The *floor decks'* share belongs to ticket 22, which produces the
  map's first hard component number; what remains here is everything else. Ticket 07 counted the
  table at **14 locations** and the human accepted it, so this is no longer about whether the layout
  is affordable — it is about the card *count* those locations will hold.
- **Whether "North vs Up" means anything mechanical**, or is purely a title.

## Out of scope

<!-- Ruled beyond the destination. Never graduates; returns only as a fresh effort. -->

- Full card list, enemy roster, and balance numbers — beyond the 8–12 exemplars in ticket 12.
- Art direction and visual design.
- Narrative and lore beyond the tower/alien premise.
- Production, manufacturing, and component sourcing.
- Any digital implementation of the game. (Throwaway simulators built to answer a design
  question are not this — those are prototypes and stay in scope.)
