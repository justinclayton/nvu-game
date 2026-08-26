# Exemplar card set — ticket 12

Built 2026-08-25 for [ticket 12](../issues/12-exemplar-card-set.md). **Everything on this page is
`[proposed by agent → awaiting your ruling]`.** No card here is adopted. The map's standing rule is
that the agent surfaces options and the human rules; this file is the option.

Printable version for cutting: [`prototype/12-exemplar-cards.html`](../../../prototype/12-exemplar-cards.html).
One-page rules summary: [`12-floor-rules-summary.md`](12-floor-rules-summary.md).

**Every number is a placeholder.** Ticket 22 left the Enemy room's `Power` untuned and ticket 09 left
starting deck size to ticket 10. Costs, stats and thresholds here exist so the cards can be *read*,
not because they are balanced. Ticket 10 owns all of them.

---

## The player cards

Format, per ticket 11: **Name** · type line · `Cost N` · **Stat** · effect text · `Hold` where
printed · rarity. Rarity is a complexity signal, never a quality one.

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

### Reckless · Red · `Fine` · `Cost 0` · **Power 5**

> *At cleanup, Red Exhausts 3 from deck.*

**Stresses: health loss.** Five Power for free, and the bill arrives after the room is resolved.

**The bug here was fixed by the Down ruling, not by the card.** At an empty deck *"Exhaust 3 from
deck"* used to exhaust nothing, so the game's biggest burst card became free exactly in last stand —
the drawback was null when it mattered most. Under the ruling of 2026-08-25, something that **would
Exhaust from an empty deck puts that character Down**. Reckless is now the most dangerous card in the
set to hold at low deck, which is the correct shape for it.

**Rarity dropped `Cool` → `Fine`.** One clause, six words of trigger. It is *brutal*, not *complex*,
and rarity is the complexity axis — leaving it at `Cool` was the axis quietly sliding back into
meaning quality. See finding 4.

### Second Wind · Red · `Fine` · `Cost 1` · *(no stat)*

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

> *Power equal to the number of cards Red has played into the play zone this turn.*

**Wording fixed 2026-08-25.** It read *"the number of cards Red played this turn"*, which a new player
reads as including the cards Red **Exhausted to pay costs** — a materially different and much larger
number. *Played into the play zone* is unambiguous and costs four words. The separate question of
*when* the value is read is a rules answer, not a card fix, and is now printed in the rules summary:
**a conditional stat is recalculated every time the pool is read, and nothing locks on play.**

**Stresses: effect.** Ticket 21 named this exact shape as where build synergy is meant to live, and it
is the cheapest demonstration that the shared stat pool is worth having: it is a Gray card that only
works because Red is at the table. Solo, it is the same card — which is ticket 03's claim made
concrete.

### Pack Rat · Red · `Cool` · `Cost 2` · *(no stat)* · `Hold`

> *When you clear a floor, keep up to 2 Stuff for the next floor.*

**Stresses: the acquisition inversion.** This is the carry-Stuff-onward card ticket 09 left as
*allowed, not owed* and ticket 11 confirmed needs no new machinery. Taking it is a hard call in three
directions at once: it is +1 card diluting a deck that gets one pass; it occupies one of five hand
slots for an entire floor before it pays anything; and `Cost 2` means deploying it burns two more
cards. Against that, ticket 11 made Stuff the stat engine, so carrying two pieces onto floor 8 is
enormous.

### Scrap Sense · Gray · `Woah` · `Cost 1` · *(no stat)* · `Hold`

> *The first piece of Good Stuff Gray plays each turn has +2 Power and +2 Scramble.*
> *If Gray is holding no Good Stuff at cleanup, Exhaust this.*

**Stresses: the `Woah` read.** Two clauses, one conditional, one upkeep trigger. This is ticket 11's
central claim in a single card — *your permanent deck is modifiers, your stat base is scavenged fresh
each floor*.

**Fixed 2026-08-25.** The self-destruct used to fire *"if Gray plays no Good Stuff during a turn"* —
and the majority of floor-1 turns are Stuff rooms where nobody plays anything at all, so the card
reliably killed itself at the cleanup of the turn after you installed it. It now checks what Gray is
**holding**, not what Gray played, which is a condition the player actually controls: it survives
while you have Stuff in reserve and dies when you have burned through it. Same two clauses, same
`Woah` read, no guaranteed death.

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

**Cutting Torch** · Good Stuff · `Fine` · `Cost 1` · **Power 5** · `Hold`

**Grav Harness** · Good Stuff · `Cool` · `Cost 1` · **Power 3, Scramble 3** · `Hold`
> *When you play this, one character may draw 1 card, ignoring the hand cap.*

