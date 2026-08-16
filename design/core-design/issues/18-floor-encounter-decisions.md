# 18 — Decide what choices a floor actually presents to the player

Type: grilling
Status: open
Blocked by: —
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

A **one-line testable filter**, that tickets 07, 08, 11, and 19 can each be checked against.
Something a later session can hold a proposal up to and say yes or no.

**Raise this with the human before producing it.** `[agent note, 2026-08-16]` This originally read
"in the same style as ticket 06's pressure filter" — but **ticket 06 produced no filter**. It was
asked for one, the agent drafted three, and the human rejected all of them: *"no tests, we'll decide
these things when we talk specifics."* That ruling was made about 06 and has not been extended to
this ticket, so the requirement stands as written — but the 18 session should ask whether the same
reasoning applies here rather than producing a filter the human has already declined once. Ticket
20 currently expects this filter to exist and would need updating if it is dropped.

## Settled upstream by ticket 05 — do not relitigate

- **One enemy per floor, and killing it grants passage.** `[you]` There is no separate boss. A floor
  is a single monster plus a map you run around on, so this ticket's item 2 (*is engagement optional*)
  is really asking **when**, not whether — the fight cannot be skipped, only postponed. That makes the
  primary decision much more likely to be *engage now or prepare more* than *fight or bypass*.
- **Red and Gray can move independently within a floor.** `[you]` Item 7's core question is answered;
  what remains is whether splitting is a *good idea* in given situations, what it costs, and whether
  the interesting choice is partly social.
- **Scavenged items go to hand with Retain and are gone on ascending.** So scavenging trades hand
  space for a tool, and everything found is use-it-or-lose-it within the floor. Commit-versus-conserve
  (item 4) has a hard deadline built in.
- **A floor must play in 5–7 minutes.** This is a hard constraint, not a target. A choice menu with
  many options per room will not fit. Prefer few, sharp decisions over a rich verb list.

## Do not assume — open upstream

**Whether damage to the floor's enemy persists when the party breaks off contact is NOT settled.**
Ticket 05 routed it to tickets 08 and 19 because it depends on how the enemy is physically tracked.
The dent-it-and-flee-and-return loop described in ticket 04 **only exists if damage persists.** If it
does not, the floor becomes *prepare, then win in one go*, which is a different set of decisions
entirely.

Either resolve this ticket in a way that works under both, or state explicitly which branch you took
and flag that 08/19 must honour it. Do not silently assume the loop.

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

## Inherited from ticket 06

`[you, 2026-08-16]` **Ticket 06 resolved first, so this ticket owes the sibling reconciliation
check** — read 06's Answer and record explicitly how this ticket sits against it. What lands here:

- **This ticket now owns a question 06 deferred**: whether the player sees the whole floor on
  arrival, or it is revealed as they move. 06 could not settle it before the floor plan is physical.
  The agent recommended full visibility from turn one; that is **unadopted input**, not a decision.
- **Hazards are a tool available to this ticket**, not a requirement — 06 declined to mandate that a
  floor's pressure come from more than the enemy, over the agent's recommendation.
- **"You cannot simply leave"** is binding on ticket 08, which constrains what a break-off or
  bypass decision can look like here.

## Provenance

`[proposed by agent → you approved, 2026-08-15]` This ticket did not exist during charting. The
floor-as-encounter concept entered the map only as context during ticket 04's discussion and was
never given a node; ticket 02's research recorded a related prior-attempt claim (row `r`, a
non-linear floor plan with backtracking and fight-or-flee) as **uncertain provenance and contested
inside its own source document**. Nothing from that row is adopted here — it is listed only so this
session knows the claim exists.
