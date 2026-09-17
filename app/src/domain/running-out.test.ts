/* §9 Running out — last stand, going Down, and the end of the run. */

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
import type { CardId, Character, GameState } from "./types";

beforeEach(resetRig);

const ids = (state: GameState, c: Character): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const free = (c: Character, cardId: CardId) =>
  ({ type: "PLAY_CARD", character: c, cardId, payWith: [] }) as const;

describe("§9 Last stand", () => {
  it("'immediately enters Last Stand' the moment the draw that empties the deck lands", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [card("Charge In")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const drew = must(state, { type: "DRAW", character: "Red" });
    // The rest of the Draw phase runs on, so the state is live right away
    // rather than at the phase boundary. See open-questions.md #17.
    expect(drew.state.Red.deck).toEqual([]);
    expect(drew.state.Red.lastStand).toBe(true);
    expect(eventTypes(drew.events)).toContain("LAST_STAND");
  });

  it("'a character in last stand does not draw' — the opening draw included", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: pile("Shove", 2), lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const rejected = execute(state, { type: "DRAW", character: "Red" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("InLastStand");

    // And the flip that opens a turn passes them by, rather than sending them
    // Down on an empty deck.
    const turn = must(
      rig({
        phase: "Flip",
        floorDeck: [room("Sorting Room")],
        Red: player({ deck: [], hand: pile("Shove", 2), lastStand: true }),
        Gray: player({ deck: pile("Duck Under", 4) }),
      }),
      { type: "FLIP_ROOM" },
    );
    expect(turn.state.Red.down).toBe(false);
    expect(turn.state.Red.hand).toHaveLength(2);
  });

  it("'every card in their hand may be played at no cost'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: [card("Charge In")], lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const [chargeIn] = ids(state, "Red");
    const { state: next } = must(state, free("Red", chargeIn as CardId));
    expect(next.playZone).toHaveLength(1);
    expect(next.Red.exhaust).toEqual([]);
  });

  it("'all cards in the play zone are shuffled into their deck, then 2 are Exhausted'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: pile("Shove", 3), lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next, events } = play(state, [
      free("Red", hand[0] as CardId),
      free("Red", hand[1] as CardId),
      free("Red", hand[2] as CardId),
      { type: "END_PLAY" },
    ]);
    // Three played, shuffled back, two Exhausted as the price: one left.
    expect(next.Red.deck).toHaveLength(1);
    expect(next.Red.exhaust).toHaveLength(2);
    expect(next.Red.lastStand).toBe(false);
    expect(next.Red.down).toBe(false);
    expect(eventTypes(events)).toContain("LAST_STAND_ESCAPED");
  });

  it("'if fewer than 2 cards went into that shuffle, the tax sends you Down'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: pile("Shove", 2), lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next } = play(state, [
      free("Red", hand[0] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.Red.down).toBe(true);
  });

  it("'the team Fleeing while a character is in last stand puts them Down'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [], hand: [card("Shove")], lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next, events } = play(state, [
      free("Red", hand[0] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("ROOM_FLED");
  });

  it("a Flee line whose own text Clears the room still counts as a Clear", () => {
    // A Stuff room's Flee line clears it, so last stand survives an empty board
    // — but the escape tax still meets an empty deck. Two cards played is what
    // gets you out.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: pile("Shove", 3), lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next } = play(state, [
      free("Red", hand[0] as CardId),
      free("Red", hand[1] as CardId),
      free("Red", hand[2] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.Red.down).toBe(false);
    expect(next.cleared).toHaveLength(1);
  });
});

describe("§9 Going Down", () => {
  it("'a card would be moved from the top of their deck, but the deck is empty'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: [], hand: [card("Pry Bar")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Collapsed Stairwell's Flee line: one of you Exhausts 3.
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("'going Down empties your hand into your exhaust pile'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: [], hand: [card("Pry Bar"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.exhaust.map((c) => c.name)).toContain("Pry Bar");
  });

  it("'a Down character takes no punishments' — every Flee line falls on the survivor", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      Red: player({ deck: [], hand: [], down: true }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // "Both of you Exhaust 1, and one of you gets Bad Stuff." Red is out, so
    // there is nobody to choose between: it all lands on Gray.
    const { state: next } = must(state, { type: "END_PLAY" });
    expect(next.Red.exhaust).toEqual([]);
    expect(next.Gray.deck).toHaveLength(4);
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Gray.hand[0]?.kind).toBe("bad_stuff");
  });

  it("'no card may be put into a Down character's hand'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: [], down: true }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Coil Of Cable")] }),
    });
    const [coil] = ids(state, "Gray");
    const { state: next } = play(state, [
      free("Gray", coil as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand).toEqual([]);
    // Gray met their own line and Red is out, so everything earned went to Gray.
    expect(next.Gray.hand.length).toBeGreaterThanOrEqual(1);
    expect(next.Gray.hand.every((c) => c.kind === "good_stuff")).toBe(true);
  });

  it("'a Down character is skipped' — the opening draw passes them by too", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), down: true }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const rejected = execute(state, { type: "DRAW", character: "Red" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("CharacterIsDown");

    const turn = must(
      rig({
        phase: "Flip",
        floorDeck: [room("Sorting Room")],
        Red: player({ deck: pile("Shove", 3), down: true }),
        Gray: player({ deck: pile("Duck Under", 3) }),
      }),
      { type: "FLIP_ROOM" },
    );
    expect(turn.state.Red.hand).toEqual([]);
    expect(turn.state.Red.deck).toHaveLength(3);
    expect(turn.state.Gray.hand).toHaveLength(1);
  });
});
