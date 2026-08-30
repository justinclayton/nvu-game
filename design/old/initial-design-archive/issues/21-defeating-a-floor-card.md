# 21 — Decide what defeating a floor card takes, and what failing it costs

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

Ticket 18 settled the loop: flip a floor card, try to defeat it, exhaust it on success or take a
consequence and discard it on failure. It did not settle what any of those verbs mean. This ticket
owns the single interaction the whole encounter is made of.

Decide:

1. **The defeat check.** What does the player do with their cards to beat a floor card? Meet a
   printed number, match a type or symbol, satisfy a small set of requirements, or something else.
   State it tightly enough to play.
2. **Is it all-or-nothing?** Ticket 18's rules are binary — defeated or not. Decide whether partial
   progress exists at all, and if it does, where it is recorded. Note the map's **minimise play
   zones** philosophy: a damage track on a floor card is exactly the sort of thing this project
   would rather express with cards it already has.
3. **Does a card remember?** If a floor card goes to the discard pile after a failed attempt, is it
   met fresh next time or does it carry something with it? This is the descendant of the old *does
   damage to the enemy persist when you break off* question, and it is just as load-bearing: it is
   the difference between *chip it down over several passes* and *you must beat it outright, one
   attempt at a time.*
4. **The negative consequence.** What failing costs. Whether it is printed on each floor card, a
   single general rule, or both. Under ticket 04 the natural currency is *exhaust X cards from your
   deck* — unchosen loss, off the top — but say so explicitly rather than assuming it.
5. **Can you decline to fight?** A player who can see they cannot beat the flipped card may want to
   take the consequence deliberately rather than spend into a loss. Decide whether that is a legal
   move, a free one, or the same thing as failing.
6. **The reward.** Ticket 18 says a defeated card *may* give a reward. Decide what kind — cards,
   stamina back, something removed from the deck — how often a floor card carries one, and how it
   sits against ticket 05's card reward on ascending without making floors a second deckbuilding
   step.
7. **Does a floor card do anything other than present a defeat condition?** Whether it can act on a
   later turn, change the next flip, or stay in play once met. The flip is currently free — an enemy
   that has to be *run* costs upkeep every turn it exists, and physical games get slow exactly here.
   Ticket 06's *something acts on you every turn* is already satisfied by the flip alone, so anything
   added here is on top of a bar that is already cleared, and needs its own reason. `[from ticket 08]`
8. **Who fights.** Both characters act against the same flipped card each turn, under ticket 03's
   strict alternating turns. Decide whether defeating it is a joint effort, whether one character
   can carry it alone, and who eats the consequence when it is not defeated.

## Must satisfy

- The encounter loop settled in [ticket 18](18-floor-encounter-decisions.md).
- The resource model settled in [ticket 04](04-deck-as-energy-and-hp-model.md) — costs come from
  hand, unchosen damage comes off the deck, nothing returns during a floor.
- Ticket 06's pressure constraints. **Something must act on the player every turn** is now carried
  by the flipped card itself, so this ticket owns whether that is enough.
- The map's **minimise play zones** philosophy. The floor deck has already added a draw pile, a
  discard pile, and an exhaust pile to the table. Adding anything further needs a stated reason.
- **Ticket 07's upkeep budget**, at every point on the escalation curve — inherited with item 7 from
  ticket 08, which was closed into this ticket and ticket 22.

## Notes for the session

- This and [ticket 22](22-floor-deck-composition.md) are **siblings**, not a sequence — what a card
  takes to beat and what mix of cards a deck holds are the same tuning question seen from two sides.
  Whichever resolves second must check itself against the first and record the check.
- Beware a defeat check that is really an arithmetic exercise. The pillar is *reacting to what is in
  front of you*, and a turn spent totalling numbers is a turn spent not scrambling.

## Provenance

`[proposed by agent → you approved, 2026-08-23]` Created to hold the questions
[ticket 18](18-floor-encounter-decisions.md) explicitly left open when the floor-deck decision landed.

## Answer

Resolved by grilling session, 2026-08-23. **A floor deck is a deck of rooms.** Rooms came back — not
as geography, but as cards met in the order the shuffle chose.

### The room

