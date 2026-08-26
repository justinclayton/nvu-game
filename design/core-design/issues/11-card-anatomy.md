# 11 — Define card anatomy

Type: grilling
Status: resolved
Blocked by: 04, 09
Map: [core design map](../map.md)

## Question

What does a single physical card carry, and how does one card read simultaneously as **energy**,
as **health**, and as an **effect** without becoming unreadable?

This is the hardest presentation problem the resource model creates: in Decipher's game a card in
the Force pile was face-down and anonymous. If North vs Up's cards are meaningful in every zone,
each card has to communicate three different things depending on where it sits.

Decide:

1. **Card types.** The full list of types, and what distinguishes them.
2. **Fields.** Every field a card carries — name, type, cost, effect text, any energy value, any
   damage/health value, keywords, art box.
3. **Layout and orientation.** Where each field sits, and specifically whether values must be
   readable when the card is fanned, stacked, rotated, or face-down.
4. **The triple read.** How the player knows, at a glance, what this card is worth as energy
   versus what it does when played. Whether one number serves multiple roles or each role gets
   its own.
5. **Glanceability under pressure.** Ticket 06 settled a pressure mechanism; a card that takes
   fifteen seconds to parse defeats it. State the reading-time budget and design to it.
6. **Text load.** How much rules text a card may carry, and whether keywords are needed to keep
   it down.
6a. **Legibility of card *quality*.** If ticket 15 survives, the player culls their weakest cards
   while under fire. That only works if some cards are visibly worse than others and the player can
   sort good from bad at a glance, under pressure, without deliberating. Decide whether quality is
   signalled explicitly (a tier, a colour, a number) or left to be inferred from the card's text.
7. **Physical upkeep.** What the card asks a human to do — rotate, flip, cover, slide under
   another card — and whether that survives a real table.

## Must satisfy

- The resource model from ticket 04 and the acquisition model from ticket 09.
- The reading-time implications of ticket 06.
- The encounter loop from ticket 18 — a card has to carry whatever information the player needs at
  the moment they make the floor's primary choice. 18 wrote **no filter**; check by argument.
- **This ticket now also owns floor card anatomy.** A floor is a deck, so a floor card is a card and
  has to be readable at a glance at the moment it is flipped: what it takes to defeat, what it costs
  to fail, what it pays. Decide whether a floor card and a player card share an anatomy or are
  deliberately distinct objects — they are never in the same hand, which is an argument for making
  them look nothing alike. Wait on [ticket 21](21-defeating-a-floor-card.md) for what actually has to
  be printed there.

## Settled upstream by ticket 21 — do not relitigate

`[you, 2026-08-23]`

- **A card's cost and its stats are separate, unrelated numbers.** The anatomy needs both, and needs
  them impossible to confuse at a glance.
- **Stats are named keywords** — `Power` and `Scramble` at level 1, more expected. **Most cards carry
  exactly one stat.** Multi-stat cards exist, are naturally more valuable, and are costed for it.
- **Stats need not be simple printed numbers.** *"Power equal to twice the number of cards Gray plays
  this turn"* is an intended shape, because that is where build synergy is expected to come from. The
  anatomy has to hold a conditional stat without becoming a spreadsheet.
- **`Hold` is printed on the card face**, not implied by a card being an item.
- **A room card** prints a **challenge** (a named threshold like `Power 3`) and a **punishment**
  (normally *"1 character Exhausts X from deck"*). Item rooms are one card doing double duty: the room
  while it is in the active room zone, the item once it is in hand. That dual reading is this ticket's
  hardest anatomy problem — the same face has to be legible as both.

## Notes for the session

- Anatomy is easy to over-specify in the abstract. Keep it to what ticket 12's exemplar cards will
  actually need to express.

## Settled upstream by ticket 04

- **Cost is a number of cards**, paid as "exhaust X cards from your hand." There is no energy symbol
  and no separate resource to print.
- **Two cost phrasings exist and they mean different things to the player:** "exhaust X cards from
  your hand" (a cost you chose) and "exhaust X cards from your deck" (a punishment you didn't).
  Keywords may be introduced later; for now these are the literal phrases.
