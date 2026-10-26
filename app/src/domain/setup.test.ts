import { describe, expect, it } from "vitest";
import { room } from "./__fixtures__/rig";
import { CARD_CONTENT } from "../content";
import { buildFloor, createInitialState, floorName, returnRoomsToSupply, tierOf, TOP_FLOOR } from "./setup";
import type { DomainEvent } from "./types";

const content = CARD_CONTENT;

describe("Floors and tiers", () => {
  it("the Roof is the sixth floor", () => {
    expect(TOP_FLOOR).toBe(6);
  });
  it("floor 1 draws from tier 1", () => expect(tierOf(1)).toBe(1));
  it("floor 2 draws from tier 2", () => expect(tierOf(2)).toBe(2));
  it("floor 3 draws from tier 3", () => expect(tierOf(3)).toBe(3));
  it("floor 4 draws from tier 4", () => expect(tierOf(4)).toBe(4));
  it("floor 5 draws from tier 5", () => expect(tierOf(5)).toBe(5));
  it("the Roof draws from no tier", () => expect(tierOf(6)).toBeNull());
});

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

  // Rulebook Setup, "Floor deck": "Assemble the floor deck for the floor
  // you're building by shuffling the cards for that floor together." Floor N
  // draws from tier N, and every copy of every card of that tier goes in.
  it.each([1, 2, 3])("tier %i's floor deck holds every copy of its Rooms and Stairwell", (floor) => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const printed = fullSupply.roomSupply.filter((r) => r.tier === floor);
    const state = buildFloor({ ...fullSupply, floor }, []);
    expect(state.floorDeck.map((r) => r.id).sort()).toEqual(printed.map((r) => r.id).sort());
    expect(state.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(3);
    expect(state.floorDeck.filter((r) => r.kind === "room")).toHaveLength(6);
    expect(state.roomSupply.some((r) => r.tier === floor)).toBe(false);
  });

  it("shuffles the floor deck", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const orders = new Set(
      Array.from({ length: 20 }, (_, i) =>
        buildFloor({ ...fullSupply, floor: 1, seed: i }, [])
          .floorDeck.map((r) => r.id)
          .join(","),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  // C59 prints a Stairwell for each of floors 4 and 5.
  it.each([
    [4, "Sexy Blob"],
    [5, "Comrade Black"],
  ] as const)("floor %i's deck holds %s and every Room of its tier", (floor, stairwell) => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const printed = fullSupply.roomSupply.filter((r) => r.tier === floor);
    const state = buildFloor({ ...fullSupply, floor }, []);
    expect(state.phase).not.toBe("GameOver");
    expect(state.floorDeck.map((r) => r.id).sort()).toEqual(printed.map((r) => r.id).sort());
    const stairwells = state.floorDeck.filter((r) => r.kind === "stairwell");
    expect(stairwells.map((r) => r.name)).toEqual([stairwell]);
    expect(state.floorDeck.filter((r) => r.kind === "room").length).toBeGreaterThan(0);
  });

  // A tier that prints no Stairwell leaves no way up, so the run is void. The
  // real supply prints one for every tier, so this rigs a supply without.
  it.each([4, 5])("aborts floor %i, its tier printing no Stairwell, naming the floor", (floor) => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const roomSupply = fullSupply.roomSupply.filter((r) => r.kind !== "stairwell");
    const events: DomainEvent[] = [];
    const state = buildFloor({ ...fullSupply, roomSupply, floor }, events);
    expect(state.phase).toBe("GameOver");
    expect(state.outcome).toBe("Aborted");
    const aborted = events.find((e) => e.type === "RUN_ABORTED");
    expect(aborted && "reason" in aborted ? aborted.reason : "").toContain(`Floor ${String(floor)}`);
  });

  it("the Roof is The Supreme Commander alone", () => {
    const [initial] = createInitialState(1, content);
    const fullSupply = returnRoomsToSupply(initial);
    const state = buildFloor({ ...fullSupply, floor: TOP_FLOOR }, []);
    expect(state.floorDeck).toHaveLength(1);
    expect(state.floorDeck[0]?.name).toBe("The Supreme Commander");
    expect(state.floorDeck[0]?.kind).toBe("stairwell");
    expect(state.floorDeck[0]?.tier).toBeNull();
  });

  it("calls the sixth floor the Roof", () => {
    expect(floorName(5)).toBe("Floor 5");
    expect(floorName(TOP_FLOOR)).toBe("The Roof");
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
// rooms included, to its tier's pool. Rooms you cleared, the Stairwell
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
    const clearedRoom = room("Puzzle Room");
    const fullSupply = returnRoomsToSupply({ ...initial, cleared: [] });
    const state = { ...fullSupply, floor: 2, cleared: [clearedRoom] };

    const next = buildFloor(state, []);

    expect(next.cleared).toEqual([clearedRoom]);
  });
});
