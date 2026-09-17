/* The engine's own verbs for moving cards around.
 *
 * Every rule and every card behaviour goes through these, so a card effect
 * announces itself with the same events a rule would. Nothing here decides
 * anything: the phase logic lives in engine.ts and the card text in
 * cards/behaviours.ts.
 *
 * Each verb takes the events array it should announce itself into and returns
 * the new state. Nothing mutates the state handed to it.
 */

import { HAND_CAP } from "./setup";
import type {
  Card,
  Character,
  DomainEvent,
  DiscardedFrom,
  GameState,
  PlayerState,
} from "./types";
import { shuffle } from "./rng";

export const CHARACTERS: readonly Character[] = ["Red", "Gray"];

export const other = (c: Character): Character => (c === "Red" ? "Gray" : "Red");

export const playerOf = (state: GameState, c: Character): PlayerState => state[c];

export const withPlayer = (state: GameState, c: Character, p: PlayerState): GameState =>
  c === "Red" ? { ...state, Red: p } : { ...state, Gray: p };

/** Everyone not Down. A Down character is skipped by everything (rulebook, Last Stand: Going Down). */
export const standing = (state: GameState): readonly Character[] =>
  CHARACTERS.filter((c) => !state[c].down);

/* --------------------------------------------------------------- discarding */

/**
 * Setup: to discard is to move a card to its owner's discard pile — gone for
 * the floor. Stuff discards like anything else; the Scrapyard only comes into
 * it at ascension (rulebook, Ascending).
 */
export function discard(
  state: GameState,
  c: Character,
  card: Card,
  from: DiscardedFrom,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  events.push({ type: "CARD_DISCARDED", character: c, card, from });
  return withPlayer(state, c, { ...p, discard: [...p.discard, card] });
}

/** Rulebook, Last Stand: Going Down: going Down empties your hand into your discard pile. */
export function goDown(
  state: GameState,
  c: Character,
  cause: string,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  events.push({ type: "WENT_DOWN", character: c, cause });
  let next = withPlayer(state, c, { ...p, down: true, lastStand: false, hand: [] });
  for (const card of p.hand) next = discard(next, c, card, "hand", events);
  return next;
}

/**
 * Rulebook, Card anatomy: Keywords: `Exhaust X cards from your deck` — a loss you did not choose. Off the top,
 * face up, no choices.
 *
 * A card that would be moved from the top of an empty deck puts that
 * character Down (rulebook, About the game: running out of Stamina). Emptying the deck instead — the last card just exhausted was
 * the last one there — puts them in Last Stand right away (rulebook, Last Stand; see
 * `activateLastStand`), whether this call is a room's printed punishment or a
 * card's own `Exhaust X`.
 */
export function exhaustFromDeck(
  state: GameState,
  c: Character,
  amount: number,
  cause: string,
  events: DomainEvent[],
): GameState {
  let next = state;
  for (let i = 0; i < amount; i++) {
    const p = playerOf(next, c);
    if (p.down) return next; // A Down character takes no punishments (rulebook, Last Stand: Going Down).
    const card = p.deck[0];
    if (!card) return goDown(next, c, cause, events);
    next = withPlayer(next, c, { ...p, deck: p.deck.slice(1) });
    next = discard(next, c, card, "deck", events);
    next = activateLastStand(next, events);
  }
  return next;
}

/** Rulebook, Card anatomy: Keywords: `Discard X cards from your hand` — a cost you chose. */
export function discardFromHand(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  let next = withPlayer(state, c, { ...p, hand: p.hand.filter((x) => !ids.has(x.id)) });
  for (const card of cards) next = discard(next, c, card, "hand", events);
  return next;
}

/* ----------------------------------------------------------------- drawing */

/**
 * Each Turn, Draw: draw one card. A full hand does not excuse the opening draw — the card is
 * put straight into the discard pile instead of the hand, so a full hand costs
 * you a card a turn rather than saving you one.
 *
 * `ignoreHandCap` is for a card that says so in its own text.
 *
 * `forced` marks a draw that a card's text made someone else take, as opposed
 * to one they chose or the opening draw. It is stamped onto the resulting
 * event so a card that triggers off draws can tell its own forced draw apart
 * from one that counts toward triggering it again (see `My Head Is Quantum
 * Spinning`, which must not chain off the draw it just forced).
 *
 * Rulebook, Last Stand: a draw that leaves the deck empty puts that character in Last Stand right
 * away (see `activateLastStand`) — every draw goes through here, chosen,
 * opening, or a card's own text, so this is the one place that needs to know.
 */
