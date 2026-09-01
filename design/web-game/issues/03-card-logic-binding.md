# 03 — Decide where card-specific logic goes

Type: prototype
Status: resolved
Blocked by: 02

## Question

A card's printed data lives in `design/cards.yaml`. Some cards also have behaviour: Overdrive's
"Exhaust 2", conditional stats, Hold effects that run while in hand. Where does that behaviour live
in code, how is it bound to the card (by name, by id, by an effect keyword in the YAML), and what
happens when a YAML card has text but no binding? Build a small prototype of the registry with two
or three real cards and react to it. The answer must keep `cards.yaml` as the one place a card is
written down.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`. Resolved as a decision with a sketch rather than a built prototype; the first two bindings
are the implementing agent's first job, and the ADR says so.

**Bound by name, in domain.** `domain/cards/behaviours.ts` exports a registry
`Record<CardName, CardBehaviour>`. The name is the key because it is what `cards.yaml` makes
unique; the branded id is per copy and never a key. Vanilla cards (a cost and a stat, no text)
have no entry.

**What a behaviour can say.** Every field optional:

```ts
interface CardBehaviour {
  stats?(state, owner, card): { power: number; scramble: number }   // conditional stats
  onPlay?(state, ctx): StepResult                                   // one-shot effects
  whileHeld?: { costDelta?; stuffPowerDelta?; handCap?; drawCap? }  // Holding: modifiers
  onEvent?(event, state, ctx): StepResult                           // this-turn triggers
}
```

`StepResult` is the same shape `execute` returns internally: a new state, events, and
optionally a pending choice (a peek that needs an order, a Stuff move that needs a target). The
engine resolves the choice through the pending mechanism of ticket 04, so a card never talks to the
UI.

**Behaviours use the engine's own verbs.** Domain exports internal helpers, `exhaustFromDeck`,
`draw`, `moveToHand`, `scrap`, and a behaviour composes them. A behaviour may not touch
state fields directly, so every card effect produces the same events a rule would.

**A card with text and no binding fails the build.** The content drift check (ticket 07) lists
every card whose `text` is set and asserts a registry entry exists. Proposed-set cards are
exempt until they turn official.

**Ruled out.** An effect DSL in the YAML: the text variety in the current list (triggers, cost
modifiers, peeks, conditional stats) would grow the DSL into a language. Cards defined in
TypeScript: breaks the rule that `cards.yaml` is the one place a card is written down.
