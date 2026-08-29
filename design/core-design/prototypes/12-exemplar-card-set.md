# Exemplar card set — ticket 12

Built 2026-08-25 for [ticket 12](../issues/12-exemplar-card-set.md). **Everything on this page is
`[proposed by agent → awaiting your ruling]`.** No card here is adopted. The map's standing rule is
that the agent surfaces options and the human rules; this file is the option.

Printable version for cutting: [`prototype/12-exemplar-cards.html`](../../../prototype/12-exemplar-cards.html).
One-page rules summary: [`12-floor-rules-summary.md`](12-floor-rules-summary.md).
The rest of the cards, as they accumulate: [`12-card-bank.md`](12-card-bank.md).

**Every number is a placeholder.** Ticket 22 left the Enemy room's `Power` untuned and ticket 09 left
starting deck size to ticket 10. Costs, stats and thresholds here exist so the cards can be *read*,
not because they are balanced. Ticket 10 owns all of them.

---

## The player cards

Format, per ticket 11: **Name** · type line · `Cost N` · **Stat** · effect text · `Hold` where
printed · rarity. Rarity tracks a card's **value** — its ceiling — and complexity rides along,
because a complex card has to pay for its complexity in value.

### Red — starters (`Fine`, near-pure stats)

**Shove** · Red · `Cost 0` · **Power 1**

**Charge In** · Red · `Cost 1` · **Power 3**

### Gray — starters (`Fine`, near-pure stats)

**Duck Under** · Gray · `Cost 0` · **Scramble 1**

**Pick The Lock** · Gray · `Cost 1` · **Scramble 3**

> Four cards, no text between them. This is the floor-1 crutch ticket 11 asked for: a new player can
> play a whole first floor without reading a sentence. `Charge In` and `Pick The Lock` are where cost
> is taught — you burn one card out of your hand to get the bigger number.

### Catch Your Breath · Gray · `Fine` · `Cost 0` · *(no stat)*

> *Look at the top 2 cards of your deck. Put them back in either order.*

**Stresses: energy use.** No stat, no board impact, and free. Most turns this card is a body you
Exhaust to pay for something else — the clearest case in the set of a card whose value as fuel beats
its value as an effect.

**Fixed 2026-08-25.** It previously read *"Exhaust one and put the other back"*, which cost a card of
stamina to filter and made it **strictly worse than the starter it would replace** — Duck Under is
also `Cost 0` and at least gives `Scramble 1`. Free look-at-two is worth real money in a game with one
pass through the deck, and it no longer charges health for the privilege.

### Reckless · Red · `Cool` · `Cost 0` · **Power 5**

> *At cleanup, Red Exhausts 3 from deck.*

**Stresses: health loss.** Five Power for free, and the bill arrives after the room is resolved.

**The bug here was fixed by the Down ruling, not by the card.** At an empty deck *"Exhaust 3 from
deck"* used to exhaust nothing, so the game's biggest burst card became free exactly in last stand —
the drawback was null when it mattered most. Under the ruling of 2026-08-25, something that **would
Exhaust from an empty deck puts that character Down**. Reckless is now the most dangerous card in the
set to hold at low deck, which is the correct shape for it.

**Rarity stays `Cool`, for the opposite reason it originally had.** Under the complexity-only rule this
briefly dropped to `Fine` — one clause, six words of trigger. Under the **value ruling of 2026-08-25**
it goes back to `Cool`: `Power 5` for free is more than Red's entire starting hand can assemble, and
that is what the border is now measuring. It is *brutal*, not *complex*, and that is now allowed.

### Second Wind · Red · `Cool` · `Cost 1` · *(no stat)*

> *Shuffle 3 cards from Red's exhaust pile into Red's deck.*

**Stresses: a card that hurts to lose.** Ticket 04 ruled healing exists, is exceptional, and recovers
from the exhaust pile — this is that card, and it is the one card in the set you genuinely mourn when
a Flee cost takes it off the top of your deck unseen.

**Flagged for ruling.** This is the recursion shape tickets 01 and 16 found breaking four published
games, and ticket 04 declined a structural guard rail on the position that per-mechanic balance would
handle it. This card is the first mechanic that ruling has to actually cover. It also breaks ticket
04's *no shuffling during a floor* — either the card says "put on top of your deck" instead, or the
no-shuffle rule gains its first exception. **The set prints the shuffle version deliberately, so the
question is unavoidable rather than quietly designed around.**

