/* One test per entry in Gray's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "../engine";
import { costOf, statPool } from "../queries";
import {
  card,
  drawing,
  eventTypes,
  free,
  handCard,
  ids,
  names,
  must,
  noDraw,
  pile,
  play,
  player,
  playing,
  resetRig,
  room,
} from "../__fixtures__/rig";
import type { Card, CardId, GameState, Pile } from "../types";
import { pileCards } from "../verbs";

const pileOf = (state: GameState, name: Pile) => pileCards(state, name);

beforeEach(resetRig);

/** Play a Peek card from Gray's hand, paying with a Duck Under, up to the pile question. */
function playPeek(name: string, over: Parameters<typeof playing>[0] = {}) {
  const state = playing({
    Gray: player({
      deck: pile("Duck Under", 4),
      hand: [card(name), card("Duck Under")],
    }),
    ...over,
  });
  const asked = must(state, {
    type: "PLAY_CARD",
    character: "Gray",
    cardId: handCard(state, "Gray", name).id,
    payWith: [handCard(state, "Gray", "Duck Under").id],
  });
  return { state, asked };
}

describe("Peek Around Corner — 'Draw 1 card.'", () => {
  it("draws the top card of Gray's deck into Gray's hand", () => {
    const state = playing({
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Peek Around Corner"), card("Duck Under")] }),
    });
    const top = state.Gray.deck[0];
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Peek Around Corner").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(next.pending).toBeNull();
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Gray.hand.map((c) => c.id)).toEqual([top?.id]);
    expect(next.Gray.deck).toHaveLength(3);
  });
});

describe("Catch Your Breath — 'At the end of the Play phase, if this was the only card you played this turn, move 3 cards from your Exhaust pile to the bottom of your deck'", () => {
  const breather = (hand: Card[], exhaust: Card[]) =>
    playing({
      Gray: player({ deck: pile("Duck Under", 10), hand: [card("Catch Your Breath"), ...hand], exhaust }),
    });

  it("asks for 3 of a longer Exhaust pile once Play ends, and moves them to the bottom", () => {
    const exhaust = [card("Pick The Lock"), card("Duck Under"), card("Coil Of Cable"), card("Quick Vault")];
    const state = breather([], exhaust);
    const ended = play(state, [free("Gray", handCard(state, "Gray", "Catch Your Breath").id), { type: "END_PLAY" }]);
    const pending = ended.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.count).toBe(3);
    const chosen = exhaust.slice(0, 3).map((c) => c.id);
    const { state: next } = must(ended.state, { type: "CHOOSE_CARDS", cardIds: chosen });
    const kept = [...next.Gray.deck, ...next.Gray.hand].map((c) => c.id);
    for (const id of chosen) expect(kept).toContain(id);
    expect(next.Gray.exhaust.map((c) => c.id)).toContain(exhaust[3]?.id);
  });

  it("moves a short Exhaust pile without asking", () => {
    const exhaust = [card("Pick The Lock"), card("Coil Of Cable")];
    const state = breather([], exhaust);
    const ended = play(state, [free("Gray", handCard(state, "Gray", "Catch Your Breath").id), { type: "END_PLAY" }]);
    const kept = [...ended.state.Gray.deck, ...ended.state.Gray.hand].map((c) => c.id);
    for (const c of exhaust) expect(kept).toContain(c.id);
  });

  it("does nothing if Gray plays another card", () => {
    const exhaust = [card("Pick The Lock"), card("Coil Of Cable")];
    const state = breather([card("Coil Of Cable")], exhaust);
    const ended = play(state, [
      free("Gray", handCard(state, "Gray", "Catch Your Breath").id),
      free("Gray", handCard(state, "Gray", "Coil Of Cable").id),
      { type: "END_PLAY" },
    ]);
    const left = ended.state.Gray.exhaust.map((x) => x.id);
    for (const c of exhaust) expect(left).toContain(c.id);
  });
});

describe("Quick Vault — 'You may draw 2 cards'", () => {
  it("draws up to 2", () => {
    const state = playing({ Gray: player({ deck: pile("Duck Under", 4), hand: [card("Quick Vault")] }) });
    const asked = must(state, free("Gray", handCard(state, "Gray", "Quick Vault").id));
    const { state: next } = must(asked.state, drawing("Gray", 2));
    expect(next.Gray.deck).toHaveLength(2);
    expect(next.Gray.hand).toHaveLength(2);
  });
});

