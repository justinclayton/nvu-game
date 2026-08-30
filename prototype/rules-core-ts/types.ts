/* North vs Up — rules core, type definitions.
 *
 * PROTOTYPE. Throwaway code answering one question: does the state model in
 * north-vs-up-rfc.md hold up when you make it run the ratified rules?
 * See README.md for the answer and for where this disagrees with the RFC.
 *
 * Every type here is readonly. The engine never mutates; it returns new state.
 */

export type Character = "Red" | "Gray";
export type Stat = "Power" | "Scramble";
export type Rarity = "Fine" | "Cool" | "Woah";

/** What a card is. `player` cards belong to a character; Stuff belongs to the floor. */
export type CardKind = "player" | "good_stuff" | "bad_stuff";

/** Derived, never stored: a character is in last stand while their deck is empty. */
export type CharacterStatus = "Standing" | "LastStand" | "Down";

export type Phase =
  | "Flip"      // turn the top floor card face up
  | "Draw"      // each standing character draws, minimum 1
  | "Play"      // both characters play into their own side
  | "Ascend"    // the Enemy room is dead; the floor is being packed up
  | "GameOver";

export interface Card {
  readonly id: string;              // unique per physical copy, e.g. "Shove#3"
  readonly name: string;
  readonly kind: CardKind;
  readonly owner?: Character;       // player cards only
  readonly rarity?: Rarity;         // purely printed; no rule reads it
  readonly cost: number;
  readonly power: number;
  readonly scramble: number;
  readonly hold: boolean;
  readonly starter: boolean;
  readonly text: string;
  /** Set by the ascension Scrap tax: this Stuff now stays in the deck for the run. */
  readonly permanent?: boolean;
}

export type RoomKind = "enemy" | "hazard" | "stuff";

/**
 * One `threshold: outcome` line. `recipient` is set only on Stuff rooms, where
 * the line is measured against that character's own side of the play zone.
 */
export interface Threshold {
  readonly stat: Stat;
  readonly value: number;
  readonly outcome: string;
  readonly clears: boolean;
  readonly reward: boolean;         // the higher tier that pays a card reward
  readonly recipient?: Character;   // Stuff rooms
  readonly stuffCount?: number;     // Stuff rooms: how much Good Stuff this line pays
}

/**
 * A Flee line, structured. The prose in design/cards.yaml is parsed into this
 * by cards.ts; the engine only ever sees the structure.
 */
export interface FleeLine {
  readonly who: "one" | "both";     // "one" = the team chooses, and they take all of it
  readonly deckExhaust: number;
  readonly badStuffToOne: boolean;
}

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly kind: RoomKind;
  readonly thresholds: readonly Threshold[];
  readonly flee: FleeLine | null;   // Stuff rooms have none
}

export interface PlayerState {
  readonly deck: readonly Card[];   // face down; this is health and fuel both
  readonly hand: readonly Card[];   // max 5
  readonly exhaust: readonly Card[];
  /** Down is a real flag: a last-stand character who empties their hand is not Down. */
  readonly down: boolean;
  /** Reset every Draw phase; the minimum-1 draw is checked against it. */
  readonly drewThisTurn: number;
}

export interface PlayedCard {
  readonly owner: Character;
  readonly card: Card;
}

export interface Pools {
  readonly red: readonly Card[];        // Red's reward pool
  readonly gray: readonly Card[];       // Gray's reward pool
  readonly goodStuff: readonly Card[];
  readonly badStuff: readonly Card[];
}

/** Offered at ascension: three cards from a character's own pool, take one or decline. */
export interface RewardOffer {
  readonly red: readonly Card[];
  readonly gray: readonly Card[];
}

export interface GameState {
  readonly seed: number;                // the RNG lives in state, so runs replay exactly
  readonly floor: number;
  readonly turn: number;
  readonly phase: Phase;
  readonly floorDeck: readonly Room[];
  readonly activeRoom: Room | null;
  readonly cleared: readonly Room[];
  readonly fled: readonly Room[];
  readonly red: PlayerState;
  readonly gray: PlayerState;
  readonly playZone: readonly PlayedCard[];
  readonly scrapyard: readonly Card[];  // one shared heap; nothing ever leaves it
  readonly pools: Pools;
  readonly offer: RewardOffer | null;   // populated when phase is "Ascend"
  readonly outcome: "Victory" | "Defeat" | null;
}

export type Command =
  | { readonly type: "FLIP_ROOM" }
  | { readonly type: "DRAW"; readonly character: Character }
  | { readonly type: "END_DRAW" }
  | {
      readonly type: "PLAY_CARD";
      readonly character: Character;
      readonly cardId: string;
      readonly payWith: readonly string[];
    }
  | { readonly type: "END_PLAY"; readonly fleeTarget?: Character }
  | {
      readonly type: "ASCEND";
      readonly red: AscendChoice;
      readonly gray: AscendChoice;
    };

export interface AscendChoice {
  /** Scrap tax: keep this Stuff card for the rest of the run... */
  readonly keepStuffId?: string;
  /** ...at the price of this starter card, Scrapped. Both or neither. */
  readonly scrapId?: string;
  /** Reward: one of the three offered cards, or null to decline. */
  readonly takeRewardId?: string | null;
}

export type DomainEvent =
  | { readonly type: "ROOM_FLIPPED"; readonly room: Room }
  | { readonly type: "CARD_DRAWN"; readonly character: Character; readonly card: Card }
  | { readonly type: "DRAW_BURNED"; readonly character: Character; readonly card: Card }
  | { readonly type: "CARD_PLAYED"; readonly character: Character; readonly card: Card }
  | { readonly type: "COST_PAID"; readonly character: Character; readonly cards: readonly Card[] }
  | { readonly type: "CARD_EXHAUSTED"; readonly character: Character; readonly card: Card }
  | { readonly type: "CARD_SCRAPPED"; readonly character: Character; readonly card: Card }
  | { readonly type: "THRESHOLD_MET"; readonly room: Room; readonly threshold: Threshold }
  | { readonly type: "STUFF_TAKEN"; readonly character: Character; readonly card: Card }
  | { readonly type: "ROOM_CLEARED"; readonly room: Room }
  | { readonly type: "ROOM_FLED"; readonly room: Room; readonly target: Character | "both" }
  | { readonly type: "LAST_STAND"; readonly character: Character }
  | { readonly type: "LAST_STAND_ESCAPED"; readonly character: Character; readonly price: readonly Card[] }
  | { readonly type: "WENT_DOWN"; readonly character: Character; readonly cause: string }
  | { readonly type: "FLOOR_CLEARED"; readonly floor: number }
  | { readonly type: "REWARD_TAKEN"; readonly character: Character; readonly card: Card }
  | { readonly type: "REWARD_DECLINED"; readonly character: Character }
  | { readonly type: "FLOOR_BUILT"; readonly floor: number; readonly rooms: number }
  | { readonly type: "GAME_OVER"; readonly outcome: "Victory" | "Defeat" }
  | { readonly type: "OPEN_QUESTION"; readonly id: string; readonly note: string };

/** Thrown for an illegal command. The caller asked for something the rules forbid. */
export class RuleError extends Error {}
