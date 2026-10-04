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
  must,
  noDraw,
  pile,
  play,
  player,
  playing,
  resetRig,
  room,
} from "../__fixtures__/rig";
import type { CardId } from "../types";

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

describe("Peek Around Corner — 'Peek 1'", () => {
  it("asks which pile, then whether to discard the one card shown", () => {
    const { asked } = playPeek("Peek Around Corner");
    expect(asked.state.pending?.kind).toBe("ChoosePile");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    expect(eventTypes(looked.events)).toContain("CARDS_PEEKED");
    const pending = looked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.optional).toBe(true);
    expect(pending.options).toHaveLength(1);
    const top = looked.state.Gray.deck[0];
    const done = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [top?.id as CardId] });
    expect(done.state.pending).toBeNull();
    expect(done.state.Gray.deck).toHaveLength(3);
    expect(done.state.Gray.discard.map((c) => c.id)).toContain(top?.id);
  });

  it("lets the player leave the card on top", () => {
    const { asked } = playPeek("Peek Around Corner");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const before = looked.state.Gray.deck.map((c) => c.id);
    const done = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [] });
    expect(done.state.pending).toBeNull();
    expect(done.state.Gray.deck.map((c) => c.id)).toEqual(before);
  });

  it("discards a card from the partner's deck into the partner's discard pile", () => {
    const { asked } = playPeek("Peek Around Corner");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Red deck" });
    const top = looked.state.Red.deck[0];
    const done = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [top?.id as CardId] });
    expect(done.state.Red.deck).toHaveLength(5);
    expect(done.state.Red.discard.map((c) => c.id)).toEqual([top?.id]);
    expect(done.state.Gray.discard).toHaveLength(0);
  });

  it("does not offer an empty deck, and never reshuffles its discard pile", () => {
    const { asked } = playPeek("Peek Around Corner", {
      Gray: player({
        deck: [],
        discard: pile("Duck Under", 3),
        hand: [card("Peek Around Corner"), card("Duck Under")],
      }),
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChoosePile") throw new Error("expected a pile choice");
    expect(pending.options).not.toContain("Gray deck");
    expect(eventTypes(asked.events)).not.toContain("DISCARD_RESHUFFLED");
    expect(asked.state.Gray.deck).toHaveLength(0);
  });
});

describe("Catch Your Breath — 'Peek 3'", () => {
  it("shows three and, with nothing discarded, lets the player order them", () => {
    const { asked } = playPeek("Catch Your Breath");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Red deck" });
    expect(eventTypes(looked.events)).toContain("CARDS_PEEKED");
    const offered = looked.state.pending;
    if (offered?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(offered.options).toHaveLength(3);

    const kept = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [] });
    const pending = kept.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.pile).toBe("Red deck");
    expect(pending.cards).toHaveLength(3);

    const reversed = [...pending.cards].reverse().map((c) => c.id);
    const { state: next } = must(kept.state, { type: "ORDER_CARDS", cardIds: reversed });
    expect(next.Red.deck.slice(0, 3).map((c) => c.id)).toEqual(reversed);
    expect(next.Red.deck).toHaveLength(6);
  });

  it("discards one card at a time, then orders what is left", () => {
    const { asked } = playPeek("Catch Your Breath");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const [first, second, third] = looked.state.Gray.deck;
    if (!first || !second || !third) throw new Error("rig");

    const one = must(looked.state, { type: "CHOOSE_CARDS", cardIds: [first.id] });
    const again = one.state.pending;
    if (again?.kind !== "ChooseCards") throw new Error("expected another card choice");
    expect(again.options.map((c) => c.id)).toEqual([second.id, third.id]);

    const kept = must(one.state, { type: "CHOOSE_CARDS", cardIds: [] });
    const pending = kept.state.pending;
    if (pending?.kind !== "OrderCards") throw new Error("expected an ordering");
    expect(pending.cards.map((c) => c.id)).toEqual([second.id, third.id]);

    const { state: next } = must(kept.state, { type: "ORDER_CARDS", cardIds: [third.id, second.id] });
    expect(next.Gray.deck.map((c) => c.id).slice(0, 2)).toEqual([third.id, second.id]);
    expect(next.Gray.deck).toHaveLength(3);
    expect(next.Gray.discard.map((c) => c.id)).toEqual([first.id]);
  });

  it("stops asking once every card shown is discarded", () => {
    const { asked } = playPeek("Catch Your Breath");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    let s = looked.state;
    for (let i = 0; i < 3; i++) {
      const pending = s.pending;
      if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
      s = must(s, { type: "CHOOSE_CARDS", cardIds: [pending.options[0]?.id as CardId] }).state;
    }
    expect(s.pending).toBeNull();
    expect(s.Gray.deck).toHaveLength(1);
    expect(s.Gray.discard).toHaveLength(3);
  });
});

describe("Hack the Doors — 'Peek 3'", () => {
  it("shows three", () => {
    const { asked } = playPeek("Hack the Doors");
    const looked = must(asked.state, { type: "CHOOSE_PILE", pile: "Gray deck" });
    const pending = looked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options).toHaveLength(3);
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
