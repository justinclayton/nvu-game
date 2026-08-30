# 14 — Design the down and revive rules

Type: grilling
Status: closed
Blocked by: 04, 07
Map: [core design map](../map.md)

## Question

Ticket 03 settled that a character at zero is **down, not dead** — incapacitated, revivable by the
other character, with the run ending only when both are down. It also flagged the cost: a down
state, a revive action, and their timing rules are real rules weight charged against the
low-complexity constraint.

**This ticket's job is to make that cheap.** If it cannot be made cheap, say so — ticket 03's
decision is the one to revisit, and "either death ends the run" was the runner-up.

Decide:

1. **What "down" is, physically.** How the state is represented at the table with no extra
   components — a flipped character card, a card left in a zone, a token that already exists.
2. **What a downed character can still do.** Nothing at all, or a reduced set? Nothing is simpler;
   a reduced set keeps the solo player from having only half a game to play while they dig out.
3. **The cost of reviving.** What the other character spends — cards, a turn, health of their own.
   Under ticket 04's model, spending cards to revive means weakening yourself to save your partner,
   which is exactly the tension this decision was made for.
4. **Time pressure on the revive.** Whether a downed character stays down indefinitely or degrades.
   A hard deadline creates the scramble; it also creates a second timer to track.
5. **What the run-ending state actually is.** Both down simultaneously? Both down at any point?
   State it unambiguously against ticket 04's loss condition.
6. **Recovery on ascending.** Whether beating a floor restores a downed character, and whether
   anything carries the damage forward between floors.
7. **The solo case.** Solo, the same brain controls both. Confirm the rules read identically and
   that a solo player is never left with no legal action.

## Must satisfy

- The loss condition and resource model from ticket 04.
- The turn economy and upkeep budget from ticket 07.
- Ticket 06's pressure constraints (no filter — see below) — a revive scramble should intensify the
  pillar, not pause it.

## Notes for the session

- Budget: this whole subsystem should cost roughly one paragraph of rules text. If the draft runs
  to a page, it has failed regardless of how good it is.

## Settled upstream by ticket 04

- **A character is exhausted (down) when they begin a turn and cannot draw** — i.e. their deck is
  empty at the start of their turn. An empty deck is not instantly fatal; they get one final turn
  with the hand they are holding.
- **"Exhausted" is the fiction as well as the mechanic.** Health is stamina, measured in cards; at
  zero you are spent, not dead. Ticket 03's *down, not dead* and the resource model now use the same
  word for the same thing.
- **Reviving must be expressed in cards**, since no other currency exists and ticket 04 adopted the
  low-complexity constraint as a strong preference. Spending your own cards to revive your partner
  means literally spending your own stamina — which is the tension this decision was made for.
- **Ascending a floor restores the exhaust pile to the deck.** Sub-question 6 is therefore mostly
  settled: a floor cleared is a full heal, and nothing carries damage forward between floors.

**Coordinate with ticket 17 (last stand)**, which was created from this session and owns what happens
during that final turn. Both tickets describe the zero state and must not contradict each other —
in particular, whether a partner can revive a character *during* their last stand.

**Inherited from ticket 06** (*Decide what creates the frantic, in-over-your-head pressure*)
`[you, 2026-08-16]`: revive is the **safety valve that makes the pillar survivable**. Ticket 06
ruled that the pressure may genuinely close and kill you, but that one bad break from a hazard must
not end the run on the spot — the revive is what keeps that true. So the cost this ticket sets is
load-bearing in both directions: set it too cheap and the pressure stops being real, set it too dear
and one bad break is fatal after all.

**A hole ticket 04 logged and left open for this ticket to watch:** ticket 03 ends the run only when
both characters are down, so in co-op a character sitting at one card of deck can idle indefinitely
while their partner solves the floor. Ticket 04 declined to write a rule against it (a character who
draws nothing has no cards and cannot act, so it is self-punishing) — but it is not *fatal*, and
the down-and-revive rules are where it would bite.

## Handed down by ticket 07, 2026-08-25

`[you]` **Clearing a floor heals both characters to full, including one who was down.** Ascending
restores the exhaust pile and the deck *is* the health, so **revival on ascending is free and
automatic** and this ticket does not own it.

What this ticket owns is therefore only **mid-floor revival** — whether a down character can come
back before the floor ends, and at what cost. Note the shape ticket 07 left: a down character is
skipped in the draw and play phases entirely, and with no one else to absorb them **every room
punishment falls on the survivor**. That death spiral was adopted deliberately, on the understanding
that this ticket is the safety valve.

