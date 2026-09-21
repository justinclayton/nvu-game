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

const NOTHING: AscendChoice = { settle: [], takeRewardId: null };

describe("walkthrough 1 — the deck runs dry mid-draw, and the discard pile catches it", () => {
  it("reshuffles the discard pile in to finish the fill to 5", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [card("Shove")], hand: [], discard: pile("Charge In", 6) }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(eventTypes(events).slice(0, 3)).toEqual(["ROOM_FLIPPED", "CARD_DRAWN", "DECK_RESHUFFLED"]);
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.discard).toEqual([]);
    // 1 off the original deck, 6 reshuffled in, 4 more drawn to reach 5.
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("walkthrough 2 — going Down ends the run at once, not at a turn boundary", () => {
  it("stops the game inside the same command that emptied the last pile", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [], hand: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: pile("Duck Under", 2) }),
    });
    // Nobody plays anything, so the Cherry's Oomph 5 is not met and the room
    // Flees. Red's deck and discard are both empty, so Red goes Down from the
    // Flee line's punishment and the run ends there — the GameOver shows up
    // in the very same END_PLAY, no Flip required.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    const downIndex = eventTypes(events).indexOf("WENT_DOWN");
    const overIndex = eventTypes(events).indexOf("GAME_OVER");
    expect(downIndex).toBeGreaterThan(-1);
    expect(overIndex).toBeGreaterThan(downIndex);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
  });
});

describe("walkthrough 3 — a Down character takes no further punishment, in the same command", () => {
  it("narrows 'one of you' to the survivor once the other goes Down earlier in the same resolution", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      Red: player({ deck: [], hand: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // "Both of you Exhaust 1, and one of you gets Bad Stuff." Red's deck and
    // discard are both empty, so the "both" Exhaust sends Red Down first, in
    // this same resolution — and by the time "one of you gets Bad Stuff" is
    // reached, there is nobody left to choose between: it falls on Gray with
    // no prompt, even though nothing had rejected the choice's existence.
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.Red.exhaust).toEqual([]);
    expect(next.Gray.exhaust).toHaveLength(1);
    expect(next.Gray.hand.map((c) => c.kind)).toEqual(["bad_stuff"]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).not.toContain("REWARD_REVEALED");
  });
});

describe("walkthrough 4 — spent Stuff is not lost, unless you pay to keep it", () => {
  it("recycles a spent Pry Bar into the Good Stuff pool by default", () => {
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
    // Bar looks gone, sitting in the discard pile — but 0.2 has no Scrapyard
    // trip for it unless something pays to send it there.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: h[0] as CardId, payWith: [h[1] as CardId, h[2] as CardId] },
    ]);
    expect(played.state.Red.discard.map((c) => c.name)).toContain("Pry Bar");

    const cleared = play(played.state, [free("Red", h[3] as CardId), { type: "END_PLAY" }]);
    // Oomph 4 + 3 beats the Cherry's Oomph 5, so the floor is cleared.
    expect(cleared.state.phase).toBe("Ascend");

    const before = state.pools.goodStuff.filter((c) => c.name === "Pry Bar").length;
    const ascended = play(cleared.state, [{ type: "ASCEND", Red: NOTHING, Gray: NOTHING }]);
    // Neither Pry Bar is Scrapped: Settle your Stuff's free default for Good
    // Stuff is the pool, not the Scrapyard, so both go there instead.
    expect(ascended.state.scrapyard.map((c) => c.name)).not.toContain("Pry Bar");
    expect(ascended.state.pools.goodStuff.filter((c) => c.name === "Pry Bar")).toHaveLength(before + 2);
    expect(ascended.state.Red.deck.some((c) => c.name === "Pry Bar")).toBe(false);
  });
});

describe("walkthrough 5 — nothing resolves until play is declared over", () => {
  it("checks the room once, and resolves every line the pool met", () => {
    // Collapsed Stairwell: Scramble 2 clears and costs both a card; Scramble 5
    // clears too. Passing the low line does nothing until play ends, and when
    // it does, both lines resolve — Each Turn, Outcome says every challenge you met.
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

describe("walkthrough 6 — a Room's Challenge reads the shared pool, not either character's side", () => {
  it("pays both lines even with the stats swapped between characters", () => {
    // Sorting Room asks for Oomph (pays Red) and Scramble (pays Gray). Red
    // brings Scramble and Gray brings Oomph — the shared pool has both, so
    // both lines are met and both characters are paid.
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
    expect(eventTypes(events)).toContain("STUFF_TAKEN");
    expect(eventTypes(events)).toContain("ROOM_CLEARED");
    expect(eventTypes(events)).not.toContain("ROOM_FLED");
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.hand.every((c) => c.kind === "good_stuff")).toBe(true);
    expect(next.Gray.hand.every((c) => c.kind === "good_stuff")).toBe(true);
  });
});

describe("walkthrough 7 — a card's own Exhaust ends the run mid-Play, before END_PLAY ever runs", () => {
  it("goes Down, and GameOver, from a single free PLAY_CARD — the room is never checked", () => {
    // Overdrive: "Exhaust 2", cost 0 — no payment to refill the discard pile
    // out from under it. Red's deck and discard are both empty, so playing it
    // sends Red Down immediately, inside this one PLAY_CARD — the room in the
    // play zone is never reached, because Outcome only runs at END_PLAY and
    // the run is already over.
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      Red: player({ deck: [], hand: [card("Overdrive")], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const overdrive = state.Red.hand[0];
    if (!overdrive) throw new Error("rig");
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: overdrive.id,
      payWith: [],
    });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(next.activeRoom).not.toBeNull(); // Outcome never ran.
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});

describe("walkthrough 8 — ascending: Settle your Stuff, no heal, then the reward", () => {
  it("keeps one piece of Stuff by paying, pools the rest, and takes one card", () => {
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
        discard: [...pile("Shove", 4), card("Pry Bar"), card("Coil Of Cable")],
      }),
      Gray: player({ deck: pile("Duck Under", 3), discard: pile("Duck Under", 5) }),
    });
    const withOffer = {
      ...state,
      offer: { Red: state.pools.Red.slice(0, 3), Gray: state.pools.Gray.slice(0, 3) },
    };
    const keep = withOffer.Red.discard.find((c) => c.name === "Pry Bar");
    const payer = withOffer.Red.discard.find((c) => c.name === "Shove");
    const reward = withOffer.offer.Red[0];
    if (!keep || !payer || !reward) throw new Error("rig");

    const { state: next } = must(withOffer, {
      type: "ASCEND",
      Red: { settle: [{ stuffId: keep.id, pay: payer.id }], takeRewardId: reward.id },
      Gray: NOTHING,
    });

    // There is no heal: the discard pile is not shuffled into the deck. The
    // kept Pry Bar returns to the discard pile, where it was found; the
    // reward goes to the top of the deck; the Coil Of Cable pools by
    // default; the payer is Scrapped.
    expect(next.Red.deck).toHaveLength(3); // 2 original + the reward
    expect(next.Red.deck.some((c) => c.id === reward.id)).toBe(true);
    expect(next.Red.discard.some((c) => c.id === keep.id)).toBe(true);
    expect(next.Red.discard.some((c) => c.name === "Coil Of Cable")).toBe(false);
    expect(next.pools.goodStuff.some((c) => c.name === "Coil Of Cable")).toBe(true);
    expect(next.scrapyard.map((c) => c.id)).toContain(payer.id);
    expect(next.floor).toBe(2);
  });
});
