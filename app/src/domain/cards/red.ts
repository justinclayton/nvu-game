/* Red's cards. Keyed by the name design/cards.yaml makes unique. */

import type { DomainEvent } from "../types";
import { playedBy } from "../queries";
import {
  bankNextPlayScramble,
  drawOne,
  exhaustFromHand,
  playerOf,
  scrap,
  shuffleIntoDeck,
  takeFrom,
} from "../verbs";
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

  /* "Oomph equal to the total printed cost of all cards in the play zone." */
  "Junk Launcher": {
    stats(state, _owner, card) {
      const total = state.playZone.reduce((sum, p) => sum + p.card.cost, 0);
      return { oomph: total, scramble: card.scramble };
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

  /* "Play: Scrap 1 card from your hand." */
  "Break Through": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand;
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Scrap which card from your hand?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "break-through"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      let s = takeFrom(state, ctx.character, "hand", answer.cards);
      for (const card of answer.cards) s = scrap(s, ctx.character, card, events);
      return done(s, events);
    },
  },

  /* "Play: The next card Gray plays this turn gains +2 Scramble." */
  "Set 'Em Up": {
    onPlay(state) {
      return done(bankNextPlayScramble(state, "Gray", 2));
    },
  },

  /* "Play: Scrap 1 starter card from your hand or discard pile. If you do, draw 1 card." */
  "Brute Recycle": {
    onPlay(state, ctx) {
      const p = playerOf(state, ctx.character);
      const options = [...p.hand, ...p.discard].filter((c) => c.starter);
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Scrap which starter card from your hand or discard pile?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "brute-recycle"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const inHand = playerOf(state, ctx.character).hand;
      let s = state;
      for (const card of answer.cards) {
        const pile = inHand.some((c) => c.id === card.id) ? "hand" : "discard";
        s = scrap(takeFrom(s, ctx.character, pile, [card]), ctx.character, card, events);
      }
      return done(drawOne(s, ctx.character, events), events);
    },
  },

  /* "Play: Gains Oomph +2 for each card Gray has played this turn. If Gray played 2 or more
   * cards, draw 1 card." */
  "Rhythm & Bruise": {
    stats(state, _owner, card) {
      return { oomph: card.oomph + 2 * playedBy(state, "Gray"), scramble: card.scramble };
    },
    onPlay(state, ctx) {
      if (playedBy(state, "Gray") < 2) return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, ctx.character, events), events);
    },
  },

  /* "Play: Draw 2 cards, then Exhaust 1 card from your hand." */
  "Momentum Shift": {
    onPlay(state, ctx) {
      const events: DomainEvent[] = [];
      let s = drawOne(state, ctx.character, events);
      s = drawOne(s, ctx.character, events);
      const options = playerOf(s, ctx.character).hand;
      if (s.phase === "GameOver" || options.length === 0) return done(s, events);
      return ask(
        s,
        {
          kind: "ChooseCards",
          prompt: "Exhaust which card from your hand?",
          character: ctx.character,
          options,
          count: 1,
          optional: false,
          source: source(ctx, "momentum-shift"),
        },
        events,
      );
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      return done(exhaustFromHand(state, ctx.character, answer.cards, events), events);
    },
  },
};
