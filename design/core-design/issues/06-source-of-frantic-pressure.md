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

### Two blades close on you at once

Two things press on the player at the same time, and neither of them is enough on its own. The pair
has no agreed name.

1. **You get poorer every turn.** `[you]` This blade is ratified from ticket 04 (*Design the
   deck-as-energy-and-HP model*) rather than chosen here: your deck is your stamina, and for as long
   as a floor's encounter is running it only ever runs down. Ascending is what reverses it — a floor
   cleared is a full heal — so the drain is one-way *inside* an encounter, not across a run.
   Re-litigating any of that would reopen 04. What this ticket adds is width. Playing cards
   is not the only thing that costs you. **Most moves cost stamina in some form** — moving,
   scavenging, and interacting with the floor are all expected to have a stamina price, not just
   card play. That is a constraint on **ticket 07** (*Define the turn and action economy within a
   floor*), which owns the turn-level detail.
2. **Something acts on you every turn.** `[you]` Every turn, something must happen *to* the player
   without the player prompting it. Two things can do that: **the floor's enemy**, and **hazards**,
   in the rooms that have them.

The agent framed the pair as *you weaken while it strengthens*, and that framing was accepted. The
agent also argued at the outset that the drain on its own gives *scarcity, not franticness*. That
still stands: a drain that only punishes turns going by is indifferent to a player who thinks for
five minutes. The second blade is what turns the floor into a race the player is losing.

### Rulings

- **No wall clock.** `[you]` Rejected outright. No real-time timer, no sand timer, no turn count
  that ends the floor. The agent's reason was accepted: a clock rushes the *player* rather than
  outmatching the *character*, which produces stress but no decisions. Ticket 05 (*Define the run
  and floor structure*) budgets 5–7 minutes per floor, and that is a design target, not a rule
  enforced at the table.
- **You cannot simply leave.** `[you]` This is **binding on ticket 08** (*Decide how enemies are
  represented and how they act*) as a requirement, but 08 is free to implement it however it likes.
  Pursuit — the enemy closing on you when you break off — is the obvious way to satisfy it, and it
  was the human's own suggestion, but 08 chooses the mechanism. The requirement exists because
  without it a player can disengage, switch the pressure off, and the pillar has an opt-out.
- **Hazards are a tool, not a requirement.** `[you]` Ticket 18 (*Decide what choices a floor
  actually presents to the player*) and ticket 19 (*Decide the floor's topology and physical
  representation*) may use them as much or as little as they like; how heavily to use them is a
  question for balance time. The agent recommended binding a weaker version — that a floor's
  pressure must not come from the enemy alone — and this was **declined**. The agent's dissent is
  recorded: if the enemy is the only threat on a given floor, then killing it ends that floor's
  pressure and the last stretch goes quiet.
- **The pressure is both diegetic and structural.** `[you]` It does not have to be one or the other.
- **The pyramid tower.** `[you]` The tower narrows as it rises. Higher floors are **physically
  tighter**: they have **fewer rooms worth scavenging** and **less space to keep away from your
  enemies**. This is what lets the pressure be diegetic and structural at once — escalation you can
  see on the table, rather than escalation by way of bigger numbers. It is recorded as a **strong
  candidate for ticket 19**, and explicitly **not binding** on it. Ticket 05 left floor size open as
  a second axis of escalation waiting on 19; this is the leading proposal for that axis.
- **The squeeze is space and supply, not rate.** `[you]` Because tighter floors have fewer rooms to
  scavenge, the floor gives back less, so stamina runs down faster in real terms. That falls out of
  the geometry for free, with no rule written for it. Explicitly **not** adopted: any rule that
  makes higher floors cost more per action. Such a rule would be a number to track on every action,
  and it would do by fiat what the geometry does diegetically.
- **The pressure can genuinely kill you.** `[you]` It is allowed to close on you. But when a
  player loses, the honest reason has to be **"I spent badly," never "I was slow"** — the rules
  cannot see slow, and should not try to. **Revive is the safety valve**: when a hazard breaks badly
  and a character goes down, the other character can bring them back at a cost, so a single bad
  break does not end the run there and then. **Ticket 14** (*Design the down and revive rules*) sets
  that cost.

### No one-line filter — instruction overridden

`[you]` This ticket's own notes asked for the outcome to be stated as a **one-line testable filter**
that tickets 07, 08, 09 (*Design the card acquisition and deckbuilding model*), and 11 (*Define card
anatomy*) could be checked against. The agent drafted several, and all of them were rejected. **The
human's ruling: no tests. These get decided when we talk specifics.**

So this ticket hands down **constraints, argued case by case**, rather than a test that anything
gets run through. The rulings above are the constraint set. Later tickets are held to them by
argument at the time, not by applying a formula. Anyone tempted to reinstate a filter should read
this paragraph first.

### Deferred and routed

- **Whether you see the whole floor when you arrive on it** (mechanism 4, information revealed on
  entry) is **not decided here.** `[you]` It cannot be settled before the floor plan is physical. It
  is routed to **ticket 18 and ticket 19**. The agent recommended that the player see everything
  from turn one; that recommendation is recorded as unadopted input, not as a decision.
- **Reconciliation with ticket 18.** 06 resolved first, so it owes no check. **Ticket 18 inherits
  the obligation** to check itself against this ticket and to record that check.
