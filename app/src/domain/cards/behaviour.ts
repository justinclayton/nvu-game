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
  Pile,
  Room,
  Stat,
  StepResult,
} from "../types";

/** Which copy of which card is acting, for whom, and from where. */
export interface BehaviourContext {
  readonly card: Card;
  readonly character: Character;
  /** A `Holding:` line only runs from the hand; a played card listens from the zone. */
  readonly zone: "hand" | "playZone";
}

/** The answer to a question a card asked through `state.pending`. */
export type ChoiceAnswer =
  | { readonly kind: "character"; readonly tag: string; readonly character: Character }
  | { readonly kind: "pile"; readonly tag: string; readonly pile: Pile }
  | { readonly kind: "stat"; readonly tag: string; readonly stat: Stat }
  | { readonly kind: "cards"; readonly tag: string; readonly cards: readonly Card[] }
  | { readonly kind: "order"; readonly tag: string; readonly cards: readonly (Card | Room)[] };

/**
 * What a `Holding:` line changes for as long as the card sits in hand.
 *
 * The deltas add up across a hand. `thresholdScrambleDelta` is read from both
 * hands (Panic). `drawTargetDelta` is "draw N fewer": it comes off Turn
 * Start's draw-to-5 target (floor 0), and copies stack (see `drawTargetFor`).
 */
export interface HeldModifiers {
  readonly costDelta?: number;
  /** Bare `Exhaust X` lines do nothing to this character. */
  readonly ignoresExhaustX?: boolean;
  readonly playedPowerDelta?: number;
  readonly stuffPowerDelta?: number;
  readonly drawTargetDelta?: number;
  readonly thresholdScrambleDelta?: number;
}

export interface CardBehaviour {
  /** A bare `Exhaust X` printed on the card. */
  exhaustX?: number;
  /** Conditional stats, recalculated every time the pool is read. */
  stats?(state: GameState, owner: Character, card: Card): { oomph: number; scramble: number };
  /** A printed cost that is not the number in the corner. */
  cost?(state: GameState, owner: Character, card: Card): number;
  /**
   * "Play this card for free": paying is skipped entirely, overriding any
   * `Holding:` cost modifier rather than being one itself.
   */
  freeIf?(state: GameState, owner: Character, card: Card): boolean;
  /** A one-shot effect, resolved as the card enters the play zone. */
  onPlay?(state: GameState, ctx: BehaviourContext): StepResult;
  /** A `Holding:` line, in force while the card is in hand. */
  whileHeld?: HeldModifiers;
  /**
   * A this-turn trigger. Listens while the card is in hand or in the play zone,
   * and must not ask a question — it resolves in the middle of whatever set it
   * off, which is not a place to suspend.
   */
  onEvent?(event: DomainEvent, state: GameState, ctx: BehaviourContext): StepResult;
  /** The follow-up to a question this card asked. */
  onChoice?(answer: ChoiceAnswer, state: GameState, ctx: BehaviourContext): StepResult;
  /**
   * A card's own Cleanup step. For a played card taking itself somewhere other
   * than the discard pile: called before the play zone is swept, and a card
   * still in the zone afterwards is discarded as normal (Each Turn, Cleanup).
   * For a `Holding:` line that acts at Cleanup (Spore Cloud): called on the
   * held card before the play zone is swept, and may `ask` a question.
   */
  onCleanup?(state: GameState, ctx: BehaviourContext): StepResult;
  /**
   * A played card's own line printed "at the end of the turn" that actually
   * fires at the end of the Play phase (Riot Shield) — before Outcome's own
   * effects resolve, and well before Cleanup, so a card it returns to hand
   * is in hand in time for a Cleanup `Holding:` line (Spore Cloud) to count
   * or discard it. Called once the room's Clear/Flee outcome is known.
   */
  onPlayEnd?(state: GameState, ctx: BehaviourContext): StepResult;
  /**
   * A `Holding:` line that acts once at Turn Start, after the draw
   * (Corrosive Acid). Called on the held card once both hands have drawn,
   * before Play begins.
   */
  onTurnStart?(state: GameState, ctx: BehaviourContext): StepResult;
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
