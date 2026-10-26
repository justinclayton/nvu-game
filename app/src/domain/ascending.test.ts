/* Rulebook, Ascending — shuffle everything into the deck, the rewards the Stairwell
 * printed, building the next floor. Stuff a character holds stays in their deck until
 * it is Scrapped or Exhausted; nothing returns it to a pool. */

import { beforeEach, describe, expect, it } from "vitest";
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
  type Ran,
} from "./__fixtures__/rig";
import type { GameState, Room } from "./types";

beforeEach(resetRig);

/** What floor 2 is built from: tier 2's Stairwell and Rooms (tier 1's are already played). */
const SUPPLY: readonly Room[] = [
  room("Gears & Glitch"),
  room("Gears & Glitch"),
  room("Gears & Glitch"),
  room("Maintenance"),
  room("Dark Room"),
];

/** The Sentry Drone with its Oomph line printed as a plain "Ascend.", no reward. */
function bareStairwell(): Room {
  const printed = room("The Sentry Drone");
  return {
    ...printed,
    challenges: [
      {
        thresholds: [
          {
            requires: { oomph: 6, scramble: 0 },
            outcome: "Ascend.",
            clears: true,
            fleeFree: false,
            ascends: true,
            effects: [],
          },
        ],
      },
    ],
  };
}

