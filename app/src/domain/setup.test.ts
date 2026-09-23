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

  it("builds floor 1 from 1 Stairwell and 9 Rooms", () => {
    const [state] = createInitialState(1, content);
    const kinds = state.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "stairwell")).toHaveLength(1);
    expect(kinds.filter((k) => k === "room")).toHaveLength(9);
    expect(state.floorDeck).toHaveLength(10);
  });

  // Rulebook Setup, "Floor deck": "The first floor consists of 10 cards. As
  // you move up, each subsequent floor will have one fewer card than the
  // previous one."
  it("floor size is 11 - floor, per rulebook Setup > Floor deck", () => {
    for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
      expect(roomsOnFloor(floor)).toBe(11 - floor);
    }
    expect(roomsOnFloor(TOP_FLOOR)).toBe(1);
  });

  it("builds a full floor deck for every floor in band 1 (floors 1-3)", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (let floor = 1; floor <= 3; floor += 1) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(roomsOnFloor(floor));
      expect(state.floorDeck.every((r) => r.band === 1)).toBe(true);
    }
  });

  // Bands 2 and 3, and floor 10's fixed Stairwell, are follow-ups (#122, #123, #125).
  it("builds an empty deck for a floor outside band 1", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (const floor of [4, 7, 10]) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(0);
    }
  });

  it("floor 1's room composition varies with the seed", () => {
    const compositions = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const [state] = createInitialState(i, content);
        return state.floorDeck.map((r) => r.name).sort().join(",");
      }),
    );
    expect(compositions.size).toBeGreaterThan(1);
  });

  it("takes the Stairwell and Rooms from the floor's own band", () => {
    const [state] = createInitialState(1, content);
    const stairwell = state.floorDeck.find((r) => r.kind === "stairwell");
    expect(stairwell?.band).toBe(1);
    expect(state.floorDeck.every((r) => r.band === 1)).toBe(true);
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
