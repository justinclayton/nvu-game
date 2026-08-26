# 07 — Define the turn and action economy within a floor

Type: grilling
Status: resolved
Blocked by: 03, 04, 06, 18, 21
Map: [core design map](../map.md)

## Question

What does a player actually *do*, in order, from the moment a floor begins to the moment it ends?

Decide:

1. **Phase sequence.** The literal ordered steps of a turn, stated tightly enough that someone
   could follow them without asking a question.
2. **Hand size** — starting, maximum, and whether it changes during a floor.
3. **Draw** — when it happens, how much, and what it costs under ticket 04's model.
4. **Actions per turn.** How many, and whether actions are a distinct currency from energy or the
   same thing.
5. **What ends a turn**, and in a multiplayer configuration, what the other players are doing
   while one player acts.
6. ~~**What ends a floor.**~~ **Struck by ticket 18.** `[you]` A floor ends when the floor deck has
   been exhausted. What remains here is only where the **flip** sits in the phase order relative to
   drawing — ticket 18 says the card is flipped at the **start of the turn**, before the draw
   phase, so the players always see what they face before they spend. Fit that in and do not move it.
7. **Interrupts and reactions.** Whether a player can act outside their own turn. This is a major
   lever on the frantic pillar and on downtime.
8. **Upkeep.** The physical actions a human performs each turn: shuffling, flipping, sliding
   cards between piles, tracking counters. Count them honestly.

## Settled upstream — do not relitigate

From ticket 03, **as amended by ticket 21**: ~~strict alternating turns~~ — **both characters act
simultaneously, either of them in any order.** **Fully open information.** Two
characters always in play, each with their own deck and health pool, controlled by one player each
in co-op and both by one player solo. A character at zero is **down, not dead**.

What remains open here is everything *inside* a turn, plus: whether the alternation is fixed
Red-then-Gray or the party chooses who leads each round; what happens to the sequence when one
character is down; and whether a full round is Red+Gray or something finer.

## Must satisfy

- The player-count model settled in ticket 03.
- The resource model settled in ticket 04.
- The floor structure settled in ticket 05, **as amended by ticket 18** — a floor is a deck played
  against, not a plan moved around on.
- The encounter loop settled in [ticket 18](18-floor-encounter-decisions.md), and the defeat check
  settled in [ticket 21](21-defeating-a-floor-card.md). The turn's shape is now largely fixed by
  them: flip, draw, try to beat the card, resolve. This ticket owns what happens inside that.
- The pressure constraints from ticket 06 (*Decide what creates the frantic, in-over-your-head
  pressure*) — **there is no filter**. 06 rejected the one-liner it was asked for, so hold the turn
  structure up against its rulings by argument, and record the check.
- There is **no filter from ticket 18 and no topology from ticket 19** — 18 resolved on a structural
  ruling and wrote no filter, and 19 was abandoned with the spatial floor. The phases designed here
  must still be the phases in which real choices get made; a phase sequence that wraps no decisions
  has failed, however tidy it is. Record the check by argument.

## Overlap to watch

Item 6 (*what ends a floor*) overlaps ticket 05's run structure and ticket 18's engagement rules.
If either has already settled it, adopt rather than re-decide, and say which ticket owns it.

## Notes for the session

- This is the ticket most likely to reveal that an upstream decision does not work. If it does,
  say so and reopen the upstream ticket rather than patching around it here.

## Settled upstream by ticket 21 — the five phases

`[you, 2026-08-23]` The grilling session on [ticket 21](21-defeating-a-floor-card.md) settled the
turn's shape. It is recorded here because this ticket owns it:

1. **Flip.** Draw a room from the floor deck and place it face up in the **active room zone**.
2. **Draw phase.** Both players at once, in any order. A player draws one card at a time into hand,
   deciding after each whether to draw again, until they declare they are done.