/** A Play state facing `stairwell` with Oomph 6 in hand and the given piles. */
function atStairwell(stairwell: Room, over: Partial<GameState> = {}): GameState {
  return rig({
    phase: "Play",
    floor: 1,
    activeRoom: stairwell,
    roomSupply: SUPPLY,
    cleared: [room("The Sentry Drone")],
    Red: player({
      deck: pile("Shove", 4),
      hand: [card("Charge"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      discard: pile("Charge", 3),
    }),
    Gray: player({ deck: pile("Duck Under", 4), discard: pile("Pick The Lock", 3) }),
    ...over,
  });
}

/** Play the Oomph 8 line and end Play. */
function clearIt(state: GameState): Ran {
  const [charge, payA, payB, pryA, pryB] = state.Red.hand;
  if (!charge || !payA || !payB || !pryA || !pryB) throw new Error("rig");
  return play(state, [
    { type: "PLAY_CARD", character: "Red", cardId: charge.id, payWith: [payA.id, payB.id] },
    { type: "PLAY_CARD", character: "Red", cardId: pryA.id, payWith: [] },
    { type: "PLAY_CARD", character: "Red", cardId: pryB.id, payWith: [] },
    { type: "END_PLAY" },
  ]);
}

/** Answer each revealed card reward by taking its first card. */
function takeEvery(ran: Ran): Ran {
  let s = ran.state;
  const events = [...ran.events];
  while (s.pending?.kind === "TakeReward") {
    const first = s.pending.cards[0];
    if (!first) throw new Error("rig: an empty reward reveal");
    const next = must(s, { type: "TAKE_REWARD", cardId: first.id });
    s = next.state;
    events.push(...next.events);
  }
  return { state: s, events };
}

/** Answer each revealed card reward by taking none. */
function declineEvery(ran: Ran): Ran {
  let s = ran.state;
  const events = [...ran.events];
  while (s.pending?.kind === "TakeReward") {
    const next = must(s, { type: "TAKE_REWARD", cardId: null });
    s = next.state;
    events.push(...next.events);
  }
  return { state: s, events };
}

const liveCount = (state: GameState, c: "Red" | "Gray"): number =>
  state[c].deck.length + state[c].hand.length + state[c].discard.length + state[c].exhaust.length;

describe("Ascending, the reward comes from the outcome", () => {
  it("a Stairwell outcome that prints a card reward reveals it, and the card taken joins the deck", () => {
    const state = atStairwell(room("The Sentry Drone"));
    const asked = clearIt(state);
    expect(asked.state.phase).toBe("Outcome");
    expect(asked.state.pending?.kind).toBe("TakeReward");

    const first = asked.state.pending;
    if (first?.kind !== "TakeReward") throw new Error("expected a reward");
    const taken = first.cards[0];
    if (!taken) throw new Error("no reward revealed");
    const { state: next, events } = takeEvery(asked);

    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    expect(eventTypes(events).filter((t) => t === "REWARD_REVEALED")).toHaveLength(2);
    expect(eventTypes(events)).toContain("REWARD_TAKEN");
    const owner = first.character;
    expect(next[owner].deck.some((c) => c.id === taken.id)).toBe(true);
    expect(next.pools[owner].some((c) => c.id === taken.id)).toBe(false);
  });

  it("meeting both Sentry Drone challenges pays a reward to both, then offers both a Scrap, before Ascending", () => {
    const state = atStairwell(room("The Sentry Drone"), {
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: pile("Coil Of Cable", 3),
        discard: pile("Pick The Lock", 3),
      }),
    });
    const [charge, payA, payB, pryA, pryB] = state.Red.hand;
    if (!charge || !payA || !payB || !pryA || !pryB) throw new Error("rig");
    const played = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: charge.id, payWith: [payA.id, payB.id] },
      { type: "PLAY_CARD", character: "Red", cardId: pryA.id, payWith: [] },
      { type: "PLAY_CARD", character: "Red", cardId: pryB.id, payWith: [] },
      ...state.Gray.hand.map((c) => ({ type: "PLAY_CARD" as const, character: "Gray" as const, cardId: c.id, payWith: [] })),
      { type: "END_PLAY" },
    ]);
    const rewarded = declineEvery(played);
    expect(eventTypes(rewarded.events).filter((t) => t === "REWARD_REVEALED")).toHaveLength(2);

    const redOffer = rewarded.state.pending;
    if (redOffer?.kind !== "ChooseCards") throw new Error("expected Red's Scrap offer");
    expect(redOffer.character).toBe("Red");
    const scrapped = redOffer.options[0];
    if (!scrapped) throw new Error("rig");
    const { state: grayAsked } = must(rewarded.state, { type: "CHOOSE_CARDS", cardIds: [scrapped.id] });
    const grayOffer = grayAsked.pending;
    if (grayOffer?.kind !== "ChooseCards") throw new Error("expected Gray's Scrap offer");
    expect(grayOffer.character).toBe("Gray");

    const { state: next } = must(grayAsked, { type: "CHOOSE_CARDS", cardIds: [] });
    expect(next.floor).toBe(2);
    expect(next.scrapyard.map((c) => c.id)).toEqual([scrapped.id]);
    expect(next.Red.deck.some((c) => c.id === scrapped.id)).toBe(false);
  });

  it("the revealed reward names the Stairwell that printed it", () => {
    const { events } = clearIt(atStairwell(room("The Sentry Drone")));
    const revealed = events.filter((e) => e.type === "REWARD_REVEALED");
    expect(revealed.length).toBeGreaterThan(0);
    for (const e of revealed) expect(e.source).toBe("The Sentry Drone");
  });

  it("declining the printed reward leaves the revealed cards in the pool", () => {
    const asked = clearIt(atStairwell(room("The Sentry Drone")));
    const { state: next, events } = declineEvery(asked);
    expect(next.floor).toBe(2);
    expect(eventTypes(events)).toContain("REWARD_DECLINED");
    expect(eventTypes(events)).not.toContain("REWARD_TAKEN");
  });

  it("a Stairwell outcome that prints no reward gives none", () => {
    const state = atStairwell(bareStairwell());
    const before = { Red: state.pools.Red, Gray: state.pools.Gray };
    const { state: next, events } = clearIt(state);

    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    expect(next.pending).toBeNull();
    expect(eventTypes(events)).not.toContain("REWARD_REVEALED");
    expect(eventTypes(events)).not.toContain("REWARD_TAKEN");
    expect(next.pools.Red).toEqual(before.Red);
    expect(next.pools.Gray).toEqual(before.Gray);
  });
});

describe("Ascending, Heal and Reset", () => {
  it("hand, discard pile and Exhaust pile all go into the deck", () => {
    const inExhaust = [card("Duck Under")];
    const state = atStairwell(bareStairwell(), {
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
        discard: pile("Charge", 3),
        exhaust: inExhaust,
      }),
    });
    const total = liveCount(state, "Red");
    const { state: next, events } = clearIt(state);
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.discard).toEqual([]);
    expect(next.Red.exhaust).toEqual([]);
    expect(next.Red.deck).toHaveLength(total);
    expect(next.Red.deck.some((c) => c.id === inExhaust[0]?.id)).toBe(true);
    expect(eventTypes(events)).toContain("CARDS_SHUFFLED_IN");
  });

  it("Cleanup runs first: the play zone is discarded, then shuffled in with the rest", () => {
    const { state: next, events } = clearIt(atStairwell(bareStairwell()));
    const types = eventTypes(events);
    expect(types.indexOf("CLEANUP_BEGAN")).toBeLessThan(types.indexOf("FLOOR_CLEARED"));
    expect(next.playZone).toEqual([]);
  });
});

