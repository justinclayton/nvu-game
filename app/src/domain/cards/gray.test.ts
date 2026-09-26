/* One test per entry in Gray's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf, statPool } from "../queries";
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
  playing,
  resetRig,
  room,
} from "../__fixtures__/rig";
import type { CardId } from "../types";

beforeEach(resetRig);

describe("Peek Around Corner — 'Peek 1'", () => {
  it("shows the top card of a chosen deck and puts it back", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Peek Around Corner"), card("Duck Under")],
      }),
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    expect(asked.state.pending?.kind).toBe("ChoosePile");

    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Red deck" });
    expect(eventTypes(looked.events)).toContain("CARDS_PEEKED");
    // Depth 1 has no order to choose: it goes straight back on top.
    expect(looked.state.pending).toBeNull();
    expect(looked.state.Red.deck).toHaveLength(6);
  });
});

describe("Catch Your Breath — 'Look at the top 2 of any deck, put them back in either order'", () => {
  it("shows two and lets the player choose the order", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Catch Your Breath"), card("Duck Under")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Catch Your Breath").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(asked.state.pending?.kind).toBe("ChoosePile");

    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Red deck" });
    expect(eventTypes(looked.events)).toContain("CARDS_PEEKED");
    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.pile).toBe("Red deck");
    expect(pending.cards).toHaveLength(2);

    const swapped = [pending.cards[1], pending.cards[0]].map((c) => c?.id as CardId);
    const { state: next } = must(looked.state, { type: "ORDER_CARDS", cardIds: swapped });
    expect(next.Red.deck.slice(0, 2).map((c) => c.id)).toEqual(swapped);
    expect(next.Red.deck).toHaveLength(6);
  });
});

describe("Hack the Doors — 'Look at the top 3 of any deck'", () => {
  it("shows three", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Hack the Doors"), card("Duck Under")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Hack the Doors").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.cards).toHaveLength(3);
  });

  it("offers all seven piles when all hold cards, and omits empty ones", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 6) }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
      floorDeck: [room("Security Turnstile")],
      pools: {
        Red: pile("Charge In", 1),
        Gray: pile("Duck Under", 1),
        goodStuff: pile("Stim Pack", 1),
        badStuff: [],
      },
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChoosePile") throw new Error("expected a pile choice");
    expect(pending.options).toEqual([
      "Red deck",
      "Gray deck",
      "Floor deck",
      "Red reward pool",
      "Gray reward pool",
      "Good Stuff pool",
    ]);
  });

  it("choosing the Floor deck peeks rooms and reorders it", () => {
    const first = room("Security Turnstile");
    const second = room("Flooded Ventilation Shaft");
    const third = room("The Sentry Drone");
    const state = playing({
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
      floorDeck: [first, second, third],
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Floor deck" });
    const peeked = looked.events.find((e) => e.type === "CARDS_PEEKED");
    if (peeked?.type !== "CARDS_PEEKED") throw new Error("expected a peek");
    expect(peeked.pile).toBe("Floor deck");
    expect(peeked.cards.map((c) => c.id)).toEqual([first.id, second.id, third.id]);

    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.pile).toBe("Floor deck");
    const reversed = [...pending.cards].reverse().map((c) => c.id);
    const { state: next } = must(looked.state, { type: "ORDER_CARDS", cardIds: reversed });
    expect(next.floorDeck.map((c) => c.id)).toEqual(reversed);
  });

  it("choosing the Good Stuff pool reorders that pool", () => {
    const state = playing({
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
      pools: {
        Red: [],
        Gray: [],
        goodStuff: pile("Stim Pack", 3),
        badStuff: [],
      },
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Good Stuff pool" });
    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.pile).toBe("Good Stuff pool");
    const reversed = [...pending.cards].reverse().map((c) => c.id);
    const { state: next } = must(looked.state, { type: "ORDER_CARDS", cardIds: reversed });
    expect(next.pools.goodStuff.map((c) => c.id)).toEqual(reversed);
  });
});

describe("Peek Around Corner on the Floor deck", () => {
  it("emits the event and asks no order", () => {
    const only = room("Security Turnstile");
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Peek Around Corner"), card("Duck Under")],
      }),
      floorDeck: [only],
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Floor deck" });
    const peeked = looked.events.find((e) => e.type === "CARDS_PEEKED");
    if (peeked?.type !== "CARDS_PEEKED") throw new Error("expected a peek");
    expect(peeked.pile).toBe("Floor deck");
    expect(peeked.cards.map((c) => c.id)).toEqual([only.id]);
    expect(looked.state.pending).toBeNull();
    expect(looked.state.floorDeck.map((c) => c.id)).toEqual([only.id]);
  });
});

describe("In Step — 'Scramble equal to 2 times the number of cards Red has played'", () => {
  it("reads Red's side of the play zone", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Coil Of Cable")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("In Step"), card("Duck Under")] }),
    });
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "In Step").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(statPool(one.state, "Gray").scramble).toBe(0);

    const r = ids(one.state, "Red");
    const two = play(one.state, [free("Red", r[0] as CardId), free("Red", r[1] as CardId)]);
    expect(statPool(two.state, "Gray").scramble).toBe(4);
  });
});

describe("One Man's Junk — 'If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1'", () => {
  it("contributes its printed stats on its own, then +1/+1 more once Bad Stuff is on the table", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [
          card("One Man's Junk"),
          card("Duck Under"),
          card("Torn Seal"),
          card("Duck Under"),
          card("Duck Under"),
          card("Duck Under"),
        ],
      }),
    });
    const junk = handCard(state, "Gray", "One Man's Junk");
    const [duckPay] = state.Gray.hand.filter((c) => c.name === "Duck Under").map((c) => c.id);
    if (!duckPay) throw new Error("Gray is not holding a Duck Under");
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: junk.id,
      payWith: [duckPay],
    });
    expect(statPool(one.state)).toEqual({ oomph: 2, scramble: 2 });

    // Torn Seal is Bad Stuff: it contributes no stats itself, but it is what
    // this card was waiting for.
    const tornSeal = handCard(one.state, "Gray", "Torn Seal");
    const payWith = one.state.Gray.hand.filter((c) => c.name === "Duck Under").map((c) => c.id);
    const two = must(one.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: tornSeal.id,
      payWith,
    });
    expect(statPool(two.state)).toEqual({ oomph: 3, scramble: 3 });
  });
});

describe("Here, Catch — 'Move 1 Stuff from your hand to Red's hand'", () => {
  it("hands the Stuff over", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Here, Catch"), card("Duck Under"), card("Pry Bar")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Here, Catch").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("Pry Bar not offered");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(next.Red.hand.map((c) => c.id)).toEqual([pryBar.id]);
    expect(next.Gray.hand).toEqual([]);
  });

  it("does nothing when Red is Down", () => {
    const state = playing({
      Red: player({ deck: [], hand: [], down: true }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Here, Catch"), card("Duck Under"), card("Pry Bar")],
      }),
    });
    const played = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Here, Catch").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(played.state.pending).toBeNull();
    expect(played.state.Gray.hand.map((c) => c.name)).toEqual(["Pry Bar"]);
  });
});

describe("Hit 'n Run — 'Shuffle a Gray card from your Exhaust pile into your deck'", () => {
  it("offers only Gray's own cards", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Hit 'n Run"), card("Duck Under")],
        exhaust: [card("Pick The Lock"), card("Coil Of Cable")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Hit 'n Run").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).not.toContain("Coil Of Cable");
  });
});

describe("I'll Take That — 'Shuffle 1 Stuff from Red's hand into Red's deck'", () => {
  it("reaches into Red's hand, not Gray's", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Pry Bar")] }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("I'll Take That"), card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "I'll Take That").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Pry Bar"]);
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("Pry Bar not offered");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.deck).toHaveLength(4);
  });
});

describe("Covering Fire — 'Every time Red plays a card this turn, draw 1 card'", () => {
  it("draws for Gray whenever Red plays, while it is on the table", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Coil Of Cable")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Covering Fire"), card("Duck Under")],
      }),
    });
    const armed = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Covering Fire").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(armed.state.Gray.hand).toHaveLength(0);

    const once = must(armed.state, free("Red", handCard(armed.state, "Red", "Pry Bar").id));
    expect(once.state.Gray.hand).toHaveLength(1);
    expect(once.state.Gray.deck).toHaveLength(3);

    const twice = must(once.state, free("Red", handCard(once.state, "Red", "Coil Of Cable").id));
    expect(twice.state.Gray.hand).toHaveLength(2);
  });
});

describe("Distract & Pivot — 'The next card Red plays this turn costs 1 fewer card to play'", () => {
  it("takes 1 off the cost of Red's next play, and only that one", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Charge In"), card("Charge In"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Distract & Pivot"), card("Duck Under"), card("Duck Under")] }),
    });
    const g = ids(state, "Gray");
    const armed = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId, g[2] as CardId],
    });
    const [first, second] = armed.state.Red.hand;
    if (!first || !second) throw new Error("rig");
    // Charge In costs 2; the banked charge takes it to 1.
    expect(costOf(armed.state, "Red", first)).toBe(1);

    const spent = must(armed.state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: first.id,
      payWith: [armed.state.Red.hand.find((c) => c.name === "Shove")?.id as CardId],
    });
    // The charge is gone: the next Charge In pays its full printed cost.
    expect(costOf(spent.state, "Red", second)).toBe(2);
  });
});


describe("Synergy Link — 'Draw 1 card. If Red has played a card this turn, draw 1 additional card'", () => {
  const link = (redPlays: boolean) => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Coil Of Cable")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Synergy Link"), card("Duck Under")],
      }),
    });
    const ready = redPlays ? play(state, [free("Red", ids(state, "Red")[0] as CardId)]).state : state;
    return must(ready, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(ready, "Gray", "Synergy Link").id,
      payWith: [handCard(ready, "Gray", "Duck Under").id],
    });
  };

  it("draws 1 while Red has played nothing", () => {
    const { state, events } = link(false);
    expect(eventTypes(events).filter((t) => t === "CARD_DRAWN")).toHaveLength(1);
    expect(state.Gray.deck).toHaveLength(3);
  });

  it("draws 2 once Red has played a card", () => {
    const { state, events } = link(true);
    expect(eventTypes(events).filter((t) => t === "CARD_DRAWN")).toHaveLength(2);
    expect(state.Gray.deck).toHaveLength(2);
  });
});
