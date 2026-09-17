/* Dev-only: open the app already parked on a named state, so a PR can carry a
 * screenshot of a screen that otherwise takes several turns of play to reach.
 *
 * This file is never imported except behind `import.meta.env.DEV` and a
 * dynamic `import()`, both in `main.tsx`, so a production build tree-shakes
 * it — and the fixtures it pulls in from `domain/__fixtures__` — out
 * entirely. Nothing else in the app imports it.
 */

import { createSessionFrom, type Session } from "@application/session";
import { buildFixture, fixtureEvents, fixtureList } from "@domain/__fixtures__/scenarios";

export type FixtureLookup =
  | { readonly ok: true; readonly session: Session }
  | {
      readonly ok: false;
      readonly requested: string;
      readonly fixtures: ReturnType<typeof fixtureList>;
    };

export function loadFixture(name: string): FixtureLookup {
  const state = buildFixture(name);
  if (!state) return { ok: false, requested: name, fixtures: fixtureList() };
  return { ok: true, session: createSessionFrom(state, fixtureEvents(name)) };
}

/** An unknown fixture name: the list of names that do exist, and nothing else. */
export function UnknownFixture({
  requested,
  fixtures,
}: {
  readonly requested: string;
  readonly fixtures: ReturnType<typeof fixtureList>;
}) {
  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <p>{`No fixture named "${requested}".`}</p>
      <p>Known fixtures:</p>
      <ul>
        {fixtures.map((f) => (
          <li key={f.name}>
            <code>{f.name}</code> — {f.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
