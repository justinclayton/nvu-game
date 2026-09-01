/* Red's cards. Keyed by the name design/cards.yaml makes unique. */

import type { DomainEvent } from "../types";
import { exhaustFromDeck } from "../verbs";
import { done, type Registry } from "./behaviour";

export const RED: Registry = {
  /* "Exhaust 2 (the top 2 cards of your deck go to your Exhaust pile)."
   *
   * §8: `Exhaust X cards from your deck` is a loss you did not choose — off the
   * top, face up, no choices. An empty deck here is what puts you Down (§9). */
  Overdrive: {
    onPlay(state, ctx) {
      const events: DomainEvent[] = [];
      return done(exhaustFromDeck(state, ctx.character, 2, "Overdrive", events), events);
    },
  },
};
