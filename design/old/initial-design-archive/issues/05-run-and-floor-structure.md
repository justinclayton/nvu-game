# 05 — Define the run and floor structure

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

What is the structure of a run — the shape of the whole climb?

This ticket owns the **run scale**. The shape of a single floor *as a playable encounter* belongs
to tickets 18 and 19, which this ticket blocks.

## Settled upstream by ticket 04 — do not relitigate

`[you]`, ruled while resolving ticket 04 on 2026-08-14, because the resource model could not be
settled without it:

**A floor is one continuous encounter.** Not a series of fights with a boss at the end. It is a 2D
floor plan the characters move around over many turns — entering rooms, finding a monster, denting
it, fleeing when they are in over their heads, scavenging for things that help, doubling back,
getting chased along the way. The floor ends by ascending: perhaps a big enemy blocks the exit,
perhaps a key must be found, perhaps there is only one enemy per floor but the players are too busy
running around to face it. A run is many floors.

Two constraints follow directly:

- **A floor should not drag**, and its length is balanced against deck size. Ticket 04's model makes
  these the same dial: floor length ≈ deck size ÷ average conversion per turn, minus damage taken.
- **Ascending restores the exhaust pile** — cards return to the deck, healing to full. Attrition
  therefore lives *within* a floor, not across a run. The run-level arc is deckbuilding, not
  attrition.

This ruling **closes** the question this ticket used to open with — whether "one floor = one combat
round" meant a literal single round or a bounded sequence under one pressure envelope. It is the
latter. Do not reopen it.

## Decide

1. **The boss.** Where the floor boss sits in the structure and what forces the player to face it.
   Ticket 04 floated three gate shapes — a big enemy blocking the exit, a key to find, or no gate at
   all with the pressure coming from elsewhere. Rule between them, or hand the choice to ticket 19
   if it turns out to be a topology question.
2. **Ascension.** What beating a boss changes, and what carries between floors. Ticket 04 settled
   that the exhaust pile returns; this ticket settles everything *else* that does or doesn't.
3. **Escalation.** What gets harder floor to floor, and along which axis. Note that ticket 04 put
   attrition inside a floor, so escalation cannot lean on the player arriving weakened.
4. **Run length.** Whether the number of floors is fixed, and roughly how long a full run should
   take at the table.

## Notes for the session

- Whatever this settles must be able to *host* a pressure mechanism (ticket 06). Do not settle a
  structure with no room for time pressure in it.
- Run length and floor count may partly stay in the fog if they depend on the turn economy
  (ticket 07). Settle the structure; leave the numbers to the sim (ticket 10) if needed.
- Settle the run scale and **stop**. Resist specifying room layout, movement, or how many rooms —
  that is ticket 19's job, and settling representation here is the specific failure the rescope
  below was made to prevent.

## Answer

Resolved 2026-08-15. All four items settled; one adjacent question deliberately left open and routed.

### 1. The boss — `[you]`

**One enemy per floor, and defeating it is what grants passage.** The in-universe explanation for
*why* killing it opens the way varies floor to floor for variety's sake — it dropped the key, it was
holding the door, the machinery restarts when it dies. The explanation is flavour; the structure is
constant.

This picks the third of the three gate shapes ticket 04 floated and collapses "floor boss" and "room
enemy" into a single thing. **A floor is a monster, plus a map you are running around on.** There is
no such thing as a boss floor, because every floor is one.

Stated as a default, not a law: **design space is deliberately left to deviate** once tickets 18, 19,
and 08 establish what makes floors differ. A later floor that breaks this pattern is a designed
exception, and the exception has to earn itself against the default rather than the reverse.

The agent recommended a broader unification — a locked exit whose lock varies in *kind* (a key, a
mechanism, sigils, a monster). **Not adopted.** The narrower rule is simpler to start with and can
widen later if it needs to; the wide version cannot be narrowed once floors are built against it.

### 2. Ascension — what carries — `[you]`

Ticket 04 settled that the exhaust pile returns and the character heals to full. Beyond that:

