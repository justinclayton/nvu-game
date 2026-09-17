/* The composition root. This is the one place that knows a browser is involved:
 * it asks infrastructure for a seed, builds a session out of the card content,
 * and hands it to the UI. No layer imports across the table here.
 */

import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { createSession } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import { freshSeed } from "@infrastructure/seed";
import { App } from "@ui/App";

const container = document.getElementById("root");
if (!container) throw new Error("index.html is missing #root");
const root: Root = createRoot(container);

function startFresh(): void {
  const session = createSession(freshSeed(), CARD_CONTENT);
  root.render(
    <StrictMode>
      <App session={session} onNewRun={startFresh} />
    </StrictMode>,
  );
}

/**
 * Dev only: `?fixture=<name>` opens the app already parked on a named state,
 * so a PR can carry a screenshot of a screen that otherwise takes several
 * turns of play to reach. The dynamic import, guarded by `import.meta.env.DEV`,
 * is what lets a production build tree-shake the loader and every fixture out.
 */
function startFromFixture(name: string): void {
  void import("./devFixtures").then(({ loadFixture, UnknownFixture }) => {
    const found = loadFixture(name);
    root.render(
      <StrictMode>
        {found.ok ? (
          <App session={found.session} onNewRun={startFresh} />
        ) : (
          <UnknownFixture requested={found.requested} fixtures={found.fixtures} />
        )}
      </StrictMode>,
    );
  });
}

function start(): void {
  if (import.meta.env.DEV) {
    const fixture = new URLSearchParams(window.location.search).get("fixture");
    if (fixture !== null) {
      startFromFixture(fixture);
      return;
    }
  }
  startFresh();
}

start();