### In Step · Gray · `Cool` · `Cost 1` · *(conditional stat, in text)*

> *Power equal to twice the number of cards Red has played into the play zone this turn.*

**Doubled 2026-08-25** `[proposed by agent → you approved]`, as a direct consequence of the
value ruling. At single value this card paid **Power 2–3 for two of Gray's cards** — a conditional,
cross-character read that never repaid the attention it demanded, which is exactly what the new rule
forbids: *a complex card should pay for its complexity in potential value when the synergy comes
together.* Under the old complexity-only axis the honest response would have been to demote it to
`Fine`; under the value axis the honest response is to make it worth its tier. Doubling is the shape
ticket 21 itself used when it named this pattern — *"Power equal to twice the number of cards Gray
plays this turn."* The alternative — drop it to `Fine` and accept it as a minor card — was put and
**declined**.

**Wording fixed 2026-08-25.** It read *"the number of cards Red played this turn"*, which a new player
reads as including the cards Red **Exhausted to pay costs** — a materially different and much larger
number. *Played into the play zone* is unambiguous and costs four words. The separate question of
*when* the value is read is a rules answer, not a card fix, and is now printed in the rules summary:
**a conditional stat is recalculated every time the pool is read, and nothing locks on play.**

**Stresses: effect.** Ticket 21 named this exact shape as where build synergy is meant to live, and it
is the cheapest demonstration that the shared stat pool is worth having: it is a Gray card that only
works because Red is at the table. Solo, it is the same card — which is ticket 03's claim made
concrete.

### One Man's Junk · Gray · `Woah` · `Cost 0` · *(conditional stat, in text)*

> *If any Bad Stuff is played this turn, Power 2 and Scramble 2.*

**Replaced `Scrap Sense` on 2026-08-29** `[you]`, as part of clearing the keyword out of card names.
This is a different card, not a rename: `Scrap Sense` was a `Cost 1` `Hold` modifier that boosted the
first Good Stuff Gray played each turn and Exhausted itself if Gray held none at cleanup.

**What it does now.** It pays four stats across both kinds for nothing, on one condition: somebody has
to play Bad Stuff this turn. That turns the junk rooms hand out as punishment into the trigger for a
free swing, and it is the first card in the set that makes Bad Stuff something a player might *want*
to hold onto for a moment.

`[finding]` **Its rarity was not re-ruled.** It carries `Woah` from the card it replaced, and the new
card is far simpler — one conditional clause, `Cost 0`, a ceiling of four stats. Under the value axis
adopted on 2026-08-25 that looks like a lower tier, but re-tiering is not the agent's call.

`[finding]` **`Hold` and the no-stat field are gone**, read from the text supplied rather than ruled
explicitly: the new wording is a play effect with a conditional stat, the shape `In Step` uses, so
there is nothing to hold and nothing to trigger at cleanup.

### Both Barrels · Red · `Woah` · `Cost 2` · **Power 2**

> *If Gray has played at least one card this turn, Power 5 instead.*
> *If this Clears a room, return this to Red's hand instead of Exhausting it.*

**A second `Woah`, so the two reward pools read as different pools.** Three clauses and a printed
stat that its own text overrides — the hardest single read in the set, and included precisely so
someone can time it.

**Fixed 2026-08-25.** The return clause used to say *"if this Clears an **Enemy** room"* — and
clearing the Enemy room is what ends the floor, so the clause could only ever fire on the last turn of
a floor, returning the card to a zone that ascending never collects. **The upside on a `Woah` card
deleted it from the deck.** It now triggers on clearing *any* room, so it is a card that keeps coming
back through a floor's hazards. Note this does not close the underlying hole: **what happens to cards
in hand when a floor ends is still unruled**, and it is listed in the rules summary as such.

---

## Good Stuff

Type line `Good Stuff`, always `Hold`, carries rarity, carries the bulk of the raw stats.

**Pry Bar** · Good Stuff · `Fine` · `Cost 0` · **Power 3** · `Hold`

**Coil of Cable** · Good Stuff · `Fine` · `Cost 0` · **Scramble 3** · `Hold`

**Cutting Torch** · Good Stuff · `Cool` · `Cost 1` · **Power 5** · `Hold`

**Grav Harness** · Good Stuff · `Woah` · `Cost 1` · **Power 3, Scramble 3** · `Hold`
> *When you play this, one character may draw 1 card, ignoring the hand cap.*

