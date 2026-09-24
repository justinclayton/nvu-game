/* Red's cards. Keyed by the name design/cards.yaml makes unique. */

import type { DomainEvent } from "../types";
import { playedBy } from "../queries";
import { drawOne, playerOf, shuffleIntoDeck, takeFrom } from "../verbs";
import { ask, done, nothing, source, type Registry } from "./behaviour";

export const RED: Registry = {
  /* "Exhaust 2." */
  Overdrive: { exhaustX: 2 },

  /* "Exhaust 1." */
  "Reckless Swing": { exhaustX: 1 },

  /* "Exhaust 3." */
  Reckless: { exhaustX: 3 },

  /* "Exhaust 1." */
  "Cross Punch": { exhaustX: 1 },

  /* "If Gray played a card this turn, play this card for free." */
  "Fast Follow": {
    freeIf(state) {
      return playedBy(state, "Gray") > 0;
    },
  },

  /* "If Gray played a card this turn, draw 1 card." */
  "Tag Team": {
    onPlay(state, ctx) {
      if (playedBy(state, "Gray") === 0) return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, ctx.character, events), events);
    },
  },

  /* "Shuffle a Red card from your Exhaust pile into your deck."
   *
   * Red's own cards only: Stuff in the Exhaust pile is not a Red card. */
  "Second Wind": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).exhaust.filter((c) => c.owner === "Red");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which Red card from your Exhaust pile into your deck?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "second-wind"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFrom(state, ctx.character, "exhaust", answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "This card gains Oomph +2 for each card spent to play it this turn."
   *
   * Cards paid with have already gone to the discard pile, so the turn record is
   * what counts them — keyed by this card's own id, not its owner, so a later
   * payment for a different card doesn't also inflate this one. */
  "Junk Launcher": {
    stats(state, _owner, card) {
      return {
        oomph: card.oomph + 2 * (state.thisTurn.paidFor[card.id] ?? 0),
        scramble: card.scramble,
      };
    },
  },

  /* "Shuffle 1 Stuff from your hand into your deck." */
  "Heavy Pockets": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand.filter((c) => c.kind !== "player");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which piece of Stuff into your deck?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "heavy-pockets"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFrom(state, ctx.character, "hand", answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },
};
