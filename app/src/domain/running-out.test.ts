/* Rulebook, Empty deck and Going Down.
 *
 * 0.2 drops Last Stand entirely: a draw or an Exhaust that finds the deck
 * empty first reshuffles the discard pile into a new deck (Empty deck); if the
 * discard pile is also empty, the character goes Down, and the game ends at
 * once (Going Down, Winning and losing) — not deferred to a turn boundary. */

import { beforeEach, describe, expect, it } from "vitest";
import { execute } from "./engine";
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
} from "./__fixtures__/rig";
import type { CardId, Character, GameState } from "./types";

beforeEach(resetRig);

const ids = (state: GameState, c: Character): readonly CardId[] => state[c].hand.map((x) => x.id);

describe("Empty deck", () => {
  it("'draw until you hold 5' reshuffles the discard pile when the deck runs out mid-draw", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [card("Shove"), card("Shove")], discard: pile("Charge In", 4) }),
      Gray: player({ deck: pile("Duck Under", 8) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    // 2 off the top, then the 4-card discard pile reshuffles to finish the
    // draw to 5.
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.discard).toEqual([]);
    expect(next.Red.deck).toHaveLength(1);
    expect(eventTypes(events)).toContain("DECK_RESHUFFLED");
  });

  it("reshuffles for an Exhaust the same way it does for a draw", () => {
    // Reckless Swing: "Exhaust 1." Red's deck is empty, but the discard pile
    // is not.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: [],
        hand: [card("Reckless Swing"), card("Shove")],
        discard: pile("Charge In", 3),
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(eventTypes(events)).toContain("DECK_RESHUFFLED");
    expect(eventTypes(events)).toContain("CARD_EXHAUSTED");
    expect(next.Red.exhaust).toHaveLength(1);
    // 3 discarded + 1 just paid = 4 reshuffled in, minus the 1 Exhausted.
    expect(next.Red.deck).toHaveLength(3);
    expect(next.Red.discard).toEqual([]);
    expect(next.phase).not.toBe("GameOver");
  });

  it("Exhausted cards go to the Exhaust pile, not the discard pile", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("Overdrive"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [],
    });
    expect(next.Red.exhaust).toHaveLength(2);
    expect(next.Red.discard).toEqual([]); // Overdrive costs 0 — nothing paid
  });
});

describe("Going Down", () => {
  it("'the deck and the discard pile are both empty' — a draw sends the character Down", () => {
    const state = rig({
      phase: "Flip",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: [], hand: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });

  it("'a card would be Exhausted, but the deck and discard pile are both empty'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: [], hand: [card("Pry Bar")], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Collapsed Stairwell's Flee line: one of you Exhausts 3.
    const { state: next, events } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("'going Down empties your hand into your discard pile'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Collapsed Stairwell"),
      Red: player({ deck: [], hand: [card("Pry Bar"), card("Shove")], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const { state: next } = play(state, [
      { type: "END_PLAY" },
      { type: "CHOOSE_CHARACTER", character: "Red" },
    ]);
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.discard.map((c) => c.name)).toContain("Pry Bar");
  });

  it("'either character going Down ends the run' — immediately, within the same command", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Ruptured Coolant Line"),
      Red: player({ deck: [], hand: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    // "Both of you Exhaust 1, and one of you gets Bad Stuff." Red's Exhaust
    // sends Red Down mid-resolution — before Gray's own Exhaust and Bad Stuff
    // even run — and the whole command's result already shows GameOver.
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });

  // Once either character is Down the run is already over (checked at the end
  // of every command, above), so there is no later command for a persisting
  // Down character to sit out — "takes no punishments", "no card in a Down
  // hand" and the like only ever matter within the very command that put them
  // there, alongside an effect still resolving for the other character. That
  // same-command case is walkthrough 3 in walkthroughs.test.ts.

  it("a rejected PLAY_CARD against a Down character is a value, not a state change", () => {
    // Unreachable through ordinary play (the run would already be over), but
    // `validate` still guards it defensively.
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: [], hand: [], discard: [], down: true }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const rejected = execute(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: "nope" as CardId,
      payWith: [],
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.reason.code).toBe("CharacterIsDown");
  });
});