Also relevant: ticket 07 superseded ticket 17's last stand bound — it is now **once per turn with a
2-card exit cost**. State the ordering between revive and last stand against *that* rule, not the
retired one.

## Handed down by ticket 12's build session, 2026-08-25

**This ticket's subject was redefined before it opened.** `[you, 2026-08-25]`

> When a character's deck is empty, that character enters **last stand**. A character is **Down** when
> something would Exhaust a card from their empty deck, **or** when the team Flees the room while that
> character is in last stand. While Down, a character gets no rewards, cannot act, and **cannot have
> cards added to their hand.**

Three things this ticket now inherits rather than decides:

- **Down is no longer "unable to draw."** Ticket 04's loss condition is superseded; being unable to
  draw is simply not drawing. *(Amended [you, ticket 04, 2026-08-25]: the full-hand half of this no
  longer arises. A full hand does not stop the minimum draw — the card is Exhausted instead — so the
  only way to fail to draw is an empty deck, which is last stand. That closed the hand-jam exploit,
  where five `Hold` cards let a character stop paying stamina indefinitely.)*
- **There is a whole state between full health and Down.** Last stand is now occupied for as long as
  the deck is empty, so "reaching zero" and "being Down" are two different events with real distance
  between them. Any mid-floor revive this ticket designs has to say which of the two it answers.
- **What a Down character may receive is already ruled**: nothing. No rewards, no cards into hand.
  A revive has to be something done *to* them by the other character, not something handed to them.

Ticket 07 already settled the other half: **clearing the floor heals both characters to full, including
one who is Down**, so this ticket owns only mid-floor revival.

## Answer, 2026-08-29

`[you]` **There is no down-and-revive subsystem.** The ticket asked how to make one cheap; the
ruling is that it costs nothing because it does not exist. Down is terminal for the floor, and the
free heal on ascending is the only route back.

**Down is out.** `[you]` A Down character is out for the rest of the floor. No general revive rule
exists. The only way a character comes back mid-floor is a card that explicitly says so.

**A reviving card defines its own effect.** `[you]` The rules say nothing about what a revive
returns — cards into the deck, into the hand, a partial restore. Whatever card grants it says what
it gives. Nothing here constrains that card in advance.

**Going Down discards the hand.** `[you]` This is what makes the state legible with no components:
a Down character has an empty deck *and* an empty hand, which is exactly what distinguishes them from
a character in last stand, who has an empty deck but is still holding cards. Asked how Down is shown
at the table, the answer was that it is obvious on sight. Nothing is flipped, tokened or tracked.

**While Down, a character does nothing at all.** `[you]` No draws, no plays, no costs paid, no
punishments taken. They are skipped completely, and per ticket 07 every room punishment falls on the
survivor.

**The run ends at the start of a turn.** `[you]` If both characters are Down at the beginning of a
turn, there is no flip — the game ends there. It is a start-of-turn check, not an instant one, so
the second character going Down does not end the run in the middle of resolving something.

## What this closes

- **Sub-questions 1–5 and 7** are all answered above or dissolved by the ruling. Sub-question 6
  (recovery on ascending) was already settled by ticket 07 and is untouched: clearing a floor heals
  both characters to full, including one who is Down.
- **Ordering against last stand** is now a straight line with no interaction to specify: full deck →
  last stand (empty deck, still holding a hand) → Down (hand discarded, out) → run ends at the next
  start-of-turn check if both are Down. Ticket 17 owns the last stand half and this answer does not
  touch it.
- **Ticket 04's idling hole** — a character sitting at one card of deck while their partner solves
  the floor — closes on its own. The minimum draw is mandatory and Exhausts from an empty deck, so
  there is no way to hold at one card and coast.
- **The rules budget.** The ticket allowed roughly one paragraph. The subsystem came in at zero
  rules text beyond the definition of Down itself.

## The tension this leaves

Ticket 06 made revive the safety valve that keeps the frantic pillar survivable — one bad break from
a hazard must not end the run on the spot. That valve is now gone from the rules and lives entirely
in the card pool. Whether a bad break is survivable is therefore a **card availability** question:
if no reviving card is in the pool, or none is reachable when it matters, ticket 06's constraint is
unmet. This is the thing to watch in ticket 20's tabletop play and in ticket 10's win rates.
