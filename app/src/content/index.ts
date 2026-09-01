/* Card data. Data, not rules.
 *
 * design/cards.yaml is the one place a card is written down; `make build` turns
 * it into cards.generated.ts. Nothing in this layer decides anything — the
 * domain builds decks, pools and floors out of what is here.
 */

export { CARD_CONTENT } from "./cards.generated";

/** The one place a card is written down. */
export const CARD_SOURCE = "design/cards.yaml";