3. **Play phase.** Both players in any order, until they cannot or choose to stop. Playing a card
   Exhausts cards from that player's hand equal to its **cost**, then places it face up in the
   **play zone**, where its **stats** join the shared pool. The moment the pool meets the room's
   challenge the room is **Cleared** — exhausted from the floor deck, paying any reward printed on it.
4. **Cleanup.** If the room is still there, take its punishment and send it to the **Fled** pile.
   Then exhaust every card in hand **and** in the play zone, except `Hold` cards still in hand.
5. **Turn end.**

What this leaves this ticket: **hand size** (if any), **actions per turn**, **interrupts**, the
**upkeep count**, and what happens to the sequence when one character is down. Note that item 5 of
the original question — what the other player does while one acts — is dissolved rather than
answered: they act at the same time.

**The tension is all in phase 2** `[you]`. Cleanup exhausts the hand regardless, so a card not played
was lost anyway and cards spent on costs were about to die — in the play phase, playing everything
legal is very nearly always right. This was accepted deliberately, with `Hold` as what keeps the play
phase from being empty. If a table says it needs a fix, ticket 21 logged the surgical one: pay costs
from the **deck** rather than the hand. Do not adopt it here without the human.

## Settled upstream by ticket 04 — do not relitigate

- **Start of turn: the player decides how many cards to *draw* from deck to hand.** This is the
  core decision of the game. Every card drawn is stamina spent whether used or not.
- **Playing an X-cost card = "exhaust X cards from your hand."** The played card also exhausts.
- **Damage = "exhaust X cards from your deck."** Chosen costs come off the hand; unchosen punishment
  comes off the deck.
- **The whole hand exhausts at end of turn**, with **Hold** as the exception for situational and
  equipped cards.
- **Exhausted cards do not return during a floor.** There is no discard pile.
- **A character is exhausted (down) when they begin a turn and cannot draw.**
- ~~**No mandatory minimum draw.**~~ **Reversed by ticket 04 `[you, 2026-08-23]`: each character
  must draw at least one card during the draw phase.** Declining a room is therefore no longer free —
  the turn costs the team two cards whether or not they engage. A character who cannot meet the
  minimum because their deck is empty is **down**; one who cannot meet it because their hand is at a
  cap simply declares themselves done, which is why the cap below is now load-bearing rather than
  cosmetic.

What this ticket still owes, sharpened by the above:

- **Hand size.** Is there a cap on drawing at all, or is cost the only limit? Ticket 04's finding
  is that a hand is *tools and fuel* simultaneously, so over-drawing is already self-limiting — a
  printed cap may be unnecessary.
  - **The argument that forced a cap has lapsed.** Ticket 05 made a maximum hand size *required*
    because scavenged items went to hand with Hold and their whole cost was occupying hand space.
    Ticket 18 removed rooms and therefore scavenging, so that pressure is gone and the cap is an open
    question again. Whether floor cards hand out anything that lives in hand is
    [ticket 21](21-defeating-a-floor-card.md) item 6; wait for it, or rule the cap on its own merits.
- **What still costs stamina, now that movement does not exist.** Ticket 04 ruled that exhausting is
  not a combat verb, and **ticket 06 ruled the principle** `[you]`: **most moves cost stamina in some
  form.** The price list that principle was heading for was written against rooms and doors and died
  with them. This ticket now owes the honest answer to what a turn even contains beyond flipping,
  drawing, and playing — and if the answer is *nothing else*, whether ticket 06's principle has
  been quietly reduced to ticket 04's drain. Say so out loud either way. Note 06 produced **no
  filter** — its constraints are argued case by case.
- **Actions per turn** — whether actions are a separate currency from card costs, or the same thing.
- `[you]` **"Do nothing: recover 1 card" is a logged candidate turn action.** Explicitly unadopted;
  must survive playtest. Ticket 10 owns the number.
- `[proposed by agent → not adopted, logged]` **"Bracing"** — absorbing a point of damage by
  exhausting a card from hand, making blocking an act of stamina rather than a printed stat.

## Handed down by ticket 09, 2026-08-24

**Maximum hand size is this ticket's to decide, and ticket 09 recommends 5.**

