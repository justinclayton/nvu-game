# 18 — Decide what choices a floor actually presents to the player

Type: grilling
Status: open
Blocked by: 05
Map: [core design map](../map.md)

## Question

When a player looks at a floor, what are they *choosing between*?

The map has a skeleton for a floor (ticket 05) and a phase sequence for a turn (ticket 07), but
nothing anywhere states what the interesting decision is. A player can know exactly what order the
steps go in and still have nothing to decide. This ticket owns the diegetic choice menu — the
things the player, in the fiction, elects to do — and it deliberately runs **before** any question
about what a room physically is.

Decide:

1. **The primary per-room decision.** When the player arrives somewhere, what is the choice? Fight
   or move past? Which of several things to spend on? Whether to open the thing? Name it in one
   sentence, in the player's own terms, not the system's.
2. **Is engagement optional?** Can a threat be bypassed, fled, or ignored — and if so, what does
   it cost, and does the ignored thing stay ignored? This is the single largest lever on whether a
   floor feels like a route or a corridor.
3. **Does routing exist?** Are there meaningfully different ways through a floor, or one way with
   different contents? If routes exist, what makes one better than another for *this* player in
   *this* run — and is that legible before committing?
4. **Commit versus conserve.** Where the tension between spending now and holding back actually
   bites during a floor, and whether that decision recurs or happens once.
5. **What the player knows when choosing.** How much of the floor and its contents is visible at
   the moment of each decision. Full information, fog, or partial signals ("you can see there is
   *something* there, not what").
6. **Irreversibility.** Which of these choices close doors permanently, and which can be walked
   back. A floor of fully reversible choices has no decisions in it.
7. **The co-op question.** Under whatever ticket 03 settles, whether players choose independently,
   split up, or move as a group — and whether the interesting choice is partly *social*.

## Output

A **one-line testable filter**, in the same style as ticket 06's pressure filter, that tickets 07,
08, 11, and 19 can each be checked against. Something a later session can hold a proposal up to and
say yes or no.

## Must satisfy

- The floor structure settled in ticket 05.

## Notes for the session

- **Sibling of ticket 06, not downstream of it.** The pressure mechanism and the choice menu are
  genuinely coupled — resource starvation makes the interesting choice "what can I afford", while
  reveal-on-entry makes it "do I commit blind". Running them in sequence was rejected in favour of
  running them as siblings and paying one round of reconciliation later. `[you, 2026-08-15]`
  Whichever of 06 and 18 resolves second must **explicitly check itself against the first** and
  record the check. If they conflict, say so and reopen — do not paper over it.
- Do not settle what a room physically is, how many there are, or how movement works. Those are
  ticket 19. If a decision here implies a constraint on topology (for example, "routing exists"
  rules out a pure linear track), state it as a constraint *for* 19 rather than deciding 19 here.
- Beware choices that are only nominally choices — an option nobody would ever take is not a
  decision. For each choice settled, name the situation in which a reasonable player picks each
  side.

## Provenance

`[proposed by agent → you approved, 2026-08-15]` This ticket did not exist during charting. The
floor-as-encounter concept entered the map only as context during ticket 04's discussion and was
never given a node; ticket 02's research recorded a related prior-attempt claim (row `r`, a
non-linear floor plan with backtracking and fight-or-flee) as **uncertain provenance and contested
inside its own source document**. Nothing from that row is adopted here — it is listed only so this
session knows the claim exists.
