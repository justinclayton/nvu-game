/* The rules, one rulebook section at a time. Every test name quotes the rule it
 * is holding the engine to, so a failure says which section moved. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import { statPool } from "./queries";
import { shuffle } from "./rng";
import {
  card,
  eventTypes,
  free,
  handCard,
  ids,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { Room } from "./types";

beforeEach(resetRig);

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
    const charge = handCard(state, "Red", "Charge In");
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
    const first = handCard(state, "Red", "Shove");
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
    const red = handCard(state, "Red", "Charge In");
    const gray = handCard(state, "Gray", "Duck Under");
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
    const [redPlay, redPay] = state.Red.hand.filter((c) => c.name === "Shove");
    const [grayPlay, grayPay] = state.Gray.hand.filter((c) => c.name === "Duck Under");
    if (!redPlay || !redPay || !grayPlay || !grayPay) {
      throw new Error("Red and Gray each need two of their own card");
    }
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: redPlay.id, payWith: [redPay.id] },
      { type: "PLAY_CARD", character: "Gray", cardId: grayPlay.id, payWith: [grayPay.id] },
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
    const [toPlay, toPay] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const { state: mid } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: toPlay.id,
      payWith: [toPay.id],
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
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Shove").id,
        payWith: [handCard(state, "Red", "Charge In").id],
      },
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

describe("Room kinds: Room and Stairwell", () => {
  it("a Stairwell ends the floor when it is Cleared", () => {
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
    const chargeIn = handCard(state, "Red", "Charge In");
    const pryBar = handCard(state, "Red", "Pry Bar");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: shoves },
      free("Red", pryBar.id),
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).toContain("ROOM_CLEARED");
    expect(eventTypes(events)).toContain("FLOOR_CLEARED");
    expect(next.phase).toBe("Ascend");
  });

  it("'if more than one threshold within a challenge is met, only the lowest-printed one resolves'", () => {
    // Collapsed Stairwell's one challenge meets both its Scramble 2 line
    // (Exhaust 1 each) and its Scramble 5 line (reveal a reward) at once.
    // Only the lowest-printed of the two — Scramble 5 — resolves.
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Pick The Lock"), card("Coil Of Cable"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const pickTheLock = handCard(state, "Gray", "Pick The Lock");
    const coil = handCard(state, "Gray", "Coil Of Cable");
    const duckUnders = state.Gray.hand.filter((c) => c.name === "Duck Under").map((c) => c.id);
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: pickTheLock.id, payWith: duckUnders },
      free("Gray", coil.id),
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(1);
    expect(next.cleared).toHaveLength(1);
    // No Exhaust: the Scramble 2 line's outcome does not resolve alongside it.
    expect(next.Red.exhaust).toHaveLength(0);
    expect(next.pending?.kind).toBe("ChooseCharacter");
  });

  it("a Room's higher threshold resolves instead of its lower one — taken or skipped", () => {
    // Two Coil Of Cables (Scramble 3 each, cost 0) meet both of Collapsed
    // Stairwell's lines; only the higher one (Scramble 5: one of you reveals
    // a reward) resolves.
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
    const [firstCoil, secondCoil] = state.Gray.hand.filter((c) => c.name === "Coil Of Cable");
    if (!firstCoil || !secondCoil) throw new Error("Gray is not holding two Coil Of Cables");
    const { state: afterPlay } = play(state, [
      free("Gray", firstCoil.id),
      free("Gray", secondCoil.id),
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

  it("skips 'who reveals a reward' when both reward pools are already empty, and says so", () => {
    // Same threshold as above, but both reward pools are spent: whichever
    // character is picked reveals nothing, so there is no real choice.
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Coil Of Cable"), card("Coil Of Cable")],
      }),
      pools: { Red: [], Gray: [], goodStuff: [], badStuff: [] },
    });
    const [firstCoil, secondCoil] = state.Gray.hand.filter((c) => c.name === "Coil Of Cable");
    if (!firstCoil || !secondCoil) throw new Error("Gray is not holding two Coil Of Cables");
    const { state: next, events } = play(state, [
      free("Gray", firstCoil.id),
      free("Gray", secondCoil.id),
      { type: "END_PLAY" },
    ]);
    expect(next.pending).toBeNull();
    expect(events).toContainEqual({ type: "REWARD_POOL_EMPTY", character: "Red" });
    expect(events.some((e) => e.type === "REWARD_REVEALED")).toBe(false);
  });

  it("'only resolve the outcome from the lowest-printed met threshold' — different stats in one challenge", () => {
    // Tool Cage's one challenge mixes stats: Scramble 3 and Oomph 5. Meeting
    // both at once resolves only the lowest-printed line, Oomph 5.
    const state = rig({
      phase: "Play",
      activeRoom: room("Tool Cage"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Reckless"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Coil Of Cable")] }),
    });
    const { state: next, events } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Reckless").id,
        payWith: [handCard(state, "Red", "Shove").id],
      },
      free("Gray", handCard(state, "Gray", "Coil Of Cable").id),
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(1);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
    expect(next.Gray.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("each challenge on a card resolves on its own — Ration Locker", () => {
    // Ration Locker's Oomph and Scramble challenges are independent: Oomph 4
    // resolves its richer line for Red, while Scramble stops short of 4 and
    // resolves its plain line for Gray.
    const state = rig({
      phase: "Play",
      activeRoom: room("Ration Locker"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Charge In"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const chargeIn = handCard(state, "Red", "Charge In");
    const redShoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const [grayPlay, grayPay] = state.Gray.hand.filter((c) => c.name === "Duck Under");
    if (!grayPlay || !grayPay) throw new Error("Gray is not holding two Duck Unders");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: redShoves },
      { type: "PLAY_CARD", character: "Gray", cardId: grayPlay.id, payWith: [grayPay.id] },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
    expect(next.Gray.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("meeting more than one challenge resolves each of them — Sorting Room", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const [redPlay, redPay] = state.Red.hand.filter((c) => c.name === "Shove");
    const [grayPlay, grayPay] = state.Gray.hand.filter((c) => c.name === "Duck Under");
    if (!redPlay || !redPay || !grayPlay || !grayPay) {
      throw new Error("Red and Gray each need two of their own card");
    }
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: redPlay.id, payWith: [redPay.id] },
      { type: "PLAY_CARD", character: "Gray", cardId: grayPlay.id, payWith: [grayPay.id] },
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(2);
    expect(next.Red.hand.some((c) => c.kind === "good_stuff")).toBe(true);
    expect(next.Gray.hand.some((c) => c.kind === "good_stuff")).toBe(true);
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
      ...r.slice(0, 3).map((id) => free("Red", id)),
      ...g.slice(0, 3).map((id) => free("Gray", id)),
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
  });

  it("a room that meets no threshold Flees, empty-handed and unpunished", () => {
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

  it("a room's per-character lines still read the shared pool", () => {
    // Sorting Room: Oomph 2 pays Red, Scramble 2 pays Gray. Each line names who
    // is paid, not whose side of the play zone counts.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const [redPlay, redPay] = state.Red.hand.filter((c) => c.name === "Shove");
    const [grayPlay, grayPay] = state.Gray.hand.filter((c) => c.name === "Duck Under");
    if (!redPlay || !redPay || !grayPlay || !grayPay) {
      throw new Error("Red and Gray each need two of their own card");
    }
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: redPlay.id, payWith: [redPay.id] },
      { type: "PLAY_CARD", character: "Gray", cardId: grayPlay.id, payWith: [grayPay.id] },
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
    const { state: next } = play(state, [
      free("Red", handCard(state, "Red", "Coil Of Cable").id),
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
    const [toPlay, toPay] = empty.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const { state: next, events } = play(empty, [
      { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPay.id] },
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
    const [firstCoil, secondCoil] = empty.Gray.hand.filter((c) => c.name === "Coil Of Cable");
    if (!firstCoil || !secondCoil) throw new Error("Gray is not holding two Coil Of Cables");
    const { state: next, events } = play(empty, [
      free("Gray", firstCoil.id),
      free("Gray", secondCoil.id),
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
