/* Named, reachable states for the dev-only fixture loader (`?fixture=<name>`).
 *
 * Built with the same rig helpers the domain tests use, so a fixture is a few
 * lines and cannot drift from the engine's types. Every state here is one the
 * engine actually produced: either played to from a rigged starting point, or
 * hand-set the same way the tests in `../ascending.test.ts` and
 * `../going-down.test.ts` already do for a phase, a flag, or an offer.
 *
 * Test scaffolding, not content — no vitest import here, so this stays
 * reachable from the app's dev-only bundle without pulling a test runner in.
 */

import type { DomainEvent, GameState } from "../types";
import { card, must, pile, play, player, resetRig, rig, room, type Ran } from "./rig";

export interface Fixture {
  readonly name: string;
  /** One line, shown beside the name when the list is printed. */
  readonly description: string;
  build(): GameState;
  /**
   * The narrated events leading to `build()`'s state, for a screen that needs
   * the log itself to be looked at. Most fixtures leave the log empty — it is
   * cheaper to park on the state directly than to replay into it.
   */
  events?(): readonly DomainEvent[];
}

const SORTING_ROOM = "Sorting Room";
const CLEARED_ROOM = "Gross Thing That Looks Like A Cherry";

/** Play phase, just flipped: both hands already drawn to 5 (Turn Start runs both steps at once). */
function playing(): GameState {
  const state = rig({
    phase: "Turn Start",
    floorDeck: [room(SORTING_ROOM)],
    Red: player({ deck: pile("Shove", 8) }),
    Gray: player({ deck: pile("Duck Under", 8) }),
  });
  const { state: next } = play(state, [{ type: "FLIP_ROOM" }]);
  return next;
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

/** A pending `ChooseCharacter` raised at Outcome: Collapsed Stairwell's higher line reveals a reward. */
function outcomeChoice(): GameState {
  const state = rig({
    phase: "Play",
    activeRoom: room("Collapsed Stairwell"),
    Red: player({ deck: pile("Shove", 5) }),
    Gray: player({
      deck: pile("Duck Under", 5),
      hand: [card("Coil Of Cable"), card("Coil Of Cable")],
    }),
  });
  const [first, second] = state.Gray.hand;
  if (!first || !second) throw new Error("rig");
  const { state: asked } = play(state, [
    { type: "PLAY_CARD", character: "Gray", cardId: first.id, payWith: [] },
    { type: "PLAY_CARD", character: "Gray", cardId: second.id, payWith: [] },
    { type: "END_PLAY" },
  ]);
  return asked;
}

/** A pending `ChooseCards` raised at Cleanup: Spore Cloud's own discard question. */
function cleanupChoice(): GameState {
  const state = rig({
    phase: "Play",
    activeRoom: room(CLEARED_ROOM),
    Red: player({
      deck: pile("Shove", 3),
      hand: [card("Spore Cloud"), card("Shove"), card("Shove"), card("Shove")],
    }),
    Gray: player({ deck: pile("Duck Under", 3) }),
  });
  const { state: asked } = must(state, { type: "END_PLAY" });
  return asked;
}

/** Fast Follow priced free despite Sluggish's +1, once Gray has played a card. */
function fastFollowFree(): GameState {
  const state = rig({
    phase: "Play",
    activeRoom: room(CLEARED_ROOM),
    Red: player({
      deck: pile("Shove", 4),
      hand: [card("Fast Follow"), card("Sluggish"), ...pile("Shove", 3)],
    }),
    Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
  });
  const grayCard = state.Gray.hand[0];
  if (!grayCard) throw new Error("rig");
  const { state: next } = must(state, {
    type: "PLAY_CARD",
    character: "Gray",
    cardId: grayCard.id,
    payWith: [],
  });
  return next;
}

/** The run lost: Red went Down, which ended it on the spot (rulebook, Going Down). */
function gameOver(): GameState {
  return rig({
    phase: "GameOver",
    outcome: "Defeat",
    Red: player({ deck: [], hand: [], discard: pile("Shove", 3), down: true }),
    Gray: player({ deck: pile("Duck Under", 4), hand: pile("Duck Under", 2) }),
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

/**
 * Play phase: Sorting Room's Oomph 2 line owes Red a Good Stuff, but the pool
 * is dry. The reward line still prints, followed by the pool-empty line
 * rather than paying out in silence.
 */
function emptyGoodStuffPool(): Ran {
  const state = rig({
    phase: "Play",
    activeRoom: room(SORTING_ROOM),
    Red: player({ deck: pile("Shove", 5), hand: [card("Shove"), card("Shove")] }),
    Gray: player({ deck: pile("Duck Under", 5) }),
  });
  const dry = { ...state, pools: { ...state.pools, goodStuff: [] } };
  const [toPlay, toPayWith] = dry.Red.hand;
  if (!toPlay || !toPayWith) throw new Error("rig");
  return play(dry, [
    { type: "PLAY_CARD", character: "Red", cardId: toPlay.id, payWith: [toPayWith.id] },
    { type: "END_PLAY" },
  ]);
}

/** Wraps a builder so every fixture starts from the same, stable card ids. */
function stable(build: () => GameState): () => GameState {
  return () => {
    resetRig();
    return build();
  };
}

/** Same, for a builder whose events matter as much as the state it ends on. */
function stableRan(build: () => Ran): () => Ran {
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
  {
    name: "play",
    description: "Play phase, just flipped: both hands drawn to 5.",
    build: stable(playing),
  },
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
    name: "outcome-choice",
    description: "A room's ChooseCharacter pending at Outcome (who reveals the reward).",
    build: stable(outcomeChoice),
  },
  {
    name: "cleanup-choice",
    description: "Spore Cloud's own ChooseCards pending at Cleanup.",
    build: stable(cleanupChoice),
  },
  {
    name: "fast-follow-free",
    description: "Fast Follow priced free despite Sluggish's +1, once Gray has played.",
    build: stable(fastFollowFree),
  },
  {
    name: "game-over",
    description: "Red went Down, which ended the run on the spot.",
    build: stable(gameOver),
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
  (() => {
    const ran = stableRan(emptyGoodStuffPool);
    return {
      name: "empty-good-stuff",
      description: "A met reward line pays nothing from an empty Good Stuff pool.",
      build: () => ran().state,
      events: () => ran().events,
    };
  })(),
];

export const fixtureNames = (): readonly string[] => FIXTURES.map((f) => f.name);

/** Name and description only, for a listing — never the state-building function. */
export const fixtureList = (): readonly Pick<Fixture, "name" | "description">[] =>
  FIXTURES.map(({ name, description }) => ({ name, description }));

export function buildFixture(name: string): GameState | null {
  const fixture = FIXTURES.find((f) => f.name === name);
  return fixture ? fixture.build() : null;
}

/** The log leading to that fixture's state — empty unless the fixture says otherwise. */
export function fixtureEvents(name: string): readonly DomainEvent[] {
  const fixture = FIXTURES.find((f) => f.name === name);
  return fixture?.events ? fixture.events() : [];
}
