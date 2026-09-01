/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique. */

import type { Registry } from "./behaviour";

export const STUFF: Registry = {
  /* "Holding: cards cost +1 to play."
   *
   * §7: Bad Stuff contributes no stats. It is a cut to your usable hand size
   * that you have to pay to undo — and while it sits there, everything is
   * dearer. It bites its holder only: Red never pays for Gray (§5). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },
};
