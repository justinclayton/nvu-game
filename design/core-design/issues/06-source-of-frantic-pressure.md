# 06 — Decide what creates the frantic, in-over-your-head pressure

Type: grilling
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

The design pillar, in the designer's words: players are *"in over their head and reacting to what's
in front of them, with little time for deep strategy."* What mechanism actually produces that at a
table, where nothing stops a player from thinking for five minutes?

This ticket exists as a **standing design constraint**, not a one-off decision. Whatever it
settles becomes a filter that tickets 07, 08, 09, and 11 must each satisfy. It was deliberately
kept as its own ticket rather than folded into the turn economy, because a pillar that is nobody's
job to defend gets quietly designed away.

## Constraint inherited from ticket 03

Turns are **strictly alternating** — Red acts fully, then Gray — and information is **fully open**.
That decision deliberately removed two of the cheapest sources of franticness: simultaneous action
and hidden hands. Neither is available here.

The pillar therefore rests entirely on **game state**. Whatever this ticket settles has to make a
player feel outmatched while they sit and think for as long as they like, with all information in
front of them. That is a harder problem than it looks, and it is the reason this ticket exists
separately rather than folded into the turn structure.

One source is now available that was not before: **two characters with separate health pools and a
down-not-dead rule**. A partner one card from going down is pressure that needs no clock.

Decide which mechanism (or small combination) carries the pillar:

1. **Escalating tempo** — threats arrive faster than they can be cleared, so the player is always
   behind.
2. **Resource starvation** — never enough energy/hand size to do everything that needs doing.
3. **Forced draw or forced loss** — the deck drains whether or not you act (couples tightly to
   ticket 04).
4. **Information revealed on entry** — you cannot plan a room you cannot see.
5. **A hard clock** — real-time timer, sand timer, or a turn count that ends the floor regardless.
6. **Irreversible choices under partial information** — every decision closes doors.
7. Something else the session surfaces.

Then decide:

- **Which of these are in, which are explicitly rejected, and why.**
- **How the pressure escalates** across a run without becoming unwinnable.
- **Whether the pressure is diegetic** (the tower is actively hostile) or purely structural.

## Notes for the session

- **Sibling of ticket 18.** `[you, 2026-08-15]` The choice menu and the pressure mechanism are
  coupled — mechanism 2 (resource starvation) and mechanism 4 (information revealed on entry) in
  particular are really statements about what the player gets to decide. The two tickets run as
  siblings rather than in sequence, accepting one round of reconciliation later. Whichever of 06
  and 18 resolves **second** must explicitly check itself against the first and record the check.
  (This line originally read "06 and 13" — a typo, corrected on resolution. 06 resolved first, so
  the obligation falls to 18.)
- Feel is ultimately validated by playtesting, not argument. This ticket fixes the *mechanism*; it
  does not claim to prove the feeling. Say so in the answer.
- Beware mechanisms that produce *stress* without producing *decisions*. A real-time timer makes
  players rush; it does not necessarily make them feel outmatched. Distinguish the two.
- Whatever is settled should be stated as a one-line testable filter that later tickets can be
  checked against. **This instruction was overridden on resolution** — see the Answer.

## Answer

*Resolved 2026-08-16 by grilling session. Feel is validated by playtesting, not by argument: this
ticket fixes the **mechanism**, and makes no claim to have proved the feeling.*

### The pillar is carried by a pair of scissors

Neither blade is sufficient alone. The design pillar is produced by both at once:

1. **You get poorer every turn.** `[you]` Ratified from ticket 04 rather than chosen here — the
   deck-as-stamina drain is already a one-way ratchet, and re-litigating it would reopen 04. But it
   is **widened** here: it is not only cards played that cost you. **Most moves cost stamina in some
   form.** Movement, scavenging, and floor interactions are expected to have a stamina price, not
   just card play. This is a constraint on **ticket 07**, which owns the turn-level detail.
