/* Card-name resolution: what an agent types against what a slot allows.
 *
 * design/cli-sim/spec.md, "Card names": a name resolves against the cards
 * eligible for a slot, matching the full name, the initials, or an
 * unambiguous prefix, case-insensitively. Several eligible copies of the same
 * card are never ambiguous — any copy answers.
 *
 * Lives in content, not cli, so the initials-collision report can be a
 * content test read against design/cards.yaml (app/src/content/initials.test.ts)
 * without cli importing content importing cli back.
 */

export interface Named {
  readonly name: string;
}

export type NameResolution<T extends Named> =
  | { readonly ok: true; readonly card: T }
  | { readonly ok: false; readonly reason: string };

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter((w) => w !== "")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

const distinctNames = <T extends Named>(cards: readonly T[]): readonly string[] => [
  ...new Set(cards.map((c) => c.name)),
];

/**
 * Resolve one typed name against the cards eligible for a slot. Exact
 * full-name matches short-circuit, since every card's name is unique
 * (app/src/content/index.test.ts). Otherwise a name matching the initials or
 * an unambiguous prefix of exactly one distinct eligible name wins; several
 * copies sharing that name are interchangeable.
 */
export function resolveCardName<T extends Named>(
  query: string,
  eligible: readonly T[],
): NameResolution<T> {
  const q = query.trim();
  if (q === "") return { ok: false, reason: "No name was given." };

  const exact = eligible.filter((c) => c.name.toLowerCase() === q.toLowerCase());
  if (exact.length > 0) return { ok: true, card: exact[0]! };

  const upper = q.toUpperCase();
  const lower = q.toLowerCase();
  const matches = eligible.filter(
    (c) => initialsOf(c.name) === upper || c.name.toLowerCase().startsWith(lower),
  );
  const names = distinctNames(matches);

  if (names.length === 0) {
    const candidates = distinctNames(eligible);
    return {
      ok: false,
      reason:
        candidates.length === 0
          ? `"${q}" matches nothing — nothing is eligible here.`
          : `"${q}" matches nothing eligible. Candidates: ${candidates.join(", ")}.`,
    };
  }
  if (names.length > 1) {
    return { ok: false, reason: `"${q}" is ambiguous. Candidates: ${names.join(", ")}.` };
  }
  return { ok: true, card: matches[0]! };
}

/** Every pair of distinct names in `cards` that share initials. */
export function initialsCollisions<T extends Named>(
  cards: readonly T[],
): readonly (readonly [string, string])[] {
  const byInitials = new Map<string, Set<string>>();
  for (const card of cards) {
    const key = initialsOf(card.name);
    if (key === "") continue;
    const set = byInitials.get(key) ?? new Set<string>();
    set.add(card.name);
    byInitials.set(key, set);
  }
  const out: (readonly [string, string])[] = [];
  for (const names of byInitials.values()) {
    const sorted = [...names].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        if (a !== undefined && b !== undefined) out.push([a, b]);
      }
    }
  }
  return out;
}
