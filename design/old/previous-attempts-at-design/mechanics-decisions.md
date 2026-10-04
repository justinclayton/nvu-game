# North vs Up — Mechanics Decisions

Session date: **2026-08-12**

Companion to `north-vs-up-game-design-handoff.md` (fiction, goals, constraints) and
`prototype/NOTES.md` (simulation results). This doc records **what the core mechanics
actually are**, resolving the "cards as additional resources — TBD" item in the handoff.

Origin: a walkthrough of the Decipher *Star Wars* CCG (1995) Life Force system, then an
adaptation pass to single-player/co-op roguelite deckbuilding, then a structural pivot on
what a "floor" is.

Three sections, deliberately separated:

1. **Locked** — explicitly endorsed this session.
2. **On the table** — proposals raised but not yet ruled on.
3. **Open** — known unresolved questions, including one active disagreement.

---

## 0. Where this came from — the Decipher SWCCG source

Worth keeping, because the source system answers questions this design will keep re-asking.

Four piles. **Reserve Deck** (life force), **Force Pile** (activated energy), **Used Pile**
(spent — recycles to the bottom of the Reserve Deck each turn), **Lost Pile** (damage — gone).

The key structural fact, and the one that unblocks everything: **SWCCG already had a
recycling discard pile.** The Used Pile came back every turn. What made the deck "life"
wasn't that it ran out — it was that **exactly one pile never came back**. Life = total cards
still in circulation across all zones. Damage = permanent removal from that pool.

So shuffling a discard pile is *not* an obstacle to cards-as-life. Only the exile pile must
be one-way.

Other transferable pieces:
- **Drawing costs the same currency as playing.** A card taken into hand came out of the
  Force Pile — one card drawn is one Force not spent.
- **Damage source is a choice.** When you lose Force you pick where from: hand, energy pool,
  or blind off the top of your deck.
- **Healing is "retrieval"** — a distinct, premium effect that moves cards from Lost back to
  Reserve. Not a default, not free.

---

## 1. Locked

### 1.1 Combat damage = forced exile
Damage is not a number on a track. An attack forces the target to **exile cards** — moved to
a one-way casualties/lost pile, gone for the run.

Already present in the prototype engine as the "casualties pile" under `deck-is-life`.

### 1.2 Cards are the energy pool, and the player decides the split
The SWCCG activate step, transplanted:

> At the start of your turn, **activate** N cards from your deck, face-down, into an energy pool.
> At any point in your turn you may **convert** a face-down card into a card in hand, 1:1 — that conversion *is* your draw.
> Card costs are paid by moving face-down cards from the pool to the discard.

You no longer "draw 5." You get 5 units of undifferentiated stuff and decide, mid-turn, how
much is fuel and how much is options. Buy/play a 4-cost and you saw one new card this turn.
See four new cards and you did nothing with them.

Consequences:
- **Hand size is variable and player-chosen.** This is the novel part.
- Shuffling is irrelevant to the mechanic, because activation is face-down anyway.
- Every card in the deck has a floor value of 1 energy. **There are no dead cards.**

### 1.3 Deck size is the life total
HP is the card count. This is the load-bearing consolidation the handoff asks for
("cards should represent as many things as possible") — deck = library + energy + hit points
in one component.

### 1.4 The thinning rubber band is a feature, not a bug
As a player takes damage their deck thins, so they cycle faster and see their best cards more
often. The losing player gets *more consistent*.

**Accepted deliberately.** The stated reasoning: as long as healing is scarce and expensive,
the rubber band softens individual losses without letting games run forever. It is a
free anti-snowball; we are not going to engineer it away.

Corollary, treated as a hard constraint downstream: **healing must stay scarce and
expensive.** It is the single dial holding the rubber band in check. If healing gets cheap,
this design stalls out.

### 1.5 Junk
The curse/Wound analogue, named **Junk**.

The insight that makes it work in this system: STS-style curses bloat your deck with junk,
but in a design where deck size *is* HP, bloat would be healing. So Junk is defined by which
job it fails at:

> **Junk is fully functional as energy. It is dead weight in your hand.**

It fuels, it soaks a hit, it cannot be converted into anything useful. The pressure it
applies is **dilution, not damage** — your deck gets slower and sludgier while your HP looks
fine.

### 1.6 Junk is acquired emergently, through searching
**Rejected:** an automatic per-turn Junk tick as the floor's clock.

