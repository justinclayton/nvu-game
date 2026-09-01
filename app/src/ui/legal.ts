/* The UI computes no rule. It asks the domain whether a command would be legal,
 * and greys the button when the answer is no. */

import { validate } from "@domain/engine";
import type { Command, GameState } from "@domain/types";

export const isLegal = (state: GameState, command: Command): boolean =>
  validate(state, command) === null;

export const whyNot = (state: GameState, command: Command): string | null =>
  validate(state, command)?.message ?? null;
