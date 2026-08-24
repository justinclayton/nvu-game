# 09 — Design the card acquisition and deckbuilding model

Type: grilling
Status: resolved
Blocked by: 04
Map: [core design map](../map.md)

## Question

How does the deck grow during a run? This is the "deckbuilding" half of "deckbuilding roguelite",
and it collides directly with ticket 04's resource model.

Decide:

1. **The source.** Ticket 05 settled the **card reward on clearing a floor**, and ticket 18 settled
   that a defeated **floor card may pay a reward**. Decide whether those are the only two sources —
   whether a market exists, and whether the pitch's *"find items that help grow their deck's
   abilities"* has any home left now that there are no rooms to find things in.
2. **The cost.** Is acquisition free (a reward) or paid (a purchase)? If paid, paid with what —
   and if the currency is cards, this is the same resource as energy and HP, which makes every
   purchase a self-harm decision. Rule on whether that is the design.
3. **The HP collision.** Under ticket 04, if the deck is health, then acquiring cards *heals* you
   and a lean deck is a *fragile* deck. This inverts the standard deckbuilding instinct. Confirm
   how ticket 04 resolved this and state the acquisition rules that follow from it.
4. **Where new cards go.** Into the discard, on top of the deck, into hand, into a separate zone.
   Under a deck-as-resource model this choice has real teeth.
5. **Thinning.** Whether cards can be removed, trashed, or upgraded, and what that costs. **Read
   ticket 15 before answering this** — thinning is the hinge of this design, and it pulls two ways
   at once. In the CCG, where the deck was the life total, thinning was self-harm and never became
   a strategy. In a deckbuilder, thinning is one of the strongest strategies there is, because a
   small deck cycles fast and concentrates its best cards into the chains players build decks to
   find. This game contains both pressures simultaneously. Ticket 15 explores whether that
   collision becomes the engine — damage as a *cull* the player steers. Whatever it concludes, this
   ticket decides whether **voluntary** thinning is also available, and at what price, alongside
   the involuntary kind.
   - Related, from the same source: **any card that returns cards to the resource pool is a healing
     card and a refuelling card at the same time.** Whatever ticket 04 settled as the recursion
     guard rail applies to every acquirable card this ticket lets into the game.
6. **Persistence.** Whether the deck resets between floors, and whether anything survives a run.
   (The between-runs half of this stays in the fog under meta-progression.)
7. **Deck size.** Starting deck size and shape, and whether there is a ceiling.

## Settled upstream by ticket 05 — do not relitigate

- **Sub-question 1 is largely answered.** `[you]` The source is **per-floor rewards on clearing a
  floor**, Slay the Spire style: a choice between several cards, added permanently to the deck. No
  market. The run's deckbuilding arc is ten of these decisions and nothing else.
- **Sub-question 2:** acquisition is a **reward, not a purchase**. Nothing is paid.
- `[proposed by agent → you approved]` **Declining a reward is always allowed.** Under ticket 04's
  inversion, skipping a card preserves consistency, so "no thanks" is a real play. The player
  therefore sets their own final deck size — this ticket owns starting deck size and shape, but the
  ceiling is the player's, not the designer's.
- **Sub-question 5's voluntary half is constrained, not closed.** `[you]` Removal is **not** ruled out,
  but it is **never a default** — if implemented at all it must be rare and special. Note that
  declining rewards already provides thinning-by-omission at zero component cost, so a removal
  mechanism has to justify itself against that, and against the map's **minimise play zones**
  philosophy.
- **In-floor pickups are not deckbuilding.** `[you]` The principle stands even though its mechanism
  changed: anything a floor hands you mid-encounter is **temporary and gone on ascending** — it never
  enters the deck — so the deck stays a pure product of the ten reward decisions. What is gone is
  *scavenging* as the way you got such a thing; whether a defeated floor card pays one instead is
  [ticket 21](21-defeating-a-floor-card.md) item 6. A future exception may let *some* items be carried
  onward; it is explicitly not the default, and it would be this ticket's to design.
- **Sub-question 6:** the deck does not reset between floors — acquired cards are permanent for the
  run. Between-runs persistence stays in the fog.
- **A vocabulary warning.** Slay the Spire's *Status* was reached for as shorthand for the temporary
  in-floor item, but Status cards there are junk-as-punishment — the same lifecycle, opposite valence.
  Do not import the word. This game will probably want both ideas and they need distinct names.
  Relatedly, **Curse** is a live placeholder (ticket 05) for a card that follows you between floors as
  a penalty; its name is provisional and a thematic replacement is owed before the spec locks.

