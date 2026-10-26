/* The UI computes no rule. It asks the domain why a command would not be legal,
 * and greys the button when there is a reason. */

import { validate } from "@domain/engine";
import type { Command, GameState } from "@domain/types";

export const whyNot = (state: GameState, command: Command): string | null =>
  validate(state, command)?.message ?? null;
