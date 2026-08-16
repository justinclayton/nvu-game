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
  exist — deck-as-stamina and items-as-Retained-cards-in-hand are the pattern. The constraint is
  meant to force creative representation, so treat "we need somewhere to put this" as a design
  prompt rather than a shopping list.
- **Skills.** Every session invokes `/grilling` and `/domain-modeling`. Prototype tickets invoke
  `/prototype`. Research tickets are resolved by a `/research` subagent.
- **Glossary.** [`CONTEXT.md`](../../CONTEXT.md) exists at the repo root, created from ticket 04.
  It is a glossary only. Add a term the moment a ticket settles it, tagged with that ticket; never
  add a term still under argument.
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
- [Design the deck-as-energy-and-HP model](issues/04-deck-as-energy-and-hp-model.md) — `[you]` The
  hypothesis **survives in its pure form**. Your deck **is** your **stamina**; there is no energy
  number and the word "energy" is retired. Three zones, no discard pile: **deck**, **hand**, face-up
  **exhaust pile**. At the start of your turn you decide how many cards to **convert** from deck to
  hand — the core decision, since every card converted is stamina spent whether used or not. Playing
  an X-cost card **exhausts X cards from your hand**; damage **exhausts X cards from your deck**
  (chosen costs from hand, unchosen punishment from deck). **The whole hand exhausts at end of turn**,
  with **Retain** as the exception. Nothing returns during a floor; clearing a floor restores the
  exhaust pile. You are **exhausted** — down, not dead — when you begin a turn and cannot convert,
  which leaves you one **last stand** turn. **Stamina is per-character**, and solo is mechanically
  identical to co-op. **The deckbuilding inversion is the design**: a card you add is +1 floor-time
  and −1 consistency. **No structural anti-recursion rule** — declined deliberately, over the agent's
  recommendation, with the dissent recorded. Low-complexity adopted as a **strong preference**. Zero
  components; health is one visible stack; no shuffling during a floor. Two rulings made here belong
  to other tickets and are recorded on them: **a floor is one continuous encounter** on a 2D plan,
  ended by ascending (ticket 05), and **persistent effects live in your hand** via Retain, costing
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
  over-complicating itself, so tickets 19 and 07 must fit inside it. **Clearing a floor offers
  permanent card rewards**, Slay the Spire style, and `[proposed by agent → you approved]` **declining
  is always allowed**, which makes the player set their own deck size and gives thinning-by-omission
  for free. Removal is not ruled out but is never a default. **Escalation scales enemy difficulty**;
  floor size as a second axis waits on ticket 19. **Scavenged items go straight to hand with Retain
  and do not leave the floor** — so scavenging is never a healing verb — which forces a **hand size
  cap** onto ticket 07. **Nothing bad carries between floors except card-specific penalties**
  (placeholder keyword *Curse*, name provisional). **Red and Gray move independently within a floor.**
  Deliberately left open and routed to tickets 08 and 19: **whether damage to the floor's enemy
  persists when you break off** — it depends on how the enemy is physically tracked, and ticket 18 may
  not assume the dent-and-retreat loop exists until it lands. Surfaced here and promoted to the
  standing Notes: **minimise play zones**, a designer philosophy rather than a game rule.

- [Decide what creates the frantic, in-over-your-head pressure](issues/06-source-of-frantic-pressure.md)
  — `[you]` The pillar is carried by two things at once, and neither is enough alone.
  **You get poorer every turn**: ticket 04's drain, ratified rather than chosen
  again, but **widened so that most moves cost stamina in some form**, not just card play (a
  constraint on ticket 07, *Define the turn and action economy within a floor*). And **something
  acts on you every turn**, either the floor's enemy or a hazard, on the floors that use them. There
  is **no wall clock** of any kind; that was rejected outright. **"You cannot simply leave" is
  binding on ticket 08** (*Decide how enemies are represented and how they act*) as a requirement,
  free in implementation; pursuit is the obvious way, but 08 picks the mechanism. **Hazards are a
  tool, not a requirement** — how heavily to use them is a balance-time question, and the agent's
  recommendation to bind a weaker rule, that a floor's pressure must not come from the enemy alone,
  was declined with the dissent recorded. The pressure is **both diegetic and structural**, and the
  **pyramid tower** is what lets it be both at once: the tower narrows as it rises, so higher floors
  are tighter, with fewer rooms worth scavenging and less space to keep away from enemies —
  escalation you can see on the table instead of bigger numbers. That is a **strong candidate for
  ticket 19** (*Decide the floor's topology and physical representation*), **explicitly not
  binding**, and it is the leading proposal for the second axis of escalation that ticket 05 left
  open. The squeeze works through **space and supply, not rate**: fewer places to scavenge falls out
  of the geometry for free, and no rule makes a higher floor cost more per action. The pressure is
  allowed to **close and kill you**, but the honest failure is *"I spent badly," never "I was
  slow"*, with **revive as the safety valve** at a cost ticket 14 (*Design the down and revive
  rules*) sets. **Instruction overridden** `[you]`: the ticket demanded a one-line testable filter
  that tickets 07, 08, 09, and 11 could be checked against, and the human rejected every draft —
  **no tests; these get decided when we talk specifics** — so 06 hands down constraints argued case
  by case, not a formula. **Deferred:** whether you see the whole floor when you arrive, routed to
  tickets 18 and 19. 06 resolved before 18, so **18 inherits** the obligation to reconcile the two
  siblings.

