/* Rulebook, Ascending — Settle your Stuff, the reward, the next floor. There is
 * no heal and no hand discard in 0.2: a character's deck, hand and discard
 * pile carry over untouched except for whatever Settle your Stuff moves. */

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

describe("Settle your Stuff", () => {
  it("'shuffle it into the Good Stuff pool' — Good Stuff's default fate", () => {
    const state = atAscension();
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.pools.goodStuff.some((c) => c.name === "Pry Bar")).toBe(true);
    expect(next.Red.deck.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(next.Red.discard.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(eventTypes(events)).toContain("STUFF_SETTLED");
  });

  it("'keep it by Scrapping one non-Stuff card' — Good Stuff kept instead of pooled", () => {
    const state = atAscension();
    const pryBar = state.Red.discard.find((c) => c.name === "Pry Bar");
    const payer = state.Red.discard.find((c) => c.name === "Charge In");
    if (!pryBar || !payer) throw new Error("rig");
    const { state: next } = must(state, {
      type: "ASCEND",
      Red: { settle: [{ stuffId: pryBar.id, pay: payer.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    // Pry Bar was found in the discard pile, so a kept Pry Bar returns there —
    // it is not shuffled into the deck (there is no full heal in 0.2).
    expect(next.Red.discard.some((c) => c.id === pryBar.id)).toBe(true);
    expect(next.pools.goodStuff.some((c) => c.id === pryBar.id)).toBe(false);
    expect(next.scrapyard.map((c) => c.id)).toContain(payer.id);
  });

  it("'Bad Stuff stays with you' — its default fate is to keep it, free", () => {
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [card("Sluggish")] }),
    });
    const bad = state.Red.hand.find((c) => c.name === "Sluggish");
    if (!bad) throw new Error("rig");
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.hand.some((c) => c.id === bad.id)).toBe(true);
    expect(next.pools.badStuff.some((c) => c.id === bad.id)).toBe(false);
  });

  it("'shed it, and Scrap one non-Stuff card' — Bad Stuff paid off to its pool", () => {
    const state = atAscension({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("Sluggish")],
        discard: pile("Charge In", 2),
      }),
    });
    const bad = state.Red.hand.find((c) => c.name === "Sluggish");
    const payer = state.Red.discard[0];
    if (!bad || !payer) throw new Error("rig");
    const { state: next } = must(state, {
      type: "ASCEND",
      Red: { settle: [{ stuffId: bad.id, pay: payer.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(next.Red.hand.some((c) => c.id === bad.id)).toBe(false);
    expect(next.pools.badStuff.some((c) => c.id === bad.id)).toBe(true);
    expect(next.scrapyard.map((c) => c.id)).toContain(payer.id);
  });

  it("a Scrap payment may come from the deck, hand or discard pile — not the Exhaust pile", () => {
    const state = atAscension({
      Red: player({
        deck: pile("Shove", 2),
        discard: [card("Pry Bar")],
        exhaust: pile("Shove", 3),
      }),
    });
    const pryBar = state.Red.discard[0];
    const exhausted = state.Red.exhaust[0];
    if (!pryBar || !exhausted) throw new Error("rig");
    const rejected = execute(state, {
      type: "ASCEND",
      Red: { settle: [{ stuffId: pryBar.id, pay: exhausted.id }], takeRewardId: null },
      Gray: NOTHING,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotAnOption");
  });

  it("'no heal' — the discard pile is not shuffled into the deck at ascension", () => {
    const state = atAscension();
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    // Charge In (x3) stays in the discard pile; only the kept/pooled Stuff and
    // the deck itself move.
    expect(next.Red.discard.filter((c) => c.name === "Charge In")).toHaveLength(3);
  });

  it("'no hand discard' — a hand carries up the stairs untouched", () => {
    const held = card("Charge In");
    const state = atAscension({
      Red: player({ deck: pile("Shove", 2), hand: [held], discard: pile("Charge In", 3) }),
    });
    const { state: next } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.Red.hand.map((c) => c.id)).toEqual([held.id]);
  });

  it("'a taken card is shuffled into their deck; a declined card goes to the bottom'", () => {
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

  it("'declining is a real play' — the whole offer goes to the bottom", () => {
    const state = atAscension();
    const offered = state.offer?.Gray ?? [];
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });
    expect(next.pools.Gray.slice(-3).map((c) => c.id)).toEqual(offered.map((c) => c.id));
    expect(eventTypes(events)).toContain("REWARD_DECLINED");
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
    expect(next.scrapyard.map((c) => c.name)).toContain("Coil Of Cable");
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

  it("'you lose when either character goes Down' — immediately, not at a turn boundary", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: [], hand: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Collapsed Stairwell's Flee line: one of you Exhausts 3. Red's deck and
    // discard are both empty, so Red goes Down mid-resolution, and the run
    // ends in the same command rather than waiting for the next Flip.
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});
