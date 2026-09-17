/* The rules, one rulebook section at a time. Every test name quotes the rule it
 * is holding the engine to, so a failure says which section moved. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import { statPool } from "./queries";
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

describe("Flip", () => {
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
    // The flip opens Draw, and Draw opens with one card each.
    expect(eventTypes(events)).toEqual(["ROOM_FLIPPED", "CARD_DRAWN", "CARD_DRAWN"]);
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

describe("Draw", () => {
  const flipState = (over = {}) =>
    rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      ...over,
    });

  const drawState = (over = {}) =>
    rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      ...over,
    });

  it("'both players draw 1 card at the same time' — the opening draw", () => {
    const { state: next } = must(flipState(), { type: "FLIP_ROOM" });
    expect(next.phase).toBe("Draw");
    expect(next.Red.hand).toHaveLength(1);
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Gray.deck).toHaveLength(4);
    expect(next.Red.drewThisTurn).toBe(1);
    expect(next.Gray.drewThisTurn).toBe(1);
  });

  it("'if you are forced to draw with a Full Hand' — the opening draw is discarded", () => {
    const state = flipState({
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.discard).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(4);
    expect(eventTypes(events)).toContain("DRAW_BURNED");
  });

  it("'if you are in Last Stand, skip the opening draw'", () => {
    const state = flipState({
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 2), lastStand: true }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(2);
    expect(next.Red.deck).toHaveLength(5);
    expect(next.Red.drewThisTurn).toBe(0);
    expect(next.Gray.hand).toHaveLength(1);
  });

  it("'you may not draw up while holding 5 or more cards'", () => {
    const state = drawState({
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 5) }),
    });
    const rejected = execute(state, { type: "DRAW", character: "Red" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("HandIsFull");
  });

  it("'the phase ends when both players pass' — and it ends for both at once", () => {
    const { state: next } = play(drawState(), [
      { type: "DRAW", character: "Red" },
      { type: "DRAW", character: "Gray" },
      { type: "END_DRAW" },
    ]);
    expect(next.phase).toBe("Play");
    expect(next.Red.drewThisTurn).toBe(1);
  });

  it("nobody owes a draw — the phase may end with nothing drawn", () => {
    const { state: next } = must(drawState(), { type: "END_DRAW" });
    expect(next.phase).toBe("Play");
  });
});

describe("Play", () => {
  const playState = (over = {}) =>
    rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Charge In"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      ...over,
    });

  it("'you may not draw during this phase' — the draw is rejected, not thrown", () => {
    const rejected = execute(playState(), { type: "DRAW", character: "Red" });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("WrongPhase");
  });

  it("'to play a card, discard cards from your hand equal to its Cost'", () => {
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
    // Shove is Oomph 2, Duck Under is Scramble 2.
    expect(statPool(next)).toEqual({ oomph: 2, scramble: 2 });
    expect(statPool(next, "Red")).toEqual({ oomph: 2, scramble: 0 });
    expect(statPool(next, "Gray")).toEqual({ oomph: 0, scramble: 2 });
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
    // Sorting Room pays at Oomph 2 and the pool is 2, but nothing has happened.
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

describe("Cleanup", () => {
  it("'Discard the entire play zone'", () => {
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
    // The Shove played, then discarded from the play zone; the Charge In was
    // discarded earlier, to pay its cost.
    expect(next.Red.discard).toHaveLength(2);
  });

  it("'the hand carries over untouched'", () => {
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
    expect(next.Red.hand.map((c) => c.name)).toEqual(["Pry Bar", "Shove"]);
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

describe("Room kinds: Enemy, Hazard, Stuff", () => {
  it("an Enemy room ends the floor when it is Cleared", () => {
    // The Cherry wants Oomph 5: Charge In (Oomph 4, Cost 2) plus a free Pry Bar
    // (Oomph 3) gets there with two Shoves as the payment.
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

  it("'resolve the card text of every challenge you met'", () => {
    // Collapsed Stairwell clears at Scramble 2 and costs both a card; it also
    // clears at Scramble 5. Meeting the higher line does not excuse the lower.
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Pick The Lock"), card("Coil Of Cable"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const g = ids(state, "Gray");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: g[0] as CardId, payWith: [g[2] as CardId, g[3] as CardId] },
      playFree("Gray", g[1] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(2);
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.discard).toHaveLength(1);
  });

  it("a Hazard's higher threshold also reveals a reward — taken or skipped", () => {
    // Two Coil Of Cables (Scramble 3 each, cost 0) clear both of Collapsed
    // Stairwell's lines: Scramble 2 (Exhaust 1 each) and Scramble 5 (one of
    // you reveals a reward).
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Coil Of Cable"), card("Coil Of Cable")],
      }),
    });
    const grayPool = state.pools.Gray;
    const g = ids(state, "Gray");
    const { state: afterPlay } = play(state, [
      playFree("Gray", g[0] as CardId),
      playFree("Gray", g[1] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(afterPlay.pending?.kind).toBe("ChooseCharacter");

    const { state: afterChoice, events: choiceEvents } = must(afterPlay, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(eventTypes(choiceEvents)).toContain("REWARD_REVEALED");
    expect(afterChoice.pending?.kind).toBe("TakeReward");

    const { state: afterTake, events: takeEvents } = must(afterChoice, {
      type: "TAKE_REWARD",
      take: true,
    });
    expect(eventTypes(takeEvents)).toContain("REWARD_TAKEN");
    expect(afterTake.Gray.deck[0]?.name).toBe(grayPool[0]?.name);
    expect(afterTake.pools.Gray).toHaveLength(grayPool.length - 1);
  });

  it("a met line that Clears beats one that says to Flee for free", () => {
    // Villy prints Oomph 9 (Ascend) and Scramble 9 (Flee this room for free).
    // Each Turn, Outcome: if any challenge's threshold is met, the room is Cleared.
    const state = rig({
      phase: "Play",
      activeRoom: room("Villy, Coney's Work Husband"),
      Red: player({ deck: pile("Shove", 5), hand: pile("Pry Bar", 3) }),
      Gray: player({ deck: pile("Duck Under", 5), hand: pile("Coil Of Cable", 3) }),
    });
    const r = ids(state, "Red");
    const g = ids(state, "Gray");
    const { state: next } = play(state, [
      // Three free Pry Bars is Oomph 9, three free Coils is Scramble 9, so both
      // lines are met at once.
      ...r.slice(0, 3).map((id) => playFree("Red", id as CardId)),
      ...g.slice(0, 3).map((id) => playFree("Gray", id as CardId)),
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
    expect(next.fled).toEqual([]);
  });

  it("a Stuff room that meets no threshold Flees, empty-handed and unpunished", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "END_PLAY" });
    // The empty floor deck reshuffles Fled back in during cleanup, so the room
    // does not linger in `fled` — check the events for how it actually ended.
    expect(eventTypes(events)).toContain("ROOM_FLED");
    expect(eventTypes(events)).not.toContain("ROOM_CLEARED");
    expect(next.cleared).toEqual([]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.Red.deck).toHaveLength(5);
  });

  it("a Stuff room measures each character on their own side of the play zone only", () => {
    // Sorting Room: Oomph 2 pays Red, Scramble 2 pays Gray. Red plays Oomph and
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
    // Tool Cage asks Red for Oomph 5 on Red's own side; Red plays Scramble.
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
    // Scramble 3 on Red's side meets nothing: Sorting Room asks Red for Oomph.
    // Gray's line reads Gray's own side, which is empty.
    expect(next.Red.hand).toHaveLength(0);
    expect(next.Gray.hand).toHaveLength(0);
  });

  it("a met threshold against an empty Good Stuff pool pays nothing and says so", () => {
    // Sorting Room's Oomph 2 line owes Red a Good Stuff, but the pool is dry.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const empty = { ...state, pools: { ...state.pools, goodStuff: [] } };
    const r = ids(empty, "Red");
    const { state: next, events } = play(empty, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(events).toContainEqual({
      type: "STUFF_POOL_EMPTY",
      character: "Red",
      pool: "good_stuff",
    });
    expect(next.Red.hand).toHaveLength(0);
  });

  it("a met threshold against an empty Bad Stuff pool deals nothing and says so", () => {
    // Ruptured Coolant Line's Scramble 4 line owes both of you Bad Stuff, but
    // the pool is dry.
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Coil Of Cable"), card("Coil Of Cable")],
      }),
    });
    const empty = { ...state, pools: { ...state.pools, badStuff: [] } };
    const g = ids(empty, "Gray");
    const { state: next, events } = play(empty, [
      playFree("Gray", g[0] as CardId),
      playFree("Gray", g[1] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(events).toContainEqual({
      type: "STUFF_POOL_EMPTY",
      character: "Red",
      pool: "bad_stuff",
    });
    expect(events).toContainEqual({
      type: "STUFF_POOL_EMPTY",
      character: "Gray",
      pool: "bad_stuff",
    });
    expect(next.Red.hand).toHaveLength(0);
    expect(next.Gray.hand).toHaveLength(0);
  });
});
