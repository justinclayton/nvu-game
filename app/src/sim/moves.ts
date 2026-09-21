/* Every command the engine would accept right now.
 *
 * The UI has no use for this list — it greys buttons by asking `validate` and
 * reads `state.pending` for the rest (design/web-game/spec.md, Legality). A
 * policy has no buttons; it needs the list. So the list is built here, out of
 * the same queries the UI uses, and stays out of the domain.
 *
 * The contract, which moves.test.ts holds this file to: every command returned
 * passes `validate`. The reverse holds too, with two exceptions noted below
 * where the full set is too large to enumerate: an `OrderCards` answer over
 * more than four cards, and the cross product of two characters' ascension
 * choices.
 */

import { costOf, payOptions, playableCards } from "@domain/queries";
import type {
  AscendChoice,
  Card,
  CardId,
  Character,
  Command,
  GameState,
  Pending,
  SettleDecision,
} from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";

/** Every way to pick `k` of `items`, in a stable order. */
export function combinations<T>(items: readonly T[], k: number): readonly (readonly T[])[] {
  if (k < 0 || k > items.length) return [];
  if (k === 0) return [[]];
  const out: T[][] = [];
  const pick = (start: number, chosen: T[]) => {
    if (chosen.length === k) {
      out.push(chosen);
      return;
    }
    for (let i = start; i < items.length; i++) {
      const item = items[i];
      if (item === undefined) continue;
      pick(i + 1, [...chosen, item]);
    }
  };
  pick(0, []);
  return out;
}

/** Every ordering of `items`. Factorial, so callers cap the input. */
export function permutations<T>(items: readonly T[]): readonly (readonly T[])[] {
  if (items.length <= 1) return [items];
  const out: (readonly T[])[] = [];
  items.forEach((head, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([head, ...tail]);
  });
  return out;
}

/** Past this many cards an `OrderCards` answer offers only the order shown and its reverse. */
const ORDER_ALL_UP_TO = 4;

/** Past this many combined ascension choices the two characters' lists are not crossed. */
const ASCEND_CROSS_UP_TO = 256;

const ids = (cards: readonly Card[]): CardId[] => cards.map((c) => c.id);

/* ------------------------------------------------------------- answering */

function answers(pending: Pending): readonly Command[] {
  switch (pending.kind) {
    case "ChooseCharacter":
      return pending.options.map((character) => ({ type: "CHOOSE_CHARACTER", character }));
    case "ChooseCards": {
      const wanted = Math.min(pending.count, pending.options.length);
      const picks = combinations(pending.options, wanted).map((cards): Command => ({
        type: "CHOOSE_CARDS",
        cardIds: ids(cards),
      }));
      if (pending.optional && wanted > 0) picks.push({ type: "CHOOSE_CARDS", cardIds: [] });
      return picks;
    }
    case "OrderCards": {
      const orders =
        pending.cards.length <= ORDER_ALL_UP_TO
          ? permutations(pending.cards)
          : [pending.cards, [...pending.cards].reverse()];
      return orders.map((cards) => ({ type: "ORDER_CARDS", cardIds: ids(cards) }));
    }
    case "TakeReward":
      return [
        { type: "TAKE_REWARD", take: true },
        { type: "TAKE_REWARD", take: false },
      ];
  }
}

/* ------------------------------------------------------------------ Play */

/** Every legal way for this character to play this card: one command per payment. */
export function playsOf(state: GameState, c: Character, card: Card): readonly Command[] {
  const cost = costOf(state, c, card);
  return combinations(payOptions(state, c, card.id), cost).map((payment) => ({
    type: "PLAY_CARD",
    character: c,
    cardId: card.id,
    payWith: ids(payment),
  }));
}

/* ---------------------------------------------------------------- Ascend */

/** Every Stuff card a character could still Settle: their deck, hand and discard pile. */
function settleableStuff(state: GameState, c: Character): readonly Card[] {
  const p = playerOf(state, c);
  return [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind !== "player");
}

/** Every non-Stuff card of a character's that could pay a Settle-your-Stuff Scrap. */
function payableCards(state: GameState, c: Character): readonly Card[] {
  const p = playerOf(state, c);
  return [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind === "player");
}

/**
 * Every way one character could settle their Stuff: each piece either takes
 * its default fate (no `SettleDecision` at all) or is flipped by paying with
 * one of the non-Stuff cards available, one card paying for at most one flip.
 * The pool of possible settlements grows fast, so this stops offering more
 * than one flipped piece past a small hand of Stuff — a policy that wants the
 * full space reads `settleableStuff`/`payableCards` directly. See
 * design/cli-sim/spec.md, "The move generator".
 */
const SETTLE_FLIPS_UP_TO = 2;

function settlementsOf(state: GameState, c: Character): readonly (readonly SettleDecision[])[] {
  const stuff = settleableStuff(state, c);
  const payers = payableCards(state, c);
  if (stuff.length === 0) return [[]];

  const flipSome = (howMany: number): readonly (readonly SettleDecision[])[] => {
    if (howMany === 0 || payers.length === 0) return [];
    const out: (readonly SettleDecision[])[] = [];
    for (const flipped of combinations(stuff, howMany)) {
      for (const paidBy of combinations(payers, howMany)) {
        for (const pairing of permutations(paidBy)) {
          out.push(flipped.map((s, i) => ({ stuffId: s.id, pay: pairing[i]?.id ?? null })));
        }
      }
    }
    return out;
  };

  const out: (readonly SettleDecision[])[] = [[]];
  for (let n = 1; n <= Math.min(SETTLE_FLIPS_UP_TO, stuff.length, payers.length); n++) {
    out.push(...flipSome(n));
  }
  return out;
}

/** Everything one character may decide at ascension: each settlement crossed with each reward. */
export function ascendChoices(state: GameState, c: Character): readonly AscendChoice[] {
  const offered = state.offer?.[c] ?? [];
  const rewards: (CardId | null)[] = [null, ...ids(offered)];
  const settlements = settlementsOf(state, c);

  const out: AscendChoice[] = [];
  for (const settle of settlements) {
    for (const takeRewardId of rewards) out.push({ settle, takeRewardId });
  }
  return out;
}

function ascends(state: GameState): readonly Command[] {
  const red = ascendChoices(state, "Red");
  const gray = ascendChoices(state, "Gray");
  const redNone = red[0];
  const grayNone = gray[0];
  if (!redNone || !grayNone) return [];

  const out: Command[] = [];
  if (red.length * gray.length <= ASCEND_CROSS_UP_TO) {
    for (const r of red) for (const g of gray) out.push({ type: "ASCEND", Red: r, Gray: g });
    return out;
  }
  // Too many to cross: each of one character's choices against the other's
  // "nothing", both ways round. A policy choosing per character reads
  // `ascendChoices` directly instead.
  for (const r of red) out.push({ type: "ASCEND", Red: r, Gray: grayNone });
  for (const g of gray) if (g !== grayNone) out.push({ type: "ASCEND", Red: redNone, Gray: g });
  return out;
}

/* ------------------------------------------------------------- the list */

export function legalCommands(state: GameState): readonly Command[] {
  if (state.phase === "GameOver") return [];
  if (state.pending) return answers(state.pending);

  switch (state.phase) {
    case "Flip":
      return state.floorDeck.length > 0 ? [{ type: "FLIP_ROOM" }] : [];

    case "Play": {
      const out: Command[] = [];
      for (const c of CHARACTERS) {
        for (const card of playableCards(state, c)) out.push(...playsOf(state, c, card));
      }
      out.push({ type: "END_PLAY" });
      return out;
    }

    case "Ascend":
      return ascends(state);
  }
}
