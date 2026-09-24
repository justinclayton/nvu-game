import { describe, expect, it } from "vitest";
import { room } from "./__fixtures__/rig";
import { CARD_CONTENT } from "../content";
import {
  buildFloor,
  createInitialState,
  returnRoomsToSupply,
  roomsOnFloor,
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

  // Band 1's pool (Security Turnstile x3, Flooded Ventilation Shaft x2, The
  // Sentry Drone x1) is 6 cards — short of the 10 floor 1 calls for. The
  // rulebook says nothing about a band running short, so the floor is built
  // with every room the band has instead.
  it("builds floor 1 from every room band 1 has, since its pool is short of 10", () => {
    const [state] = createInitialState(1, content);
    const kinds = state.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "stairwell")).toHaveLength(1);
    expect(kinds.filter((k) => k === "room")).toHaveLength(5);
    expect(state.floorDeck).toHaveLength(6);
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

  // Band 1's pool (6 cards) is short of every floor 1-3 calls for (10, 9, 8),
  // so all three floors come out the same size: everything band 1 has.
  it("builds every band-1 floor (1-3) with band 1's whole pool, never throwing", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (const floor of [1, 2, 3]) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(6);
      expect(state.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(1);
      expect(state.floorDeck.every((r) => r.band === 1)).toBe(true);
    }
  });

  // Band 2's pool (8 cards) covers every floor 4-6 calls for (7, 6, 5).
  it("builds a full floor deck for every floor in band 2 (floors 4-6)", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (const floor of [4, 5, 6]) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(roomsOnFloor(floor));
      expect(state.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(1);
      expect(state.floorDeck.every((r) => r.band === 2)).toBe(true);
    }
  });

  // Band 3's pool (7 cards) covers every floor 7-9 calls for (4, 3, 2).
  it("builds a full floor deck for every floor in band 3 (floors 7-9)", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (const floor of [7, 8, 9]) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(roomsOnFloor(floor));
      expect(state.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(1);
      expect(state.floorDeck.every((r) => r.band === 3)).toBe(true);
    }
  });

  it("floor 10 is the one fixed Stairwell alone", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const state = buildFloor({ ...fullSupply, floor: 10 }, []);
    expect(state.floorDeck).toHaveLength(1);
    expect(state.floorDeck[0]?.name).toBe("The Monolith Core");
    expect(state.floorDeck[0]?.kind).toBe("stairwell");
    expect(state.floorDeck[0]?.band).toBeNull();
  });

  // Band 2's pool (8) has one more card than floor 4 needs (7), so which room
  // sits out varies with the seed — band 1's pool has no slack left to vary.
  it("floor 4's room composition varies with the seed", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const compositions = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const state = buildFloor({ ...fullSupply, floor: 4, seed: i }, []);
        return state.floorDeck
          .map((r) => r.name)
          .sort()
          .join(",");
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

// Rulebook, Ascending step 4: "Return every room still in the floor deck, Fled
// rooms included, to its band's pool. Rooms you cleared, the Stairwell
// included, stay on the Rooms pile."
describe("Ending a floor (Ascending, Build the next floor)", () => {
  it("returns an unseen or Fled room (still in the floor deck) to the pool", () => {
    const [initial] = createInitialState(1, content);
    const stillInDeck = room("Security Turnstile");
    const state = { ...initial, floorDeck: [stillInDeck], cleared: [], roomSupply: [] };

    const after = returnRoomsToSupply(state);

    expect(after.roomSupply).toContainEqual(stillInDeck);
  });

  it("keeps a cleared room out of the pool, on the cleared pile, across an Ascend", () => {
    const [initial] = createInitialState(1, content);
    const clearedRoom = room("The Sentry Drone");
    const state = { ...initial, floorDeck: [], cleared: [clearedRoom], roomSupply: [] };

    const after = returnRoomsToSupply(state);

    expect(after.roomSupply).not.toContainEqual(clearedRoom);
    expect(after.cleared).toEqual([clearedRoom]);
  });

  it("does not reset the cleared pile when building the next floor", () => {
    const [initial] = createInitialState(1, content);
    const clearedRoom = room("Flooded Ventilation Shaft");
    const fullSupply = returnRoomsToSupply({ ...initial, cleared: [] });
    const state = { ...fullSupply, floor: 2, cleared: [clearedRoom] };

    const next = buildFloor(state, []);

    expect(next.cleared).toEqual([clearedRoom]);
  });
});