There is currently no hand limit anywhere in the design. Ticket 04 makes *how many to draw* the
central decision of the game and leaves it deliberately unbounded.

Ticket 09 created a reason to bound it. **Bad Stuff** — a piece of junk handed to you by a room's
punishment — has `Hold`, so it sits in your hand and does not clear at cleanup, and getting rid of it
means paying to play it. That is only a punishment if hand space is scarce. More generally, `Hold`
itself is only a cost when holding one thing means not holding another.

`[you, ticket 09]` **A maximum hand size of 5 is recommended; ticket 07 owns the decision.** Weigh it
against the draw decision, not against junk alone — a cap changes what the draw phase is, puts a
ceiling on how much fuel a big turn can assemble, and prices `Hold` for every card that carries it.
Ticket 09 deliberately did not decide this, because a rule with that much reach should not be set as
a side-effect of designing junk.

## Answer

`[2026-08-25]` Grilling session, five rounds. Most of this ticket had already been eaten by tickets
04, 18, 21 and 09 — the five phases, the flip's position, the draw rule and the forced minimum were
all settled upstream and are not re-decided here. What follows is only what 07 actually owned.

### Hand size

**Maximum hand size is 5** `[proposed by agent → you approved]`, taking ticket 09's recommendation.
The reason is not junk. `Hold` currently costs nothing — a held card sits in hand for free, so
keeping a good tool is never weighed against anything. **`Hold` cards count against the cap**, which
is the whole point of having one: every card you hold is one fewer fresh card you may draw. That
prices `Hold`, prices Bad Stuff, and does it without a new zone or a new number on any card.

**The cap is a draw-phase limit only** `[proposed by agent → you approved]`. Stuff enters your hand
regardless of how full it is — from an Item room's flip or from a room's punishment — and you simply
**cannot draw while at or over 5**. A hard ceiling was rejected because it lets a punishment fizzle:
Bad Stuff bouncing off a full hand would fail to land on exactly the player it should hurt most.
Being shoved to seven cards and unable to draw for two turns is the better punishment, and it needs
no new rule — *"you may draw up to a hand of 5"* already says it.

**A floor begins with empty hands** `[proposed by agent → you approved]`. Empty hands, empty play
zone, empty room zone; turn 1 is an ordinary turn — flip, then draw. An opening hand would be a rule
that fires once per floor and would hand the players their first room's answer before they had to
decide anything.

### Actions

**There is no action currency** `[proposed by agent → you approved]`. Cost is the only currency and
stamina is the only resource. In the play phase you play cards until you cannot or will not pay. A
per-turn action allowance would be a second number to track and would compete with the draw decision
for the turn's tension.

### Interrupts

**The question dissolves** `[proposed by agent → you approved]`. Ticket 21 made both characters act
simultaneously in any order, and rooms have no behaviour beyond the flip — so there is no opponent
turn and no window *outside* the turn to react in. The entire turn is already one shared open window.
Ruled explicitly so a later ticket does not reinvent it. Note that this spends a lever the original
question called "major" for the frantic pillar; the pillar is carried by the drain and the flip
instead, per the check below.

### The turn belongs to the floor

`[proposed by agent → you approved]` **One flip, one draw phase, one play phase, one cleanup, both
characters throughout.** A turn is not a character's; **"turn" and "round" are the same word**. There
is no lead character, no fixed Red-then-Gray order, and nothing to decide about who goes first —
which closes the last of what ticket 03 left open here. Glossary lines phrased for the alternating
turns ticket 21 killed are corrected accordingly.

### When a character is down

`[proposed by agent → you approved]` A down character is **skipped in the draw and play phases
entirely** — no minimum draw, no stats, no fuel. Room punishments still land, and with no one else to
absorb them **every punishment falls on the survivor**. This is an explicit **death spiral** and is
meant to be one: it is the moment the run is genuinely in trouble. Ticket 14 owns the revive that
makes it survivable rather than automatic.

