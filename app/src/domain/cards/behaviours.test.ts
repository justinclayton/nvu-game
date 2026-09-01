/* One test per registry entry, beside the behaviour it holds to its printed text. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf } from "../queries";
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

const first = (state: GameState, c: Character): CardId => {
  const found = state[c].hand[0];
  if (!found) throw new Error("rig");
  return found.id;
};

describe("Overdrive — 'Exhaust 2'", () => {
  it("puts the top 2 cards of your own deck into your exhaust pile", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: first(state, "Red"),
      payWith: [],
    });
    expect(next.Red.deck).toHaveLength(2);
    expect(next.Red.exhaust).toHaveLength(2);
    expect(next.Gray.deck).toHaveLength(4);
    expect(eventTypes(events)).toEqual([
      "CARD_PLAYED",
      "CARD_EXHAUSTED",
      "CARD_EXHAUSTED",
    ]);
    // §8: off the top, not chosen.
    expect(events.filter((e) => e.type === "CARD_EXHAUSTED").every((e) => e.from === "deck")).toBe(
      true,
    );
  });

  it("sends you Down if the deck runs out under it", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [card("Shove")], hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: first(state, "Red"),
      payWith: [],
    });
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });
});

describe("Sluggish — 'Holding: cards cost +1 to play'", () => {
  it("makes its holder's cards dearer, and nobody else's", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Sluggish"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Duck Under")] }),
    });
    const redShove = state.Red.hand[1];
    const grayDuck = state.Gray.hand[0];
    if (!redShove || !grayDuck) throw new Error("rig");
    expect(costOf(state, "Red", redShove)).toBe(2);
    expect(costOf(state, "Gray", grayDuck)).toBe(1);
  });

  it("stops mattering once it leaves the hand", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Sluggish"), card("Shove"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = state.Red.hand.map((c) => c.id);
    const [sluggish, shove, payA, payB] = hand;
    if (!sluggish || !shove || !payA || !payB) throw new Error("rig");
    // Sluggish costs 2 while it is itself in hand: 1 printed, +1 from itself.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: sluggish, payWith: [payA, payB] },
    ]);
    const remaining = played.state.Red.hand[0];
    if (!remaining) throw new Error("rig");
    expect(costOf(played.state, "Red", remaining)).toBe(1);
  });
});

describe("Peek Around Corner — 'Look at the top card of any deck'", () => {
  it("asks whose deck, then shows the top card and puts it back", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [] }),
      Gray: player({ deck: pile("Duck Under", 3), hand: [card("Peek Around Corner"), card("Duck Under")] }),
    });
    const peek = state.Gray.hand[0];
    const payer = state.Gray.hand[1];
    if (!peek || !payer) throw new Error("rig");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: peek.id,
      payWith: [payer.id],
    });
    expect(asked.state.pending?.kind).toBe("ChooseCharacter");

    const answered = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Red" });
    expect(answered.state.pending).toBeNull();
    expect(eventTypes(answered.events)).toEqual(["CARDS_PEEKED"]);
    const peeked = answered.events[0];
    if (peeked?.type !== "CARDS_PEEKED") throw new Error("expected a peek");
    expect(peeked.cards.map((c) => c.id)).toEqual([state.Red.deck[0]?.id]);
    // Put back on top: the deck is untouched.
    expect(answered.state.Red.deck.map((c) => c.id)).toEqual(state.Red.deck.map((c) => c.id));
  });
});
