/* One test per entry in the Stuff registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf, extraScrambleRequirement, statPool, thresholdIsMet, thresholdTarget } from "../queries";
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
import type { Card, CardId, Character, GameState } from "../types";

beforeEach(resetRig);

const ids = (state: GameState, c: Character): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

const free = (c: Character, cardId: CardId) =>
  ({ type: "PLAY_CARD", character: c, cardId, payWith: [] }) as const;

/** One named card out of a hand, so a test never counts hand positions. */
function handCard(state: GameState, c: Character, name: string): Card {
  const found = state[c].hand.find((x) => x.name === name);
  if (!found) throw new Error(`${c} is not holding ${name}`);
  return found;
}

const playing = (over: Partial<GameState> = {}) =>
  rig({
    phase: "Play",
    activeRoom: room("Gross Thing That Looks Like A Cherry"),
    Red: player({ deck: pile("Shove", 6) }),
    Gray: player({ deck: pile("Duck Under", 6) }),
    ...over,
  });

describe("Crowbar — 'Play: if you get any Good Stuff this turn, get an additional one'", () => {
  it("does nothing when played first, before anything else has paid this turn", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Crowbar")] }),
    });
    const r = ids(state, "Red");
    const { state: next, events } = play(state, [free("Red", r[0] as CardId)]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.Red.hand).toEqual([]);
  });

  it("takes an extra piece when played after this character already got Good Stuff this turn", () => {
    // The room's own payout normally lands after Play ends, so this rigs the look-back condition directly rather than reaching
    // it through a room: Red has already been handed one piece this turn.
    const rigged = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Crowbar")] }),
    });
    const state = { ...rigged, thisTurn: { ...rigged.thisTurn, goodStuffTaken: { Red: 1, Gray: 0 } } };
    const r = ids(state, "Red");
    const { state: next, events } = play(state, [free("Red", r[0] as CardId)]);
    expect(eventTypes(events)).toContain("STUFF_TAKEN");
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("takes the extra piece from the room's own payout at Outcome, when it saw no earlier gain", () => {
    // The primary case: Crowbar
    // played earlier in Play, with nothing yet to look back at, still catches
    // the room's own payout once Outcome hands it over — rigged through a
    // real Sorting Room clear, not by setting turn-record fields by hand.
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next, events } = play(state, [
      free("Red", r[0] as CardId), // Crowbar, cost 0, nothing to look back at yet
      { type: "PLAY_CARD", character: "Red", cardId: r[1] as CardId, payWith: [r[2] as CardId] }, // Shove, Oomph 2
      { type: "END_PLAY" },
    ]);
    // Sorting Room's Oomph-2 line meets on Crowbar's own Oomph 1 plus Shove's
    // 2, and pays Red one piece at Outcome; the played Crowbar catches that
    // payout as it lands and pays a second.
    expect(eventTypes(events).filter((t) => t === "STUFF_TAKEN")).toHaveLength(2);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
  });

  it("does not fire again at Outcome once it already fired on an earlier gain", () => {
    // Once-per-copy: whichever
    // hook pays first uses up this copy's only bonus for the turn.
    const rigged = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove")],
      }),
    });
    const state = { ...rigged, thisTurn: { ...rigged.thisTurn, goodStuffTaken: { Red: 1, Gray: 0 } } };
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      free("Red", r[0] as CardId), // Crowbar: fires now, at play, off the look-back
      { type: "PLAY_CARD", character: "Red", cardId: r[1] as CardId, payWith: [r[2] as CardId] }, // Shove, Oomph 2
      { type: "END_PLAY" }, // pays Red another piece at Outcome — Crowbar stays quiet
    ]);
    // One from the look-back bonus, one from the room's own Outcome payout —
    // never a second bonus on top.
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
  });

  it("two Crowbars played by the same controller pay two extra pieces", () => {
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Crowbar"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      free("Red", r[0] as CardId), // first Crowbar
      free("Red", r[1] as CardId), // second Crowbar
      { type: "PLAY_CARD", character: "Red", cardId: r[2] as CardId, payWith: [r[3] as CardId] }, // Shove, Oomph 2
      { type: "END_PLAY" },
    ]);
    // The room's own piece, plus one bonus per Crowbar.
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(3);
  });

  it("pays nothing and logs an empty pool when its own bonus draw finds none left", () => {
    // The room's payout goes first and spends the pool's one remaining card;
    // Crowbar's own bonus draw then goes through `takeGoodStuff` and finds it
    // empty, the same as any other draw would.
    const rigged = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove")],
      }),
    });
    const state = {
      ...rigged,
      pools: { ...rigged.pools, goodStuff: [card("A Pair Of Stich-Em-Ups")] },
    };
    const r = ids(state, "Red");
    const { state: next, events } = play(state, [
      free("Red", r[0] as CardId),
      { type: "PLAY_CARD", character: "Red", cardId: r[1] as CardId, payWith: [r[2] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events).filter((t) => t === "STUFF_TAKEN")).toHaveLength(1);
    expect(eventTypes(events).filter((t) => t === "STUFF_POOL_EMPTY")).toHaveLength(1);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("does not fire on its own arrival: a room handing Red both Crowbar and another piece pays no third", () => {
    const state = playing({
      activeRoom: room("Ration Locker"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge In"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    // Charge In is Oomph 4, meeting Ration Locker's Oomph 4 line, which pays Red 2 Good Stuff.
    // Whether or not Crowbar itself is one of the two, arriving unplayed in a
    // hand is not Crowbar being played — the pool never grows a third piece
    // from that arrival, only playing Crowbar afterward could.
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: r[0] as CardId,
        payWith: [r[1] as CardId, r[2] as CardId],
      },
      { type: "END_PLAY" },
    ]);
    const stuff = next.Red.hand.filter((c) => c.kind === "good_stuff");
    expect(stuff).toHaveLength(2);
  });
});