`[you]` **Clearing the floor heals both characters to full, even one who was down.** Ascending
restores the exhaust pile and the deck *is* the health, so revival on ascending is free and
automatic. **This is handed to ticket 14**, which therefore owns only *mid-floor* revival — the
floor boundary already solves the rest.

### Drain: ticket 06's principle has collapsed into ticket 04's

`[proposed by agent → you approved]` The honest answer to *what else costs stamina*: **nothing.**
Ticket 06 ruled that most moves cost stamina in some form, but the moves that ruling was written
against — movement, searching, forcing doors — all died with the spatial floor. Going through the
five phases there is nothing left to price. **No price list was invented to rescue the principle**,
and no hidden rules were added to give it something to charge for.

What survives is a relocation rather than a loss. Ticket 04 now forces **each standing character to
draw at least one card**, so a turn costs the team two cards *whether or not they engage the room*.
**The drain is charged against turns, not against moves.** Same principle, moved from actions to
time, and it is already part of the draw mechanic rather than a rule of its own.

### The play zone splits by character

Cleanup has to un-mix the play zone. Both characters play into a shared zone — that is what makes the
stat pool shared and where synergy comes from — but at cleanup those cards must return to **two
different exhaust piles**, and an exhaust pile is load-bearing: it is the record of what has left a
character's deck, and deck height is health.

`[proposed by agent → you approved]` **The play zone is split into Red's side and Gray's side, both
feeding one shared stat pool.** This costs nothing: the stat pool was never a zone, only arithmetic
over face-up cards, and it does not care which side of the table they sit on.

`[you]` **Additionally, Red's and Gray's own cards — starting decks and reward pools — are visually
distinguished** (backs, or a colour stripe; ticket 11 owns the execution). Not as an alternative to
the split but alongside it, because **neutral cards** accumulate in hand throughout a floor and
cannot be sorted by sight at all.

A single shared exhaust pile was rejected: it would break ticket 04.

### Cleared is a heap, not a zone

`[proposed by agent → you approved]` Cleared rooms never return and are **never counted** — clearing
the combat room ends the floor and nothing else asks how many are in there. It is face up, unordered,
unread, and no rule ever asks it a question. Named that way so a later ticket does not mistake it for
a resource.

### Where spent Stuff goes

`[you]` **Stuff is Exhausted normally, like any other card, and ascending has a step: pull all Stuff
out of the exhaust pile before restoring it to the deck.** Simpler during play, and card art will
make the sort easy enough at the one moment the game pauses anyway.

`[proposed by agent → not adopted]` The agent recommended instead that Stuff be *discarded out of the
game* rather than Exhausted, giving it its own never-read heap and a different word on its card face,
so the anti-recursion guarantee was physical rather than remembered. Declined as more complexity than
the problem is worth.

### Last stand: once per turn, taxed on exit

**Ticket 17's "once per character per floor" was an agent assumption, not a ruling** `[you]`. It read
the trigger's word *first* as *first per floor*; nothing the human said carried that qualifier. It is
**superseded here**.

`[you]` **A character may enter last stand once per turn** — that is, whenever their deck is found
empty, capped only so it cannot retrigger inside a single turn — **and exiting a last stand costs 2
cards.**

`[proposed by agent → you approved]` **The cost sits on exit, not entry.** On entry it would come out
of a hand that has just been drained and could be **unpayable**, so the rule would silently vanish
exactly when it is most dramatic, or need a second rule for the discount. On exit it is a discount on
the shuffle-back: you survive, and 2 of the cards that were coming back to you do not. It is never
unpayable — worst case you shuffle back nothing and go down next turn, which is the correct outcome.

**The tax is the scarcity bound, which is why *once per turn* needs no further limit.** Ticket 17
warned that surviving a last stand *rewards* running your deck to zero — the ticket 16 Undaunted
failure in a different hat. Each trip through last stand now nets **−2 cards permanently**, so the
exploit is a **loop that converges on death** rather than a rotation. The bound is arithmetic instead
of an arbitrary reset.