- **Hold** exists as a keyword, taking Slay the Spire's meaning: the card is not exhausted at end
  of turn. Used for highly situational cards and for anything that should feel equipped.

## Card kinds established by ticket 05 — `[you]`

Two more things a card can be, both of which this ticket must find room for in the anatomy:

- **A temporary in-floor card** — something a floor hands you that goes to hand with **Hold** and is
  gone on ascending, never entering the deck. `[you, ticket 05]` The *scavenged item* was the original
  case and died with rooms; whether floor cards pay one instead is
  [ticket 21](21-defeating-a-floor-card.md) item 6. The anatomy question survives either way: decide
  whether "leaves at end of floor" is a printed keyword, a card kind, or a property of where the card
  came from — and note the card must read as temporary at a glance, or players will build plans
  around something that is about to vanish.
- **Curse** *(placeholder name — a thematic replacement is owed before the spec locks)* — a card that
  follows you between floors as a penalty, taking Slay the Spire's meaning. The default is that
  nothing bad carries; a Curse is a specific card breaking that default deliberately.

These have the *same lifecycle vocabulary* and **opposite valence**: one is a good thing that leaves,
one is a bad thing that stays. Slay the Spire's word "Status" was explicitly **not** imported for the
first, because it means junk there. Naming these two apart is partly this ticket's job.

## New card type to design — `[you]`, from the ticket 04 session

**Persistent effects live in your hand.** A card granting an ongoing buff stays in hand via Hold
and works for as long as you keep it. It costs nothing to maintain and needs no tracking — but it
occupies hand space you cannot refill for free, *and* it sits there every turn as a candidate to be
burned as fuel when you are desperate. Duration is never a rules question: it lasts exactly as long
as you can afford it.

The agent's assessment, recorded for provenance: this is the strongest single idea produced in the
ticket 04 session. It gives persistent effects with no tokens, no upkeep, and built-in tension, and
it re-asks the "is this still worth it?" question every turn without a single rule.

Decide here: what such cards look like, whether they are their own type or just Hold plus a static
effect, and whether burning one as fuel is a normal exhaust or something the card gets to react to.

## Handed down by ticket 09, 2026-08-24

Ticket 09 answered one of the two naming questions this ticket was left holding, and added three
things to the anatomy.

**The `Curse` bullet above is dead.** `[you, ticket 09]` `Curse` is retired from the core spec —
nothing bad crosses a floor boundary, full stop. This ticket no longer owes it a name, and the
"opposite valence, same lifecycle" naming problem is resolved: there is only the temporary in-floor
card, and it is called **Stuff**.

**`Item` is renamed `Stuff`, and Stuff splits by origin.** `[you, ticket 09]` **Good Stuff** comes
from the floor deck through Item rooms. **Bad Stuff** comes from a pool outside the floor deck, handed
over by a room's printed punishment. Both are Stuff once in your possession and behave identically:
`Hold`, playable, ordinary fuel. The only structural difference is that **Bad Stuff contributes no
stats** toward a challenge — so this ticket's anatomy must make "has no stats" a readable thing for a
card to be, and must let per-card text restrict a piece further, including forbidding its use as fuel.

**Card-level Red/Gray asymmetry is now committed, not optional.** `[you, ticket 09]` Permanent card
rewards come from **two per-character pools** — Red picks 1 of 3 from Red's, Gray from Gray's. Red's
cards and Gray's cards are therefore different cards. Ticket 13 owns *how* they differ; it no longer
owns *whether*. This ticket's anatomy has to carry a character marking.

**A card this ticket may build, or may decline to build.** `[you, ticket 09]` Nothing in the rules
carries Stuff past ascending. What stays open is a *card* that does — something reading roughly *"if
you are holding this when you clear a floor, keep up to 2 Stuff for the next floor."* Ticket 09 moved
this off the map's fog and into this ticket's design space; it is not owed, only allowed.

**A naming debt this ticket may want to take.** `[you, ticket 09]` **`Item room` is provisional** and
survives only because nothing better was on the table. A good name for it probably involves neither
`Stuff` nor `Item`. `Cache` and `Stash` are starting points, not decisions.

---

## Answer

`[you, 2026-08-25]`

### The ruling that shapes everything else

