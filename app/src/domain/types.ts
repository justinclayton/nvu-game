/* The domain model. One aggregate, `GameState`; one way in, `execute`.
 *
 * Every name here is a term from design/GLOSSARY.md, spelled the same way: discard pile,
 * Exhaust pile, Fled, Cleared, Scrapyard, Down, stat pool, play zone. Section
 * numbers point at design/rulebook-0.2-draft.md, which is the authority this
 * engine implements (`RULES_VERSION`).
 *
 * Everything is readonly. The engine never mutates; it returns a new state.
 */

import type { CardId, RoomId } from "./ids";
import type {
  CardKind,
  CardSet,
  Character,
  FleeLine,
  Rarity,
  RoomEffect,
  RoomKind,
  Threshold,
} from "./printed";

export type { Character, Rarity, RoomEffect, Stat, Threshold, FleeLine } from "./printed";
export type { CardId, RoomId } from "./ids";

/** The registry key for a card's behaviour. `cards.yaml` makes the name unique. */
export type CardName = string;

/* ----------------------------------------------------------- value objects */

/** One physical copy of a printed card (rulebook, Card anatomy). */
export interface Card {
  readonly id: CardId;
  readonly name: CardName;
  readonly set: CardSet;
  readonly kind: CardKind;
  /** Player cards only. There is no neutral card but Stuff. */
  readonly owner: Character | null;
  /** Purely printed: no rule reads it. */
  readonly rarity: Rarity | null;
  readonly cost: number;
  readonly oomph: number;
  readonly scramble: number;
  /** The stat is in the text, so the behaviour registry computes it. */
  readonly conditionalStat: boolean;
  readonly starter: boolean;
  readonly text: string;
}

/** One card of the floor deck, and the whole of what the players face this turn. */
export interface Room {
  readonly id: RoomId;
  readonly name: string;
  readonly kind: RoomKind;
  /** Enemy rooms name the floor they guard (rulebook, Card anatomy: Room Cards). */
  readonly floor: number | null;
  readonly thresholds: readonly Threshold[];
  readonly flee: FleeLine;
}

/** A card face up in the play zone. The zone is split by character (rulebook, Setup). */
export interface PlayedCard {
  readonly owner: Character;
  readonly card: Card;
}

/** Three cards from a character's own reward pool, offered on ascending (rulebook, Ascending). */
export interface RewardOffer {
  readonly Red: readonly Card[];
  readonly Gray: readonly Card[];
}

/** The four piles at the side of the table (rulebook, Setup). */
export interface Pools {
  readonly Red: readonly Card[];
  readonly Gray: readonly Card[];
  readonly goodStuff: readonly Card[];
  readonly badStuff: readonly Card[];
}

/**
 * One character's four piles (rulebook, Setup): deck, hand, discard (recycles —
 * shuffled back in when the deck runs dry) and Exhaust (permanent — an
 * Exhausted card never comes back). `down` is set the instant a draw or an
 * Exhaust finds both the deck and the discard pile empty (rulebook, Going
 * Down), which also ends the run (rulebook, Winning and losing) — there is no
 * Last Stand to pass through first.
 */
export interface PlayerState {
  /** Face down. This is health and energy both — the deck is stamina (rulebook, About the game). */
  readonly deck: readonly Card[];
  /** What they hold. Draw fills this to 5 each turn (rulebook, Draw); it may run higher than that. */
  readonly hand: readonly Card[];
  /** Face up. Cards spent or lost that still recycle: shuffled back in when the deck empties. */
  readonly discard: readonly Card[];
  /** Face up. Cards Exhausted — gone for good, unless a card's own text says otherwise. */
  readonly exhaust: readonly Card[];
  /** Set when a draw or an Exhaust finds the deck and the discard pile both empty. Ends the run. */
  readonly down: boolean;
  /** How many cards this character has drawn this turn. Reset at Flip; a draw cap counts it. */
  readonly drewThisTurn: number;
}

/**
 * What the turn in progress has done that no pile records. Reset at Flip.
 *
 * Cards paid with have already gone to the discard pile, so a card that reads
 * "for each card you paid with this turn" has nothing else to count.
 */
export interface TurnRecord {
  readonly paid: Readonly<Record<Character, number>>;
  /**
   * Overcharged Battery: this many of the next cards played cost nothing,
   * whichever character plays them. The discount belongs to the team, and the
   * Play phase ending drops what is left of it.
   */
  readonly freePlays: number;
  /**
   * Crowbar: how many pieces of Good Stuff each character has already been
   * handed this turn, so an on-play "if you got any earlier this turn" check
   * has something to look back at. See open-questions.md #16.
   */
  readonly goodStuffTaken: Readonly<Record<Character, number>>;
  /**
   * Once-per-turn markers, so a trigger that could feed itself fires once.
   * Crowbar keys this by its own card id, so two copies each get their own
   * marker. See open-questions.md #16.
   */
  readonly fired: readonly string[];
}

