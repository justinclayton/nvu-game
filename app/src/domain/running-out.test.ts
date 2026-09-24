/* Rulebook, Keywords: Empty deck, and Going Down — running out of cards, and the end of the run. */

import { beforeEach, describe, expect, it } from "vitest";
import {
  card,
  eventTypes,
  free,
  goingDown,
  handCard,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";

beforeEach(resetRig);

describe("Keywords: Empty deck", () => {
  it("'first shuffle your discard pile to form a new deck' — on a draw", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toEqual([]);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });

  it("'first shuffle your discard pile to form a new deck' — on an Exhaust", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: pile("Shove", 5), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Overdrive: "Exhaust 2."
    const { state: next, events } = must(
      state,
      free("Red", handCard(state, "Red", "Overdrive").id),
    );
    expect(next.Red.exhaust).toHaveLength(2);
    expect(next.Red.deck).toHaveLength(3);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });

  it("'if your discard pile is also empty, you go Down' — on a draw", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.phase).toBe("GameOver");
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("'if your discard pile is also empty, you go Down' — on an Exhaust", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Overdrive: "Exhaust 2."
    const { state: next, events } = must(
      state,
      free("Red", handCard(state, "Red", "Overdrive").id),
    );
    expect(next.phase).toBe("GameOver");
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("does not end the run while the deck runs out but the discard pile still has cards", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Smoldering Armory"),
      Red: player({ deck: pile("Shove", 2), discard: pile("Shove", 3), hand: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Smoldering Armory's Flee line, Red Exhausts 5, needs no choice — the
    // reshuffle lands in the middle of it, so the deck and discard pile run
    // out at exactly the same moment the exhaust does, never leaving Red
    // short.
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).not.toBe("GameOver");
    expect(next.Red.down).toBe(false);
    expect(next.Red.exhaust).toHaveLength(5);
  });
});

describe("Going Down", () => {
  it("'you go Down and the game is lost' — one character is enough", () => {
    const state = goingDown([card("Pry Bar")]);
    // Smoldering Armory's Flee line: Red Exhausts 5.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });

  it("'going Down empties your hand into your discard pile'", () => {
    const state = goingDown([card("Pry Bar"), card("Shove")]);
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.discard.map((c) => c.name)).toContain("Pry Bar");
  });
});

describe("Winning and losing", () => {
  it("'you lose when either character goes Down'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: pile("Duck Under", 2) }),
    });
    // Security Turnstile's Flee line, Both of you Exhaust 1, sends Red Down
    // immediately: Red's deck and discard pile are both already empty.
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});