2. **Something acts on you every turn.** `[you]` Something must be happening *to* the player each
   turn, unprompted. Its sources are **the floor's enemy**, and **hazards** in rooms that have them.

The agent's framing of the pair — you weaken while it strengthens — was accepted, but the agent's
initial diagnosis was that the drain alone gives *scarcity, not franticness*. That stands: a drain
that only punishes elapsed turns is indifferent to a player who thinks for five minutes. Blade 2 is
what makes the floor a race being lost.

### Rulings

- **No wall clock.** `[you]` Rejected outright — no real-time timer, no sand timer, no turn count
  that ends the floor. The agent's stated reason, accepted: it makes the *player* rushed rather than
  the *character* outmatched, which is stress without decisions. Ticket 05's 5–7 minute floor budget
  is a design target, not a rule enforced at the table.
- **You cannot simply leave.** `[you]` **Binding on ticket 08** as a requirement, free in its
  implementation. Pursuit — the enemy closing on you when you break off — is the obvious way to
  satisfy it and was the human's own suggestion, but 08 chooses the mechanism. The requirement
  exists because without it, disengaging switches the pressure off and the pillar has an opt-out.
- **Hazards are a tool, not a requirement.** `[you]` Available to tickets 18 and 19 to use as much
  or as little as they like; dosage is a balance-time question. The agent recommended binding a
  weaker form ("a floor's pressure must not come from the enemy alone") and this was **declined**.
  The agent's dissent, recorded: if the enemy is the only threat on a given floor, killing it ends
  that floor's pressure and the last stretch goes quiet.
- **The pressure is both diegetic and structural.** `[you]` Not a choice between the two.
- **The pyramid tower.** `[you]` The tower narrows as it rises: higher floors are **physically
  tighter**, with **fewer scavengable rooms** and **less space to avoid your enemies**. This is what
  lets the pressure be diegetic and structural at once — escalation you can see on the table rather
  than escalation by bigger numbers. Recorded as a **strong candidate for ticket 19**, explicitly
  **not binding** on it. Ticket 05 left floor size open as a second escalation axis waiting on 19;
  this is the leading proposal for that axis.
- **The squeeze is space and supply, not rate.** `[you]` Tighter floors mean fewer scavengable
  rooms, so the floor gives back less and stamina runs down faster in real terms — this falls out of
  the geometry for free, with no rule written. Explicitly **not** adopted: any rule making higher
  floors cost more per action. That would be a number to track on every action, and it does by fiat
  what the geometry does diegetically.
- **The pressure can genuinely kill you.** `[you]` The scissors are allowed to close. But the honest
  failure mode is **"I spent badly," never "I was slow"** — the rules cannot see slow and should not
  try. **Revive is the safety valve**: a character downed by an unlucky hazard break can be brought
  back by the other character at a cost, so a single bad break does not end the run there and then.
  The cost is **ticket 14's** to set.

### No one-line filter — instruction overridden

`[you]` This ticket's own notes asked for the outcome to be stated as a **one-line testable filter**
that tickets 07, 08, 09, and 11 could be checked against. The agent drafted several; all were
rejected. **The human's ruling: no tests. These get decided when we talk specifics.**

So this ticket hands down **constraints argued case by case**, not a test anything gets run through.
The rulings above are the constraint set; later tickets are held to them by argument at the time,
not by applying a formula. Anyone tempted to reinstate a filter should read this paragraph first.

### Deferred and routed

- **Whether you see the whole floor on arrival** (mechanism 4, information revealed on entry) is
  **not decided here.** `[you]` It cannot be settled before the floor plan is physical. Routed to
  **tickets 18 and 19**. The agent recommended full visibility from turn one; that recommendation is
  recorded as unadopted input, not a decision.
- **Reconciliation with ticket 18.** 06 resolved first, so it owes no check. **Ticket 18 inherits
  the obligation** to check itself against this ticket and record the check.
