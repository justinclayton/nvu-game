/* Rigging a state by hand, for the rules tests.
 *
 * Test scaffolding, not content: every card here comes from cards.yaml
 * through the generated module. Nothing invents a card.
 */

import { CARD_CONTENT } from "../../content";
import { execute } from "../engine";
import { emptyTurnRecord, mintCard, mintRoom } from "../setup";
import type {
  Card,
  CardId,
  Character,
  Command,
  DomainEvent,
  GameState,
  PlayerState,
  Room,
} from "../types";
import type { CardContent } from "../printed";

export const CONTENT = CARD_CONTENT;

/**
 * Band 1's printed Room supply is short of what floor 1-3 call for (setup.ts,
 * `buildFloor`) — the card list is not yet complete. A test that plays a
 * whole run needs a tier 1 with enough cards to actually build a floor, so it
 * pads one tier-1 Room's copy count rather than going through `design/`.
 */
export const FULL_CONTENT: CardContent = {
  ...CONTENT,
  rooms: CONTENT.rooms.map((r) =>
    r.name === "Security Turnstile" ? { ...r, count: r.count + 4 } : r,
  ),
};

let counter = 0;
export const resetRig = (): void => {
  counter = 0;
};

/** One physical copy of a printed card, by name. Throws rather than guess. */
export function card(name: string): Card {
  const face = CONTENT.cards.find((c) => c.name === name);
  if (!face) throw new Error(`No card named "${name}" in cards.yaml`);
  counter += 1;
  return mintCard(face, counter);
}

export const pile = (name: string, n: number): Card[] =>
  Array.from({ length: n }, () => card(name));

export function room(name: string): Room {
  const face = CONTENT.rooms.find((r) => r.name === name);
  if (!face) throw new Error(`No room named "${name}" in cards.yaml`);
  counter += 1;
  return mintRoom(face, counter);
}

/** A printed room without its keywords, for a test of a rule its Lockstep or Cap would get in the way of. */
export function plainRoom(name: string): Room {
  return { ...room(name), keywords: [] };
}

/** Security Turnstile with its Oomph 5 line paying Red Good Stuff, for tests of Good Stuff arriving at Outcome. */
export function goodStuffTurnstile(): Room {
  const printed = room("Security Turnstile");
  return {
    ...printed,
    challenges: printed.challenges.map((challenge) => ({
      thresholds: challenge.thresholds.map((t) =>
        t.requires.oomph > 0
          ? {
              ...t,
              outcome: "Red gets Good Stuff.",
              effects: [{ type: "TakeGoodStuff", who: "Red", count: 1 } as const],
            }
          : t,
      ),
    })),
  };
}

/**
 * Puzzle Room with its Oomph 3 and Scramble 5 line paying both players Good
 * Stuff, and without its Lockstep, so one player may play the whole line.
 */
export function goodStuffShaft(): Room {
  const printed = plainRoom("Puzzle Room");
  return {
    ...printed,
    challenges: printed.challenges.map((challenge) => ({
      thresholds: challenge.thresholds.map((t) => ({
        ...t,
        outcome: "Both players get Good Stuff.",
        effects: [{ type: "TakeGoodStuff", who: "both", count: 1 } as const],
      })),
    })),
  };
}