`[you]` Every floor card is a **room**, and there are three kinds at level 1:

- **Combat room** — holds an enemy. Its challenge is **`Power X`**, a single stat standing in for
  combined attack and health.
- **Hazard room** — no enemy, but something to get through. Its challenge is **`Scramble X`**:
  running, not falling, not braining yourself on a pipe.
- **Item room** — holds an item you can take. The card is **both things at once**: it is the room
  while it sits in the active room zone, and it is the item itself once it is in a player's hand.

More stat keywords are expected. `Power` and `Scramble` are what level 1 needs to find out whether
any of this works.

### Clearing a room

`[proposed by agent → you approved]` A room prints a **named threshold** rather than a bare number,
so the question at every flip is *do we have the right thing right now*, not *do we have enough*. A
bare number would make every card in a deck interchangeable fuel and turn each turn into addition.

`[you]` **A card's cost and its stats are separate and unrelated numbers.** To play a card you
Exhaust cards from your hand equal to its cost, then place it face up in the **play zone**, where its
stats join a **shared pool** for the turn. Red's `Power 2` beside Gray's `Power 1, Scramble 2` gives
the team 3 Power and 2 Scramble to spend against the room. Both characters' contributions **pool**.

Keeping cost and stats apart is what buys room for stats that are not simple printed numbers —
*"Power equal to twice the number of cards Gray plays this turn"* — and that is where build synergy
is expected to come from.

`[you]` **Most cards carry one stat.** Multi-stat cards exist, are naturally more valuable, and are
costed accordingly.

`[proposed by agent → you approved]` The threshold is **checked continuously**: the instant the pool
meets it the room is **Cleared**. Excess evaporates; nothing banks between turns. **Rooms are
all-or-nothing** — there is no partial progress and a room does not remember being attacked, because
recording progress needs a marker or a damage track on the card, which is what *minimise play zones*
exists to refuse. The chip-it-down feel is carried by the reshuffle instead: a room you could not
beat comes back and you meet it with a different hand.

`[proposed by agent → you approved]` **A room may name more than one stat** — `Power 3, Scramble 2`,
both required — but **no multi-stat rooms are printed at level 1**, so the first playtest can judge
threshold numbers with only one variable moving. It is a ready-made escalation dial for
[ticket 22](22-floor-deck-composition.md).

### Failing a room

`[proposed by agent → you approved]` The cost of failure is **printed per room**, in the vocabulary
ticket 04 already has — *Exhaust X from deck* — so there is no new verb and the phrasing itself still
tells the player they had no agency. Per-room rather than a general rule because it is a second
difficulty dial: a room can be easy to beat and brutal to fail, or the reverse, and that is most of
what makes rooms feel different from each other.

`[you]` **One character absorbs the whole amount, and the team chooses which — no splitting.**
*"1 character Exhausts 3 from deck"* is the normal shape. The choice is strategic and its
consequences are unseen until the exhausted cards are turned over. A minority of rooms read *"both
characters exhaust…"*, reserved for things that should feel wide-area: blasts, toxic clouds.

`[you]` **Declining is failing without trying.** You see the room before you draw anything, so you
can take the loss without spending a card — or bail part-way through drawing when you realise you are
not getting what you need. It is not a separate action; the outcome is identical to failing.

`[proposed by agent → you approved]` **Item rooms carry no punishment by default.** Missing the item
is the loss. That gives the deck one room type that is always safe to decline, which makes declining
a real decision rather than an automatic one — you skip an item room when you are poor, and pay for
it later. The punishment line stays available for a trapped item room when ticket 22 wants one.

### Rewards

`[proposed by agent → you approved]` **Item rooms are the entire reward system at level 1.** A combat
or hazard room pays you by being gone. One reward dial means the first playtest can actually judge
the reward rate.

`[proposed by agent → you approved]` A cleared item room's item goes **to a character's hand with
`Hold`** — never into the deck. The team chooses whose hand, which lets an item be routed to whoever
its stats suit and is a cheap piece of the asymmetry [ticket 13](13-red-and-gray-asymmetry.md) wants.

