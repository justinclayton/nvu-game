import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { Command, GameState, Room } from "@domain/types";
import { greedyPolicy, randomPolicy } from "./policy";
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

  it("keeps Good Stuff it can pay for, and sheds Bad Stuff it can, at Ascend", () => {
    resetRig();
    const goodStuff = card("Crowbar");
    const badStuff = card("Rust");
    const payer = card("Shove");
    const reward = card("Fast Follow");
    const state: GameState = rig({
      phase: "Ascend",
      Red: player({ deck: [goodStuff, badStuff, payer] }),
      Gray: player(),
      offer: { Red: [reward], Gray: [] },
    });
    const none: Command = {
      type: "ASCEND",
      Red: { settle: [], takeRewardId: null },
      Gray: { settle: [], takeRewardId: null },
    };
    const greedyChoice: Command = {
      type: "ASCEND",
      Red: {
        settle: [
          { cardId: goodStuff.id, payWith: payer.id },
          { cardId: badStuff.id, payWith: payer.id },
        ],
        takeRewardId: reward.id,
      },
      Gray: { settle: [], takeRewardId: null },
    };
    const legal: readonly Command[] = [none, greedyChoice];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual(greedyChoice);
  });
});
