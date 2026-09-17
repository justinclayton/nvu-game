/* Named, reachable states for the dev-only fixture loader (`?fixture=<name>`).
 *
 * Built with the same rig helpers the domain tests use, so a fixture is a few
 * lines and cannot drift from the engine's types. Every state here is one the
 * engine actually produced: either played to from a rigged starting point, or
 * hand-set the same way the tests in `../ascending.test.ts` and
 * `../running-out.test.ts` already do for a phase, a flag, or an offer.
 *
 * Test scaffolding, not content — no vitest import here, so this stays
 * reachable from the app's dev-only bundle without pulling a test runner in.
 */

import type { GameState } from "../types";
import { card, must, pile, play, player, resetRig, rig, room } from "./rig";

export interface Fixture {
  readonly name: string;
  /** One line, shown beside the name when the list is printed. */
  readonly description: string;
  build(): GameState;
}

const SORTING_ROOM = "Sorting Room";
const CLEARED_ROOM = "Gross Thing That Looks Like A Cherry";

/** Draw phase, opening draws done, Play not yet started. */
function drawing(): GameState {
  const state = rig({
    phase: "Flip",
    floorDeck: [room(SORTING_ROOM)],
    Red: player({ deck: pile("Shove", 8) }),
    Gray: player({ deck: pile("Duck Under", 8) }),
  });
  const { state: next } = play(state, [
    { type: "FLIP_ROOM" },
    { type: "DRAW", character: "Red" },
    { type: "DRAW", character: "Gray" },
  ]);
  return next;
}

/** Play phase, both hands holding cards they can afford. */
function playing(): GameState {
  const { state } = play(drawing(), [{ type: "END_DRAW" }]);
  return state;
}

/** A pending `ChooseCharacter`: Grav Harness asks who draws. */
function choosingCharacter(): GameState {
  const state = rig({
    phase: "Play",
    activeRoom: room(CLEARED_ROOM),
    Red: player({ deck: pile("Shove", 4), hand: [card("Grav Harness"), ...pile("Shove", 5)] }),
    Gray: player({ deck: pile("Duck Under", 6) }),
  });
  const grav = state.Red.hand[0];
  if (!grav) throw new Error("rig");
  const { state: asked } = must(state, {
    type: "PLAY_CARD",
    character: "Red",
    cardId: grav.id,
    payWith: state.Red.hand.slice(1, 3).map((c) => c.id),
  });
  return asked;
}

/** A pending `ChooseCards`: Level Up asks whether to Scrap. */
function choosingCards(): GameState {
  const state = rig({
    phase: "Play",
    activeRoom: room(CLEARED_ROOM),
    Red: player({ deck: pile("Shove", 6) }),
    Gray: player({
      deck: pile("Duck Under", 3),
      hand: [card("Level Up"), card("Duck Under"), card("Duck Under"), card("Coil Of Cable")],
    }),
  });
  const hand = state.Gray.hand;
  const levelUp = hand[0];
  const payA = hand[1];
  const payB = hand[2];
  if (!levelUp || !payA || !payB) throw new Error("rig");
  const { state: asked } = must(state, {
    type: "PLAY_CARD",
    character: "Gray",
    cardId: levelUp.id,
    payWith: [payA.id, payB.id],
  });
  return asked;
}

/** Red in last stand, mid-Play, with a hand every card in it is free to play. */
function lastStand(): GameState {
  return rig({
    phase: "Play",
    activeRoom: room(SORTING_ROOM),
    Red: player({ deck: [], hand: [card("Charge In"), card("Pry Bar")], lastStand: true }),
    Gray: player({ deck: pile("Duck Under", 4) }),
  });
}

/** Both hands holding the cards with the most printed text, to check none of it clips. */
function longestText(): GameState {
  return rig({
    phase: "Play",
    activeRoom: room(SORTING_ROOM),
    Red: player({
      deck: pile("Shove", 4),
      hand: [card("Deadweight Grip"), card("Both Barrels"), card("Panic")],
    }),
    Gray: player({
      deck: pile("Duck Under", 4),
      hand: [card("Level Up"), card("My Head Is Quantum Spinning")],
    }),
  });
}

/** The Ascend phase, both reward pools revealing three cards each. */
function ascending(): GameState {
  const base = rig({
    phase: "Ascend",
    floor: 1,
    roomSupply: [
      room("Coney, The Thing In The Stairwell"),
      room("Collapsed Stairwell"),
      room("Collapsed Stairwell"),
      room("Ruptured Coolant Line"),
      ...Array.from({ length: 8 }, () => room("Sorting Room")),
    ],
    cleared: [room(CLEARED_ROOM)],
    Red: player({ deck: pile("Shove", 2), discard: [...pile("Charge In", 3), card("Pry Bar")] }),
    Gray: player({ deck: pile("Duck Under", 2), discard: pile("Pick The Lock", 3) }),
  });
  return {
    ...base,
    offer: { Red: base.pools.Red.slice(0, 3), Gray: base.pools.Gray.slice(0, 3) },
  };
}

/** Wraps a builder so every fixture starts from the same, stable card ids. */
function stable(build: () => GameState): () => GameState {
  return () => {
    resetRig();
    return build();
  };
}

/**
 * The starting set: the screens PRs most often need a picture of. Add a
 * fixture here when a PR needs a state this set lacks — a builder is a few
 * `rig` calls, played or set by hand the same way a domain test would, ending
 * wherever the screen wants to be looked at.
 */
export const FIXTURES: readonly Fixture[] = [
  { name: "draw", description: "Draw phase, both hands already holding cards.", build: stable(drawing) },
  { name: "play", description: "Play phase, a playable hand for both.", build: stable(playing) },
  {
    name: "choose-character",
    description: "Grav Harness pending a ChooseCharacter answer.",
    build: stable(choosingCharacter),
  },
  {
    name: "choose-cards",
    description: "Level Up pending a ChooseCards answer.",
    build: stable(choosingCards),
  },
  {
    name: "last-stand",
    description: "Red in last stand, mid-Play.",
    build: stable(lastStand),
  },
  {
    name: "ascend",
    description: "The Ascend phase, both reward offers revealed.",
    build: stable(ascending),
  },
  {
    name: "longest-text",
    description: "Both hands holding the cards with the most printed text.",
    build: stable(longestText),
  },
];

export const fixtureNames = (): readonly string[] => FIXTURES.map((f) => f.name);

/** Name and description only, for a listing — never the state-building function. */
export const fixtureList = (): readonly Pick<Fixture, "name" | "description">[] =>
  FIXTURES.map(({ name, description }) => ({ name, description }));

export function buildFixture(name: string): GameState | null {
  const fixture = FIXTURES.find((f) => f.name === name);
  return fixture ? fixture.build() : null;
}
