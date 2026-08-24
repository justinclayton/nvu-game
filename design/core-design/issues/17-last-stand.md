# 17 — Design the last stand

Type: grilling
Status: resolved
Blocked by: 04, 14
Map: [core design map](../map.md)

## Question

**The idea — `[you]`, surfaced while resolving ticket 04.**

Ticket 04 settled that a character is exhausted when they **begin a turn and cannot draw**. An
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

## Answer

### The rule

`[you, 2026-08-23]` The **first time** a character's deck is checked and found empty, **every card in
their hand can be played at no cost until the end of that turn**. If the **room** is Cleared before
that character is further Exhausted, they **survive**: at that cleanup, the cards that would have
been exhausted are instead **shuffled back into their deck**. They carry on with a thin but
now-known deck.

So the last stand is not a doomed flourish. It is a real out — spend everything on the room in front
of you and, if it falls, you keep what you spent.

### How it reads at the table

`[proposed by agent → you approved]` The trigger fires when the deck **becomes** empty — drawing its
last card, or a punishment taking it — not when a draw from an already-empty deck is attempted. The
other reading cannot work alongside the minimum draw: a character who begins a turn with no deck is
already down, so the free-play window would never open.

`[proposed by agent → you approved]` **Hold** cards in hand stay in hand rather than joining the
shuffle-back — they were never going to be exhausted, so they are not among "the cards that would
have been exhausted."

`[proposed by agent → you approved]` Only the character in last stand plays free. Their partner pays
costs normally.

`[proposed by agent → you approved]` A last stand triggered by a **cleanup punishment** gives nothing
that turn. The room was not Cleared — that is why the punishment landed — so there is no free play
left to spend and no survival. The rule is consistent; it is simply harsh at that moment.

### What this settles from the questions above

- **Item 1 and 2** — the last stand does get special rules, and they are the human's instinct:
  costs eliminated, plus a survival clause.
- **Item 3** — the empty deck space is the signal. No component.
- **Item 5** — **once per character per floor**, by the word *first*. Ascending resets it.
- **Item 6** — untested. Solo, the same brain plans the last stand and the room it is spent on.

### Left open

- **Item 4 — the interaction with revive** is not answered here. [Ticket 14](14-down-and-revive.md)
  owns it and is still open. State the ordering there, and check it against this rule rather than
  assuming it.
- **The incentive the Notes warned about has a sign, and it is the wrong one.** Because surviving
  shuffles back everything that would have been exhausted, a character who draws their **whole
  remaining deck** on an easy room and clears it loses nothing at all that turn. Emptying your deck
  deliberately, on the cheapest room you meet, is currently a free turn rather than a crisis. It is
  bounded — once per character per floor — but it is exactly the *reaching zero deliberately becomes
  a play* failure this ticket was told to watch for. `[found by agent in the encounter simulator,
  2026-08-23]` Not fixed here. The obvious levers are a maximum hand size (ticket 07, open), or
  capping how much comes back.
