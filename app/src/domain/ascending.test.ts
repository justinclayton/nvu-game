/* Rulebook, Ascending — shuffle the hand into the deck, the reward, building
 * the next floor. Stuff a character holds stays in their deck until it is
 * Scrapped or Exhausted; nothing returns it to a pool. */

import { beforeEach, describe, expect, it } from "vitest";
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

const NOTHING: AscendChoice = { takeRewardId: null };

/** A state parked on the Ascend phase, with the piles a test wants. */
function atAscension(over: Partial<GameState> = {}): GameState {
  const base = rig({
    phase: "Ascend",
    floor: 1,
    roomSupply: [
      room("The Sentry Drone"),
      ...Array.from({ length: 8 }, () => room("Security Turnstile")),
    ],
    cleared: [room("The Sentry Drone")],
    Red: player({ deck: pile("Shove", 2), discard: pile("Charge In", 3) }),
    Gray: player({ deck: pile("Duck Under", 2), discard: pile("Pick The Lock", 3) }),
    ...over,
  });
  return {
    ...base,
    offer: { Red: base.pools.Red.slice(0, 3), Gray: base.pools.Gray.slice(0, 3) },
  };
}

describe("Ascending, shuffle your hand into your deck", () => {
  it("'Shuffle your hand into your deck' — the hand's cards join the deck, not lost", () => {
    const held = card("Shove");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [held], discard: pile("Charge In", 3) }),
    });
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.deck.some((c) => c.id === held.id)).toBe(true);
    expect(eventTypes(events)).toContain("CARDS_SHUFFLED_IN");
  });
});

describe("Ascending, Stuff stays until Scrapped or Exhausted", () => {
  it("a Good Stuff card gained in hand stays in the deck, not the Good Stuff pool", () => {
    const gained = card("Pry Bar");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [gained], discard: [] }),
    });
    const before = state.pools.goodStuff.length;
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.deck.some((c) => c.id === gained.id)).toBe(true);
    expect(next.pools.goodStuff).toHaveLength(before);
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
  });

  it("Bad Stuff found in the deck also stays, not shed to its pool", () => {
    const badStuff = card("Sluggish");
    const state = atAscension({
      Red: player({ deck: [badStuff, ...pile("Shove", 2)], discard: pile("Charge In", 2) }),
    });
    const before = state.pools.badStuff.length;
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.deck.some((c) => c.id === badStuff.id)).toBe(true);
    expect(next.pools.badStuff).toHaveLength(before);
  });

  it("Stuff sitting in the discard pile stays there too", () => {
    const inDiscard = card("Coil Of Cable");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), discard: [inDiscard, ...pile("Charge In", 2)] }),
    });
    const before = state.pools.goodStuff.length;
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.discard.some((c) => c.id === inDiscard.id)).toBe(true);
    expect(next.pools.goodStuff).toHaveLength(before);
  });

  it("'no heal' — the discard pile is untouched", () => {
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), discard: pile("Charge In", 4) }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.discard).toHaveLength(4);
    expect(next.Red.deck).toHaveLength(2);
  });

  it("'nothing ever leaves the Scrapyard'", () => {
    const state = atAscension({ scrapyard: [card("Coil Of Cable")] });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.scrapyard.map((c) => c.name)).toContain("Coil Of Cable");
  });
});

describe("Ascending, the reward", () => {
  it("'you may put one into your discard pile'", () => {
    const state = atAscension();
    const offered = state.offer?.Red ?? [];
    const taken = offered[0];
    if (!taken) throw new Error("Red has no reward offered");
    const { state: next, events } = must(state, {
      type: "ASCEND",
      Red: { takeRewardId: taken.id },
      Gray: NOTHING,
    });
    expect(next.Red.discard.some((c) => c.id === taken.id)).toBe(true);
    expect(next.Red.deck.some((c) => c.id === taken.id)).toBe(false);
    expect(next.pools.Red.some((c) => c.id === taken.id)).toBe(false);
    // The two not taken go back to the bottom of the pool.
    const bottom = next.pools.Red.slice(-2).map((c) => c.id);
    expect(bottom).toEqual(offered.slice(1).map((c) => c.id));
    expect(eventTypes(events)).toContain("REWARD_TAKEN");
  });

  it("'put the cards you did not take on the bottom of your reward pool' — declining is a real play", () => {
    const state = atAscension();
    const offered = state.offer?.Gray ?? [];
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.pools.Gray.slice(-3).map((c) => c.id)).toEqual(offered.map((c) => c.id));
    expect(eventTypes(events)).toContain("REWARD_DECLINED");
  });
});

describe("Ascending, build the next floor", () => {
  it("'Setup, Floor deck' — one fewer room than last time", () => {
    const state = atAscension();
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    const kinds = next.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "stairwell")).toHaveLength(1);
    expect(next.floorDeck).toHaveLength(9);
    expect(eventTypes(events)).toContain("FLOOR_BUILT");
  });
});

describe("Winning and losing", () => {
  it("'you win by clearing floor 10's Stairwell'", () => {
    const state = rig({
      phase: "Play",
      floor: 10,
      activeRoom: room("The Sentry Drone"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = state.Red.hand.map((c) => c.id);
    const [chargeIn, payA, payB, pryBar, pryBar2] = hand;
    if (!chargeIn || !payA || !payB || !pryBar || !pryBar2) throw new Error("rig");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn, payWith: [payA, payB] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar, payWith: [] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar2, payWith: [] },
      { type: "END_PLAY" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Victory");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});
