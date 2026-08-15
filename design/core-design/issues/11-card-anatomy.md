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
- The decision filter from ticket 18 — a card has to carry whatever information the player needs at
  the moment they make the floor's primary choice. If ticket 19 made rooms out of cards, this
  ticket also owns whether a room card and a player card share an anatomy.

## Notes for the session

- Anatomy is easy to over-specify in the abstract. Keep it to what ticket 12's exemplar cards will
  actually need to express.

## Settled upstream by ticket 04

- **Cost is a number of cards**, paid as "exhaust X cards from your hand." There is no energy symbol
  and no separate resource to print.
- **Two cost phrasings exist and they mean different things to the player:** "exhaust X cards from
  your hand" (a cost you chose) and "exhaust X cards from your deck" (a punishment you didn't).
  Keywords may be introduced later; for now these are the literal phrases.
- **Retain** exists as a keyword, taking Slay the Spire's meaning: the card is not exhausted at end
  of turn. Used for highly situational cards and for anything that should feel equipped.

## New card type to design — `[you]`, from the ticket 04 session

**Persistent effects live in your hand.** A card granting an ongoing buff stays in hand via Retain
and works for as long as you keep it. It costs nothing to maintain and needs no tracking — but it
occupies hand space you cannot refill for free, *and* it sits there every turn as a candidate to be
burned as fuel when you are desperate. Duration is never a rules question: it lasts exactly as long
as you can afford it.

The agent's assessment, recorded for provenance: this is the strongest single idea produced in the
ticket 04 session. It gives persistent effects with no tokens, no upkeep, and built-in tension, and
it re-asks the "is this still worth it?" question every turn without a single rule.

Decide here: what such cards look like, whether they are their own type or just Retain plus a static
effect, and whether burning one as fuel is a normal exhaust or something the card gets to react to.
