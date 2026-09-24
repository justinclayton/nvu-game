import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { Command, GameState, Room, Threshold } from "@domain/types";
import { legalCommands } from "./moves";
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

/** A one-challenge, one-threshold room, only its shape overridden. */
function roomWith(threshold: Partial<Threshold>): Room {
  const base = room("The Sentry Drone");
  return {
    ...base,
    challenges: [
      {
        thresholds: [
          {
            requires: { oomph: 4, scramble: 0 },
            outcome: "Clear it.",
            clears: true,
            fleeFree: false,
            ascends: false,
            effects: [],
            ...threshold,
          },
        ],
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

  it("prefers a play that clears the room without Exhausting over one that also clears but costs an Exhaust", () => {
    resetRig();
    const chargeIn = card("Charge In"); // cost 2, oomph 4, no Exhaust
    const recklessSwing = card("Reckless Swing"); // cost 1, oomph 4, Exhaust 1 — clears just as well
    const payerA = card("Shove");
    const payerB = card("Shove");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({ requires: { oomph: 4, scramble: 0 } }),
      Red: player({ hand: [chargeIn, recklessSwing, payerA, payerB] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [payerA.id, payerB.id] },
      { type: "PLAY_CARD", character: "Red", cardId: recklessSwing.id, payWith: [payerA.id] },
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

  it("stops playing instead of pouring cards into a room nothing in hand can clear this turn", () => {
    resetRig();
    const shove = card("Shove"); // 2 Oomph — the room asks for far more than the whole hand could add up to
    const payer = card("Shove");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({ requires: { oomph: 1000, scramble: 0 } }),
      Red: player({ hand: [shove, payer] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: shove.id, payWith: [payer.id] },
      { type: "END_PLAY" },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "END_PLAY" });
  });

  it("declines an optional ChooseCards prompt (e.g. Level Up's Scrap ask) instead of always taking the minimum", () => {
    resetRig();
    const toScrap = card("Shove");
    const other = card("Overdrive");
    const state: GameState = rig({
      phase: "Play",
      pending: {
        kind: "ChooseCards",
        prompt: "Scrap a card from your hand?",
        character: "Red",
        options: [toScrap, other],
        count: 1,
        optional: true,
        source: null,
      },
    });
    const legal: readonly Command[] = [
      { type: "CHOOSE_CARDS", cardIds: [] },
      { type: "CHOOSE_CARDS", cardIds: [toScrap.id] },
      { type: "CHOOSE_CARDS", cardIds: [other.id] },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "CHOOSE_CARDS", cardIds: [] });
  });

  it("pays for a card with the cheapest hand cards available", () => {
    resetRig();
    const shove = card("Shove"); // cost 1
    const cheapPayer = card("Overdrive"); // cost 0
    const costlyPayer = card("Charge In"); // cost 2
    const state: GameState = rig({
      // Reachable this turn (the hand's cards could add up to 8 Oomph
      // between them) but not by this one Shove (2) alone, so the choice
      // between paying with cheapPayer or costlyPayer is what's on test.
      phase: "Play",
      activeRoom: roomWith({ requires: { oomph: 5, scramble: 0 } }),
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

  it("picks the reward that fits the character's weaker stat over the first one offered", () => {
    resetRig();
    const deck = pile("Shove", 6); // all Oomph — Red is weak on Scramble
    const oomphReward = card("Fast Follow"); // Oomph 3
    const scrambleReward = card("Tag Team"); // Oomph 2, Scramble 2
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

  it("gets both characters their own reward: the composed choice is one of the generator's own list", () => {
    resetRig();
    const redReward = [card("Reckless Swing"), card("Fast Follow"), card("Reckless")];
    const grayReward = [card("Catch Your Breath"), card("In Step"), card("One Man's Junk")];
    const state: GameState = rig({
      phase: "Ascend",
      Red: player(),
      Gray: player(),
      offer: { Red: redReward, Gray: grayReward },
    });

    const legal = legalCommands(state);
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    if (chosen.type !== "ASCEND") throw new Error("expected an ASCEND command");
    expect(chosen.Red.takeRewardId).not.toBeNull();
    expect(chosen.Gray.takeRewardId).not.toBeNull();
  });
});
