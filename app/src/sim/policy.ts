/* Two policies: a uniform pick over the legal list, and a fixed greedy bot.
 *
 * Random play is what fuzz uses to shake the engine, and an agent playtester
 * stands in for anything smarter about how a person plays. The greedy policy
 * is neither: it is fixed, simple, and deterministic, built to produce
 * balance volume across many seeds for `nvu sim`, not to play well.
 * design/cli-sim/spec.md's "there is no bot" ruling no longer holds; the
 * spec is updated alongside this file.
 */

import { behaviourOf } from "@domain/cards/behaviours";
import { validate } from "@domain/engine";
import {
  allThresholds,
  contributionOf,
  costOf,
  exhaustXPreventedBy,
  metThresholds,
  ownedPlayerCards,
  statPool,
  thresholdIsMet,
  thresholdRequirement,
  type StatTotals,
} from "@domain/queries";
import type {
  AscendChoice,
  Card,
  CardId,
  Character,
  Command,
  GameState,
  RoomEffect,
  RoomId,
  Stat,
  Threshold,
} from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";
import { pick, type Rng } from "./rng";

export interface Policy {
  readonly name: string;
  /** One of `legal`, or any other command the policy is sure of. */
  choose(state: GameState, legal: readonly Command[], rng: Rng): readonly [Command, Rng];
}

/** A uniform pick over the legal list: the floor any real player stands above. */
export const randomPolicy: Policy = {
  name: "random",
  choose(_state, legal, rng) {
    return pick(legal, rng);
  },
};

/* --------------------------------------------------------------- greedy */

const statValue = (totals: StatTotals, stat: Stat): number =>
  stat === "Oomph" ? totals.oomph : totals.scramble;

/** Has the room already been Cleared by something the pool now meets? */
function roomIsCleared(state: GameState): boolean {
  return metThresholds(state).some((t) => t.clears);
}

/** What the pool still lacks to meet this line, per stat, never below zero. */
function deficitOf(state: GameState, t: Threshold): StatTotals {
  const pool = statPool(state);
  const req = thresholdRequirement(state, t);
  return { oomph: Math.max(0, req.oomph - pool.oomph), scramble: Math.max(0, req.scramble - pool.scramble) };
}

/** How much of `gain` closes `deficit`: a stat the line does not ask for counts for nothing. */
const towards = (gain: StatTotals, deficit: StatTotals): number =>
  Math.min(gain.oomph, deficit.oomph) + Math.min(gain.scramble, deficit.scramble);

const lessDeficit = (deficit: StatTotals, gain: StatTotals): StatTotals => ({
  oomph: Math.max(0, deficit.oomph - gain.oomph),
  scramble: Math.max(0, deficit.scramble - gain.scramble),
});

/**
 * A room line's printed consequences as one number: Stuff gained and a
 * reward revealed count up, cards Exhausted and Bad Stuff dealt count down.
 * Only what is permanent is counted — paying and discarding are not.
 */
function effectsValue(effects: readonly RoomEffect[]): number {
  let value = 0;
  for (const e of effects) {
    const heads = e.who === "both" ? 2 : 1;
    switch (e.type) {
      case "ExhaustFromDeck":
        value -= heads * e.amount;
        break;
      case "DealBadStuff":
        value -= heads * e.count;
        break;
      case "TakeGoodStuff":
        value += heads * e.count;
        break;
      case "RevealReward":
      case "ScrapBadStuffFromHand":
        value += 1;
        break;
    }
  }
  return value;
}

/**
 * The permanent loss this card's own printed text would cost right now: a
 * bare `Exhaust X` line (Overdrive, Reckless Swing, Reckless, Panic), unless
 * this character holds something that stops it (Zen Mode). Payment cost is
 * not part of this — paying only discards, it does not lose a card for good.
 */
function exhaustCost(state: GameState, character: Character, card: Card): number {
  const x = behaviourOf(card.name)?.exhaustX ?? 0;
  if (x === 0) return 0;
  return exhaustXPreventedBy(state, character) ? 0 : x;
}