describe("A Pair Of Stich-Em-Ups — 'Choose a character, move 2 cards from their Exhaust pile'", () => {
  it("heals the caster with no choice offered when only they have an Exhaust pile", () => {
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
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice, no character prompt");
    expect(pending.character).toBe("Red");
    expect(pending.count).toBe(2);

    const chosen = pending.options.slice(0, 2).map((c) => c.id);
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: chosen });
    expect(next.Red.deck.slice(-2).map((c) => c.id)).toEqual(chosen);
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Red.exhaust).toHaveLength(1);
    expect(eventTypes(events)).toContain("CARD_MOVED");
  });

  it("asks which character when both have an Exhaust pile, and heals the other one", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stich-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 3),
      }),
      Gray: player({
        deck: pile("Duck Under", 2),
        exhaust: pile("Duck Under", 3),
      }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    expect(asked.state.pending?.kind).toBe("ChooseCharacter");

    const chosen = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    const pending = chosen.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice for Gray");
    expect(pending.character).toBe("Gray");
    expect(pending.options).toEqual(state.Gray.exhaust);

    const chosenCards = pending.options.slice(0, 2).map((c) => c.id);
    const { state: next, events } = must(chosen.state, {
      type: "CHOOSE_CARDS",
      cardIds: chosenCards,
    });
    expect(next.Gray.deck.slice(-2).map((c) => c.id)).toEqual(chosenCards);
    expect(next.Gray.deck).toHaveLength(4);
    expect(next.Gray.exhaust).toHaveLength(1);
    expect(eventTypes(events)).toContain("CARD_MOVED");
  });

  it("moves fewer than 2 when the Exhaust pile is that short", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stich-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 1),
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
    expect(pending.options).toHaveLength(1);
    const { state: next } = must(asked.state, {
      type: "CHOOSE_CARDS",
      cardIds: pending.options.map((c) => c.id),
    });
    expect(next.Red.exhaust).toHaveLength(0);
    expect(next.Red.deck).toHaveLength(3);
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