> Four pieces, and the numbers dwarf everything in the player decks. That is the point: `Cutting
> Torch` alone is more Power than Red's entire starting hand can assemble. It also shows the cost of
> the arrangement — a `Cost 1` piece of Stuff means you burn a card out of a five-card hand just to
> put your stat base on the table.

**These four are the clearest demonstration of the value ruling, and they are what prompted it.**
Under a complexity-only axis `Cutting Torch` has no text at all, so it could not be anything but
`Fine` — the single strongest raw number in the set wearing the same border as `Shove`. That is the
result the human looked at and reversed the axis over. On value the four sort cleanly by **ceiling**:
`Pry Bar` and `Coil` are the baseline 3, `Cutting Torch` is the biggest single number in the game at
`Power 5`, and `Grav Harness` is six stats across two kinds plus a card that refunds its own fuel.

**Note this contradicts efficiency, deliberately.** Per card spent, `Pry Bar` is *better* than
`Cutting Torch` — 3 stats for one card against 5 for two. Rarity tracks the **ceiling**, not the rate,
because a five-card hand cap means one big number clears thresholds that two good ones cannot reach.

## Bad Stuff

No stat field. Type line says `Bad Stuff` outright. `Hold`, playable, ordinary fuel unless the text
says otherwise.

**Faceful of Slime** · Bad Stuff · `Cost 0` · `Hold`
> *While you hold this, you may not draw more than 1 card during your draw phase.*
> *Play this to be rid of it.*

**Torn Seal** · Bad Stuff · `Cost 2` · `Hold`
> *This may not be Exhausted to pay a cost.*
> *Play this to be rid of it.*

> `Faceful of Slime` bites exactly where the game's tension is — ticket 04 made *how many to draw* the
> central decision, and this card takes it away. `Torn Seal` is the per-card restriction ticket 09
> authorised: junk that cannot even be burned, at a price to shed it.

---

## Room cards

Format, per ticket 11: **name**, type line, one or more `threshold: outcome` lines, the **Flee line**.

```
    Sump Crawler                                     Enemy
    [art]
    Power 5: Clear
    Flee: 1 character Exhausts 2 from deck
```

```
    The Thing In The Stairwell                       Enemy
    [art]
    Power 9: Clear
    Power 12: Clear — one character reveals reward.
              You may add it to the top of your deck or skip it.
    Flee: both characters Exhaust 3 from deck
```

> **The floor deck's hardest card**, and the set's probe of the question ticket 11 left open and
> handed to ticket 22: *may an Enemy room carry a reward tier?* Printed here so it can be read rather
> than argued. It costs the anatomy nothing — a room was already a list of threshold lines — and the
> `both characters` Flee line is ticket 21's wide-area minority case.
>
> Note the shape it creates: the tier only pays out if you *overkill* the floor's win condition, on
> the one card in the deck you are least able to overkill. Whether that is a good decision or a dead
> line is exactly what putting it on a table would tell you.

```
    Collapsed Stair                                  Hazard
    [art]
    Scramble 2: Clear
    Scramble 5: Clear — one character reveals reward.
                You may add it to the top of your deck or skip it.
    Flee: 1 character Exhausts 3 from deck
```

> **Flee cost raised from 1 to 3, 2026-08-25.** At 1 the room was **strictly dominated by fleeing**:
> clearing the low tier costs two cards of hand, fleeing cost one card of deck, and both outcomes give
> you nothing — the room goes away either way. The low threshold was dead text.
>
> **The general rule this exposes, which belongs to ticket 22:** a room whose low tier pays no reward
> is only worth engaging if its **Flee line costs more than the cheapest way to clear it**. Otherwise
> the correct play is always to walk, and the threshold is decoration. `Ruptured Coolant Line` below
> passes that test as printed and is the template.

```
    Ruptured Coolant Line                            Hazard
    [art]
    Scramble 4: Clear
    Scramble 7: Clear — one character reveals reward.
                You may add it to the top of your deck or skip it.
    Flee: both characters Exhaust 1 from deck,
          and 1 character takes a Bad Stuff
```

> Two hazards at different heights, both printing ticket 09's standard reveal line unchanged.
> `Ruptured Coolant Line` is where Bad Stuff enters play — ticket 21's ruling that a punishment may
> hand out Bad Stuff instead of stamina, here doing *both*.

### Stuff rooms

