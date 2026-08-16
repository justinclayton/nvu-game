# 14 — Design the down and revive rules

Type: grilling
Status: open
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

- **A character is exhausted (down) when they begin a turn and cannot convert** — i.e. their deck is
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

**Inherited from ticket 06** `[you, 2026-08-16]`: revive is the **safety valve that makes the pillar
survivable**. Ticket 06 ruled the pressure may genuinely close and kill you, but that a single
unlucky hazard break must not end the run on the spot — the revive is what keeps that true. So the
cost this ticket sets is load-bearing in both directions: too cheap and the pressure stops being
real, too dear and one bad break is fatal after all.

**A hole ticket 04 logged and left open for this ticket to watch:** ticket 03 ends the run only when
both characters are down, so in co-op a character sitting at one card of deck can idle indefinitely
while their partner solves the floor. Ticket 04 declined to write a rule against it (a character who
converts nothing has no cards and cannot act, so it is self-punishing) — but it is not *fatal*, and
the down-and-revive rules are where it would bite.