**Player cards are effect-forward; Stuff carries the raw stats.** `[you]` Asked whether a typical
player card's dominant content is a stat or a line of text, you chose text — with two carve-outs:
**starter cards may be primarily raw stats**, so a new player is not overwhelmed, and **reward cards
are definitely effects**. Then, asked where raw `Power` comes from late in a run, you ruled that
**Stuff always provides the bulk of the raw stats**.

Together those two give the run an arc nothing else on the map was providing, and it is worth stating
plainly because several other tickets now depend on it:

> **Your permanent deck is modifiers. Your stat base is scavenged fresh every floor.**

Starter cards are a floor-1 crutch, diluted away as the deck grows. Every reward card is an effect
acting on a base it does not itself supply. That base is **Good Stuff** — finite per floor, and gone
on ascending. So ticket 22's item count falling from 9 at floor 1 to 0 at floor 10 stops being a
generosity curve and becomes **the sharpest escalation dial on the map**: late floors starve a clever
deck of the exact thing its cleverness multiplies.

`[you]` **Floor 10 is meant to be a desperate scrape** — the option that it is the run's hardest
moment by design was chosen over softening the curve — **and it must actually be winnable.** Whether
the bottom of the item curve is 0 or 2 is a number, not a shape, and goes to ticket 10.

### Player card anatomy

Every field a player card carries:

- **Name**
- **Type line** — `Red`, `Gray`, `Good Stuff`, or `Bad Stuff`
- **Cost** — a number of cards, in the corner
- **Stat** — `Power 2`, `Scramble 3`. A **distinct field**, not merely text, because ticket 12 needs
  `Power 3` and `Draw 2` to be visibly different kinds of thing: one feeds the stat pool, the other
  does not. Many effect cards have none.
- **Effect text** — including any **conditional** stat, such as *"Power equal to twice the cards Gray
  played this turn."*
- **`Hold`** where printed
- **Rarity** — `Fine`, `Cool`, `Woah`, shown as a border colour
- **Art**

**A card is worth exactly 1 stamina, always, and never prints it.** `[you]` Cost and damage both count
*cards*, so a stamina value would be a printed 1 on every card in the game — and it would reintroduce
the energy field ticket 04 retired. This is what keeps the deckbuilding inversion legible without
arithmetic: every card you add is one more stamina and one more card between you and the one you
wanted.

**Ticket 09 required "has no stats" to be a readable thing for a card to be.** It is, and it costs no
new field: **Bad Stuff simply has no stat field**, and the type line says `Bad Stuff` outright. A
player holding five cards under pressure can see which ones are dead weight without reading a word of
text. Ticket 09 also required that per-card text be able to **restrict a piece further, including
forbidding its use as fuel** — that is ordinary **effect text** and needs no mechanism of its own.

**There is no third character.** `[you]` Ticket 07 worried that **neutral cards** could not be sorted
by sight at cleanup. The worry was stale: reward pools and starting decks are both per-character
(ticket 09), so every card a character owns is theirs, and the only cards belonging to neither are
Stuff — which is visibly Stuff on its own type line. The type line and ticket 07's character mark are
**one field, not two**, which also discharges ticket 09's requirement that the anatomy carry a
character marking. The agent's proposed third value `Both` was **rejected by the human on the grounds
that the category does not exist**.

### Rarity

`[you]` Three tiers: **`Fine`**, **`Cool`**, **`Woah`**. **Starter cards are all `Fine`.**

Rarity's job is **complexity signalling** — it tells a player how hard a card will be to read before
they take it. There is **no hard limit on clauses per tier**, but **the most complex cards are always
the highest rarity**. It is **purely printed** `[you]`: it touches no rules. The agent's proposal that
an ascend offer be one card of each tier was **declined** — that would be a real mechanic arriving as
a side-effect of a presentation decision.

**This amends [ticket 09](09-card-acquisition-and-deckbuilding.md), which ruled pools flat with "no
rarity tiers, no escalation by floor."** `[you]` The pool **stays flat**: all three tiers are equally
likely at every floor, so a floor-2 reward can be a `Woah` and a floor-9 reward can be `Fine`. Nothing
about floor number touches the reward pool, which was 09's actual concern — escalation stays on the
single dial ticket 22 owns. What 09 banned and this restores is a *tier*, not a *curve*.

