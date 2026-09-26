/* The enumerator's contract: everything it lists is legal, and what is legal it lists. */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { execute, validate } from "@domain/engine";
import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import { createInitialState } from "@domain/setup";
import type { Command, GameState } from "@domain/types";
import { CHARACTERS } from "@domain/verbs";
import { ascendChoices, combinations, legalCommands, permutations } from "./moves";
import { randomPolicy } from "./policy";
import { policySeed } from "./rng";

/** Every state a random walk from this seed passes through. */
function statesAlong(seed: number, maxCommands = 400): readonly GameState[] {
  const [initial] = createInitialState(seed, CARD_CONTENT);
  const out: GameState[] = [initial];
  let state = initial;
  let rng = policySeed(seed);
  for (let i = 0; i < maxCommands && state.phase !== "GameOver"; i++) {
    const legal = legalCommands(state);
    if (legal.length === 0) break;
    const [command, next] = randomPolicy.choose(state, legal, rng);
    rng = next;
    const result = execute(state, command);
    if (!result.ok)
      throw new Error(`enumerated an illegal ${command.type}: ${result.reason.message}`);
    state = result.state;
    out.push(state);
  }
  return out;
}

const SEEDS = [1, 2, 3, 5, 8, 13, 21, 34];

describe("combinatorics", () => {
  it("combinations picks k of n, once each, in order", () => {
    expect(combinations([1, 2, 3], 2)).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
    expect(combinations([1, 2], 0)).toEqual([[]]);
    expect(combinations([1, 2], 3)).toEqual([]);
  });

  it("permutations lists every order", () => {
    expect(permutations([1, 2, 3])).toHaveLength(6);
    expect(permutations([])).toEqual([[]]);
  });
});

describe("legalCommands", () => {
  it("returns only commands validate accepts, along a random walk", () => {
    for (const seed of SEEDS) {
      for (const state of statesAlong(seed)) {
        for (const command of legalCommands(state)) {
          const problem = validate(state, command);
          expect(
            problem,
            `${command.type} on seed ${String(seed)}: ${problem?.message ?? ""}`,
          ).toBeNull();
        }
      }
    }
  });

  it("lists every legal phase command and every legal single play", () => {
    for (const seed of SEEDS) {
      for (const state of statesAlong(seed)) {
        if (state.pending || state.phase === "Ascend") continue;
        const listed = new Set(legalCommands(state).map((c) => JSON.stringify(c)));
        const candidates: Command[] = [{ type: "FLIP_ROOM" }, { type: "END_PLAY" }];
        for (const c of CHARACTERS) {
          for (const card of state[c].hand) {
            for (const payment of combinations(
              state[c].hand.filter((x) => x.id !== card.id),
              0,
            )) {
              candidates.push({
                type: "PLAY_CARD",
                character: c,
                cardId: card.id,
                payWith: payment.map((x) => x.id),
              });
            }
            for (const other of state[c].hand) {
              if (other.id === card.id) continue;
              candidates.push({
                type: "PLAY_CARD",
                character: c,
                cardId: card.id,
                payWith: [other.id],
              });
            }
          }
        }
        for (const candidate of candidates) {
          if (validate(state, candidate) === null) {
            expect(
              listed.has(JSON.stringify(candidate)),
              `${candidate.type} missing on seed ${String(seed)}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("is empty once the run is over", () => {
    resetRig();
    const over = rig({ phase: "GameOver", outcome: "Defeat" });
    expect(legalCommands(over)).toEqual([]);
  });

  it("offers the flip once a room is queued, and nothing while the floor deck is empty", () => {
    resetRig();
    const empty = rig({ phase: "Turn Start" });
    expect(legalCommands(empty)).toEqual([]);

    const queued = rig({ phase: "Turn Start", floorDeck: [room("Security Turnstile")] });
    expect(legalCommands(queued)).toEqual([{ type: "FLIP_ROOM" }]);
  });

  it("answers a TakeReward with each revealed card or none, and a ChooseCharacter with each option", () => {
    resetRig();
    const reward = card("Reckless Swing");
    const other = card("Fast Follow");
    const asked = rig({
      phase: "Play",
      pending: { kind: "TakeReward", prompt: "?", character: "Red", cards: [reward, other], source: null },
    });
    expect(legalCommands(asked)).toEqual([
      { type: "TAKE_REWARD", cardId: reward.id },
      { type: "TAKE_REWARD", cardId: other.id },
      { type: "TAKE_REWARD", cardId: null },
    ]);

    const who = rig({
      phase: "Play",
      pending: { kind: "ChooseCharacter", prompt: "?", options: ["Red", "Gray"], source: null },
    });
    expect(legalCommands(who)).toEqual([
      { type: "CHOOSE_CHARACTER", character: "Red" },
      { type: "CHOOSE_CHARACTER", character: "Gray" },
    ]);
  });
});

describe("ascendChoices", () => {
  it("lists each offered reward, or none, and crosses both characters' choices in full", () => {
    resetRig();
    const state = rig({
      phase: "Ascend",
      roomSupply: [room("Security Turnstile")],
      Red: player({ deck: pile("Shove", 2), discard: pile("Charge In", 2) }),
      Gray: player({ deck: pile("Duck Under", 2) }),
    });
    const offered = { Red: state.pools.Red.slice(0, 3), Gray: state.pools.Gray.slice(0, 3) };
    const ready = { ...state, offer: offered };

    // Each side: decline + 3 rewards = 4. Crossed: 16.
    const red = ascendChoices(ready, "Red");
    const gray = ascendChoices(ready, "Gray");
    expect(red).toHaveLength(4);
    expect(gray).toHaveLength(4);
    for (const choice of red) {
      expect(validate(ready, { type: "ASCEND", Red: choice, Gray: gray[0]! })).toBeNull();
    }
    expect(legalCommands(ready)).toHaveLength(16);
  });
});
