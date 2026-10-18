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

const SUPPLY: readonly Room[] = [
  room("The Sentry Drone"),
  ...Array.from({ length: 8 }, () => room("Security Turnstile")),
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

/** Play the Oomph 6 line and end Play. */
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
  it("'Setup, Floor deck' — one fewer room than last time", () => {
    const { state: next, events } = clearIt(atStairwell(bareStairwell()));
    expect(next.floor).toBe(2);
    expect(next.phase).toBe("Turn Start");
    const kinds = next.floorDeck.map((r) => r.kind);
    expect(kinds.filter((k) => k === "stairwell")).toHaveLength(1);
    expect(next.floorDeck).toHaveLength(9);
    expect(eventTypes(events)).toContain("FLOOR_BUILT");
  });
});

describe("Winning and losing", () => {
  it("'you win by clearing floor 10's Stairwell'", () => {
    const state = rig({
      phase: "Play",
      floor: 10,
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