**Good Stuff carries rarity too** `[you]`, since it is now the most load-bearing card category in the
game and a `Woah` Stuff should be an exciting flip. **Bad Stuff has no tier** — it has no stats to be
good at.

### Text load

**How complex a card may be is gated on rarity, not on cost.** `[you]` The agent proposed cost-gating
— expensive cards earn a second clause, so a hand is never five hard reads. The human replaced the
gate: **rarity is the complexity axis**, and a border colour carries it.

The problem this solves is real and was demonstrated with two mock hands at floor 6, one of
single-idea cards and one of two-clause cards. The second is unreadable under ticket 06's pressure.
Rarity-gating means the complicated cards are identifiable *before* you take them, so a player who
does not want a hand full of nested conditionals can simply decline `Woah` cards — which is
deckbuilding, not a rules limit.

### Room card anatomy

`[you]` A room card is a **list of `threshold: outcome` lines, plus one Flee line**:

```
    Sump Crawler                                     Enemy
    [art]
    Power 3: Clear
    Flee: 1 character Exhausts 2 from deck
```

```
    Collapsed Stair                                  Hazard
    [art]
    Scramble 2: Clear
    Scramble 5: Reward — Gray reveals
    Flee: 1 character Exhausts 1 from deck
```

Fields: **name**, **type line** (`Enemy`, `Hazard`, `Stuff`), one or more **threshold lines**, the
**Flee line**, **art**.

**The punishment and the Flee cost are the same thing** `[you]` — one field, not two. Ticket 21 called
it a punishment and ticket 22 added a Flee cost to combat rooms; they were always one concept, and the
card prints it once, under the word that already means *the room beat us and comes back around.*

**The printed words are canonical and the glossary follows them** `[you]`: an **Enemy room**, not a
combat room; a **Stuff room**, not an item room. "Item room" was doubly stale — ticket 09 renamed
items to Stuff, and ticket 22 removed the room's challenge.

**This discharges ticket 09's naming debt, against 09's own stated preference.** Ticket 09 marked
`Item room` provisional and guessed that "a good name for it probably involves neither `Stuff` nor
`Item`," offering `Cache` and `Stash` as starting points. `[you]` The human printed `Stuff` on the
room's type line, so the room is a **Stuff room** and the debt is closed. Recorded as a knowing
override rather than an oversight; `Cache` remains available later as flavour, not as the term.

### The dual read dissolved

This ticket called the item room "its hardest anatomy problem" — one face that must read as a room in
the room zone and as an item in hand. `[proposed by agent → you approved]` **It is not a problem any
more.** Ticket 22 made the item guaranteed on the flip, so a Stuff room has no challenge, no
punishment and nothing to defeat: the "room" reading is empty. **A Stuff room simply is the Stuff
card.** It carries no threshold line and no Flee line, and the type line reads `Stuff`; once it is in
a hand the same card reads `Good Stuff`. Rotation and split faces were both considered and dropped.

### Glanceability

`[proposed by agent → you approved]` The reading-time budget the ticket demanded:

- **A room card: ~3 seconds**, read cold, once, at the flip.
- **A player card: ~1 second**, read comparatively in a fan of five.

These are different reads and the anatomy is designed to the harder one. A card's **text box is
allowed to be slower**, because you only read the text of cards you are actually considering — not all
five.

### Physical upkeep

`[proposed by agent → you approved]` **A card's position never means anything. Only which zone it is
in.** No rotating, no flipping, no sliding one card under another to mark state. Every state in this
game is already which pile a card sits in, deliberately, and orientation would be the first exception
and the first thing knocked askew on a real table.

### Persistent effects

`[you]` **Not a card type.** A persistent effect is an ordinary card printing **`Hold`** plus a static
line — *"While holding this card, cards you play have +1 Power."* Inventing a type would add a word to
the rules for something the keyword already fully explains, and Good Stuff prints `Hold` too, so a
"persistent" frame would split a category the player does not need split.

### What this ticket did *not* decide