Correction to the session's own premise: the shuffle-back takes the **would-be-exhausted cards from
hand and play zone** — an alternate cleanup — and never touches the exhaust pile. The agent misread
it as drawing from the exhaust pile and raised a leak that does not exist.

`[you]` **Stuff in the play zone during a last stand is shuffled back like any other card.** Ticket
21's ruling is that a deck is not Stuff's *default* entry route, not that Stuff can never enter one;
"never" overstated it and the glossary is corrected. **Recorded consequence:** this is a heal, and
ticket 21 argued that rule against recursion. It is a narrow one — once per turn, taxed 2 cards, and
ascending pulls the Stuff back out — so it is logged rather than reopened.

### Upkeep, counted honestly

Item 8 asked for an honest count.

**Per turn:** one flip; one card-move per card drawn (2–10 typical); per card played, *cost*-many
moves to an exhaust pile plus one to the play zone; at cleanup either a punishment (X cards off a
deck top) or a reward, one move for the room, then a sweep of two hands and the play zone.
**Zero counters, zero trackers, zero mid-floor shuffling, and nothing to remember between turns** —
the stat pool is read off the table and health is a pile's height. That is unusually clean and it is
the part worth protecting.

**On the table:** 11 locations — floor draw, Fled, Cleared, active room, two play-zone sides — plus
deck, hand and exhaust pile for each character — and 3 more off to the side (two reward pools, the
Bad Stuff pool).

`[you]` **Accepted; it is not that bad.** The count is recorded as an input to the map's *table
footprint and component budget* fog rather than as a constraint on anything yet. Every location was
bought by a ticket that argued for it, and none can be cut without reopening something load-bearing —
the two exhaust piles *are* the health bars, the Fled pile *is* the scrambling.

### The checks this ticket was required to record

**Against ticket 06 (the frantic pillar), by argument, since 06 wrote no filter.** 06 ruled the
pillar is carried by two things at once. *You get poorer every turn* is now charged against turns
directly — the forced minimum draw means a turn costs two cards even if you engage nothing, so there
is no way to stall and no way to play cheaply. *Something acts on you every turn* is the flip, which
this ticket left at the head of the phase order untouched. What this ticket adds to the pillar is the
hand cap: a ceiling on how much fuel a big turn can assemble means you cannot solve a hard room by
banking, only by having drawn right. What it spends is interrupts — but 06 wanted no wall clock and
got none, and the honest failure is still *"I spent badly."*

**Against the requirement that phases wrap real decisions.** The draw phase carries nearly all of it
and always did. The play phase is near-pure execution, which ticket 21 accepted knowingly with `Hold`
as its saving grace — the hand cap now sharpens that, because holding is a real cost against a
5-card ceiling rather than free storage. Cleanup and flip wrap no decisions and are not supposed to.
The turn passes, but only because the draw phase is doing heroic work; that concentration is a risk
and it goes to ticket 20's tabletop prototype.

### Amendments this makes elsewhere

- **[Ticket 17](17-last-stand.md)** — "once per character per floor" superseded by *once per turn,
  exit costs 2*. Its reward-for-emptying warning is answered by the tax.
- **[Ticket 14](14-down-and-revive.md)** — revive on ascending is free and automatic. 14 owns only
  mid-floor revival.
- **[Ticket 21](21-defeating-a-floor-card.md) / [09](09-card-acquisition-and-deckbuilding.md)** —
  "Stuff never enters a deck" softened to *a deck is not Stuff's default entry route*.
- **[Ticket 11](11-card-anatomy.md)** — owns how Red/Gray cards are visually distinguished from
  neutral cards.
- **[Ticket 03](03-solo-coop-or-both.md)** — everything it left open here is closed: no turn order,
  no lead character, no finer round than the floor's turn.

## Amended by ticket 11, 2026-08-25

**Neutral cards do not exist.**

