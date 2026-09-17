/* The domain model. One aggregate, `GameState`; one way in, `execute`.
 *
 * Every name here is a term from design/GLOSSARY.md, spelled the same way: exhaust pile,
 * Fled, Cleared, Scrapyard, last stand, Down, stat pool, play zone. Section
 * numbers in the comments point at design/rulebook.md.
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

/** One physical copy of a printed card (rulebook §8). */
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
  /** Enemy rooms name the floor they guard (§4). */
  readonly floor: number | null;
  readonly thresholds: readonly Threshold[];
  readonly flee: FleeLine;
}

/** A card face up in the play zone. The zone is split by character (§3). */
export interface PlayedCard {
  readonly owner: Character;
  readonly card: Card;
}

/** Three cards from a character's own reward pool, offered on ascending (§10). */
export interface RewardOffer {
  readonly Red: readonly Card[];
  readonly Gray: readonly Card[];
}

/** The four piles at the side of the table (§3). */
export interface Pools {
  readonly Red: readonly Card[];
  readonly Gray: readonly Card[];
  readonly goodStuff: readonly Card[];
  readonly badStuff: readonly Card[];
}

/** One character's three piles, plus the two states §9 puts them in. */
export interface PlayerState {
  /** Face down. This is health and energy both — the deck is stamina (§3). */
  readonly deck: readonly Card[];
  /** What they drew this turn. Maximum 5. */
  readonly hand: readonly Card[];
  /** Face up. Cards spent or lost, gone for the floor. There is no discard pile. */
  readonly exhaust: readonly Card[];
  /** Down is out: skipped in Draw and in Play, no rewards, no punishments (§9). */
  readonly down: boolean;
  /** Set the moment the deck runs out, and swept for again at cleanup (§9). */
  readonly lastStand: boolean;
  /** Reset at Flip. The opening draw is the first of these; a draw cap counts them. */
  readonly drewThisTurn: number;
}

/**
 * What the turn in progress has done that no pile records. Reset at Flip.
 *
 * Cards paid with have already gone to the exhaust pile, so a card that reads
 * "for each card you paid with this turn" has nothing else to count.
 */
export interface TurnRecord {
  readonly paid: Readonly<Record<Character, number>>;
  /** Overcharged Battery: this many of a character's next plays cost nothing. */
  readonly freePlays: Readonly<Record<Character, number>>;
  /** Once-per-turn markers, so a trigger that feeds itself fires once. */
  readonly fired: readonly string[];
}

/* ------------------------------------------------------------ the phases */

/**
 * Draw and Play are two phases (§5). Both characters draw one card at the same
 * time as Draw opens, then take turns drawing until both pass; nobody draws
 * during Play. Cleanup is not a waiting phase of its own; it is the last step
 * of `END_PLAY`.
 */
export type Phase = "Flip" | "Draw" | "Play" | "Ascend" | "GameOver";

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
  /** How the room ended. §9 reads this, not how it got there. */
  readonly roomEnded: "Cleared" | "Fled";
  /** Who was in last stand when the room ended Cleared — they get the escape (§9). */
  readonly lastStandAtClear: Readonly<Record<Character, boolean>>;
}

/* --------------------------------------------------------- the aggregate */

export interface GameState {
  /** Randomness is data: same seed and commands, same game. */
  readonly seed: number;
  readonly floor: number;
  readonly turn: number;
  readonly phase: Phase;

  /** The floor deck's draw pile, its Fled pile, and the Cleared heap (§3). */
  readonly floorDeck: readonly Room[];
  readonly activeRoom: Room | null;
  readonly fled: readonly Room[];
  readonly cleared: readonly Room[];
  /** Every printed room copy not currently built into a floor (§4). */
  readonly roomSupply: readonly Room[];

  readonly Red: PlayerState;
  readonly Gray: PlayerState;
  readonly playZone: readonly PlayedCard[];

  /** One shared heap. Nothing ever leaves it (§10). */
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

/** The Scrap tax and the reward, both decided at the moment of ascending (§10). */
export interface AscendChoice {
  /** Keep this Stuff from your own exhaust pile out of the Scrapyard... */
  readonly keepStuffId: CardId | null;
  /** ...by Scrapping this other card of that pile in its place. Both or neither. */
  readonly scrapId: CardId | null;
  /** One of the three offered, or null to decline. */
  readonly takeRewardId: CardId | null;
}

export type Command =
  | { readonly type: "FLIP_ROOM" }
  | { readonly type: "DRAW"; readonly character: Character }
  | { readonly type: "END_DRAW" }
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

/** Where a card was when it was Exhausted. `deck` is the loss you did not choose (§8). */
export type ExhaustedFrom = "hand" | "deck" | "playZone";

export type DomainEvent =
  | { readonly type: "FLOOR_BUILT"; readonly floor: number; readonly rooms: number }
  | { readonly type: "ROOM_FLIPPED"; readonly room: Room }
  | { readonly type: "CARD_DRAWN"; readonly character: Character; readonly card: Card }
  | { readonly type: "DRAW_BURNED"; readonly character: Character; readonly card: Card }
  | { readonly type: "CARD_PLAYED"; readonly character: Character; readonly card: Card }
  | { readonly type: "COST_PAID"; readonly character: Character; readonly cards: readonly Card[] }
  | {
      readonly type: "CARD_EXHAUSTED";
      readonly character: Character;
      readonly card: Card;
      readonly from: ExhaustedFrom;
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
  | { readonly type: "ROOM_CLEARED"; readonly room: Room }
  | { readonly type: "ROOM_FLED"; readonly room: Room }
  | { readonly type: "FLED_RESHUFFLED"; readonly rooms: number }
  | { readonly type: "LAST_STAND"; readonly character: Character }
  | {
      readonly type: "LAST_STAND_ESCAPED";
      readonly character: Character;
      readonly price: readonly Card[];
    }
  | { readonly type: "WENT_DOWN"; readonly character: Character; readonly cause: string }
  | { readonly type: "REWARD_REVEALED"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_TAKEN"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_DECLINED"; readonly character: Character }
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
  | "InLastStand"
  | "DeckIsEmpty"
  | "HandIsFull"
  | "DrawCapReached"
  | "NotInHand"
  | "WrongPayment"
  | "CannotPayWithThat"
  | "NotAnOption"
  | "NotOffered"
  | "ScrapTaxIncomplete"
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
