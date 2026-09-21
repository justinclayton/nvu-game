/* The one policy: a uniform pick over the legal list.
 *
 * A greedy or heuristic policy would measure itself as much as the game
 * (design/cli-sim/spec.md), so there is no bot here — random play is what
 * fuzz uses to shake the engine, and an agent playtester stands in for
 * anything smarter.
 */

import type { Command, GameState } from "@domain/types";
import { pick, type Rng } from "./rng";

export interface Policy {
  readonly name: string;
  /** One of `legal`, or any other command the policy is sure of. */
  choose(state: GameState, legal: readonly Command[], rng: Rng): readonly [Command, Rng];
}

/** A uniform pick over the legal list: the floor any real player stands above. */
export const randomPolicy: Policy = {
  name: "random",
  choose(_state, legal, rng) {
    return pick(legal, rng);
  },
};