describe("Hack the Doors — 'Peek 3'", () => {
  it("shows three", () => {
    const { asked } = playPeek("Hack the Doors");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const pending = looked.state.pending;
    if (pending?.kind !== "ChooseBottom") throw new Error("expected a choice of cards for the bottom");
    expect(pending.cards).toHaveLength(3);
    expect(pending.prompt).not.toMatch(/discard/i);
  });

  it("keeping all of them on top asks for their order, and discards nothing", () => {
    const { asked } = playPeek("Hack the Doors");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const before = looked.state.Gray.deck;
    const none = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [] });
    expect(eventTypes(none.events)).not.toContain("CARDS_TO_BOTTOM");
    const pending = none.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.cards.map((c) => c.id)).toEqual(before.slice(0, 3).map((c) => c.id));
    const reversed = [...pending.cards].reverse().map((c) => c.id);
    const done = must(none.state, { type: "ORDER_CARDS", cardIds: reversed });
    expect(done.state.Gray.deck.map((c) => c.id)).toEqual([...reversed, before[3]?.id]);
    expect(done.state.Gray.discard).toEqual(asked.state.Gray.discard);
    expect(eventTypes(done.events)).not.toContain("CARD_DISCARDED");
  });

  it("moves one card to the bottom of a character deck without asking for any order", () => {
    const { asked } = playPeek("Hack the Doors", {
      Gray: player({
        deck: [card("Duck Under"), card("Shove"), card("Charge"), card("Duck Under"), card("Rust")],
        hand: [card("Hack the Doors"), card("Duck Under")],
      }),
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const deck = looked.state.Gray.deck;
    const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [(deck[1] as Card).id] });
    expect(sent.events.map((e) => e.type)).toContain("CARDS_TO_BOTTOM");
    expect(eventTypes(sent.events)).not.toContain("CARD_DISCARDED");
    // The two that stay still need an order; nothing else is asked first.
    const pending = sent.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering of those that stay");
    expect(pending.cards.map((c) => c.id)).toEqual([deck[0], deck[2]].map((c) => (c as Card).id));
    const done = must(sent.state, { type: "ORDER_CARDS", cardIds: [(deck[2] as Card).id, (deck[0] as Card).id] });
    expect(done.state.pending).toBeNull();
    expect(done.state.Gray.deck.map((c) => c.id)).toEqual(
      [deck[2], deck[0], deck[3], deck[4], deck[1]].map((c) => (c as Card).id),
    );
    expect(done.state.Gray.discard).toEqual(asked.state.Gray.discard);
  });

  it("moving all three asks only for the bottom order, and puts them after the rest", () => {
    const { asked } = playPeek("Hack the Doors");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const deck = looked.state.Gray.deck;
    const [a, b, c, rest] = deck as [Card, Card, Card, Card];
    const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [a.id, b.id, c.id] });
    const pending = sent.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering of the bottom");
    expect(pending.cards.map((x) => x.id)).toEqual([a.id, b.id, c.id]);
    const done = must(sent.state, { type: "ORDER_CARDS", cardIds: [c.id, a.id, b.id] });
    expect(done.state.pending).toBeNull();
    expect(done.state.Gray.deck.map((x) => x.id)).toEqual([rest.id, c.id, a.id, b.id]);
  });

  it("shows only what a short pile holds, and never reshuffles a discard pile", () => {
    const { asked } = playPeek("Hack the Doors", {
      Gray: player({
        deck: [card("Duck Under"), card("Shove")],
        discard: [],
        hand: [card("Hack the Doors"), card("Duck Under")],
      }),
    });
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const pending = looked.state.pending;
    if (pending?.kind !== "ChooseBottom") throw new Error("expected a choice of cards for the bottom");
    expect(pending.cards).toHaveLength(2);
    expect(eventTypes(looked.events)).not.toContain("DISCARD_RESHUFFLED");
    const [a, b] = pending.cards as [Card, Card];
    const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [b.id] });
    expect(sent.state.pending).toBeNull();
    expect(sent.state.Gray.deck.map((x) => x.id)).toEqual([a.id, b.id]);
    expect(eventTypes(sent.events)).not.toContain("DISCARD_RESHUFFLED");
  });

  it("offers all seven piles when all hold cards, and omits empty ones", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 6) }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
      floorDeck: [room("Security Turnstile")],
      pools: {
        Red: pile("Charge", 1),
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
    const second = room("Puzzle Room");
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
    if (pending?.kind !== "ChooseBottom") throw new Error("expected a choice for the bottom");
    expect(pending.pile).toBe("Floor deck");
    expect(pending.cards.map((c) => c.id)).toEqual([first.id, second.id, third.id]);

    // Send the first room to the bottom; the other two stay, and are ordered.
    const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [first.id] });
    const order = sent.state.pending;
    if (order?.kind !== "OrderCards") throw new Error("expected an ordering of those that stay");
    expect(order.cards.map((c) => c.id)).toEqual([second.id, third.id]);
    const { state: next } = must(sent.state, { type: "ORDER_CARDS", cardIds: [third.id, second.id] });
    expect(next.floorDeck.map((c) => c.id)).toEqual([third.id, second.id, first.id]);
  });

  it("choosing the Good Stuff pool moves cards to the bottom of that pool", () => {
    const state = playing({
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Hack the Doors"), card("Duck Under")] }),
      pools: {
        Red: [],
        Gray: [],
        goodStuff: pile("Stim Pack", 4),
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
    if (pending?.kind !== "ChooseBottom") throw new Error("expected a choice for the bottom");
    expect(pending.pile).toBe("Good Stuff pool");
    const pool = looked.state.pools.goodStuff;
    const [a, b, c, d] = pool as [Card, Card, Card, Card];
    const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [a.id, c.id] });
    const bottom = sent.state.pending;
    if (bottom?.kind !== "OrderCards") throw new Error("expected an ordering of the bottom");
    // Only b stays on top, so once the bottom is ordered nothing more is asked.
    const { state: done } = must(sent.state, { type: "ORDER_CARDS", cardIds: [c.id, a.id] });
    expect(done.pending).toBeNull();
    expect(done.pools.goodStuff.map((x) => x.id)).toEqual([b.id, d.id, c.id, a.id]);
  });

  it.each(["Red deck", "Gray deck", "Floor deck", "Red reward pool", "Gray reward pool", "Good Stuff pool"] as const)(
    "%s: any subset of the peeked cards goes to the bottom, in any order, and nothing is lost",
    (name) => {
      const state = playing({
        Red: player({ deck: pile("Shove", 5) }),
        Gray: player({ deck: pile("Duck Under", 5), hand: [card("Hack the Doors"), card("Duck Under")] }),
        floorDeck: [room("Security Turnstile"), room("Puzzle Room"), room("The Sentry Drone"), room("Security Turnstile")],
        pools: { Red: pile("Charge", 5), Gray: pile("Duck Under", 5), goodStuff: pile("Stim Pack", 5), badStuff: [] },
      });
      const g = ids(state, "Gray");
      const asked = must(state, { type: "PLAY_CARD", character: "Gray", cardId: g[0] as CardId, payWith: [g[1] as CardId] });
      const looked = must(asked.state, { type: "CHOOSE_PILE", pile: name });
      const pending = looked.state.pending;
      if (pending?.kind !== "ChooseBottom") throw new Error("expected a choice for the bottom");
      const before = pileOf(looked.state, name).map((c) => c.id);
      const shown = pending.cards.map((c) => c.id);
      expect(shown).toEqual(before.slice(0, 3));
      // Send the 2nd and 3rd, then order both ways round.
      const sent = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [shown[1] as CardId, shown[2] as CardId] });
      const bottom = sent.state.pending;
      if (bottom?.kind !== "OrderCards") throw new Error("expected an ordering of the bottom");
      const ordered = must(sent.state, { type: "ORDER_CARDS", cardIds: [shown[2] as CardId, shown[1] as CardId] });
      expect(ordered.state.pending).toBeNull();
      expect(pileOf(ordered.state, name).map((c) => c.id)).toEqual([
        before[0],
        ...before.slice(3),
        shown[2],
        shown[1],
      ]);
      for (const e of [...looked.events, ...sent.events, ...ordered.events]) {
        expect(e.type).not.toBe("CARD_DISCARDED");
      }
    },
  );

  it("keeping every card of the Good Stuff pool on top reorders that pool", () => {
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
    const kept = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [] });
    const pending = kept.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.pile).toBe("Good Stuff pool");
    const reversed = [...pending.cards].reverse().map((c) => c.id);
    const { state: next } = must(kept.state, { type: "ORDER_CARDS", cardIds: reversed });
    expect(next.pools.goodStuff.map((c) => c.id)).toEqual(reversed);
  });
});

