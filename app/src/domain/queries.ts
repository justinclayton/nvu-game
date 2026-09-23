/* Pure reads of the state. The UI computes no rule; it asks one of these.
 *
 * Nothing here changes anything. Every answer is derived from the state handed
 * in, so a conditional stat is recalculated every time the pool is read.
 */

import { behaviourOf, type HeldModifiers } from "./cards/behaviours";
import { HAND_CAP } from "./setup";
import type {
  Card,
  CardId,
  Character,
  DomainEvent,
  GameState,
  PlayedCard,
  Stat,
  Threshold,
} from "./types";
import { CHARACTERS, playerOf } from "./verbs";

export interface StatTotals {
  readonly oomph: number;
  readonly scramble: number;
}

/* ------------------------------------------------- what a held card changes */

interface Modifiers {
  readonly costDelta: number;
  readonly ignoresExhaustX: boolean;
  readonly playedPowerDelta: number;
  readonly stuffPowerDelta: number;
  readonly drawTargetDelta: number;
}

const NO_MODIFIERS: Modifiers = {
  costDelta: 0,
  ignoresExhaustX: false,
  playedPowerDelta: 0,
  stuffPowerDelta: 0,
  drawTargetDelta: 0,
};

const held = (card: Card): HeldModifiers | undefined => behaviourOf(card.name)?.whileHeld;

/** Every `Holding:` line in one character's hand, added up. */
export function heldModifiers(state: GameState, c: Character): Modifiers {
  let m = NO_MODIFIERS;
  for (const card of playerOf(state, c).hand) {
    const h = held(card);
    if (!h) continue;
    m = {
      costDelta: m.costDelta + (h.costDelta ?? 0),
      ignoresExhaustX: m.ignoresExhaustX || (h.ignoresExhaustX ?? false),
      playedPowerDelta: m.playedPowerDelta + (h.playedPowerDelta ?? 0),
      stuffPowerDelta: m.stuffPowerDelta + (h.stuffPowerDelta ?? 0),
      drawTargetDelta: m.drawTargetDelta + (h.drawTargetDelta ?? 0),
    };
  }
  return m;
}

/**
 * The card in this character's hand that is stopping bare `Exhaust X` lines, if
 * one is. Named rather than merely counted, so the log can say what happened.
 */
export function exhaustXPreventedBy(state: GameState, c: Character): Card | null {
  for (const card of playerOf(state, c).hand) {
    if (held(card)?.ignoresExhaustX === true) return card;
  }
  return null;
}

/**
 * Each Turn, Turn Start: draw up to 5. A "draw N fewer" `Holding:` line comes
 * off that target; copies stack, and the target never goes below 0.
 */
export const drawTargetFor = (state: GameState, c: Character): number =>
  Math.max(0, HAND_CAP - heldModifiers(state, c).drawTargetDelta);

/* ------------------------------------------------------------- the stat pool */

/**
 * Bad Stuff cards print no Stats line, so they contribute none, whatever else
 * they do. Conditional stats are recalculated every time the pool is read.
 *
 * A contribution never goes below zero: a card that is reduced past nothing
 * contributes nothing rather than draining the pool.
 */
export function contributionOf(state: GameState, played: PlayedCard): StatTotals {
  const { owner, card } = played;
  if (card.kind === "bad_stuff") return { oomph: 0, scramble: 0 };
  const behaviour = behaviourOf(card.name);
  const base = behaviour?.stats
    ? behaviour.stats(state, owner, card)
    : { oomph: card.oomph, scramble: card.scramble };
  const m = heldModifiers(state, owner);
  const stuffDelta = card.kind === "good_stuff" ? m.stuffPowerDelta : 0;
  return {
    oomph: Math.max(0, base.oomph + m.playedPowerDelta + stuffDelta),
    scramble: Math.max(0, base.scramble),
  };
}

/**
 * Each Turn, Play: the stats on played cards form one shared pool across both characters.
 * Every Room's Challenge is checked against this pool, whatever the room's
 * printed type (rulebook, Outcome). `side` narrows it to one character's own
 * contribution, which no rule measures a Challenge against — it exists for
 * display only.
 */
export function statPool(state: GameState, side?: Character): StatTotals {
  let oomph = 0;
  let scramble = 0;
  for (const played of state.playZone) {
    if (side && played.owner !== side) continue;
    const c = contributionOf(state, played);
    oomph += c.oomph;
    scramble += c.scramble;
  }
  return { oomph, scramble };
}

/** A card that says "ALL rooms require an additional N Scramble" is read from either hand. */
function thresholdScrambleDelta(state: GameState): number {
  let delta = 0;
  for (const c of CHARACTERS) {
    for (const card of playerOf(state, c).hand) {
      delta += held(card)?.thresholdScrambleDelta ?? 0;
    }
  }
  return delta;
}

/** What a printed threshold actually asks for right now. */
export function thresholdTarget(state: GameState, threshold: Threshold): number {
  const extra = threshold.stat === "Scramble" ? thresholdScrambleDelta(state) : 0;
  return threshold.value + extra;
}

/**
 * Panic doesn't just raise Scramble lines — it makes every line need Scramble.
 * An Oomph line picks up its own Scramble floor; a Scramble line already
 * carries the same delta on its own target, so it needs no second floor.
 */
export function extraScrambleRequirement(state: GameState, threshold: Threshold): number {
  return threshold.stat === "Scramble" ? 0 : thresholdScrambleDelta(state);
}

const statOf = (totals: StatTotals, stat: Stat): number =>
  stat === "Oomph" ? totals.oomph : totals.scramble;