**The item does not enter the deck, and this was ruled deliberately.** Under ticket 04 the deck *is*
stamina, so a card entering a deck mid-floor is **healing**, and item rooms would have been the
game's only heal. Tickets 01 and 16 found that exact shape — a card that returns resource to the pool
— break four separately published games, every failure a recursion. If a heal is ever wanted it
should be a rare, named, deliberate thing, not a side effect of picking things up.

### Rooms do nothing but sit there

`[proposed by agent → you approved]` A room has **no behaviour beyond the flip**. It does not act on
a later turn, alter the next flip, or stay in play once met. All of its pressure lives in its
threshold and its failure cost. Anything persistent has to be *run* by a human every turn it exists,
and enemy logic is where physical games get slow; ticket 06's *something acts on you every turn* is
already satisfied by the flip alone. A floor that needs more menace should get it from what is **in**
the deck — ticket 22's problem, not a rules feature.

### Vocabulary settled here

- **Cleared** `[proposed by agent → you approved]` — a room defeated and removed from the floor deck
  permanently. It is never reshuffled. ~~When every room in a floor deck is Cleared the deck cannot
  be replenished and the encounter is over.~~ **Amended by ticket 22**: the encounter now ends when
  the floor's one **combat room** is Cleared, not when every room is. *Exhaust* stays exclusively a
  character-card word.
- **Fled** `[you]` — the floor deck's discard pile. A room you failed, or declined outright, is Fled;
  the Fled pile shuffles back into the floor deck when its draw pile runs out. Chosen over *Skipped*
  because a deliberate decline is an immediate "NOPE" flee, so the word fits both routes in.
- **Draw** `[you]` — **renames `Convert`**, everywhere. Ticket 04's act of moving cards from deck to
  hand, unchanged in meaning and still the central decision of the game. The coined word was there to
  stress that the move spends stamina; the rules text can say that in a sentence, and every player
  already knows what drawing is.
- **Hold** `[you]` — **renames `Retain`**, everywhere. Ticket 04's keyword, unchanged in meaning: this
  card is not exhausted at end of turn. `[proposed by agent → you approved]` It is **printed on the
  card face**, not a property of being an item, so any card that should feel equipped or situational
  can carry it. "Item" describes where a card came from, not how it behaves.
- **Play zone** `[you]` — where played cards sit face up during a turn. `[proposed by agent → you
  approved]` **The stat pool is not a zone** — it is just the sum of the face-up cards on the table.
  No tracker, no tokens, no counter.

### Settled here, owned elsewhere

- **The turn's five phases** `[you]` belong to [ticket 07](07-turn-and-action-economy.md), recorded
  there: flip a room into the active room zone; both players draw simultaneously in any order, one
  card at a time, each stopping when they declare they are done; both play in any order until they
  cannot or choose to stop, Clearing the room the moment the threshold is met; cleanup takes the
  punishment if the room is still there, sends it to Fled, and **exhausts both the hand and the play
  zone**, with `Hold` cards in hand as the only exception; turn ends.
- **Strict alternating turns is out** `[you]` — see [ticket 03](03-solo-coop-or-both.md), which is
  amended. Both characters act **simultaneously and collaboratively**, either of them acting in any
  order, and choosing that sequencing — whether Red draws out fully before Gray, or they alternate,
  or they change it mid-turn — is itself part of the collaborative strategy.
- **Ticket 04 refined, not contradicted:** a played card is exhausted at **cleanup** along with the
  rest of the play zone, rather than immediately on play. Its cost is still Exhausted from hand at the
  moment it is played.

### Two findings logged against this design

- **The play phase is close to pure execution.** Cleanup exhausts the hand anyway, so a card not
  played was lost regardless, and cards spent paying a cost were about to die — playing everything
  legal is very nearly always right. `[you]` **Accepted deliberately**: the tension belongs in the
  draw phase, and *"the resolution is satisfying"* is its own reason. What keeps it from being empty
  is `Hold` — a held item makes every turn ask *is this the room I break it out for*. **Flagged to
  [ticket 20](20-encounter-tabletop-prototype.md)**, whose first question is whether the correct move
  announces itself. The surgical fix, if a table says it needs one, is paying costs from the deck
  rather than the hand.
- **Quarterbacking.** With open information and simultaneous play, one player can simply run both
  hands. `[you]` Logged as a known cost, not designed against — it is a playtest finding, and ticket
  20 should watch for it.

