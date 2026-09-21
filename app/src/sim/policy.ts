/* Policies: something that picks one of the legal commands.
 *
 * A policy computes no rule. It is handed the state and the list `moves.ts`
 * built, and may run `execute` on copies to look ahead — the engine never
 * mutates, so a lookahead costs nothing but time. Its randomness is the `Rng`
 * it is handed and hands back, never `Math.random`.
 */

import { execute } from "@domain/engine";
import { metThresholds, statPool, thresholdTarget } from "@domain/queries";
import type {
  AscendChoice,
  Card,
  Character,
  Command,
  GameState,
  RoomEffect,
  Threshold,
} from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";
import { legalCommands } from "./moves";
import { pick, type Rng } from "./rng";

export interface Policy {
  readonly name: string;
  /** One of `legal`, or any other command the policy is sure of. */
  choose(state: GameState, legal: readonly Command[], rng: Rng): readonly [Command, Rng];
}

/* ---------------------------------------------------------------- random */

/** A uniform pick over the legal list: the floor any real player stands above. */
export const randomPolicy: Policy = {
  name: "random",
  choose(_state, legal, rng) {
    return pick(legal, rng);
  },
};

/* ---------------------------------------------------------------- greedy */

/** Draw until the hand holds this many... */
const TARGET_HAND = 3;
/** ...unless it would leave fewer than this many cards of stamina in the deck. */
const DECK_RESERVE = 2;

const stats = (card: Card): number => card.oomph + card.scramble;

/** What a room effect is worth to the team. Negative is a punishment. */
function effectValue(effect: RoomEffect): number {
  const heads = effect.who === "both" ? 2 : 1;
  switch (effect.type) {
    case "TakeGoodStuff":
      return 8_000 * effect.count * heads;
    case "RevealReward":
      return 10_000 * heads;
    case "ExhaustFromDeck":
      return -4_000 * effect.amount * heads;
    case "DealBadStuff":
      return -6_000 * heads;
  }
}

function thresholdValue(t: Threshold): number {
  let v = 0;
  if (t.ascends) v += 200_000;
  else if (t.clears) v += 80_000;
  for (const e of t.effects) v += effectValue(e);
  return v;
}

/** How close the pool is to the nearest unmet line, as a fraction of it. */
function progress(state: GameState): number {
  const room = state.activeRoom;
  if (!room) return 0;
  const pool = statPool(state);
  let best = 0;
  for (const t of room.thresholds) {
    const have = t.stat === "Oomph" ? pool.oomph : pool.scramble;
    const target = thresholdTarget(state, t);
    if (target <= 0) continue;
    best = Math.max(best, Math.min(1, have / target));
  }
  return best;
}

/**
 * A number for how well the team is doing, read off a state. Bigger is better.
 * Only ever compared between states reached from the same one, so the scale
 * matters less than the ordering.
 */
export function evaluate(state: GameState): number {
  if (state.outcome === "Victory") return 1e9;
  if (state.outcome === "Defeat") return -1e9;

  let score = state.floor * 1_000_000;
  for (const c of CHARACTERS) {
    const p = playerOf(state, c);
    if (p.down) score -= 300_000;
    if (p.lastStand) score -= 20_000;
    score += p.deck.length * 300;
    for (const card of p.hand) {
      score += card.kind === "bad_stuff" ? -150 : 60 + 40 * stats(card);
    }
  }

  const room = state.activeRoom;
  if (state.phase === "Play" && room) {
    const met = metThresholds(state);
    if (met.length > 0) {
      for (const t of met) score += thresholdValue(t);
    } else {
      score += 30_000 * progress(state);
      for (const e of room.flee.effects) score += effectValue(e);
    }
  }
  return score;
}

/** The state one command leads to, or null when the engine refuses it. */
function after(state: GameState, command: Command): GameState | null {
  const result = execute(state, command);
  return result.ok ? result.state : null;
}

/** The command among `options` whose resulting state scores best, and that score. */
function best(state: GameState, options: readonly Command[]): readonly [Command | null, number] {
  let chosen: Command | null = null;
  let top = Number.NEGATIVE_INFINITY;
  for (const command of options) {
    const next = after(state, command);
    if (!next) continue;
    const score = evaluate(next);
    if (score > top) {
      top = score;
      chosen = command;
    }
  }
  return [chosen, top];
}

function greedyDraw(state: GameState, legal: readonly Command[]): Command {
  for (const command of legal) {
    if (command.type !== "DRAW") continue;
    const p = playerOf(state, command.character);
    if (p.hand.length < TARGET_HAND && p.deck.length > DECK_RESERVE) return command;
  }
  return { type: "END_DRAW" };
}

function greedyPlay(state: GameState, legal: readonly Command[]): Command {
  const plays = legal.filter((c) => c.type === "PLAY_CARD");
  const [chosen, score] = best(state, plays);
  return chosen && score > evaluate(state) ? chosen : { type: "END_PLAY" };
}

/** The strongest card by printed stats; ties go to the first. */
const strongest = (cards: readonly Card[]): Card | null =>
  cards.reduce<Card | null>((top, c) => (top && stats(top) >= stats(c) ? top : c), null);

const weakest = (cards: readonly Card[]): Card | null =>
  cards.reduce<Card | null>((low, c) => (low && stats(low) <= stats(c) ? low : c), null);

/** Take the strongest reward; keep the strongest Stuff if a player card can pay for it. */
export function greedyAscendChoice(state: GameState, c: Character): AscendChoice {
  const offered = state.offer?.[c] ?? [];
  const reward = strongest(offered);
  const pile = playerOf(state, c).discard;
  const keep = strongest(pile.filter((x) => x.kind === "good_stuff"));
  const payer = keep ? weakest(pile.filter((x) => x.kind === "player")) : null;
  return {
    keepStuffId: keep && payer ? keep.id : null,
    scrapId: keep && payer ? payer.id : null,
    takeRewardId: reward?.id ?? null,
  };
}

/**
 * Draws to a target hand while keeping a stamina reserve, plays whatever one
 * step of lookahead says scores best, answers a room's questions the same way,
 * and takes what it is offered. A baseline for the numbers, not a good player.
 */
export const greedyPolicy: Policy = {
  name: "greedy",
  choose(state, legal, rng) {
    if (state.pending) {
      const [chosen] = best(state, legal);
      return [chosen ?? pick(legal, rng)[0], rng];
    }
    switch (state.phase) {
      case "Draw":
        return [greedyDraw(state, legal), rng];
      case "Play":
        return [greedyPlay(state, legal), rng];
      case "Ascend":
        return [
          {
            type: "ASCEND",
            Red: greedyAscendChoice(state, "Red"),
            Gray: greedyAscendChoice(state, "Gray"),
          },
          rng,
        ];
      case "Flip":
      case "GameOver":
        return pick(legal, rng);
    }
  },
};

/* ------------------------------------------------------------- the roster */

export const POLICIES: readonly Policy[] = [randomPolicy, greedyPolicy];

export const policyNamed = (name: string): Policy | null =>
  POLICIES.find((p) => p.name === name) ?? null;

/** For a driver that wants to hand a policy the list without importing moves itself. */
export const legalFor = legalCommands;