/* ------------------------------------------------------------ the phases */

/**
 * Rulebook, Each Turn: New Room, Draw, Play, Outcome, Cleanup. Draw has no
 * decision in it — each character draws until holding 5, both at once — so it
 * is not a phase a command waits in: `FLIP_ROOM` runs it and lands straight on
 * `Play`. Outcome and Cleanup are likewise not waiting phases; they are the
 * tail of `END_PLAY`.
 */
export type Phase = "Flip" | "Play" | "Ascend" | "GameOver";

export type Outcome = "Victory" | "Defeat";

/* ------------------------------------------------------ pending choices */

/** Which card asked the question, when a card did rather than a room. */
export interface PendingSource {
  readonly card: Card;
  readonly character: Character;
  /** Free-form, so a card with more than one question knows which was answered. */
  readonly tag: string;
}

/**
 * A choice the engine is waiting on. While it is set, the answering command is
 * the only legal one. The UI renders exactly what is here and nothing else.
 */
export type Pending =
  | {
      readonly kind: "ChooseCharacter";
      readonly prompt: string;
      readonly options: readonly Character[];
      readonly source: PendingSource | null;
    }
  | {
      readonly kind: "ChooseCards";
      readonly prompt: string;
      readonly character: Character;
      readonly options: readonly Card[];
      readonly count: number;
      /** An optional choice may be answered with no cards at all. */
      readonly optional: boolean;
      readonly source: PendingSource | null;
    }
  | {
      readonly kind: "OrderCards";
      readonly prompt: string;
      readonly character: Character;
      readonly cards: readonly Card[];
      readonly source: PendingSource | null;
    }
  | {
      readonly kind: "TakeReward";
      readonly prompt: string;
      readonly character: Character;
      readonly card: Card;
      readonly source: PendingSource | null;
    };

/**
 * What `END_PLAY` still owes, kept in state while the engine waits on a choice.
 * The head of `effects` is next; a `who: "one"` head is what raises the choice.
 */
export interface Resolution {
  readonly effects: readonly RoomEffect[];
  /** How the room ended. */
  readonly roomEnded: "Cleared" | "Fled";
  /** A met challenge said `Ascend`: Cleanup runs first, then the Ascending steps (rulebook, Outcome). */
  readonly ascends: boolean;
}

/* --------------------------------------------------------- the aggregate */

export interface GameState {
  /** Randomness is data: same seed and commands, same game. */
  readonly seed: number;
  readonly floor: number;
  readonly turn: number;
  readonly phase: Phase;

  /** The floor deck's draw pile, its Fled pile, and the Cleared heap (rulebook, Setup). */
  readonly floorDeck: readonly Room[];
  readonly activeRoom: Room | null;
  readonly fled: readonly Room[];
  readonly cleared: readonly Room[];
  /** Every printed room copy not currently built into a floor (Setup). */
  readonly roomSupply: readonly Room[];

  readonly Red: PlayerState;
  readonly Gray: PlayerState;
  readonly playZone: readonly PlayedCard[];

  /** One shared heap. Nothing ever leaves it (rulebook, Setup). */
  readonly scrapyard: readonly Card[];
  readonly pools: Pools;
  /** Populated while the phase is Ascend. */
  readonly offer: RewardOffer | null;

  readonly pending: Pending | null;
  readonly resolution: Resolution | null;
  readonly thisTurn: TurnRecord;
  readonly outcome: Outcome | null;
}

/* ------------------------------------------------------------- commands */

/**
 * One Stuff card's fate at Settle your Stuff (rulebook, Ascending).
 *
 * Each Stuff card found in a character's deck, hand or discard pile has a
 * default fate that costs nothing: Good Stuff shuffles into the Good Stuff
 * pool; Bad Stuff stays with its owner. `pay`, when set, is a non-Stuff card
 * from that same character's deck, hand or discard pile, Scrapped to flip the
 * default: Good Stuff is kept instead of pooled, Bad Stuff is shed to its pool
 * instead of kept. A card not mentioned here gets its default fate.
 */
export interface SettleDecision {
  readonly stuffId: CardId;
  readonly pay: CardId | null;
}

/** The Settle-your-Stuff decisions and the reward, both decided at ascending (rulebook, Ascending). */
export interface AscendChoice {
  readonly settle: readonly SettleDecision[];
  /** One of the three offered, or null to decline. */
  readonly takeRewardId: CardId | null;
}