### Amended by ticket 22, 2026-08-24

Three of this ticket's rulings changed once [ticket 22](22-floor-deck-composition.md) made a
floor's single combat room, rather than the whole deck, the win condition.

- **The win condition.** `[you]` A floor deck now holds exactly one combat room, and clearing it
  ends the floor. The **Cleared** entry above, which said the encounter ends when every room is
  Cleared, no longer holds — hazard and item rooms are resources on the way to the fight, never
  mandatory to clear.
- **Combat rooms always carry a punishment**, printed on the card as its **Flee cost**. `[you]`
  Not a new mechanic — the same *Exhaust X from deck* punishment this ticket already defined,
  guaranteed present (never `none`) for this one room kind, and named for its diegetic reading:
  failing or declining a combat room is fleeing it, with a few scrapes to show. It is why the first
  encounter with a floor's combat room is expected to end in flight — the players see it, cannot
  meet its `Power` yet, and pay the Flee cost rather than lose for nothing.
- **Item rooms lost their challenge entirely.** `[you]` They print no threshold at all — the item
  is guaranteed the moment the room is flipped. The turn still runs its full shape (flip, draw,
  play, cleanup), so the mandatory draw still costs stamina; the room is guaranteed, not free.
  There is nothing left to decline once one is flipped — only whose hand the item goes to.
- **Hazard rooms gained a second, higher threshold.** `[you]` The lower threshold clears the room
  and lets the players move on with no reward; a higher threshold on the same room clears it *and*
  pays a permanent card reward — the same reward ticket 05 defined for ascending, now also
  reachable mid-floor. **Which threshold is reached locks in when the players declare the play
  phase done**, not the instant either is first met — checking continuously would punish playing a
  strong card early, locking a team into the low tier by accident.
- **Hazard rooms, not item rooms, are now the source of permanent card rewards within a floor.**
  Item rooms remain the source of Hold items to hand. The "item rooms are the entire reward system
  at level 1" line under *Rewards* above is superseded by this split.

### Sibling check

Ticket 21 resolved before [ticket 22](22-floor-deck-composition.md), so 22 owes the reconciliation.
What 22 inherits: three room types to build a deck from, one reward-bearing type, two escalation
dials this ticket deliberately left it (multi-stat rooms, and failure cost tuned independently of
threshold), and no room behaviour to budget upkeep for.

### Amended by ticket 09, 2026-08-24

[Ticket 09](09-card-acquisition-and-deckbuilding.md) needed a word for a bad card and, in finding
one, reorganised this ticket's item rules. Three changes:

- **`Item` is renamed `Stuff`.** `[you]` Everywhere this ticket says *item*, read *Stuff* — a word
  that covers a powerful tool, a piece of useless junk, and a faceful of slime alike. It is a mass
  noun: *"I have three Stuff."* The room is still called an **`Item room`** for now, but that name
  is explicitly provisional and a better one is owed.
- **Stuff splits into Good Stuff and Bad Stuff, by where it comes from.** `[you]` **Good Stuff**
  lives in the floor deck and is what an Item room hands you — so an Item room is never a
  disappointment. **Bad Stuff** lives in a pool *outside* the floor deck and reaches a player only
  as a room's printed punishment. Bad Stuff never appears as the contents of an Item room. The names
  are a loose description of the split, not printed keywords.
- **A room's punishment may hand out Bad Stuff instead of exhausting cards.** `[you]` This slots
  into the existing per-room punishment slot with no new rule — some rooms cost you stamina, some
  leave you carrying something. Bad Stuff behaves exactly like any other piece of Stuff: it has
  `Hold`, it is playable (which is how you get rid of it), and it is ordinary fuel. Its only
  structural difference is that it contributes **no stats** toward a challenge. Per-card printed
  text may restrict a particular piece further, including forbidding its use as fuel.

Unchanged by this amendment: what Clearing a room takes, what failing it costs in stamina, the
all-or-nothing threshold rule, and the Fled reshuffle.

## Amended by ticket 11, 2026-08-25

Two corrections from [ticket 11](11-card-anatomy.md), neither reopening anything decided here.

