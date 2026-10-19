import { describe, expect, it } from "vitest";
import { room } from "./__fixtures__/rig";
import { CARD_CONTENT } from "../content";
import { buildFloor, createInitialState, FLOOR_DECK_SIZE, returnRoomsToSupply, TOP_FLOOR } from "./setup";
import type { DomainEvent } from "./types";

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

  // Every floor deck is 6 cards, 1 Stairwell and 5 Rooms (rulebook Setup,
  // "Floor deck"), and each card lists the floors it serves. The pools hold
  // enough for every floor with every room cleared, the worst case, since a
  // cleared room never returns to the pool.
  it("builds a 6-card floor deck of 1 Stairwell and 5 Rooms for every floor", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck).toHaveLength(FLOOR_DECK_SIZE);
      expect(state.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(1);
      expect(state.floorDeck.every((r) => r.floors.includes(floor))).toBe(true);
    }
  });

  // Tiers map 2-2-1 (issue #276): floors 1 and 2 draw tier 1, floors 3 and 4
  // tier 2, floor 5 tier 3 Rooms with the Monolith Core as its Stairwell.
  it("draws tiers 2-2-1, with the Monolith Core as floor 5's Stairwell", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const tierOnFloor = (floor: number) =>
      new Set(buildFloor({ ...fullSupply, floor }, []).floorDeck.filter((r) => r.kind === "room").map((r) => r.tier));
    expect([1, 2, 3, 4, 5].map(tierOnFloor)).toEqual([
      new Set([1]),
      new Set([1]),
      new Set([2]),
      new Set([2]),
      new Set([3]),
    ]);
    const roof = buildFloor({ ...fullSupply, floor: 5 }, []);
    expect(roof.floorDeck.find((r) => r.kind === "stairwell")?.name).toBe("The Monolith Core");
  });

  it("reads which floors a room serves from the room, not the floor number", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const movedToFloor1 = fullSupply.roomSupply.map((r) =>
      r.name === "Smoldering Armory" ? { ...r, floors: [1] } : r.floors.includes(1) && r.kind === "room" ? { ...r, floors: [] } : r,
    );
    const state = buildFloor({ ...fullSupply, roomSupply: movedToFloor1, floor: 1 }, []);
    expect(state.floorDeck.filter((r) => r.kind === "room").every((r) => r.name === "Smoldering Armory")).toBe(true);
  });

  // With floor 1's Rooms gone from the pool, building it aborts the run instead.
  it("aborts a floor whose pool is short of 6 cards", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const shortFloor1 = {
      ...fullSupply,
      roomSupply: fullSupply.roomSupply.filter((r) => !(r.kind === "room" && r.floors.includes(1))),
    };
    const events: DomainEvent[] = [];
    const state = buildFloor({ ...shortFloor1, floor: 1, seed: initial.seed }, events);
    expect(state.phase).toBe("GameOver");
    expect(state.outcome).toBe("Aborted");
    expect(events.some((e) => e.type === "RUN_ABORTED")).toBe(true);
  });

  it("leaves the Iron Sentinel out of every floor until #387", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
      const state = buildFloor({ ...fullSupply, floor }, []);
      expect(state.floorDeck.some((r) => r.name === "The Iron Sentinel")).toBe(false);
    }
  });

  // Tier 2's pool has more cards than floor 3 needs, so which rooms sit out
  // varies with the seed.
  it("floor 3's room composition varies with the seed", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const compositions = new Set(
      Array.from({ length: 20 }, (_, i) => {
        const state = buildFloor({ ...fullSupply, floor: 3, seed: i }, []);
        return state.floorDeck
          .map((r) => r.name)
          .sort()
          .join(",");
      }),
    );
    expect(compositions.size).toBeGreaterThan(1);
  });

  it("takes floor 1's Stairwell and Rooms from tier 1", () => {
    const [state] = createInitialState(1, content);
    const stairwell = state.floorDeck.find((r) => r.kind === "stairwell");
    expect(stairwell?.name).toBe("The Sentry Drone");
    expect(state.floorDeck.every((r) => r.tier === 1)).toBe(true);
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
// rooms included, to the pool. Rooms you cleared, the Stairwell
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
