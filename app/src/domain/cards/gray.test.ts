/* One test per entry in Gray's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { statPool } from "../queries";
import {
  card,
  eventTypes,
  free,
  handCard,
  must,
  pile,
  play,
  player,
  playing,
  resetRig,
} from "../__fixtures__/rig";
import type { CardId } from "../types";

beforeEach(resetRig);

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
    expect(asked.state.pending?.kind).toBe("ChooseCharacter");

    const looked = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Red" });
    expect(eventTypes(looked.events)).toContain("CARDS_PEEKED");
    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
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
    const looked = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    const pending = looked.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.cards).toHaveLength(3);
  });
});

describe("In Step — 'Oomph equal to twice the number of cards Red has played'", () => {
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
    expect(statPool(one.state, "Gray").oomph).toBe(0);

    const two = play(one.state, [
      free("Red", handCard(one.state, "Red", "Pry Bar").id),
      free("Red", handCard(one.state, "Red", "Coil Of Cable").id),
    ]);
    expect(statPool(two.state, "Gray").oomph).toBe(4);
  });
});

describe("One Man's Junk — 'If any Bad Stuff is played this turn, Oomph 2 and Scramble 2'", () => {
  it("contributes nothing until a piece of Bad Stuff is on the table", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [
          card("One Man's Junk"),
          card("Duck Under"),
          card("Torn Seal"),
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
    expect(statPool(one.state)).toEqual({ oomph: 0, scramble: 0 });

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
    expect(statPool(two.state)).toEqual({ oomph: 2, scramble: 2 });
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