**Instead:** you pick up Junk as a byproduct of rummaging for things. Searching a room
yields loot *and* Junk. Same escalating-clutter pressure, but it's driven by player activity
rather than a linear timer — the greedier the search, the faster you sludge up. Emergent,
self-inflicted, and variable per run rather than a fixed curve.

This is a better version of the clock and should be treated as the primary pacing mechanism
for a floor. It also relocates the risk/reward from *per turn* to *per action* — greed is the
clock, and it scales itself to how much the player is trying to get away with.

One check it needs: a player who searches nothing accrues no Junk, so the clock has to be
unskippable by another route. The boss should be the enforcer — unbeatable with what you
walked in carrying, so searching is mandatory and only the *amount* is a choice. If that
doesn't hold, the floor has no clock at all for a cautious player.

### 1.7 The floor is one big madcap combat round
**This supersedes the Slay the Spire-style branching map pinned in
`north-vs-up-game-design-handoff.md` §5.** See §3.1 — it is a proposal to replace that
decision, not yet ratified.

Structure:

- A floor is a **floor plan** of connected rooms, not a directed branching path. **Players
  can double back.**
- Heroes scramble around collecting resources — new cards, consumables — while rooms may
  also contain monsters.
- Monsters attack you while you're in their room. **You can flee at whim.**
- Every turn is the same decision: **stand and fight, or run and cobble together a plan.**
- Rooms visited before may not contain what they did the first time (see §3.2 — the exact
  form of this is contested).
- Hazards are environmental and constant: stumbling over Junk, getting sprayed with poison
  goo. Cartoon manic energy is the target tone.
- There are places to heal.
- The floor ends by **beating the big baddie**, which gives bigger rewards and **heals you
  entirely** for the next floor.
- **Many more floors than STS**, therefore each floor is quicker and more self-contained.

Framing: a floor is not a sequence of encounters. It is **one continuous combat round in
which the map is the battlefield.**

---

## 2. On the table

Raised this session, not yet ruled on. Roughly in order of how load-bearing they are.

### 2.1 Damage to monsters persists across visits
Flee a fight and the monster is still wounded when you come back. This is the single rule
that makes "the floor is one combat round" literally true rather than evocative — you're not
resetting encounters, you're managing an ongoing brawl across a building.

Makes hit-and-run a legitimate tactic (chip the big thing in the east hall over five visits
between errands) and turns fleeing from a failure state into a tool.

Note this interacts with §3.2: if rooms fully re-randomize, wounded monsters can't persist.

### 2.2 The central decision of a floor: when to knock on the boss's door
Because the boss is just a room on the map and you can go early:

- **Early** — thin, sharp, fast deck, almost no Junk, but nothing collected.
- **Late** — good cards and consumables, but heavily Junked and cycling like a barge.

There is a sweet spot, it differs every floor based on what you found and where monsters
roamed, and it's discoverable but never solvable. Strong candidate for the core question of
a 5–8 minute floor.

Full-heal-on-boss-kill supports this: it's fine to arrive wrecked as long as you win.

### 2.3 Deck size vs. deck quality as the run's build axis
Deck size = HP. Deck quality = damage. Deck size also = cycle speed, inverted.

So every card reward is a real decision: take it for HP and armor at the cost of dilution and
slower cycling, or skip it to stay lethal and fast but one burst from dead. Glass cannon vs.
fortress becomes deck composition rather than a stat allocation.

Falls out for free: the thin deck is fragile *because* each exile deletes a higher percentage
of its good cards; the fat deck is slow *because* activation pulls from a bigger pool. One
fact causing both.

Also re-costs **card removal as self-harm** — trashing a card costs HP. The classic
"thin to 8 cards and win" line self-limits without needing a balance patch. This gives the
handoff's proposed **trading/bartering** mechanic (3 weak cards → 1 strong) real teeth: it
is now explicitly a life-for-power trade.

### 2.4 Movement economy
Don't charge cards for movement — "flee at whim" is the right promise. Cost it in opportunity
and consequence instead:

- Moving **is your action** — you don't move *and* search.
- **Parting shot**: the monster whose room you leave gets one free exile at you.
- **Some monsters follow.** Slow ones camp the good rooms; fast ones chase. Kiting works, but
  the chaser is now standing in the room you wanted, and you've picked up Junk doing laps.

