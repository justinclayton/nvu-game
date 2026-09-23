/* Gray's cards. Keyed by the name design/cards.yaml makes unique.
 *
 * Where a card's printed text allowed more than one reading, the reading is
 * marked here and written up in design/web-game/open-questions.md.
 */

import type { Card, Character, DomainEvent, GameState, Pending } from "../types";
import {
  CHARACTERS,
  drawOne,
  moveToHand,
  playerOf,
  scrap,
  shuffleIntoDeck,
  takeFromExhaust,
  takeFromHand,
} from "../verbs";
import {
  ask,
  done,
  nothing,
  source,
  type BehaviourContext,
  type CardBehaviour,
  type Registry,
} from "./behaviour";

const playedBy = (state: GameState, c: Character): number =>
  state.playZone.filter((p) => p.owner === c).length;

const othersPlayed = (state: GameState, c: Character, self: Card): number =>
  state.playZone.filter((p) => p.owner === c && p.card.id !== self.id).length;

/** Two questions: whose deck, then what order. Depth 1 has no order to choose. */
function peek(depth: number): CardBehaviour {
  const orderPrompt =
    depth === 1
      ? "Put it back on top."
      : `Put those ${String(depth)} back on top, in the order you choose.`;
  return {
    onPlay(state, ctx) {
      const options = CHARACTERS.filter((c) => playerOf(state, c).deck.length > 0);
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCharacter",
        prompt: `Look at the top ${String(depth)} of whose deck?`,
        options,
        source: source(ctx, "peek"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind === "character") {
        const top = playerOf(state, answer.character).deck.slice(0, depth);
        const events: DomainEvent[] = [
          { type: "CARDS_PEEKED", character: answer.character, cards: top },
        ];
        if (top.length < 2) return done(state, events);
        const pending: Pending = {
          kind: "OrderCards",
          prompt: `${answer.character}'s deck. ${orderPrompt}`,
          character: answer.character,
          cards: top,
          source: source(ctx, `order:${answer.character}`),
        };
        return ask(state, pending, events);
      }
      if (answer.kind !== "order") return nothing(state);
      const whose = answer.tag.split(":")[1] === "Red" ? "Red" : "Gray";
      const p = playerOf(state, whose);
      const rest = p.deck.slice(answer.cards.length);
      const reordered = { ...p, deck: [...answer.cards, ...rest] };
      return done(whose === "Red" ? { ...state, Red: reordered } : { ...state, Gray: reordered });
    },
  };
}

/** Shared behaviour: shuffle a chosen Stuff card from one character's hand into their own deck. */
function shuffleStuffFromHand(whose: (ctx: BehaviourContext) => Character): CardBehaviour {
  return {
    onPlay(state, ctx) {
      const target = whose(ctx);
      const options = playerOf(state, target).hand.filter((c) => c.kind !== "player");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: `Shuffle which piece of Stuff into ${target}'s deck?`,
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "shuffle-stuff"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const target = whose(ctx);
      const events: DomainEvent[] = [];
      const lifted = takeFromHand(state, target, answer.cards);
      return done(shuffleIntoDeck(lifted, target, answer.cards, events), events);
    },
  };
}

export const GRAY: Registry = {
  /* "Look at the top card of any deck, then put it back on top. (Peek 1?)" */
  "Peek Around Corner": peek(1),

  /* "Look at the top 2 cards of any deck. Put them back in either order." */
  "Catch Your Breath": peek(2),

  /* "Look at the top 3 cards of any deck, then put them back in any order." */
  "Hack the Doors": peek(3),

  /* "Oomph equal to twice the number of cards Red has played this turn." */
  "In Step": {
    stats(state, _owner, card) {
      return { oomph: 2 * playedBy(state, "Red"), scramble: card.scramble };
    },
  },

  /* "If any Bad Stuff is played this turn, Oomph 2 and Scramble 2."
   *
   * Bad Stuff itself contributes no stats; this card is what makes playing
   * a piece of it worth anything. */
  "One Man's Junk": {
    stats(state) {
      const played = state.playZone.some((p) => p.card.kind === "bad_stuff");
      return played ? { oomph: 2, scramble: 2 } : { oomph: 0, scramble: 0 };
    },
  },

  /* "Move 1 Stuff from your hand to Red's hand."
   *
   * Rulebook §9, Going Down: no card may be put into a Down character's hand. */
  "Here, Catch": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand.filter((c) => c.kind !== "player");
      if (options.length === 0 || state.Red.down) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Which piece of Stuff goes to Red?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "here-catch"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards" || state.Red.down) return nothing(state);
      const events: DomainEvent[] = [];
      let s = takeFromHand(state, ctx.character, answer.cards);
      for (const card of answer.cards) s = moveToHand(s, "Red", card, events);
      return done(s, events);
    },
  },

  /* "Shuffle a Gray card from your Exhaust pile into your deck." */
  "Hit 'n Run": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).exhaust.filter((c) => c.owner === "Gray");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which Gray card from your Exhaust pile into your deck?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "hit-n-run"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFromExhaust(state, ctx.character, answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "Shuffle 1 Stuff from Red's hand into Red's deck." */
  "I'll Take That": shuffleStuffFromHand(() => "Red"),

  /* "Every time Red plays a card this turn, draw 1 card."
   *
   * A card-driven exception to Play's no-draw rule. See open-questions.md #13. */
  "Covering Fire": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "playZone") return nothing(state);
      if (event.type !== "CARD_PLAYED" || event.character !== "Red") return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, ctx.character, events), events);
    },
  },

  /* "Scramble equal to twice the number of other cards Gray played this turn." */
  "Every Little Bit Helps": {
    stats(state, owner, card) {
      return { oomph: card.oomph, scramble: 2 * othersPlayed(state, owner, card) };
    },
  },

  /* "Scrap a card from your hand. If you do, draw the top card from the Gray
   * Rewards deck directly into your hand."
   *
   * The Gray Rewards deck is Gray's reward pool (rulebook §5, Setup); its top card goes to hand, not deck. */
  "Level Up": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand;
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Scrap a card from your hand?",
        character: ctx.character,
        options,
        count: 1,
        optional: true,
        source: source(ctx, "level-up"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards" || answer.cards.length === 0) return nothing(state);
      const events: DomainEvent[] = [];
      let s = takeFromHand(state, ctx.character, answer.cards);
      for (const card of answer.cards) s = scrap(s, ctx.character, card, events);
      const top = s.pools[ctx.character][0];
      if (!top) return done(s, events);
      s = {
        ...s,
        pools:
          ctx.character === "Red"
            ? { ...s.pools, Red: s.pools.Red.slice(1) }
            : { ...s.pools, Gray: s.pools.Gray.slice(1) },
      };
      events.push({ type: "REWARD_TAKEN", character: ctx.character, card: top });
      return done(moveToHand(s, ctx.character, top, events), events);
    },
  },

  /* "Holding: when you play a card with Scramble, draw 1 card." */
  "I Know Kung Fu": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "CARD_PLAYED" || event.character !== ctx.character) return nothing(state);
      if (event.card.scramble <= 0) return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, ctx.character, events), events);
    },
  },
};