describe("In Step — 'Scramble equal to 2 times the number of cards Red has played'", () => {
  it("reads Red's side of the play zone", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Coil Of Cable")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("In Step"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const one = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "In Step").id,
      payWith: state.Gray.hand.filter((c) => c.name === "Duck Under").map((c) => c.id),
    });
    expect(statPool(one.state, "Gray").scramble).toBe(0);

    const r = ids(one.state, "Red");
    const two = play(one.state, [free("Red", r[0] as CardId), free("Red", r[1] as CardId)]);
    expect(statPool(two.state, "Gray").scramble).toBe(4);
  });
});

describe("One Man's Junk — '+3 Oomph and +3 Scramble for each Bad Stuff you're holding'", () => {
  const playJunk = (gray: ReturnType<typeof card>[], red: ReturnType<typeof card>[] = []) => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: red }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("One Man's Junk"), card("Duck Under"), ...gray] }),
    });
    const junk = handCard(state, "Gray", "One Man's Junk");
    const pay = handCard(state, "Gray", "Duck Under");
    return must(state, { type: "PLAY_CARD", character: "Gray", cardId: junk.id, payWith: [pay.id] }).state;
  };

  it("adds nothing with no Bad Stuff in Gray's hand", () => {
    expect(statPool(playJunk([]))).toEqual({ oomph: 0, scramble: 0 });
  });

  it("adds 3 and 3 for each Bad Stuff in Gray's hand", () => {
    expect(statPool(playJunk([card("Torn Seal")]))).toEqual({ oomph: 3, scramble: 3 });
    expect(statPool(playJunk([card("Torn Seal"), card("Rust")]))).toEqual({ oomph: 6, scramble: 6 });
  });

  it("does not count Bad Stuff in Red's hand", () => {
    expect(statPool(playJunk([], [card("Torn Seal"), card("Rust")]))).toEqual({ oomph: 0, scramble: 0 });
  });
});