Added 2026-08-25, on ticket 22's ruling that **a Stuff room is its own card** and Good Stuff moved to a
face-down side pool. The room and the item are two different objects, so the four Good Stuff cards
above are pool contents and these four are the rooms.

The challenge is **split per character**, and each line is read against **that character's own side of
the play zone** — never the shared pool. You pay for your own item and never for your partner's. There
is no Flee line and no punishment: the room is **Cleared either way**, and meeting nothing simply means
leaving with nothing.

**Every number on these four cards is a placeholder.** How low the gate sits, and what the second tier
asks and pays, are [ticket 10](../issues/10-sim-the-resource-economy.md) numbers and are not decided.
They are printed here so the cards can be cut and read. The
[encounter simulator](../../../prototype/encounter-sim.html) exposes all four as controls.

```
    Sorting Room                                     Stuff
    [art]
    Power 1:     Red takes 1 Good Stuff.
    Scramble 1:  Gray takes 1 Good Stuff.
```

```
    Ration Locker                                    Stuff
    [art]
    Power 1:     Red takes 1 Good Stuff.
    Scramble 1:  Gray takes 1 Good Stuff.
    Power 3:     Red takes 2 instead.
    Scramble 3:  Gray takes 2 instead.
```

```
    Tool Cage                                        Stuff
    [art]
    Scramble 1:  Red takes 1 Good Stuff.
    Power 1:     Gray takes 1 Good Stuff.
```

```
    Spill of Cargo                                   Stuff
    [art]
    Scramble 1:  Red takes 1 Good Stuff.
    Power 3:     Gray takes 1 Good Stuff.
    Scramble 3:  Red takes 2 instead.
    Power 3:     Gray takes 2 instead.
```

> **Two of the four ask each character for the stat they do not produce.** `Tool Cage` and `Spill of
> Cargo` point Red at `Scramble` and Gray at `Power`, which the starting decks cannot make — so those
> rooms can only be met with Stuff you are already holding, or not at all. That is deliberate here, to
> put ticket 22's still-open *which stat* question on a physical card where it can be argued about.
> It is not a proposal that half the pool should work that way.

> **What the second tier costs.** `Ration Locker` and `Spill of Cargo` print one. The tier is where the
> Stuff room stops being "take the thing" and becomes a real spend, and it is also the clearest thing
> the simulator has no answer for: at threshold 3 against a five-card hand, leaning in usually costs
> more stamina than the extra item is worth. A number, not a shape, and it is ticket 10's.

---

## The pools

Ticket 12 owes the exact counts ticket 22 and ticket 09 both deferred here. These follow from their
stated policies; the last one does not come out well.

| Pool | Draws per run | Policy | Count |
|---|---|---|---|
| Enemy rooms | 10 | one per floor, each floor a different monster (t22) | **10** |
| Hazard rooms | 30 | 1.5–2× largest single-floor draw of 3 (t22) | **16** |
| Stuff rooms | 45 | 1.5–2× largest single-floor draw of 9 (t22) | **16** |
| Good Stuff | see below | sized by how much is handed out per floor, not by room count | **not sized** |
| Bad Stuff | punishment-driven | not policied anywhere | **8** `[you, 2026-08-29]` *(for now)* |
| Red reward pool | ~40–50 | a declined card is essentially never seen again (t09) | **see below** |
| Gray reward pool | ~40–50 | same | **see below** |

**The Stuff row split in two on 2026-08-25**, when a Stuff room became its own card. The two rows now
size on different rules. **Stuff rooms** are a room pool and follow ticket 22's room policy, exactly as
the Enemy and Hazard rows do — 16 is unchanged, because the number of *rooms* per floor did not change.

**Good Stuff is deliberately not sized here.** `[finding]` It is sized by how much is handed out per
floor, and that roughly doubled: nine rooms paying **both** characters is **18 pieces on floor 1** where
the old design paid 9. Ticket 22 flagged that the 9 → 0 Stuff curve probably has to come down as a
result — each room is now worth about twice as much — and that recalibration is a
[ticket 10](../issues/10-sim-the-resource-economy.md) number that has not landed. Sizing this pool
before the curve moves would only have to be redone. The
[encounter simulator](../../../prototype/encounter-sim.html) carries the curve as a control for exactly
this reason.

