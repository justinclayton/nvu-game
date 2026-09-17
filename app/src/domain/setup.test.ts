import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "../content";
import {
  createInitialState,
  ENEMY_ROOMS_PER_FLOOR,
  HAZARD_ROOMS_PER_FLOOR,
  stuffRoomsOnFloor,
  TOP_FLOOR,
} from "./setup";

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

  it("builds floor 1 from 1 Enemy room, 3 Hazards and 6 Stuff rooms", () => {
    const [state] = createInitialState(1, content);
    const kinds = state.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "enemy")).toHaveLength(1);
    expect(kinds.filter((k) => k === "hazard")).toHaveLength(3);
    expect(kinds.filter((k) => k === "stuff")).toHaveLength(6);
    expect(state.floorDeck).toHaveLength(10);
  });

  // Rulebook Setup, "Floor deck": "The first floor consists of 10 cards. As
  // you move up, each subsequent floor will have one fewer card than the
  // previous one." Enemy and Hazard counts are fixed, so Stuff rooms carry
  // the whole decrease until there are none left to cut.
  it("floor size is 10 on floor 1 and one fewer each floor above, per rulebook Setup > Floor deck", () => {
    for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
      const floorSize = ENEMY_ROOMS_PER_FLOOR + HAZARD_ROOMS_PER_FLOOR + stuffRoomsOnFloor(floor);
      expect(floorSize).toBe(Math.max(ENEMY_ROOMS_PER_FLOOR + HAZARD_ROOMS_PER_FLOOR, 11 - floor));
    }
  });

  it("empties the floor of Stuff rooms as you climb", () => {
    expect(stuffRoomsOnFloor(1)).toBe(6);
    expect(stuffRoomsOnFloor(5)).toBe(2);
    expect(stuffRoomsOnFloor(10)).toBe(0);
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
