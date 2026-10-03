/* Gray's cards. Keyed by the name design/cards.yaml makes unique. */

import { playedBy } from "../queries";
import { PILES, type Character, type DomainEvent, type Pending, type Pile } from "../types";
import {
  discard,
  grantPlayDiscount,
  moveToHand,
  pileCards,
  playerOf,
  shuffleIntoDeck,
  takeFrom,
  withPile,
  withPlayer,
} from "../verbs";
import {
  ask,
  askLater,
  done,
  drawnAs,
  drawQuestion,
  nothing,
  source,
  type BehaviourContext,
  type CardBehaviour,
  type Registry,
} from "./behaviour";

/** Two questions: which pile, then what order. Depth 1 has no order to choose. */
function peek(depth: number): CardBehaviour {
  const orderPrompt =
    depth === 1
      ? "Put it back on top."
      : `Put those ${String(depth)} back on top, in the order you choose.`;
  return {
    onPlay(state, ctx) {
      const options = PILES.filter((p) => pileCards(state, p).length > 0);
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChoosePile",
        prompt: `Look at the top ${String(depth)} of any deck.`,
        options,
        source: source(ctx, "peek"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind === "pile") {
        const top = pileCards(state, answer.pile).slice(0, depth);
        const events: DomainEvent[] = [
          { type: "CARDS_PEEKED", character: ctx.character, pile: answer.pile, cards: top },
        ];
        if (top.length < 2) return done(state, events);
        const pending: Pending = {
          kind: "OrderCards",
          prompt: `${answer.pile}. ${orderPrompt}`,
          pile: answer.pile,
          cards: top,
          source: source(ctx, `order:${answer.pile}`),
        };
        return ask(state, pending, events);
      }
      if (answer.kind !== "order") return nothing(state);
      const pile = answer.tag.split(":")[1] as Pile;
      const rest = pileCards(state, pile).slice(answer.cards.length);
      return done(withPile(state, pile, [...answer.cards, ...rest]));
    },
  };
}

/**
 * Rulebook, Keywords: `Scry X` — look at the top X cards of your own deck,
 * discard any number of them, put the rest back in the same order. Every
 * printed Scry is Scry 1, so the choice is the one card or none. A short or
 * empty deck looks at what is there; nothing reshuffles (Scry is not a draw).
 */
function scry(): CardBehaviour {
  return {
    onPlay(state, ctx) {
      const top = playerOf(state, ctx.character).deck.slice(0, 1);
      if (top.length === 0) return nothing(state);
      return ask(
        state,
        {
          kind: "ChooseCards",
          prompt: `Scry 1: discard ${top[0]?.name ?? "it"}, or leave it on top?`,
          character: ctx.character,
          options: top,
          count: 1,
          optional: true,
          source: source(ctx, "scry"),
        },
        [{ type: "CARDS_SCRIED", character: ctx.character, cards: top }],
      );
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const p = playerOf(state, ctx.character);
      const gone = new Set(answer.cards.map((c) => c.id));
      const lifted = withPlayer(state, ctx.character, {
        ...p,
        deck: p.deck.filter((c) => !gone.has(c.id)),
      });
      let next = lifted;
      for (const card of answer.cards) next = discard(next, ctx.character, card, "deck", events);
      return done(next, events);
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
      const lifted = takeFrom(state, target, "hand", answer.cards);
      return done(shuffleIntoDeck(lifted, target, answer.cards, events), events);
    },
  };
}

export const GRAY: Registry = {
  /* "Scry 1." */
  "Peek Around Corner": scry(),

  /* "Look at top 2 cards of any deck. Put them back in either order." */
  "Catch Your Breath": peek(2),

  /* "Look at top 3 cards of any deck, put back in any order." */
  "Hack the Doors": peek(3),

  /* "Scramble equal to 2 times the number of cards Red has played this turn." */
  "In Step": {
    stats(state, _owner, card) {
      return { oomph: card.oomph, scramble: 2 * playedBy(state, "Red") };
    },
  },

  /* "If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1."
   *
   * Bad Stuff itself contributes no stats; this card is what makes playing
   * a piece of it worth anything. */
  "One Man's Junk": {
    stats(state, _owner, card) {
      const played = state.playZone.some((p) => p.card.kind === "bad_stuff");
      return played
        ? { oomph: card.oomph + 1, scramble: card.scramble + 1 }
        : { oomph: card.oomph, scramble: card.scramble };
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
      let s = takeFrom(state, ctx.character, "hand", answer.cards);
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
      const lifted = takeFrom(state, ctx.character, "exhaust", answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "Shuffle 1 Stuff from Red's hand into Red's deck." */
  "I'll Take That": shuffleStuffFromHand(() => "Red"),

  /* "Every time Red plays a card this turn, you may draw 1 card."
   *
   * A card-driven exception to Play's no-draw rule. A reaction cannot suspend, so each Red play
   * queues the question and the engine asks it once the play is done (`TurnRecord.questions`). */
  "Covering Fire": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "playZone") return nothing(state);
      if (event.type !== "CARD_PLAYED" || event.character !== "Red") return nothing(state);
      if (playerOf(state, ctx.character).down) return nothing(state);
      return done(
        askLater(
          state,
          drawQuestion(
            ctx,
            "covering-fire",
            `Covering Fire: Red played ${event.card.name}. Draw 1 card?`,
            ctx.character,
          ),
        ),
      );
    },
    onChoice: (answer, state) => drawnAs(answer, state),
  },

  /* "The next card Red plays this turn costs 1 fewer card to play." */
  "Distract & Pivot": {
    onPlay(state) {
      return done(grantPlayDiscount(state, "Red"));
    },
  },

  /* "Play: You may draw 1 card. If Red has played a card this turn, you may draw 1 more."
   *
   * One question: with Red's play behind it, the two optional draws come to "up to 2". */
  "Synergy Link": {
    onPlay(state, ctx) {
      const max = playedBy(state, "Red") > 0 ? 2 : 1;
      const prompt = max === 2 ? "Draw up to 2 cards?" : "Draw 1 card?";
      return ask(state, drawQuestion(ctx, "synergy-link", prompt, ctx.character, max));
    },
    onChoice: (answer, state) => drawnAs(answer, state),
  },
};