**The reward pools do not fit.** `[finding]` Ticket 09's target — a declined card goes to the bottom
and is *essentially never seen again in that run* — is a statement about pool size relative to total
draws. Per character, a run draws that pool 30 times at the ascend alone (3 cards × 10 floors), plus
the hazard reveals: 3 hazard rooms per floor, each able to reveal, is up to 30 more. Call it **40–50
draws from each pool**. For a declined card at the bottom never to resurface, the pool has to be about
that size — **45–55 cards per character, so 90–110 unique player cards** before a single room or piece
of Stuff is printed. Total component count lands near **175 cards**.

That is a large box, and it collides with ticket 02's low-complexity constraint. **Not resolved here** —
four levers exist and all four are the human's call, not the agent's:

1. Accept the number. 175 cards is an ordinary deckbuilder box.
2. **Offer 2 at the ascend instead of 3.** Cuts ascend draws from 30 to 20 per pool.
3. **Make the hazard reveal draw from a third, shared pool** rather than the character pools. Cuts
   pool draws by up to 40% and would give the two reward sources genuinely different card lists —
   which ticket 09 already argued they should *feel* like.
4. **Soften the target** from *never seen again* to *uncommon*, as ticket 22 accepted for the room
   pools. A pool of ~25 would then do.

Option 3 is the agent's recommendation, labelled as such. It is the only one that shrinks the print
run without weakening a ruling.

---

## What the build answered

The ticket asked four questions. Three can be answered from the build; one cannot be answered without
a person and a table, and is not answered.

### 1. Does the anatomy hold?

**Yes — no card in this set needed a field that does not exist.** Three findings, none fatal, all
needing a ruling.

**Finding 1 — dissolved 2026-08-25, not answered.** `[you, ticket 22]` A Stuff room is its own
card and Good Stuff is a separate item in a side pool, so there are two cards: the room reads
`Stuff` and the item reads `Good Stuff`, and nothing does double duty. The finding as originally
written is below, and is now void.

> **Finding 1 — the Stuff room's type line has to be one string, and ticket 11 named it two.**
> Ticket 11 says the type line "reads `Stuff`" in the room zone and the same card "reads `Good Stuff`"
> in hand. A physical card prints one line. This set prints **`Good Stuff`**, on the reasoning that the
> card spends one flip in the room zone and the rest of the floor in a hand — but that is the agent
> choosing, and the ruling is the human's. The alternative is printing `Stuff` and letting Good/Bad be
> what the presence or absence of a stat field tells you.

**Finding 2 — "no stat field" no longer reliably means "no stats."** Ticket 11 discharged ticket 09's
requirement that *has no stats* be readable at a glance by giving Bad Stuff no stat field. But ticket
11 also put **conditional stats in the effect text** — and `In Step` is a card with no stat field that
supplies Power. So the glance now has a false positive. The fix is small and there are two: put
conditional stats in the stat field (`Power ✳` with the condition in text), or accept that the type
line, not the stat field, is what makes Bad Stuff readable — which it already does, since it says
`Bad Stuff` outright. **The agent's read is that the type line was always doing the work and the stat
field never needed to.**

**Finding 3 — player cards want a cleanup timing hook.** `Reckless` and `Scrap Sense` both act *at
cleanup*. Ticket 21 ruled that *rooms* have no behaviour beyond the flip, which is untouched, but
nothing on the map has said whether a **player card** may schedule something for later in the turn.
It needs no new field — it is effect text — but it is a new timing window, and the map should know it
was opened here rather than find it later.

### 2. What could the anatomy not express without a rules exception?

**One thing: `Second Wind`.** Recovering cards from the exhaust pile requires either a shuffle
mid-floor, which ticket 04 forbids outright, or a "put on top of your deck" phrasing that quietly
makes every heal deterministic and stacks with ticket 09's mid-floor reward on the same spot. The
anatomy expresses the card fine; the *rules* have no room for it. This is the one place the set went
looking for a wall and found one.

Everything else the set wanted to say fit: conditional stats, cross-character references, restrictions
on fuel use, floor-boundary triggers, a room paying a reward, a punishment handing out Bad Stuff.

### 3. Reading time

**Not answered, and cannot be from here.** It needs the cards in front of a person with a timer, which
is ticket 20's table. What this build contributes is the material and a protocol:

- The budget from ticket 11 is **~3 seconds for a room card, cold, once** and **~1 second for a player
  card, comparatively, in a fan of five.**
- The three cards to time are **`Both Barrels`** (three clauses, printed stat overridden by its own
  text — the set's deliberate over-the-line probe), **`Scrap Sense`** (two clauses plus an upkeep
  trigger), and **`The Thing In The Stairwell`** (four printed lines, the longest room card).
