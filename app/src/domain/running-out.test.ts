/* Running out (rulebook, Last Stand) — last stand, going Down, and the end of the run. */

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

describe("Last stand", () => {
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

  it("enters Last Stand the instant a card's own text draws the last card", () => {
    // Covering Fire: "Every time Red plays a card this turn, draw 1 card."
    // Gray holds it played, Gray's deck has exactly one card left, so Red's
    // play is what empties it — not a chosen or opening draw.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: pile("Shove", 2) }),
      Gray: player({
        deck: [card("Duck Under")],
        hand: [card("Covering Fire"), card("Duck Under")],
      }),
    });
    const grayHand = ids(state, "Gray");
    const redHand = ids(state, "Red");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: grayHand[0] as CardId, payWith: [grayHand[1] as CardId] },
      { type: "PLAY_CARD", character: "Red", cardId: redHand[0] as CardId, payWith: [redHand[1] as CardId] },
    ]);
    expect(next.Gray.deck).toEqual([]);
    expect(next.Gray.lastStand).toBe(true);
    expect(eventTypes(events)).toContain("LAST_STAND");
  });

  it("enters Last Stand the instant a card's own Exhaust X empties the deck", () => {
    // Reckless Swing: "Exhaust 1." Red's own deck has exactly one card left.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [card("Shove")], hand: [card("Reckless Swing"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(next.Red.deck).toEqual([]);
    expect(next.Red.lastStand).toBe(true);
    expect(eventTypes(events)).toContain("LAST_STAND");
  });

  it(
    "enters Last Stand the instant a room's Flee punishment empties the deck, " +
      "then goes Down at that same Cleanup because the room Fled",
    () => {
      // Collapsed Stairwell's Flee line: "One of you Exhausts 3." Nobody played
      // anything, so no threshold is met and the room Flees. Red's deck holds
      // exactly 3 cards — the punishment itself is what empties it, during
      // Outcome, before Cleanup ever runs.
      const state = rig({
        phase: "Play",
        activeRoom: room("Collapsed Stairwell"),
        Red: player({ deck: pile("Shove", 3), hand: [] }),
        Gray: player({ deck: pile("Duck Under", 4) }),
      });
      const { state: next, events } = play(state, [
        { type: "END_PLAY" },
        { type: "CHOOSE_CHARACTER", character: "Red" },
      ]);
      const types = eventTypes(events);
      expect(next.Red.deck).toEqual([]);
      expect(types).toContain("LAST_STAND");
      // The rulebook's Last Stand section sends a Fled character Down at
      // the very Cleanup that follows — including one who only just entered
      // Last Stand during this same Outcome. This is the same fate as a
      // character already in Last Stand from an earlier draw this turn (see
      // "the team Fleeing while a character is in last stand puts them Down"
      // above): both end the turn Down. The difference is only in how much of
      // the turn they spent in Last Stand — this one never saw a Play phase
      // with free costs, since Play had already ended before their deck ran out.
      expect(next.Red.down).toBe(true);
      expect(types).toContain("WENT_DOWN");
      expect(types.indexOf("LAST_STAND")).toBeLessThan(types.indexOf("WENT_DOWN"));
    },
  );

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
    expect(next.Red.discard).toEqual([]);
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
    expect(next.Red.discard).toHaveLength(2);
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

  it("logs getting out before the price and any resulting Down, with an empty play zone", () => {
    // Playtest 2, note 10: Red is already in Last Stand and plays nothing
    // this turn — Gray alone clears the room. Red's play zone is empty, so
    // the shuffle-back is a no-op and the price comes off an already-empty
    // deck, sending Red Down. The log should still read "got out" before
    // "Down", never the other way around, and the price it reports (0 cards)
    // should match what Red actually lost.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: [], lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4), hand: pile("Duck Under", 2) }),
    });
    const grayHand = ids(state, "Gray");
    const { state: next, events } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Gray",
        cardId: grayHand[0] as CardId,
        payWith: [grayHand[1] as CardId],
      },
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.down).toBe(true);

    const types = eventTypes(events);
    expect(types.indexOf("LAST_STAND_ESCAPED")).toBeLessThan(types.indexOf("WENT_DOWN"));
    const escaped = events.find((e) => e.type === "LAST_STAND_ESCAPED");
    expect(escaped).toMatchObject({ price: [] });
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

  it("a met threshold Clears a Stuff room, so Last Stand ends normally", () => {
    // Sorting Room's Oomph 2 line is met by three free Shoves, so the room
    // Clears — last stand survives an empty board, but the escape tax still
    // needs the deck it exhausts from. Two cards played is what gets you out.
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

describe("Going Down", () => {
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

  it("'going Down empties your hand into your discard pile'", () => {
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
    expect(next.Red.discard.map((c) => c.name)).toContain("Pry Bar");
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
    expect(next.Red.discard).toEqual([]);
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
