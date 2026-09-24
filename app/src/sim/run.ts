/* One simulated run: a fold of `execute` over a policy's choices.
 *
 * Nothing here reads a clock or prints. The result carries the command log, so
 * any run can be written out as the same `nvu-run/1` file the web game exports
 * and loaded back into it.
 */

import { execute } from "@domain/engine";
import type { CardContent } from "@domain/printed";
import { createInitialState } from "@domain/setup";
import type { Command, DomainEvent, GameState, Result } from "@domain/types";
import { legalCommands } from "./moves";
import type { Policy } from "./policy";
import { policySeed } from "./rng";

export interface RunOptions {
  /** A policy that never ends a phase would spin forever; this stops it. */
  readonly maxCommands?: number;
  /**
   * Called after each command the engine accepts, with the state right
   * before it and the state and events it produced. A report builds its
   * per-card and per-Ascend statistics off this instead of replaying the
   * command log a second time.
   */
  readonly onStep?: (before: GameState, command: Command, after: GameState, events: readonly DomainEvent[]) => void;
}

const DEFAULT_MAX_COMMANDS = 5_000;

export type StopReason =
  | "GameOver"
  /** The command budget ran out. */
  | "Budget"
  /** The enumerator found nothing legal, which is a bug in it or the engine. */
  | "NoLegalMove"
  /** The policy chose something the rules refused, which is a bug in the policy. */
  | "Rejected"
  /** The generator or the engine raised instead of answering. */
  | "Threw";

export type RunOutcome = "Victory" | "Defeat" | "Aborted" | "Unfinished";

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
  readonly commands: readonly Command[];
  readonly final: GameState;
}

/* ------------------------------------------------------------- the loop */

export function simulate(
  seed: number,
  policy: Policy,
  content: CardContent,
  options: RunOptions = {},
): RunResult {
  const maxCommands = options.maxCommands ?? DEFAULT_MAX_COMMANDS;
  const [initial] = createInitialState(seed, content);

  let state = initial;
  let rng = policySeed(seed);
  const commands: Command[] = [];
  let stopped: StopReason = "Budget";
  let rejection: string | null = null;

  const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

  while (commands.length < maxCommands) {
    if (state.phase === "GameOver") {
      stopped = "GameOver";
      break;
    }
    let legal: readonly Command[];
    try {
      legal = legalCommands(state);
    } catch (error) {
      stopped = "Threw";
      rejection = messageOf(error);
      break;
    }
    if (legal.length === 0) {
      stopped = "NoLegalMove";
      break;
    }
    const [command, next] = policy.choose(state, legal, rng);
    rng = next;
    let result: Result;
    try {
      result = execute(state, command);
    } catch (error) {
      stopped = "Threw";
      rejection = `${command.type}: ${messageOf(error)}`;
      break;
    }
    if (!result.ok) {
      stopped = "Rejected";
      rejection = `${command.type}: ${result.reason.message}`;
      break;
    }
    commands.push(command);
    options.onStep?.(state, command, result.state, result.events);
    state = result.state;
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
    commands,
    final: state,
  };
}

/** Seeds for a batch: `count` of them, counting up from `first`. */
export const seedsFrom = (first: number, count: number): readonly number[] =>
  Array.from({ length: count }, (_, i) => (first + i) | 0);
