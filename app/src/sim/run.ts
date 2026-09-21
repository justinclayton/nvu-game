/* One simulated run: a fold of `execute` over a policy's choices.
 *
 * Nothing here reads a clock or prints. The result carries the command log, so
 * any run can be written out as the same `nvu-run/1` file the web game exports
 * and loaded back into it.
 */

import { execute } from "@domain/engine";
import type { CardContent } from "@domain/printed";
import { createInitialState } from "@domain/setup";
import type { Character, Command, DomainEvent, GameState } from "@domain/types";
import { legalCommands } from "./moves";
import type { Policy } from "./policy";
import { policySeed } from "./rng";

export interface RunOptions {
  /** A policy that never ends a phase would spin forever; this stops it. */
  readonly maxCommands?: number;
}

const DEFAULT_MAX_COMMANDS = 5_000;

export type StopReason =
  | "GameOver"
  /** The command budget ran out. */
  | "Budget"
  /** The enumerator found nothing legal, which is a bug in it or the engine. */
  | "NoLegalMove"
  /** The policy chose something the rules refused, which is a bug in the policy. */
  | "Rejected";

export type RunOutcome = "Victory" | "Defeat" | "Unfinished";

/** Counts read off the event log, one per thing a balance question asks about. */
export interface Tally {
  readonly roomsCleared: Readonly<Record<string, number>>;
  readonly roomsFled: Readonly<Record<string, number>>;
  readonly cardsPlayed: Readonly<Record<string, number>>;
  readonly thresholdsMet: number;
  readonly goodStuffTaken: number;
  readonly badStuffDealt: number;
  readonly stuffMissed: number;
  readonly cardsDrawn: number;
  readonly drawsBurned: number;
  readonly cardsPaid: number;
  readonly exhausted: number;
  readonly lastStands: number;
  readonly escapes: number;
  readonly rewardsTaken: number;
  readonly rewardsDeclined: number;
  readonly floorsCleared: number;
  /** The turn each character went Down on, or null. */
  readonly down: Readonly<Record<Character, number | null>>;
}

export interface RunResult {
  readonly seed: number;
  readonly policy: string;
  readonly outcome: RunOutcome;
  readonly stopped: StopReason;
  /** What the rules said, when `stopped` is `Rejected`. */
  readonly rejection: string | null;
  readonly floor: number;
  readonly turn: number;
  readonly commandCount: number;
  readonly eventCount: number;
  readonly tally: Tally;
  readonly commands: readonly Command[];
  readonly final: GameState;
}

/* ------------------------------------------------------------- tallying */

type Counts = Record<string, number>;

interface Draft {
  roomsCleared: Counts;
  roomsFled: Counts;
  cardsPlayed: Counts;
  thresholdsMet: number;
  goodStuffTaken: number;
  badStuffDealt: number;
  stuffMissed: number;
  cardsDrawn: number;
  drawsBurned: number;
  cardsPaid: number;
  exhausted: number;
  lastStands: number;
  escapes: number;
  rewardsTaken: number;
  rewardsDeclined: number;
  floorsCleared: number;
  down: Record<Character, number | null>;
}

const emptyDraft = (): Draft => ({
  roomsCleared: {},
  roomsFled: {},
  cardsPlayed: {},
  thresholdsMet: 0,
  goodStuffTaken: 0,
  badStuffDealt: 0,
  stuffMissed: 0,
  cardsDrawn: 0,
  drawsBurned: 0,
  cardsPaid: 0,
  exhausted: 0,
  lastStands: 0,
  escapes: 0,
  rewardsTaken: 0,
  rewardsDeclined: 0,
  floorsCleared: 0,
  down: { Red: null, Gray: null },
});

const bump = (counts: Counts, key: string): void => {
  counts[key] = (counts[key] ?? 0) + 1;
};

function count(draft: Draft, event: DomainEvent, turn: number): void {
  switch (event.type) {
    case "ROOM_CLEARED":
      bump(draft.roomsCleared, event.room.name);
      break;
    case "ROOM_FLED":
      bump(draft.roomsFled, event.room.name);
      break;
    case "CARD_PLAYED":
      bump(draft.cardsPlayed, event.card.name);
      break;
    case "THRESHOLD_MET":
      draft.thresholdsMet += 1;
      break;
    case "STUFF_TAKEN":
      if (event.card.kind === "bad_stuff") draft.badStuffDealt += 1;
      else draft.goodStuffTaken += 1;
      break;
    case "STUFF_POOL_EMPTY":
      draft.stuffMissed += 1;
      break;
    case "CARD_DRAWN":
      draft.cardsDrawn += 1;
      break;
    case "DRAW_BURNED":
      draft.drawsBurned += 1;
      break;
    case "COST_PAID":
      draft.cardsPaid += event.cards.length;
      break;
    case "CARD_DISCARDED":
      if (event.from === "deck") draft.exhausted += 1;
      break;
    case "LAST_STAND":
      draft.lastStands += 1;
      break;
    case "LAST_STAND_ESCAPED":
      draft.escapes += 1;
      break;
    case "REWARD_TAKEN":
      draft.rewardsTaken += 1;
      break;
    case "REWARD_DECLINED":
      draft.rewardsDeclined += 1;
      break;
    case "FLOOR_CLEARED":
      draft.floorsCleared += 1;
      break;
    case "WENT_DOWN":
      if (draft.down[event.character] === null) draft.down[event.character] = turn;
      break;
    default:
      break;
  }
}

/** The tally of an event log on its own, for a run that was not simulated here. */
export function tallyOf(events: readonly DomainEvent[]): Tally {
  const draft = emptyDraft();
  let turn = 0;
  for (const event of events) {
    if (event.type === "ROOM_FLIPPED") turn += 1;
    count(draft, event, turn);
  }
  return draft;
}

/* ------------------------------------------------------------- the loop */

export function simulate(
  seed: number,
  policy: Policy,
  content: CardContent,
  options: RunOptions = {},
): RunResult {
  const maxCommands = options.maxCommands ?? DEFAULT_MAX_COMMANDS;
  const [initial, opening] = createInitialState(seed, content);

  const draft = emptyDraft();
  for (const event of opening) count(draft, event, 0);
  let eventCount = opening.length;

  let state = initial;
  let rng = policySeed(seed);
  const commands: Command[] = [];
  let stopped: StopReason = "Budget";
  let rejection: string | null = null;

  while (commands.length < maxCommands) {
    if (state.phase === "GameOver") {
      stopped = "GameOver";
      break;
    }
    const legal = legalCommands(state);
    if (legal.length === 0) {
      stopped = "NoLegalMove";
      break;
    }
    const [command, next] = policy.choose(state, legal, rng);
    rng = next;
    const result = execute(state, command);
    if (!result.ok) {
      stopped = "Rejected";
      rejection = `${command.type}: ${result.reason.message}`;
      break;
    }
    commands.push(command);
    state = result.state;
    eventCount += result.events.length;
    for (const event of result.events) count(draft, event, state.turn);
  }
  if (state.phase === "GameOver") stopped = "GameOver";

  return {
    seed,
    policy: policy.name,
    outcome: state.outcome ?? "Unfinished",
    stopped,
    rejection,
    floor: state.floor,
    turn: state.turn,
    commandCount: commands.length,
    eventCount,
    tally: draft,
    commands,
    final: state,
  };
}

/** Seeds for a batch: `count` of them, counting up from `first`. */
export const seedsFrom = (first: number, count: number): readonly number[] =>
  Array.from({ length: count }, (_, i) => (first + i) | 0);
