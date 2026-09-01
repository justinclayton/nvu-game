/* The printed face of every card and every room.
 *
 * design/cards.yaml is the one place a card is written down. `make build` turns
 * it into src/content/cards.generated.ts, which is shaped exactly like the types
 * here. The prose a room prints — its threshold outcomes and its Flee line — is
 * parsed into structure by the generator, so nothing in the app ever reads a
 * sentence.
 */

/** Rulebook §2. Both characters are always in play. */
export type Character = "Red" | "Gray";

/** Rulebook §8. The two stat keywords at level 1. */
export type Stat = "Power" | "Scramble";

/** Rulebook §8. Purely printed: no rule anywhere reads it. */
export type Rarity = "Fine" | "Cool" | "Woah";

/** The type line of a player card (rulebook §8). There is no neutral card but Stuff. */
export type CardKind = "player" | "good_stuff" | "bad_stuff";

/** The type line of a room card (rulebook §6). */
export type RoomKind = "enemy" | "hazard" | "stuff";

/** Whether a card is ratified or still a proposal. Only official cards gate the build. */
export type CardSet = "official" | "proposed";

/**
 * One thing a room does to the characters. A room's Flee line and each of its
 * threshold outcomes are lists of these, so the engine never parses prose.
 *
 * `who: "one"` is rulebook §5: the team chooses which character, and that
 * character takes all of it. There is no splitting.
 */
export type EffectTarget = Character | "one" | "both";

export type RoomEffect =
  | { readonly type: "ExhaustFromDeck"; readonly who: EffectTarget; readonly amount: number }
  | { readonly type: "DealBadStuff"; readonly who: EffectTarget }
  | { readonly type: "TakeGoodStuff"; readonly who: EffectTarget; readonly count: number }
  | { readonly type: "RevealReward"; readonly who: EffectTarget };

/**
 * One `threshold: outcome` line (rulebook §5).
 *
 * `measuredOn` is the whole of what makes a Stuff room different: a line that
 * names one character is measured against that character's own side of the play
 * zone, never the shared pool (rulebook §6).
 */
export interface Threshold {
  readonly stat: Stat;
  readonly value: number;
  /** The printed prose, kept for display. No rule reads it. */
  readonly outcome: string;
  /** Meeting this line Clears the room. */
  readonly clears: boolean;
  /** "Flee this room for free" — the room is Fled, but its Flee line does not resolve. */
  readonly fleeFree: boolean;
  /** A character's own side of the play zone, or null for the shared pool. */
  readonly measuredOn: Character | null;
  readonly effects: readonly RoomEffect[];
}

/**
 * The Flee line every room prints (rulebook §5). A Stuff room's own line Clears
 * the room, which is why a Stuff room never goes to Fled and never punishes you.
 */
export interface FleeLine {
  readonly text: string;
  /** A Stuff room's Flee text Clears the room (rulebook §6). */
  readonly clears: boolean;
  readonly effects: readonly RoomEffect[];
}

/** A player card or a piece of Stuff, exactly as printed (rulebook §8). */
export interface CardFace {
  readonly name: string;
  readonly set: CardSet;
  readonly kind: CardKind;
  /** Player cards only; Stuff belongs to no character. */
  readonly owner: Character | null;
  readonly rarity: Rarity | null;
  readonly starter: boolean;
  /** How many physical copies the card list prints. */
  readonly count: number;
  readonly cost: number;
  readonly power: number;
  readonly scramble: number;
  /** The stat lives in the text instead of a field, so a behaviour computes it. */
  readonly conditionalStat: boolean;
  readonly hold: boolean;
  readonly text: string;
}

/** A room card, exactly as printed (rulebook §6). */
export interface RoomFace {
  readonly name: string;
  readonly set: CardSet;
  readonly kind: RoomKind;
  /** Enemy rooms name the floor they guard. */
  readonly floor: number | null;
  readonly count: number;
  readonly thresholds: readonly Threshold[];
  readonly flee: FleeLine;
}

/** Everything design/cards.yaml prints, sorted by what the engine does with it. */
export interface CardContent {
  readonly meta: { readonly updated: string };
  readonly cards: readonly CardFace[];
  readonly rooms: readonly RoomFace[];
}
