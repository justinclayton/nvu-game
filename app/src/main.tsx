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

function start(): void {
  const session = createSession(freshSeed(), CARD_CONTENT);
  root.render(
    <StrictMode>
      <App session={session} onNewRun={start} />
    </StrictMode>,
  );
}

start();
