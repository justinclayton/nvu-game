/* The one place the table's dimensions are written down. The mat's CSS reads
 * them as custom properties and the card layer reads them as numbers, so the
 * two can never disagree.
 *
 * There are three sets: a compact table for a screen too narrow for the full
 * one — a phone held sideways, a tablet, a small laptop — the full table, and
 * a wide table for a screen with room to spare. Which one is in force is decided by `useMetrics`, from
 * the viewport, and handed to the mat and the card layer together. Every face
 * is sized in em off the card's own width, so a bigger tier draws bigger cards
 * with bigger, more legible text — nothing on the face itself has to change. */

export interface Metrics {
  /** A card at table scale, at poker proportions (63 × 88 mm). */
  readonly cardW: number;
  readonly cardH: number;
  /** The breathing room inside a slot, so a stack can grow up and to the left. */
  readonly slotPad: number;
  /** The gap between cards laid out in a row, before they have to overlap. */
  readonly rowGap: number;
}

export const FULL: Metrics = { cardW: 88, cardH: 123, slotPad: 8, rowGap: 12 };

/** Small enough that the whole table fits an iPhone held sideways, ~870px across,
 * and so it also fits every width the full table cannot (up to `COMPACT_BELOW`). */
export const COMPACT: Metrics = { cardW: 62, cardH: 87, slotPad: 6, rowGap: 8 };

/** A screen with room to spare draws bigger cards instead of more empty felt
 * around the same ones. A flat 1.25× of `FULL`, so every number is still a
 * clean whole one. */
export const WIDE: Metrics = { cardW: 110, cardH: 154, slotPad: 10, rowGap: 15 };

/** The viewport width below which the compact table is used. Matches table.css. */
export const COMPACT_BELOW = 1180;
export const COMPACT_QUERY = `(max-width: ${String(COMPACT_BELOW - 1)}px)`;

/** The viewport width at and above which the wide table is used. Matches table.css.
 *
 * It is the width where the wide layout fits: the mat's minimum width, the gap
 * and the log column, plus the table's side padding, have to fit inside the
 * table's share of the viewport (`1425 + 24 + 340 + 40 = 1829`, over 0.96, is
 * 1905px), rounded up to 1910. Below that the grid squeezes the mat and the
 * log is drawn over its rail. `metrics.test.ts` checks these numbers against
 * table.css. */
export const WIDE_ABOVE = 1910;
export const WIDE_MAT_MIN_WIDTH = 1425;
export const WIDE_COLUMN_GAP = 24;
export const WIDE_LOG_WIDTH = 340;
/** `.table`'s left and right padding together. */
export const WIDE_TABLE_PADDING_X = 40;
/** `.table`'s `max-width` in the wide layout is `min(96vw, 2000px)`. */
export const WIDE_TABLE_VIEWPORT_SHARE = 0.96;
export const WIDE_QUERY = `(min-width: ${String(WIDE_ABOVE)}px)`;

/** How far each card in a stack sits off the one beneath it. */
export const STACK_STEP_X = -0.6;
export const STACK_STEP_Y = -0.8;
export const STACK_STEP_MAX = 14;

/** How much larger a card offered as a reward is drawn while it floats above the mat. */
export const FLOAT_SCALE = 1.22;
