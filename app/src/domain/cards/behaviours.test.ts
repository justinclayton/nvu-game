/* One test per registry entry, beside the behaviour it holds to its printed text. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf } from "../queries";
import {
  card,
  eventTypes,
  free,
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

  it("takes the top of the deck with no choice, even with cards in hand and discard", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 3),
        discard: pile("Pry Bar", 2),
        hand: [card("Overdrive"), card("Duck Under")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const top = state.Red.deck[0];
    if (!top) throw new Error("rig");
    const { state: next } = must(state, free("Red", handCard(state, "Red", "Overdrive").id));
    expect(next.pending).toBeNull();
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([top.id]);
    expect(next.Red.deck).toHaveLength(2);
    expect(next.Red.discard).toHaveLength(2);
  });

  it("reshuffles the discard pile into an empty deck, then Exhausts the new top", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: pile("Shove", 3), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Overdrive").id));
    expect(next.pending).toBeNull();
    expect(next.Red.exhaust).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(2);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });

  it("with deck and discard both empty, Exhausts a card chosen from hand", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [card("Overdrive"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: asked } = must(state, free("Red", handCard(state, "Red", "Overdrive").id));
    const pending = asked.pending;
    if (pending?.kind !== "ChooseExhaust") throw new Error("expected an Exhaust choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Shove", "Shove"]);
    const first = pending.options[0];
    if (!first) throw new Error("rig");
    const { state: next } = must(asked, { type: "EXHAUST_CARD", cardId: first.id });
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([first.id]);
    expect(next.Red.down).toBe(false);
  });

  it("is stopped by Zen Mode in play, and logs EXHAUST_PREVENTED", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
      playZone: [{ owner: "Red", card: card("Zen Mode") }],
    });
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Overdrive").id));
    expect(next.pending).toBeNull();
    expect(next.Red.exhaust).toEqual([]);
    expect(next.Red.deck).toHaveLength(4);
    expect(eventTypes(events)).toContain("EXHAUST_PREVENTED");
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
    const [payA, payB] = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    if (!payA || !payB) throw new Error("Red is not holding two spare Shoves");
    // Sluggish costs 2 while it is itself in hand: 1 printed, +1 from itself.
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: sluggish.id, payWith: [payA, payB] },
    ]);
    const remaining = handCard(played.state, "Red", "Shove");
    expect(costOf(played.state, "Red", remaining)).toBe(1);
  });
});
