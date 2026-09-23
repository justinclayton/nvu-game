/* Setting up a run and setting up a floor (rulebook: Setup).
 *
 * This is the one place content enters the domain. `createInitialState` mints a
 * physical copy of every printed card and room and deals them into the piles;
 * after that `execute` needs no content, because a card in state carries what it
 * prints and a behaviour is looked up by name.
 */

import { cardId, roomId } from "./ids";
import type { CardContent, CardFace, Character, RoomFace } from "./printed";
import { shuffle } from "./rng";
import type { Card, DomainEvent, GameState, PlayerState, Room, TurnRecord } from "./types";

/** The rulebook this engine implements (design/rulebook.md). See #83. */
export const RULES_VERSION = "0.2.0";

/** The tenth floor is the roof: clearing its Enemy room wins the run (rulebook, Winning and losing). */
export const TOP_FLOOR = 10;

/** Draw up to this many, each turn (Each Turn, Turn Start: Draw up to five). A card may tighten it. */
export const HAND_CAP = 5;

/** Every floor holds exactly one Enemy room (rulebook Setup, "Floor deck"). */
export const ENEMY_ROOMS_PER_FLOOR = 1;

/**
 * The floor deck is 10 cards on floor 1 and one fewer each floor above it
 * (rulebook Setup, "Floor deck"): 11 - floor.
 */
export const roomsOnFloor = (floor: number): number => TOP_FLOOR + 1 - floor;

/* ------------------------------------------------------ minting the cards */

export function mintCard(face: CardFace, copy: number): Card {
  return {
    id: cardId(`${face.name}#${copy}`),
    name: face.name,
    set: face.set,
    kind: face.kind,
    owner: face.owner,
    rarity: face.rarity,
    cost: face.cost,
    oomph: face.oomph,
    scramble: face.scramble,
    conditionalStat: face.conditionalStat,
    starter: face.starter,
    text: face.text,
  };
}

export function mintRoom(face: RoomFace, copy: number): Room {
  return {
    id: roomId(`${face.name}#${copy}`),
    name: face.name,
    kind: face.kind,
    floor: face.floor,
    thresholds: face.thresholds,
    flee: face.flee,
  };
}

/** One physical copy per printed copy. Ids are stable, so a seeded run replays. */
const copiesOf = (face: CardFace): Card[] =>
  Array.from({ length: face.count }, (_, i) => mintCard(face, i + 1));

const roomCopiesOf = (face: RoomFace): Room[] =>
  Array.from({ length: face.count }, (_, i) => mintRoom(face, i + 1));

/* ------------------------------------------------------------ floor setup */

/** Take `n` rooms of one kind out of the supply, shuffled. */
function takeRooms(
  supply: readonly Room[],
  pick: (room: Room) => boolean,
  n: number,
  seed: number,
): readonly [taken: Room[], rest: Room[], seed: number] {
  const [candidates, next] = shuffle(supply.filter(pick), seed);
  const taken = candidates.slice(0, n);
  const takenIds = new Set(taken.map((r) => r.id));
  return [taken, supply.filter((r) => !takenIds.has(r.id)), next];
}

/**
 * The Enemy room that guards the floor, plus Hazard and Stuff rooms drawn at
 * random together until the floor is full (rulebook Setup, "Floor deck").
 * The floor gets no harder as you climb — it gets emptier.
 *
 * Enemy rooms name the floor they guard. Nothing is printed above floor 3, so a
 * higher floor falls back to any Enemy room; see open-questions.md #9.
 */
