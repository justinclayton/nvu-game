/* The behaviour registry.
 *
 * design/cards.yaml is the one place a card is written down. What a card *does*
 * beyond its printed cost and stats lives here, keyed by that name. A vanilla
 * card — a cost and a stat, no text — has no entry, and an official card with
 * text and no entry fails `make check`.
 */

import type { CardBehaviour, Registry } from "./behaviour";
import { GRAY } from "./gray";
import { RED } from "./red";
import { STUFF } from "./stuff";

export type {
  BehaviourContext,
  CardBehaviour,
  ChoiceAnswer,
  HeldModifiers,
  Registry,
} from "./behaviour";

export const BEHAVIOURS: Registry = { ...RED, ...GRAY, ...STUFF };

export const behaviourOf = (name: string): CardBehaviour | undefined => BEHAVIOURS[name];