- The control is the four starters. If `Shove` and `Both Barrels` read at the same speed the budget is
  not measuring anything.
- **Time a hand, not a card.** The budget is comparative — a fan of five, one of them a `Woah` — so
  the honest measurement is how long it takes to decide what to play, not how long one card takes.

**The prediction, recorded now so it can be wrong later:** `Both Barrels` will miss the budget, and
that is the intended outcome. Ticket 11's rarity gate says the complicated cards must be identifiable
before you take them, not that they must be fast. If a `Woah` card *can* be read in a second, the tier
is not carrying any complexity and the axis is doing nothing.

### 4. Does the triple read work?

**The triple read is a double read, and that is a simplification worth recording.**

Ticket 11 framed this as the hardest presentation problem: one card meaning energy, health, and effect
at once. Building the set, the third read never appeared. **Health is not a property of a card — it is
the height of a pile.** A card in the deck is face down and means nothing; a card in the exhaust pile
is read as information about what is gone, not as a value. The only zone where a card is read at all
is the **hand**, and there it asks exactly one question: *is this fuel or is this a play?*

So the anatomy's real job is a **two-way read under a five-card cap**, and on that it does well. `Cost`
and stat are the whole of it: a high stat with a low cost is a play, a low stat with any text is
usually fuel, and Bad Stuff is neither and says so on its type line.

**The spreadsheet risk is real but it is not on the card.** No single card here is a spreadsheet. The
arithmetic lives in the **pool** — `Grav Harness` at Power 3 plus `Scrap Sense`'s +2 plus `In Step`
counting Red's plays, totalled against a printed threshold, across two hands. That is a table-level
problem, not an anatomy-level one, and it belongs to ticket 20.

---

---

## Revision, 2026-08-25 — after a cold review

The set was handed to a reviewer who was given **only the card sheet and the rules summary** — no
tickets, no map, no access to any of the reasoning above. That is why the findings below are worth
their weight: they are what the cards say to someone who cannot ask why.

### The ruling that came out of it

`[you, 2026-08-25]` **Down is no longer "unable to draw."**

> When a character's deck is empty, that character enters **last stand**. A character is **Down** when
> something would Exhaust a card from their empty deck, **or** when the team Flees the room while that
> character is in last stand. While Down, a character gets no rewards, cannot act, and **cannot have
> cards added to their hand.**

This supersedes ticket 04's *"you are exhausted when you begin a turn and cannot draw"*, ticket 07's
*once per turn* framing of last stand, and ticket 17's one-turn window. Last stand is now a **state**
you occupy for as long as your deck is empty, not a window that opens and shuts.

**It closes three separate holes at once**, which is why it is worth recording as one ruling rather
than three patches:

1. **You could be declared Down at full health.** Stuff ignores the hand cap and every Stuff room
   pushes a `Hold` card into someone's hand. Five of them and that character could not draw — and
   "cannot draw" meant Down. A character with a full deck could lose the run to prosperity. Now being
   unable to draw is simply being unable to draw.
2. **Last stand's own trigger was dead text.** Ticket 17 named "or a Flee cost taking it" as a way to
   enter last stand, but Flee costs land in cleanup, after the play phase — so the free-play window
   opened onto a phase that was already over. As a persistent state, the trigger works.
3. **A Down character was a Stuff dumpster.** Nothing stopped the team parking every unwanted piece of
   Bad Stuff in the hand of someone who could not act, permanently defusing hand-cap pressure.
   *Cannot have cards added to their hand* ends it.

**One knock-on worth naming:** last stand is now genuinely frightening rather than a free turn. Ticket
17 logged the worry that surviving one *rewards* emptying your deck, and ticket 07 answered it with a
2-card exit tax. This ruling answers it far harder — **in last stand, any Flee puts you Down.** You
cannot coast; you have to keep clearing rooms or you are finished. Whether the 2-card exit tax is
still needed on top of that is now a live question, and it is yours.

### Cards changed

