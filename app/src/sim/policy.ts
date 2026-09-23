/* Two policies: a uniform pick over the legal list, and a fixed greedy bot.
 *
 * Random play is what fuzz uses to shake the engine, and an agent playtester
 * stands in for anything smarter about how a person plays. The greedy policy
 * (issue #93) is neither: it is fixed, simple, and deterministic, built to
 * produce balance volume across many seeds for `nvu sim`, not to play well.
 * design/cli-sim/spec.md's "there is no bot" ruling predates this issue; the
 * spec is updated alongside this file.
 */

import {
  contributionOf,
  metThresholds,
  settleableStuff,
  statPool,
  thresholdIsMet,
  thresholdTarget,
  type StatTotals,
} from "@domain/queries";
import type { AscendChoice, Card, CardId, Character, Command, GameState, Stat } from "@domain/types";
import { playerOf } from "@domain/verbs";
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

/**
 * Would adding `card`'s contribution meet a Clearing threshold the pool has
 * not already met? A "flee this room for free" threshold (`clears: false`)
 * does not Clear the room on its own (rulebook, Outcome), so it does not count.
 */
function clearsARoom(state: GameState, character: Character, card: Card): boolean {
  const room = state.activeRoom;
  if (!room) return false;
  const before = statPool(state);
  const gain = contributionOf(state, { owner: character, card });
  const after: StatTotals = { oomph: before.oomph + gain.oomph, scramble: before.scramble + gain.scramble };
  return room.thresholds.some(
    (t) => t.clears && !thresholdIsMet(state, t) && statValue(after, t.stat) >= thresholdTarget(state, t),
  );
}

/** Has the room already been Cleared by something the pool now meets? */
function roomIsCleared(state: GameState): boolean {
  return metThresholds(state).some((t) => t.clears);
}

function findInHand(state: GameState, character: Character, id: CardId): Card | undefined {
  return playerOf(state, character).hand.find((c) => c.id === id);
}

/** "Pay with the cheapest cards": minimize what the payment itself is worth, hand back distinct ties. */
function paymentValue(state: GameState, character: Character, payWith: readonly CardId[]): number {
  return payWith.reduce((sum, id) => sum + (findInHand(state, character, id)?.cost ?? 0), 0);
}

function tieBreak(payWith: readonly CardId[]): string {
  return [...payWith].sort().join(",");
}

/** "Play the cards that clear the room", then make the most progress, then pay cheap. */
function choosePlay(state: GameState, legal: readonly Command[]): Command {
  const plays = legal.filter((c): c is Extract<Command, { type: "PLAY_CARD" }> => c.type === "PLAY_CARD");
  const endPlay = legal.find((c) => c.type === "END_PLAY");
  if (!endPlay) throw new Error("greedy: Play phase offered no END_PLAY");
  if (plays.length === 0) return endPlay;
  if (roomIsCleared(state)) return endPlay; // Already cleared — stop spending stamina.

  let bestCharacter: Character | null = null;
  let bestCardId: CardId | null = null;
  let bestClears = false;
  let bestTotal = -1;
  const seen = new Set<string>();
  for (const play of plays) {
    const key = `${play.character}:${String(play.cardId)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const card = findInHand(state, play.character, play.cardId);
    if (!card) continue;
    const clears = clearsARoom(state, play.character, card);
    const gain = contributionOf(state, { owner: play.character, card });
    const total = gain.oomph + gain.scramble;
    const better =
      bestCardId === null ||
      (clears && !bestClears) ||
      (clears === bestClears && total > bestTotal) ||
      (clears === bestClears &&
        total === bestTotal &&
        (play.character < (bestCharacter ?? play.character) ||
          (play.character === bestCharacter && play.cardId < bestCardId)));
    if (better) {
      bestCharacter = play.character;
      bestCardId = play.cardId;
      bestClears = clears;
      bestTotal = total;
    }
  }
  if (bestCharacter === null || bestCardId === null) return endPlay;

  const character = bestCharacter;
  const cardId = bestCardId;
  const candidates = plays.filter((p) => p.character === character && p.cardId === cardId);
  let best = candidates[0];
  if (!best) return endPlay;
  for (const c of candidates.slice(1)) {
    const diff = paymentValue(state, character, c.payWith) - paymentValue(state, character, best.payWith);
    if (diff < 0 || (diff === 0 && tieBreak(c.payWith) < tieBreak(best.payWith))) best = c;
  }
  return best;
}

/** "Keep Good Stuff when you can pay for it, and shed Bad Stuff when you can." */
function scoreAscend(state: GameState, red: AscendChoice, gray: AscendChoice): number {
  let score = 0;
  for (const [character, choice] of [
    ["Red", red],
    ["Gray", gray],
  ] as const) {
    if (choice.takeRewardId !== null) score += 100;
    const stuff = settleableStuff(state, character);
    for (const settlement of choice.settle) {
      const card = stuff.find((s) => s.id === settlement.cardId);
      if (!card || settlement.payWith === null) continue;
      score += card.kind === "good_stuff" ? 50 : card.kind === "bad_stuff" ? 25 : 0;
    }
  }
  return score;
}

function chooseAscend(state: GameState, legal: readonly Command[]): Command {
  const ascends = legal.filter((c): c is Extract<Command, { type: "ASCEND" }> => c.type === "ASCEND");
  const first = ascends[0];
  if (!first) throw new Error("greedy: Ascend phase offered no ASCEND command");
  let best = first;
  let bestScore = scoreAscend(state, first.Red, first.Gray);
  for (const c of ascends.slice(1)) {
    const score = scoreAscend(state, c.Red, c.Gray);
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

function cardsDeepEqual(a: readonly CardId[], b: readonly CardId[]): boolean {
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

  if (pending.kind === "ChooseCards") {
    const wanted = Math.min(pending.count, pending.options.length);
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
 * A fixed, deterministic bot (issue #93): play what clears the room, pay
 * with the cheapest cards, take the reward, keep Good Stuff you can pay for
 * and shed Bad Stuff you can. It never draws on `rng` — ties are broken by
 * card id — so the same seed always plays the same game.
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
        return [chooseAscend(state, legal), rng];
      case "GameOver":
        throw new Error("greedy: asked to choose after GameOver");
    }
  },
};

export const POLICIES: Readonly<Record<"random" | "greedy", Policy>> = {
  random: randomPolicy,
  greedy: greedyPolicy,
};