export type Command =
  | { readonly type: "FLIP_ROOM" }
  | {
      readonly type: "PLAY_CARD";
      readonly character: Character;
      readonly cardId: CardId;
      readonly payWith: readonly CardId[];
    }
  | { readonly type: "END_PLAY" }
  | { readonly type: "CHOOSE_CHARACTER"; readonly character: Character }
  | { readonly type: "CHOOSE_CARDS"; readonly cardIds: readonly CardId[] }
  | { readonly type: "ORDER_CARDS"; readonly cardIds: readonly CardId[] }
  | { readonly type: "TAKE_REWARD"; readonly take: boolean }
  | { readonly type: "ASCEND"; readonly Red: AscendChoice; readonly Gray: AscendChoice };

export type CommandType = Command["type"];

/* --------------------------------------------------------------- events */

/** Where a card was when it was discarded. */
export type DiscardedFrom = "hand" | "playZone";

export type DomainEvent =
  | { readonly type: "FLOOR_BUILT"; readonly floor: number; readonly rooms: number }
  | { readonly type: "ROOM_FLIPPED"; readonly room: Room }
  | {
      readonly type: "CARD_DRAWN";
      readonly character: Character;
      readonly card: Card;
      /** True for a draw a card's text forced on someone else — see `drawOne`. */
      readonly forced?: boolean;
    }
  | { readonly type: "CARD_PLAYED"; readonly character: Character; readonly card: Card }
  | { readonly type: "COST_PAID"; readonly character: Character; readonly cards: readonly Card[] }
  | {
      readonly type: "CARD_DISCARDED";
      readonly character: Character;
      readonly card: Card;
      readonly from: DiscardedFrom;
    }
  | { readonly type: "CARD_EXHAUSTED"; readonly character: Character; readonly card: Card }
  | {
      readonly type: "DECK_RESHUFFLED";
      readonly character: Character;
      readonly count: number;
    }
  | { readonly type: "CARD_SCRAPPED"; readonly character: Character | null; readonly card: Card }
  | {
      readonly type: "EXHAUST_PREVENTED";
      readonly character: Character;
      readonly amount: number;
      readonly by: Card;
    }
  | {
      readonly type: "CARDS_SHUFFLED_IN";
      readonly character: Character;
      readonly cards: readonly Card[];
    }
  | { readonly type: "CARD_TO_HAND"; readonly character: Character; readonly card: Card }
  | {
      readonly type: "CARD_MOVED";
      readonly character: Character;
      readonly card: Card;
      readonly to: "deck" | "hand";
    }
  | { readonly type: "CARDS_PEEKED"; readonly character: Character; readonly cards: readonly Card[] }
  | { readonly type: "THRESHOLD_MET"; readonly room: Room; readonly threshold: Threshold }
  | { readonly type: "STUFF_TAKEN"; readonly character: Character; readonly card: Card }
  | {
      readonly type: "STUFF_POOL_EMPTY";
      readonly character: Character;
      readonly pool: "good_stuff" | "bad_stuff";
    }
  | { readonly type: "ROOM_CLEARED"; readonly room: Room }
  | { readonly type: "ROOM_FLED"; readonly room: Room }
  | { readonly type: "FLED_RESHUFFLED"; readonly rooms: number }
  | { readonly type: "WENT_DOWN"; readonly character: Character; readonly cause: string }
  | { readonly type: "REWARD_REVEALED"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_TAKEN"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_DECLINED"; readonly character: Character }
  | {
      readonly type: "STUFF_SETTLED";
      readonly character: Character;
      readonly card: Card;
      /** Kept (Good Stuff paid for) or stayed (Bad Stuff's default); false is the pooled/shed case. */
      readonly kept: boolean;
    }
  | { readonly type: "CLEANUP_BEGAN" }
  | { readonly type: "TURN_ENDED"; readonly turn: number }
  | { readonly type: "FLOOR_CLEARED"; readonly floor: number }
  | { readonly type: "GAME_OVER"; readonly outcome: Outcome };

export type DomainEventType = DomainEvent["type"];

/* --------------------------------------------------------------- results */

export type RejectionCode =
  | "WrongPhase"
  | "AwaitingChoice"
  | "NoPendingChoice"
  | "GameIsOver"
  | "CharacterIsDown"
  | "NotInHand"
  | "WrongPayment"
  | "CannotPayWithThat"
  | "NotAnOption"
  | "NotOffered"
  | "FloorDeckEmpty";

/** An illegal command is a value, not a throw. */
export interface Rejection {
  readonly code: RejectionCode;
  readonly message: string;
}

export type Result =
  | { readonly ok: true; readonly state: GameState; readonly events: readonly DomainEvent[] }
  | { readonly ok: false; readonly reason: Rejection };

/**
 * The engine's internal shape. A pending choice is a field of the state, so a
 * step that needs an answer returns a state with `pending` set and stops there.
 */
export interface StepResult {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
}

/** Thrown only for a corrupted state, which is a bug and not a rule. */
export class CorruptStateError extends Error {}
