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
7. **Physical upkeep.** What the card asks a human to do — rotate, flip, cover, slide under
   another card — and whether that survives a real table.

## Must satisfy

- The resource model from ticket 04 and the acquisition model from ticket 09.
- The reading-time implications of ticket 06.

## Notes for the session

- Anatomy is easy to over-specify in the abstract. Keep it to what ticket 12's exemplar cards will
  actually need to express.