describe("Riot Shield — 'If the room is Cleared, return this to your hand at the end of the turn'", () => {
  it("comes back to hand when the room is Cleared", () => {
    // Riot Shield's Scramble 3 alone meets Sorting Room's Scramble 2 line —
    // every Challenge reads the shared pool, so it does not matter that Red
    // is the one playing it while the line pays Gray.
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 1),
        hand: [card("Riot Shield"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.hand.some((c) => c.name === "Riot Shield")).toBe(true);
    expect(next.Red.discard.some((c) => c.name === "Riot Shield")).toBe(false);
  });

  it("is discarded with the play zone when the room is Fled", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Riot Shield"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.some((c) => c.name === "Riot Shield")).toBe(false);
    expect(next.Red.discard.some((c) => c.name === "Riot Shield")).toBe(true);
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

  it("discounts the next card whichever character plays it", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Overcharged Battery"), card("Shove")] }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Pick The Lock"), card("Duck Under")],
      }),
    });
    const r = ids(state, "Red");
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    const lock = handCard(charged.state, "Gray", "Pick The Lock");
    expect(costOf(charged.state, "Gray", lock)).toBe(0);

    // Gray spends it, so Gray's next card is back to its printed cost.
    const spent = must(charged.state, free("Gray", lock.id));
    expect(costOf(spent.state, "Gray", handCard(spent.state, "Gray", "Duck Under"))).toBe(1);
  });

  it("is not used up by a card that already costs 0", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Overcharged Battery"), card("Shove"), card("Pry Bar"), card("Charge In")],
      }),
    });
    const r = ids(state, "Red");
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    // Pry Bar is Cost 0 on its own, so it saves nothing and leaves the discount
    // standing for Charge In.
    const played = must(charged.state, free("Red", handCard(charged.state, "Red", "Pry Bar").id));
    expect(played.state.thisTurn.freePlays).toBe(1);
    expect(costOf(played.state, "Red", handCard(played.state, "Red", "Charge In"))).toBe(0);
  });

  it("does not survive the end of the Play phase", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Overcharged Battery"), card("Shove"), card("Charge In")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "END_PLAY" },
    ]);
    expect(next.thisTurn.freePlays).toBe(0);
  });

});

describe("Faceful Of Slime — 'Holding: At Turn Start, draw 1 fewer card'", () => {
  it("trims the automatic draw's target from 5 to 4", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 6), hand: [card("Faceful Of Slime")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.drewThisTurn).toBe(3);
    expect(next.Red.hand).toHaveLength(4);
  });

  it("stacks with another 'draw 1 fewer' source (Deadweight Grip)", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({
        deck: pile("Shove", 6),
        hand: [card("Faceful Of Slime"), card("Deadweight Grip")],
      }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    // Two sources: target 5 - 1 - 1 = 3, one draw short of the two already held.
    expect(next.Red.drewThisTurn).toBe(1);
    expect(next.Red.hand).toHaveLength(3);
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

  it("floors a Stuff card's Oomph at zero rather than going negative", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Rust"), card("Coil Of Cable")],
      }),
    });
    const r = ids(state, "Red");
    // Coil Of Cable is Oomph 0, so Rust's -1 would drain the pool if not floored.
    const withCard = must(state, free("Red", r[1] as CardId));
    expect(statPool(withCard.state).oomph).toBe(0);
  });
});