- **Layout and orientation — ruled out of scope.** `[you]` The ticket's item 3 asked where every field
  sits and whether values stay readable fanned, stacked or rotated. The human cut the corner stat box
  as premature and ruled that **field placement is card design's problem, not this map's**. It is
  recorded in the map's *Out of scope*, not answered here. This anatomy says what a card *carries*;
  it does not say where anything sits, beyond cost being in the corner.
- **Item 6a is void.** It asked how to make card *quality* legible so a player could cull their weakest
  cards under fire. [Ticket 15](15-damage-as-thinning-rubber-band.md) resolved against player-chosen
  damage, so there is no culling and nothing to signal. Rarity is a complexity signal, not a quality
  one, and must not be pressed into that role.
- **Whether Enemy rooms may also carry a reward tier.** `[you]` Raised by the human while ratifying the
  room format — *"heck, maybe Enemy rooms can have a reward tier sometimes too"* — and deliberately
  left open. The anatomy supports it for free, since a room is already a list of threshold lines.
  Whether it is used is composition, and belongs to [ticket 22](22-floor-deck-composition.md); the
  exemplars in [ticket 12](12-exemplar-card-set.md) may test one.
- **The card that carries Stuff past ascending.** Ticket 09 moved this into this ticket's design space
  as *allowed, not owed* — something reading roughly *"if you are holding this when you clear a floor,
  keep up to 2 Stuff for the next floor."* The anatomy **supports it with no new machinery**: it is
  `Hold` plus a static line, exactly like any other persistent effect. Whether such a card is actually
  printed is a card-design call and belongs to [ticket 12](12-exemplar-card-set.md) — though note it
  is now a much stronger card than 09 could have known, because Q12 made Stuff the stat engine.
- **The `Curse` naming debt is discharged, not paid.** Ticket 05 handed this ticket the job of naming
  two opposite-valence lifecycle words apart. Ticket 09 retired `Curse` and replaced the good half with
  Good Stuff, so there is nothing left to name.

### Amends other tickets

- **[Ticket 09](09-card-acquisition-and-deckbuilding.md)** — rarity tiers exist after all, as a
  complexity axis. Pools stay flat; no floor number touches the pool. Its `Item room` naming debt is
  closed as **Stuff room**.
- **[Ticket 21](21-defeating-a-floor-card.md)** — twice. Its **punishment** and ticket 22's **Flee
  cost** are one field, printed once as the Flee line. And its description of Stuff rooms as "the
  deck's one always-safe decline" is now **misleading**: with Stuff supplying the bulk of raw stats,
  declining Stuff is almost never correct. A Stuff room stopped being a bonus and became the supply
  line.
- **[Ticket 22](22-floor-deck-composition.md)** — its 9 → 0 item curve is now the primary escalation
  mechanism rather than a generosity setting, and floor 10's bottom-of-curve number must be checked
  for winnability.
- **[Ticket 07](07-turn-and-action-economy.md)** — its **neutral cards** do not exist. The visual
  distinction it required between Red's and Gray's cards is satisfied by the type line.

### Handed to ticket 10

Two measurements this ticket created, added to that ticket's brief:

1. **Does the stat base hold up?** Permanent deck growth is all modifiers, so the raw-stat supply is
   Good Stuff plus a fixed handful of starter cards diluted across ten floors. Measure whether a hand
   of five contains a usable stat often enough to act at floors 6–10.
2. **Is floor 10 winnable at zero Stuff?** The shape is ruled — floor 10 is the desperate scrape — but
   the bottom of ticket 22's item curve is a number, and if 0 is impossible rather than desperate, 2
   or 3 is a one-number fix.

## Amended by ticket 12's build session, 2026-08-25

**Rarity is a value axis, not a complexity axis. This reverses this ticket's central ruling on the
subject, knowingly.**

`[you, 2026-08-25]`

> **Rarity is based on card *value* above everything.** If a card is objectively more powerful, it is a
> **higher** rarity, not a lower one. The most complex cards are still always the highest rarity — but
> **a complex card has to pay for its complexity in potential value when the synergy comes together.**