> Four pieces, and the numbers dwarf everything in the player decks. That is the point: `Cutting
> Torch` alone is more Power than Red's entire starting hand can assemble. It also shows the cost of
> the arrangement — a `Cost 1` piece of Stuff means you burn a card out of a five-card hand just to
> put your stat base on the table.

**Both rarities dropped, 2026-08-25, and doing it exposed a problem — see finding 4.** `Cutting Torch`
has no text at all, so on a complexity axis it cannot be anything but `Fine`, however exciting a flip
it is. `Grav Harness` has one clause and is a far easier read than `Scrap Sense`, so it cannot sit in
the same tier.

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

**Stuff rooms are not listed separately.** Per ticket 11 a Stuff room simply *is* the Good Stuff card:
no threshold line, no Flee line. The four Good Stuff cards above are the four Stuff rooms. See finding
1 below — this is where the anatomy came closest to breaking.

---

## The pools

Ticket 12 owes the exact counts ticket 22 and ticket 09 both deferred here. These follow from their
stated policies; the last one does not come out well.

| Pool | Draws per run | Policy | Count |
|---|---|---|---|
| Enemy rooms | 10 | one per floor, each floor a different monster (t22) | **10** |
| Hazard rooms | 30 | 1.5–2× largest single-floor draw of 3 (t22) | **16** |
| Stuff rooms / Good Stuff | 45 | 1.5–2× largest single-floor draw of 9 (t22) | **16** |
| Bad Stuff | punishment-driven | not policied anywhere | **8** *(proposed)* |
| Red reward pool | ~40–50 | a declined card is essentially never seen again (t09) | **see below** |
| Gray reward pool | ~40–50 | same | **see below** |

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

**Finding 1 — the Stuff room's type line has to be one string, and ticket 11 named it two.**
Ticket 11 says the type line "reads `Stuff`" in the room zone and the same card "reads `Good Stuff`"
in hand. A physical card prints one line. This set prints **`Good Stuff`**, on the reasoning that the
card spends one flip in the room zone and the rest of the floor in a hand — but that is the agent
choosing, and the ruling is the human's. The alternative is printing `Stuff` and letting Good/Bad be
what the presence or absence of a stat field tells you.

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
| **Reckless** | `Cool` | `Fine` | one clause; rarity is complexity, not brutality |
| **Reckless** | drawback null at 0 deck | *(unchanged text)* | the Down ruling fixed it — exhausting an empty deck now puts you Down |
| **Both Barrels** | "Clears an **Enemy** room" | "Clears **a** room" | the Enemy room ends the floor, so the upside deleted the card |
| **Scrap Sense** | dies if Gray *plays* no Good Stuff | dies if Gray is *holding* none at cleanup | most turns nobody plays anything, so it reliably killed itself |
| **Catch Your Breath** | "Exhaust one and put the other back" | "Put them back in either order" | it was strictly worse than the starter it replaces |
| **In Step** | "cards Red played" | "cards Red has played into the play zone" | players counted cost payments as plays |
| **Second Wind** | `Cool` | `Fine` | one clause |
| **Cutting Torch** | `Cool` | `Fine` | no text at all |
| **Grav Harness** | `Woah` | `Cool` | one clause; far easier than `Scrap Sense` |
| **Collapsed Stair** | Flee 1 from deck | Flee 3 from deck | fleeing was cheaper than clearing, so the low tier was dead |

### Finding 4 — the rarity axis collapses under its own rule

Auditing every card strictly on *complexity, never quality* left **`Fine`** holding the four starters,
Reckless, Second Wind, Catch Your Breath and Cutting Torch; **`Cool`** holding three cards; and
**`Woah`** holding exactly two. A card with no rules text has no complexity, so **every vanilla card in
the game is `Fine` regardless of how strong it is** — `Cutting Torch` at `Power 5` sits in the same
tier as `Shove` at `Power 1`.

That is the rule working as written, and it makes two things visible:

- **Rarity cannot differentiate Good Stuff at all**, because Stuff is mostly vanilla stats. This
  contradicts ticket 11 in its own words: it ruled Good Stuff carries rarity because *"a `Woah` Stuff
  should be an exciting flip"* — which is **quality**, the exact reading ticket 11 forbade three
  paragraphs earlier. One of those two lines has to go, and it is the human's call which.
- **The tiers are lopsided.** If `Woah` means "two or more interacting clauses" it will be a small
  slice of any real pool, which may be correct — a player declining all `Woah` cards should be
  declining a minority, not a third.

**Not resolved here.** Recorded against ticket 11, which owns the axis.

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
