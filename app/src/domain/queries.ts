/* Pure reads of the state. The UI computes no rule; it asks one of these.
 *
 * Nothing here changes anything. Every answer is derived from the state handed
 * in, so a conditional stat is recalculated every time the pool is read.
 */

import { behaviourOf, type HeldModifiers } from "./cards/behaviours";
import { DIM_HAND_CAP, HAND_CAP } from "./setup";
import type {
  Card,
  CardId,
  Character,
  DomainEvent,
  GameState,
  PlayedCard,
  Room,
  Stat,
  Threshold,
} from "./types";
import { CHARACTERS, other, playerOf } from "./verbs";

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
  return exhaustPreventedBy(state, c);
}

/* ------------------------------------------------- what a played card changes */

const inPlay = (card: Card) => behaviourOf(card.name)?.whileInPlay;

/** The card on this character's side of the play zone that stops every Exhaust of their cards, if one is. */
export function exhaustPreventedBy(state: GameState, c: Character): Card | null {
  const found = state.playZone.find((p) => p.owner === c && inPlay(p.card)?.preventsExhaust === true);
  return found ? found.card : null;
}

/** Whether either character may pay with cards from the other's hand. */
export const handsShared = (state: GameState): boolean =>
  state.playZone.some((p) => inPlay(p.card)?.sharesHands === true);

/**
 * Each Turn, Turn Start: draw up to 5, or up to 4 under a Dim Active Room. A
 * "draw N fewer" `Holding:` line comes off that target; copies stack, and the
 * target never goes below 0.
 */
export const drawTargetFor = (state: GameState, c: Character): number => {
  const dim = state.activeRoom?.keywords.includes("Dim") ?? false;
  return Math.max(0, (dim ? DIM_HAND_CAP : HAND_CAP) - heldModifiers(state, c).drawTargetDelta);
};

/* ------------------------------------------------------------- the play zone */

/** How many cards a character has played this turn. */
export const playedBy = (state: GameState, c: Character): number =>
  state.playZone.filter((p) => p.owner === c).length;

/** How many cards a character has played this turn, this card excluded. */
export const othersPlayed = (state: GameState, c: Character, self: Card): number =>
  state.playZone.filter((p) => p.owner === c && p.card.id !== self.id).length;

/* ------------------------------------------------------------- the stat pool */

/**
 * Bad Stuff cards print no Stats line, so they contribute none, whatever else
 * they do. Conditional stats are recalculated every time the pool is read.
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
    scramble: Math.max(0, base.scramble + stuffDelta),
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
  // System Feedback banks a loss and Red's and Gray's Stuff a gain
  // against the shared pool, not either side's own display-only contribution.
  if (side) return { oomph, scramble };
  return {
    oomph: Math.max(0, oomph - state.thisTurn.poolPenalty.oomph + state.thisTurn.poolBonus.oomph),
    scramble: Math.max(
      0,
      scramble - state.thisTurn.poolPenalty.scramble + state.thisTurn.poolBonus.scramble,
    ),
  };
}

/**
 * What one player played this turn: their side's total from `statPool`, plus
 * any gain or loss a card of theirs banked. "The player who played the least
 * Scramble" reads this; a stat never reads below zero.
 */
export function playedStats(state: GameState, side: Character): StatTotals {
  const own = statPool(state, side);
  const banked = state.thisTurn.banked[side];
  return {
    oomph: Math.max(0, own.oomph + banked.oomph),
    scramble: Math.max(0, own.scramble + banked.scramble),
  };
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

/**
 * What a printed threshold actually asks of the pool right now: Panic (and
 * anything like it) only ever raises the Scramble side, whether a line
 * already carried one or not (cards.yaml, Panic).
 */
export function thresholdRequirement(state: GameState, threshold: Threshold): StatTotals {
  return {
    oomph: threshold.requires.oomph,
    scramble: threshold.requires.scramble + thresholdScrambleDelta(state),
  };
}

/**
 * Is this line's threshold met? A threshold that prints both stats is met
 * only when the pool meets or exceeds both (rulebook.md).
 */
export function thresholdIsMet(state: GameState, threshold: Threshold): boolean {
  const pool = statPool(state);
  const req = thresholdRequirement(state, threshold);
  return pool.oomph >= req.oomph && pool.scramble >= req.scramble;
}

/** One stat line a threshold should show right now, whether printed or added by something held. */
export interface ThresholdLine {
  readonly stat: Stat;
  readonly effective: number;
  readonly printed: number;
}

/** The printed stat lines of a threshold, with no state to weigh a held modifier against. */
export function printedThresholdLines(threshold: Threshold): readonly ThresholdLine[] {
  const lines: ThresholdLine[] = [];
  if (threshold.requires.oomph > 0) {
    lines.push({ stat: "Oomph", effective: threshold.requires.oomph, printed: threshold.requires.oomph });
  }
  if (threshold.requires.scramble > 0) {
    lines.push({ stat: "Scramble", effective: threshold.requires.scramble, printed: threshold.requires.scramble });
  }
  return lines;
}

/**
 * The stat lines a threshold should display right now — every stat it prints,
 * plus Scramble if something held adds it where none was printed (Panic
 * against an Oomph-only line).
 */
export function thresholdLines(state: GameState, threshold: Threshold): readonly ThresholdLine[] {
  const req = thresholdRequirement(state, threshold);
  const lines: ThresholdLine[] = [];
  if (threshold.requires.oomph > 0 || req.oomph > 0) {
    lines.push({ stat: "Oomph", effective: req.oomph, printed: threshold.requires.oomph });
  }
  if (threshold.requires.scramble > 0 || req.scramble > 0) {
    lines.push({ stat: "Scramble", effective: req.scramble, printed: threshold.requires.scramble });
  }
  return lines;
}

/** Every Threshold printed on a room, across every Challenge, in printed order. */
export function allThresholds(room: Room): readonly Threshold[] {
  return room.challenges.flatMap((c) => c.thresholds);
}

/** Every line of the active room the pool currently meets, for display — not what resolves. */
export function metThresholds(state: GameState): readonly Threshold[] {
  const room = state.activeRoom;
  if (!room) return [];
  return allThresholds(room).filter((t) => thresholdIsMet(state, t));
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
  // Pivot: a banked charge takes 1 off this character's very next play.
  const discount = state.thisTurn.playDiscount[c] > 0 ? 1 : 0;
  return Math.max(0, base + heldModifiers(state, c).costDelta - discount);
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
 * and Gray's hand are separate, so Red never pays for Gray. Bad Stuff cannot
 * pay for other cards.
 */
export function payOptions(state: GameState, c: Character, cardId: CardId): readonly Card[] {
  const own = playerOf(state, c).hand.filter((x) => x.id !== cardId);
  const pool = handsShared(state) ? [...own, ...playerOf(state, other(c)).hand] : own;
  return pool.filter((x) => x.kind !== "bad_stuff");
}

/** The cards this character could play right now, cost and all. */
export function playableCards(state: GameState, c: Character): readonly Card[] {
  if (state.phase !== "Play" || state.pending !== null) return [];
  const p = playerOf(state, c);
  if (p.down) return [];
  return p.hand.filter((card) => payOptions(state, c, card.id).length >= costOf(state, c, card));
}

/** Every non-Stuff card this character owns, across deck, hand and discard pile. */
export function ownedPlayerCards(state: GameState, c: Character): readonly Card[] {
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
  "GOOD_STUFF_REVEALED",
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
