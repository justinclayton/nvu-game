/* Gray's cards. Keyed by the name cards.yaml makes unique. */

import { playedBy } from "../queries";
import {
  PILES,
  type Character,
  type DomainEvent,
  type GameState,
  type Pile,
} from "../types";
import {
  drawCards,
  grantPlayDiscount,
  moveToBottomOfDeck,
  moveToHand,
  pileCards,
  playerOf,
  shuffleIntoDeck,
  takeFrom,
  withPile,
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

/**
 * Rulebook, Keywords: `Peek X`: "Reveal the top **X** cards of ANY face-down
 * pile. Move any number of them to the bottom of that pile in any order, then
 * put the rest back on top in any order."
 *
 * Up to four questions: which pile; which of the peeked cards go to the
 * bottom (none to all); the order of those, when two or more; the order of
 * those that stay, when two or more. The chosen cards move at once, so the
 * pile is [stay, untouched rest, bottom] and each later order only rearranges
 * the first or last few of it; the tags carry those counts. Nothing is
 * discarded and nothing reshuffles (Peek is not a draw): a short pile shows
 * what is there.
 */
function peek(depth: number): CardBehaviour {
  const orderTop = (
    state: GameState,
    ctx: BehaviourContext,
    pile: Pile,
    staying: number,
    events: DomainEvent[],
  ) => {
    if (staying < 2) return done(state, events);
    return ask(
      state,
      {
        kind: "OrderCards",
        prompt: `${pile}. Put those ${String(staying)} back on top, in the order you choose.`,
        pile,
        cards: pileCards(state, pile).slice(0, staying),
        source: source(ctx, `top:${pile}:${String(staying)}`),
      },
      events,
    );
  };
  return {
    onPlay(state, ctx) {
      const options = PILES.filter((p) => pileCards(state, p).length > 0);
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChoosePile",
        prompt: `Peek ${String(depth)}: reveal the top ${String(depth)} of which deck?`,
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
        if (top.length === 0) return done(state, events);
        return ask(
          state,
          {
            kind: "ChooseBottom",
            prompt: `${answer.pile}: choose any of these to move to the bottom of the pile, or none to keep them all on top.`,
            pile: answer.pile,
            cards: top,
            source: source(ctx, `bottom:${answer.pile}`),
          },
          events,
        );
      }
      if (answer.kind !== "order") return nothing(state);
      const [step, pileName, count] = answer.tag.split(":");
      const pile = pileName as Pile;
      const all = pileCards(state, pile);
      if (step === "bottom") {
        // Rulebook: the cards go to the bottom; the rest of what was shown stays on top.
        const moved = new Set(answer.cards.map((c) => c.id));
        const shown = all.slice(0, depth);
        const stay = shown.filter((c) => !moved.has(c.id));
        const events: DomainEvent[] =
          answer.cards.length === 0
            ? []
            : [{ type: "CARDS_TO_BOTTOM", character: ctx.character, pile, cards: answer.cards }];
        const next = withPile(state, pile, [
          ...stay,
          ...all.slice(shown.length),
          ...answer.cards,
        ]);
        if (answer.cards.length > 1) {
          return ask(
            next,
            {
              kind: "OrderCards",
              prompt: `${pile}. Put those ${String(answer.cards.length)} on the bottom, in the order you choose: the first goes in highest, the last is the very bottom.`,
              pile,
              cards: answer.cards,
              source: source(ctx, `bottomorder:${pile}:${String(stay.length)}`),
            },
            events,
          );
        }
        return orderTop(next, ctx, pile, stay.length, events);
      }
      if (step === "bottomorder") {
        const stay = Number(count);
        const head = all.slice(0, all.length - answer.cards.length);
        const next = withPile(state, pile, [...head, ...answer.cards]);
        return orderTop(next, ctx, pile, stay, []);
      }
      const rest = all.slice(answer.cards.length);
      return done(withPile(state, pile, [...answer.cards, ...rest]));
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

/** Pack Mule: offer the next piece of Stuff in Red's hand, or stop when none is left. */
function packMule(state: GameState, ctx: BehaviourContext, events: readonly DomainEvent[]) {
  const options = playerOf(state, "Red").hand.filter((c) => c.kind !== "player");
  if (options.length === 0) return done(state, events);
  return ask(
    state,
    {
      kind: "ChooseCards",
      prompt: "Take which piece of Stuff from Red's hand? Choose none to stop.",
      character: ctx.character,
      options,
      count: 1,
      optional: true,
      source: source(ctx, "pack-mule"),
    },
    events,
  );
}

export const GRAY: Registry = {
  "Peek Around Corner": {
    onPlay(state, ctx) {
      const events: DomainEvent[] = [];
      return done(drawCards(state, ctx.character, 1, events), events);
    },
  },

  /* Decided once Play ends, when it is known whether Gray played anything else. */
  "Catch Your Breath": {
    onPlayEnd(state, ctx) {
      if (playedBy(state, ctx.character) !== 1) return nothing(state);
      const exhaust = playerOf(state, ctx.character).exhaust;
      if (exhaust.length === 0) return nothing(state);
      if (exhaust.length <= 3) {
        const events: DomainEvent[] = [];
        const lifted = takeFrom(state, ctx.character, "exhaust", exhaust);
        return done(moveToBottomOfDeck(lifted, ctx.character, exhaust, events), events);
      }
      return done(
        askLater(state, {
          kind: "ChooseCards",
          prompt: "Move which 3 cards from your Exhaust pile to the bottom of your deck?",
          character: ctx.character,
          options: exhaust,
          count: 3,
          optional: false,
          source: source(ctx, "catch-your-breath"),
        }),
      );
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFrom(state, ctx.character, "exhaust", answer.cards);
      return done(moveToBottomOfDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  "Quick Vault": {
    onPlay(state, ctx) {
      return ask(state, drawQuestion(ctx, "quick-vault", "Draw up to 2 cards?", ctx.character, 2));
    },
    onChoice: (answer, state) => drawnAs(answer, state),
  },

  "Hack the Doors": peek(3),

  "In Step": {
    stats(state, _owner, card) {
      return { oomph: card.oomph, scramble: 2 * playedBy(state, "Red") };
    },
  },

  "One Man's Junk": {
    stats(state, owner) {
      const held = playerOf(state, owner).hand.filter((c) => c.kind === "bad_stuff").length;
      return { oomph: 3 * held, scramble: 3 * held };
    },
  },

  /* One card at a time until Gray takes no more, since a question offers an exact count. */
  "Pack Mule": {
    onPlay(state, ctx) {
      return packMule(state, ctx, []);
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards" || answer.cards.length === 0) return nothing(state);
      const events: DomainEvent[] = [];
      let s = takeFrom(state, "Red", "hand", answer.cards);
      for (const card of answer.cards) s = moveToHand(s, ctx.character, card, events);
      return packMule(s, ctx, events);
    },
  },

  "Hit 'n Run": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).exhaust;
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which card from your Exhaust pile into your deck?",
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

  "I'll Take That": shuffleStuffFromHand(() => "Red"),

  /* A card-driven exception to Play's no-draw rule. A reaction cannot suspend, so each Red play
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

  /* Covering Fire's shape: listens from the play zone, either character's play, printed Scramble. */
  "I Know Kung Fu": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "playZone") return nothing(state);
      if (event.type !== "CARD_PLAYED" || event.card.scramble === 0) return nothing(state);
      if (playerOf(state, ctx.character).down) return nothing(state);
      return done(
        askLater(
          state,
          drawQuestion(
            ctx,
            "i-know-kung-fu",
            `I Know Kung Fu: ${event.character} played ${event.card.name}. Draw 1 card?`,
            ctx.character,
          ),
        ),
      );
    },
    onChoice: (answer, state) => drawnAs(answer, state),
  },

  "Sharing Is Caring": {
    whileInPlay: { sharesHands: true },
  },

  Pivot: {
    onPlay(state) {
      return done(grantPlayDiscount(state, "Red"));
    },
  },

  /* One question: with Red's play behind it, the two optional draws come to "up to 2". */
  "Synergy Link": {
    onPlay(state, ctx) {
      const max = playedBy(state, "Red") > 0 ? 2 : 1;
      const prompt = max === 2 ? "Draw up to 2 cards?" : "Draw 1 card?";
      return ask(state, drawQuestion(ctx, "synergy-link", prompt, ctx.character, max));
    },
    onChoice: (answer, state) => drawnAs(answer, state),
  },
};
