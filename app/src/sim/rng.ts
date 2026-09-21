/* A policy's own randomness: a seed, advanced with the domain's generator, so a
 * simulated run replays exactly from its game seed and its policy name. */

import { nextRandom } from "@domain/rng";

export type Rng = number;

/** The policy's stream starts from the game's seed, but not on the same numbers. */
export const policySeed = (gameSeed: number): Rng => (gameSeed ^ 0x5bd1e995) | 0;

/** An index in [0, n), and the advanced seed. `n` must be positive. */
export function roll(rng: Rng, n: number): readonly [index: number, rng: Rng] {
  const [value, next] = nextRandom(rng);
  return [Math.min(n - 1, Math.floor(value * n)), next];
}

/** One of `items`, and the advanced seed. Throws on an empty list, which is a caller's bug. */
export function pick<T>(items: readonly T[], rng: Rng): readonly [T, Rng] {
  const [index, next] = roll(rng, items.length);
  const item = items[index];
  if (item === undefined) throw new Error("pick from an empty list");
  return [item, next];
}
