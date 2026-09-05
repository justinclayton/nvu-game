/* The one place the table's dimensions are written down. The mat's CSS reads
 * them as custom properties and the card layer reads them as numbers, so the
 * two can never disagree. */

/** A card at table scale, at poker proportions (63 × 88 mm). */
export const CARD_W = 88;
export const CARD_H = 123;

/** The breathing room inside a slot, so a stack can grow up and to the left. */
export const SLOT_PAD = 8;

/** The gap between cards laid out in a row, before they have to overlap. */
export const ROW_GAP = 12;

/** How far each card in a stack sits off the one beneath it. */
export const STACK_STEP_X = -0.6;
export const STACK_STEP_Y = -0.8;
export const STACK_STEP_MAX = 14;

/** The zoomed copy shown while a card is under the pointer. */
export const INSPECT_W = 230;
