/* The eight walkthroughs of the hardest rules, as fixtures.
 *
 * Each one is a rigged state and the events it must produce. These are the
 * regression suite for the rules that are hard to reason about on paper —
 * the ones a change is most likely to break quietly.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { statPool } from "./queries";
import {
  card,
  eventTypes,
  free,
  goingDown,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { AscendChoice, CardId, GameState } from "./types";

beforeEach(resetRig);

const hand = (state: GameState, c: "Red" | "Gray"): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

describe("walkthrough 1 — the deck runs dry mid-draw and the discard pile becomes the new deck", () => {
  it("reshuffles once, then keeps drawing to 5", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: pile("Shove", 2), discard: pile("Charge In", 3) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toEqual([]);
    expect(next.Red.discard).toEqual([]);
    // Red: 2 off the original deck, the reshuffle, then 3 more. Gray: a plain 5.
    expect(eventTypes(events)).toEqual([
      "ROOM_FLIPPED",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "DISCARD_RESHUFFLED",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
      "CARD_DRAWN",
    ]);
  });
});

describe("walkthrough 2 — Down when the deck and discard are both empty ends the run on the spot", () => {
  it("stops a room's own punishment from finishing, and everything after it", () => {
    const state = goingDown([card("Shove")]);
    // Smoldering Armory's Flee line: "Red Exhausts 5." Nobody played
    // anything, so no threshold is met and the room Flees.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    // Going Down still empties the hand into the discard pile.
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.discard.map((c) => c.name)).toEqual(["Shove"]);
    const types = eventTypes(events);
    expect(types).toContain("WENT_DOWN");
    expect(types).toContain("GAME_OVER");
    expect(types.indexOf("WENT_DOWN")).toBeLessThan(types.indexOf("GAME_OVER"));
    // Cleanup, the turn ending, and everything after never ran.
    expect(types).not.toContain("CLEANUP_BEGAN");
    expect(types).not.toContain("TURN_ENDED");
  });
});

describe("walkthrough 3 — Exhaust is permanent; only the discard pile recycles", () => {
  it("a reshuffle draws from the discard pile, and never from the Exhaust pile", () => {
    const exhausted = pile("Charge In", 2);
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: pile("Shove", 5), exhaust: exhausted }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    // The Exhaust pile is untouched, and none of it ever reached the hand.
    expect(next.Red.exhaust.map((c) => c.id)).toEqual(exhausted.map((c) => c.id));
    expect(next.Red.hand.every((c) => exhausted.every((e) => e.id !== c.id))).toBe(true);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });
});

describe("walkthrough 4 — Stuff stays in the deck across an Ascend, until Scrapped or Exhausted", () => {
  it("Good Stuff and Bad Stuff found anywhere in a character's cards ride through unchanged", () => {
    const inDeck = card("Pry Bar");
    const inDiscard = card("Coil Of Cable");
    const inHand = card("Sluggish");
    const state = rig({
      phase: "Ascend",
      floor: 1,
      roomSupply: [
        room("The Sentry Drone"),
        room("Flooded Ventilation Shaft"),
        room("Flooded Ventilation Shaft"),
        room("Overgrown Hydroponics Bay"),
        ...Array.from({ length: 8 }, () => room("Security Turnstile")),
      ],
      cleared: [room("The Sentry Drone")],
      Red: player({
        deck: [inDeck, ...pile("Shove", 2)],
        hand: [inHand],
        discard: [inDiscard, ...pile("Charge In", 2)],
      }),
      Gray: player({ deck: pile("Duck Under", 2) }),
    });
    const beforeGood = state.pools.goodStuff.length;
    const beforeBad = state.pools.badStuff.length;
    const NOTHING: AscendChoice = { takeRewardId: null };
    const { state: next, events } = must(state, { type: "ASCEND", Red: NOTHING, Gray: NOTHING });

    expect(next.Red.deck.some((c) => c.id === inDeck.id)).toBe(true);
    expect(next.Red.discard.some((c) => c.id === inDiscard.id)).toBe(true);
    // The hand shuffles into the deck first, so Stuff that started there is
    // in the deck now too, exactly like the rest of the hand.
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.deck.some((c) => c.id === inHand.id)).toBe(true);
    expect(next.pools.goodStuff).toHaveLength(beforeGood);
    expect(next.pools.badStuff).toHaveLength(beforeBad);
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
  });
});

describe("walkthrough 5 — Cleanup runs before Ascending", () => {
  it("discards the play zone, then clears the floor and offers the reward", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("The Sentry Drone"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const h = hand(state, "Red");
    const [chargeIn, payA, payB, pryBar, pryBar2] = h;
    if (!chargeIn || !payA || !payB || !pryBar || !pryBar2) throw new Error("rig");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn, payWith: [payA, payB] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar, payWith: [] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar2, payWith: [] },
      { type: "END_PLAY" },
    ]);
    const types = eventTypes(events);
    expect(types.indexOf("CLEANUP_BEGAN")).toBeLessThan(types.indexOf("FLOOR_CLEARED"));
    // The play zone's three cards were discarded during that cleanup.
    const playZoneDiscards = events.filter(
      (e) => e.type === "CARD_DISCARDED" && e.from === "playZone",
    );
    expect(playZoneDiscards).toHaveLength(3);
    expect(next.playZone).toEqual([]);
    expect(next.phase).toBe("Ascend");
    expect(next.offer?.Red).toHaveLength(3);
  });
});

describe("walkthrough 6 — a Room's Challenge reads the shared pool, not either character's side", () => {
  it("pays both lines even with the stats swapped between characters", () => {
    // Pressurized Maintenance Hub asks for Oomph (pays Red) and Scramble
    // (pays Gray) in two independent challenges. Red brings Scramble and
    // Gray brings Oomph — the shared pool has both, so both lines are met
    // and both characters are paid, regardless of whose cards supplied it.
    const state = rig({
      phase: "Play",
      activeRoom: room("Pressurized Maintenance Hub"),
      Red: player({ deck: pile("Shove", 5), hand: pile("Coil Of Cable", 3) }),
      Gray: player({ deck: pile("Duck Under", 5), hand: pile("Pry Bar", 3) }),
    });
    const r = hand(state, "Red");
    const g = hand(state, "Gray");
    const played = play(state, [
      ...r.map((id): ReturnType<typeof free> => free("Red", id as CardId)),
      ...g.map((id): ReturnType<typeof free> => free("Gray", id as CardId)),
    ]);
    expect(statPool(played.state)).toEqual({ oomph: 9, scramble: 9 });

    const { state: cleared, events } = play(played.state, [{ type: "END_PLAY" }]);
    expect(eventTypes(events).filter((t) => t === "THRESHOLD_MET")).toHaveLength(2);
    expect(eventTypes(events)).toContain("ROOM_CLEARED");
    expect(eventTypes(events)).not.toContain("ROOM_FLED");
    expect(cleared.cleared).toHaveLength(1);
    // Oomph pays Red even though Gray's cards supplied it; Scramble pays Gray
    // even though Red's cards supplied it.
    expect(cleared.pending?.kind).toBe("TakeReward");
    expect(
      cleared.pending && "character" in cleared.pending ? cleared.pending.character : null,
    ).toBe("Red");
    const { state: afterRed } = must(cleared, { type: "TAKE_REWARD", take: true });
    expect(afterRed.pending?.kind).toBe("TakeReward");
    expect(
      afterRed.pending && "character" in afterRed.pending ? afterRed.pending.character : null,
    ).toBe("Gray");
    const { state: next } = must(afterRed, { type: "TAKE_REWARD", take: true });
    expect(next.Red.deck[0]?.owner).toBe("Red");
    expect(next.Gray.deck[0]?.owner).toBe("Gray");
  });
});

describe("walkthrough 7 — one Down ends the run immediately, mid multi-effect resolution", () => {
  it("stops a Flee line's own later effect from ever running", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Overgrown Hydroponics Bay"),
      Red: player({ deck: [], discard: [], hand: [] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [] }),
    });
    // "Both players Exhaust 1, and one of you gets Bad Stuff." Nobody played
    // anything, so the room Flees; Red's own Exhaust is first in the queue,
    // and Red has nothing left to lose it from.
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.phase).toBe("GameOver");
    expect(next.Red.down).toBe(true);
    // Gray's own Exhaust 1, and the Bad Stuff besides, never ran.
    expect(next.Gray.deck).toHaveLength(4);
    expect(next.Gray.hand).toEqual([]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });
});

describe("walkthrough 8 — ascending end to end: shuffle the hand in, then the reward, no heal", () => {
  it("clears the floor, takes a reward, and starts the next floor with the old discard pile intact", () => {
    const state = rig({
      phase: "Play",
      floor: 1,
      activeRoom: room("The Sentry Drone"),
      roomSupply: [
        room("The Sentry Drone"),
        room("Flooded Ventilation Shaft"),
        room("Flooded Ventilation Shaft"),
        room("Overgrown Hydroponics Bay"),
        ...Array.from({ length: 8 }, () => room("Security Turnstile")),
      ],
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
        discard: pile("Charge In", 3),
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const h = hand(state, "Red");
    const [chargeIn, payA, payB, pryBar, pryBar2] = h;
    if (!chargeIn || !payA || !payB || !pryBar || !pryBar2) throw new Error("rig");
    const cleared = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn, payWith: [payA, payB] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar, payWith: [] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar2, payWith: [] },
      { type: "END_PLAY" },
    ]);
    expect(cleared.state.phase).toBe("Ascend");

    const offer = cleared.state.offer?.Red[0];
    if (!offer) throw new Error("Red has no reward offered");
    const { state: next } = must(cleared.state, {
      type: "ASCEND",
      Red: { takeRewardId: offer.id },
      Gray: { takeRewardId: null },
    });

    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    // No heal: the 3 Charge Ins from before this floor are still there, plus
    // the 2 Shoves that paid for Charge In, the Charge In itself and the two
    // Pry Bars played alongside it — all discarded at Cleanup, and none of
    // it swept anywhere: Stuff stays until it is Scrapped or Exhausted.
    expect(next.Red.discard).toHaveLength(8);
    // The reward is shuffled into the deck.
    expect(next.Red.deck.some((c) => c.id === offer.id)).toBe(true);
  });
});
