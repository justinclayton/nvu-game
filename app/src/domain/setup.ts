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

/**
 * The tower is 5 numbered Floors "as well as a Roof where the final battle will
 * take place" (rulebook Setup, "Floor deck"). The Roof is the sixth floor, and
 * "You win by clearing the final room on the Roof" (Winning and losing).
 */
export const TOP_FLOOR = 6;

/** Draw up to this many, each turn (Each Turn, Turn Start: Draw up to five). A card may tighten it. */
export const HAND_CAP = 5;

/** What the players call a floor: "Floor 3", and "The Roof" for the sixth. */
export const floorName = (floor: number): string =>
  floor >= TOP_FLOOR ? "The Roof" : `Floor ${String(floor)}`;

/**
 * Each numbered floor has "its own set of cards" (rulebook Setup, "Floor
 * deck"): floor N draws from tier N. The Roof draws from no tier; it prints
 * one fixed Stairwell instead (cards.yaml, The Monolith Core, `tier: null`).
 */
export function tierOf(floor: number): Band | null {
  return floor >= TOP_FLOOR ? null : (floor as Band);
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
    tier: face.tier,
    flavor: face.flavor,
    text: face.text,
    keywords: face.keywords,
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

/**
 * "Assemble the floor deck for the floor you're building by shuffling the
 * cards for that floor together" (rulebook Setup, "Floor deck"): every copy of
 * every Room and Stairwell printed for the floor's tier. The Roof's deck is
 * The Monolith Core alone.
 *
 * A floor whose tier prints no Stairwell cannot be climbed out of: the floor
 * is not built, and the game ends Aborted instead.
 */
export function buildFloor(state: GameState, events: DomainEvent[]): GameState {
  const tier = tierOf(state.floor);
  const forFloor = state.roomSupply.filter((r) => r.tier === tier);

  if (!forFloor.some((r) => r.kind === "stairwell")) {
    const where = tier === null ? "the Roof" : `Floor ${String(state.floor)}`;
    const reason = `${where} has no Stairwell; tier ${String(tier)} prints none.`;
    events.push({ type: "RUN_ABORTED", reason });
    return { ...state, phase: "GameOver", outcome: "Aborted" };
  }

  const [floorDeck, seed] = shuffle(forFloor, state.seed);
  const taken = new Set(floorDeck.map((r) => r.id));
  events.push({ type: "FLOOR_BUILT", floor: state.floor, rooms: floorDeck.length });
  return {
    ...state,
    seed,
    floorDeck,
    roomSupply: state.roomSupply.filter((r) => !taken.has(r.id)),
    activeRoom: null,
  };
}

/**
 * "Return every room still in the floor deck, Fled rooms included, to its
 * tier's pool" (rulebook, Ascending, Build the next floor). Cleared rooms, the
 * Stairwell included, stay on the Rooms pile for the rest of the run.
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
  freePlays: 0,
  goodStuffTaken: { Red: 0, Gray: 0 },
  goodStuffOwed: { Red: 0, Gray: 0 },
  goodStuffSources: { Red: [], Gray: [] },
  questions: [],
  fired: [],
  playDiscount: { Red: 0, Gray: 0 },
  poolPenalty: { oomph: 0, scramble: 0 },
  poolBonus: { oomph: 0, scramble: 0 },
  exhausted: { Red: 0, Gray: 0 },
  exhaustedFromDeck: { Red: 0, Gray: 0 },
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
  const starterFaces = (owner: Character) => players.filter((c) => c.owner === owner && c.starter);
  const rewardFaces = (owner: Character) => players.filter((c) => c.owner === owner && !c.starter);

  const deckFor = (owner: Character) => starterFaces(owner).flatMap(copiesOf);
  const poolFor = (owner: Character) => rewardFaces(owner).flatMap(copiesOf);
  const stuffOf = (kind: "good_stuff" | "bad_stuff") =>
    content.cards.filter((c) => c.kind === kind).flatMap(copiesOf);

  const [redDeck, s1] = shuffle(deckFor("Red"), seed);
  const [grayDeck, s2] = shuffle(deckFor("Gray"), s1);
  const [redPool, s3] = shuffle(poolFor("Red"), s2);
  const [grayPool, s4] = shuffle(poolFor("Gray"), s3);
  const [goodStuff, s5] = shuffle(stuffOf("good_stuff"), s4);
  const [badStuff, s6] = shuffle(stuffOf("bad_stuff"), s5);

  const base: GameState = {
    seed: s6,
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
      goodStuff,
      badStuff,
    },
    pending: null,
    unfinishedPlay: null,
    resolution: null,
    thisTurn: emptyTurnRecord(),
    outcome: null,
  };

  const events: DomainEvent[] = [];
  return [buildFloor(base, events), events];
}
