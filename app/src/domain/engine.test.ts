/* The rules, one rulebook section at a time. Every test name quotes the rule it
 * is holding the engine to, so a failure says which section moved. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
import { roomId } from "./ids";
import { costOf, statPool, thresholdIsMet } from "./queries";
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
import type { CardId, Challenge, Command, GameState, Room, Threshold } from "./types";

beforeEach(resetRig);

const playFree = free;

/**
 * A room built by hand rather than looked up from design/cards.yaml, for a
 * rule that must hold regardless of which rooms the printed list carries.
 */
let fixtureRoomCount = 0;
function fixtureRoom(challenges: readonly Challenge[]): Room {
  fixtureRoomCount += 1;
  return {
    id: roomId(`fixture-room#${String(fixtureRoomCount)}`),
    name: "Fixture Room",
    kind: "room",
    band: 1,
    flavor: "",
    challenges,
    flee: { text: "Leave empty-handed.", clears: false, effects: [] },
  };
}

describe("Turn Start", () => {
  it("step 1, Flip the room: turns the top card of the floor deck face up before anything is spent", () => {
    const first = room("Security Turnstile");
    const state = rig({
      phase: "Turn Start",
      floorDeck: [first, room("Flooded Ventilation Shaft")],
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
      floorDeck: [room("Security Turnstile")],
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
      floorDeck: [room("Security Turnstile")],
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
      floorDeck: [room("Security Turnstile")],
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
      activeRoom: room("The Sentry Drone"),
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
      activeRoom: room("The Sentry Drone"),
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
      activeRoom: room("Security Turnstile"),
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
    // Security Turnstile's Oomph 5 line would pay Red, but nothing resolves yet.
    expect(mid.activeRoom).not.toBeNull();
    expect(mid.Red.hand).toHaveLength(0);
  });

  it("'declining is failing without trying' — spending nothing is legal", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { events } = must(state, { type: "END_PLAY" });
    expect(eventTypes(events)).toContain("ROOM_FLED");
  });
});

describe("Cleanup", () => {
  it("'Discard the entire play zone'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
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
      activeRoom: room("The Sentry Drone"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Pry Bar"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: pile("Coil Of Cable", 3) }),
    });
    // Three free Coil Of Cables meet the Sentry Drone's Scramble 8 line
    // (Ascend, and one of you gets Good Stuff), which asks who first.
    const g = ids(state, "Gray");
    const { state: next } = play(state, [
      ...g.map((id): Command => playFree("Gray", id as CardId)),
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Gray" },
    ]);
    expect(next.Red.hand.map((c) => c.name)).toEqual(["Pry Bar", "Shove"]);
  });

  it("Outcome: 'shuffle the room card back into the Floor deck' — the same turn it Flees", () => {
    const rest = room("Flooded Ventilation Shaft");
    const state = rig({
      seed: 4242,
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      floorDeck: [rest],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const fledRoom = state.activeRoom as Room;
    // Security Turnstile's Flee line, Both of you Exhaust 1, needs no choice
    // and pulls from a deck of 5, so it never touches the discard pile or the
    // RNG — the only shuffle left to check is the one at Cleanup.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    expect(eventTypes(events)).toContain("FLED_RESHUFFLED");
    const [expectedDeck, expectedSeed] = shuffle([rest, fledRoom], state.seed);
    expect(next.floorDeck).toEqual(expectedDeck);
    expect(next.seed).toBe(expectedSeed);
  });
});

describe("Room kinds: Room and Stairwell", () => {
  it("a Stairwell ends the floor when it is Cleared", () => {
    // The Sentry Drone wants Oomph 8: Charge In (Oomph 4, Cost 2) plus two
    // free Pry Bars (Oomph 3 each) gets there with two Shoves as the payment.
    const state = rig({
      phase: "Play",
      activeRoom: room("The Sentry Drone"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const chargeIn = handCard(state, "Red", "Charge In");
    const pryBar = handCard(state, "Red", "Pry Bar");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn.id, payWith: shoves },
      free("Red", pryBar.id),
      free("Red", state.Red.hand.filter((c) => c.name === "Pry Bar")[1]?.id as CardId),
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).toContain("ROOM_CLEARED");
    expect(eventTypes(events)).toContain("FLOOR_CLEARED");
    expect(next.phase).toBe("Ascend");
  });

  it("aborts the run instead of Ascending when a reward pool holds fewer than 3", () => {
    // Same Stairwell clear as above, but Red's own reward pool is down to 2 —
    // too short for Ascending's "each of you is offered three cards" (rulebook).
    const state = rig({
      phase: "Play",
      activeRoom: room("The Sentry Drone"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
      pools: { Red: pile("Grav Harness", 2), Gray: pile("Grav Harness", 3), goodStuff: [], badStuff: [] },
    });
    const h = ids(state, "Red");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: h[0] as CardId, payWith: [h[1] as CardId, h[2] as CardId] },
      playFree("Red", h[3] as CardId),
      playFree("Red", h[4] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Aborted");
    const aborted = events.find((e) => e.type === "RUN_ABORTED");
    if (aborted?.type !== "RUN_ABORTED") throw new Error("expected a RUN_ABORTED event");
    expect(aborted.reason).toBe("Red's reward pool holds 2 cards; Ascending reveals 3.");
  });

  it("'if more than one threshold within a challenge is met, only the lowest-printed one resolves'", () => {
    // A hand-built room: one challenge, two thresholds. Two free Coil Of
    // Cables (Scramble 3 each) meet both the Scramble 2 line (Exhaust 1 each)
    // and the Scramble 5 line (reveal a reward) at once. Only the
    // lowest-printed of the two — Scramble 5 — resolves.
    const thresholds: Threshold[] = [
      {
        requires: { oomph: 0, scramble: 2 },
        outcome: "Both of you Exhaust 1.",
        clears: false,
        fleeFree: false,
        ascends: false,
        effects: [{ type: "ExhaustFromDeck", who: "both", amount: 1 }],
      },
      {
        requires: { oomph: 0, scramble: 5 },
        outcome: "One of you reveals a card reward.",
        clears: true,
        fleeFree: false,
        ascends: false,
        effects: [{ type: "RevealReward", who: "one" }],
      },
    ];
    const state = rig({
      phase: "Play",
      activeRoom: fixtureRoom([{ thresholds }]),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Coil Of Cable"), card("Coil Of Cable")],
      }),
    });
    const g = ids(state, "Gray");
    const { state: next, events } = play(state, [
      playFree("Gray", g[0] as CardId),
      playFree("Gray", g[1] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(1);
    expect(next.cleared).toHaveLength(1);
    // No Exhaust: the Scramble 2 line's outcome does not resolve alongside it.
    expect(next.Red.exhaust).toHaveLength(0);
    expect(next.Gray.exhaust).toHaveLength(0);
    expect(next.pending?.kind).toBe("ChooseCharacter");
  });

  it("a met line that Clears beats one that says to Flee for free", () => {
    // A hand-built room: two challenges. One's threshold Ascends; the
    // other's says "Flee this room for free." Each Turn, Outcome: any met
    // challenge Clears the room, so a fleeFree line elsewhere cannot un-Clear it.
    const ascendChallenge: Challenge = {
      thresholds: [
        {
          requires: { oomph: 9, scramble: 0 },
          outcome: "Ascend.",
          clears: true,
          fleeFree: false,
          ascends: true,
          effects: [],
        },
      ],
    };
    const fleeFreeChallenge: Challenge = {
      thresholds: [
        {
          requires: { oomph: 0, scramble: 9 },
          outcome: "Flee this room for free.",
          clears: false,
          fleeFree: true,
          ascends: false,
          effects: [],
        },
      ],
    };
    const state = rig({
      phase: "Play",
      activeRoom: fixtureRoom([ascendChallenge, fleeFreeChallenge]),
      Red: player({ deck: pile("Shove", 5), hand: pile("Pry Bar", 3) }),
      Gray: player({ deck: pile("Duck Under", 5), hand: pile("Coil Of Cable", 3) }),
    });
    const r = ids(state, "Red");
    const g = ids(state, "Gray");
    const { state: next } = play(state, [
      // Three free Pry Bars is Oomph 9, three free Coils is Scramble 9, so both
      // challenges are met at once.
      ...r.map((id) => playFree("Red", id as CardId)),
      ...g.map((id) => playFree("Gray", id as CardId)),
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
  });

  it("'one of you reveals a card reward' asks who, then offers it — taken or skipped", () => {
    // Bio-Hazard Containment Vault's Oomph-15 challenge is its own "one of
    // you reveals a card reward": two Charge Ins (Oomph 4 each) plus three
    // free Pry Bars (Oomph 3 each) clears it.
    const state = rig({
      phase: "Play",
      activeRoom: room("Bio-Hazard Containment Vault"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [
          card("Charge In"),
          card("Charge In"),
          card("Pry Bar"),
          card("Pry Bar"),
          card("Pry Bar"),
          ...pile("Shove", 4),
        ],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const grayPool = state.pools.Gray;
    const r = ids(state, "Red");
    const { state: afterPlay } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[0] as CardId,
        payWith: [r[5] as CardId, r[6] as CardId],
      },
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[1] as CardId,
        payWith: [r[7] as CardId, r[8] as CardId],
      },
      playFree("Red", r[2] as CardId),
      playFree("Red", r[3] as CardId),
      playFree("Red", r[4] as CardId),
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

  it("each challenge on a card resolves on its own, and meeting both fires both — Pressurized Maintenance Hub", () => {
    // Pressurized Maintenance Hub's Oomph and Scramble challenges are
    // independent, each its own named reveal: Oomph 7 (Charge In, cost 2,
    // plus a free Pry Bar) pays Red; Scramble 7 (Pick The Lock, cost 2, plus
    // a free Coil Of Cable) pays Gray.
    const state = rig({
      phase: "Play",
      activeRoom: room("Pressurized Maintenance Hub"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [
          card("Pick The Lock"),
          card("Duck Under"),
          card("Duck Under"),
          card("Coil Of Cable"),
        ],
      }),
    });
    const redPool = state.pools.Red;
    const grayPool = state.pools.Gray;
    const r = ids(state, "Red");
    const g = ids(state, "Gray");
    const { state: afterPlay, events } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[0] as CardId,
        payWith: [r[1] as CardId, r[2] as CardId],
      },
      playFree("Red", r[3] as CardId),
      {
        type: "PLAY_CARD",
        character: "Gray",
        cardId: g[0] as CardId,
        payWith: [g[1] as CardId, g[2] as CardId],
      },
      playFree("Gray", g[3] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(2);
    // Each challenge names its own character directly, so no ChooseCharacter
    // is asked — Red's reveal comes first, in printed order.
    expect(afterPlay.pending?.kind).toBe("TakeReward");
    expect(
      afterPlay.pending && "character" in afterPlay.pending ? afterPlay.pending.character : null,
    ).toBe("Red");

    const { state: afterRed } = must(afterPlay, { type: "TAKE_REWARD", take: true });
    expect(afterRed.pending?.kind).toBe("TakeReward");
    expect(
      afterRed.pending && "character" in afterRed.pending ? afterRed.pending.character : null,
    ).toBe("Gray");

    const { state: next } = must(afterRed, { type: "TAKE_REWARD", take: true });
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.deck[0]?.name).toBe(redPool[0]?.name);
    expect(next.Gray.deck[0]?.name).toBe(grayPool[0]?.name);
  });

  it("a dual threshold is met only when the pool meets both stats", () => {
    // Flooded Ventilation Shaft's second line needs Oomph 3 and Scramble 3
    // together. Scramble alone, even well past 3, does not meet it.
    const state = rig({
      phase: "Play",
      activeRoom: room("Flooded Ventilation Shaft"),
      Red: player({ deck: pile("Shove", 5), hand: [...pile("Coil Of Cable", 2), card("Pry Bar")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const r = ids(state, "Red");
    const dualLine = state.activeRoom?.challenges[1]?.thresholds[0];
    if (!dualLine) throw new Error("rig");
    const { state: scrambleOnly } = play(state, [
      playFree("Red", r[0] as CardId),
      playFree("Red", r[1] as CardId),
    ]);
    expect(statPool(scrambleOnly)).toEqual({ oomph: 0, scramble: 6 });
    expect(thresholdIsMet(scrambleOnly, dualLine)).toBe(false);

    const { state: both } = play(scrambleOnly, [playFree("Red", r[2] as CardId)]);
    expect(statPool(both)).toEqual({ oomph: 3, scramble: 6 });
    expect(thresholdIsMet(both, dualLine)).toBe(true);
  });

  it("a room that meets no threshold Flees, empty-handed — no Stuff either way", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(eventTypes(events)).toContain("ROOM_FLED");
    expect(eventTypes(events)).not.toContain("ROOM_CLEARED");
    expect(next.cleared).toEqual([]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    // Security Turnstile's Flee line, Both of you Exhaust 1, is the one
    // punishment — no Stuff changes hands either way.
    expect(next.Red.deck).toHaveLength(4);
    // Same turn: it is already back in the Floor deck by the time Cleanup ends.
    expect(next.floorDeck).toHaveLength(1);
  });

  it("a Room's Challenge reads the shared pool, not just the named character's own cards", () => {
    // Security Turnstile's Oomph 5 line pays Red — met by Charge In's own 4
    // plus a Pry Bar Gray played, proving the pool is shared rather than read
    // from Red's own cards alone.
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Charge In"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Pry Bar")] }),
    });
    const r = ids(state, "Red");
    const g = ids(state, "Gray");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId, r[2] as CardId] },
      playFree("Gray", g[0] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.some((c) => c.kind === "good_stuff")).toBe(true);
  });

  it("a met threshold against an empty Good Stuff pool pays nothing and says so", () => {
    // Security Turnstile's Oomph 5 line owes Red a Good Stuff, but the pool is dry.
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const empty = { ...state, pools: { ...state.pools, goodStuff: [] } };
    const r = ids(empty, "Red");
    const { state: next, events } = play(empty, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[0] as CardId,
        payWith: [r[1] as CardId, r[2] as CardId],
      },
      playFree("Red", r[3] as CardId),
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
    // Overgrown Hydroponics Bay's Scramble 6 line owes both of you Bad Stuff,
    // but the pool is dry.
    const state = rig({
      phase: "Play",
      activeRoom: room("Overgrown Hydroponics Bay"),
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

  it("DealBadStuff honors a printed count — Bio-Hazard Containment Vault's Flee deals 2 each", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Bio-Hazard Containment Vault"),
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(eventTypes(events)).toContain("ROOM_FLED");
    expect(next.Red.hand.filter((c) => c.kind === "bad_stuff")).toHaveLength(2);
    expect(next.Gray.hand.filter((c) => c.kind === "bad_stuff")).toHaveLength(2);
  });

  describe("'one of you may Scrap a Bad Stuff card from your hand' — Automated Defense Turret", () => {
    const meetsScrapLine = () =>
      rig({
        phase: "Play",
        activeRoom: room("Automated Defense Turret"),
        Red: player({
          deck: pile("Shove", 4),
          hand: [card("Charge In"), card("Charge In"), card("Pry Bar"), ...pile("Shove", 4)],
        }),
        // Rust, not Panic: a held Panic would itself raise the very
        // threshold this rig means to meet.
        Gray: player({ deck: pile("Duck Under", 5), hand: [card("Rust")] }),
      });

    const toScrapChoice = () => {
      const state = meetsScrapLine();
      const r = ids(state, "Red");
      const { state: afterPlay, events } = play(state, [
        {
          type: "PLAY_CARD",
          character: "Red",
          cardId: r[0] as CardId,
          payWith: [r[3] as CardId, r[4] as CardId],
        },
        {
          type: "PLAY_CARD",
          character: "Red",
          cardId: r[1] as CardId,
          payWith: [r[5] as CardId, r[6] as CardId],
        },
        playFree("Red", r[2] as CardId),
        { type: "END_PLAY" },
      ]);
      expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(1);
      expect(afterPlay.pending?.kind).toBe("ChooseCharacter");
      const { state: afterChoice } = must(afterPlay, {
        type: "CHOOSE_CHARACTER",
        character: "Gray",
      });
      expect(afterChoice.pending?.kind).toBe("ChooseCards");
      return afterChoice;
    };

    it("may Scrap the offered Bad Stuff card", () => {
      const state = toScrapChoice();
      const pending = state.pending;
      if (pending?.kind !== "ChooseCards") throw new Error("rig");
      const rust = pending.options[0];
      if (!rust) throw new Error("rig");
      const { state: next, events } = must(state, { type: "CHOOSE_CARDS", cardIds: [rust.id] });
      expect(eventTypes(events)).toContain("CARD_SCRAPPED");
      expect(next.Gray.hand.some((c) => c.name === "Rust")).toBe(false);
      expect(next.scrapyard.some((c) => c.name === "Rust")).toBe(true);
    });

    it("or decline, keeping the card", () => {
      const state = toScrapChoice();
      const { state: next, events } = must(state, { type: "CHOOSE_CARDS", cardIds: [] });
      expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
      expect(next.Gray.hand.some((c) => c.name === "Rust")).toBe(true);
    });

    it("resolves as declined with no prompt when neither hand holds a Bad Stuff card", () => {
      const state = rig({
        phase: "Play",
        activeRoom: room("Automated Defense Turret"),
        Red: player({
          deck: pile("Shove", 4),
          hand: [card("Charge In"), card("Charge In"), card("Pry Bar"), ...pile("Shove", 4)],
        }),
        Gray: player({ deck: pile("Duck Under", 5) }),
      });
      const r = ids(state, "Red");
      const { state: next, events } = play(state, [
        {
          type: "PLAY_CARD",
          character: "Red",
          cardId: r[0] as CardId,
          payWith: [r[3] as CardId, r[4] as CardId],
        },
        {
          type: "PLAY_CARD",
          character: "Red",
          cardId: r[1] as CardId,
          payWith: [r[5] as CardId, r[6] as CardId],
        },
        playFree("Red", r[2] as CardId),
        { type: "END_PLAY" },
      ]);
      expect(events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(1);
      expect(eventTypes(events)).toContain("ROOM_CLEARED");
      expect(next.pending).toBeNull();
    });
  });
});

describe("SCRAP_FOR_STATS — Bio-Hazard Containment Vault's own text", () => {
  const rigged = (overrides: Partial<GameState> = {}) =>
    rig({
      phase: "Play",
      activeRoom: room("Bio-Hazard Containment Vault"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
      ...overrides,
    });

  it("is refused outside the Play phase", () => {
    const state = rigged({ phase: "Outcome" });
    const pryBar = state.Red.hand[0];
    if (!pryBar) throw new Error("rig");
    const rejected = execute(state, {
      type: "SCRAP_FOR_STATS",
      character: "Red",
      cardId: pryBar.id,
      stat: "Oomph",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("WrongPhase");
  });

  it("is refused while a different room is active", () => {
    const state = rigged({ activeRoom: room("Security Turnstile") });
    const pryBar = state.Red.hand[0];
    if (!pryBar) throw new Error("rig");
    const rejected = execute(state, {
      type: "SCRAP_FOR_STATS",
      character: "Red",
      cardId: pryBar.id,
      stat: "Oomph",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("RoomDoesNotAllow");
  });

  it("is refused for a card that is not Good Stuff", () => {
    const state = rigged();
    const shove = state.Red.hand.find((c) => c.name === "Shove");
    if (!shove) throw new Error("rig");
    const rejected = execute(state, {
      type: "SCRAP_FOR_STATS",
      character: "Red",
      cardId: shove.id,
      stat: "Oomph",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotGoodStuff");
  });

  it("is refused for a card not in that character's hand", () => {
    const state = rigged();
    const notHeld = card("Pry Bar");
    const rejected = execute(state, {
      type: "SCRAP_FOR_STATS",
      character: "Red",
      cardId: notHeld.id,
      stat: "Oomph",
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("NotInHand");
  });

  it("Scraps the card and adds +3 to the chosen stat", () => {
    const state = rigged();
    const pryBar = state.Red.hand.find((c) => c.name === "Pry Bar");
    if (!pryBar) throw new Error("rig");
    const { state: next, events } = must(state, {
      type: "SCRAP_FOR_STATS",
      character: "Red",
      cardId: pryBar.id,
      stat: "Oomph",
    });
    expect(next.Red.hand.some((c) => c.id === pryBar.id)).toBe(false);
    expect(next.scrapyard.some((c) => c.id === pryBar.id)).toBe(true);
    expect(statPool(next).oomph).toBe(3);
    expect(statPool(next).scramble).toBe(0);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED_FOR_STATS");
    expect(eventTypes(events)).not.toContain("CARD_PLAYED");
  });

  it("does not count as a played card for effects like Fast Follow / Tag Team", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Bio-Hazard Containment Vault"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Pry Bar")] }),
    });
    const fastFollow = state.Red.hand[0];
    const pryBar = state.Gray.hand[0];
    if (!fastFollow || !pryBar) throw new Error("rig");
    expect(costOf(state, "Red", fastFollow)).toBe(1);

    const { state: next } = must(state, {
      type: "SCRAP_FOR_STATS",
      character: "Gray",
      cardId: pryBar.id,
      stat: "Scramble",
    });
    // Fast Follow reads free only once Gray has *played* a card; Gray only Scrapped one.
    expect(costOf(next, "Red", fastFollow)).toBe(1);
  });
});
