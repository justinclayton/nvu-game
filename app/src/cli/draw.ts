/* Reading `play choose ...` as the answer to a "you may draw" question. */

import type { Character, Command, DrawOption } from "@domain/types";

export type DrawAnswer =
  | { readonly ok: true; readonly command: Command }
  | { readonly ok: false; readonly reason: string };

const refuse = (reason: string): DrawAnswer => ({ ok: false, reason });

const decline: Command = { type: "CHOOSE_DRAW", character: null, count: 0 };

/**
 * `choose none` draws nothing. Otherwise name who draws, how many, or both —
 * `choose 2`, `choose Red`, `choose Red 2`. What is left out has to be the only
 * thing on offer.
 */
export function answerDraw(options: readonly DrawOption[], words: readonly string[]): DrawAnswer {
  if (words.length === 0) return { ok: true, command: decline };

  const characters = [...new Set(options.map((o) => o.character))];
  let character: Character | null = null;
  let count: number | null = null;
  for (const word of words) {
    const found = characters.find((c) => c.toLowerCase() === word.toLowerCase());
    if (found && character === null) character = found;
    else if (/^\d+$/.test(word) && count === null) count = Number(word);
    else return refuse(`"${word}" does not say who draws or how many.`);
  }
  if (count === 0) return { ok: true, command: decline };

  if (character === null && characters.length === 1) character = characters[0] ?? null;
  if (character === null) return refuse(`Choose who draws: ${characters.join(", ")}.`);

  const mine = options.filter((o) => o.character === character);
  const counts = mine.map((o) => String(o.count)).join(", ");
  if (count === null && mine.length === 1) count = mine[0]?.count ?? null;
  if (count === null) return refuse(`Choose how many ${character} draws: ${counts}.`);
  if (!mine.some((o) => o.count === count)) {
    return refuse(`${character} cannot draw ${String(count)}; on offer: ${counts}.`);
  }
  return { ok: true, command: { type: "CHOOSE_DRAW", character, count } };
}
