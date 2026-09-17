/* Rulebook, Ascending — the Scrapyard, the Scrap tax, the full heal, the reward. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import {
  card,
  eventTypes,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { AscendChoice, GameState } from "./types";

beforeEach(resetRig);

const NOTHING: AscendChoice = { keepStuffId: null, scrapId: null, takeRewardId: null };

/** A state parked on the Ascend phase, with the piles a test wants. */
function atAscension(over: Partial<GameState> = {}): GameState {
  const base = rig({
    phase: "Ascend",
    floor: 1,
    roomSupply: [
      room("Coney, The Thing In The Stairwell"),
      room("Collapsed Stairwell"),
      room("Collapsed Stairwell"),
      room("Ruptured Coolant Line"),
      ...Array.from({ length: 8 }, () => room("Sorting Room")),
    ],
    cleared: [room("Gross Thing That Looks Like A Cherry")],
    Red: player({ deck: pile("Shove", 2), discard: [...pile("Charge In", 3), card("Pry Bar")] }),
    Gray: player({ deck: pile("Duck Under", 2), discard: pile("Pick The Lock", 3) }),
    ...over,
  });
  return {
    ...base,
    offer: { Red: base.pools.Red.slice(0, 3), Gray: base.pools.Gray.slice(0, 3) },
  };
}

describe("Ascending", () => {
  it("'move all Stuff in both discard piles to the Scrapyard'", () => {
    const state = atAscension();
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.scrapyard.map((c) => c.name)).toEqual(["Pry Bar"]);
    expect(next.Red.deck.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
  });

  it("'each character may keep one Stuff card by Scrapping another in its place'", () => {
    const state = atAscension();
    const pryBar = state.Red.discard.find((c) => c.name === "Pry Bar");
    const payer = state.Red.discard.find((c) => c.name === "Charge In");
    if (!pryBar || !payer) throw new Error("rig");
    const { state: next } = must(state, {
      type: "ASCEND",
      Red: { keepStuffId: pryBar.id, scrapId: payer.id, takeRewardId: null },
      Gray: NOTHING,
    });
    expect(next.Red.deck.some((c) => c.id === pryBar.id)).toBe(true);
    expect(next.scrapyard.map((c) => c.id)).toEqual([payer.id]);
  });

  it("'the Scrap tax is both halves or neither'", () => {
    const state = atAscension();
    const pryBar = state.Red.discard.find((c) => c.name === "Pry Bar");
    if (!pryBar) throw new Error("rig");
    const rejected = execute(state, {
      type: "ASCEND",
      Red: { keepStuffId: pryBar.id, scrapId: null, takeRewardId: null },
      Gray: NOTHING,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("ScrapTaxIncomplete");
  });

  it("'a floor cleared is a full heal' — including for a character who was Down", () => {
    const state = atAscension({
      Red: player({ deck: [], hand: [], discard: pile("Shove", 12), down: true }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.down).toBe(false);
    expect(next.Red.deck).toHaveLength(12);
    expect(next.Red.discard).toEqual([]);
  });

  it("'a taken card is shuffled into their deck; a declined card goes to the bottom'", () => {
    const state = atAscension();
    const offered = state.offer?.Red ?? [];
    const taken = offered[0];
    if (!taken) throw new Error("rig");
    const { state: next, events } = must(state, {
      type: "ASCEND",
      Red: { keepStuffId: null, scrapId: null, takeRewardId: taken.id },
      Gray: NOTHING,
    });
    expect(next.Red.deck.some((c) => c.id === taken.id)).toBe(true);
    expect(next.pools.Red.some((c) => c.id === taken.id)).toBe(false);
    // The two not taken go back to the bottom of the pool.
    const bottom = next.pools.Red.slice(-2).map((c) => c.id);
    expect(bottom).toEqual(offered.slice(1).map((c) => c.id));
    expect(eventTypes(events)).toContain("REWARD_TAKEN");
  });

  it("'declining is a real play' — the whole offer goes to the bottom", () => {
    const state = atAscension();
    const offered = state.offer?.Gray ?? [];
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.pools.Gray.slice(-3).map((c) => c.id)).toEqual(offered.map((c) => c.id));
    expect(eventTypes(events)).toContain("REWARD_DECLINED");
  });

  it("'the hand carries up the stairs, Stuff included'", () => {
    const held = card("Pry Bar");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [held], discard: pile("Charge In", 3) }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.hand.map((c) => c.id)).toEqual([held.id]);
  });

  it("'build the next floor's deck, with one fewer Stuff room than last time'", () => {
    const state = atAscension();
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Flip");
    const kinds = next.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "enemy")).toHaveLength(1);
    expect(kinds.filter((k) => k === "hazard")).toHaveLength(3);
    expect(kinds.filter((k) => k === "stuff")).toHaveLength(5);
    expect(eventTypes(events)).toContain("FLOOR_BUILT");
  });

  it("'nothing ever leaves the Scrapyard'", () => {
    const state = atAscension({ scrapyard: [card("Coil Of Cable")] });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.scrapyard.map((c) => c.name)).toEqual(["Coil Of Cable", "Pry Bar"]);
  });
});

describe("Winning and losing", () => {
  it("'you win by clearing the Enemy room on floor 10'", () => {
    const state = rig({
      phase: "Play",
      floor: 10,
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = state.Red.hand.map((c) => c.id);
    const [chargeIn, payA, payB, pryBar] = hand;
    if (!chargeIn || !payA || !payB || !pryBar) throw new Error("rig");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn, payWith: [payA, payB] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar, payWith: [] },
      { type: "END_PLAY" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Victory");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});
