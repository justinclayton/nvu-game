/* One test per entry in Red's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf, statPool } from "../queries";
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
} from "../__fixtures__/rig";
import type { CardId, Character, GameState } from "../types";

beforeEach(resetRig);

const ids = (state: GameState, c: Character): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const free = (c: Character, cardId: CardId) =>
  ({ type: "PLAY_CARD", character: c, cardId, payWith: [] }) as const;

const playing = (over: Partial<GameState> = {}) =>
  rig({
    phase: "Play",
    activeRoom: room("Gross Thing That Looks Like A Cherry"),
    Red: player({ deck: pile("Shove", 6) }),
    Gray: player({ deck: pile("Duck Under", 6) }),
    ...over,
  });

describe("Reckless Swing — 'Exhaust 1'", () => {
  it("takes one off the top of your own deck", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Reckless Swing"), card("Shove")] }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(next.Red.deck).toHaveLength(3);
    // One paid from hand, into the discard pile; one Exhausted off the top of
    // the deck, into the Exhaust pile — two different piles.
    expect(next.Red.discard).toHaveLength(1);
    expect(next.Red.exhaust).toHaveLength(1);
  });
});

describe("Reckless — 'Exhaust 3'", () => {
  it("takes three off the top", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 5), hand: [card("Reckless"), card("Shove")] }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("Fast Follow — 'If Gray played a card this turn, this costs 0'", () => {
  it("costs its printed 1 while Gray has played nothing", () => {
    const state = playing({ Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow")] }) });
    const fastFollow = state.Red.hand[0];
    if (!fastFollow) throw new Error("rig");
    expect(costOf(state, "Red", fastFollow)).toBe(1);
  });

  it("costs nothing once Gray has played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
    });
    const played = play(state, [free("Gray", ids(state, "Gray")[0] as CardId)]);
    const fastFollow = played.state.Red.hand[0];
    if (!fastFollow) throw new Error("rig");
    expect(costOf(played.state, "Red", fastFollow)).toBe(0);
  });
});

describe("Second Wind — 'Shuffle a Red card from your discard pile back into your deck'", () => {
  it("offers Red's own discarded cards, and nothing else", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Second Wind"), card("Shove"), card("Shove")],
        discard: [card("Charge In"), card("Pry Bar")],
      }),
    });
    const hand = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId, hand[2] as CardId],
    });
    const pending = asked.state.pending;
    expect(pending?.kind).toBe("ChooseCards");
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    // The Pry Bar is Stuff, not a Red card. The two Shoves that paid for this
    // are in the pile by now, and are Red cards, so they are offered too.
    const offered = pending.options.map((c) => c.name);
    expect(offered).toContain("Charge In");
    expect(offered).not.toContain("Pry Bar");

    const chosen = pending.options.find((c) => c.name === "Charge In");
    if (!chosen) throw new Error("rig");
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CARDS",
      cardIds: [chosen.id],
    });
    expect(next.Red.deck.some((c) => c.id === chosen.id)).toBe(true);
    expect(next.Red.discard.some((c) => c.id === chosen.id)).toBe(false);
    expect(eventTypes(events)).toContain("CARDS_SHUFFLED_IN");
  });
});

describe("Junk Launcher — 'Oomph +2 for each card you paid with this turn'", () => {
  it("counts the cards already spent, which are no longer anywhere else", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Junk Launcher"), card("Shove"), card("Shove")],
      }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId, hand[2] as CardId],
    });
    // Printed Oomph 2, plus 2 for each of the two cards it cost.
    expect(statPool(next).oomph).toBe(6);
  });
});

describe("Heavy Pockets — 'Shuffle 1 Stuff from your hand into your deck'", () => {
  it("moves the chosen Stuff out of hand and into the deck", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Heavy Pockets"), card("Shove"), card("Pry Bar")],
      }),
    });
    const hand = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Pry Bar"]);
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("rig");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Red.hand).toEqual([]);
  });
});

describe("Deadweight Grip — 'Cards you play have +1 Oomph, draw no more than 2'", () => {
  it("adds a Oomph to everything its holder plays", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Deadweight Grip"), card("Shove"), card("Shove")],
      }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[1] as CardId,
      payWith: [hand[2] as CardId],
    });
    // Shove is Oomph 2, and the Grip is still in hand.
    expect(statPool(next).oomph).toBe(3);
  });

  it("caps its holder's draw at 2, short of the usual fill to 5", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 6), hand: [card("Deadweight Grip")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.drewThisTurn).toBe(2);
    expect(next.Red.hand).toHaveLength(3);
  });
});

describe("Both Barrels — '+2 Oomph after Gray, and back to hand on a clear'", () => {
  it("is Oomph 4 alone and Oomph 6 once Gray has played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Both Barrels"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3), hand: [card("Coil Of Cable")] }),
    });
    const r = ids(state, "Red");
    const alone = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId, r[2] as CardId],
    });
    expect(statPool(alone.state).oomph).toBe(4);

    const withGray = must(alone.state, free("Gray", ids(alone.state, "Gray")[0] as CardId));
    expect(statPool(withGray.state).oomph).toBe(6);
  });

  it("comes back to hand when the room is Cleared", () => {
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Both Barrels"), card("Shove"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId, r[2] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.some((c) => c.name === "Both Barrels")).toBe(true);
    expect(next.Red.discard.some((c) => c.name === "Both Barrels")).toBe(false);
  });

  it("stays discarded when the room is not Cleared", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Both Barrels"), card("Shove"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId, r[2] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.discard.some((c) => c.name === "Both Barrels")).toBe(true);
  });
});

describe("Flurry — 'Oomph equal to twice the number of other cards Red played'", () => {
  it("counts Red's other played cards, not itself", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Flurry"), card("Pry Bar"), card("Coil Of Cable"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const one = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[3] as CardId] },
    ]);
    // Nothing else played: Flurry is Oomph 0.
    expect(statPool(one.state).oomph).toBe(0);

    const two = play(one.state, [free("Red", r[1] as CardId), free("Red", r[2] as CardId)]);
    // Two other cards, so Flurry is Oomph 4, plus the Pry Bar's 3.
    expect(statPool(two.state).oomph).toBe(7);
  });
});

describe("Zen Mode — \"Holding: you don't `Exhaust`\"", () => {
  it("stops a room's printed `Exhaust X`", () => {
    const state = playing({
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Zen Mode")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // Collapsed Stairwell's Flee line: one of you Exhausts 3.
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.Red.deck).toHaveLength(5);
    expect(eventTypes(events)).toContain("EXHAUST_PREVENTED");
  });

  it("protects its holder only", () => {
    const state = playing({
      activeRoom: room("Coney, The Thing In The Stairwell"),
      Red: player({ deck: pile("Shove", 5), hand: [card("Zen Mode")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // Coney's Flee line: both of you Exhaust 1.
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.Red.deck).toHaveLength(5);
    expect(next.Gray.deck).toHaveLength(4);
  });

  it("stops its holder's own Overdrive", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Zen Mode"), card("Overdrive")] }),
    });
    const overdrive = state.Red.hand[1];
    if (!overdrive) throw new Error("rig");
    const { state: next, events } = must(state, free("Red", overdrive.id));
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toEqual(["CARD_PLAYED", "EXHAUST_PREVENTED"]);
    // The card still enters the play zone and still brings its Oomph.
    expect(statPool(next).oomph).toBe(2);
  });

  it("does not stop paying a cost", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Zen Mode"), card("Charge In"), card("Shove"), card("Shove")],
      }),
    });
    const hand = state.Red.hand.map((c) => c.id);
    const [, chargeIn, payA, payB] = hand;
    if (!chargeIn || !payA || !payB) throw new Error("rig");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: chargeIn,
      payWith: [payA, payB],
    });
    expect(next.Red.discard).toHaveLength(2);
  });

  it("does not stop cleanup", () => {
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Zen Mode"), card("Shove")] }),
    });
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    // Nothing was played, so nothing is discarded; the whole hand carries over.
    expect(next.Red.discard).toEqual([]);
    expect(next.Red.hand.map((c) => c.name)).toEqual(["Zen Mode", "Shove"]);
  });

  it("does not stop the automatic fill to 5 — a hand already at 5 just draws nothing", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Zen Mode"), ...pile("Shove", 4)],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(4);
    expect(events.filter((e) => e.type === "CARD_DRAWN" && e.character === "Red")).toHaveLength(0);
  });
});
