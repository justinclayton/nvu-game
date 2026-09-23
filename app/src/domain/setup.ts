/* Setting up a run and setting up a floor (rulebook: Setup).
 *
 * This is the one place content enters the domain. `createInitialState` mints a
 * physical copy of every printed card and room and deals them into the piles;
 * after that `execute` needs no content, because a card in state carries what it
 * prints and a behaviour is looked up by name.
 */

import { cardId, roomId } from "./ids";
import type { Band, CardContent, CardFace, Character, RoomFace } from "./printed";
import { shuffle } from "./rng";
import type { Card, DomainEvent, GameState, PlayerState, Room, TurnRecord } from "./types";

/** The rulebook this engine implements (design/rulebook.md). See #83. */
export const RULES_VERSION = "0.2.1";

/** The tenth floor is the roof: clearing it wins the run (rulebook, Winning and losing). */
export const TOP_FLOOR = 10;

/** Draw up to this many, each turn (Each Turn, Turn Start: Draw up to five). A card may tighten it. */
export const HAND_CAP = 5;

/** Every floor holds exactly one Stairwell (rulebook Setup, "Floor deck"). */
export const STAIRWELLS_PER_FLOOR = 1;

/**
 * The floor deck is 10 cards on floor 1 and one fewer each floor above it
 * (rulebook Setup, "Floor deck"): 11 - floor.
 */
export const roomsOnFloor = (floor: number): number => TOP_FLOOR + 1 - floor;

/**
 * Rooms and Stairwells pool by band: floors 1–3, 4–6, 7–9 (rulebook Setup,
 * "Floor deck"). Floor 10 draws from no band — it prints one fixed Stairwell
 * instead, not yet in design/cards.yaml (#125).
 */
export function bandOf(floor: number): Band | null {
  if (floor <= 3) return 1;
  if (floor <= 6) return 2;
  if (floor <= 9) return 3;
  return null;
}

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
    band: face.band,
    flavor: face.flavor,
    challenges: face.challenges,
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
 * One Stairwell from the floor's band, plus Rooms from the same band drawn at
 * random until the floor is full (rulebook Setup, "Floor deck"). The floor
 * gets no harder as you climb — it gets emptier.
 *
 * Bands 2 and 3, and floor 10's fixed Stairwell, are not yet in
 * design/cards.yaml (#122, #123, #125), so a floor outside band 1 builds an
 * empty deck.
 */
export function buildFloor(state: GameState, events: DomainEvent[]): GameState {
  let seed = state.seed;
  let supply = state.roomSupply;
  const rooms: Room[] = [];
  const band = bandOf(state.floor);

  const [stairwells, afterStairwell, s1] = takeRooms(
    supply,
    (r) => r.kind === "stairwell" && r.band === band,
    STAIRWELLS_PER_FLOOR,
    seed,
  );
  rooms.push(...stairwells);
  supply = afterStairwell;
  seed = s1;

  const [rest, afterRest, s2] = takeRooms(
    supply,
    (r) => r.kind === "room" && r.band === band,
    roomsOnFloor(state.floor) - STAIRWELLS_PER_FLOOR,
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
  };
}

/**
 * Unseen and Fled rooms go back to their band's pool, ready for the next
 * floor. Cleared rooms, the Stairwell included, stay on the Rooms pile for
 * the rest of the run (rulebook, Ascending).
 */
export function returnRoomsToSupply(state: GameState): GameState {
  const used = [...state.floorDeck, ...(state.activeRoom ? [state.activeRoom] : [])];
  return {
    ...state,
    roomSupply: [...state.roomSupply, ...used],
    floorDeck: [],
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
