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

/**
 * Notes to type into a fixture's log as it opens, for the screens where what
 * is worth looking at is a note in place. They land at the end of the log the
 * same way a typed one does, because that is the same code path.
 *
 * A note is session data, not state, so it cannot live in the fixtures beside
 * the rigged states: the domain has never heard of a note.
 */
const FIXTURE_NOTES: Readonly<Record<string, readonly string[]>> = {
  "empty-good-stuff": [
    "the log says Red gets Good Stuff and then says there was none — which happened?",
  ],
};

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
  const session = createSessionFrom(state, fixtureEvents(name));
  for (const text of FIXTURE_NOTES[name] ?? []) session.getState().note(text);
  return { ok: true, session };
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
