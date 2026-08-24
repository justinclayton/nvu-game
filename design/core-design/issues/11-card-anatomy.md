# 11 — Define card anatomy

Type: grilling
Status: open
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