## Must satisfy

- The resource model settled in ticket 04.
- Ticket 06's pressure constraints — **there is no filter**; 06 rejected the one-liner it was asked
  for. Shopping is the classic place where a frantic game goes quiet, so argue this one explicitly
  against 06's rulings and record the check.

## Settled upstream by ticket 04 — do not relitigate

- **The inversion is the design** `[you]`. No rule will be added to let players thin safely.
- **Sub-question 3 is answered.** Because the deck does not recycle during a floor, the trade falls
  out of the structure with no keyword: **a card you add is +1 floor-time and −1 consistency.** It
  makes you able to stay on the floor longer, and it makes you worse, because you get exactly one
  pass through your deck and every mediocre card appears instead of the one you needed. This is the
  answer to "what makes adding a card ever feel costly" — it needs nothing invented.
- **Sub-question 4 is constrained.** There is no discard pile. A new card goes into the deck, on top
  of it, into hand, or into exhaust — and "into exhaust" now means *unavailable until the floor is
  cleared*, which is a real cost worth using deliberately.
- **Sub-question 5's involuntary half is settled by ticket 15**, which resolved against the cull:
  damage is random, off the top, pure loss. This ticket still decides whether **voluntary** thinning
  exists and at what price.
- **Sub-question 6 is partly settled**: the exhaust pile returns to the deck when a floor is cleared.
  What persists between *runs* remains in the fog.
- **The recursion guard rail is: there isn't one** `[you]`. Balance is handled per-mechanic. Any card
  this ticket lets in that returns cards from exhaust is a heal, a refuel, and a floor-clock
  extension simultaneously — judge each on its own merits, and see ticket 04's recorded dissent.

## Answer

Resolved by grilling session, 2026-08-24. Most of this ticket's sub-questions were already settled
upstream. What follows decides the four that were genuinely open — where a new card goes, voluntary
thinning, starting deck size and shape, and the mid-floor reward ticket 22 created — and then spends
most of its length on something the ticket did not anticipate: **the design needed a word for a bad
card, and finding it reorganised how items work.**

### 1. The sources

`[you]` **Permanent card rewards are per-character, from per-character pools.** On ascending, Red
chooses one of three cards drawn from a Red reward pool, and Gray chooses one of three from a Gray
pool. Both choices happen; they are not one shared decision. This is Slay the Spire: the Board
Game's shape, and the reason for it is synergy — a character can only build toward something if the
cards they are offered are theirs.

`[proposed by agent → you approved]` **Three cards offered, from a flat pool, with no rarity tiers
and no escalation by floor.** Ticket 22 put escalation on a single dial — Stuff scarcity — and
deliberately declined to make the fight harder; a second escalation axis here would reopen what 22
just closed. A flat pool also makes a run's arc *the synergy you assembled* rather than *the rarity
you were handed*, which is where ticket 21 said build synergy lives. This leans on ticket 11 giving
cards enough interaction that a flat pool stays interesting for ten floors.

