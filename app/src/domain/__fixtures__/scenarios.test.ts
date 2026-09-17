/* Every named dev fixture loads without an engine error and satisfies the
 * same invariants ../invariants.test.ts checks over a seeded run: no card
 * appears twice, and a Down character's hand is empty. */

import { describe, expect, it } from "vitest";
import type { Card, CardId, GameState } from "../types";
import { CHARACTERS } from "../verbs";
import { FIXTURES } from "./scenarios";

function allCards(state: GameState): readonly Card[] {
  const perCharacter = CHARACTERS.flatMap((c) => [
    ...state[c].deck,
    ...state[c].hand,
    ...state[c].discard,
  ]);
  return [
    ...perCharacter,
    ...state.playZone.map((p) => p.card),
    ...state.pools.Red,
    ...state.pools.Gray,
    ...state.pools.goodStuff,
    ...state.pools.badStuff,
    ...state.scrapyard,
  ];
}

const idsOf = (cards: readonly Card[]): readonly CardId[] => [...cards.map((c) => c.id)].sort();

describe("dev fixtures", () => {
  it.each(FIXTURES.map((f) => f.name))("%s loads and satisfies the engine's invariants", (name) => {
    const fixture = FIXTURES.find((f) => f.name === name);
    if (!fixture) throw new Error("rig");

    const state = fixture.build();

    const ids = idsOf(allCards(state));
    expect(new Set(ids).size).toBe(ids.length);

    for (const c of CHARACTERS) {
      if (state[c].down) expect(state[c].hand).toEqual([]);
    }
  });

  it("names are unique", () => {
    const names = FIXTURES.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