/**
 * How much a card in hand is worth keeping while the turn still needs
 * `deficit`: Bad Stuff is worth less than nothing (paying with it is the
 * cheapest way to be rid of a `Holding:` line), then a card counts by what
 * it would add toward the line, then by its raw stats, and a card that
 * needs payers itself is worth a little less than one that plays free.
 */
function keepValue(state: GameState, character: Character, card: Card, deficit: StatTotals): number {
  if (card.kind === "bad_stuff") return -1;
  const gain = contributionOf(state, { owner: character, card });
  return towards(gain, deficit) * 10 + gain.oomph + gain.scramble - costOf(state, character, card);
}

interface Step {
  readonly character: Character;
  readonly card: Card;
}

interface Plan {
  readonly steps: readonly Step[];
  /** Cards played and paid, both hands together. */
  readonly spent: number;
  /** Cards the plan's own plays would Exhaust. */
  readonly harm: number;
}

/**
 * The plays that would close this line's deficit before the turn ends, by a
 * rule a person at the table could follow: play the card that closes the most
 * of what is still missing (a card's Scramble is no help toward an Oomph
 * line), pay for it with the cards worth least, and repeat. Both hands are
 * walked together, so Red's Oomph and Gray's Scramble stack on the one line
 * a dual-stat threshold asks for. Null when the hands cannot get there, which
 * is the moment to stop rather than pour cards into a room getting Fled anyway.
 */
function planFor(state: GameState, target: Threshold): Plan | null {
  let deficit = deficitOf(state, target);
  const hands: Record<Character, readonly Card[]> = {
    Red: playerOf(state, "Red").down ? [] : playerOf(state, "Red").hand,
    Gray: playerOf(state, "Gray").down ? [] : playerOf(state, "Gray").hand,
  };
  const steps: Step[] = [];
  let spent = 0;
  let harm = 0;
  while (deficit.oomph > 0 || deficit.scramble > 0) {
    let best: { character: Character; card: Card; gain: number; harm: number; cost: number } | null = null;
    for (const character of CHARACTERS) {
      for (const card of hands[character]) {
        const cost = costOf(state, character, card);
        if (cost > hands[character].length - 1) continue;
        const gain = towards(contributionOf(state, { owner: character, card }), deficit);
        if (gain === 0) continue;
        const h = exhaustCost(state, character, card);
        const better =
          best === null ||
          gain > best.gain ||
          (gain === best.gain && h < best.harm) ||
          (gain === best.gain && h === best.harm && cost < best.cost) ||
          (gain === best.gain && h === best.harm && cost === best.cost && card.id < best.card.id);
        if (better) best = { character, card, gain, harm: h, cost };
      }
    }
    if (best === null) return null;
    const chosen = best;
    const others = [...hands[chosen.character]]
      .filter((c) => c.id !== chosen.card.id)
      .sort((a, b) => keepValue(state, chosen.character, a, deficit) - keepValue(state, chosen.character, b, deficit) || a.id.localeCompare(b.id));
    hands[chosen.character] = others.slice(chosen.cost);
    deficit = lessDeficit(deficit, contributionOf(state, { owner: chosen.character, card: chosen.card }));
    steps.push({ character: chosen.character, card: chosen.card });
    spent += 1 + chosen.cost;
    harm += chosen.harm;
  }
  return { steps, spent, harm };
}

interface Target {
  readonly threshold: Threshold;
  readonly plan: Plan;
  /** The line's printed outcome, less what reaching it would Exhaust. */
  readonly value: number;
}

/**
 * Which line to go for this turn, if any: the reachable Clearing line the
 * team comes out of best — an Ascend above all, then the outcome worth most
 * once the plan's own Exhaust is taken off, then the fewest cards spent,
 * then printed order. Null when Fleeing costs less than any reachable line
 * (the room only shuffles back into the Floor deck, while an Exhaust is for
 * good), or, once the room is already Cleared, when no further line would
 * add anything.
 */