export function drawOne(
  state: GameState,
  c: Character,
  events: DomainEvent[],
  ignoreHandCap = false,
  forced = false,
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  const card = p.deck[0];
  if (!card) return goDown(state, c, "drew from an empty deck", events);

  const rest = { ...p, deck: p.deck.slice(1), drewThisTurn: p.drewThisTurn + 1 };
  if (!ignoreHandCap && p.hand.length >= HAND_CAP) {
    events.push({ type: "DRAW_BURNED", character: c, card, forced });
    return activateLastStand(discard(withPlayer(state, c, rest), c, card, "deck", events), events);
  }
  events.push({ type: "CARD_DRAWN", character: c, card, forced });
  return activateLastStand(withPlayer(state, c, { ...rest, hand: [...p.hand, card] }), events);
}

/**
 * Rulebook, Last Stand: Going Down: no card may be put into a Down character's hand — you cannot park Stuff on
 * a partner who is out. Stuff pushed into a hand by a room ignores the hand cap
 * entirely, and so does anything else that moves a card to a hand.
 */
export function moveToHand(
  state: GameState,
  c: Character,
  card: Card,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  events.push({ type: "CARD_TO_HAND", character: c, card });
  return withPlayer(state, c, { ...p, hand: [...p.hand, card] });
}

/* ---------------------------------------------------------------- the piles */

/** Rulebook, Card anatomy: Keywords: to Scrap is to move a card to the Scrapyard, gone for the run. */
export function scrap(
  state: GameState,
  c: Character | null,
  card: Card,
  events: DomainEvent[],
): GameState {
  events.push({ type: "CARD_SCRAPPED", character: c, card });
  return { ...state, scrapyard: [...state.scrapyard, card] };
}

/** Shuffle cards into a character's deck. Returns the state with the seed advanced. */
export function shuffleIntoDeck(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  const [deck, seed] = shuffle([...p.deck, ...cards], state.seed);
  if (cards.length > 0) events.push({ type: "CARDS_SHUFFLED_IN", character: c, cards });
  return withPlayer({ ...state, seed }, c, { ...p, deck });
}

/** Cards a character no longer holds. No event: the verb that receives them says so. */
export function takeFromHand(state: GameState, c: Character, cards: readonly Card[]): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, hand: p.hand.filter((x) => !ids.has(x.id)) });
}

/** Cards lifted back out of a discard pile, for a card that says it can. */
export function takeFromDiscard(
  state: GameState,
  c: Character,
  cards: readonly Card[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, discard: p.discard.filter((x) => !ids.has(x.id)) });
}

/** Under the deck, so it is the last thing you will see rather than the next. */
export function moveToBottomOfDeck(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  for (const card of cards) events.push({ type: "CARD_MOVED", character: c, card, to: "deck" });
  return withPlayer(state, c, { ...p, deck: [...p.deck, ...cards] });
}

/**
 * A card taking itself back out of the play zone, at cleanup.
 *
 * Rulebook, Last Stand: Going Down: no card may be put into a Down character's hand, so a card whose owner is
 * out stays in the play zone and is discarded with everything else.
 */
export function returnToHand(
  state: GameState,
  c: Character,
  card: Card,
  events: DomainEvent[],
): GameState {
  if (!state.playZone.some((p) => p.card.id === card.id)) return state;
  if (playerOf(state, c).down) return state;
  const lifted = { ...state, playZone: state.playZone.filter((p) => p.card.id !== card.id) };
  return moveToHand(lifted, c, card, events);
}

/** Arm a free play: the next card played this turn costs nothing, whoever plays it. */
export const grantFreePlay = (state: GameState): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, freePlays: state.thisTurn.freePlays + 1 },
});

/** Drop every free play nobody used. The discount is for a card played this turn. */
export const clearFreePlays = (state: GameState): GameState =>
  state.thisTurn.freePlays === 0
    ? state
    : { ...state, thisTurn: { ...state.thisTurn, freePlays: 0 } };