/** Security Turnstile with Scramble 3 and Oomph 5 lines that pay nothing, for tests that need a room to Clear. */
export function plainTurnstile(): Room {
  const printed = room("Security Turnstile");
  return {
    ...printed,
    challenges: printed.challenges.map((challenge) => ({
      thresholds: challenge.thresholds.map((t) => ({
        ...t,
        requires: t.requires.scramble > 0 ? { oomph: 0, scramble: 3 } : t.requires,
        effects: [],
      })),
    })),
  };
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
    pending: null,
    unfinishedPlay: null,
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

/**
 * Fold commands over a state, collecting every event. An Exhaust the run
 * stops on is answered off the top of the deck (`exhaustFromDeck`) unless the
 * next command answers it, so a test about something else reads as it did
 * when every Exhaust came off the deck.
 */
export function play(state: GameState, commands: readonly Command[]): Ran {
  let s = state;
  const events: DomainEvent[] = [];
  commands.forEach((command, i) => {
    const ran = must(s, command);
    const next = commands[i + 1];
    const settled = next?.type === "EXHAUST_CARD" ? ran : exhaustFromDeck(ran);
    s = settled.state;
    events.push(...settled.events);
  });
  return { state: s, events };
}

/**
 * Answer every Exhaust the run is waiting on with the top of the deck, or
 * with the first card offered once the deck is empty, for a test about
 * something other than which card goes (rulebook, Keywords: `Exhaust X`).
 */
export function exhaustFromDeck(ran: Ran): Ran {
  let s = ran.state;
  const events = [...ran.events];
  while (s.pending?.kind === "ChooseExhaust") {
    const cardId = s.pending.deck > 0 ? null : (s.pending.options[0]?.id ?? null);
    const next = must(s, { type: "EXHAUST_CARD", cardId });
    s = next.state;
    events.push(...next.events);
  }
  return { state: s, events };
}

/**
 * Answer every Good Stuff spread the run is waiting on by keeping its first
 * card (rulebook, Keywords: `Get Good Stuff`), for a test about something
 * other than which piece is kept.
 */
export function keepFirstGoodStuff(ran: Ran): Ran {
  let s = ran.state;
  const events = [...ran.events];
  while (s.pending?.kind === "ChooseGoodStuff") {
    const first = s.pending.options[0];
    if (!first) throw new Error("rig: a Good Stuff spread with nothing in it");
    const next = must(s, { type: "CHOOSE_CARDS", cardIds: [first.id] });
    s = next.state;
    events.push(...next.events);
  }
  return { state: s, events };
}

export const eventTypes = (events: readonly DomainEvent[]): readonly string[] =>
  events.map((e) => e.type);

export const names = (cards: readonly Card[]): readonly string[] => cards.map((c) => c.name);

/** A hand's card ids, so a test can pay with or play whichever position it needs. */
export const ids = (state: GameState, c: Character): readonly CardId[] =>
  state[c].hand.map((x) => x.id);

/** One named card out of a hand, so a test never counts hand positions. */
export function handCard(state: GameState, c: Character, name: string): Card {
  const found = state[c].hand.find((x) => x.name === name);
  if (!found) throw new Error(`${c} is not holding ${name}`);
  return found;
}

/** Play the given card for nothing. */
export const free = (c: Character, cardId: CardId): Command =>
  ({ type: "PLAY_CARD", character: c, cardId, payWith: [] }) as const;

/** A rigged Play-phase state, The Sentry Drone, both hands empty with full decks. */
export const playing = (over: Partial<GameState> = {}): GameState =>
  rig({
    phase: "Play",
    activeRoom: room("The Sentry Drone"),
    Red: player({ deck: pile("Shove", 6) }),
    Gray: player({ deck: pile("Duck Under", 6) }),
    ...over,
  });

/** Play phase at Ticking Time Bomb (Flee: Both players Exhaust 3), both decks and discard piles empty: one Exhaust away from Going Down. */
export const goingDown = (hand: readonly Card[] = []): GameState =>
  rig({
    phase: "Play",
    activeRoom: room("Ticking Time Bomb"),
    Red: player({ deck: [], discard: [], hand }),
    Gray: player({ deck: pile("Duck Under", 4) }),
  });

/** Answer a "you may draw" question by taking the draw: `c` draws `count`. */
export const drawing = (c: Character, count: number): Command =>
  ({ type: "CHOOSE_DRAW", character: c, count }) as const;

/** Answer a "you may draw" question by drawing nothing. */
export const noDraw: Command = { type: "CHOOSE_DRAW", character: null, count: 0 };