- **Card rewards.** Clearing a floor offers permanent card-reward options, Slay the Spire style — a
  choice between several, added to the deck for the rest of the run. This is what gives the player
  direction over building synergies, and it is the run's primary arc.
  `[proposed by agent → you approved]` **Declining is always allowed.** Under ticket 04's inversion a
  skipped card is consistency preserved, so "no thanks" is a genuinely strong play rather than a
  courtesy option. The player therefore sets their own final deck size.
  `[you]` **Removal is not ruled out**, but it is never a default — if it is implemented at all it
  must be rare and special. (This revises the agent's proposal to close removal off entirely.)
- **Scavenged items do not carry.** See item 5 below.
- **Nothing bad carries, by default** `[you]` — with a **card-specific exception**. A card may follow
  you between floors as a penalty. Placeholder keyword: **Curse**, taking Slay the Spire's meaning.
  The name is explicitly provisional and needs a thematically-appropriate replacement before the spec
  locks; it is kept out of `CONTEXT.md` until then. The default remains that a floor cleared is a
  clean slate, and any carried penalty is a specific card doing a specific thing, never a background
  rule.

There is no permanent injury, no wound track, and no run-level damage. Ticket 04 put attrition inside
a floor; a general carried penalty would reintroduce the run-as-attrition arc that was already ruled
against.

### 3. Escalation — `[you]`

**Enemy difficulty scales floor to floor.** That is the certain axis.

**Floor size and complexity are a probable second axis**, deferred: it cannot be settled before
ticket 19 decides what a floor plan actually is. Revisit once 19 lands.

Note the run's central tension, which falls out of ticket 04 rather than needing invention: the deck
*is* stamina, so deckbuilding is the player's counter to escalation — but every added card also
dilutes consistency. The run is a race between growing the stamina pool and thinning out the
guarantee that the right card shows up. Escalation sets the pace of that race.

### 4. Run length — `[you]`

**Ten floors, fixed.** Deck size is a separate dial from floor count, tuned by ticket 10's simulator.

**Five to seven minutes per floor**, giving a full run of roughly 60–75 minutes. This is adopted as a
**hard design constraint, not a target** — its explicit purpose is to keep the design from
over-complicating itself. A floor that takes five minutes cannot host many rooms or much per-turn
bookkeeping, and tickets 19 and 07 must fit inside that budget rather than discover it later.

### 5. Scavenged items — `[you]`

Ruled here because it determines what "carries" means, though ticket 09 owns acquisition mechanics.

Items found during a floor go **straight to hand, with Hold by default, and do not leave the floor
with you.** They are tools that occupy hand space, burnable as fuel when desperate, gone on ascending.
A way to carry *some* items onward may exist later — definitely not all, and definitely not the
default.

Two consequences:

- **Hand size must be capped.** Otherwise "it takes up hand space" is not a cost at all. This is a
  requirement pushed onto ticket 07, which owns hand size.
- Pickups deliberately **do not enter the deck**, so scavenging is never a healing verb and the deck
  stays a pure product of deckbuilding. The agent flagged this as the load-bearing choice and as
  cheap to flip at ticket 20's table test.

**Vocabulary note:** Slay the Spire's "Status" was the reference reached for, but Status cards there
are junk — clutter as punishment. A scavenged item is the opposite valence with the same lifecycle.
The word is **not imported**; this game will likely want both ideas and they need separate names.

### Left open, deliberately — `[you]`

**Whether damage to a floor's enemy persists when the party breaks off contact** is *not* settled
here. It is downstream of how the enemy is physically represented and how its damage is tracked: if
separate health tracking proves fiddly at the table, "you have to take it down in one go" becomes a
live option, which would produce a materially different floor.

Routed to **tickets 08 and 19**. **Ticket 18 must not assume the dent-it-and-retreat loop exists**
until this lands — the floor described in ticket 04 depends on it, and it is not yet guaranteed.

### Designer philosophy surfaced here — `[you]`

**Minimise play zones.** Not a game rule for players — a working discipline for the designers. Deck as
stamina, consumables and equipment as Held cards in hand: both are instances of it. Promoted to
the map's standing Notes, because a floor plan is the most zone-hungry thing left on this map and this
principle is exactly the kind that erodes silently when a later ticket finds a zone convenient.

## Rescope history

`[proposed by agent → you approved, 2026-08-15]` This ticket originally carried encounter-scale
items — what a room is, how many rooms per floor, movement and layout reveal, and whether Red and
Gray may split up. They moved to tickets 18 and 19 when the encounter cluster was charted. The
reason: those items asked for a *physical representation* before anything on the map established
what that representation had to accomplish, and the floor encounter had no owning node at all.

The splitting-up question in particular was recorded here as "a structural question, not a
turn-economy one" — that remains true, but it is *encounter* structure rather than *run* structure,
so it now sits in ticket 18 (may they split) and ticket 19 (what the topology must support if they
can). `[proposed by agent → you approved, 2026-08-15]` — this was the one item of the rescope where a
prior session's placement was overridden rather than merely moved. **Resolved during this session:**
the move stands, and the underlying design question was answered outright — `[you]` **Red and Gray can
move independently within a floor.** Ticket 18 carries it as settled upstream; ticket 19 must supply a
topology that supports two separated characters.

## Superseded in part

`[you, 2026-08-23]` **A floor is a deck of cards played against, not a plan moved around on** — see
[ticket 18](18-floor-encounter-decisions.md). Four rulings in the Answer above no longer hold:

- **A floor is a 2D plan with rooms you run around.** Gone. A floor is a shuffled deck; a turn is a
  flipped card.
- **Scavenged items go to hand with Hold and do not leave the floor.** Gone with the rooms. Whether
  floor cards hand out anything comparable is [ticket 21](21-defeating-a-floor-card.md) item 6.
- **Red and Gray move independently within a floor.** There is nowhere to move. What the two
  characters do separately is now a turn-economy question for ticket 07 and ticket 21 item 7.
- **Whether damage to the floor's enemy persists when the party breaks off.** The question survives
  in a new body — whether a floor card carries damage into the discard pile — and is ticket 21 item 3.

**One enemy per floor** is now ambiguous rather than wrong: a deck of ten threat cards may or may not
be one monster. Ticket 08 item 2 and [ticket 22](22-floor-deck-composition.md) item 2 settle it.

What stands unchanged: **ten floors**, the **5–7 minute** floor budget, **card rewards on clearing
with declining always allowed**, **escalation floor to floor**, and **nothing bad carrying between
floors except card-specific penalties**.

The abandoned material is preserved at
[`abandoned/spatial-floor-model.md`](../abandoned/spatial-floor-model.md).

## Superseded in part by ticket 09, 2026-08-24

**`Curse` is retired.** This ticket's card-specific exception to *nothing bad carries* — a card that
follows you between floors as a penalty, placeholder keyword `Curse` — is
[dropped from the core spec by ticket 09](09-card-acquisition-and-deckbuilding.md), and the naming
debt it carried is discharged by deletion rather than by finding a better word.

The reasoning: ascending is the full heal and the clean slate, and a mechanic that punches a hole in
that has to earn it. Ticket 09's **Bad Stuff** covers the same design need — a punishment that
lingers and costs you to be rid of — entirely within a single floor. So this ticket's default becomes
absolute: **nothing bad crosses a floor boundary.**

Everything else this ticket ruled stands.

## Amended by ticket 24, 2026-08-27 — one thing crosses a floor boundary

`[you]` **"Nothing bad crosses a floor boundary" is narrowed, not withdrawn.** Ascending now shuffles
**Stuff still in a character's hand** into their deck, and it does not sort by kind, so held **Bad
Stuff** crosses. `Curse` stays retired and ascending stays the full heal: what crosses is a blank card
in a deck of stamina — a card of health that does nothing — rather than a punishment that follows you
up the tower. See [ticket 24](24-the-scrap-mechanic.md).