function chooseTarget(state: GameState): Target | null {
  const room = state.activeRoom;
  if (!room) return null;
  let best: Target | null = null;
  for (const threshold of allThresholds(room)) {
    if (!threshold.clears || thresholdIsMet(state, threshold)) continue;
    const plan = planFor(state, threshold);
    if (!plan) continue;
    const value = effectsValue(threshold.effects) - plan.harm;
    const better =
      best === null ||
      (threshold.ascends && !best.threshold.ascends) ||
      (threshold.ascends === best.threshold.ascends &&
        (value > best.value || (value === best.value && plan.spent < best.plan.spent)));
    if (better) best = { threshold, plan, value };
  }
  if (!best || best.threshold.ascends) return best;
  const floor = roomIsCleared(state) ? 0 : effectsValue(room.flee.effects);
  const worthIt = roomIsCleared(state) ? best.value > floor : best.value >= floor;
  return worthIt ? best : null;
}

function findInHand(state: GameState, character: Character, id: CardId): Card | undefined {
  return playerOf(state, character).hand.find((c) => c.id === id);
}

function tieBreak(payWith: readonly CardId[]): string {
  return [...payWith].sort().join(",");
}

/** Pick a line, play the first card of the plan that reaches it, and pay with what is worth least. */
function choosePlay(state: GameState, legal: readonly Command[]): Command {
  const plays = legal.filter((c): c is Extract<Command, { type: "PLAY_CARD" }> => c.type === "PLAY_CARD");
  const endPlay = legal.find((c) => c.type === "END_PLAY");
  if (!endPlay) throw new Error("greedy: Play phase offered no END_PLAY");
  if (plays.length === 0) return endPlay;

  const target = chooseTarget(state);
  const step = target?.plan.steps[0];
  if (!target || !step) return endPlay;

  const candidates = plays.filter((p) => p.character === step.character && p.cardId === step.card.id);
  let best = candidates[0];
  if (!best) return endPlay;
  const deficit = deficitOf(state, target.threshold);
  const worth = (payWith: readonly CardId[]): number =>
    payWith.reduce((sum, id) => {
      const card = findInHand(state, step.character, id);
      return sum + (card ? keepValue(state, step.character, card, deficit) : 0);
    }, 0);
  for (const c of candidates.slice(1)) {
    const diff = worth(c.payWith) - worth(best.payWith);
    if (diff < 0 || (diff === 0 && tieBreak(c.payWith) < tieBreak(best.payWith))) best = c;
  }
  return best;
}

/** Which stat this character's non-Stuff cards lean on least, going by what's still in deck, hand and discard. */
function weakerStat(state: GameState, character: Character): Stat {
  let oomph = 0;
  let scramble = 0;
  for (const card of ownedPlayerCards(state, character)) {
    oomph += card.oomph;
    scramble += card.scramble;
  }
  return oomph <= scramble ? "Oomph" : "Scramble";
}

/** The Exhaust this card would tax the deck with every time it gets played, taking it in the abstract. */
const printedExhaustCost = (card: Card): number => behaviourOf(card.name)?.exhaustX ?? 0;

/**
 * Favor the character's weaker stat, then raw power as a tie-break, docked
 * for a printed `Exhaust X` — Reckless's 5 Oomph is not worth taking over a
 * clean 4 if it also taxes the deck 3 cards every time it gets played.
 */
function rewardScore(card: Card, weak: Stat): number {
  const raw = statValue({ oomph: card.oomph, scramble: card.scramble }, weak) * 2 + card.oomph + card.scramble;
  return raw - 2 * printedExhaustCost(card);
}

function chooseReward(state: GameState, character: Character): CardId | null {
  const offered = state.offer?.[character] ?? [];
  const first = offered[0];
  if (!first) return null;
  const weak = weakerStat(state, character);
  let best = first;
  let bestScore = rewardScore(first, weak);
  for (const card of offered.slice(1)) {
    const score = rewardScore(card, weak);
    if (score > bestScore || (score === bestScore && card.id < best.id)) {
      best = card;
      bestScore = score;
    }
  }
  return best.id;
}

/** One character's whole Ascend, decided independently of the other's: take the reward that best fits the deck. */
function composeChoice(state: GameState, character: Character): AscendChoice {
  return { takeRewardId: chooseReward(state, character) };
}

