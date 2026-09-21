import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import { metThresholds } from "@domain/queries";
import { execute } from "@domain/engine";
import { legalCommands } from "./moves";
import { evaluate, greedyAscendChoice, greedyPolicy, policyNamed, randomPolicy } from "./policy";
import { simulate } from "./run";

describe("the roster", () => {
  it("finds a policy by name and nothing by a wrong one", () => {
    expect(policyNamed("greedy")).toBe(greedyPolicy);
    expect(policyNamed("random")).toBe(randomPolicy);
    expect(policyNamed("clever")).toBeNull();
  });
});

describe("greedy", () => {
  it("plays into a Clear when a card would do it, then ends the phase", () => {
    resetRig();
    const [shove, payer] = pile("Shove", 2);
    if (!shove || !payer) throw new Error("rig");
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [shove, payer] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const [first] = greedyPolicy.choose(state, legalCommands(state), 0);
    expect(first.type).toBe("PLAY_CARD");
    if (first.type !== "PLAY_CARD") throw new Error("expected a play");
    expect(first.character).toBe("Red");
    expect(first.payWith).toHaveLength(1);

    const played = execute(state, first);
    if (!played.ok) throw new Error(played.reason.message);
    expect(metThresholds(played.state)).toHaveLength(1);
    const [second] = greedyPolicy.choose(played.state, legalCommands(played.state), 0);
    expect(second).toEqual({ type: "END_PLAY" });
  });

  it("scores a met Ascend above a met Clear above nothing met", () => {
    resetRig();
    const base = rig({
      phase: "Play",
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const nothing = { ...base, activeRoom: room("Sorting Room") };
    const cleared = {
      ...nothing,
      playZone: [{ owner: "Red" as const, card: card("Shove") }],
    };
    const enemy = { ...base, activeRoom: room("Gross Thing That Looks Like A Cherry") };
    const ascended = {
      ...enemy,
      playZone: Array.from({ length: 3 }, () => ({ owner: "Red" as const, card: card("Shove") })),
    };
    expect(evaluate(cleared)).toBeGreaterThan(evaluate(nothing));
    expect(evaluate(ascended)).toBeGreaterThan(evaluate(cleared));
  });

  it("takes the strongest reward and keeps Stuff by Scrapping the weakest player card", () => {
    resetRig();
    const pryBar = card("Pry Bar");
    const state = rig({
      phase: "Ascend",
      Red: player({ deck: pile("Shove", 2), discard: [pryBar, card("Charge In"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 2), discard: pile("Duck Under", 2) }),
    });
    const ready = { ...state, offer: { Red: state.pools.Red.slice(0, 3), Gray: [] } };
    const red = greedyAscendChoice(ready, "Red");
    const strongest = [...ready.offer.Red].sort(
      (a, b) => b.oomph + b.scramble - (a.oomph + a.scramble),
    )[0];
    expect(red.takeRewardId).toBe(strongest?.id ?? null);
    expect(red.keepStuffId).toBe(pryBar.id);
    expect(red.scrapId).not.toBeNull();
    expect(red.scrapId).not.toBe(pryBar.id);

    const gray = greedyAscendChoice(ready, "Gray");
    expect(gray).toEqual({ keepStuffId: null, scrapId: null, takeRewardId: null });
  });

  it("gets further than random does, over a handful of seeds", () => {
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
    const floors = (policy: typeof greedyPolicy) =>
      seeds.reduce((sum, s) => sum + simulate(s, policy, CARD_CONTENT).turn, 0);
    expect(floors(greedyPolicy)).toBeGreaterThan(floors(randomPolicy));
  });
});