`[you]` **The mid-floor reward is a reveal, not a choice of three.** A hazard room's high threshold
(ticket 22's amendment to ticket 21) turns the top card of a reward pool face up. The decision is
only *take it or skip it*. The tension is real without being a shopping trip: the card is useful
stamina in the moment even when it is wrong for the build you are aiming at, and seeing it early is
itself a source of inspiration for what build to aim at in the first place.

`[you]` **Which pool a hazard reveals from is printed on the hazard card, not fixed by rule.** A
hazard may call for one character to reveal or for both. The exemplar set starts with a single
standard line — *"One character reveals reward. You may add it to the top of your deck or skip
it."* — and variations are a balance-time tool rather than a rule to remember.

**The ticket 06 check, argued explicitly as the ticket demanded.** Shopping is the classic place a
frantic game goes quiet, and ticket 22 put a reward moment *inside* the encounter. It survives 06
because it is not shopping: there is nothing to compare, nothing to lay out, and no zone to manage —
one card turns over and the answer is yes or no. The considered deckbuilding decision stays where
the game is already stopped, at the ascend. The two reward sources therefore feel genuinely
different, which is a gain rather than a compromise: one is *what am I building*, the other is *I
grabbed something on the way past.*

### 2. The cost

Settled upstream and unchanged: acquisition is a reward. Nothing is paid, there is no market, and
declining is always allowed.

### 3. The HP collision

Settled upstream by ticket 04 and unchanged: the inversion is the design. A card you add is +1
floor-time and −1 consistency.

### 4. Where a new card goes

`[proposed by agent → you approved]` **The ascend reward goes into the deck, before the shuffle.**
The exhaust pile has just returned and the deck is about to be shuffled anyway, so the question is
nearly moot at this point in the turn order.

`[proposed by agent → you approved]` **The mid-floor reward goes on top of the deck, face down.**
This is the only option that respects ticket 04's ban on shuffling during a floor while still paying
out immediately — you will draw it this floor, probably next turn. Into hand was rejected because it
collides with `Hold` and makes a permanent card look like a piece of Stuff.

**The recursion judgement, recorded rather than left implicit.** A card placed on top of your deck
mid-encounter **is +1 stamina, immediately**. This is the first mechanic that has to be judged under
ticket 04's ruling that there is no structural recursion guard rail and balance is handled
per-mechanic. `[proposed by agent → you approved]` **It is accepted.** The source is finite — three
hazard rooms a floor, and only at the harder of two thresholds — so it cannot spiral in the way
tickets 01 and 16 found breaking four published games, and each use permanently worsens the
consistency of the deck it heals. Sending the card to the bottom of the deck instead would defuse it
completely, but would also remove the *useful stamina right now versus wrong for my build* tension
that is the entire reason the choice is interesting.

### 5. Thinning

`[proposed by agent → you approved]` **There is no voluntary thinning in the core spec.** It would
have to beat three things at once and does not beat any of them: declining a reward already thins by
omission at zero component cost; a trash pile is a new zone, which the map's *minimise play zones*
rule taxes; and under deck-as-stamina, voluntary removal is **self-damage that makes you better** —
precisely the Undaunted failure ticket 16 observed in the wild, where a published strategy guide
recommends baiting casualties as free deck-thinning. Ticket 05's constraint that removal be *rare
and special if it exists at all* is honoured by not building it. If it returns later it belongs to a
card, not to a rule.

The involuntary half stays as ticket 15 left it: damage is random, off the top, pure loss.

### 6. Persistence

Settled upstream and unchanged: acquired cards are permanent for the run; the deck does not reset
between floors; between-runs persistence stays in the fog under meta-progression.

`[you]` **The carry-onward exception is closed as a rule and opened as card space.** Nothing in the
rules carries a piece of Stuff past ascending — Stuff is removed between floors, and permanent card
rewards *are* the persistence. What stays live is the possibility of designing a card that reads
something like *"if you are holding this when you clear a floor, keep up to 2 Stuff for the next
floor."* That is ticket 11's to build or not; it is no longer fog on the map.

### 7. Deck size and shape

`[proposed by agent → you approved]` **Shape is decided here; the number is not.** Each character
starts with their own deck and **the two are allowed to differ** — ticket 13 owns whether and how,
but it no longer gets to rule that they are identical, because per-character reward pools (item 1)
already commit the design to card-level asymmetry.

**12–15 cards each is provisional and explicitly owned by ticket 10.** Starting deck size is the
same kind of number as ticket 22's untuned `Power` requirement: it cannot be picked honestly before
ticket 11 says what a card does and ticket 10 can simulate a floor. Writing a firm number here would
be false precision.

`[proposed by agent → you approved]` **There is no deck-size ceiling.** Ticket 05 already made the
final deck size the player's, through declining.

### Deck growth, and the charge to ticket 10

`[proposed by agent → you approved]` **No cap on how much a deck can grow, and no rule limiting
mid-floor rewards.** The arithmetic is worth writing down plainly: three hazard rooms per floor,
each able to pay a permanent card, plus one at every ascend, is up to forty cards added to a 12–15
card deck over ten floors. `[you]` The math may well not be that bad in practice, and there are
mitigations available if it is.

The design's answer is that **the inversion is the governor** — a deck that big never gets one clean
pass, so greed is supposed to punish itself without a rule saying so. That claim is exactly what
ticket 04 asserts and nothing has yet tested. **Ticket 10 is therefore charged with it directly:
simulate deck growth across ten floors and report whether the inversion actually punishes greed, or
whether a cap is needed after all.** If the inversion cannot govern this, it is weaker than ticket
04 claims and the map should know.

### Stuff — the vocabulary this ticket had to invent

The ticket's *vocabulary warning* predicted this: the game wants both a temporary helpful thing and
a temporary harmful thing, and Slay the Spire's `Status` could not be borrowed for either. Working
out what a bad card actually *is* under deck-as-stamina reorganised items entirely.

**The constraint that forced it.** A bad card cannot go in your deck, because the deck is stamina —
junk in the deck is a punishment that heals you. It has to live somewhere that costs you without
feeding you.

`[you]` **`Item` is renamed `Stuff`**, a word that covers a powerful tool, a piece of useless junk,
and a faceful of slime without straining. It is a mass noun and the grammar is loose on purpose —
*"I have three Stuff"* is funny, and reads fine at a table.

`[you]` **Stuff comes from two separate pools, and the separation is the design.**

- **Good Stuff** lives in the floor deck, reached through Stuff rooms. Ticket 22 made Stuff rooms
  the deck's one always-safe flip, and keeping punishments out of that pool means **a Stuff room is
  never a disappointment** — what you find is always worth finding.
- **Bad Stuff** lives in a pool *outside* the floor deck, and is handed to you by a room's printed
  punishment. It never appears as the contents of a Stuff room.

`Good Stuff` and `Bad Stuff` are loose names for the split rather than printed keywords.

`[you]` **Bad Stuff behaves like any other piece of Stuff.** It has `Hold`, so it sits in your hand
and does not clear at cleanup; it is **playable**, which is the printed way out of it; and it is
**ordinary fuel** — it can be Exhausted from hand to pay another card's cost like anything else. Its
only structural difference is that it contributes **no stats** toward clearing a room. The
punishment is a real one: an effective reduction in hand size that you must pay to undo, and a card
strictly worse than the one that could have been in that slot.

`[you]` **There is no keyword for it.** Bad Stuff is a design concept, not a rule — it needs no
mechanical marking because it behaves like everything else in its category. `Drag` was considered as
a type name and is recorded here only as a **provisional label for the concept**, not adopted; a
better name may replace it.

`[you]` **Per-card printed text can restrict it further**, including forbidding its use as fuel.
This keeps the whole mechanism inside the pattern the rest of the design follows — no new rules,
only printing — and lets a particularly nasty piece of Bad Stuff exist without a general rule making
all of it nasty.

`[you]` **How common Bad Stuff is, is a balancing decision**, not a structural one.

### `Curse` is retired

`[proposed by agent → you approved]` Ticket 05's `Curse` placeholder — a card that follows you
between floors as a penalty — is **dropped from the core spec**, and the naming debt it carried is
discharged by deletion rather than by inventing a word. Ascending is the full heal and the clean
slate; a mechanic that punches a hole in that needs to earn it, and Bad Stuff covers the same design
need entirely within a floor. **Nothing bad crosses a floor boundary.**

### Handed down, not decided here

- **Ticket 07 — maximum hand size.** There is currently no hand limit anywhere in the design;
  ticket 04 makes *how many to draw* the central decision and leaves it unbounded. `[you]` **A
  maximum hand size of 5 is recommended to ticket 07, which owns the decision.** The reason
  originates here: Bad Stuff only bites when hand space is scarce, and `Hold` is only a cost when
  holding something means not holding something else. Ticket 07 inherits a live argument for a
  limit rather than having to invent one cold, and should weigh it against the draw decision, not
  against junk alone.
- **Ticket 11 — card-level asymmetry is now committed.** Per-character reward pools mean Red's cards
  and Gray's cards are different cards. Ticket 13 owns *how* they differ; it no longer owns
  *whether*. Ticket 11 also inherits the carry-Stuff-onward card described in item 6.
- **Ticket 12 — reward pool sizing.** `[you]` The pools must be large enough that a card sent to the
  bottom is **essentially never seen again in that run**. Exact counts belong with the exemplar set,
  alongside ticket 22's floor-deck pool numbers.
- **A naming debt.** `[you]` **`Item room` is provisional.** It survives the rename only because
  nothing better was on the table; a good name for it probably involves neither `Stuff` nor `Item`.
  `Cache` and `Stash` are starting points, not decisions.

### Amendments owed to other tickets

Recorded in full on those tickets:

- **[Ticket 21](21-defeating-a-floor-card.md)** — the `Item` → `Stuff` rename, the Good/Bad Stuff
  split, and Bad Stuff as a printed punishment drawn from a pool outside the floor deck.
- **[Ticket 22](22-floor-deck-composition.md)** — the same rename through its composition table, and
  its pool policy extended: reward pools are now **two, one per character**, in addition to the
  three room pools.

### Sibling check

This ticket inherited a mid-floor reward from ticket 22 that ticket 22 created but did not specify,
and specified it rather than layering on top of it. It retracted one of its own rulings mid-session
(that Bad Stuff could be printed as any room's alternative punishment) once it became clear that
fuel-capable junk in a punishment slot would be a punishment that helps you — the separation into
two pools is what resolved it. It reopened no settled ticket, and where it touched ticket 21 and 22
it did so as explicit amendments rather than silent contradiction.