describe("Ascending, Stuff stays until Scrapped or Exhausted", () => {
  it("a Good Stuff card in hand and Bad Stuff in the deck both stay with their character", () => {
    const good = card("Coil Of Cable");
    const bad = card("Sluggish");
    const state = atStairwell(bareStairwell(), {
      Red: player({
        deck: [bad, ...pile("Shove", 3)],
        hand: [
          card("Charge"),
          card("Shove"),
          card("Shove"),
          card("Pry Bar"),
          card("Pry Bar"),
          good,
        ],
        discard: pile("Charge", 2),
      }),
    });
    const goodBefore = state.pools.goodStuff.length;
    const badBefore = state.pools.badStuff.length;
    const { state: next, events } = clearIt(state);
    expect(next.Red.deck.some((c) => c.id === good.id)).toBe(true);
    expect(next.Red.deck.some((c) => c.id === bad.id)).toBe(true);
    expect(next.pools.goodStuff).toHaveLength(goodBefore);
    expect(next.pools.badStuff).toHaveLength(badBefore);
    expect(eventTypes(events)).not.toContain("CARD_SCRAPPED");
  });

  it("'nothing ever leaves the Scrapyard'", () => {
    const state = atStairwell(bareStairwell(), { scrapyard: [card("Coil Of Cable")] });
    const { state: next } = clearIt(state);
    expect(next.scrapyard.map((c) => c.name)).toContain("Coil Of Cable");
  });
});

describe("Ascending, build the next floor", () => {
  it("'Setup, Floor deck' — the next floor's deck is every card printed for its tier", () => {
    const { state: next, events } = clearIt(atStairwell(bareStairwell()));
    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    expect(next.floorDeck).toHaveLength(SUPPLY.length);
    expect(next.floorDeck.every((r) => r.tier === 2)).toBe(true);
    expect(next.floorDeck.filter((r) => r.kind === "stairwell")).toHaveLength(3);
    expect(eventTypes(events)).toContain("FLOOR_BUILT");
  });

  it("ascending from floor 5 builds the Roof: The Monolith Core alone", () => {
    const state = atStairwell(bareStairwell(), {
      floor: 5,
      roomSupply: [room("The Monolith Core"), room("Gears & Glitch")],
    });
    const { state: next } = clearIt(state);
    expect(next.floor).toBe(6);
    expect(next.phase).toBe("Turn Start");
    expect(next.floorDeck.map((r) => r.name)).toEqual(["The Monolith Core"]);
  });

  // Rulebook Setup, "Floor deck": the floor deck is "the cards for that floor";
  // a tier that prints no Stairwell leaves the players no way up.
  it("a floor whose tier prints no Stairwell ends Aborted, naming the floor", () => {
    const state = atStairwell(bareStairwell(), { roomSupply: [room("Maintenance")] });
    const { state: next, events } = clearIt(state);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Aborted");
    const aborted = events.find((e) => e.type === "RUN_ABORTED");
    expect(aborted && "reason" in aborted ? aborted.reason : "").toContain("Floor 2");
  });
});

describe("Winning and losing", () => {
  // Rulebook, Winning and losing: "You win by clearing the final room on the Roof."
  it("'you win by clearing the final room on the Roof'", () => {
    const state = rig({
      phase: "Play",
      floor: 6,
      activeRoom: bareStairwell(),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Charge"), card("Shove"), card("Shove"), card("Pry Bar"), card("Pry Bar")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = state.Red.hand.map((c) => c.id);
    const [chargeIn, payA, payB, pryBar, pryBar2] = hand;
    if (!chargeIn || !payA || !payB || !pryBar || !pryBar2) throw new Error("rig");
    const { state: next, events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: chargeIn, payWith: [payA, payB] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar, payWith: [] },
      { type: "PLAY_CARD", character: "Red", cardId: pryBar2, payWith: [] },
      { type: "END_PLAY" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Victory");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});
