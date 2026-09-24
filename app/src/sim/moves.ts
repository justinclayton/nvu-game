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
 * choices. Turn Start's two steps, Flip the room and Draw up to five, run
 * together inside `FLIP_ROOM` with no decision between them (rulebook, Each
 * Turn, Turn Start), so there is no separate case for either here.
 */

import { costOf, payOptions, playableCards, scrapForStatsCards } from "@domain/queries";
import type {
  AscendChoice,
  Card,
  CardId,
  Character,
  Command,
  GameState,
  Pending,
  StuffSettlement,
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

/** Every legal `SCRAP_FOR_STATS`, one per eligible Good Stuff card and stat (Bio-Hazard Containment Vault). */
export function scrapsOf(state: GameState, c: Character): readonly Command[] {
  const stats = ["Oomph", "Scramble"] as const;
  return scrapForStatsCards(state, c).flatMap((card) =>
    stats.map((stat): Command => ({ type: "SCRAP_FOR_STATS", character: c, cardId: card.id, stat })),
  );
}

/* ---------------------------------------------------------------- Ascend */

/**
 * Everything one character may decide at ascension: each reward or none,
 * crossed with every way of settling a single Stuff card (deck, hand or
 * discard pile) by paying for it with a single payer. Settling more than one
 * Stuff card simultaneously is not crossed — recorded as debt alongside
 * `OrderCards` and the ascend cross product below (design/cli-sim/spec.md).
 * A policy that wants to settle several at once builds its own
 * `AscendChoice.settle`.
 */
export function ascendChoices(state: GameState, c: Character): readonly AscendChoice[] {
  const offered = state.offer?.[c] ?? [];
  const rewards: (CardId | null)[] = [null, ...ids(offered)];

  const p = playerOf(state, c);
  const owned = [...p.deck, ...p.hand, ...p.discard];
  const stuff = owned.filter((x) => x.kind !== "player");
  const payers = owned.filter((x) => x.kind === "player");

  const settlements: readonly (readonly StuffSettlement[])[] = [
    [],
    ...stuff.flatMap((s): (readonly StuffSettlement[])[] =>
      payers.map((payer): readonly StuffSettlement[] => [{ cardId: s.id, payWith: payer.id }]),
    ),
  ];

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
    case "Turn Start":
      return state.floorDeck.length > 0 ? [{ type: "FLIP_ROOM" }] : [];

    case "Play": {
      const out: Command[] = [];
      for (const c of CHARACTERS) {
        for (const card of playableCards(state, c)) out.push(...playsOf(state, c, card));
        out.push(...scrapsOf(state, c));
      }
      out.push({ type: "END_PLAY" });
      return out;
    }

    case "Ascend":
      return ascends(state);

    case "Outcome":
    case "Cleanup":
      // Automatic: these only rest on a `pending`, handled above.
      return [];
  }
}
