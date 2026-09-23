/* Rulebook, Ascending — shuffle the hand into the deck, Settle your Stuff, the
 * reward, building the next floor. */

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

const NOTHING: AscendChoice = { settle: [], takeRewardId: null };

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

  it("runs before Settle your Stuff, so a Stuff card starting in hand is settled as deck Stuff", () => {
    const inHand = card("Pry Bar");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [inHand], discard: [] }),
    });
    const before = state.pools.goodStuff.length;
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    // The default for Good Stuff: it went to its pool, exactly as it would
    // from the deck — the hand it started in no longer matters by then.
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.deck.some((c) => c.id === inHand.id)).toBe(false);
    expect(next.pools.goodStuff).toHaveLength(before + 1);
  });
});

describe("Ascending, Settle your Stuff", () => {
  it("'shuffle it into the Good Stuff pool' — the default for a Good Stuff card", () => {
    const state = atAscension();
    const before = state.pools.goodStuff.length;
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.discard.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(next.Red.deck.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(next.pools.goodStuff).toHaveLength(before + 1);
    expect(next.scrapyard).toEqual([]);
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
  });

  it("'keep it by Scrapping one non-Stuff card' — a Good Stuff card kept stays where it was found", () => {
    const state = atAscension();
    const pryBar = state.Red.discard.find((c) => c.name === "Pry Bar");
    const payer = state.Red.discard.find((c) => c.name === "Charge In");
    if (!pryBar || !payer) throw new Error("rig");
    const { state: next, events } = must(state, {
      type: "ASCEND",
      Red: { settle: [{ cardId: pryBar.id, payWith: payer.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(next.Red.discard.some((c) => c.id === pryBar.id)).toBe(true);
    expect(next.scrapyard.map((c) => c.id)).toEqual([payer.id]);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
  });

  it("'keep it' — the default for a Bad Stuff card", () => {
    const badStuff = card("Sluggish");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), discard: [badStuff, ...pile("Charge In", 2)] }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.discard.some((c) => c.id === badStuff.id)).toBe(true);
    expect(next.pools.badStuff.some((c) => c.id === badStuff.id)).toBe(false);
  });

  it("'shuffle it into the Bad Stuff pool and Scrap one non-Stuff card' — shedding Bad Stuff", () => {
    const badStuff = card("Sluggish");
    const payer = card("Charge In");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), discard: [badStuff, payer] }),
    });
    const before = state.pools.badStuff.length;
    const { state: next, events } = must(state, {
      type: "ASCEND",
      Red: { settle: [{ cardId: badStuff.id, payWith: payer.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(next.Red.discard).toEqual([]);
    expect(next.pools.badStuff).toHaveLength(before + 1);
    expect(next.scrapyard.map((c) => c.id)).toEqual([payer.id]);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
  });

  it("searches the deck as well as the discard pile", () => {
    const inDeck = card("Pry Bar");
    const inDiscard = card("Sluggish");
    const state = atAscension({
      Red: player({ deck: [inDeck, ...pile("Shove", 2)], discard: [inDiscard] }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    // The Good Stuff in the deck went to its pool by default...
    expect(next.Red.deck.some((c) => c.id === inDeck.id)).toBe(false);
    // ...and the Bad Stuff in the discard pile stayed, by its own default, right where it was.
    expect(next.Red.discard.some((c) => c.id === inDiscard.id)).toBe(true);
  });

  it("a payer that started in hand still pays, once the hand has joined the deck", () => {
    const pryBar = card("Pry Bar");
    const payer = card("Shove");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 1), hand: [payer], discard: [pryBar] }),
    });
    const { state: next } = must(state, {
      type: "ASCEND",
      Red: { settle: [{ cardId: pryBar.id, payWith: payer.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.discard.some((c) => c.id === pryBar.id)).toBe(true);
    expect(next.scrapyard.map((c) => c.id)).toEqual([payer.id]);
  });

  it("rejects settling a card that is not Stuff the character holds", () => {
    const state = atAscension();
    const rejected = execute(state, {
      type: "ASCEND",
      Red: { settle: [{ cardId: state.Red.deck[0]!.id, payWith: null }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotAnOption");
  });

  it("rejects paying with a card that is not another owned, non-Stuff card", () => {
    const state = atAscension();
    const pryBar = state.Red.discard.find((c) => c.name === "Pry Bar");
    if (!pryBar) throw new Error("rig");
    const rejected = execute(state, {
      type: "ASCEND",
      Red: { settle: [{ cardId: pryBar.id, payWith: pryBar.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotAnOption");
  });

  it("rejects spending the same payer twice", () => {
    const goodStuff = card("Pry Bar");
    const badStuff = card("Sluggish");
    const payer = card("Charge In");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), discard: [goodStuff, badStuff, payer] }),
    });
    const rejected = execute(state, {
      type: "ASCEND",
      Red: {
        settle: [
          { cardId: goodStuff.id, payWith: payer.id },
          { cardId: badStuff.id, payWith: payer.id },
        ],
        takeRewardId: null,
      },
      Gray: NOTHING,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotAnOption");
  });

  it("'no heal' — the discard pile is untouched apart from the Stuff settled out of it", () => {
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
  it("'you may shuffle one into your deck'", () => {
    const state = atAscension();
    const offered = state.offer?.Red ?? [];
    const taken = offered[0];
    if (!taken) throw new Error("rig");
    const { state: next, events } = must(state, {
      type: "ASCEND",
      Red: { settle: [], takeRewardId: taken.id },
      Gray: NOTHING,
    });
    expect(next.Red.deck.some((c) => c.id === taken.id)).toBe(true);
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
    expect(kinds.filter((k) => k === "enemy")).toHaveLength(1);
    expect(next.floorDeck).toHaveLength(9);
    expect(eventTypes(events)).toContain("FLOOR_BUILT");
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