describe("Pack Mule — 'Move any number of Stuff cards from Red's hand to yours'", () => {
  const catching = () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Torn Seal"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Pack Mule"), card("Duck Under")] }),
    });
    return must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Pack Mule").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    }).state;
  };
  const offered = (state: ReturnType<typeof catching>) => {
    const pending = state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    return pending.options;
  };

  it("takes Stuff from Red one card at a time until none is left", () => {
    let state = catching();
    expect([...names(offered(state))].sort()).toEqual(["Pry Bar", "Torn Seal"]);
    const first = offered(state)[0];
    if (!first) throw new Error("nothing offered");
    state = must(state, { type: "CHOOSE_CARDS", cardIds: [first.id] }).state;
    const second = offered(state)[0];
    if (!second) throw new Error("nothing offered");
    state = must(state, { type: "CHOOSE_CARDS", cardIds: [second.id] }).state;
    expect(state.pending).toBeNull();
    expect(names(state.Red.hand)).toEqual(["Shove"]);
    expect([...names(state.Gray.hand)].sort()).toEqual(["Pry Bar", "Torn Seal"]);
  });

  it("stops when Gray takes no more", () => {
    let state = catching();
    state = must(state, { type: "CHOOSE_CARDS", cardIds: [] }).state;
    expect(state.pending).toBeNull();
    expect(state.Red.hand).toHaveLength(3);
  });

  it("does nothing when Red holds no Stuff", () => {
    const state = playing({
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Pack Mule"), card("Duck Under")] }),
    });
    const played = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Pack Mule").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    });
    expect(played.state.pending).toBeNull();
  });
});