This ticket required Red's and Gray's own cards to be visually distinguished "because **neutral
cards** cannot be sorted by sight at all." [Ticket 11](11-card-anatomy.md) found the premise stale:
reward pools and starting decks are both per-character (ticket 09), so **every card a character owns
is theirs**. The only cards belonging to neither are **Stuff**, which announces itself on its own type
line.

So the category the worry was about is empty, and the requirement is satisfied without a new field:
the **type line** reads `Red`, `Gray`, `Good Stuff`, or `Bad Stuff`, doing the character marking's job
as well as its own. The agent proposed a third value `Both` for neutral cards and the human rejected
it on the grounds that the category does not exist.

Nothing else in this ticket changes — the play zone still splits by character, for the cleanup reason
this ticket gave.

## Amended by ticket 12's build session, 2026-08-25

**`Down` is redefined, and last stand becomes a state rather than a window.**

`[you, 2026-08-25]` Ruled while reviewing [ticket 12's exemplar set](../prototypes/12-exemplar-card-set.md):

> When a character's deck is empty, that character enters **last stand**. A character is **Down** when
> something would Exhaust a card from their empty deck, **or** when the team Flees the room while that
> character is in last stand. While Down, a character gets no rewards, cannot act, and **cannot have
> cards added to their hand.**

So last stand is occupied for exactly as long as the deck is empty, and reaching zero is no longer
itself the end — it is the beginning of a state you have to fight your way out of.

**What this changes here.** This ticket set last stand at **once per turn** with a **2-card exit tax**.
The *once per turn* framing is superseded — there is nothing to re-trigger, because last stand is now
a state you are in until your deck stops being empty. The **exit tax survives as written**: clearing
the room while in last stand shuffles back the would-be-exhausted cards minus 2.

**The scarcity bound this ticket argued for is now much harder.** Its reasoning was that each trip
through last stand nets −2 cards, making the exploit "a loop that converges on death." The new ruling
adds a second, sharper bound: **in last stand, any Flee puts you Down.** You cannot coast in it and you
cannot bank it — you clear rooms or you are finished. `[open]` Whether the 2-card exit tax is still
needed on top of that is a live question and belongs to the human.

**It also closes a hole this ticket opened and did not see.** This ticket ruled a Down character is
"skipped in the draw and play phases entirely" but left the flip alone, and ticket 21 lets the team
choose whose hand Stuff enters. Nothing stopped the team parking every unwanted piece of Bad Stuff on
someone who could not act, permanently defusing the hand cap that this ticket introduced specifically
to price `Hold` and Bad Stuff. *Cannot have cards added to their hand* ends it.

## Amended by ticket 04, 2026-08-25 — a full hand blocks drawing *up*, not the minimum

`[you, ticket 04]` **You always draw for the minimum, even with a full hand. With a full hand the
drawn card is Exhausted instead of going into your hand.**

This narrows this ticket's *"you simply cannot draw while at or over 5"*. The cap still stops you
drawing **up** — you cannot assemble a bigger hand than five, which is the ceiling this ticket wanted.
It no longer stops the **minimum**, which now always happens while you have a deck.

**It sharpens the punishment this ticket was already reaching for.** This ticket rejected a hard
ceiling so that Bad Stuff could not fizzle against a full hand, and said *"being shoved to seven cards
and unable to draw for two turns is the better punishment."* Under the amendment those two turns are
worse still: you are not merely unable to draw, you are **burning a card a turn off the top of your
deck** until you spend your hand down. Bad Stuff went from dead weight to a bleed.

`[you, ticket 04]` That is accepted, because the bleed is always escapable by the player's own choice
— Bad Stuff can be played to clear it, and it is ordinary fuel for a real card. Some Bad Stuff may
want rebalancing now that carrying it costs more, which is
[ticket 10](10-sim-the-resource-economy.md)'s tuning pass.

**And it retires the exploit this ticket's cap accidentally created.** Filling a hand with five `Hold`
cards used to stop the drain entirely, which is the co-op idling strategy ticket 04's minimum draw
exists to prevent. This ticket's own line that *"holding is a real cost against a five-card ceiling"*
is now literally true rather than only figuratively.
