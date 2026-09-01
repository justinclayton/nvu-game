/* Seeded randomness. The seed lives in GameState, so a run replays exactly from
 * its seed and its command log. Nothing here reads a clock or Math.random. */

/** mulberry32: one 32-bit seed in, one float in [0,1) and the next seed out. */
export function nextRandom(seed: number): readonly [value: number, seed: number] {
  const t = (seed + 0x6d2b79f5) | 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return [value, t];
}

/** Fisher-Yates over a copy. Returns the shuffled copy and the advanced seed. */
export function shuffle<T>(items: readonly T[], seed: number): readonly [T[], number] {
  const out = items.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    const [v, ns] = nextRandom(s);
    s = ns;
    const j = Math.floor(v * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return [out, s];
}

/** Draw one item blind from a pile. Returns the item, the rest, and the seed. */
export function drawBlind<T>(
  pile: readonly T[],
  seed: number,
): readonly [T | null, readonly T[], number] {
  if (pile.length === 0) return [null, pile, seed];
  const [shuffled, next] = shuffle(pile, seed);
  return [shuffled[0] as T, shuffled.slice(1), next];
}