### 2.5 Exile source is a choice
When hit, the defender picks where the exile comes from:

- **From hand or energy pool** — you know exactly what you're losing, and you eat the tempo hit now.
- **From the top of your deck** — blind, costs nothing this turn, might have been your best card.

Recurring, cheap to resolve, never obvious. Straight from SWCCG.

Top-of-deck damage is also self-balancing: the thinner and better your deck, the likelier any
blind hit deletes a bomb.

### 2.6 Enemy design vocabulary — vary *where* the exile comes from
One verb, many distinct threats, no new subsystems:

| Attack | What it threatens |
| --- | --- |
| Exile 2, you choose | Baseline. Costs a decision. |
| Exile from your hand | Tempo — hits the turn you planned. |
| Exile from the top of your deck | Blind; scales in nastiness as your deck improves. |
| Exile from your discard pile | Attacks recursion and next-shuffle quality. |
| Exile your highest-cost card in hand | Punishes holding bombs. |
| Exile 1 at the start of each of your turns | Bleed/poison. |
| Gain N Junk | Dilution instead of damage — the goo-spray attacks. |

Blocking is simply "prevent N exiles this turn."

### 2.7 Junk persists between floors; HP resets
Proposed answer to §3.3. Full heal returns your exiled cards, **but accumulated Junk carries
over.** The run-level story becomes *"I am slowly drowning in garbage"* rather than a
depleting HP bar.

Makes **card removal the premium reward of the entire game** — de-junking is the scarce
expensive thing, not healing (which also satisfies the §1.4 constraint). Gives a natural run
length without a hard floor count. Tonally: you don't die heroically, you get buried in clutter.

### 2.8 A hard floor on deck size as the loss condition
Deck-as-HP has a stall failure mode: a deck too small and mediocre to win a fight but not yet
dead, grinding out a decided run. The rubber band makes this *worse*, since thinning keeps
you locally functional right as you become globally hopeless.

Proposed fix: **if your pool would drop below the activation threshold, you lose.** With
activate = 5 and a floor around 10–12 cards, the spiral resolves cleanly, and the last few
cards of HP are visibly terrifying because the player can count exactly how many hits remain.

### 2.9 Miscellaneous
- **Floor size 6–10 rooms**, targeting 5–8 minutes. The concept dies if a floor takes 20.
- **Turn granularity**: one action per turn on a 10-room floor may feel deliberate rather than
  manic. Consider 2–3 actions per turn, or cheap movement / expensive interaction.
- **Consumables should live outside the deck**, or "exile on play" double-taxes them and
  nobody uses them.
- **Nastier Junk variant**: "When activated, exile itself and one other card."
- **The lost pile is a browsable graveyard** of the specific cards this run killed — a strong
  end-of-run emotional artifact, and free in a physical game.

---

## 3. Open questions

### 3.1 Does the floor-as-combat structure replace the pinned map decision?
`north-vs-up-game-design-handoff.md` §5 pins a Slay the Spire-style branching path with mixed
node types and a boss per floor, dated the same day. §1.7 above is a different structure —
non-linear floorplan, backtracking, continuous combat, many shorter floors.

They are not compatible. **The handoff needs updating or this needs downgrading to an
alternative.** Flagged, not decided.

Note that §1.7 is arguably a *better* answer to the handoff's own Option A vs. Option B
tension: exploration and combat stop being separate node types and become the same activity.

### 3.2 Fog of war vs. full map — active disagreement
**Position taken this session:** hide room contents; show only rooms and adjacency; reveal on
entry. Rationale: a top-down floorplan with complete information is a *puzzle*, and puzzles
are calm and deliberate — the opposite of the target tone. Also makes room-content drift
invisible, so it reads as "the building is chaotic" rather than "the game is cheating."