## Not yet specified

<!-- In scope, but not sharp enough to ticket. Graduates into tickets as the frontier advances. -->

- **Floors that deviate from the one-enemy default** — every floor holds one enemy, and killing it
  grants passage. There is no separate boss encounter; the floor's enemy is the whole fight. The rule
  may be broken later, and what a deviation would look like is open, as is whether the tower's last
  floor is one. This stays fog until tickets 18, 19, and 08 establish what makes floors differ at all.
- **Roguelite meta-progression** — whether anything persists between runs at all, and whether it
  is even in scope for a core spec.
- **Death and run failure** — what happens when a run ends badly. Run *length* is settled (ten
  floors, 60–75 minutes) and the run-level arc is deckbuilding rather than wearing down, so what
  remains is only what failure costs and what, if anything, a failed run leaves behind. That last
  part may turn out to be meta-progression's question rather than this one's.
- **Room contents and item pickups** — the "find items" half of the pitch. May resolve entirely
  inside ticket 09; if it doesn't, it graduates. Searching a room can itself cost stamina, so
  scavenging is a push-your-luck decision rather than a free pickup. The *lifecycle* is settled: a
  pickup goes to hand with Retain and is gone on ascending. What remains open is what pickups
  actually *are* and how a floor decides what's in a room. Two named threads remain: whether a floor
  can hand you something that clutters rather than helps, and the later exception under which a
  *few* items might be carried onward. If the pyramid proposal is adopted, **rooms worth scavenging
  get scarcer the higher you climb**, which makes how generous a floor is an escalation dial in its
  own right.
- **What else costs stamina, beyond fighting** — **most moves cost stamina in some form**, so the
  question is not whether but **which**. What remains is the specific price list for movement,
  scavenging, and floor interactions, covering things like sprinting, tripping, falling, searching,
  and banging your head on a pipe. Ticket 07 owns the turn-level part; the rest depends on ticket
  19's floor plan.
- **Hazard design** — hazards are a second thing that can act on the player each turn, alongside the
  floor's enemy, and they are a **tool, not a requirement**; how heavily to use them is left to
  balance time. What a hazard actually *is* remains open: it might be a fixed feature of the floor,
  something that triggers, or something that acts on you every turn you stand near it. That cannot
  sharpen until tickets 18 (*Decide what choices a floor actually presents to the player*) and 19
  (*Decide the floor's topology and physical representation*) establish what a floor physically
  contains. It may resolve inside 18 or 19; if it doesn't, it graduates.
- **Fixed duo or roster** — whether Red and Gray are the only two characters or one pairing drawn
  from a larger cast. Pending ticket 13; a roster would expand content scope considerably.
- **Table footprint and component budget** — the physical constraints that will eventually bound
  card count and per-turn upkeep. The *floor layout's* share belongs to ticket 19, which produces
  the map's first hard footprint number; what remains here is everything else.
- **Whether "North vs Up" means anything mechanical**, or is purely a title.

## Out of scope

<!-- Ruled beyond the destination. Never graduates; returns only as a fresh effort. -->

- Full card list, enemy roster, and balance numbers — beyond the 8–12 exemplars in ticket 12.
- Art direction and visual design.
- Narrative and lore beyond the tower/alien premise.
- Production, manufacturing, and component sourcing.
- Any digital implementation of the game. (Throwaway simulators built to answer a design
  question are not this — those are prototypes and stay in scope.)
