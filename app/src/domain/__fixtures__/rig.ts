/* Rigging a state by hand, for the rules tests.
 *
 * Test scaffolding, not content: every card here comes from design/cards.yaml
 * through the generated module. Nothing invents a card.
 */

import { CARD_CONTENT } from "../../content";
import { execute } from "../engine";
import { emptyTurnRecord, mintCard, mintRoom } from "../setup";
import type {
  Card,
  Character,
  Command,
  DomainEvent,
  GameState,
  PlayerState,
  Room,
} from "../types";

export const CONTENT = CARD_CONTENT;

let counter = 0;
export const resetRig = (): void => {
  counter = 0;
};

/** One physical copy of a printed card, by name. Throws rather than guess. */
export function card(name: string): Card {
  const face = CONTENT.cards.find((c) => c.name === name);
  if (!face) throw new Error(`No card named "${name}" in design/cards.yaml`);
  counter += 1;
  return mintCard(face, counter);
}

export const pile = (name: string, n: number): Card[] =>
  Array.from({ length: n }, () => card(name));

export function room(name: string): Room {
  const face = CONTENT.rooms.find((r) => r.name === name);
  if (!face) throw new Error(`No room named "${name}" in design/cards.yaml`);
  counter += 1;
  return mintRoom(face, counter);
}

export const player = (over: Partial<PlayerState> = {}): PlayerState => ({
  deck: [],
  hand: [],
  discard: [],
  exhaust: [],
  down: false,
  drewThisTurn: 0,
  ...over,
});

const poolOf = (kind: "good_stuff" | "bad_stuff"): Card[] =>
  CONTENT.cards.filter((c) => c.kind === kind).map((c) => {
    counter += 1;
    return mintCard(c, counter);
  });

const rewardPool = (owner: Character): Card[] =>
  CONTENT.cards
    .filter((c) => c.kind === "player" && c.owner === owner && !c.starter)
    .map((c) => {
      counter += 1;
      return mintCard(c, counter);
    });

/** A bare state, so a test only fills in what it is about. */
export function rig(over: Partial<GameState> = {}): GameState {
  const base: GameState = {
    seed: 1,
    floor: 1,
    turn: 1,
    phase: "Play",
    floorDeck: [],
    activeRoom: null,
    cleared: [],
    roomSupply: [],
    Red: player(),
    Gray: player(),
    playZone: [],
    scrapyard: [],
    pools: {
      Red: rewardPool("Red"),
      Gray: rewardPool("Gray"),
      goodStuff: poolOf("good_stuff"),
      badStuff: poolOf("bad_stuff"),
    },
    offer: null,
    pending: null,
    resolution: null,
    thisTurn: emptyTurnRecord(),
    outcome: null,
  };
  return { ...base, ...over };
}

export interface Ran {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
}

/** Run one command, failing the test with the rejection's own message. */
export function must(state: GameState, command: Command): Ran {
  const result = execute(state, command);
  if (!result.ok) {
    throw new Error(`${command.type} was rejected: ${result.reason.message}`);
  }
  return { state: result.state, events: result.events };
}

/** Fold commands over a state, collecting every event. */
export function play(state: GameState, commands: readonly Command[]): Ran {
  let s = state;
  const events: DomainEvent[] = [];
  for (const command of commands) {
    const ran = must(s, command);
    s = ran.state;
    events.push(...ran.events);
  }
  return { state: s, events };
}

export const eventTypes = (events: readonly DomainEvent[]): readonly string[] =>
  events.map((e) => e.type);

export const names = (cards: readonly Card[]): readonly string[] => cards.map((c) => c.name);
