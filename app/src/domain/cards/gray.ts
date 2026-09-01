/* Gray's cards. Keyed by the name design/cards.yaml makes unique. */

import type { DomainEvent } from "../types";
import { CHARACTERS, playerOf } from "../verbs";
import { ask, done, nothing, source, type Registry } from "./behaviour";

export const GRAY: Registry = {
  /* "Look at the top card of any deck, then put it back on top."
   *
   * Any deck, so the player says whose. One card put back on top has no order
   * to choose, so the look is the whole of the effect. */
  "Peek Around Corner": {
    onPlay(state, ctx) {
      const options = CHARACTERS.filter((c) => playerOf(state, c).deck.length > 0);
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCharacter",
        prompt: "Look at the top card of whose deck?",
        options,
        source: source(ctx, "peek"),
      });
    },
    onChoice(answer, state) {
      if (answer.kind !== "character") return nothing(state);
      const top = playerOf(state, answer.character).deck.slice(0, 1);
      const events: DomainEvent[] = [
        { type: "CARDS_PEEKED", character: answer.character, cards: top },
      ];
      return done(state, events);
    },
  },
};
