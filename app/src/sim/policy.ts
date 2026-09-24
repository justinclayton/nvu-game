/* Two policies: a uniform pick over the legal list, and a fixed greedy bot.
 *
 * Random play is what fuzz uses to shake the engine, and an agent playtester
 * stands in for anything smarter about how a person plays. The greedy policy
 * (issue #93) is neither: it is fixed, simple, and deterministic, built to
 * produce balance volume across many seeds for `nvu sim`, not to play well.
 * design/cli-sim/spec.md's "there is no bot" ruling predates this issue; the
 * spec is updated alongside this file.
 */

import { behaviourOf } from "@domain/cards/behaviours";
import { validate } from "@domain/engine";
import {
  allThresholds,
  contributionOf,
  exhaustXPreventedBy,
  metThresholds,
  playableCards,
  settleableStuff,
  settlePayOptions,
  statPool,
  thresholdIsMet,
  thresholdTarget,
  type StatTotals,
} from "@domain/queries";
import type {
  AscendChoice,
  Card,
  CardId,
  Character,
  Command,
  GameState,
  Stat,
  StuffSettlement,
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
  return allThresholds(room).some(
    (t) => t.clears && !thresholdIsMet(state, t) && statValue(after, t.stat) >= thresholdTarget(state, t),
  );
}

