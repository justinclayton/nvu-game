import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "../content";
import { buildFloor, createInitialState, returnRoomsToSupply, roomsOnFloor, TOP_FLOOR } from "./setup";

const content = CARD_CONTENT;

describe("Setting up a floor", () => {
  it("deals each character their own deck and leaves both hands empty", () => {
    const [state] = createInitialState(1, content);
    expect(state.Red.hand).toEqual([]);
    expect(state.Gray.hand).toEqual([]);
    expect(state.Red.deck.every((c) => c.owner === "Red")).toBe(true);
    expect(state.Gray.deck.every((c) => c.owner === "Gray")).toBe(true);
    // Starting deck size is NOT YET RULED; the printed copy counts come to 12.
    expect(state.Red.deck).toHaveLength(12);
    expect(state.Gray.deck).toHaveLength(12);
  });

  it("builds floor 1 from 1 Enemy room and 9 Hazard/Stuff rooms", () => {
    const [state] = createInitialState(1, content);
    const kinds = state.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "enemy")).toHaveLength(1);
    expect(kinds.filter((k) => k === "hazard" || k === "stuff")).toHaveLength(9);
    expect(state.floorDeck).toHaveLength(10);
  });

  // Rulebook Setup, "Floor deck": "The first floor consists of 10 cards. As
  // you move up, each subsequent floor will have one fewer card than the
  // previous one."
  it("floor size is 11 - floor, per rulebook Setup > Floor deck", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(roomsOnFloor(floor));
      expect(roomsOnFloor(floor)).toBe(11 - floor);
    }
    expect(roomsOnFloor(TOP_FLOOR)).toBe(1);
  });

  it("the Hazard count on a floor varies with the seed", () => {
    const hazardCounts = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const [state] = createInitialState(i, content);
        return state.floorDeck.filter((r) => r.kind === "hazard").length;
      }),
    );
    expect(hazardCounts.size).toBeGreaterThan(1);
  });

  it("takes the Enemy room that guards the floor being built", () => {
    const [state] = createInitialState(1, content);
    const enemy = state.floorDeck.find((r) => r.kind === "enemy");
    expect(enemy?.floor).toBe(1);
  });

  it("gives every physical copy its own id", () => {
    const [state] = createInitialState(1, content);
    const all = [
      ...state.Red.deck,
      ...state.Gray.deck,
      ...state.pools.Red,
      ...state.pools.Gray,
      ...state.pools.goodStuff,
      ...state.pools.badStuff,
    ];
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    const rooms = [...state.floorDeck, ...state.roomSupply];
    expect(new Set(rooms.map((r) => r.id)).size).toBe(rooms.length);
  });

  it("is a pure function of the seed", () => {
    const [a] = createInitialState(99, content);
    const [b] = createInitialState(99, content);
    expect(a).toEqual(b);
    const [c] = createInitialState(100, content);
    expect(c.Red.deck.map((x) => x.id)).not.toEqual(a.Red.deck.map((x) => x.id));
  });
});