describe("Spore Cloud — 'Holding: At Cleanup, discard cards other than this one until you hold 3'", () => {
  it("does nothing to a hand already at or under 3", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Spore Cloud"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).toBe("Turn Start");
    expect(next.Red.hand).toHaveLength(2);
  });

  it("asks its holder to discard down to 3 at Cleanup, Spore Cloud itself not offered", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Spore Cloud"), card("Shove"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const asked = must(state, { type: "END_PLAY" });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(asked.state.phase).toBe("Cleanup");
    expect(pending.character).toBe("Red");
    expect(pending.count).toBe(1);
    // Spore Cloud still counts toward the 3, but is not an option to discard.
    expect(pending.options.map((c) => c.name)).not.toContain("Spore Cloud");
    expect(pending.options).toHaveLength(3);

    const choice = pending.options[0];
    if (!choice) throw new Error("rig");
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CARDS",
      cardIds: [choice.id],
    });
    expect(next.Red.hand).toHaveLength(3);
    expect(next.Red.hand.some((c) => c.name === "Spore Cloud")).toBe(true);
    expect(next.phase).toBe("Turn Start");
    expect(eventTypes(events)).toContain("CARD_DISCARDED");
  });

  it("stays uneraseable even holding two copies", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Spore Cloud"), card("Spore Cloud"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const asked = must(state, { type: "END_PLAY" });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    // Two Spore Clouds count toward the 3 the same as any other card, and
    // neither is offered — down to 3 leaves both plus one Shove.
    expect(pending.count).toBe(1);
    expect(pending.options.map((c) => c.name)).toEqual(["Shove", "Shove"]);

    const choice = pending.options[0];
    if (!choice) throw new Error("rig");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [choice.id] });
    expect(next.Red.hand).toHaveLength(3);
    expect(next.Red.hand.filter((c) => c.name === "Spore Cloud")).toHaveLength(2);
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

  it("adds a Scramble 2 requirement to an Oomph-only line", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    const line = state.activeRoom?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(line.stat).toBe("Oomph");
    expect(extraScrambleRequirement(state, line)).toBe(2);
  });

  it("does not add a second Scramble floor to a line that is already Scramble", () => {
    const state = playing({
      activeRoom: room("Collapsed Stairwell"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    const line = state.activeRoom?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(line.stat).toBe("Scramble");
    expect(extraScrambleRequirement(state, line)).toBe(0);
    expect(thresholdTarget(state, line)).toBe(4);
  });

  it("stacks: two Panics push the Scramble floor to 4", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Red: player({ hand: [card("Panic")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    const line = state.activeRoom?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(extraScrambleRequirement(state, line)).toBe(4);
  });

  it("blocks an Oomph line from clearing on Oomph alone while Panic is held", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      Gray: player({ hand: [card("Panic")] }),
      playZone: [
        { owner: "Red", card: card("Charge In") },
        { owner: "Red", card: card("Shove") },
      ],
    });
    const line = state.activeRoom?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(statPool(state).oomph).toBeGreaterThanOrEqual(line.value);
    expect(thresholdIsMet(state, line)).toBe(false);

    const withScramble = {
      ...state,
      playZone: [...state.playZone, { owner: "Gray" as const, card: card("Duck Under") }],
    };
    expect(thresholdIsMet(withScramble, line)).toBe(true);
  });

  it("leaves an Oomph line unaffected with no Panic held", () => {
    const state = playing({
      activeRoom: room("Gross Thing That Looks Like A Cherry"),
      playZone: [
        { owner: "Red", card: card("Charge In") },
        { owner: "Red", card: card("Shove") },
      ],
    });
    const line = state.activeRoom?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(extraScrambleRequirement(state, line)).toBe(0);
    expect(thresholdIsMet(state, line)).toBe(true);
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

describe("My Head Is Quantum Spinning — 'Holding: whenever your partner draws during Play, Exhaust 1'", () => {
  it("does not fire for Turn Start's own automatic draws", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({
        deck: pile("Shove", 6),
        hand: [card("My Head Is Quantum Spinning"), ...pile("Shove", 3)],
      }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Gray.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(5);
    expect(eventTypes(events)).not.toContain("CARD_EXHAUSTED");
  });

  it("Exhausts 1 when the partner draws during Play", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("My Head Is Quantum Spinning"), card("Grav Harness"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[1] as CardId,
      payWith: [r[2] as CardId, r[3] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCharacter") throw new Error("expected a character choice");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(3);
    expect(eventTypes(events)).toContain("CARD_EXHAUSTED");
  });

  it("does not fire for its own holder's draw", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("My Head Is Quantum Spinning"), card("Grav Harness"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[1] as CardId,
      payWith: [r[2] as CardId, r[3] as CardId],
    });
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Red" });
    expect(next.Red.deck).toHaveLength(3);
    expect(eventTypes(events)).not.toContain("CARD_EXHAUSTED");
  });

  it("is stopped by its holder's own Zen Mode", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [
          card("My Head Is Quantum Spinning"),
          card("Zen Mode"),
          card("Grav Harness"),
          card("Shove"),
          card("Shove"),
        ],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[2] as CardId,
      payWith: [r[3] as CardId, r[4] as CardId],
    });
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    expect(next.Red.deck).toHaveLength(4);
    expect(eventTypes(events)).toContain("EXHAUST_PREVENTED");
  });
});