/** Use up one free play, as the card it paid for is played. */
export const spendFreePlay = (state: GameState): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, freePlays: Math.max(0, state.thisTurn.freePlays - 1) },
});

/** Put a card on top of a deck. Nothing shuffles during a floor, so it is next. */
export function topDeck(state: GameState, c: Character, card: Card): GameState {
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, deck: [card, ...p.deck] });
}

/* -------------------------------------------------------------------- Stuff */

/**
 * What you earn is drawn face down from the Good Stuff pool and goes to that
 * character's hand. A Down character earns nothing. See open-questions.md #20.
 *
 * Every piece handed over is also tallied on `thisTurn.goodStuffTaken`, which
 * is how Crowbar's own "if you got any Good Stuff this turn" looks backward
 * at what has already landed. See open-questions.md #16.
 */
export function takeGoodStuff(
  state: GameState,
  c: Character,
  count: number,
  events: DomainEvent[],
): GameState {
  let next = state;
  for (let i = 0; i < count; i++) {
    if (playerOf(next, c).down) return next;
    const [card, rest, seed] = drawFromPool(next.pools.goodStuff, next.seed);
    // The pool never refills: spent Stuff goes to the Scrapyard at ascension.
    // See open-questions.md #6. Say so — a reward the log announced but the
    // pool could not pay must not go silent (issue #37).
    if (!card) {
      events.push({ type: "STUFF_POOL_EMPTY", character: c, pool: "good_stuff" });
      return next;
    }
    next = { ...next, seed, pools: { ...next.pools, goodStuff: rest } };
    events.push({ type: "STUFF_TAKEN", character: c, card });
    next = moveToHand(next, c, card, events);
    next = {
      ...next,
      thisTurn: {
        ...next.thisTurn,
        goodStuffTaken: { ...next.thisTurn.goodStuffTaken, [c]: next.thisTurn.goodStuffTaken[c] + 1 },
      },
    };
  }
  return next;
}

/** Bad Stuff is dealt to you, as a room's printed "gets Bad Stuff" punishment. */
export function dealBadStuff(
  state: GameState,
  c: Character,
  events: DomainEvent[],
): GameState {
  if (playerOf(state, c).down) return state; // takes no punishments (rulebook, Last Stand: Going Down)
  const [card, rest, seed] = drawFromPool(state.pools.badStuff, state.seed);
  if (!card) {
    events.push({ type: "STUFF_POOL_EMPTY", character: c, pool: "bad_stuff" });
    return state;
  }
  const next = { ...state, seed, pools: { ...state.pools, badStuff: rest } };
  events.push({ type: "STUFF_TAKEN", character: c, card });
  return moveToHand(next, c, card, events);
}

/** Has this once-per-turn trigger already gone off? See open-questions.md #16. */
export const hasFired = (state: GameState, key: string): boolean => state.thisTurn.fired.includes(key);

/** Mark a once-per-turn trigger as spent, so an effect that could feed itself fires once. */
export const markFired = (state: GameState, key: string): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, fired: [...state.thisTurn.fired, key] },
});

function drawFromPool(
  pool: readonly Card[],
  seed: number,
): readonly [Card | null, readonly Card[], number] {
  if (pool.length === 0) return [null, pool, seed];
  const [shuffled, next] = shuffle(pool, seed);
  return [shuffled[0] as Card, shuffled.slice(1), next];
}

/* --------------------------------------------------------------- last stand */

/**
 * Rulebook, Last Stand: your character enters last stand the moment your deck becomes empty.
 * `drawOne` and `exhaustFromDeck` each call this on themselves right after
 * removing a card, so every cause is covered from the one place that moves
 * cards off the top of a deck: a chosen or opening draw, a forced draw, a
 * card's own `Exhaust X`, and a room's printed punishment all see it land in
 * the same step the deck empties, not at the end of the phase. `engine.ts`
 * also sweeps once more at cleanup as a backstop; that call finds nothing left
 * to do in the ordinary case.
 */
export function activateLastStand(state: GameState, events: DomainEvent[]): GameState {
  let next = state;
  for (const c of CHARACTERS) {
    const p = playerOf(next, c);
    if (p.down || p.lastStand || p.deck.length > 0) continue;
    events.push({ type: "LAST_STAND", character: c });
    next = withPlayer(next, c, { ...p, lastStand: true });
  }
  return next;
}

