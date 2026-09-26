/* The domain model. One aggregate, `GameState`; one way in, `execute`.
 *
 * Every name here is a term from design/GLOSSARY.md, spelled the same way: discard pile,
 * Exhaust pile, Fled, Cleared, Scrapyard, Down, stat pool, play zone. Section
 * numbers in the comments point at design/rulebook.md, rules version 0.2.1.
 *
 * Everything is readonly. The engine never mutates; it returns a new state.
 */

import type { CardId, RoomId } from "./ids";
import type {
  CardKind,
  CardSet,
  Challenge,
  Character,
  FleeLine,
  Rarity,
  RoomBand,
  RoomEffect,
  RoomKind,
  Stat,
  Threshold,
} from "./printed";

export type { Challenge, Character, Rarity, RoomEffect, Stat, Threshold, FleeLine } from "./printed";
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
  /** Which floors' pool the card is drawn from; `null` for the one fixed Floor 10 Stairwell. */
  readonly band: RoomBand;
  readonly flavor: string;
  readonly challenges: readonly Challenge[];
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

/** One character's three piles (rulebook, Setup). */
export interface PlayerState {
  /** Face down. This is health and energy both — the deck is stamina (rulebook, About the game). */
  readonly deck: readonly Card[];
  /** What they are holding. Draw brings this to 5; nothing else caps it. */
  readonly hand: readonly Card[];
  /** Face up. Cards spent, discarded or lost from the deck — it recycles into a new deck when the deck runs out (rulebook, Keywords: Empty deck). */
  readonly discard: readonly Card[];
  /** Face up. Cards Exhausted off the top of the deck. Permanent: nothing returns from here (rulebook, Setup; Keywords: Exhaust). */
  readonly exhaust: readonly Card[];
  /** One character going Down ends the run (rulebook, Going Down; Winning and losing). */
  readonly down: boolean;
  /** Reset at Flip. How many cards this character has drawn this turn, for a card's own draw cap. */
  readonly drewThisTurn: number;
}

/**
 * What the turn in progress has done that no pile records. Reset at Flip.
 */
export interface TurnRecord {
  /**
   * Overcharged Battery: this many of the next cards played cost nothing,
   * whichever character plays them. The discount belongs to the team, and the
   * Play phase ending drops what is left of it.
   */
  readonly freePlays: number;
  /**
   * Crowbar: how many pieces of Good Stuff each character has already been
   * handed this turn, so an on-play "if you got any earlier this turn" check
   * has something to look back at.
   */
  readonly goodStuffTaken: Readonly<Record<Character, number>>;
  /**
   * Once-per-turn markers, so a trigger that could feed itself fires once.
   * Crowbar keys this by its own card id, so two copies each get their own
   * marker.
   */
  readonly fired: readonly string[];
  /**
   * Distract & Pivot: one-shot "-1 cost" charges banked for a character's own
   * next play, spent one per play regardless of what it saves.
   */
  readonly playDiscount: Readonly<Record<Character, number>>;
  /**
   * Set 'Em Up: Scramble banked for a character's very next play. The card
   * that play puts in the zone takes it into `cardScramble`.
   */
  readonly nextPlayScramble: Readonly<Record<Character, number>>;
  /** Scramble a played card has gained this turn, by card id. */
  readonly cardScramble: Readonly<Record<string, number>>;
  /** System Feedback: banked off the shared pool this turn; a stat never reads below zero. */
  readonly poolPenalty: { readonly oomph: number; readonly scramble: number };
  /** Bio-Hazard Containment Vault: banked onto the shared pool this turn by Scrapping Good Stuff. */
  readonly poolBonus: { readonly oomph: number; readonly scramble: number };
}

/* ------------------------------------------------------------ the phases */

/**
 * Rulebook, Each Turn, Turn Start: bundles both its steps, Flip the room and Draw up
 * to five, into `FLIP_ROOM` — there is no decision between them, so the state
 * rests at `Turn Start` before that command and moves straight to `Play`
 * after it. `END_PLAY` moves the state into `Outcome`, and once the room's
 * effects are drained, into `Cleanup`. Both rest there only while a card or
 * the room has raised a `pending` choice — otherwise the transition runs
 * straight through to `Turn Start` or `Ascend`.
 */
export type Phase = "Turn Start" | "Play" | "Outcome" | "Cleanup" | "Ascend" | "GameOver";

export type Outcome = "Victory" | "Defeat" | "Aborted";

/* ------------------------------------------------------ pending choices */

/** Every face-down pile on the table (rulebook, Keywords: any deck). */
export const PILES = [
  "Red deck",
  "Gray deck",
  "Floor deck",
  "Red reward pool",
  "Gray reward pool",
  "Good Stuff pool",
  "Bad Stuff pool",
] as const;
export type Pile = (typeof PILES)[number];

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
      readonly kind: "ChoosePile";
      readonly prompt: string;
      readonly options: readonly Pile[];
      readonly source: PendingSource | null;
    }
  | {
      readonly kind: "ChooseStat";
      readonly prompt: string;
      readonly character: Character;
      readonly options: readonly Stat[];
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
      readonly pile: Pile;
      readonly cards: readonly (Card | Room)[];
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
  /** The room that ended, so Cleanup can shuffle a Fled one back into the Floor deck. */
  readonly room: Room;
  /** A met challenge said `Ascend`: Cleanup runs, then the Ascending steps (rulebook, Outcome). */
  readonly ascends: boolean;
}

