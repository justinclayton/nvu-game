/* The rules, one rulebook section at a time. Every test name quotes the rule it
 * is holding the engine to, so a failure says which section moved. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import { statPool } from "./queries";
import { shuffle } from "./rng";
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
import type { CardId, Command, GameState, Room } from "./types";

beforeEach(resetRig);

const ids = (state: GameState, c: "Red" | "Gray"): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const playFree = (c: "Red" | "Gray", cardId: CardId): Command => ({
  type: "PLAY_CARD",
  character: c,
  cardId,
  payWith: [],
});

describe("Turn Start", () => {
  it("step 1, Flip the room: turns the top card of the floor deck face up before anything is spent", () => {
    const first = room("Sorting Room");
    const state = rig({
      phase: "Turn Start",
      floorDeck: [first, room("Ration Locker")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.activeRoom?.id).toBe(first.id);
    expect(next.floorDeck).toHaveLength(1);
    // Both steps run together with no decision between them, so the state
    // moves straight from Turn Start to Play.
    expect(next.phase).toBe("Play");
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Gray.hand).toHaveLength(5);
    expect(eventTypes(events)).toEqual(["ROOM_FLIPPED", ...Array<string>(10).fill("CARD_DRAWN")]);
  });

  it("step 2, Draw up to five: 'draw cards from your deck until you hold 5' — all at once, no decision", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Gray.hand).toHaveLength(5);
    expect(next.Red.deck).toEqual([]);
    expect(next.Gray.deck).toEqual([]);
    expect(next.Red.drewThisTurn).toBe(5);
  });

  it("step 2, Draw up to five: 'if you already hold 5 or more, do not draw'", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(5);
    // Only Gray's five draws — Red owed none.
    expect(eventTypes(events).filter((t) => t === "CARD_DRAWN")).toHaveLength(5);
  });

  it("step 2, Draw up to five: draws only as many as it takes to reach 5 from a hand already holding some", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 5), hand: pile("Charge In", 2) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(2);
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
    expect(next.resolution?.roomEnded).toBe("Fled");
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

  it("Outcome: 'shuffle the room card back into the Floor deck' — the same turn it Flees", () => {
    const rest = room("Ruptured Coolant Line");
    const state = rig({
      seed: 4242,
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      floorDeck: [rest],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const fledRoom = state.activeRoom as Room;
    // The Exhaust 3 pulls from a deck of 5, so it never touches the discard
    // pile or the RNG — the only shuffle left to check is the one at Cleanup.
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(eventTypes(events)).toContain("FLED_RESHUFFLED");
    const [expectedDeck, expectedSeed] = shuffle([rest, fledRoom], state.seed);
    expect(next.floorDeck).toEqual(expectedDeck);
    expect(next.seed).toBe(expectedSeed);
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
    // "Both of you Exhaust 1" — to the Exhaust pile, not the discard pile.
    expect(next.Red.exhaust).toHaveLength(1);
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
    expect(afterPlay.phase).toBe("Outcome");

    const { state: afterChoice, events: choiceEvents } = must(afterPlay, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(eventTypes(choiceEvents)).toContain("REWARD_REVEALED");
    expect(afterChoice.pending?.kind).toBe("TakeReward");
    expect(afterChoice.phase).toBe("Outcome");

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
  });

  it("a Stuff room that meets no threshold Flees, empty-handed and unpunished", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(eventTypes(events)).toContain("ROOM_FLED");
    expect(eventTypes(events)).not.toContain("ROOM_CLEARED");
    expect(next.cleared).toEqual([]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.Red.deck).toHaveLength(5);
    // Same turn: it is already back in the Floor deck by the time Cleanup ends.
    expect(next.floorDeck).toHaveLength(1);
  });

  it("a Stuff room's per-character lines still read the shared pool", () => {
    // Sorting Room: Oomph 2 pays Red, Scramble 2 pays Gray. Each line names who
    // is paid, not whose side of the play zone counts.
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

  it("a Room's Challenge is met from either character's side, not just the one it names", () => {
    // Sorting Room's Scramble 2 line pays Gray, but Red is the one who plays
    // Scramble — the shared pool reads it anyway, so Gray is still paid.
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
    // Oomph never reached 2, so Red gets nothing.
    expect(next.Red.hand).toHaveLength(0);
    // Scramble reached 2 from Red's card alone; Gray is the line's named
    // character, so Gray is paid from that same shared pool.
    expect(next.Gray.hand.every((c) => c.kind === "good_stuff")).toBe(true);
    expect(next.Gray.hand.length).toBeGreaterThanOrEqual(1);
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
