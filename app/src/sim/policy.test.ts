import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { Command, GameState, Room } from "@domain/types";
import { ascendChoices, legalCommands } from "./moves";
import { greedyAscendStats, greedyPolicy, randomPolicy, resetGreedyAscendStats } from "./policy";
import { policySeed } from "./rng";
import { simulate } from "./run";

describe("random", () => {
  it("is deterministic: the same seed gives the same command log", () => {
    const a = simulate(11, randomPolicy, CARD_CONTENT);
    const b = simulate(11, randomPolicy, CARD_CONTENT);
    expect(b.commands).toEqual(a.commands);
    expect(b.final).toEqual(a.final);
  });
});

/** A one-threshold room, only its shape overridden. */
function roomWith(threshold: Partial<Room["thresholds"][number]>): Room {
  const base = room("Gross Thing That Looks Like A Cherry");
  return {
    ...base,
    thresholds: [
      {
        stat: "Oomph",
        value: 4,
        outcome: "Clear it.",
        clears: true,
        fleeFree: false,
        ascends: false,
        effects: [],
        ...threshold,
      },
    ],
  };
}

describe("greedy", () => {
  it("is deterministic: the same seed gives the same command log", () => {
    const a = simulate(5, greedyPolicy, CARD_CONTENT);
    const b = simulate(5, greedyPolicy, CARD_CONTENT);
    expect(b.commands).toEqual(a.commands);
    expect(b.final).toEqual(a.final);
  });

  it("plays the card that clears the room over one that does not", () => {
    resetRig();
    const chargeIn = card("Charge In"); // cost 2, oomph 4 — clears a 4-Oomph threshold alone
    const shove = card("Shove"); // cost 1, oomph 2 — does not
    const payerA = card("Shove");
    const payerB = card("Shove");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({}),
      Red: player({ hand: [chargeIn, shove, payerA, payerB] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [payerA.id, payerB.id] },
      { type: "PLAY_CARD", character: "Red", cardId: shove.id, payWith: [payerA.id] },
      { type: "END_PLAY" },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({
      type: "PLAY_CARD",
      character: "Red",
      cardId: chargeIn.id,
      payWith: [payerA.id, payerB.id],
    });
  });

  it("pays for a card with the cheapest hand cards available", () => {
    resetRig();
    const shove = card("Shove"); // cost 1
    const cheapPayer = card("Overdrive"); // cost 0
    const costlyPayer = card("Charge In"); // cost 2
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({ value: 1000 }), // unreachable — no play clears it
      Red: player({ hand: [shove, cheapPayer, costlyPayer] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: shove.id, payWith: [cheapPayer.id] },
      { type: "PLAY_CARD", character: "Red", cardId: shove.id, payWith: [costlyPayer.id] },
      { type: "END_PLAY" },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "PLAY_CARD", character: "Red", cardId: shove.id, payWith: [cheapPayer.id] });
  });

  it("ends the Play phase once the room is already Cleared, instead of spending more stamina", () => {
    resetRig();
    const chargeIn = card("Charge In");
    const alreadyPlayed = card("Charge In");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({}),
      playZone: [{ owner: "Red", card: alreadyPlayed }], // 4 Oomph already on the table
      Red: player({ hand: [chargeIn] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [] },
      { type: "END_PLAY" },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "END_PLAY" });
  });

  it("takes the reward when one is offered", () => {
    resetRig();
    const offered = card("Fast Follow");
    const state: GameState = rig({
      phase: "Play",
      pending: { kind: "TakeReward", prompt: "Take it?", character: "Red", card: offered, source: null },
    });
    const legal: readonly Command[] = [
      { type: "TAKE_REWARD", take: true },
      { type: "TAKE_REWARD", take: false },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "TAKE_REWARD", take: true });
  });

  it("keeps Good Stuff it can pay for, and sheds Bad Stuff it can, at Ascend, once the deck can afford it", () => {
    resetRig();
    const goodStuff = card("Crowbar");
    const badStuff = card("Rust");
    const payerA = card("Shove");
    const payerB = card("Shove");
    const filler = pile("Shove", 6); // enough live cards that both Scraps stay above the floor
    const reward = card("Fast Follow");
    const state: GameState = rig({
      phase: "Ascend",
      Red: player({ deck: [goodStuff, badStuff, payerA, payerB, ...filler] }),
      Gray: player(),
      offer: { Red: [reward], Gray: [] },
    });
    const legal = legalCommands(state);
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    if (chosen.type !== "ASCEND") throw new Error("expected an ASCEND command");
    const settledIds = chosen.Red.settle.map((s) => s.cardId).sort();
    expect(settledIds).toEqual([badStuff.id, goodStuff.id].sort());
    expect(chosen.Red.settle.every((s) => s.payWith !== null)).toBe(true);
    expect(chosen.Red.takeRewardId).toBe(reward.id);
    expect(chosen.Gray).toEqual({ settle: [], takeRewardId: null });
  });

  it("does not pay at Settle your Stuff once the deck is too small to afford it", () => {
    resetRig();
    const goodStuff = card("Crowbar");
    const badStuff = card("Rust");
    const payerA = card("Shove");
    const payerB = card("Shove");
    const reward = card("Fast Follow");
    const state: GameState = rig({
      phase: "Ascend",
      // Only 4 live cards — well under the floor, so no Scrap is worth it.
      Red: player({ deck: [goodStuff, badStuff, payerA, payerB] }),
      Gray: player(),
      offer: { Red: [reward], Gray: [] },
    });
    const legal = legalCommands(state);
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({
      type: "ASCEND",
      Red: { settle: [], takeRewardId: reward.id },
      Gray: { settle: [], takeRewardId: null },
    });
  });

  it("does not pay a payer costlier than the Stuff it would settle", () => {
    resetRig();
    const badStuff = card("Torn Seal"); // no Holding: line — dead weight only, worth 1
    const expensivePayer = card("Charge In"); // cost 2 — not worth spending on a 1-value card
    const filler = pile("Shove", 8); // keep the deck comfortably above the floor
    const state: GameState = rig({
      phase: "Ascend",
      Red: player({ deck: [badStuff, expensivePayer, ...filler] }),
      Gray: player(),
      offer: { Red: [], Gray: [] },
    });
    const legal = legalCommands(state);
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    if (chosen.type !== "ASCEND") throw new Error("expected an ASCEND command");
    expect(chosen.Red.settle).toEqual([]);
  });

  it("picks the reward that fits the character's weaker stat over the first one offered", () => {
    resetRig();
    const deck = pile("Shove", 6); // all Oomph — Red is weak on Scramble
    const oomphReward = card("Fast Follow"); // Oomph 3
    const scrambleReward = card("Deadweight Grip"); // Scramble 2
    const state: GameState = rig({
      phase: "Ascend",
      Red: player({ deck }),
      Gray: player(),
      offer: { Red: [oomphReward, scrambleReward], Gray: [] },
    });
    const legal = legalCommands(state);
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    if (chosen.type !== "ASCEND") throw new Error("expected an ASCEND command");
    expect(chosen.Red.takeRewardId).toBe(scrambleReward.id);
  });

  it("gets both characters their reward even when the generator's Ascend cross-product is capped", () => {
    // Give each character enough Stuff and payers that ascendChoices(state, c)
    // is large on both sides, so their cross product blows the generator's
    // 256-entry cap (sim/moves.ts) and every legal ASCEND command it offers
    // leaves one side at "none". Composing straight from each character's
    // own options, instead of picking from that capped list, should still
    // get both a reward.
    resetRig();
    resetGreedyAscendStats();
    const redStuff = [card("Pry Bar"), card("Coil Of Cable"), card("Crowbar")];
    const redPayers = [card("Shove"), card("Shove"), card("Shove")];
    const redReward = [card("Reckless Swing"), card("Fast Follow"), card("Reckless")];
    const grayStuff = [card("A Pair Of Stich-Em-Ups"), card("Cutting Torch"), card("Grav Harness")];
    const grayPayers = [card("Duck Under"), card("Duck Under"), card("Duck Under")];
    const grayReward = [card("Catch Your Breath"), card("In Step"), card("One Man's Junk")];

    const state: GameState = rig({
      phase: "Ascend",
      Red: player({ deck: [...redStuff, ...redPayers] }),
      Gray: player({ deck: [...grayStuff, ...grayPayers] }),
      offer: { Red: redReward, Gray: grayReward },
    });

    const redOptions = ascendChoices(state, "Red").length;
    const grayOptions = ascendChoices(state, "Gray").length;
    expect(redOptions * grayOptions).toBeGreaterThan(256);

    const legal = legalCommands(state);
    const ascends = legal.filter((c): c is Extract<Command, { type: "ASCEND" }> => c.type === "ASCEND");
    expect(ascends.every((c) => c.Red.takeRewardId === null || c.Gray.takeRewardId === null)).toBe(true);

    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    if (chosen.type !== "ASCEND") throw new Error("expected an ASCEND command");
    expect(chosen.Red.takeRewardId).not.toBeNull();
    expect(chosen.Gray.takeRewardId).not.toBeNull();
    expect(greedyAscendStats.fallback).toBe(0);
  });
});
