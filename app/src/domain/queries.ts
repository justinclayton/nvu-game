/* Pure reads of the state. The UI computes no rule; it asks one of these.
 *
 * Nothing here changes anything. Every answer is derived from the state handed
 * in, so a conditional stat is recalculated every time the pool is read (§5).
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
  readonly power: number;
  readonly scramble: number;
}

/* ------------------------------------------------- what a held card changes */

interface Modifiers {
  readonly costDelta: number;
  readonly playedPowerDelta: number;
  readonly stuffPowerDelta: number;
  readonly handCap: number;
  readonly drawCap: number;
}

const NO_MODIFIERS: Modifiers = {
  costDelta: 0,
  playedPowerDelta: 0,
  stuffPowerDelta: 0,
  handCap: HAND_CAP,
  drawCap: Number.POSITIVE_INFINITY,
};

const held = (card: Card): HeldModifiers | undefined => behaviourOf(card.name)?.whileHeld;

/** Every `Holding:` line in one character's hand, added up. Caps take the tightest. */
export function heldModifiers(state: GameState, c: Character): Modifiers {
  let m = NO_MODIFIERS;
  for (const card of playerOf(state, c).hand) {
    const h = held(card);
    if (!h) continue;
    m = {
      costDelta: m.costDelta + (h.costDelta ?? 0),
      playedPowerDelta: m.playedPowerDelta + (h.playedPowerDelta ?? 0),
      stuffPowerDelta: m.stuffPowerDelta + (h.stuffPowerDelta ?? 0),
      handCap: Math.min(m.handCap, h.handCap ?? HAND_CAP),
      drawCap: Math.min(m.drawCap, h.drawCap ?? Number.POSITIVE_INFINITY),
    };
  }
  return m;
}

/** §5: maximum hand size is 5, and `Hold` counts against it. A card may tighten it. */
export const handCapFor = (state: GameState, c: Character): number =>
  heldModifiers(state, c).handCap;

/** How deep a character may draw this turn. Unlimited unless a card says otherwise. */
export const drawCapFor = (state: GameState, c: Character): number =>
  heldModifiers(state, c).drawCap;

/* ------------------------------------------------------------- the stat pool */

/**
 * §7: Bad Stuff contributes no stats, whatever else it does.
 * §5: conditional stats are recalculated every time the pool is read.
 *
 * A contribution never goes below zero: a card that is reduced past nothing
 * contributes nothing rather than draining the pool. See open-questions.md #10.
 */
export function contributionOf(state: GameState, played: PlayedCard): StatTotals {
  const { owner, card } = played;
  if (card.kind === "bad_stuff") return { power: 0, scramble: 0 };
  const behaviour = behaviourOf(card.name);
  const base = behaviour?.stats
    ? behaviour.stats(state, owner, card)
    : { power: card.power, scramble: card.scramble };
  const m = heldModifiers(state, owner);
  const stuffDelta = card.kind === "good_stuff" ? m.stuffPowerDelta : 0;
  return {
    power: Math.max(0, base.power + m.playedPowerDelta + stuffDelta),
    scramble: Math.max(0, base.scramble),
  };
}

/**
 * §5: the stats on played cards form one shared pool across both characters.
 * `side` narrows it to one character's own side of the play zone, which is the
 * only thing a Stuff room ever measures (§6).
 */
export function statPool(state: GameState, side?: Character): StatTotals {
  let power = 0;
  let scramble = 0;
  for (const played of state.playZone) {
    if (side && played.owner !== side) continue;
    const c = contributionOf(state, played);
    power += c.power;
    scramble += c.scramble;
  }
  return { power, scramble };
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

const statOf = (totals: StatTotals, stat: Stat): number =>
  stat === "Power" ? totals.power : totals.scramble;

/** Is this line's threshold met? A Stuff room's line reads one character's own side. */
export function thresholdIsMet(state: GameState, threshold: Threshold): boolean {
  const pool = statPool(state, threshold.measuredOn ?? undefined);
  return statOf(pool, threshold.stat) >= thresholdTarget(state, threshold);
}

/** Every line of the active room the pool currently meets. */
export function metThresholds(state: GameState): readonly Threshold[] {
  const room = state.activeRoom;
  if (!room) return [];
  return room.thresholds.filter((t) => thresholdIsMet(state, t));
}

/* ---------------------------------------------------------------- the costs */

/**
 * §5: to play a card you Exhaust cards from your hand equal to its Cost.
 * §9: while in last stand, every card in that hand may be played at no cost.
 */
export function costOf(state: GameState, c: Character, card: Card): number {
  const p = playerOf(state, c);
  if (p.lastStand) return 0;
  if ((state.thisTurn.freePlays[c] ?? 0) > 0) return 0;
  const behaviour = behaviourOf(card.name);
  const base = behaviour?.cost ? behaviour.cost(state, c, card) : card.cost;
  return Math.max(0, base + heldModifiers(state, c).costDelta);
}

/** §5: you pay in *other* cards from your own hand. Red never pays for Gray. */
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

/* ---------------------------------------------------------------- the draw */

/** §5: may this character draw another card right now? */
export function canDraw(state: GameState, c: Character): boolean {
  if (state.phase !== "Draw" || state.pending !== null) return false;
  const p = playerOf(state, c);
  if (p.down || p.lastStand) return false;
  if (p.deck.length === 0) return false;
  if (p.drewThisTurn >= drawCapFor(state, c)) return false;
  // You may not draw *up* while at the cap — but the minimum draw still happens,
  // and that card is Exhausted instead of entering the hand.
  return p.hand.length < handCapFor(state, c) || p.drewThisTurn === 0;
}

/** §5: you must draw at least 1. Last stand and an empty deck are the exceptions (§9). */
export function mustStillDraw(state: GameState, c: Character): boolean {
  const p = playerOf(state, c);
  if (p.down || p.lastStand || p.deck.length === 0) return false;
  return p.drewThisTurn < 1;
}

/* -------------------------------------------------------------------- undo */

const REVEALING: ReadonlySet<DomainEvent["type"]> = new Set([
  "FLOOR_BUILT",
  "ROOM_FLIPPED",
  "CARD_DRAWN",
  "DRAW_BURNED",
  "STUFF_TAKEN",
  "CARDS_PEEKED",
  "REWARD_REVEALED",
  "REWARD_TAKEN",
]);

/**
 * Did this command show anybody something they cannot unsee? Undo is allowed
 * back to the last command that did. Playing and paying can be taken back;
 * seeing a card cannot.
 */
export function revealsHiddenInfo(events: readonly DomainEvent[]): boolean {
  return events.some(
    (e) => REVEALING.has(e.type) || (e.type === "CARD_EXHAUSTED" && e.from === "deck"),
  );
}
