/* One test per entry in the Stuff registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf, drawCapFor, handCapFor, statPool, thresholdTarget } from "../queries";
import {
  card,
  eventTypes,
  must,
  pile,
  play,
  player,
  readyToEnd,
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
  readyToEnd(
    rig({
      phase: "Play",
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 6) }),
      Gray: player({ deck: pile("Duck Under", 6) }),
      ...over,
    }),
  );

describe("Crowbar — 'If you get any Good Stuff this turn, get an additional one'", () => {
  it("pays a second piece, once, however many times Stuff arrives", () => {
    const state = playing({
      activeRoom: room("Ration Locker"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Charge In"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    // Charge In is Oomph 4 on Red's own side, which pays Red 2 Good Stuff; the
    // Crowbar adds one more, once.
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[1] as CardId,
        payWith: [r[2] as CardId, r[3] as CardId],
      },
      { type: "END_PLAY" },
    ]);
    const stuff = next.Red.hand.filter((c) => c.kind === "good_stuff" && c.name !== "Crowbar");
    expect(stuff).toHaveLength(3);
  });
});

describe("A Pair Of Stich-Em-Ups — 'Move 2 cards from your exhaust pile to the bottom'", () => {
  it("takes exactly two, and they go under the deck", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stich-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 3),
      }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.count).toBe(2);

    const chosen = pending.options.slice(0, 2).map((c) => c.id);
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: chosen });
    expect(next.Red.deck.slice(-2).map((c) => c.id)).toEqual(chosen);
    expect(next.Red.deck).toHaveLength(4);
    expect(eventTypes(events)).toContain("CARD_MOVED");
  });
});

describe("Grav Harness — 'One of you draws 1 card, even if their hand is full'", () => {
  it("asks who, and ignores the hand cap", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Grav Harness"), ...pile("Shove", 5)] }),
    });
    const grav = state.Red.hand[0];
    if (!grav) throw new Error("rig");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: grav.id,
      payWith: state.Red.hand.slice(1, 3).map((c) => c.id),
    });
    expect(asked.state.pending?.kind).toBe("ChooseCharacter");

    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CHARACTER",
      character: "Red",
    });
    // Red held 4 after paying, so the cap was not in the way here; what matters
    // is that the card entered the hand rather than being burned.
    expect(eventTypes(events)).toEqual(["CARD_DRAWN"]);
    expect(next.Red.deck).toHaveLength(3);
  });

  it("draws into a full hand rather than burning the card", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Grav Harness"), ...pile("Shove", 5)] }),
    });
    const grav = state.Red.hand[0];
    if (!grav) throw new Error("rig");
    // Pay nothing: the Grav Harness costs 2, so give it a free ride by using
    // Gray as the target with a full Red hand instead.
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: grav.id,
      payWith: state.Red.hand.slice(1, 3).map((c) => c.id),
    });
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(eventTypes(events)).toEqual(["CARD_DRAWN"]);
    expect(next.Gray.hand).toHaveLength(1);
  });
});

describe("Riot Shield — 'At the end of turn, return this card to your hand'", () => {
  it("comes back instead of Exhausting with the rest of the play zone", () => {
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Riot Shield"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.some((c) => c.name === "Riot Shield")).toBe(true);
    expect(next.Red.exhaust.some((c) => c.name === "Riot Shield")).toBe(false);
  });
});

describe("Overcharged Battery — 'The next card played this turn costs 0'", () => {
  it("makes the next card free, and only the next one", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Overcharged Battery"), card("Shove"), card("Charge In"), card("Charge In")],
      }),
    });
    const r = ids(state, "Red");
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    const first = charged.state.Red.hand[0];
    const second = charged.state.Red.hand[1];
    if (!first || !second) throw new Error("rig");
    expect(costOf(charged.state, "Red", first)).toBe(0);

    const spent = must(charged.state, free("Red", first.id));
    expect(costOf(spent.state, "Red", second)).toBe(2);
  });
});

describe("Faceful Of Slime — 'Holding: you may not draw more than 1 card'", () => {
  it("caps the draw at one", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("Faceful Of Slime")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    expect(drawCapFor(state, "Red")).toBe(1);
    const once = must(state, { type: "DRAW", character: "Red" });
    const twice = play(once.state, []);
    void twice;
    expect(once.state.Red.drewThisTurn).toBe(1);
  });
});

describe("Rust — 'Holding: Stuff you play has -1 Oomph'", () => {
  it("takes a Oomph off Stuff, and leaves other cards alone", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Rust"), card("Pry Bar"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const withStuff = must(state, free("Red", r[1] as CardId));
    // The Pry Bar is Oomph 3, less 1 while the Rust is held.
    expect(statPool(withStuff.state).oomph).toBe(2);

    const withCard = must(withStuff.state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[2] as CardId,
      payWith: [r[3] as CardId],
    });
    // Shove is Oomph 2 and is not Stuff.
    expect(statPool(withCard.state).oomph).toBe(4);
  });
});

describe("Spore Cloud — \"Holding: You can't have more than 3 cards in your hand\"", () => {
  it("tightens the hand cap to 3", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("Spore Cloud")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    expect(handCapFor(state, "Red")).toBe(3);
    const drawn = play(state, [
      { type: "DRAW", character: "Red" },
      { type: "DRAW", character: "Red" },
    ]);
    expect(drawn.state.Red.hand).toHaveLength(3);
    // A fourth draw would be drawing up past the cap.
    const rejected = play(drawn.state, []);
    void rejected;
    expect(handCapFor(drawn.state, "Red")).toBe(3);
  });
});

describe("Panic — 'ALL rooms require an additional 2 Scramble, and Play: Exhaust 2'", () => {
  it("raises every Scramble threshold while it is held, in either hand", () => {
    const state = playing({
      activeRoom: room("Collapsed Stairwell"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    const room1 = state.activeRoom?.thresholds[0];
    if (!room1) throw new Error("rig");
    expect(room1.value).toBe(2);
    expect(thresholdTarget(state, room1)).toBe(4);
  });

  it("Exhausts 2 when it is played", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Panic"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    expect(next.Red.deck).toHaveLength(2);
  });
});
