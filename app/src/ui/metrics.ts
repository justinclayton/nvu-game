/* The one place the table's dimensions are written down. The mat's CSS reads
 * them as custom properties and the card layer reads them as numbers, so the
 * two can never disagree.
 *
 * There are two sets: the table at full size, and a compact table for a screen
 * too narrow for it — a phone held sideways. Which one is in force is decided
 * by `useMetrics`, from the viewport, and handed to the mat and the card layer
 * together. */

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

/** Small enough that the whole table fits an iPhone held sideways, ~870px across. */
export const COMPACT: Metrics = { cardW: 62, cardH: 87, slotPad: 6, rowGap: 8 };

/** The viewport width below which the compact table is used. Matches table.css. */
export const COMPACT_BELOW = 960;
export const COMPACT_QUERY = `(max-width: ${String(COMPACT_BELOW - 1)}px)`;

/** How far each card in a stack sits off the one beneath it. */
export const STACK_STEP_X = -0.6;
export const STACK_STEP_Y = -0.8;
export const STACK_STEP_MAX = 14;

/** How much larger a card offered as a reward is drawn while it floats above the mat. */
export const FLOAT_SCALE = 1.22;

/** The zoomed copy shown while a card is under the pointer. */
export const INSPECT_W = 230;