/** Is this line's threshold met? Every Challenge reads the shared pool. */
export function thresholdIsMet(state: GameState, threshold: Threshold): boolean {
  const pool = statPool(state);
  const meetsMain = statOf(pool, threshold.stat) >= thresholdTarget(state, threshold);
  const meetsExtra = pool.scramble >= extraScrambleRequirement(state, threshold);
  return meetsMain && meetsExtra;
}

/** Every line of the active room the pool currently meets. */
export function metThresholds(state: GameState): readonly Threshold[] {
  const room = state.activeRoom;
  if (!room) return [];
  return room.thresholds.filter((t) => thresholdIsMet(state, t));
}

/* ---------------------------------------------------------------- the costs */

/**
 * A reason a card may be played for nothing, whatever it prints.
 *
 * An override is not a modifier: it wins outright instead of adjusting the
 * printed cost, so no `Holding:` line can raise a cost back off zero. A
 * one-shot override is used up by the card it pays for.
 */
export interface CostOverride {
  /** Named, so a log line or a label can say why a card was free. */
  readonly reason: "free play";
  /** Playing a card through this override uses it up. */
  readonly oneShot: boolean;
}

interface CostOverrideRule extends CostOverride {
  /** Is this override there to be used, for this character and this card? */
  readonly available: (state: GameState, c: Character, card: Card) => boolean;
}

/**
 * Everything that can zero a cost, in the order `costOf` reads it. A card that
 * makes a play free says so with a rule here, rather than with another branch
 * inside `costOf`.
 */
const COST_OVERRIDES: readonly CostOverrideRule[] = [
  {
    // Overcharged Battery: the next card played this turn, by either character.
    reason: "free play",
    oneShot: true,
    available: (state) => state.thisTurn.freePlays > 0,
  },
  {
    reason: "free play",
    oneShot: false,
    available: (state, c, card) => behaviourOf(card.name)?.freeIf?.(state, c, card) ?? false,
  },
];

/** The override that would pay for this card right now, if one would. */
export function costOverrideFor(state: GameState, c: Character, card: Card): CostOverride | null {
  const rule = COST_OVERRIDES.find((o) => o.available(state, c, card));
  return rule ? { reason: rule.reason, oneShot: rule.oneShot } : null;
}

/**
 * What the card asks for with nothing overriding it: the number in the corner,
 * or what the card says instead, and then any `Holding:` line.
 */
export function printedCostOf(state: GameState, c: Character, card: Card): number {
  const behaviour = behaviourOf(card.name);
  const base = behaviour?.cost ? behaviour.cost(state, c, card) : card.cost;
  return Math.max(0, base + heldModifiers(state, c).costDelta);
}

/**
 * Each Turn, Play: to play a card you discard cards from your hand equal to its Cost.
 */
export function costOf(state: GameState, c: Character, card: Card): number {
  return costOverrideFor(state, c, card) ? 0 : printedCostOf(state, c, card);
}

/**
 * The one-shot override playing this card would use up, if it would use one up.
 *
 * An override is spent only when it saved something: a card that already cost
 * nothing is played for nothing on its own and leaves the discount standing.
 */
export function costOverrideSpentBy(
  state: GameState,
  c: Character,
  card: Card,
): CostOverride | null {
  const override = costOverrideFor(state, c, card);
  if (!override?.oneShot) return null;
  return printedCostOf(state, c, card) > 0 ? override : null;
}

/**
 * Each Turn, Play: you pay in *other* cards from your own hand — Red's hand
 * and Gray's hand are separate, so Red never pays for Gray.
 */
export function payOptions(state: GameState, c: Character, cardId: CardId): readonly Card[] {
  return playerOf(state, c).hand.filter((x) => x.id !== cardId);
}

/** The cards this character could play right now, cost and all. */
export function playableCards(state: GameState, c: Character): readonly Card[] {
  if (state.phase !== "Play" || state.pending !== null) return [];
  const p = playerOf(state, c);
  if (p.down) return [];
  return p.hand.filter((card) => payOptions(state, c, card.id).length >= costOf(state, c, card));
}

/* ------------------------------------------------------------- Rulebook, Ascending */

/**
 * Every Stuff card in this character's deck, hand or discard pile — what
 * Settle your Stuff works through, once Ascending's first step has shuffled
 * the hand into the deck. A Stuff card sitting in hand right now is included
 * here, since that shuffle is what it goes through on its way to being
 * settled.
 */
export function settleableStuff(state: GameState, c: Character): readonly Card[] {
  const p = playerOf(state, c);
  return [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind !== "player");
}

/** Every other owned, non-Stuff card that could pay to settle a Stuff card. */
export function settlePayOptions(state: GameState, c: Character): readonly Card[] {
  const p = playerOf(state, c);
  return [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind === "player");
}

/* -------------------------------------------------------------------- undo */

const REVEALING: ReadonlySet<DomainEvent["type"]> = new Set([
  "FLOOR_BUILT",
  "ROOM_FLIPPED",
  "CARD_DRAWN",
  "CARD_EXHAUSTED",
  "STUFF_TAKEN",
  "CARDS_PEEKED",
  "REWARD_REVEALED",
  "REWARD_TAKEN",
]);

/**
 * Did this command show anybody something they cannot unsee? Undo is allowed
 * back to the last command that did. Playing and paying can be taken back;
 * seeing a card cannot — drawing and Exhausting both turn a hidden top-of-deck
 * card face up, so both count.
 */
export function revealsHiddenInfo(events: readonly DomainEvent[]): boolean {
  return events.some((e) => REVEALING.has(e.type));
}
