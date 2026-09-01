/* The rules, one rulebook section at a time. Every test name quotes the rule it
 * is holding the engine to, so a failure says which section moved. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import { statPool } from "./queries";
import { card, eventTypes, must, pile, play, player, resetRig, rig, room } from "./__fixtures__/rig";
import type { CardId, Command, GameState } from "./types";

beforeEach(resetRig);

const ids = (state: GameState, c: "Red" | "Gray"): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const playFree = (c: "Red" | "Gray", cardId: CardId): Command => ({
  type: "PLAY_CARD",
  character: c,
  cardId,
  payWith: [],
});

describe("§5 Phase 1 — Flip", () => {
  it("turns the top card of the floor deck face up before anything is spent", () => {
    const first = room("Sorting Room");
    const state = rig({
      phase: "Flip",
      floorDeck: [first, room("Ration Locker")],
      Red: player({ deck: pile("Shove", 3) }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.activeRoom?.id).toBe(first.id);
    expect(next.floorDeck).toHaveLength(1);
    expect(next.phase).toBe("Draw");
    expect(eventTypes(events)).toEqual(["ROOM_FLIPPED"]);
  });

  it("ends the run when both characters are Down at the start of a turn", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ down: true }),
      Gray: player({ down: true }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toEqual(["GAME_OVER"]);
  });
});

describe("§5 Phase 2 — Draw", () => {
  const drawState = (over = {}) =>
    rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      ...over,
    });

  it("'you must draw at least 1' — the draw phase will not end otherwise", () => {
    const state = drawState();
    const rejected = execute(state, { type: "END_DRAW" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("MustDrawAtLeastOne");
  });

  it("'a full hand does not excuse the minimum' — the card is Exhausted instead", () => {
    const state = drawState({
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 5) }),
    });
    const { state: next, events } = must(state, { type: "DRAW", character: "Red" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.exhaust).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(4);
    expect(eventTypes(events)).toEqual(["DRAW_BURNED", "CARD_EXHAUSTED"]);
  });

  it("'you may not draw up while holding 5 or more cards' — one burned draw, no more", () => {
    const state = drawState({
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 5) }),
    });
    const once = must(state, { type: "DRAW", character: "Red" });
    const twice = execute(once.state, { type: "DRAW", character: "Red" });
    expect(twice.ok).toBe(false);
    if (!twice.ok) expect(twice.reason.code).toBe("HandIsFull");
  });

  it("'the draw phase ends for both characters at once'", () => {
    const state = drawState();
    const { state: next } = play(state, [
      { type: "DRAW", character: "Red" },
      { type: "DRAW", character: "Gray" },
      { type: "END_DRAW" },
    ]);
    expect(next.phase).toBe("Play");
  });

  it("'once play begins, nobody draws'", () => {
    const state = drawState();
    const { state: next } = play(state, [
      { type: "DRAW", character: "Red" },
      { type: "DRAW", character: "Gray" },
      { type: "END_DRAW" },
    ]);
    const rejected = execute(next, { type: "DRAW", character: "Red" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("WrongPhase");
  });
});

describe("§5 Phase 3 — Play", () => {
  const playState = (over = {}) =>
    rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Charge In"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      ...over,
    });

  it("'to play a card, Exhaust cards from your hand equal to its Cost'", () => {
    const state = playState();
    const [charge, shove] = state.Red.hand;
    if (!charge || !shove) throw new Error("rig");
    const rejected = execute(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: charge.id,
      payWith: [],
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("WrongPayment");
  });

  it("'you pay in other cards from your own hand' — never with the card itself", () => {
    const state = playState({
      Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
    });
    const [first] = state.Red.hand;
    if (!first) throw new Error("rig");
    const rejected = execute(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: first.id,
      payWith: [first.id],
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("CannotPayWithThat");
  });

  it("'Red never pays for Gray' — a partner's card is not payment", () => {
    const state = playState({
      Red: player({ deck: pile("Shove", 5), hand: [card("Charge In")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const red = state.Red.hand[0];
    const gray = state.Gray.hand[0];
    if (!red || !gray) throw new Error("rig");
    const rejected = execute(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: red.id,
      payWith: [gray.id, gray.id],
    });
    expect(rejected.ok).toBe(false);
  });

  it("'their stats form one shared pool across both characters'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const redHand = ids(state, "Red");
    const grayHand = ids(state, "Gray");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: redHand[0] as CardId, payWith: [redHand[1] as CardId] },
      { type: "PLAY_CARD", character: "Gray", cardId: grayHand[0] as CardId, payWith: [grayHand[1] as CardId] },
    ]);
    // Shove is Power 2, Duck Under is Scramble 2.
    expect(statPool(next)).toEqual({ power: 2, scramble: 2 });
    expect(statPool(next, "Red")).toEqual({ power: 2, scramble: 0 });
    expect(statPool(next, "Gray")).toEqual({ power: 0, scramble: 2 });
  });

  it("'nothing resolves while you play' — the room is checked once, at the end", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const hand = ids(state, "Red");
    const { state: mid } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    // Sorting Room pays at Power 2 and the pool is 2, but nothing has happened.
    expect(mid.activeRoom).not.toBeNull();
    expect(mid.Red.hand).toHaveLength(0);
  });

  it("'declining is failing without trying' — spending nothing is legal", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next } = must(state, { type: "END_PLAY" });
    expect(next.fled).toHaveLength(1);
  });
});

describe("§5 Phase 4 — Cleanup", () => {
  it("'Exhaust both hands and the entire play zone'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Shove"), card("Charge In")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const hand = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: hand[0] as CardId, payWith: [hand[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.playZone).toEqual([]);
    // The Shove played, the Charge In paid with, and the Good Stuff is Hold so
    // it stays in hand.
    expect(next.Red.exhaust).toHaveLength(2);
  });

  it("'`Hold` cards still in hand are the only survivors'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Pry Bar"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // The Flee line reads "One of you Exhausts 3", so the room asks who first.
    const { state: next } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Gray" },
    ]);
    expect(next.Red.hand.map((c) => c.name)).toEqual(["Pry Bar"]);
  });

  it("'if the floor draw pile is empty, shuffle the Fled pile back into it'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      floorDeck: [],
      fled: [room("Ruptured Coolant Line")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.fled).toEqual([]);
    expect(next.floorDeck).toHaveLength(2);
    expect(eventTypes(events)).toContain("FLED_RESHUFFLED");
  });
});

describe("§6 The three kinds of room", () => {
  it("an Enemy room ends the floor when it is Cleared", () => {
    // The Cherry wants Power 5: Charge In (Power 4, Cost 2) plus a free Pry Bar
    // (Power 3) gets there with two Shoves as the payment.
    const state = rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const h = ids(state, "Red");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: h[0] as CardId, payWith: [h[1] as CardId, h[2] as CardId] },
      playFree("Red", h[3] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).toContain("ROOM_CLEARED");
    expect(eventTypes(events)).toContain("FLOOR_CLEARED");
    expect(next.phase).toBe("Ascend");
  });

  it("a Stuff room is Cleared either way and never punishes you", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.cleared).toHaveLength(1);
    expect(next.fled).toEqual([]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.Red.deck).toHaveLength(5);
  });

  it("'each character is measured on their own side of the play zone only'", () => {
    // Sorting Room: Power 2 pays Red, Scramble 2 pays Gray. Red plays Power and
    // Gray plays Scramble, so each pays for their own item.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const r = ids(state, "Red");
    const g = ids(state, "Gray");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "PLAY_CARD", character: "Gray", cardId: g[0] as CardId, payWith: [g[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    // Both lines paid. What each one drew is blind, and a Crowbar in hand pays
    // an extra piece, so the count is "at least one" rather than exactly one.
    expect(next.Red.hand.every((c) => c.kind === "good_stuff")).toBe(true);
    expect(next.Red.hand.length).toBeGreaterThanOrEqual(1);
    expect(next.Gray.hand.every((c) => c.kind === "good_stuff")).toBe(true);
    expect(next.Gray.hand.length).toBeGreaterThanOrEqual(1);
  });

  it("a Stuff room's split line pays nobody when the pool is on the wrong side", () => {
    // Tool Cage asks Red for Power 5 on Red's own side; Red plays Scramble.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Coil Of Cable")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      playFree("Red", r[0] as CardId),
      { type: "END_PLAY" },
    ]);
    // Scramble 3 on Red's side meets nothing: Sorting Room asks Red for Power.
    // Gray's line reads Gray's own side, which is empty.
    expect(next.Red.hand).toHaveLength(0);
    expect(next.Gray.hand).toHaveLength(0);
  });
});
