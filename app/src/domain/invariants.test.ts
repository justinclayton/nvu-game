/* Invariants over seeded runs.
 *
 * A dumb greedy actor plays whole runs from a seed. Nothing here checks that
 * the actor plays well — only that the engine never breaks its own promises.
 */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "../content";
import { execute } from "./engine";
import { canDraw, costOf, payOptions, playableCards } from "./queries";
import { createInitialState } from "./setup";
import type { AscendChoice, Card, CardId, Command, GameState } from "./types";
import { CHARACTERS } from "./verbs";

const SEEDS = [1, 2, 3, 7, 11, 42, 99, 12345];
const MAX_COMMANDS = 4000;

/** How deep the actor draws. Shallow enough to finish, deep enough to play. */
const DRAW_DEPTH = 2;

const DECLINE: AscendChoice = { keepStuffId: null, scrapId: null, takeRewardId: null };

function nextCommand(state: GameState): Command | null {
  const pending = state.pending;
  if (pending) {
    switch (pending.kind) {
      case "ChooseCharacter": {
        const first = pending.options[0];
        return first ? { type: "CHOOSE_CHARACTER", character: first } : null;
      }
      case "ChooseCards":
        return {
          type: "CHOOSE_CARDS",
          cardIds: pending.options.slice(0, pending.count).map((c) => c.id),
        };
      case "OrderCards":
        return { type: "ORDER_CARDS", cardIds: pending.cards.map((c) => c.id) };
      case "TakeReward":
        return { type: "TAKE_REWARD", take: true };
    }
  }

  switch (state.phase) {
    case "Flip":
      return { type: "FLIP_ROOM" };
    case "Draw": {
      for (const c of CHARACTERS) {
        // A card in hand can cap how deep this character may draw, so the
        // domain is what says whether another draw is legal.
        if (state[c].drewThisTurn < DRAW_DEPTH && canDraw(state, c)) {
          return { type: "DRAW", character: c };
        }
      }
      return { type: "END_DRAW" };
    }
    case "Play": {
      for (const c of CHARACTERS) {
        const card = playableCards(state, c)[0];
        if (!card) continue;
        const cost = costOf(state, c, card);
        const payWith = payOptions(state, c, card.id)
          .slice(0, cost)
          .map((x) => x.id);
        if (payWith.length === cost) {
          return { type: "PLAY_CARD", character: c, cardId: card.id, payWith };
        }
      }
      return { type: "END_PLAY" };
    }
    case "Ascend":
      return { type: "ASCEND", Red: DECLINE, Gray: DECLINE };
    case "GameOver":
      return null;
  }
}

interface Ran {
  readonly state: GameState;
  readonly commands: readonly Command[];
}

function runFrom(seed: number): Ran {
  const [start] = createInitialState(seed, CARD_CONTENT);
  let state = start;
  const commands: Command[] = [];
  for (let i = 0; i < MAX_COMMANDS; i++) {
    const command = nextCommand(state);
    if (!command) break;
    const result = execute(state, command);
    if (!result.ok) {
      throw new Error(`the actor produced an illegal ${command.type}: ${result.reason.message}`);
    }
    state = result.state;
    commands.push(command);
  }
  return { state, commands };
}

/** Every card in the run, wherever it currently sits. */
function allCards(state: GameState): readonly Card[] {
  const perCharacter = CHARACTERS.flatMap((c) => [
    ...state[c].deck,
    ...state[c].hand,
    ...state[c].discard,
  ]);
  return [
    ...perCharacter,
    ...state.playZone.map((p) => p.card),
    ...state.pools.Red,
    ...state.pools.Gray,
    ...state.pools.goodStuff,
    ...state.pools.badStuff,
    ...state.scrapyard,
  ];
}

const idsOf = (cards: readonly Card[]): readonly CardId[] => [...cards.map((c) => c.id)].sort();

describe("seeded-run invariants", () => {
  it.each(SEEDS)("seed %i replays exactly", (seed) => {
    const first = runFrom(seed);
    const [start] = createInitialState(seed, CARD_CONTENT);
    let state = start;
    for (const command of first.commands) {
      const result = execute(state, command);
      expect(result.ok).toBe(true);
      if (result.ok) state = result.state;
    }
    expect(state).toEqual(first.state);
  });

  it.each(SEEDS)("seed %i conserves every card", (seed) => {
    const [start] = createInitialState(seed, CARD_CONTENT);
    const before = idsOf(allCards(start));
    const { state } = runFrom(seed);
    expect(idsOf(allCards(state))).toEqual(before);
  });

  it.each(SEEDS)("seed %i never mutates the state handed to execute", (seed) => {
    const [start] = createInitialState(seed, CARD_CONTENT);
    let state = start;
    for (let i = 0; i < MAX_COMMANDS; i++) {
      const command = nextCommand(state);
      if (!command) break;
      const snapshot = structuredClone(state);
      const result = execute(state, command);
      expect(state).toEqual(snapshot);
      if (!result.ok) break;
      state = result.state;
    }
  });

  it.each(SEEDS)("seed %i leaves a Down character with an empty hand", (seed) => {
    const [start] = createInitialState(seed, CARD_CONTENT);
    let state = start;
    for (let i = 0; i < MAX_COMMANDS; i++) {
      const command = nextCommand(state);
      if (!command) break;
      const result = execute(state, command);
      if (!result.ok) break;
      state = result.state;
      for (const c of CHARACTERS) {
        if (state[c].down) expect(state[c].hand).toEqual([]);
      }
    }
  });

  it("a rejected command leaves the state identical", () => {
    const [start] = createInitialState(1, CARD_CONTENT);
    const illegal: Command[] = [
      { type: "END_PLAY" },
      { type: "DRAW", character: "Red" },
      { type: "TAKE_REWARD", take: true },
      { type: "CHOOSE_CHARACTER", character: "Gray" },
    ];
    for (const command of illegal) {
      const result = execute(start, command);
      expect(result.ok).toBe(false);
    }
    const [again] = createInitialState(1, CARD_CONTENT);
    expect(start).toEqual(again);
  });

  it("reaches a finished run from every seed", () => {
    for (const seed of SEEDS) {
      const { state, commands } = runFrom(seed);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.length).toBeLessThan(MAX_COMMANDS);
      expect(state.phase).toBe("GameOver");
      expect(state.outcome).not.toBeNull();
    }
  });
});

/** A description of a character's fate, so the numbers are visible. */
function summarise(seed: number): { floor: number; outcome: string | null; turns: number } {
  const { state } = runFrom(seed);
  return { floor: state.floor, outcome: state.outcome, turns: state.turn };
}

describe("what a greedy actor manages", () => {
  it("gets somewhere and stops", () => {
    // Not a balance assertion — just proof the engine takes a whole run without
    // deadlocking, and a place to read the numbers off.
    const runs = SEEDS.map(summarise);
    for (const run of runs) {
      expect(run.floor).toBeGreaterThanOrEqual(1);
      expect(run.turns).toBeGreaterThan(0);
    }
  });
});
