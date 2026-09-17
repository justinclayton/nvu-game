/* The eight walkthroughs from the rules-core prototype, as fixtures.
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
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { AscendChoice, CardId, Character, GameState } from "./types";

beforeEach(resetRig);

const hand = (state: GameState, c: Character): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const free = (c: Character, cardId: CardId) =>
  ({ type: "PLAY_CARD", character: c, cardId, payWith: [] }) as const;

const NOTHING: AscendChoice = { keepStuffId: null, scrapId: null, takeRewardId: null };

describe("walkthrough 1 — a full hand costs you a card", () => {
  it("puts the drawn card straight into the exhaust pile", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 6), hand: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(eventTypes(events)).toEqual([
      "ROOM_FLIPPED",
      "DRAW_BURNED",
      "CARD_EXHAUSTED",
      "CARD_DRAWN",
    ]);
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(5);
    expect(next.Red.exhaust).toHaveLength(1);
    expect(next.Gray.hand).toHaveLength(1);
  });
});

describe("walkthrough 2 — into last stand, and out the wrong way", () => {
  it("flees while Red is in last stand, which puts Red Down", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [card("Charge In")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const drawn = play(state, [
      { type: "DRAW", character: "Red" },
      { type: "DRAW", character: "Gray" },
      { type: "DRAW", character: "Gray" },
      { type: "END_DRAW" },
    ]);
    // The draw that emptied Red's deck put them in last stand right away.
    expect(drawn.state.Red.lastStand).toBe(true);

    const grayHand = hand(drawn.state, "Gray");
    const played = play(drawn.state, [
      // In last stand, Red's Charge In costs nothing.
      free("Red", hand(drawn.state, "Red")[0] as CardId),
      { type: "PLAY_CARD", character: "Gray", cardId: grayHand[0] as CardId, payWith: [grayHand[1] as CardId] },
    ]);
    // Oomph 4 against the Cherry's Oomph 5. Gray's Scramble does nothing here.
    expect(statPool(played.state)).toEqual({ oomph: 4, scramble: 2 });

    const ended = play(played.state, [{ type: "END_PLAY" }]);
    expect(eventTypes(ended.events)).toContain("ROOM_FLED");
    expect(eventTypes(ended.events)).toContain("WENT_DOWN");
    expect(ended.state.Red.down).toBe(true);
    expect(ended.state.Red.hand).toEqual([]);
  });
});

describe("walkthrough 3 — the escape that actually works", () => {
  it("shuffles the play zone back in and charges 2 off the top", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      floorDeck: [room("Gross Thing That Looks Like A Cherry")],
      Red: player({ deck: [], hand: pile("Shove", 4), lastStand: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const drawn = play(state, [{ type: "DRAW", character: "Gray" }, { type: "END_DRAW" }]);
    const redHand = hand(drawn.state, "Red");
    const { state: next, events } = play(drawn.state, [
      free("Red", redHand[0] as CardId),
      free("Red", redHand[1] as CardId),
      free("Red", redHand[2] as CardId),
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events)).toContain("LAST_STAND_ESCAPED");
    expect(next.Red.deck).toHaveLength(1);
    expect(next.Red.lastStand).toBe(false);
    // The fourth Shove was never played, so it carries over along with the
    // Good Stuff Red's side earned by beating the Sorting Room's Oomph 2 —
    // the hand is never touched at Cleanup.
    expect(next.Red.hand.map((c) => c.name)).toEqual(["Shove", "Crowbar", "Grav Harness"]);
  });
});

describe("walkthrough 4 — spending Stuff spends it for good", () => {
  it("leaves a spent Pry Bar in the exhaust pile, then Scraps it at ascension", () => {
    const state = rig({
      phase: "Play",
      floor: 1,
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      roomSupply: [
        room("Coney, The Thing In The Stairwell"),
        room("Collapsed Stairwell"),
        room("Collapsed Stairwell"),
        room("Ruptured Coolant Line"),
        ...Array.from({ length: 8 }, () => room("Sorting Room")),
      ],
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Charge In"), card("Pry Bar"), card("Shove"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const h = hand(state, "Red");
    // Charge In (Oomph 4, Cost 2) paid for with a Pry Bar and a Shove. The Pry
    // Bar lands in the exhaust pile looking recoverable — and is not.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: h[0] as CardId, payWith: [h[1] as CardId, h[2] as CardId] },
    ]);
    expect(played.state.Red.exhaust.map((c) => c.name)).toContain("Pry Bar");

    const cleared = play(played.state, [
      free("Red", h[3] as CardId),
      { type: "END_PLAY" },
    ]);
    // Oomph 4 + 3 beats the Cherry's Oomph 5, so the floor is cleared.
    expect(cleared.state.phase).toBe("Ascend");

    const ascended = play(cleared.state, [{ type: "ASCEND", Red: NOTHING, Gray: NOTHING }]);
    // Both Pry Bars — the one spent as fuel and the one played — are gone for
    // the run. Neither shuffles back with the rest of the exhaust pile.
    expect(ascended.state.scrapyard.map((c) => c.name)).toEqual(["Pry Bar", "Pry Bar"]);
    expect(ascended.state.Red.deck.some((c) => c.name === "Pry Bar")).toBe(false);
  });
});

describe("walkthrough 5 — nothing resolves until play is declared over", () => {
  it("checks the room once, and resolves every line the pool met", () => {
    // Collapsed Stairwell: Scramble 2 clears and costs both a card; Scramble 5
    // clears too. Passing the low line does nothing until play ends, and when
    // it does, both lines resolve — §5 says every challenge you met.
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({
        deck: pile("Duck Under", 5),
        hand: [card("Pick The Lock"), card("Coil Of Cable"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const g = hand(state, "Gray");
    const low = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: g[0] as CardId, payWith: [g[2] as CardId, g[3] as CardId] },
    ]);
    // Scramble 4: past the low tier, and the room is still in the zone.
    expect(statPool(low.state).scramble).toBe(4);
    expect(low.state.activeRoom).not.toBeNull();

    const high = play(low.state, [free("Gray", g[1] as CardId), { type: "END_PLAY" }]);
    expect(eventTypes(high.events)).toContain("ROOM_CLEARED");
    expect(high.state.cleared).toHaveLength(1);
    // Both lines were met, so both were announced — and the lower one's "both of
    // you Exhaust 1" is still owed, because the higher tier adds to it rather
    // than replacing it.
    expect(high.events.filter((e) => e.type === "THRESHOLD_MET")).toHaveLength(2);
    expect(high.state.Red.exhaust).toHaveLength(1);
    expect(high.state.Red.deck).toHaveLength(4);
  });
});

describe("walkthrough 6 — a Stuff room reads each character's own side", () => {
  it("pays nobody when the shared pool looks right but the sides do not", () => {
    // Sorting Room asks Red for Oomph and Gray for Scramble. Red brings
    // Scramble and Gray brings Oomph, so the shared pool has both and neither
    // side has what its own line wants.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Coil Of Cable")] }),
      Gray: player({ deck: pile("Duck Under", 5), hand: [card("Pry Bar")] }),
    });
    const played = play(state, [
      free("Red", hand(state, "Red")[0] as CardId),
      free("Gray", hand(state, "Gray")[0] as CardId),
    ]);
    expect(statPool(played.state)).toEqual({ oomph: 3, scramble: 3 });

    const { state: next, events } = play(played.state, [{ type: "END_PLAY" }]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.hand).toEqual([]);
    expect(next.Gray.hand).toEqual([]);
  });
});

describe("walkthrough 7 — Down, and everything landing on the survivor", () => {
  it("puts the whole Flee line on the one who is left", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      floorDeck: [room("Gross Thing That Looks Like A Cherry")],
      Red: player({ deck: [], hand: [], down: true }),
      Gray: player({ deck: pile("Duck Under", 3), hand: pile("Duck Under", 2) }),
    });
    const g = hand(state, "Gray");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: g[0] as CardId, payWith: [g[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    // "Both of you Exhaust 1, and one of you gets Bad Stuff." Red takes nothing.
    expect(next.Red.exhaust).toEqual([]);
    expect(next.Gray.deck).toHaveLength(2);
    expect(next.Gray.hand.map((c) => c.kind)).toEqual(["bad_stuff"]);
    // Nobody was asked who: there was nobody to choose between.
    expect(eventTypes(events)).not.toContain("REWARD_REVEALED");
    expect(next.pending).toBeNull();
  });
});

describe("walkthrough 8 — ascending: full heal, Scrap tax, reward", () => {
  it("heals both characters, Scraps the Stuff, and takes one card", () => {
    const state = rig({
      phase: "Ascend",
      floor: 1,
      cleared: [room("Gross Thing That Looks Like A Cherry")],
      roomSupply: [
        room("Coney, The Thing In The Stairwell"),
        room("Collapsed Stairwell"),
        room("Collapsed Stairwell"),
        room("Ruptured Coolant Line"),
        ...Array.from({ length: 8 }, () => room("Sorting Room")),
      ],
      Red: player({
        deck: pile("Shove", 2),
        exhaust: [...pile("Shove", 4), card("Pry Bar"), card("Coil Of Cable")],
      }),
      Gray: player({ deck: pile("Duck Under", 3), exhaust: pile("Duck Under", 5), down: true }),
    });
    const withOffer = {
      ...state,
      offer: { Red: state.pools.Red.slice(0, 3), Gray: state.pools.Gray.slice(0, 3) },
    };
    const keep = withOffer.Red.exhaust.find((c) => c.name === "Pry Bar");
    const payer = withOffer.Red.exhaust.find((c) => c.name === "Shove");
    const reward = withOffer.offer.Red[0];
    if (!keep || !payer || !reward) throw new Error("rig");

    const { state: next } = must(withOffer, {
      type: "ASCEND",
      Red: { keepStuffId: keep.id, scrapId: payer.id, takeRewardId: reward.id },
      Gray: NOTHING,
    });

    // Red: 2 in deck + 3 remaining Shoves + the kept Pry Bar + the reward = 7.
    expect(next.Red.deck).toHaveLength(7);
    expect(next.Red.deck.some((c) => c.id === keep.id)).toBe(true);
    expect(next.Red.deck.some((c) => c.id === reward.id)).toBe(true);
    // The Coil Of Cable was not kept, so it is gone for the run; so is the payer.
    expect(next.scrapyard.map((c) => c.name).sort()).toEqual(["Coil Of Cable", "Shove"]);
    // Gray was Down and is now at full health.
    expect(next.Gray.down).toBe(false);
    expect(next.Gray.deck).toHaveLength(8);
    expect(next.floor).toBe(2);
  });
});
