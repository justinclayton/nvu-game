import { describe, expect, it } from "vitest";

import { createSession } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import type { DomainEvent } from "@domain/types";
import { moveDelays, placements } from "./placements";

/* The card layer draws one sprite per placement, so the placements have to
 * account for every physical card exactly once, and put the top of each pile on
 * top. */

describe("placements", () => {
  it("place every card and room in the state exactly once", () => {
    const session = createSession(7, CARD_CONTENT);
    session.getState().dispatch({ type: "FLIP_ROOM" });
    session.getState().dispatch({ type: "DRAW", character: "Red" });
    session.getState().dispatch({ type: "DRAW", character: "Gray" });
    const { state } = session.getState();

    const placed = placements(state);
    const ids = placed.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const expected =
      state.floorDeck.length +
      (state.activeRoom ? 1 : 0) +
      state.fled.length +
      state.cleared.length +
      state.Red.deck.length +
      state.Red.hand.length +
      state.Red.discard.length +
      state.Gray.deck.length +
      state.Gray.hand.length +
      state.Gray.discard.length +
      state.playZone.length +
      state.pools.Red.length +
      state.pools.Gray.length +
      state.pools.goodStuff.length +
      state.pools.badStuff.length +
      state.scrapyard.length;
    expect(placed).toHaveLength(expected);
  });

  it("puts the top of a deck on top of the stack, face down", () => {
    const session = createSession(7, CARD_CONTENT);
    const { state } = session.getState();
    const top = state.Red.deck[0];
    const placed = placements(state).find((p) => p.id === top?.id);
    expect(placed?.zone).toBe("red-deck");
    expect(placed?.index).toBe(state.Red.deck.length - 1);
    expect(placed?.faceUp).toBe(false);
  });

  it("lays a hand out left to right in hand order, face up", () => {
    const session = createSession(7, CARD_CONTENT);
    // The flip deals the opening draw, so one more makes two.
    session.getState().dispatch({ type: "FLIP_ROOM" });
    session.getState().dispatch({ type: "DRAW", character: "Red" });
    const { state } = session.getState();
    const hand = placements(state).filter((p) => p.zone === "red-hand");
    expect(hand.map((p) => p.index)).toEqual([0, 1]);
    expect(hand.map((p) => p.id)).toEqual(state.Red.hand.map((c) => c.id));
    expect(hand.every((p) => p.faceUp)).toBe(true);
  });
});

describe("moveDelays", () => {
  it("staggers cards in the order the events name them", () => {
    const session = createSession(7, CARD_CONTENT);
    const { state } = session.getState();
    const [a, b] = state.Red.deck;
    if (!a || !b) throw new Error("rig");
    const events: DomainEvent[] = [
      { type: "CARD_DISCARDED", character: "Red", card: a, from: "hand" },
      { type: "CARD_DISCARDED", character: "Red", card: b, from: "hand" },
      { type: "CARD_DISCARDED", character: "Red", card: a, from: "hand" },
    ];
    const delays = moveDelays(events, 100);
    expect(delays.get(a.id)).toBe(0);
    expect(delays.get(b.id)).toBe(100);
  });
});

describe("the reward offer", () => {
  it("floats the offered cards above the mat and leaves the rest in the pool", () => {
    const session = createSession(7, CARD_CONTENT);
    const base = session.getState().state;
    const state = {
      ...base,
      phase: "Ascend" as const,
      offer: { Red: base.pools.Red.slice(0, 3), Gray: base.pools.Gray.slice(0, 3) },
    };
    const placed = placements(state);
    const floating = placed.filter((p) => p.zone === "red-offer");
    expect(floating.map((p) => p.id)).toEqual(state.offer.Red.map((c) => c.id));
    expect(floating.every((p) => p.faceUp)).toBe(true);
    expect(placed.filter((p) => p.zone === "red-rewards")).toHaveLength(base.pools.Red.length - 3);
    // Outside the Ascend phase the offer is not picked up, even if one is set.
    const notYet = placements({ ...state, phase: "Flip" });
    expect(notYet.filter((p) => p.zone === "red-offer")).toHaveLength(0);
  });
});
