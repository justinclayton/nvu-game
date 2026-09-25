/* One test per entry in the Stuff registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { costOf, statPool, thresholdIsMet, thresholdRequirement } from "../queries";
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
  rig,
  room,
} from "../__fixtures__/rig";
import { takeGoodStuff } from "../verbs";
import type { CardId } from "../types";

beforeEach(resetRig);

describe("Crowbar — 'Play: if you get any Good Stuff this turn, get an additional one'", () => {
  it("does nothing when played first, before anything else has paid this turn", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Crowbar")] }),
    });
    const { state: next, events } = play(state, [
      free("Red", handCard(state, "Red", "Crowbar").id),
    ]);
    expect(eventTypes(events)).not.toContain("STUFF_TAKEN");
    expect(next.Red.hand).toEqual([]);
  });

  it("takes an extra piece when played after this character already got Good Stuff this turn", () => {
    // The room's own payout normally lands after Play ends, so this rigs the look-back condition directly rather than reaching
    // it through a room: Red has already been handed one piece this turn.
    const rigged = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Crowbar")] }),
    });
    const state = {
      ...rigged,
      thisTurn: { ...rigged.thisTurn, goodStuffTaken: { Red: 1, Gray: 0 } },
    };
    const { state: next, events } = play(state, [
      free("Red", handCard(state, "Red", "Crowbar").id),
    ]);
    expect(eventTypes(events)).toContain("STUFF_TAKEN");
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("takes the extra piece from the room's own payout at Outcome, when it saw no earlier gain", () => {
    // The primary case: Crowbar
    // played earlier in Play, with nothing yet to look back at, still catches
    // the room's own payout once Outcome hands it over — rigged through a
    // real Sorting Room clear, not by setting turn-record fields by hand.
    const state = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
    });
    const crowbar = handCard(state, "Red", "Crowbar");
    const [toPlay, toPay] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const { state: next, events } = play(state, [
      free("Red", crowbar.id), // Crowbar, cost 0, nothing to look back at yet
      { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPay.id] }, // Shove, Oomph 2
      free("Red", handCard(state, "Red", "Pry Bar").id), // Pry Bar, Oomph 3
      { type: "END_PLAY" },
    ]);
    // Security Turnstile's Oomph-5 line meets on Crowbar's own Oomph 1 plus
    // Shove's 2 plus Pry Bar's 3, and pays Red one piece at Outcome; the
    // played Crowbar catches that payout as it lands and pays a second.
    expect(eventTypes(events).filter((t) => t === "STUFF_TAKEN")).toHaveLength(2);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
  });

  it("does not fire again at Outcome once it already fired on an earlier gain", () => {
    // Once-per-copy: whichever
    // hook pays first uses up this copy's only bonus for the turn.
    const rigged = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
    });
    const state = {
      ...rigged,
      thisTurn: { ...rigged.thisTurn, goodStuffTaken: { Red: 1, Gray: 0 } },
    };
    const crowbar = handCard(state, "Red", "Crowbar");
    const [toPlay, toPay] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const { state: next } = play(state, [
      free("Red", crowbar.id), // Crowbar: fires now, at play, off the look-back
      { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPay.id] }, // Shove, Oomph 2
      free("Red", handCard(state, "Red", "Pry Bar").id), // Pry Bar, Oomph 3
      { type: "END_PLAY" }, // pays Red another piece at Outcome — Crowbar stays quiet
    ]);
    // One from the look-back bonus, one from the room's own Outcome payout —
    // never a second bonus on top.
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(2);
  });

  it("two Crowbars played by the same controller pay two extra pieces", () => {
    const state = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Crowbar"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
    });
    const [firstCrowbar, secondCrowbar] = state.Red.hand.filter((c) => c.name === "Crowbar");
    const [toPlay, toPay] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!firstCrowbar || !secondCrowbar || !toPlay || !toPay) {
      throw new Error("Red is not holding two Crowbars and two Shoves");
    }
    const { state: next } = play(state, [
      free("Red", firstCrowbar.id),
      free("Red", secondCrowbar.id),
      { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPay.id] }, // Shove, Oomph 2
      free("Red", handCard(state, "Red", "Pry Bar").id), // Pry Bar, Oomph 3
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
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
    });
    const state = {
      ...rigged,
      pools: { ...rigged.pools, goodStuff: [card("A Pair Of Stitch-Em-Ups")] },
    };
    const crowbar = handCard(state, "Red", "Crowbar");
    const [toPlay, toPay] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const { state: next, events } = play(state, [
      free("Red", crowbar.id),
      { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPay.id] },
      free("Red", handCard(state, "Red", "Pry Bar").id), // Pry Bar, Oomph 3
      { type: "END_PLAY" },
    ]);
    expect(eventTypes(events).filter((t) => t === "STUFF_TAKEN")).toHaveLength(1);
    expect(eventTypes(events).filter((t) => t === "STUFF_POOL_EMPTY")).toHaveLength(1);
    expect(next.Red.hand.filter((c) => c.kind === "good_stuff")).toHaveLength(1);
  });

  it("does not fire on its own arrival: a room handing Red Crowbar itself pays no bonus", () => {
    // Security Turnstile's Oomph 5 line draws face down from the Good Stuff
    // pool; rig that draw to be Crowbar itself. Crowbar arriving unplayed is
    // not Crowbar being played, so its own bonus never fires.
    const rigged = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge In"), card("Shove"), card("Shove"), card("Pry Bar")],
      }),
    });
    const state = { ...rigged, pools: { ...rigged.pools, goodStuff: [card("Crowbar")] } };
    const chargeIn = handCard(state, "Red", "Charge In");
    const payWith = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: chargeIn.id,
        payWith,
      },
      free("Red", handCard(state, "Red", "Pry Bar").id),
      { type: "END_PLAY" },
    ]);
    const stuff = next.Red.hand.filter((c) => c.kind === "good_stuff");
    expect(stuff).toHaveLength(1);
    expect(stuff[0]?.name).toBe("Crowbar");
  });
});

describe("A Pair Of Stitch-Em-Ups — 'Choose a character, move 2 cards from their Exhaust pile'", () => {
  it("heals the caster with no choice offered when only they have an Exhaust pile", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stitch-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 3),
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "A Pair Of Stitch-Em-Ups").id,
      payWith: [handCard(state, "Red", "Shove").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards")
      throw new Error("expected a card choice, no character prompt");
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
        hand: [card("A Pair Of Stitch-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 3),
      }),
      Gray: player({
        deck: pile("Duck Under", 2),
        exhaust: pile("Duck Under", 3),
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "A Pair Of Stitch-Em-Ups").id,
      payWith: [handCard(state, "Red", "Shove").id],
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
        hand: [card("A Pair Of Stitch-Em-Ups"), card("Shove")],
        exhaust: pile("Charge In", 1),
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "A Pair Of Stitch-Em-Ups").id,
      payWith: [handCard(state, "Red", "Shove").id],
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
    const grav = handCard(state, "Red", "Grav Harness");
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
    const grav = handCard(state, "Red", "Grav Harness");
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

  it("still offers a character whose deck is empty but whose discard is not", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Grav Harness"), ...pile("Shove", 5)] }),
      Gray: player({ deck: [], discard: pile("Duck Under", 3) }),
    });
    const grav = state.Red.hand[0];
    if (!grav) throw new Error("rig");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: grav.id,
      payWith: state.Red.hand.slice(1, 3).map((c) => c.id),
    });
    if (asked.state.pending?.kind !== "ChooseCharacter") throw new Error("rig");
    // Rulebook, Keywords: Empty deck — an empty deck with cards still in the
    // discard pile reshuffles rather than being unable to draw.
    expect(asked.state.pending.options).toContain("Gray");

    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(eventTypes(events)).toEqual(["DISCARD_RESHUFFLED", "CARD_DRAWN"]);
    expect(next.Gray.deck).toHaveLength(2);
    expect(next.Gray.discard).toHaveLength(0);
  });

  it("skips the question when only one side is eligible, and draws for them directly", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Grav Harness"), ...pile("Shove", 5)] }),
      Gray: player({ down: true }),
    });
    const grav = state.Red.hand[0];
    if (!grav) throw new Error("rig");
    const { state: next, events } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: grav.id,
        payWith: state.Red.hand.slice(1, 3).map((c) => c.id),
      },
    ]);
    expect(next.pending).toBeNull();
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Red.deck).toHaveLength(3);
  });
});

describe("Riot Shield — 'If the room is Cleared, return this to your hand at the end of the turn'", () => {
  it("comes back to hand when the room is Cleared", () => {
    // Riot Shield's Scramble 3 alone meets Sorting Room's Scramble 2 line —
    // every Challenge reads the shared pool, so it does not matter that Red
    // is the one playing it while the line pays Gray.
    const state = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 1),
        hand: [card("Riot Shield"), card("Shove")],
      }),
    });
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Riot Shield").id,
        payWith: [handCard(state, "Red", "Shove").id],
      },
      { type: "END_PLAY" },
    ]);
    expect(next.cleared).toHaveLength(1);
    expect(next.Red.hand.some((c) => c.name === "Riot Shield")).toBe(true);
    expect(next.Red.discard.some((c) => c.name === "Riot Shield")).toBe(false);
  });

  it("is discarded with the play zone when the room is Fled", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Riot Shield"), card("Shove")] }),
    });
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Riot Shield").id,
        payWith: [handCard(state, "Red", "Shove").id],
      },
      { type: "END_PLAY" },
    ]);
    expect(next.Red.hand.some((c) => c.name === "Riot Shield")).toBe(false);
    expect(next.Red.discard.some((c) => c.name === "Riot Shield")).toBe(true);
  });

  it("is back in hand in time for Spore Cloud's Cleanup discard to count and offer it", () => {
    // Rules ruling (#149): Riot Shield's return fires at the end of the Play
    // phase, ahead of Cleanup, so a holder's Spore Cloud sees it in hand.
    const state = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({
        deck: pile("Shove", 3),
        hand: [
          card("Riot Shield"),
          card("Spore Cloud"),
          card("Shove"),
          card("Shove"),
          card("Shove"),
        ],
      }),
    });
    const asked = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Riot Shield").id,
        payWith: [handCard(state, "Red", "Shove").id],
      },
      { type: "END_PLAY" },
    ]).state;
    expect(asked.cleared).toHaveLength(1);
    // Hand going into Cleanup: Spore Cloud, Shove, Shove, Riot Shield — 4
    // cards, one over the limit.
    const pending = asked.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.count).toBe(1);
    expect(pending.options.map((c) => c.name).sort()).toEqual(["Riot Shield", "Shove", "Shove"]);
  });
});

describe("Overcharged Battery — 'The next card played this turn is played for free'", () => {
  it("makes the next card free, and only the next one", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Overcharged Battery"), card("Shove"), card("Charge In"), card("Charge In")],
      }),
    });
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overcharged Battery").id,
      payWith: [handCard(state, "Red", "Shove").id],
    });
    const [first, second] = charged.state.Red.hand.filter((c) => c.name === "Charge In");
    if (!first || !second) throw new Error("Red is not holding two Charge Ins");
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
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overcharged Battery").id,
      payWith: [handCard(state, "Red", "Shove").id],
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
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Overcharged Battery").id,
      payWith: [handCard(state, "Red", "Shove").id],
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
    const { state: next } = play(state, [
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: handCard(state, "Red", "Overcharged Battery").id,
        payWith: [handCard(state, "Red", "Shove").id],
      },
      { type: "END_PLAY" },
    ]);
    expect(next.thisTurn.freePlays).toBe(0);
  });
});

describe("Stim Pack — 'Play: Draw 1 card'", () => {
  it("draws the player who played it a card", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Stim Pack")] }),
    });
    const r = ids(state, "Red");
    const { state: next, events } = must(state, free("Red", r[0] as CardId));
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Red.hand).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("High-Frequency Scanner — 'Play: Look at the top 3 cards of the Floor deck'", () => {
  it("reveals the top of the Floor deck and puts it back untouched", () => {
    const first = room("Security Turnstile");
    const second = room("Flooded Ventilation Shaft");
    const state = playing({
      floorDeck: [first, second],
      Red: player({ deck: pile("Shove", 3), hand: [card("High-Frequency Scanner"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    const peeked = events.find((e) => e.type === "CARDS_PEEKED");
    if (peeked?.type !== "CARDS_PEEKED") throw new Error("expected a peek");
    expect(peeked.pile).toBe("Floor deck");
    expect(peeked.cards.map((r) => r.id)).toEqual([first.id, second.id]);
    // Nothing about the deck changes: it is a look, not a draw or a reorder.
    expect(next.floorDeck).toEqual(state.floorDeck);
  });

  it("shows fewer than 3 when the Floor deck holds fewer", () => {
    const only = room("Security Turnstile");
    const state = playing({
      floorDeck: [only],
      Red: player({ deck: pile("Shove", 3), hand: [card("High-Frequency Scanner"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    const peeked = events.find((e) => e.type === "CARDS_PEEKED");
    if (peeked?.type !== "CARDS_PEEKED") throw new Error("expected a peek");
    expect(peeked.cards).toHaveLength(1);
  });
});

describe("Scrap Magnet — 'Play: Scrap 1 Bad Stuff card from your hand. If you do, gain 2 Oomph or 2 Scramble.'", () => {
  it("does nothing, and asks nothing, with no Bad Stuff in hand", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Scrap Magnet")] }),
    });
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Scrap Magnet").id));
    expect(next.pending).toBeNull();
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
    expect(statPool(next)).toEqual({ oomph: 0, scramble: 0 });
  });

  it("Scraps the chosen Bad Stuff, then gains the chosen stat", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Scrap Magnet"), card("Rust")] }),
    });
    const asked = must(state, free("Red", handCard(state, "Red", "Scrap Magnet").id));
    const cardChoice = asked.state.pending;
    if (cardChoice?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(cardChoice.options.map((c) => c.name)).toEqual(["Rust"]);
    const rust = cardChoice.options[0];
    if (!rust) throw new Error("rig");

    const scrapped = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [rust.id] });
    expect(eventTypes(scrapped.events)).toContain("CARD_SCRAPPED");
    expect(scrapped.state.Red.hand.some((c) => c.name === "Rust")).toBe(false);
    expect(scrapped.state.scrapyard.some((c) => c.name === "Rust")).toBe(true);
    const statChoice = scrapped.state.pending;
    if (statChoice?.kind !== "ChooseStat") throw new Error("expected a stat choice");
    expect(statChoice.options).toEqual(["Oomph", "Scramble"]);

    const { state: next } = must(scrapped.state, { type: "CHOOSE_STAT", stat: "Oomph" });
    expect(statPool(next)).toEqual({ oomph: 2, scramble: 0 });
  });

  it("gains Scramble instead when Scramble is chosen", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Scrap Magnet"), card("Torn Seal")] }),
    });
    const asked = must(state, free("Red", handCard(state, "Red", "Scrap Magnet").id));
    const cardChoice = asked.state.pending;
    if (cardChoice?.kind !== "ChooseCards") throw new Error("expected a card choice");
    const tornSeal = cardChoice.options[0];
    if (!tornSeal) throw new Error("rig");
    const scrapped = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [tornSeal.id] });

    const { state: next } = must(scrapped.state, { type: "CHOOSE_STAT", stat: "Scramble" });
    expect(statPool(next)).toEqual({ oomph: 0, scramble: 2 });
  });
});

describe("Pocket Dynamo — 'Play: Draw 1 card. If both you and your partner played a card this turn, gain 1 Oomph and 1 Scramble.'", () => {
  it("draws a card and grants nothing when the partner never plays this turn", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pocket Dynamo")] }),
    });
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Pocket Dynamo").id));
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Red.hand).toHaveLength(1);
    expect(statPool(next)).toEqual({ oomph: 0, scramble: 0 });
  });

  it("grants the bonus right away when the partner already played this turn", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pocket Dynamo")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const [gray1, gray2] = state.Gray.hand;
    if (!gray1 || !gray2) throw new Error("Gray is not holding two Duck Unders");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Gray", cardId: gray1.id, payWith: [gray2.id] },
      free("Red", handCard(state, "Red", "Pocket Dynamo").id),
    ]);
    // Asserted on the banked bonus itself, not the shared pool: Duck Under's
    // own printed Scramble 2 also lands in that pool and would muddy this.
    expect(next.thisTurn.poolBonus).toEqual({ oomph: 1, scramble: 1 });
  });

  it("grants the bonus once the partner plays afterward, not before", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pocket Dynamo")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Duck Under"), card("Duck Under")] }),
    });
    const afterDynamo = must(state, free("Red", handCard(state, "Red", "Pocket Dynamo").id));
    expect(afterDynamo.state.thisTurn.poolBonus).toEqual({ oomph: 0, scramble: 0 });

    const [gray1, gray2] = state.Gray.hand;
    if (!gray1 || !gray2) throw new Error("Gray is not holding two Duck Unders");
    const { state: next } = must(afterDynamo.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: gray1.id,
      payWith: [gray2.id],
    });
    expect(next.thisTurn.poolBonus).toEqual({ oomph: 1, scramble: 1 });
  });

  it("pays out only once even when the partner plays twice", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Pocket Dynamo")] }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Duck Under"), card("Duck Under"), card("Duck Under"), card("Duck Under")],
      }),
    });
    const afterDynamo = must(state, free("Red", handCard(state, "Red", "Pocket Dynamo").id));
    const [g1, g2, g3, g4] = state.Gray.hand;
    if (!g1 || !g2 || !g3 || !g4) throw new Error("Gray is not holding four Duck Unders");
    const step1 = must(afterDynamo.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g1.id,
      payWith: [g2.id],
    });
    expect(step1.state.thisTurn.poolBonus).toEqual({ oomph: 1, scramble: 1 });
    const step2 = must(step1.state, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: g3.id,
      payWith: [g4.id],
    });
    expect(step2.state.thisTurn.poolBonus).toEqual({ oomph: 1, scramble: 1 });
  });
});

describe("Salvaged Blueprint — 'Play: Draw 2 cards, then place 1 card from your hand on top of your deck.'", () => {
  it("draws 2, then places the chosen card on top of the deck", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 5), hand: [card("Salvaged Blueprint"), card("Pry Bar")] }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Salvaged Blueprint").id,
      payWith: [handCard(state, "Red", "Pry Bar").id],
    });
    expect(asked.state.Red.hand).toHaveLength(2);
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.count).toBe(1);
    expect(pending.options).toHaveLength(2);

    const chosen = pending.options[0];
    if (!chosen) throw new Error("rig");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [chosen.id] });
    expect(eventTypes(events)).toContain("CARD_MOVED");
    expect(next.Red.hand).toHaveLength(1);
    expect(next.Red.hand.some((c) => c.id === chosen.id)).toBe(false);
    expect(next.Red.deck[0]?.id).toBe(chosen.id);
    expect(next.Red.deck).toHaveLength(4);
  });
});

describe("Emergency Breaker — 'Play: Scrap 1 card from your hand. Your partner draws 1 card.'", () => {
  it("asks which card to Scrap, then draws the partner a card", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Emergency Breaker"), card("Pry Bar"), card("Rust")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Emergency Breaker").id,
      payWith: [handCard(state, "Red", "Pry Bar").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Rust"]);
    const rust = pending.options[0];
    if (!rust) throw new Error("rig");

    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [rust.id] });
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
    expect(next.scrapyard.some((c) => c.name === "Rust")).toBe(true);
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Gray.hand).toHaveLength(1);
  });

  it("still draws the partner a card when the hand is already empty", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Emergency Breaker"), card("Pry Bar")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Emergency Breaker").id,
      payWith: [handCard(state, "Red", "Pry Bar").id],
    });
    expect(next.pending).toBeNull();
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Gray.hand).toHaveLength(1);
  });
});

describe("Automated Salvage Kit — 'Play: Scrap 1 Bad Stuff card from your hand or discard pile'", () => {
  it("offers Bad Stuff from hand and from the discard pile together", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Automated Salvage Kit"), card("Rust"), card("Shove")],
        discard: [card("Sluggish")],
      }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[2] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name).sort()).toEqual(["Rust", "Sluggish"]);

    const rust = pending.options.find((c) => c.name === "Rust");
    if (!rust) throw new Error("rig");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [rust.id] });
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
    expect(next.Red.hand.some((c) => c.name === "Rust")).toBe(false);
    expect(next.scrapyard.some((c) => c.name === "Rust")).toBe(true);
    // The discard pile's Sluggish is untouched.
    expect(next.Red.discard.some((c) => c.name === "Sluggish")).toBe(true);
  });

  it("does nothing when there is no Bad Stuff to Scrap", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Automated Salvage Kit"), card("Shove")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    expect(next.pending).toBeNull();
    expect(next.scrapyard).toEqual([]);
  });
});

describe("Emergency Power Core — 'Exhaust 2'", () => {
  it("takes two off the top of your own deck, into the Exhaust pile", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Emergency Power Core")] }),
    });
    const r = ids(state, "Red");
    const { state: next } = must(state, free("Red", r[0] as CardId));
    expect(next.Red.deck).toHaveLength(2);
    expect(next.Red.exhaust).toHaveLength(2);
  });
});

describe("Faceful Of Slime — 'Holding: At Turn Start, draw 1 fewer card'", () => {
  it("trims the automatic draw's target from 5 to 4", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: pile("Shove", 6), hand: [card("Faceful Of Slime")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.drewThisTurn).toBe(3);
    expect(next.Red.hand).toHaveLength(4);
  });

  it("stacks with another copy of the same source", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({
        deck: pile("Shove", 6),
        hand: pile("Faceful Of Slime", 2),
      }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next } = must(state, { type: "FLIP_ROOM" });
    // Two held copies: target 5 - 1 - 1 = 3, one draw short of the two already held.
    expect(next.Red.drewThisTurn).toBe(1);
    expect(next.Red.hand).toHaveLength(3);
  });
});

describe("Rust — 'Holding: Stuff cards you play have -1 Oomph and -1 Scramble'", () => {
  it("takes 1 off both of a Stuff card's stats, and leaves other cards alone", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Rust"), card("Coil Of Cable"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const withStuff = must(state, free("Red", r[1] as CardId));
    // Coil Of Cable is Scramble 3, less 1 while the Rust is held.
    expect(statPool(withStuff.state)).toEqual({ oomph: 0, scramble: 2 });

    const [toPlay, toPay] = withStuff.state.Red.hand.filter((c) => c.name === "Shove");
    if (!toPlay || !toPay) throw new Error("Red is not holding two Shoves");
    const withCard = must(withStuff.state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: toPlay.id,
      payWith: [toPay.id],
    });
    // Shove is Oomph 2 and is not Stuff.
    expect(statPool(withCard.state)).toEqual({ oomph: 2, scramble: 2 });
  });

  it("floors a Stuff card's stats at zero rather than going negative", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Rust"), card("Pry Bar"), card("Coil Of Cable")],
      }),
    });
    const r = ids(state, "Red");
    // Pry Bar (Oomph 3, Scramble 0) and Coil Of Cable (Oomph 0, Scramble 3)
    // each have one stat Rust's -1 would drive negative if not floored.
    const withPryBar = must(state, free("Red", r[1] as CardId));
    expect(statPool(withPryBar.state)).toEqual({ oomph: 2, scramble: 0 });

    const withBoth = must(withPryBar.state, free("Red", r[2] as CardId));
    expect(statPool(withBoth.state)).toEqual({ oomph: 2, scramble: 2 });
  });
});

describe("Spore Cloud — 'Holding: At Cleanup, discard cards other than this one until you hold 3'", () => {
  it("does nothing to a hand already at or under 3", () => {
    const state = playing({
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: pile("Shove", 3), hand: [card("Spore Cloud"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).toBe("Turn Start");
    expect(next.Red.hand).toHaveLength(2);
  });

  it("asks its holder to discard down to 3 at Cleanup, Spore Cloud itself not offered", () => {
    const state = playing({
      activeRoom: room("Security Turnstile"),
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
    if (!choice) throw new Error("nothing offered to discard");
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
      activeRoom: room("Security Turnstile"),
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
    if (!choice) throw new Error("nothing offered to discard");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [choice.id] });
    expect(next.Red.hand).toHaveLength(3);
    expect(next.Red.hand.filter((c) => c.name === "Spore Cloud")).toHaveLength(2);
  });
});

describe("Panic — 'Holding: every room threshold requires +2 Scramble to be met'", () => {
  it("raises every Scramble threshold while it is held, in either hand", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    // Challenge 1: Scramble 6.
    const line = state.activeRoom?.challenges[1]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(line.requires).toEqual({ oomph: 0, scramble: 6 });
    expect(thresholdRequirement(state, line)).toEqual({ oomph: 0, scramble: 8 });
  });

  it("adds a Scramble 2 requirement to an Oomph-only line", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    // Challenge 0: Oomph 6, no printed Scramble.
    const line = state.activeRoom?.challenges[0]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(line.requires).toEqual({ oomph: 6, scramble: 0 });
    expect(thresholdRequirement(state, line)).toEqual({ oomph: 6, scramble: 2 });
  });

  it("adds to a dual threshold's own printed Scramble, not a second floor", () => {
    const state = playing({
      activeRoom: room("Flooded Ventilation Shaft"),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    // Challenge 1: Oomph 3 and Scramble 3 together.
    const line = state.activeRoom?.challenges[1]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(line.requires).toEqual({ oomph: 3, scramble: 3 });
    expect(thresholdRequirement(state, line)).toEqual({ oomph: 3, scramble: 5 });
  });

  it("stacks: two Panics push the Scramble floor to 4", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      Red: player({ hand: [card("Panic")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Panic")] }),
    });
    const line = state.activeRoom?.challenges[0]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(thresholdRequirement(state, line)).toEqual({ oomph: 6, scramble: 4 });
  });

  it("blocks an Oomph line from clearing on Oomph alone while Panic is held", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      Gray: player({ hand: [card("Panic")] }),
      playZone: [
        { owner: "Red", card: card("Charge In") },
        { owner: "Red", card: card("Charge In") },
      ],
    });
    const line = state.activeRoom?.challenges[0]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(statPool(state).oomph).toBeGreaterThanOrEqual(line.requires.oomph);
    expect(thresholdIsMet(state, line)).toBe(false);

    const withScramble = {
      ...state,
      playZone: [...state.playZone, { owner: "Gray" as const, card: card("Duck Under") }],
    };
    expect(thresholdIsMet(withScramble, line)).toBe(true);
  });

  it("leaves an Oomph line unaffected with no Panic held", () => {
    const state = playing({
      activeRoom: room("The Sentry Drone"),
      playZone: [
        { owner: "Red", card: card("Charge In") },
        { owner: "Red", card: card("Charge In") },
      ],
    });
    const line = state.activeRoom?.challenges[0]?.thresholds[0];
    if (!line) throw new Error("rig");
    expect(thresholdRequirement(state, line)).toEqual({ oomph: 6, scramble: 0 });
    expect(thresholdIsMet(state, line)).toBe(true);
  });

  it("Exhausts 2 when it is played", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Panic"), card("Shove"), card("Shove")],
      }),
    });
    const payWith = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Panic").id,
      payWith,
    });
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("My Head Is Quantum Spinning — 'Holding: whenever your partner draws during Play, Exhaust 1'", () => {
  it("does not fire for Turn Start's own automatic draws", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
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
        hand: [
          card("My Head Is Quantum Spinning"),
          card("Grav Harness"),
          card("Shove"),
          card("Shove"),
        ],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const grav = handCard(state, "Red", "Grav Harness");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: grav.id,
      payWith: shoves,
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCharacter") throw new Error("expected a character choice");
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(3);
    expect(eventTypes(events)).toContain("CARD_EXHAUSTED");
  });

  it("does not fire for its own holder's draw", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [
          card("My Head Is Quantum Spinning"),
          card("Grav Harness"),
          card("Shove"),
          card("Shove"),
        ],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const grav = handCard(state, "Red", "Grav Harness");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: grav.id,
      payWith: shoves,
    });
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CHARACTER",
      character: "Red",
    });
    expect(next.Red.deck).toHaveLength(3);
    expect(eventTypes(events)).not.toContain("CARD_EXHAUSTED");
  });
});

describe("Corrosive Acid — 'Holding: At Turn Start, Exhaust 1. Play: Scrap 1 Good Stuff card from your hand.'", () => {
  it("Exhausts 1 at Turn Start, once the draw is done", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: pile("Shove", 6), hand: [card("Corrosive Acid")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toHaveLength(1);
    expect(next.Red.exhaust).toHaveLength(1);
    expect(eventTypes(events)).toContain("CARD_EXHAUSTED");
  });

  it("Scraps a chosen Good Stuff card from hand when played", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Corrosive Acid"), card("Pry Bar"), card("Shove"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[2] as CardId, r[3] as CardId, r[4] as CardId],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Pry Bar"]);
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("rig");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
    expect(next.Red.hand.some((c) => c.name === "Pry Bar")).toBe(false);
    expect(next.scrapyard.some((c) => c.name === "Pry Bar")).toBe(true);
  });

  it("does nothing when played with no Good Stuff in hand", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Corrosive Acid"), card("Shove"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId, r[2] as CardId, r[3] as CardId],
    });
    expect(next.pending).toBeNull();
  });
});

describe("System Feedback — 'Holding: Whenever you play a card with Cost 0, lose 1 Oomph and 1 Scramble from the Stat pool this turn.'", () => {
  it("loses 1 Oomph and 1 Scramble, cumulatively, for each Cost-0 card the holder plays", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("System Feedback"), card("Pry Bar"), card("Coil Of Cable")],
      }),
    });
    const r = ids(state, "Red");
    // Pry Bar and Coil Of Cable are both Cost 0.
    const one = must(state, free("Red", r[1] as CardId));
    expect(statPool(one.state)).toEqual({ oomph: 2, scramble: 0 });

    const two = must(one.state, free("Red", r[2] as CardId));
    expect(statPool(two.state)).toEqual({ oomph: 1, scramble: 1 });
  });

  it("floors the shared pool at zero rather than going negative", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("System Feedback"), card("Coil Of Cable")] }),
    });
    const r = ids(state, "Red");
    const next = must(state, free("Red", r[1] as CardId));
    // Coil Of Cable's own Scramble 3, less System Feedback's 1, is still
    // positive; Oomph has nothing to lose and stays at zero.
    expect(statPool(next.state)).toEqual({ oomph: 0, scramble: 2 });
  });

  it("does not fire for a card that costs more than 0", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("System Feedback"), card("Charge In"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const next = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[1] as CardId,
      payWith: [r[2] as CardId, r[3] as CardId],
    });
    expect(statPool(next.state)).toEqual({ oomph: 4, scramble: 0 });
  });
});

describe("Stuff pools are ordered piles", () => {
  it("gains off the top with no reshuffle, so a reorder decides what comes next", () => {
    const state = rig({
      Red: player({ deck: pile("Shove", 4) }),
      pools: { Red: [], Gray: [], goodStuff: pile("Stim Pack", 3), badStuff: [] },
    });
    const reordered = [...state.pools.goodStuff].reverse();
    const seed = state.seed;
    const next = takeGoodStuff({ ...state, pools: { ...state.pools, goodStuff: reordered } }, "Red", 1, []);
    expect(next.Red.hand.map((c) => c.id)).toEqual([reordered[0]?.id]);
    expect(next.pools.goodStuff.map((c) => c.id)).toEqual(reordered.slice(1).map((c) => c.id));
    // No shuffle happened, so the seed is untouched.
    expect(next.seed).toBe(seed);
  });
});
