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

describe("Overdrive — 'Exhaust 2'", () => {
  it("puts the top 2 cards of your own deck into your Exhaust pile", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overdrive").id,
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
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Sluggish"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Duck Under")] }),
    });
    const redShove = handCard(state, "Red", "Shove");
    const grayDuck = handCard(state, "Gray", "Duck Under");
    expect(costOf(state, "Red", redShove)).toBe(2);
    expect(costOf(state, "Gray", grayDuck)).toBe(1);
  });

  it("stops mattering once it leaves the hand", () => {
    const sluggish = card("Sluggish");
    const shove = card("Shove");
    const payA = card("Shove");
    const payB = card("Shove");
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [sluggish, shove, payA, payB],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Sluggish costs 2 while it is itself in hand: 1 printed, +1 from itself.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: sluggish.id, payWith: [payA.id, payB.id] },
    ]);
    // The leftover Shove's cost is back to its printed 1, now that Sluggish
    // has left the hand.
    expect(costOf(played.state, "Red", shove)).toBe(1);
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
    const peek = handCard(state, "Gray", "Peek Around Corner");
    const payer = handCard(state, "Gray", "Duck Under");
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
