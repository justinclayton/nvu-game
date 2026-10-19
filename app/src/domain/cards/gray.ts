/* Gray's cards. Keyed by the name cards.yaml makes unique. */

import { playedBy } from "../queries";
import {
  PILES,
  type Card,
  type Character,
  type DomainEvent,
  type GameState,
  type Pile,
  type Room,
} from "../types";
import {
  discard,
  grantPlayDiscount,
  moveToBottomOfDeck,
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

/** The character whose discard pile a Peek at this pile can discard to; the other piles have none. */
function deckOwner(pile: Pile): Character | null {
  if (pile === "Red deck") return "Red";
  if (pile === "Gray deck") return "Gray";
  return null;
}

/**
 * Rulebook, Keywords: `Peek X` — reveal the top X of any face-down pile,
 * discard any number of them, then put the rest back in any order.
 *
 * Up to three questions: which pile, what to discard, what order. The discard
 * question is asked one card at a time until the player keeps the rest, since
 * a question offers an exact count. Only a character deck has a discard pile
 * to discard to, so the other piles go straight to the order. A short pile
 * shows what is there; nothing reshuffles (Peek is not a draw).
 */
function peek(depth: number): CardBehaviour {
  const order = (
    state: GameState,
    ctx: BehaviourContext,
    pile: Pile,
    shown: readonly (Card | Room)[],
    events: DomainEvent[],
  ) => {
    if (shown.length < 2) return done(state, events);
    return ask(
      state,
      {
        kind: "OrderCards",
        prompt: `${pile}. Put those ${String(shown.length)} back on top, in the order you choose.`,
        pile,
        cards: shown,
        source: source(ctx, `order:${pile}`),
      },
      events,
    );
  };
  const offerDiscard = (
    state: GameState,
    ctx: BehaviourContext,
    pile: Pile,
    owner: Character,
    showing: number,
    events: DomainEvent[],
  ) => {
    const shown = playerOf(state, owner).deck.slice(0, showing);
    if (shown.length === 0) return done(state, events);
    const prompt =
      shown.length === 1
        ? `${pile}: discard ${shown[0]?.name ?? "it"}, or leave it on top?`
        : `${pile}: discard one of these, or choose none to keep the rest?`;
    return ask(
      state,
      {
        kind: "ChooseCards",
        prompt,
        character: ctx.character,
        options: shown,
        count: 1,
        optional: true,
        source: source(ctx, `discard:${pile}:${String(shown.length)}`),
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
        const owner = deckOwner(answer.pile);
        if (owner === null) return order(state, ctx, answer.pile, top, events);
        return offerDiscard(state, ctx, answer.pile, owner, top.length, events);
      }
      if (answer.kind === "cards") {
        const [, pileName, count] = answer.tag.split(":");
        const pile = pileName as Pile;
        const owner = deckOwner(pile);
        if (owner === null) return nothing(state);
        const showing = Number(count);
        if (answer.cards.length === 0) {
          return order(state, ctx, pile, playerOf(state, owner).deck.slice(0, showing), []);
        }
        const events: DomainEvent[] = [];
        const p = playerOf(state, owner);
        const gone = new Set(answer.cards.map((c) => c.id));
        let next = withPlayer(state, owner, { ...p, deck: p.deck.filter((c) => !gone.has(c.id)) });
        for (const card of answer.cards) next = discard(next, owner, card, "deck", events);
        return offerDiscard(next, ctx, pile, owner, showing - answer.cards.length, events);
      }
      if (answer.kind !== "order") return nothing(state);
      const pile = answer.tag.split(":")[1] as Pile;
      const rest = pileCards(state, pile).slice(answer.cards.length);
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

/** Here, Catch: offer the next piece of Stuff in Red's hand, or stop when none is left. */
function hereCatch(state: GameState, ctx: BehaviourContext, events: readonly DomainEvent[]) {
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
      source: source(ctx, "here-catch"),
    },
    events,
  );
}

export const GRAY: Registry = {
  "Peek Around Corner": peek(1),

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
  "Here, Catch": {
    onPlay(state, ctx) {
      return hereCatch(state, ctx, []);
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards" || answer.cards.length === 0) return nothing(state);
      const events: DomainEvent[] = [];
      let s = takeFrom(state, "Red", "hand", answer.cards);
      for (const card of answer.cards) s = moveToHand(s, ctx.character, card, events);
      return hereCatch(s, ctx, events);
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

  "Zen Mode": {
    whileInPlay: { preventsExhaust: true },
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