**Counter-position (Justin's, unresolved):** likes hiding contents, but is **not convinced a
full map can't still be madcap without feeling puzzle-y.**

This is genuinely open and worth prototyping both ways. The question to answer: what supplies
the frantic pressure if the player can see everything? Candidates: pursuing monsters (§2.4),
the Junk-from-searching clock (§1.6), or roaming monsters on a static loot map (below).

**Best argument for the full map** (i.e. the counter-position is probably right): mania comes
from **action scarcity, not information scarcity**. Overcooked shows you the entire kitchen
and is pure panic, because you can see four things that need doing and have time for one.
Being able to watch the disaster arrive and being unable to reach it is *more* stressful than
not knowing about it.

The caveat that decides it: that argument holds in real time, but this is turn-based with
unlimited think time, and full information plus deterministic outcomes plus unlimited think
time is the exact recipe for Into the Breach — a superb game, and a completely calm one. So
the thing that has to be hidden isn't **space**, it's **outcome**. Keep the map fully visible
but make the resolutions uncertain — you don't know what a search yields, and monster movement
is drawn/rolled rather than telegraphed — and a full map should stay frantic. Under that
framing the fog of war is unnecessary and Justin's instinct is correct.

Test to settle it: build the floor both ways and check whether players *stop and compute*.
If the full-map version produces long silent turns, it's a puzzle.

Related sub-question — the form of room re-randomization. Two variants that preserve
plannability better than total re-randomization:
- **Loot is static, monsters roam.** You learn where the good stuff is, so routing is a real
  skill, but the danger map changes constantly. Compatible with §2.1 (wounded monsters
  persist because monsters are objects, not room contents).
- **Room identity is stable, contents drift.** The armory is always the armory; what's in it
  changes. You can plan "get to the armory," not "I know what I'll get."

The risk with total re-randomization is that it reads as noise rather than chaos — if no plan
can survive, players stop making plans and disengage. Tension comes from plans that are
*threatened*.

### 3.3 What does the full heal restore?
- If it returns the lost pile, exile has no consequence past the floor and the run loses its
  through-line.
- If it doesn't, you refill with generic cards and deck quality erodes every floor — a long
  grind toward mush.

§2.7 proposes the third path (restore cards, keep Junk). Needs a decision.

### 3.4 Reconciling with the prototype's cost-model bake-off
`prototype/NOTES.md` recommends **`discard`** (pay N by discarding N other cards from hand) as
the leading cost model, at a 28-card deck.

The §1.2 activate/convert model is **a fourth model that was not tested.** It's a hybrid: draw
and cost are the same pool, which is closest to `bleed` in structure but pays from an
activated buffer rather than straight off the deck. Implications, all unmeasured:

- Finding 1 says each extra job the deck does costs ~+14 cards. Activate/convert has the deck
  doing life + cost + draw-rate simultaneously, so **expect a starting deck at the high end
  (~42, possibly more)**. That collides head-on with the handoff's low-complexity /
  few-components constraint, exactly as `bleed` did.
- Finding 2 says cards-as-cost is what makes deck-is-life actually bite. Activate/convert
  qualifies, so the tension should be there.
- Finding 5's small-numbers rule still applies: attacks 1–5, block 1–3, denominated in cards.
- Finding 6 wants a wider cost range (0–4) for tuning resolution.

**Action: run the bake-off again with activate/convert as a fourth model** before committing.
It is the mechanic this session actually fell in love with, and it's the one with no data.

### 3.5 Flee-at-will is a second escape hatch — does it break the same way recruit did?
Prototype Finding 4: recruiting dominates (68–80%) purely because it *ends the fight*, and
the end of a fight is where the damage is. **Fleeing is structurally the same escape hatch.**

Mitigations already proposed: parting shots, pursuing monsters, Junk accrued while doing laps,
and §2.1 persistence (fleeing doesn't reset a fight, so the damage you dealt isn't wasted —
which cuts the other way and makes fleeing *more* attractive, not less).

The handoff's existing fix for recruit — **bosses are unrecruitable** — has an obvious sibling
here: **you cannot flee the boss room** once engaged, or the boss pursues relentlessly. Needs
testing, not assertion.

### 3.6 Physical-capability
`tech-approach-notes.md` treats physical-capability as a hard engine constraint. Quick read on
this session's additions:

- Floor plan of rooms: **fine** — face-down room tiles laid out on the table.
- Fog of war: **fine** — tiles flip on entry.
- Activate face-down / convert to hand: **fine** — it's literally how SWCCG played.
- Junk from searching: **fine** — a Junk deck you draw from when you search.
- Monster damage persisting across visits: **needs a component** — a wound marker or damage
  dial per monster card. Small violation of "no extra components"; probably acceptable, but
  it's the one item here with a real cost.
- Roaming monsters: **fine** — move the monster card between tiles.

### 3.7 Untouched this session
2-player co-op on a floor plan (do both heroes move independently? split up?), narrative
gating, and how recruitment survives in a structure where you're constantly fleeing fights.