**The punishment and the Flee cost are one field.** `[you, ticket 11]` This ticket called it a
*punishment* and ticket 22 later added a *Flee cost* to combat rooms; they were always the same
concept. A room card prints it once, as its **Flee line**.

**"The deck's one always-safe decline" is now misleading.** This ticket described item rooms that way,
and at the time it was true. Ticket 11 ruled that **Stuff supplies the bulk of the raw stats**, so a
Stuff room is not a bonus — it is the supply line, and declining one is almost never correct. The
*rule* is unchanged (a Stuff room still carries no punishment); what changed is that skipping it is
now a real cost paid later.

**Renames**, from ticket 11's ruling that the word printed on a card is canonical: **combat room →
Enemy room**, **item room → Stuff room**. A Stuff room has nothing to defeat, so the "one card, two
readings" problem this ticket flagged as ticket 11's hardest is gone — the card simply *is* the Stuff
card.

## Amended by ticket 22, 2026-08-25 — Stuff rooms get a threshold after all

`[you, ticket 22]` **A Stuff room prints a threshold: pay stats or leave empty-handed.** It is the
**lowest threshold in the deck**, below what Hazard and Enemy rooms ask.

This reverses this ticket's *"Item rooms lost their challenge entirely — they print no threshold at
all"*, and retires the phrase this ticket already flagged as misleading, *"the deck's one always-safe
decline"*. The room still carries **no punishment and no Flee line**: failing costs you the Stuff,
not stamina, and the room is Cleared either way.

**What it does to this ticket's "one card, two readings" resolution:** a Stuff room now *does* have
something to defeat, so the reasoning that collapsed the room card into the Stuff card no longer
holds on its own terms. Whether the one-card form survives is
[ticket 22](22-floor-deck-composition.md)'s open consequence 1, unruled — the agent's recommendation
there is that it does, with the threshold line read only while the card is in the room zone.

Full ruling and its four open consequences: [ticket 22](22-floor-deck-composition.md).

## Amended by ticket 22, 2026-08-25 — the stat pool gets a per-character read

`[you, ticket 22]` **A Stuff room is its own card again and prints a split challenge**, for example
*"Power 1: Red takes 1 Good Stuff. Scramble 1: Gray takes 1 Good Stuff."* Good Stuff now lives in a
pool at the side of the table, so the room and the item are two different objects.

**This ticket's shared stat pool is no longer read only as a total.** A split line asks what **one
character's** side of the play zone adds up to, not what the table adds up to. If it read as the
shared total, one player could pay and both would be paid, which is the free-rider outcome ticket 22
declined.

**It needs no new machinery, which is why it was affordable.** This ticket already split the play zone
into **a side per character** and called the split *"bookkeeping only, so that cleanup can return each
card to the right exhaust pile without sorting."* That physical structure is exactly what a
per-character read needs. What changes is only that the split now **carries rules weight** rather than
being a tidiness convention. Worth noting because this ticket wrote the line the other way round on
purpose.

**Also retired here:** this ticket's *"a Stuff room has nothing to defeat"*, and the phrase it already
flagged as misleading, *"the deck's one always-safe decline."* A Stuff room has a challenge, is
**Cleared whether or not you meet it**, carries **no punishment and no Flee line**, and can never go
to Fled.

Full ruling, and the three costs it leaves unruled: [ticket 22](22-floor-deck-composition.md).

## Amended by ticket 24, 2026-08-27 — an item may enter the deck after all

`[you]` **"An item never enters the deck" is superseded.** Two routes now put Stuff in a deck:
**Stuff still in hand** when the floor is cleared is shuffled in, and the **Scrap tax** can keep a
piece there permanently. The reason this ticket ruled it out — a card entering the deck is a heal, and
a heal is the recursion that broke four games in tickets 01 and 16 — is **not answered, it is
accepted**, on the per-mechanic footing ticket 09 gave the mid-floor reward.

**Bad Stuff gains its intended use.** A card may print *"Scrap a card from your hand to [X]"*, so junk
that contributes no stats becomes fuel for an outsized payoff. Clearing a clogged hand and hitting hard
are the same action. See [ticket 24](24-the-scrap-mechanic.md).