function chooseAscend(state: GameState): Command {
  const composed: Command = {
    type: "ASCEND",
    Red: composeChoice(state, "Red"),
    Gray: composeChoice(state, "Gray"),
  };
  const rejection = validate(state, composed);
  if (rejection !== null) throw new Error(`greedy: composed Ascend command rejected: ${rejection.message}`);
  return composed;
}

function cardsDeepEqual(a: readonly (CardId | RoomId)[], b: readonly (CardId | RoomId)[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** Cards not asked about have no greedy opinion: sacrifice the cheapest, decline what is optional. */
function choosePending(state: GameState, legal: readonly Command[]): Command {
  const pending = state.pending;
  if (!pending) throw new Error("greedy: no pending choice to answer");

  if (pending.kind === "TakeReward") {
    const take = legal.find((c) => c.type === "TAKE_REWARD" && c.take);
    if (take) return take;
  }

  if (pending.kind === "ChooseCharacter") {
    const wanted = pending.options[0];
    const found = legal.find((c) => c.type === "CHOOSE_CHARACTER" && c.character === wanted);
    if (found) return found;
  }

  if (pending.kind === "ChoosePile") {
    const wanted = pending.options.includes("Floor deck") ? "Floor deck" : pending.options[0];
    const found = legal.find((c) => c.type === "CHOOSE_PILE" && c.pile === wanted);
    if (found) return found;
  }

  if (pending.kind === "ChooseCards") {
    // Optional means no greedy opinion favors taking it over not — decline,
    // same as the comment above always meant to (e.g. Level Up's "Scrap a
    // card?" is a bad trade the moment the Rewards pool it draws from is
    // empty, and this prompt carries nothing that says which case it is).
    const wanted = pending.optional ? 0 : Math.min(pending.count, pending.options.length);
    const desired =
      wanted === 0
        ? []
        : [...pending.options]
            .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id))
            .slice(0, wanted);
    const desiredIds = pending.options.filter((c) => desired.includes(c)).map((c) => c.id);
    const found = legal.find((c) => c.type === "CHOOSE_CARDS" && cardsDeepEqual(c.cardIds, desiredIds));
    if (found) return found;
  }

  if (pending.kind === "OrderCards") {
    const desiredIds = pending.cards.map((c) => c.id);
    const found = legal.find((c) => c.type === "ORDER_CARDS" && cardsDeepEqual(c.cardIds, desiredIds));
    if (found) return found;
  }

  const fallback = legal[0];
  if (!fallback) throw new Error("greedy: no legal move to answer a pending choice");
  return fallback;
}

/**
 * A fixed, deterministic bot: pick the room line the team comes out of best,
 * play toward that one line, pay with the cards worth least, Flee when
 * Clearing would cost more, and take the reward. It never draws on `rng` —
 * ties are broken by card id — so the same seed always plays the same game.
 * Everywhere but Ascend it only answers from the move generator's own legal
 * list; at Ascend it composes its own `ASCEND` command (see `composeChoice`)
 * and validates it against the engine, because the generator's own list caps
 * out well before two independent characters' choices fit in it.
 */
export const greedyPolicy: Policy = {
  name: "greedy",
  choose(state, legal, rng) {
    if (state.pending) return [choosePending(state, legal), rng];
    switch (state.phase) {
      case "Turn Start": {
        const flip = legal[0];
        if (!flip) throw new Error("greedy: Turn Start offered no legal move");
        return [flip, rng];
      }
      case "Play":
        return [choosePlay(state, legal), rng];
      case "Ascend":
        return [chooseAscend(state), rng];
      case "Outcome":
      case "Cleanup":
        throw new Error(`greedy: asked to choose during automatic ${state.phase} with nothing pending`);
      case "GameOver":
        throw new Error("greedy: asked to choose after GameOver");
    }
  },
};

export const POLICIES: Readonly<Record<"random" | "greedy", Policy>> = {
  random: randomPolicy,
  greedy: greedyPolicy,
};
