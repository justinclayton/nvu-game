/* Red's cards. Keyed by the name design/cards.yaml makes unique. */

import type { DomainEvent } from "../types";
import { othersPlayed, playedBy } from "../queries";
import { playerOf, returnToHand, shuffleIntoDeck, takeFrom } from "../verbs";
import { ask, done, nothing, source, type Registry } from "./behaviour";

export const RED: Registry = {
  /* "Exhaust 2." */
  Overdrive: { exhaustX: 2 },

  /* "Exhaust 1." */
  "Reckless Swing": { exhaustX: 1 },

  /* "Exhaust 3." */
  Reckless: { exhaustX: 3 },

  /* "Holding: you don't `Exhaust`."
   *
   * Stops only bare `Exhaust X` lines (room punishments, Overdrive, Reckless,
   * Panic), not costs or cleanup. Holder-only. */
  "Zen Mode": {
    whileHeld: { ignoresExhaustX: true },
  },

  /* "If Gray played a card this turn, play this card for free." */
  "Fast Follow": {
    freeIf(state) {
      return playedBy(state, "Gray") > 0;
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

  /* "This has Oomph +2 for each card you paid with this turn."
   *
   * Cards paid with have already gone to the discard pile, so the turn record is
   * what counts them. */
  "Junk Launcher": {
    stats(state, owner, card) {
      return { oomph: card.oomph + 2 * state.thisTurn.paid[owner], scramble: card.scramble };
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

  /* "Holding: Cards you play have +1 Oomph. At Turn Start, draw 1 fewer card." */
  "Deadweight Grip": {
    whileHeld: { playedPowerDelta: 1, drawTargetDelta: 1 },
  },

  /* "If Gray has already played at least one card this turn, +2 Oomph. If the
   * room is Cleared, return this to your hand at the end of the turn." */
  "Both Barrels": {
    stats(state, _owner, card) {
      const bonus = playedBy(state, "Gray") > 0 ? 2 : 0;
      return { oomph: card.oomph + bonus, scramble: card.scramble };
    },
    onCleanup(state, ctx) {
      if (state.resolution?.roomEnded !== "Cleared") return nothing(state);
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "Oomph equal to twice the number of other cards Red played this turn." */
  Flurry: {
    stats(state, owner, card) {
      return { oomph: 2 * othersPlayed(state, owner, card), scramble: card.scramble };
    },
  },
};
