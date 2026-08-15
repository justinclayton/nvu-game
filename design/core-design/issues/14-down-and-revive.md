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
- The pressure filter from ticket 06 — a revive scramble should intensify the pillar, not pause it.

## Notes for the session

- Budget: this whole subsystem should cost roughly one paragraph of rules text. If the draft runs
  to a page, it has failed regardless of how good it is.