| Card | Was | Now | Why |
|---|---|---|---|
| **In Step** | Power = Red's plays | Power = **twice** Red's plays | complexity must pay for itself under the value ruling |
| **Reckless** | `Cool` | `Cool` *(via `Fine`)* | briefly demoted on complexity, restored on value |
| **Reckless** | drawback null at 0 deck | *(unchanged text)* | the Down ruling fixed it — exhausting an empty deck now puts you Down |
| **Both Barrels** | "Clears an **Enemy** room" | "Clears **a** room" | the Enemy room ends the floor, so the upside deleted the card |
| **Scrap Sense** | dies if Gray *plays* no Good Stuff | dies if Gray is *holding* none at cleanup | most turns nobody plays anything, so it reliably killed itself |
| **Catch Your Breath** | "Exhaust one and put the other back" | "Put them back in either order" | it was strictly worse than the starter it replaces |
| **In Step** | "cards Red played" | "cards Red has played into the play zone" | players counted cost payments as plays |
| **Second Wind** | `Cool` | `Cool` | unchanged in the end; the only heal in the game |
| **Pack Rat** | `Cool` | `Woah` | Stuff is the stat engine, so carrying two onto floor 8 is enormous |
| **Cutting Torch** | `Cool` | `Cool` *(via `Fine`)* | the biggest single number in the set; its demotion to `Fine` is what prompted the value ruling |
| **Grav Harness** | `Woah` | `Woah` | six stats across two kinds, plus a card that refunds its own fuel |
| **Collapsed Stair** | Flee 1 from deck | Flee 3 from deck | fleeing was cheaper than clearing, so the low tier was dead |

### Finding 4 — the rarity axis collapsed under its own rule, and has been replaced

Auditing every card strictly on *complexity, never quality* left **`Fine`** holding nine cards
including `Cutting Torch`, **`Cool`** holding three, and **`Woah`** holding two. A card with no rules
text has no complexity, so **every vanilla card in the game was `Fine` regardless of how strong it
was** — `Cutting Torch` at `Power 5` wearing the same border as `Shove` at `Power 1`. Rarity could not
differentiate Good Stuff at all, which is most of what the game's numbers come from.

**Ruled 2026-08-25** `[you]`, looking at exactly that result:

> **Rarity is based on card *value* above everything.** If a card is objectively more powerful, it is a
> **higher** rarity, not a lower one. The most complex cards are still always the highest rarity — but
> **a complex card has to pay for its complexity in potential value when the synergy comes together.**

**This reverses ticket 11's *"a complexity signal, never a quality one"*, knowingly**, and resolves the
contradiction this finding identified in ticket 11's favour of its own *"a `Woah` Stuff should be an
exciting flip"* line. Recorded as an amendment on ticket 11, not edited into it.

**Ticket 11's actual protection survives**, which is why the reversal costs less than it looks. The
implication that matters runs one way: **every complex card is still high rarity**, because complexity
must be paid for in value. So a player who declines `Woah` cards still avoids every nested conditional
in the game. What they give up is that they now also decline some simple bombs.

**Ticket 09's concern is also untouched.** Rarity signalling value does *not* make it an escalation
dial, because the pool stays flat — every tier is equally likely at every floor, so a floor-2 reward
can still be a `Woah` and a floor-9 reward can still be `Fine`. Nothing about floor number touches the
pool. Escalation stays on ticket 22's single dial.

**And ticket 15 is not reopened.** Legible card quality was ticket 11's item 6a, which existed to let
a player cull their weakest cards under fire. There is still no culling, so quality being legible pays
for itself in *acquisition* — knowing what a reward is worth as you take it — not in deck management.

**The measure is ceiling, not efficiency** `[proposed by agent → you approved]`. The tiebreak the
ruling needed: `Pry Bar` is more *efficient* than `Cutting Torch` (3 stats per card against 2.5) while
`Cutting Torch` is plainly the bigger card. The border reports **what the card can do for you when
things line up**, because a five-card hand cap means one big number clears thresholds that two good
ones cannot reach.

**So a card can feel ordinary and still be `Woah`, and vice versa.** Efficiency is not what rarity
reports — a cheap, repeatable, grindingly good card may sit at `Fine` while a swingy one-shot sits at
`Woah`. That is the axis working, not a miscalibration.

### What the new axis did to the distribution

| Tier | Before (complexity) | After (value) |
|---|---|---|
| `Fine` | 9 | 7 — the four starters, `Catch Your Breath`, `Pry Bar`, `Coil of Cable` |
| `Cool` | 3 | 4 — `Reckless`, `Second Wind`, `In Step`, `Cutting Torch` |
| `Woah` | 2 | 4 — `Pack Rat`, `Scrap Sense`, `Both Barrels`, `Grav Harness` |

