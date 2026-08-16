# 19 — Decide the floor's topology and physical representation

Type: grilling
Status: open
Blocked by: 18
Map: [core design map](../map.md)

## Question

What is a floor, physically, on a table — and what shape does it have?

Ticket 18 settles what the player is choosing between. This ticket decides the smallest physical
arrangement that can actually deliver those choices. Representation follows decision, never the
reverse.

Decide:

1. **Topology.** Linear track, branching node map, open grid, abstract zones, or a set of
   unordered rooms with no geometry at all. State which, and state which of ticket 18's choices
   each candidate can and cannot express.
2. **What a room is.** A card, a tile, a printed space on a board, or a slot on a track. What
   entering one does.
3. **Does distance mean anything?** Whether adjacency, range, or number-of-steps carry mechanical
   weight, or whether the floor is a sequence with no real geometry. Cheapest answer that satisfies
   18 wins.
4. **How many rooms per floor**, and whether that is fixed, variable, or player-chosen.
5. **Movement.** How the player moves, what it costs, whether rooms can be skipped or revisited,
   and whether backtracking is possible.
6. **Reveal.** Whether the layout is known in advance, revealed on entry, or partially signalled —
   implementing whatever ticket 18 settled about player information. (Revealed-on-entry is also a
   candidate mechanism for ticket 06; if both tickets are leaning on it, say so.)
7. **Setup and teardown cost.** What a human physically does to build a floor and clear it, and
   how long that takes. A floor that takes three minutes to lay out will not survive a run of
   several floors.
8. **Footprint.** Rough table area a floor occupies, and component count. This is the first hard
   number the map will have on physical budget.

## Settled upstream by ticket 05 — do not relitigate

- **A floor must play in 5–7 minutes**, full run ten floors in 60–75. `[you]` Adopted as a hard
  constraint whose stated purpose is to stop the design over-complicating itself. This binds items 4,
  5, 7, and 8 directly: room count, movement cost, setup time, and footprint all have to fit inside
  five minutes of real table time, **ten times in a row**, including teardown. Budget setup and
  teardown as part of the five minutes, not on top of it.
- **One enemy per floor, killed to grant passage.** `[you]` The topology has to make one monster and
  a handful of rooms interesting for five minutes. That is a very different problem from routing
  between many encounters — it argues for geometry that supports *avoiding and returning to a known
  point*, not for a branching content-delivery map.
- **Red and Gray move independently.** `[you]` Whatever topology is chosen must support two
  characters in different places, and item 3 (does distance mean anything) inherits a second job:
  whether the *distance between the two characters* means anything.
- **Scavenged items go to hand with Retain, gone on ascending.** Rooms therefore need to be able to
  contain findable things, and searching them is a use-it-or-lose-it proposition.

## This ticket owns a question routed from ticket 05

**Does damage to the floor's enemy persist when the party breaks off contact?** `[you]` Ticket 05
deliberately left this open because it is really a *representation* question: it depends on how the
enemy is physically represented and therefore how its damage is tracked. If separate health tracking
turns out to be fiddly, "you have to take it down in one go" becomes the answer, and the floor changes
shape.

Settle it jointly with ticket 08, and note that the map's **minimise play zones** philosophy applies
with full force — an enemy health track is exactly the kind of thing this project would rather express
with cards it already has.

## Must satisfy

- The decision filter settled in ticket 18 — check each candidate topology against it explicitly
  and record the check.
- The pressure filter settled in ticket 06.
- Ticket 02's best-attested prior constraint: *low complexity — no extra physical components, no
  extra systems; resources are printed on cards or are the cards themselves.* Ticket 04 rules on
  whether that constraint is adopted; if it is, a floor made of dedicated tiles is in tension with
  it. Rule on that tension explicitly rather than inheriting it.

## Notes for the session

- Sketch at least two genuinely different topologies before choosing, so the choice is a choice.
- Prefer the least physical machinery that satisfies 18. Geometry is expensive at a table and easy
  to add later; it is very hard to remove once cards are printed against it.
- The output of this ticket is what ticket 20 puts on a table in index-card form. Keep it concrete
  enough to build.

## Provenance

`[proposed by agent → you approved, 2026-08-15]` Items 4, 5, and 6 were originally items 3, 4, and
2 of ticket 05 and moved here during the encounter-cluster rescope. The rest is new.
