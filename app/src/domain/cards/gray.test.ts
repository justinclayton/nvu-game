/* One test per entry in Gray's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { statPool } from "../queries";
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

describe("Catch Your Breath — 'Look at the top 2 of any deck, put them back in either order'", () => {
  it("shows two and lets the player choose the order", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Catch Your Breath"), card("Duck Under")],
      }),
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
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
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
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
    const g = ids(state, "Gray");
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    expect(statPool(one.state, "Gray").oomph).toBe(0);

    const r = ids(one.state, "Red");
    const two = play(one.state, [free("Red", r[0] as CardId), free("Red", r[1] as CardId)]);
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
    const g = ids(state, "Gray");
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    expect(statPool(one.state)).toEqual({ oomph: 0, scramble: 0 });

    // Torn Seal is Bad Stuff: it contributes no stats itself, but it is what
    // this card was waiting for.
    const two = must(one.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[2] as CardId,
      payWith: [g[3] as CardId, g[4] as CardId],
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
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("rig");
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
    const g = ids(state, "Gray");
    const played = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
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
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
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
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Pry Bar"]);
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("rig");
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
    const g = ids(state, "Gray");
    const armed = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    expect(armed.state.Gray.hand).toHaveLength(0);

    const r = ids(armed.state, "Red");
    const once = must(armed.state, free("Red", r[0] as CardId));
    expect(once.state.Gray.hand).toHaveLength(1);
    expect(once.state.Gray.deck).toHaveLength(3);

    const twice = must(once.state, free("Red", r[1] as CardId));
    expect(twice.state.Gray.hand).toHaveLength(2);
  });
});

describe("Every Little Bit Helps — 'twice the number of other cards Gray played'", () => {
  it("counts Gray's other played cards", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Every Little Bit Helps"), card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    const g = ids(state, "Gray");
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId],
    });
    expect(statPool(one.state).scramble).toBe(0);
    const two = must(one.state, free("Gray", g[2] as CardId));
    // The Coil is Scramble 3, and it is one other card, so this is Scramble 2.
    expect(statPool(two.state).scramble).toBe(5);
  });
});

describe("Level Up — 'Scrap a card from your hand for the top of the Gray Rewards deck'", () => {
  it("Scraps the chosen card and puts the reward straight into hand", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Level Up"), card("Duck Under"), card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    const g = ids(state, "Gray");
    const top = state.pools.Gray[0];
    if (!top) throw new Error("rig");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId, g[2] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.optional).toBe(true);

    const coil = pending.options.find((c) => c.name === "Coil Of Cable");
    if (!coil) throw new Error("rig");
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CARDS",
      cardIds: [coil.id],
    });
    expect(next.scrapyard.map((c) => c.id)).toEqual([coil.id]);
    expect(next.Gray.hand.map((c) => c.id)).toEqual([top.id]);
    expect(next.pools.Gray[0]?.id).not.toBe(top.id);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
  });

  it("does nothing if you decline to Scrap", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Level Up"), card("Duck Under"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const g = ids(state, "Gray");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g[0] as CardId,
      payWith: [g[1] as CardId, g[2] as CardId],
    });
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [] });
    expect(next.scrapyard).toEqual([]);
    // The spare card is still in hand, and no reward was drawn.
    expect(next.Gray.hand.map((c) => c.name)).toEqual(["Duck Under"]);
    expect(next.pools.Gray).toEqual(state.pools.Gray);
  });
});

describe("I Know Kung Fu — 'Holding: when you play a card with Scramble, draw 1'", () => {
  it("draws while it is held, and not once it is played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Coil Of Cable")] }),
      Gray: player({
        deck: pile("Duck Under", 6),
        hand: [
          card("I Know Kung Fu"),
          card("Coil Of Cable"),
          card("Coil Of Cable"),
          card("Pry Bar"),
          card("Pry Bar"),
          card("Pry Bar"),
        ],
      }),
    });
    const kungFu = state.Gray.hand[0];
    const coils = state.Gray.hand.filter((c) => c.name === "Coil Of Cable");
    const pryBars = state.Gray.hand.filter((c) => c.name === "Pry Bar");
    const firstCoil = coils[0];
    const secondCoil = coils[1];
    if (!kungFu || !firstCoil || !secondCoil) throw new Error("rig");

    // Red playing Scramble does nothing: the card says "when *you* play".
    const byRed = must(state, free("Red", ids(state, "Red")[0] as CardId));
    expect(byRed.state.Gray.deck).toHaveLength(6);

    // Gray playing Scramble while holding it draws.
    const byGray = must(byRed.state, free("Gray", firstCoil.id));
    expect(byGray.state.Gray.deck).toHaveLength(5);

    // Playing it moves it to the play zone, where a `Holding:` line is no
    // longer running.
    const played = must(byGray.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: kungFu.id,
      payWith: pryBars.map((c) => c.id),
    });
    const deckAfter = played.state.Gray.deck.length;
    const silent = must(played.state, free("Gray", secondCoil.id));
    expect(silent.state.Gray.deck).toHaveLength(deckAfter);
  });
});
