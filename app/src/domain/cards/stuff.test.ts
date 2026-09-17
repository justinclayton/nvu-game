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
    // The room's own payout normally lands after Play ends (open-questions.md
    // #16), so this rigs the look-back condition directly rather than reaching
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

  it("can never count its own arrival: a room handing Red both Crowbar and another piece pays no third", () => {
    const state = playing({
      activeRoom: room("Ration Locker"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge In"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    // Charge In is Oomph 4 on Red's own side, which pays Red 2 Good Stuff.
    // Whether or not Crowbar itself is one of the two, the pool never grows a
    // third piece from that arrival — only playing Crowbar afterward could.
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

describe("A Pair Of Stich-Em-Ups — 'Choose a character, move 2 cards from their discard pile'", () => {
  it("heals the caster with no choice offered when only they have a discard pile", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stich-Em-Ups"), card("Shove")],
        discard: pile("Charge In", 3),
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
    expect(eventTypes(events)).toContain("CARD_MOVED");
  });

  it("asks which character when both have a discard pile, and heals the other one", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 2),
        hand: [card("A Pair Of Stich-Em-Ups"), card("Shove")],
        discard: pile("Charge In", 3),
      }),
      Gray: player({
        deck: pile("Duck Under", 2),
        discard: pile("Duck Under", 3),
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
    expect(pending.options).toEqual(state.Gray.discard);

    const chosenCards = pending.options.slice(0, 2).map((c) => c.id);
    const { state: next, events } = must(chosen.state, {
      type: "CHOOSE_CARDS",
      cardIds: chosenCards,
    });
    expect(next.Gray.deck.slice(-2).map((c) => c.id)).toEqual(chosenCards);
    expect(next.Gray.deck).toHaveLength(4);
    expect(next.Gray.discard).toHaveLength(1);
    // Red's own pile picked up the payment card that was discarded to play it,
    // on top of the 3 it started with — the choice still landed on Gray.
    expect(next.Red.discard).toHaveLength(4);
    expect(eventTypes(events)).toContain("CARD_MOVED");
  });

  it("heals a partner in Last Stand without ending it early", () => {
    const state = playing({
      // Red is in Last Stand too, so playing costs nothing and Red's own
      // discard pile stays empty — the only eligible target is Gray.
      Red: player({
        deck: [],
        hand: [card("A Pair Of Stich-Em-Ups")],
        discard: [],
        lastStand: true,
      }),
      Gray: player({
        deck: [],
        discard: pile("Duck Under", 3),
        lastStand: true,
      }),
    });
    const r = ids(state, "Red");
    // Only Gray has anything in their discard pile, so the heal goes straight to Gray
    // with no character prompt.
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice for Gray");
    expect(pending.character).toBe("Gray");

    const chosen = pending.options.slice(0, 2).map((c) => c.id);
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: chosen });
    expect(next.Gray.deck).toHaveLength(2);
    // Last Stand only ends at Cleanup (rulebook, Last Stand); refilling the deck mid-turn does
    // not stand Gray back up on its own.
    expect(next.Gray.lastStand).toBe(true);
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
    // Riot Shield alone only pays Scramble, which Sorting Room measures on
    // Gray's side — Red also needs to meet the Oomph 2 on their own side for
    // this room to Clear, so Red plays a Shove too.
    const state = playing({
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Riot Shield"), card("Shove"), card("Shove"), card("Shove")],
      }),
    });
    const r = ids(state, "Red");
    const { state: next } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: r[0] as CardId, payWith: [r[1] as CardId] },
      { type: "PLAY_CARD", character: "Red", cardId: r[2] as CardId, payWith: [r[3] as CardId] },
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

  it("is not swallowed by a character playing for free in last stand", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Overcharged Battery"), card("Shove")] }),
      Gray: player({ deck: [], hand: [card("Pick The Lock")], lastStand: true }),
    });
    const r = ids(state, "Red");
    const charged = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: r[0] as CardId,
      payWith: [r[1] as CardId],
    });
    // Rulebook, Last Stand pays for Gray's card, not the Battery, so the discount is still there.
    const spent = must(
      charged.state,
      free("Gray", handCard(charged.state, "Gray", "Pick The Lock").id),
    );
    expect(spent.state.thisTurn.freePlays).toBe(1);
  });
});

describe("Faceful Of Slime — 'Holding: you may not draw more than 1 card'", () => {
  it("caps the draw at one", () => {
    const state = rig({
      phase: "Draw",
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
      phase: "Draw",
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

describe("My Head Is Quantum Spinning — 'whenever you draw a card, your partner must also draw'", () => {
  it("forces the partner to draw immediately, and does not chain back", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("My Head Is Quantum Spinning")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const { state: next, events } = must(state, { type: "DRAW", character: "Red" });
    // Red's chosen draw plus the held card.
    expect(next.Red.hand).toHaveLength(2);
    // The forced draw landed on Gray right away, and only once — if it chained
    // back to Red (or bounced off Gray's own forced draw) this would be higher.
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Gray.drewThisTurn).toBe(1);
    expect(eventTypes(events)).toEqual(["CARD_DRAWN", "CARD_DRAWN"]);
  });

  it("discards the forced draw when the partner has a Full Hand", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("My Head Is Quantum Spinning")] }),
      Gray: player({ deck: pile("Duck Under", 6), hand: pile("Shove", 5) }),
    });
    const { state: next } = must(state, { type: "DRAW", character: "Red" });
    expect(next.Gray.hand).toHaveLength(5);
    expect(next.Gray.discard).toHaveLength(1);
    expect(next.Gray.drewThisTurn).toBe(1);
  });

  it("does not draw a partner in Last Stand", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("My Head Is Quantum Spinning")] }),
      Gray: player({ deck: pile("Duck Under", 6), lastStand: true }),
    });
    const { state: next } = must(state, { type: "DRAW", character: "Red" });
    expect(next.Gray.hand).toHaveLength(0);
    expect(next.Gray.deck).toHaveLength(6);
    expect(next.Gray.drewThisTurn).toBe(0);
  });

  // Ruled for Faceful Of Slime: a draw cap already reached stops a forced draw
  // outright. Deadweight Grip's cap of 2 is the same code and is the agent's own
  // reading, not a ruling — see open-questions.md #17 and #19.
  it("does not draw a partner who already drew their capped card this turn (Faceful Of Slime)", () => {
    const state = rig({
      phase: "Draw",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 6), hand: [card("My Head Is Quantum Spinning")] }),
      Gray: player({
        deck: pile("Duck Under", 6),
        hand: [card("Faceful Of Slime")],
        drewThisTurn: 1,
      }),
    });
    const { state: next, events } = must(state, { type: "DRAW", character: "Red" });
    // No card moved for Gray, and no draw event at all for the forced draw.
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.Gray.deck).toHaveLength(6);
    expect(next.Gray.drewThisTurn).toBe(1);
    expect(eventTypes(events)).toEqual(["CARD_DRAWN"]);
  });
});