/** Has the room already been Cleared by something the pool now meets? */
function roomIsCleared(state: GameState): boolean {
  return metThresholds(state).some((t) => t.clears);
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
 * The most either character's hand could add to the pool this turn, playing
 * every playable card for free — a generous upper bound that ignores payment
 * (a card spent paying could otherwise have been played for its own stats).
 * Used only to tell "unreachable" apart from "not reached yet".
 */
function maxAdditionalGain(state: GameState): StatTotals {
  let oomph = 0;
  let scramble = 0;
  for (const character of CHARACTERS) {
    for (const card of playableCards(state, character)) {
      const gain = contributionOf(state, { owner: character, card });
      oomph += gain.oomph;
      scramble += gain.scramble;
    }
  }
  return { oomph, scramble };
}

/**
 * Could anything still in hand clear the room this turn? If not, the room
 * will be Fled regardless of what else gets played — the rulebook shuffles
 * it back into the Floor deck either way (Outcome, Flee) — so there is
 * nothing left to buy with a further Exhaust or a further card at all.
 */
function roomIsClearableThisTurn(state: GameState): boolean {
  const room = state.activeRoom;
  if (!room) return false;
  const now = statPool(state);
  const potential = maxAdditionalGain(state);
  const reachable: StatTotals = { oomph: now.oomph + potential.oomph, scramble: now.scramble + potential.scramble };
  return allThresholds(room).some(
    (t) => t.clears && !thresholdIsMet(state, t) && statValue(reachable, t.stat) >= thresholdTarget(state, t),
  );
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
  // Nothing left in hand could clear it either — the room is Fled regardless
  // of what else gets played, so stop pouring cards (and Exhaust) into it.
  if (!roomIsClearableThisTurn(state)) return endPlay;

  let bestCharacter: Character | null = null;
  let bestCardId: CardId | null = null;
  let bestClears = false;
  let bestHarm = Number.POSITIVE_INFINITY;
  let bestTotal = -1;
  const seen = new Set<string>();
  for (const play of plays) {
    const key = `${play.character}:${String(play.cardId)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const card = findInHand(state, play.character, play.cardId);
    if (!card) continue;
    const clears = clearsARoom(state, play.character, card);
    const harm = exhaustCost(state, play.character, card);
    const gain = contributionOf(state, { owner: play.character, card });
    const total = gain.oomph + gain.scramble;
    // Prefer a play that Clears; among plays that both Clear, prefer the one
    // that costs the least permanent loss — this is what makes a cheaper,
    // harmless play beat Reckless or Panic whenever either would clear the
    // room just as well. Short of Clearing, maximize progress first, same as
    // before, and only fall back to harm as a tie-break — a harmless card
    // that does nothing is not a substitute for one that helps.
    const better =
      bestCardId === null ||
      (clears && !bestClears) ||
      (clears === bestClears && clears && harm < bestHarm) ||
      (clears === bestClears && clears && harm === bestHarm && total > bestTotal) ||
      (clears === bestClears && !clears && total > bestTotal) ||
      (clears === bestClears && !clears && total === bestTotal && harm < bestHarm) ||
      (clears === bestClears &&
        total === bestTotal &&
        harm === bestHarm &&
        (play.character < (bestCharacter ?? play.character) ||
          (play.character === bestCharacter && play.cardId < bestCardId)));
    if (better) {
      bestCharacter = play.character;
      bestCardId = play.cardId;
      bestClears = clears;
      bestHarm = harm;
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

/**
 * Below this many live cards (deck + hand + discard — the pool a Scrap
 * actually shrinks; the Exhaust pile is already gone for the run and the
 * Scrapyard doesn't come back), the bot stops paying at Settle your Stuff
 * altogether. [agent] — raised from 8 to 12 on the loss-accounting data in
 * issue #102: most of a run's Exhaust comes from Fleeing rooms, not from
 * cards the bot chooses to play, so it is not something a play-time choice
 * can head off. Scrapping at Ascend was the one loss this policy controls
 * outright, and at 8 it kept spending it down to a size well under playtest
 * 4's observed 11-14 live cards. 12 leaves that same "full hand plus a few
 * spare" headroom (`HAND_CAP` + 7) while banking more of the deck against
 * the Exhaust a Flee is going to cost it anyway.
 */
const MIN_LIVE_DECK = 12;

function liveDeckSize(state: GameState, character: Character): number {
  const p = playerOf(state, character);
  return p.deck.length + p.hand.length + p.discard.length;
}

/** What a Good Stuff card is worth: its stats, plus a point for doing something besides. */
function goodStuffValue(card: Card): number {
  return card.oomph + card.scramble + (card.text ? 1 : 0);
}

/** A Bad Stuff card is dead weight even with no `Holding:` line; add a point per kind of tax it levies. */
function badStuffSeverity(card: Card): number {
  const held = behaviourOf(card.name)?.whileHeld;
  if (!held) return 1;
  const taxes = [held.costDelta, held.drawTargetDelta, held.stuffPowerDelta, held.thresholdScrambleDelta];
  return 1 + taxes.filter((delta) => (delta ?? 0) !== 0).length;
}

/** What keeping (Good Stuff) or shedding (Bad Stuff) this card is worth. */
function stuffValue(card: Card): number {
  return card.kind === "good_stuff" ? goodStuffValue(card) : badStuffSeverity(card);
}

function findOwned(state: GameState, character: Character, id: CardId): Card | undefined {
  const p = playerOf(state, character);
  return [...p.deck, ...p.hand, ...p.discard].find((c) => c.id === id);
}

const byValueDesc = (a: Card, b: Card): number => stuffValue(b) - stuffValue(a) || a.id.localeCompare(b.id);

/** Which stat this character's non-Stuff cards lean on least, going by what's still in deck, hand and discard. */
function weakerStat(state: GameState, character: Character): Stat {
  let oomph = 0;
  let scramble = 0;
  for (const card of settlePayOptions(state, character)) {
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

/**
 * "Only pay at Settle your Stuff when the deck can afford it and the Stuff is
 * worth more than what it costs", scored the same way `composeChoice` below
 * decides it, for one already-generated settlement.
 */
function scoreChoice(state: GameState, character: Character, choice: AscendChoice): number {
  let score = 0;
  if (choice.takeRewardId !== null) {
    const offered = state.offer?.[character] ?? [];
    const reward = offered.find((c) => c.id === choice.takeRewardId);
    if (reward) score += 100 + rewardScore(reward, weakerStat(state, character));
  }
  const stuff = settleableStuff(state, character);
  const budget = liveDeckSize(state, character);
  for (const settlement of choice.settle) {
    const card = stuff.find((s) => s.id === settlement.cardId);
    const payer = settlement.payWith !== null ? findOwned(state, character, settlement.payWith) : undefined;
    if (!card || !payer) continue;
    const value = stuffValue(card);
    if (value > payer.cost && budget - 1 >= MIN_LIVE_DECK) score += value * 10;
  }
  return score;
}

/**
 * One character's whole Ascend, decided independently of the other's: pay to
 * keep the Good Stuff most worth keeping, then pay to shed the Bad Stuff most
 * worth shedding, with whatever payers are left — but only while the deck can
 * afford it and the card is worth more than its cheapest payer — then take
 * the reward that best fits the deck. This is the same shape the CLI composes
 * from its per-question staging (`cli/ascend.ts`, `composeAscend`) — a full
 * `settle` list, not the move generator's single-item one — so it isn't
 * limited by the generator's Ascend cross-product cap (design/cli-sim/spec.md,
 * "The move generator").
 */
function composeChoice(state: GameState, character: Character): AscendChoice {
  const payers = [...settlePayOptions(state, character)].sort(
    (a, b) => a.cost - b.cost || a.id.localeCompare(b.id),
  );
  let payerIndex = 0;
  let liveBudget = liveDeckSize(state, character);

  const takePayer = (value: number): CardId | null => {
    const payer = payers[payerIndex];
    if (!payer) return null;
    if (value <= payer.cost) return null;
    if (liveBudget - 1 < MIN_LIVE_DECK) return null;
    payerIndex += 1;
    liveBudget -= 1;
    return payer.id;
  };

  const stuff = settleableStuff(state, character);
  const settle: StuffSettlement[] = [];
  for (const card of stuff.filter((c) => c.kind === "good_stuff").sort(byValueDesc)) {
    const payWith = takePayer(stuffValue(card));
    if (payWith !== null) settle.push({ cardId: card.id, payWith });
  }
  for (const card of stuff.filter((c) => c.kind === "bad_stuff").sort(byValueDesc)) {
    const payWith = takePayer(stuffValue(card));
    if (payWith !== null) settle.push({ cardId: card.id, payWith });
  }

  return { settle, takeRewardId: chooseReward(state, character) };
}

/**
 * Instrumentation only, read by `report.ts`: how often the composed command
 * above validated versus how often it had to fall back to the move
 * generator's own (capped) list. Doesn't affect what the policy chooses.
 */
export const greedyAscendStats = { composed: 0, fallback: 0 };

export function resetGreedyAscendStats(): void {
  greedyAscendStats.composed = 0;
  greedyAscendStats.fallback = 0;
}

/** The best of whatever the move generator did offer, for the rare case the composed command is refused. */
function bestGeneratedAscend(state: GameState, legal: readonly Command[]): Command {
  const ascends = legal.filter((c): c is Extract<Command, { type: "ASCEND" }> => c.type === "ASCEND");
  const first = ascends[0];
  if (!first) throw new Error("greedy: Ascend phase offered no ASCEND command");
  let best = first;
  let bestScore = scoreChoice(state, "Red", first.Red) + scoreChoice(state, "Gray", first.Gray);
  for (const c of ascends.slice(1)) {
    const score = scoreChoice(state, "Red", c.Red) + scoreChoice(state, "Gray", c.Gray);
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

function chooseAscend(state: GameState, legal: readonly Command[]): Command {
  const composed: Command = {
    type: "ASCEND",
    Red: composeChoice(state, "Red"),
    Gray: composeChoice(state, "Gray"),
  };
  if (validate(state, composed) === null) {
    greedyAscendStats.composed += 1;
    return composed;
  }
  greedyAscendStats.fallback += 1;
  return bestGeneratedAscend(state, legal);
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
 * A fixed, deterministic bot (issue #93): play what clears the room, pay
 * with the cheapest cards, take the reward, keep Good Stuff you can pay for
 * and shed Bad Stuff you can. It never draws on `rng` — ties are broken by
 * card id — so the same seed always plays the same game. Everywhere but
 * Ascend it only answers from the move generator's own legal list; at
 * Ascend it composes its own `ASCEND` command (see `composeChoice`) and
 * validates it against the engine, because the generator's own list caps
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
        return [chooseAscend(state, legal), rng];
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
