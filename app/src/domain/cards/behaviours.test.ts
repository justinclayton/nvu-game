/* One test per registry entry, beside the behaviour it holds to its printed text. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf } from "../queries";
import {
  card,
  eventTypes,
  handCard,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "../__fixtures__/rig";

beforeEach(resetRig);

describe("Overdrive — 'Exhaust 1'", () => {
  it("puts the top card of your own deck into your Exhaust pile", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overdrive").id,
      payWith: [],
    });
    expect(next.Red.deck).toHaveLength(3);
    expect(next.Red.exhaust).toHaveLength(1);
    expect(next.Gray.deck).toHaveLength(4);
    expect(eventTypes(events)).toEqual(["CARD_PLAYED", "CARD_EXHAUSTED"]);
  });

  it("sends you Down if the deck and discard pile are both empty under it", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overdrive").id,
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
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Sluggish"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Duck Under")] }),
    });
    const redShove = handCard(state, "Red", "Shove");
    const grayDuck = handCard(state, "Gray", "Duck Under");
    expect(costOf(state, "Red", redShove)).toBe(2);
    expect(costOf(state, "Gray", grayDuck)).toBe(1);
  });

  it("stops mattering once it leaves the hand", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Sluggish"), card("Shove"), card("Shove"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const sluggish = handCard(state, "Red", "Sluggish");
    const [payA, payB, payC] = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    if (!payA || !payB || !payC) throw new Error("Red is not holding three spare Shoves");
    // Sluggish costs 3 while it is itself in hand: 2 printed, +1 from itself.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: sluggish.id, payWith: [payA, payB, payC] },
    ]);
    const remaining = handCard(played.state, "Red", "Shove");
    expect(costOf(played.state, "Red", remaining)).toBe(1);
  });
});
