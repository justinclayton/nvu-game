/* The enumerator's contract: everything it lists is legal, and what is legal it lists. */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { execute, validate } from "@domain/engine";
import { card, pile, player, playing, resetRig, rig, room } from "@domain/__fixtures__/rig";
import { createInitialState } from "@domain/setup";
import type { Command, GameState } from "@domain/types";
import { CHARACTERS, pileCards } from "@domain/verbs";
import { combinations, legalCommands, permutations } from "./moves";
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
  it("never offers Bad Stuff as payment", () => {
    resetRig();
    const charge = card("Charge");
    const seal = card("Torn Seal");
    const shove = card("Shove");
    const lean = card("Lean In");
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ hand: [charge, seal, shove, lean] }),
    });
    const pays = legalCommands(state).flatMap((c) =>
      c.type === "PLAY_CARD" && c.cardId === charge.id ? [c.payWith] : [],
    );
    expect(pays).toEqual([[shove.id, lean.id]]);
  });

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
        if (state.pending) continue;
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

describe("a ChooseRoom", () => {
  it("is answered by entering each revealed room, with the rest in every order", () => {
    resetRig();
    const revealed = rig({
      phase: "Turn Start",
      floorDeck: [
        room("Security Turnstile"),
        room("Ventilation Shaft"),
        room("The Sentry Drone"),
      ],
      Red: player({ deck: [card("Shove")] }),
      Gray: player({ deck: [card("Duck Under")] }),
    });
    const result = execute(revealed, { type: "FLIP_ROOM" });
    if (!result.ok) throw new Error(result.reason.message);
    const legal = legalCommands(result.state);
    expect(legal).toHaveLength(6);
    for (const command of legal) {
      expect(command.type).toBe("CHOOSE_ROOM");
      expect(validate(result.state, command)).toBeNull();
    }
  });

  it("enters only an Ambush room when one is revealed, with the rest in every order", () => {
    resetRig();
    const ambush = room("Regular Monster 2");
    const revealed = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile"), ambush, room("Puzzle Room")],
      Red: player({ deck: [card("Shove")] }),
      Gray: player({ deck: [card("Duck Under")] }),
    });
    const result = execute(revealed, { type: "FLIP_ROOM" });
    if (!result.ok) throw new Error(result.reason.message);
    const legal = legalCommands(result.state);
    expect(legal).toHaveLength(2);
    for (const command of legal) {
      expect(command.type === "CHOOSE_ROOM" ? command.roomId : null).toBe(ambush.id);
      expect(validate(result.state, command)).toBeNull();
    }
  });
});

describe("a ChooseDraw", () => {
  it("is answered with each draw on offer, and with none", () => {
    const asked = rig({
      phase: "Play",
      pending: {
        kind: "ChooseDraw",
        prompt: "?",
        options: [
          { character: "Red", count: 1 },
          { character: "Red", count: 2 },
        ],
        source: null,
      },
    });
    expect(legalCommands(asked)).toEqual([
      { type: "CHOOSE_DRAW", character: "Red", count: 1 },
      { type: "CHOOSE_DRAW", character: "Red", count: 2 },
      { type: "CHOOSE_DRAW", character: null, count: 0 },
    ]);
  });
});

describe("Hack the Doors (Peek 3)", () => {
  const PILES_TO_PEEK = [
    "Red deck",
    "Gray deck",
    "Floor deck",
    "Red reward pool",
    "Gray reward pool",
    "Good Stuff pool",
  ] as const;

  /** Follow every legal answer from here to the end of the question; report each end state. */
  function everyEnding(state: GameState, depth = 0): GameState[] {
    if (!state.pending) return [state];
    const legal = legalCommands(state);
    if (legal.length === 0 || depth > 6) throw new Error(`stalled on ${state.pending.kind}`);
    return legal.flatMap((command) => {
      const result = execute(state, command);
      if (!result.ok) throw new Error(`${command.type} refused: ${result.reason.message}`);
      return everyEnding(result.state, depth + 1);
    });
  }

  it.each(PILES_TO_PEEK)("never stalls on the %s, and keeps every card in it", (name) => {
    resetRig();
    const state = playing({
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Hack the Doors"), card("Duck Under")] }),
      floorDeck: [room("Security Turnstile"), room("Puzzle Room"), room("The Sentry Drone"), room("Security Turnstile")],
      pools: { Red: pile("Charge", 5), Gray: pile("Duck Under", 5), goodStuff: pile("Stim Pack", 5), badStuff: [] },
    });
    const play = legalCommands(state).find(
      (c) => c.type === "PLAY_CARD" && c.cardId === state.Gray.hand[0]?.id,
    );
    if (!play) throw new Error("Hack the Doors cannot be played");
    const asked = execute(state, play);
    if (!asked.ok) throw new Error(asked.reason.message);
    const chosen = execute(asked.state, { type: "CHOOSE_PILE", pile: name });
    if (!chosen.ok) throw new Error(chosen.reason.message);
    const before = pileCards(chosen.state, name).map((c) => c.id).sort();

    const endings = everyEnding(chosen.state);
    // 8 subsets, each with every order of those that go and of those that stay.
    expect(endings.length).toBeGreaterThan(8);
    for (const end of endings) {
      expect(pileCards(end, name).map((c) => c.id).sort()).toEqual(before);
      expect(end.Gray.discard).toEqual(chosen.state.Gray.discard);
      expect(end.Red.discard).toEqual(chosen.state.Red.discard);
    }
  });
});
