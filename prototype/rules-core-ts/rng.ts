/* Seeded RNG. The seed lives in GameState, so a run replays exactly.
 * PROTOTYPE — see README.md. */

/** mulberry32: one 32-bit seed in, one float and the next seed out. */
export function next(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) | 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return [value, t];
}

/** Fisher-Yates over a copy. Returns the shuffled copy and the advanced seed. */
export function shuffle<T>(items: readonly T[], seed: number): [T[], number] {
  const out = items.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    const [v, ns] = next(s);
    s = ns;
    const j = Math.floor(v * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return [out, s];
}
