# 03 — Decide solo, co-op, or both

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

Is North vs Up a solo game, a cooperative game, or must its core work at both 1 and N players?

The pitch says "solo or cooperative", which is not yet a decision. This constrains almost every
later ticket, so it is settled early.

Decide:

1. **The primary mode.** Solo-first, co-op-first, or genuinely both-at-once.
2. **Player count ceiling**, if co-op is in.
3. **Shared or separate decks.** If players each have a deck, and the deck is also the HP and
   energy pool (ticket 04), do players die independently? Can one player be eliminated while the
   run continues?
4. **Hidden information.** Do players see each other's hands? "Frantic" and "quarterbacking" pull
   in opposite directions here — hidden hands prevent one player solving the table, but add
   negotiation time.
5. **Turn order or simultaneous play.** Simultaneous play is one of the strongest levers on the
   frantic pillar (ticket 06). Rule on whether it is on the table.
6. **Disposition of the loser.** If solo-first, is co-op ruled **out of scope** for this map, or
   does it sit in the fog for later? If co-op-first, does solo become an automa problem (fog) or
   just the N=1 case?

## Inputs

Ticket 02 found a prior-stated constraint at **low provenance risk**: *cooperative, 1–2 players,
shared victory condition*. It is one of only a handful of items in the previous documents that
reads as the designer's own decision rather than model output.

Treat it as **evidence, not as settled**. This map adopts nothing from the previous attempts
automatically — the point of this ticket is for the human to rule on it now, in the open. If the
answer is "yes, that still holds", record it as a decision here with today's provenance rather
than inheriting it silently.

Note also that a 2-player ceiling makes the quarterbacking and hidden-information questions much
softer than an open-ended co-op count would.

## Notes for the session

- This ticket is unblocked and independent — it can be worked before the resource model exists.
- Record the *reason* for the choice, not just the choice. Later tickets will want to know which
  constraint they are allowed to trade away.

## Answer

Resolved 2026-08-14.

### The structural decision — `[you]`

**Two characters are always in play: Red and Gray.** They are archetypes of play — Red is stocky,
aggressive, headstrong; Gray is more concerned, attuned, resourceful. In co-op each player controls
one character. Solo, one player manages both.

This is the load-bearing decision on this ticket, and it is the designer's own, unprompted. It
dissolves the solo-versus-co-op question rather than answering it: **the game is the same game at
1 and 2 players**, differing only in how many hands are on the two characters. Player count
ceiling is therefore **2**, matching the prior constraint ticket 02 recovered — but adopted here
on its own merits, not inherited.

### What follows — `[proposed by agent → you approved]`

1. **One deck per character, one health pool per character.** Red and Gray each own a deck; each
   has their own health. Individual jeopardy is real — Red can be a card from death while Gray is
   untouched. This is also what makes the archetypes expressible through deckbuilding rather than
   through special-case rules.

2. **Whether *energy* is shared or per-character is explicitly NOT decided here — `[you]`.** The
   designer declined to rule on it on the grounds that "energy" has no settled meaning yet. It is
   handed to ticket 04 as an open question. Do not let it drift in as an assumption.

3. **Fully open information.** Both hands face up at all times. Forced by the parity goal: a solo
   player sees both hands by definition, so hidden hands would make co-op a genuinely different
   game. Quarterbacking is the accepted risk, judged cheap at 2 players and further mitigated by
   whatever pressure ticket 06 settles. No table-talk restrictions — they are unenforceable.

4. **Strict alternating turns.** Red acts fully, then Gray. Chosen over simultaneous play, which
   a solo player cannot perform against themselves and which would break parity at exactly the
   point it matters most; and over free-form activation, which invites the optimization pauses that
   the frantic pillar exists to prevent. **Consequence for ticket 06:** franticness cannot come
   from clock panic or overlapping action. It must come from game state — escalating threats,
   starvation, irreversible choices. This is the more durable source anyway, but it means ticket 06
   now carries the whole pillar rather than sharing it with the turn structure.

5. **Down, not dead.** A character at zero is incapacitated, not eliminated; the other character
   can act to bring them back. The run ends only when both are down. This is what earns the two
   separate health pools — it converts individual jeopardy into the "get to Gray now" scramble
   that is the pillar in miniature, and it behaves identically solo. **Acknowledged cost:** a down
   state, a revive action, and their timing rules are real complexity, charged against the
   low-complexity constraint. Ticket 14 owns making that cheap; if it cannot be made cheap, this
   decision is the one to revisit.

### Deliberately left open

- What "zero health" mechanically *is* — ticket 04 owns the loss condition.
- How Red and Gray actually differ in play — spun out as ticket 13. "Archetypes" is a design
  intent, not yet a mechanic.
- Whether the pair is a fixed duo or drawn from a roster — in the fog, pending ticket 13.

## Superseded in part

`[you, 2026-08-23, ticket 21]` **Strict alternating turns, Red then Gray, is out.** Both characters
act **simultaneously and collaboratively**: either of them may draw or play in any order, and
choosing that sequencing — whether Red draws out fully before Gray, whether they alternate, whether
they change it mid-turn — is itself part of the collaborative strategy.

Everything else this ticket settled stands, and two of its rulings get stronger:

- **Solo is mechanically identical to co-op** is now more true than it was, not less. One person
  running both characters does exactly what two people do; there is no turn order to simulate.
- **A character can be in trouble alone** is now load-bearing. A room's punishment normally reads
  *"1 character Exhausts X from deck"* and the team chooses who absorbs the whole amount, so
  protecting a nearly-empty Red by making Gray eat the hit is a live decision every turn.

**Logged as a known cost, not designed against** `[you]`: with fully open information and
simultaneous play, one player can simply run both hands — quarterbacking. It is a playtest finding
for [ticket 20](20-encounter-tabletop-prototype.md) to watch for, not something to pre-empt.