describe("Hit 'n Run — 'Shuffle a card from your Exhaust pile into your deck'", () => {
  it("offers every card in the Exhaust pile, Stuff too", () => {
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
    expect(pending.options.map((c) => c.name)).toContain("Coil Of Cable");
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

describe("Covering Fire — 'Every time Red plays a card this turn, you may draw 1 card'", () => {
  const armedState = () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar"), card("Coil Of Cable")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Covering Fire"), card("Duck Under")],
      }),
    });
    return must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Covering Fire").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    }).state;
  };

  it("asks Gray whether to draw whenever Red plays, while it is on the table", () => {
    const armed = armedState();
    expect(armed.Gray.hand).toHaveLength(0);
    expect(armed.pending).toBeNull();

    const once = must(armed, free("Red", handCard(armed, "Red", "Pry Bar").id));
    expect(once.state.pending).toMatchObject({
      kind: "ChooseDraw",
      options: [{ character: "Gray", count: 1 }],
    });
    expect(once.state.Gray.hand).toHaveLength(0);
    const drawn = must(once.state, drawing("Gray", 1));
    expect(drawn.state.Gray.hand).toHaveLength(1);
    expect(drawn.state.Gray.deck).toHaveLength(3);
    expect(drawn.state.pending).toBeNull();

    const twice = must(drawn.state, free("Red", handCard(drawn.state, "Red", "Coil Of Cable").id));
    expect(twice.state.pending?.kind).toBe("ChooseDraw");
    expect(must(twice.state, drawing("Gray", 1)).state.Gray.hand).toHaveLength(2);
  });

  it("lets Gray decline each time", () => {
    const armed = armedState();
    const once = must(armed, free("Red", handCard(armed, "Red", "Pry Bar").id));
    const declined = must(once.state, noDraw);
    expect(declined.state.Gray.hand).toHaveLength(0);
    expect(declined.state.Gray.deck).toHaveLength(4);
    expect(declined.state.pending).toBeNull();
    // Declining once does not turn the next prompt off.
    const twice = must(declined.state, free("Red", handCard(declined.state, "Red", "Coil Of Cable").id));
    expect(twice.state.pending?.kind).toBe("ChooseDraw");
    expect(must(twice.state, drawing("Gray", 1)).state.Gray.hand).toHaveLength(1);
  });

  it("asks nothing when Gray plays, only when Red does", () => {
    const state = playing({
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Covering Fire"), card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    const armed = must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "Covering Fire").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    }).state;
    const next = must(armed, free("Gray", handCard(armed, "Gray", "Coil Of Cable").id));
    expect(next.state.pending).toBeNull();
  });
});

describe("Pivot — 'The next card Red plays this turn costs 1 fewer card to play'", () => {
  it("takes 1 off the cost of Red's next play, and only that one", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Charge"), card("Charge"), card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Pivot"), card("Duck Under"), card("Duck Under")] }),
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
    // Charge costs 2; the banked charge takes it to 1.
    expect(costOf(armed.state, "Red", first)).toBe(1);

    const spent = must(armed.state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: first.id,
      payWith: [armed.state.Red.hand.find((c) => c.name === "Shove")?.id as CardId],
    });
    // The charge is gone: the next Charge pays its full printed cost.
    expect(costOf(spent.state, "Red", second)).toBe(2);
  });
});


describe("Synergy Link — 'You may draw 1 card. If Red has played a card this turn, you may draw 1 more'", () => {
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
  const drawnBy = (ran: ReturnType<typeof link>, command: Parameters<typeof must>[1]) =>
    must(ran.state, command).state.Gray.hand.length;

  it("offers 1 while Red has played nothing", () => {
    const asked = link(false);
    expect(asked.state.pending).toMatchObject({
      kind: "ChooseDraw",
      options: [{ character: "Gray", count: 1 }],
    });
    expect(drawnBy(asked, drawing("Gray", 1))).toBe(1);
    expect(drawnBy(asked, noDraw)).toBe(0);
    expect(execute(asked.state, drawing("Gray", 2)).ok).toBe(false);
  });

  it("offers up to 2 once Red has played a card", () => {
    const asked = link(true);
    expect(asked.state.pending).toMatchObject({
      kind: "ChooseDraw",
      options: [
        { character: "Gray", count: 1 },
        { character: "Gray", count: 2 },
      ],
    });
    expect(drawnBy(asked, drawing("Gray", 2))).toBe(2);
    expect(drawnBy(asked, drawing("Gray", 1))).toBe(1);
    expect(drawnBy(asked, noDraw)).toBe(0);
  });
});