/**
 * A played card whose effect is waiting on `pending`. Once the effect
 * finishes, the cards in `listeners` that are still where they were hear
 * `events`: paying for the card and playing it.
 */
export interface UnfinishedPlay {
  readonly events: readonly DomainEvent[];
  readonly listeners: readonly CardId[];
}

/* --------------------------------------------------------- the aggregate */

export interface GameState {
  /** Randomness is data: same seed and commands, same game. */
  readonly seed: number;
  readonly floor: number;
  readonly turn: number;
  readonly phase: Phase;

  /** The floor deck's draw pile and the Cleared heap (rulebook, Setup). */
  readonly floorDeck: readonly Room[];
  readonly activeRoom: Room | null;
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
  readonly unfinishedPlay: UnfinishedPlay | null;
  readonly resolution: Resolution | null;
  readonly thisTurn: TurnRecord;
  readonly outcome: Outcome | null;
}

/* ------------------------------------------------------------- commands */

/** The reward chosen at the moment of ascending (rulebook, Ascending). */
export interface AscendChoice {
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
  | {
      /** Bio-Hazard Containment Vault, while active: Scrap a Good Stuff card from hand for +3 to one stat. */
      readonly type: "SCRAP_FOR_STATS";
      readonly character: Character;
      readonly cardId: CardId;
      readonly stat: Stat;
    }
  | { readonly type: "CHOOSE_CHARACTER"; readonly character: Character }
  | { readonly type: "CHOOSE_PILE"; readonly pile: Pile }
  | { readonly type: "CHOOSE_STAT"; readonly stat: Stat }
  | { readonly type: "CHOOSE_CARDS"; readonly cardIds: readonly CardId[] }
  | { readonly type: "ORDER_CARDS"; readonly cardIds: readonly (CardId | RoomId)[] }
  | { readonly type: "TAKE_REWARD"; readonly take: boolean }
  | { readonly type: "ASCEND"; readonly Red: AscendChoice; readonly Gray: AscendChoice };

export type CommandType = Command["type"];

/* --------------------------------------------------------------- events */

/** Where a card was when it was discarded (rulebook, Card anatomy: Keywords). */
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
      /** True for one of Turn Start's own automatic draws, as opposed to a card-driven draw during Play. */
      readonly turnStart?: boolean;
    }
  | { readonly type: "CARD_PLAYED"; readonly character: Character; readonly card: Card }
  | { readonly type: "COST_PAID"; readonly character: Character; readonly cards: readonly Card[] }
  | {
      readonly type: "CARD_DISCARDED";
      readonly character: Character;
      readonly card: Card;
      readonly from: DiscardedFrom;
    }
  | { readonly type: "CARD_SCRAPPED"; readonly character: Character | null; readonly card: Card }
  | {
      /** Bio-Hazard Containment Vault: one Scrap, one stat, one line — see `narrate.ts`. */
      readonly type: "CARD_SCRAPPED_FOR_STATS";
      readonly character: Character;
      readonly card: Card;
      readonly stat: Stat;
      readonly amount: number;
    }
  | {
      readonly type: "CARD_EXHAUSTED";
      readonly character: Character;
      readonly card: Card;
    }
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
  | {
      /** Rulebook, Keywords: Empty deck — the discard pile became a new deck. */
      readonly type: "DISCARD_RESHUFFLED";
      readonly character: Character;
      readonly cards: number;
    }
  | { readonly type: "CARD_TO_HAND"; readonly character: Character; readonly card: Card }
  | {
      readonly type: "CARD_MOVED";
      readonly character: Character;
      readonly card: Card;
      readonly to: "deck" | "hand";
    }
  | {
      readonly type: "CARDS_PEEKED";
      readonly character: Character;
      readonly pile: Pile;
      readonly cards: readonly (Card | Room)[];
    }
  | { readonly type: "THRESHOLD_MET"; readonly room: Room; readonly threshold: Threshold }
  | { readonly type: "STUFF_TAKEN"; readonly character: Character; readonly card: Card }
  | {
      readonly type: "STUFF_POOL_EMPTY";
      readonly character: Character;
      readonly pool: "good_stuff" | "bad_stuff";
    }
  | { readonly type: "ROOM_CLEARED"; readonly room: Room }
  | { readonly type: "ROOM_FLED"; readonly room: Room }
  | { readonly type: "FLED_RESHUFFLED"; readonly room: Room }
  | { readonly type: "WENT_DOWN"; readonly character: Character; readonly cause: string }
  | { readonly type: "REWARD_REVEALED"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_POOL_EMPTY"; readonly character: Character }
  | { readonly type: "REWARD_TAKEN"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_DECLINED"; readonly character: Character }
  | { readonly type: "CLEANUP_BEGAN" }
  | { readonly type: "TURN_ENDED"; readonly turn: number }
  | { readonly type: "FLOOR_CLEARED"; readonly floor: number }
  | { readonly type: "GAME_OVER"; readonly outcome: Outcome }
  | { readonly type: "RUN_ABORTED"; readonly reason: string };

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
  | "FloorDeckEmpty"
  | "RoomDoesNotAllow"
  | "NotGoodStuff";

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