So this ticket's *"Rarity's job is complexity signalling"*, its *"Rarity is a complexity signal, never
a quality one"*, and its instruction *"Do not use `Woah` to mean 'good'"* no longer hold. `Woah` means
good. It also usually means complicated, but as a consequence rather than a definition.

### What forced it

[Ticket 12](12-exemplar-card-set.md) tiered a real card set strictly on complexity and the axis
collapsed. **A card with no rules text has no complexity**, so every vanilla card came out `Fine`
however strong it was — `Cutting Torch` at `Power 5` wearing the same border as `Shove` at `Power 1`,
and two-thirds of the set bunched into one tier. Since this ticket also ruled that **Stuff carries the
bulk of the raw stats**, and Stuff is mostly vanilla numbers, the complexity axis could not
differentiate the most load-bearing card category in the game at all.

**This ticket was already in contradiction with itself on exactly this point**, and the reversal
resolves it in favour of the second line: it forbade quality-signalling, then justified Good Stuff
carrying rarity on the grounds that *"a `Woah` Stuff should be an exciting flip"* — which is quality.

### What survives

**The protection this ticket actually wanted is intact.** Its reason for complexity-gating was that a
player should be able to decline nested conditionals *before* taking them. The implication that
delivers that runs one way and still holds: **every complex card is high rarity**, because complexity
must be paid for in value. A player who declines `Woah` still avoids every hard read in the game. What
they give up is that they now also decline some simple bombs — which is a real cost, and it is the
price of the reversal.

**Starter cards are all `Fine`** — unchanged, and now for a reason rather than by fiat: starters are
weak.

**Rarity is still purely printed and touches no rules**, and **Bad Stuff still has no tier**. Under a
value axis that second one is more coherent than it was, not less.

**[Ticket 09](09-card-acquisition-and-deckbuilding.md)'s concern is untouched.** Rarity signalling
value does **not** make it an escalation dial, because **the pool stays flat**: every tier is equally
likely at every floor, so a floor-2 reward can be a `Woah` and a floor-9 reward can be `Fine`. Nothing
about floor number touches the reward pool. Escalation stays on ticket 22's single dial. What 09
banned and this preserves is a *curve*, not a *tier*.

**[Ticket 15](15-damage-as-thinning-rubber-band.md) is not reopened, and item 6a stays void.** Card
quality is legible again, but 6a wanted legible quality *so a player could cull their weakest cards
under fire*. There is still no culling. Quality now pays for itself at **acquisition** — knowing what a
reward is worth as you take it — not in deck management.

### Value means ceiling, not rate

`[proposed by agent → you approved, 2026-08-25]` The two come apart in the exemplar set: `Pry Bar`
gives 3 stats for one card while `Cutting Torch` gives 5 for two, so `Pry Bar` is the more *efficient*
card and `Cutting Torch` the bigger one. **Rarity tracks the ceiling** — what the card can do for you
when things line up — because a five-card hand cap means one big number clears thresholds that two
good ones cannot reach.

**A consequence worth stating, since it will come up every time a card is tiered:** a card can be both
common-feeling and high rarity. Efficiency is not what the border reports, so a cheap, repeatable,
grindingly good card may sit at `Fine` while a swingy one-shot sits at `Woah`.

## Amended by ticket 22, 2026-08-25 — the Stuff room has a threshold line

`[you, ticket 22]` **A Stuff room prints a threshold: pay stats or leave empty-handed**, set below
what Hazard and Enemy rooms ask. No punishment and no Flee line — failing costs you the Stuff only.

This contradicts this ticket's *"no punishment and nothing to defeat: the 'room' reading is empty"*,
which is what justified **"a Stuff room simply is the Stuff card ... it carries no threshold line."**
The room reading is no longer empty.

**The anatomy question this reopens, and it is this ticket's:** where the threshold prints. Either
the Stuff card carries a threshold line **read only in the room zone and ignored in hand** — which is
this ticket's existing two-context reading extended by one field, and the agent's recommendation — or
Stuff rooms become separate cards and the Stuff pool roughly doubles. Recorded as
[ticket 22](22-floor-deck-composition.md)'s open consequence 1, **unruled**.

[Ticket 12](12-exemplar-card-set.md)'s finding 1 already established that this card reads differently
in the room zone than in hand, so the precedent exists either way.
