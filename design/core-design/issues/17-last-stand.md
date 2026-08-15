# 17 — Design the last stand

Type: grilling
Status: open
Blocked by: 04, 14
Map: [core design map](../map.md)

## Question

**The idea — `[you]`, surfaced while resolving ticket 04.**

Ticket 04 settled that a character is exhausted when they **begin a turn and cannot convert**. An
empty deck is not instantly fatal: you get one final turn with the hand you are already holding, and
no possibility of another. That is structurally a last stand whether or not any rule says so.

The hypothesis: **make it one.** Card costs might be eliminated entirely once your deck is empty,
letting the character unleash a final barrage in the hope of a skin-of-your-teeth win.

Ticket 04's assessment, `[proposed by agent → recorded, not ruled]`: this is a rare shape — a
dramatic mechanic with almost no exploit surface, because it is unreachable except by nearly dying
and it ends immediately afterward.

## Decide

1. **Does the last stand get special rules at all**, or is "one final turn with what you're holding"
   already enough drama on its own? Nothing is the cheapest answer and it costs no rules text.
2. **If it does — what changes?** Costs eliminated is the human's instinct. Alternatives: a single
   free action, cards played from the exhaust pile, damage doubled, all of the above for one turn.
3. **How is the state signalled at the table**, given the low-complexity preference from ticket 04?
   An empty deck space is arguably already the signal and needs no component.
4. **Does it interact with revive (ticket 14)?** If a partner can revive you *during* your last
   stand, the mechanic changes character completely — from a doomed flourish to a stalling tactic.
   Rule on the ordering explicitly.
5. **Can it happen more than once per floor?** If a character can be brought back above zero and
   then hit zero again, the last stand is repeatable. Decide whether that is acceptable or whether
   it is once per floor.
6. **The solo case.** Solo, one player controls both characters, so a last stand and a revive
   attempt are being planned by the same brain. Confirm it still reads as desperate rather than as
   an optimisation.

## Must satisfy

- The loss condition and zone model from ticket 04.
- Ticket 14's down-and-revive rules — these two tickets both describe what happens at zero and must
  not contradict each other.
- The low-complexity preference (ticket 04): this should be a sentence, not a subsystem.

## Notes for the session

- Watch for the hole ticket 04 logged: in co-op the run ends only when **both** characters are down
  (ticket 03), so a character sitting at one card of deck can idle indefinitely while their partner
  solves the floor. If the last stand is *good*, that hole gets wider — reaching zero deliberately
  could become a play. Check the sign of that incentive.
