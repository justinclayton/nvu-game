/* Adapters. The seed source is infrastructure so the domain never sees where
 * randomness came from — it only ever sees the number in GameState. */

/** A fresh 32-bit seed for a new run. */
export function freshSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return (buf[0] ?? 0) | 0;
}