describe("I Know Kung Fu — 'Play: every time a Scramble card is played this turn, you may draw a card'", () => {
  const armedState = () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Crowbar"), card("Pry Bar")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("I Know Kung Fu"), card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    return must(state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(state, "Gray", "I Know Kung Fu").id,
      payWith: [handCard(state, "Gray", "Duck Under").id],
    }).state;
  };

  it("asks Gray whether to draw when Red plays Crowbar", () => {
    const armed = armedState();
    const next = must(armed, free("Red", handCard(armed, "Red", "Crowbar").id));
    expect(next.state.pending).toMatchObject({
      kind: "ChooseDraw",
      options: [{ character: "Gray", count: 1 }],
    });
    expect(must(next.state, drawing("Gray", 1)).state.Gray.hand).toHaveLength(2);
  });

  it("asks when Gray plays a Scramble card too", () => {
    const armed = armedState();
    const next = must(armed, free("Gray", handCard(armed, "Gray", "Coil Of Cable").id));
    expect(next.state.pending?.kind).toBe("ChooseDraw");
  });

  it("asks nothing for a card with no Scramble", () => {
    const armed = armedState();
    const next = must(armed, free("Red", handCard(armed, "Red", "Pry Bar").id));
    expect(next.state.pending).toBeNull();
  });
});

describe("Sharing Is Caring — 'Play: both players may pay for cards from the other player's hand'", () => {
  const setup = (gray: Card[] = [card("Duck Under"), card("Duck Under")]) =>
    playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Charge"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Sharing Is Caring"), ...gray] }),
    });
  const shared = (state = setup()) => must(state, free("Gray", handCard(state, "Gray", "Sharing Is Caring").id)).state;

  it("lets Red pay with a card from Gray's hand, which goes to Gray's discard pile", () => {
    const state = shared();
    const charge = handCard(state, "Red", "Charge");
    const [g1, g2] = state.Gray.hand;
    if (!g1 || !g2) throw new Error("hand too short");
    const next = must(state, { type: "PLAY_CARD", character: "Red", cardId: charge.id, payWith: [g1.id, g2.id] });
    expect(names(next.state.Gray.discard)).toEqual(["Duck Under", "Duck Under"]);
    expect(next.state.Gray.exhaust).toEqual([]);
    expect(next.state.Gray.hand).toHaveLength(0);
    expect(names(next.state.Red.hand)).toEqual(["Shove"]);
  });

  it("lets one payment mix both hands", () => {
    const state = shared();
    const charge = handCard(state, "Red", "Charge");
    const shove = handCard(state, "Red", "Shove");
    const [g1] = state.Gray.hand;
    if (!g1) throw new Error("hand too short");
    const next = must(state, { type: "PLAY_CARD", character: "Red", cardId: charge.id, payWith: [shove.id, g1.id] });
    expect(names(next.state.Red.discard)).toEqual(["Shove"]);
    expect(names(next.state.Gray.discard)).toEqual(["Duck Under"]);
  });

  it("does not open Gray's hand before it is played", () => {
    const state = setup();
    const [, g1, g2] = state.Gray.hand;
    if (!g1 || !g2) throw new Error("hand too short");
    const rejected = execute(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Charge").id,
      payWith: [g1.id, g2.id],
    });
    expect(rejected.ok).toBe(false);
  });

  it("with Zen Mode in play, Gray's cards that Red pays with still go to Gray's discard pile", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Zen Mode"), card("Shove"), card("Charge")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Sharing Is Caring"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const zen = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Zen Mode").id,
      payWith: [handCard(state, "Red", "Shove").id],
    }).state;
    const armed = shared(zen);
    const [g1, g2] = armed.Gray.hand;
    if (!g1 || !g2) throw new Error("hand too short");
    const next = must(armed, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(armed, "Red", "Charge").id,
      payWith: [g1.id, g2.id],
    });
    expect(next.state.Gray.hand).toHaveLength(0);
    expect(next.state.Gray.discard.map((c) => c.id)).toEqual(expect.arrayContaining([g1.id, g2.id]));
    expect(next.state.Gray.exhaust).toHaveLength(0);
    expect(eventTypes(next.events)).not.toContain("EXHAUST_PREVENTED");
  });
});
