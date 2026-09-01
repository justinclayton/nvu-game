/* What a card behaviour is allowed to say, and the small helpers for saying it.
 *
 * A behaviour composes the engine's own verbs and never writes a state field
 * directly, so a card effect announces itself with the same events a rule would.
 */

import type {
  Card,
  Character,
  DomainEvent,
  GameState,
  Pending,
  PendingSource,
  StepResult,
} from "../types";

/** Which copy of which card is acting, and for whom. */
export interface BehaviourContext {
  readonly card: Card;
  readonly character: Character;
}

/** The answer to a question a card asked through `state.pending`. */
export type ChoiceAnswer =
  | { readonly kind: "character"; readonly tag: string; readonly character: Character }
  | { readonly kind: "cards"; readonly tag: string; readonly cards: readonly Card[] }
  | { readonly kind: "order"; readonly tag: string; readonly cards: readonly Card[] };

/**
 * What a `Holding:` line changes for as long as the card sits in hand.
 *
 * `handCap` and `drawCap` are ceilings — the tightest one in a hand wins. The
 * deltas add up. `thresholdScrambleDelta` is read from both hands, because the
 * card that has it says "ALL rooms".
 */
export interface HeldModifiers {
  readonly costDelta?: number;
  readonly playedPowerDelta?: number;
  readonly stuffPowerDelta?: number;
  readonly handCap?: number;
  readonly drawCap?: number;
  readonly thresholdScrambleDelta?: number;
}

export interface CardBehaviour {
  /** Conditional stats, recalculated every time the pool is read (§5). */
  stats?(state: GameState, owner: Character, card: Card): { power: number; scramble: number };
  /** A printed cost that is not the number in the corner. */
  cost?(state: GameState, owner: Character, card: Card): number;
  /** A one-shot effect, resolved as the card enters the play zone. */
  onPlay?(state: GameState, ctx: BehaviourContext): StepResult;
  /** A `Holding:` line, in force while the card is in hand. */
  whileHeld?: HeldModifiers;
  /**
   * A this-turn trigger. Listens while the card is in hand or in the play zone,
   * and must not ask a question — the engine's resolution queue is not a place
   * to suspend.
   */
  onEvent?(event: DomainEvent, state: GameState, ctx: BehaviourContext): StepResult;
  /** The follow-up to a question this card asked. */
  onChoice?(answer: ChoiceAnswer, state: GameState, ctx: BehaviourContext): StepResult;
}

export type Registry = Readonly<Record<string, CardBehaviour>>;

/* --------------------------------------------------------------- shorthand */

/** A step that changed nothing. */
export const nothing = (state: GameState): StepResult => ({ state, events: [] });

/** A step that changed the state and said so. */
export const done = (state: GameState, events: readonly DomainEvent[] = []): StepResult => ({
  state,
  events,
});

/** Suspend on a question. Only the answering command is legal until it is answered. */
export const ask = (
  state: GameState,
  pending: Pending,
  events: readonly DomainEvent[] = [],
): StepResult => ({ state: { ...state, pending }, events });

export const source = (ctx: BehaviourContext, tag: string): PendingSource => ({
  card: ctx.card,
  character: ctx.character,
  tag,
});