**`Pack Rat` was dropped on 2026-08-29**, so `Woah` now holds three. The table above is the
2026-08-25 re-tiering as it happened and is left standing as the record of it.

The complexity axis had bunched two-thirds of the set into one border. The value axis spreads it, and —
worth noting, because it is the thing that makes the tier informative — **`Woah` now contains a card
with no conditional text at all** (`Grav Harness` is close, and a hypothetical `Power 8` piece of Stuff
would be a pure case).

### What the review found that is *not* fixed here, because it is not the exemplars' to fix

- **Stuff rooms are a decision-free tax, and they are most of floor 1.** Nine of thirteen rooms have
  no threshold and no Flee line, yet the mandatory draw still charges both characters a card. In the
  reviewer's playthrough **six of ten turns were "draw one, throw it away," and Gray went Down on turn
  7 without a single enemy or hazard touching them.** This is ticket 22's composition and ticket 20's
  table, not a card fix, and it is the single largest finding in the review.
- **Rooms that leave the floor deck.** A Stuff room is never Cleared and never Fled — it becomes a
  card in a hand. The rules summary now says so; nothing else on the map does.
- **Four unstated rules** now listed at the foot of the rules summary: starting deck size, what
  happens to cards in hand when a floor ends, which pool and whose deck a room's reveal line means,
  and whether a skipped reveal goes to the bottom of its pool.

## What this does not do

- **It rules nothing.** Ticket 12 stays open.
- **It changes no other ticket.** Findings 1, 2 and 3 are ticket 11's record to amend if the human
  agrees with them; ticket 12's own instruction is that anatomy changes go back to 11 rather than
  being made here.
- **It sets no numbers.** Every cost, stat and threshold above is a placeholder for ticket 10.
- **Ticket 13 is untouched.** Red and Gray differ here only by flavour — Red pushes, Gray finesses,
  Red's cards lean `Power` and Gray's lean `Scramble`. That is a guess dressed as an exemplar, and
  ticket 13 owns the real answer.

---

## Dropped 2026-08-29 — `Pack Rat`

`[you]` **`Pack Rat` is dropped from the exemplar set.** It read *"When you clear a floor, keep up to
2 Stuff for the next floor"* at `Cost 2`, `Woah`, `Hold`, and it was priced as the only way to carry
Stuff between floors. [Ticket 24](../issues/24-the-scrap-mechanic.md) made carrying Stuff forward free
for everyone: held Stuff shuffles into the deck at the ascend, and the Scrap tax keeps one piece
permanently. What `Pack Rat` still did that the free version does not — keep Stuff as *playable Stuff*
rather than as deck stamina — was not worth a `Woah` slot at `Cost 2`.

**The set is 24 cards.** Player cards fall from 11 to 10, and `Woah` from 4 to 3.

**The acquisition-inversion requirement is now uncovered.** This ticket's brief asks for a card whose
purchase is a genuinely hard call under ticket 09, and `Pack Rat` was that card. Nothing has replaced
it. `[finding]`

**Removed from all three copies** — this page, the [cutting sheet](../../../prototype/12-exemplar-cards.html)
and the [encounter simulator](../../../prototype/encounter-sim.html) — which is the duplication
[ticket 25](../issues/25-single-source-for-the-card-list.md) exists to end.


---

## `One Man's Junk` replaced `Scrap Sense`, 2026-08-29 — what it left behind

The sections above dated 2026-08-25 are the record of what happened then and are left standing. Three
of them now describe a card that no longer exists.

- **Finding 3 — "player cards want a cleanup timing hook"** rested on `Reckless` and `Scrap Sense`
  both acting at cleanup. `One Man's Junk` has no cleanup clause, so **`Reckless` is the only remaining
  evidence** for that finding. It is not withdrawn — one card still wants the hook — but it is thinner
  than when it was written. `[finding]`
- **The reading-time list** named `Scrap Sense` as one of three cards to time, on the strength of "two
  clauses plus an upkeep trigger". The replacement is a single conditional line, so it is no longer a
  hard read and [ticket 20](../issues/20-encounter-tabletop-prototype.md) should time something else.
  `[finding]`
- **The rarity distribution** lists `Scrap Sense` under `Woah`. `One Man's Junk` inherited that border
  and it has not been re-ruled — see the card's own entry.

The stat-arithmetic example that adds `Scrap Sense`'s +2 to `Grav Harness` no longer computes, since
the +2 came from the modifier clause that is gone.