export function buildFloor(state: GameState, events: DomainEvent[]): GameState {
  let seed = state.seed;
  let supply = state.roomSupply;
  const rooms: Room[] = [];

  const guardsThisFloor = supply.some((r) => r.kind === "enemy" && r.floor === state.floor);
  const [enemies, afterEnemy, s1] = takeRooms(
    supply,
    (r) => r.kind === "enemy" && (!guardsThisFloor || r.floor === state.floor),
    ENEMY_ROOMS_PER_FLOOR,
    seed,
  );
  rooms.push(...enemies);
  supply = afterEnemy;
  seed = s1;

  const [rest, afterRest, s2] = takeRooms(
    supply,
    (r) => r.kind === "hazard" || r.kind === "stuff",
    roomsOnFloor(state.floor) - ENEMY_ROOMS_PER_FLOOR,
    seed,
  );
  rooms.push(...rest);
  supply = afterRest;
  seed = s2;

  const [floorDeck, s4] = shuffle(rooms, seed);
  events.push({ type: "FLOOR_BUILT", floor: state.floor, rooms: floorDeck.length });
  return {
    ...state,
    seed: s4,
    floorDeck,
    roomSupply: supply,
    activeRoom: null,
    cleared: [],
    fled: [],
  };
}

/** Every room the floor used goes back in the box, ready for the next floor. */
export function returnRoomsToSupply(state: GameState): GameState {
  const used = [
    ...state.floorDeck,
    ...state.fled,
    ...state.cleared,
    ...(state.activeRoom ? [state.activeRoom] : []),
  ];
  return {
    ...state,
    roomSupply: [...state.roomSupply, ...used],
    floorDeck: [],
    fled: [],
    cleared: [],
    activeRoom: null,
  };
}

/* ---------------------------------------------------------- the whole run */

export const emptyTurnRecord = (): TurnRecord => ({
  paid: { Red: 0, Gray: 0 },
  freePlays: 0,
  goodStuffTaken: { Red: 0, Gray: 0 },
  fired: [],
});

const freshPlayer = (deck: readonly Card[]): PlayerState => ({
  deck,
  hand: [],
  discard: [],
  exhaust: [],
  down: false,
  drewThisTurn: 0,
});

/**
 * The only place content enters the domain.
 *
 * Setup: hands start empty and the first floor's deck is built. Starting deck size
 * and composition are NOT YET RULED; the card list's printed copy counts are
 * what the decks are, which comes to 12 cards each.
 */
export function createInitialState(
  seed: number,
  content: CardContent,
): readonly [GameState, DomainEvent[]] {
  const players = content.cards.filter((c) => c.kind === "player");
  const starterFaces = (owner: Character) =>
    players.filter((c) => c.owner === owner && c.starter);
  const rewardFaces = (owner: Character) =>
    players.filter((c) => c.owner === owner && !c.starter);

  const deckFor = (owner: Character) => starterFaces(owner).flatMap(copiesOf);
  const poolFor = (owner: Character) => rewardFaces(owner).flatMap(copiesOf);
  const stuffOf = (kind: "good_stuff" | "bad_stuff") =>
    content.cards.filter((c) => c.kind === kind).flatMap(copiesOf);

  const [redDeck, s1] = shuffle(deckFor("Red"), seed);
  const [grayDeck, s2] = shuffle(deckFor("Gray"), s1);
  const [redPool, s3] = shuffle(poolFor("Red"), s2);
  const [grayPool, s4] = shuffle(poolFor("Gray"), s3);

  const base: GameState = {
    seed: s4,
    floor: 1,
    turn: 0,
    phase: "Turn Start",
    floorDeck: [],
    activeRoom: null,
    fled: [],
    cleared: [],
    roomSupply: content.rooms.flatMap(roomCopiesOf),
    Red: freshPlayer(redDeck),
    Gray: freshPlayer(grayDeck),
    playZone: [],
    scrapyard: [],
    pools: {
      Red: redPool,
      Gray: grayPool,
      goodStuff: stuffOf("good_stuff"),
      badStuff: stuffOf("bad_stuff"),
    },
    offer: null,
    pending: null,
    resolution: null,
    thisTurn: emptyTurnRecord(),
    outcome: null,
  };

  const events: DomainEvent[] = [];
  return [buildFloor(base, events), events];
}
