import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, must, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
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

  it("pays with the cards worth least: Bad Stuff first, then a card that adds nothing toward the line", () => {
    resetRig();
    const chargeIn = card("Charge In"); // cost 2, oomph 4 — clears a 4-Oomph line alone
    const slime = card("Faceful Of Slime"); // Bad Stuff: worth less than nothing in hand
    const shove = card("Shove"); // oomph 2 — the next-best Oomph card, worth keeping
    const leanIn = card("Lean In"); // oomph 1, scramble 1 — least Oomph of the three
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({ requires: { oomph: 4, scramble: 0 } }),
      Red: player({ hand: [chargeIn, slime, shove, leanIn] }),
    });
    const legal: readonly Command[] = [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [shove.id, leanIn.id] },
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [slime.id, shove.id] },
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: [slime.id, leanIn.id] },
      { type: "END_PLAY" },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({
      type: "PLAY_CARD",
      character: "Red",
      cardId: chargeIn.id,
      payWith: [slime.id, leanIn.id],
    });
  });

  it("does not throw away a free Oomph card as payment when the line still needs it", () => {
    resetRig();
    const chargeIn = card("Charge In"); // cost 2, oomph 4
    const overdrive = card("Overdrive"); // cost 0, oomph 2 — printed cost says "cheapest", but it is the card that gets to 6
    const shoveA = card("Shove");
    const shoveB = card("Shove");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: roomWith({ requires: { oomph: 6, scramble: 0 } }),
      Red: player({ hand: [chargeIn, overdrive, shoveA, shoveB] }),
    });
    const [chosen] = greedyPolicy.choose(state, legalCommands(state), policySeed(1));
    expect(chosen).toEqual({
      type: "PLAY_CARD",
      character: "Red",
      cardId: chargeIn.id,
      payWith: [shoveA.id, shoveB.id],
    });
  });

  /** Greedy play from `state` until the Play phase ends, the way `simulate` would drive it. */
  function playOut(state: GameState): { readonly state: GameState; readonly commands: readonly Command[] } {
    let s = state;
    const commands: Command[] = [];
    // Through Outcome's own questions too, such as which Good Stuff to keep.
    while (s.phase === "Play" || s.pending) {
      const [command] = greedyPolicy.choose(s, legalCommands(s), policySeed(1));
      commands.push(command);
      s = must(s, command).state;
    }
    return { state: s, commands };
  }

  it("stacks both hands on one stat of a Stairwell instead of splitting 4 Oomph and 4 Scramble across its two lines", () => {
    resetRig();
    // The Sentry Drone: Oomph 8 → Ascend, or Scramble 8 → Ascend. Red can
    // reach 8 alone (Charge In 4, Overdrive 2, Overdrive 2); Gray tops out at 6.
    const red = [card("Charge In"), card("Overdrive"), card("Overdrive"), card("Shove"), card("Shove")];
    const gray = [card("Pick The Lock"), card("Duck Under"), card("Duck Under"), card("Peek Around Corner"), card("Peek Around Corner")];
    const state: GameState = rig({
      phase: "Play",
      activeRoom: room("The Sentry Drone"),
      floorDeck: [room("Security Turnstile")],
      Red: player({ hand: red, deck: pile("Shove", 4) }),
      Gray: player({ hand: gray, deck: pile("Duck Under", 4) }),
    });
    const { state: after, commands } = playOut(state);
    const grayPlays = commands.filter((c) => c.type === "PLAY_CARD" && c.character === "Gray");
    expect(grayPlays).toEqual([]);
    expect(after.phase).toBe("Ascend");
  });

  it("goes for the line that hands out Good Stuff when a plain Clear is just as reachable", () => {
    resetRig();
    // Flooded Ventilation Shaft: Scramble 4 → Clear; Oomph 3 and Scramble 3 →
    // Clear, and Gray gets Good Stuff. Gray's Pick The Lock alone meets the
    // first; the second needs Red too, and is worth a card.
    const chargeIn = card("Charge In");
    const state: GameState = rig({
      phase: "Play",
      activeRoom: room("Flooded Ventilation Shaft"),
      floorDeck: [room("Security Turnstile")],
      Red: player({ hand: [chargeIn, card("Shove"), card("Shove")], deck: pile("Shove", 4) }),
      Gray: player({ hand: [card("Pick The Lock"), card("Duck Under"), card("Duck Under")], deck: pile("Duck Under", 4) }),
    });
    const { state: after, commands } = playOut(state);
    const played = commands.filter((c): c is Extract<Command, { type: "PLAY_CARD" }> => c.type === "PLAY_CARD");
    expect(played.map((c) => c.character).sort()).toEqual(["Gray", "Red"]);
    expect(after.Gray.hand.some((c) => c.kind === "good_stuff")).toBe(true);
  });

  it("Flees rather than Clears when the only reachable line would cost more Exhaust than the Flee line", () => {
    resetRig();
    // Security Turnstile's Oomph 5 line Clears but Exhausts both 1; its Flee
    // line Exhausts both 1 too. Reaching 5 here takes Overdrive (Exhaust 2)
    // on top, so Clearing loses 4 cards for good against Fleeing's 2.
    const state: GameState = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ hand: [card("Charge In"), card("Overdrive"), card("Shove"), card("Shove")] }),
      Gray: player({ hand: [card("Peek Around Corner")] }), // Scramble 1: the Scramble 3 line is out of reach
    });
    const [chosen] = greedyPolicy.choose(state, legalCommands(state), policySeed(1));
    expect(chosen).toEqual({ type: "END_PLAY" });

    // The same line for the same printed cost as Fleeing is worth taking: the room is gone for good.
    resetRig();
    const clean: GameState = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ hand: [card("Charge In"), card("Shove"), card("Shove"), card("Shove"), card("Shove")] }),
      Gray: player({ hand: [card("Peek Around Corner")] }),
    });
    const [first] = greedyPolicy.choose(clean, legalCommands(clean), policySeed(1));
    expect(first.type).toBe("PLAY_CARD");
  });

  it("clears floor 1 and Ascends on a fixed seed", () => {
    const run = simulate(1, greedyPolicy, CARD_CONTENT);
    expect(run.commands.some((c) => c.type === "ASCEND")).toBe(true);
    expect(run.floor).toBeGreaterThan(1);
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

  it("takes the reward that fits best when card rewards are revealed", () => {
    resetRig();
    const weak = card("Shove"); // Oomph 2
    const best = card("Fast Follow"); // Oomph 3
    const state: GameState = rig({
      phase: "Play",
      Red: player({ deck: pile("Duck Under", 6) }), // all Scramble: Red is weak on Oomph
      pending: { kind: "TakeReward", prompt: "Take one?", character: "Red", cards: [weak, best], source: null },
    });
    const legal: readonly Command[] = [
      { type: "TAKE_REWARD", cardId: weak.id },
      { type: "TAKE_REWARD", cardId: best.id },
      { type: "TAKE_REWARD", cardId: null },
    ];
    const [chosen] = greedyPolicy.choose(state, legal, policySeed(1));
    expect(chosen).toEqual({ type: "TAKE_REWARD", cardId: best.id });
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
