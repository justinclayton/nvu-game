/* The composition root. This is the one place that knows a browser is involved:
 * it asks infrastructure for a seed, builds a session out of the card content,
 * and hands it to the UI. No layer imports across the table here.
 */

import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { openRunFile } from "@application/replay";
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
      <App session={session} onNewRun={startFresh} onOpenRun={startReplay} />
    </StrictMode>,
  );
}

/**
 * A run file (the `.json` export, or one the CLI or a bot wrote) opens as a
 * replay: the table at the seed, and a bar that steps through the recording.
 */
function startReplay(text: string): void {
  const opened = openRunFile(text, CARD_CONTENT);
  if (!opened.ok) {
    window.alert(opened.reason);
    return;
  }
  root.render(
    <StrictMode>
      <App
        session={opened.replay.getState().session}
        onNewRun={startFresh}
        onOpenRun={startReplay}
        replay={opened.replay}
      />
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
          <App session={found.session} onNewRun={startFresh} onOpenRun={startReplay} />
        ) : (
          <UnknownFixture requested={found.requested} fixtures={found.fixtures} />
        )}
      </StrictMode>,
    );
  });
}

/**
 * Dev only, throwaway: `?prototype=one-place` opens the sketch of the one
 * place (issue #245) around a live table. Same guard and dynamic import as
 * the fixture loader, so a production build never carries it.
 */
function startPrototype(): void {
  void import("./prototype/one-place").then(({ OnePlacePrototype }) => {
    root.render(<OnePlacePrototype />);
  });
}

function start(): void {
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    const fixture = params.get("fixture");
    if (fixture !== null) {
      startFromFixture(fixture);
      return;
    }
    if (params.get("prototype") === "one-place") {
      startPrototype();
      return;
    }
  }
  startFresh();
}

start();
