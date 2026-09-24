/* A room's own printed rule, beyond its thresholds and Flee line. Keyed by
 * the name design/cards.yaml makes unique, same convention as the behaviour
 * registries in this directory.
 */

import type { Room } from "../types";

export interface RoomBehaviour {
  /** Room text enabling `SCRAP_FOR_STATS` while this room is active, during Play. */
  readonly scrapForStats?: boolean;
}

export type RoomRegistry = Readonly<Record<string, RoomBehaviour>>;

export const ROOMS: RoomRegistry = {
  /* "Players may Scrap Good Stuff cards from their hand during Play to add +3 Oomph or +3 Scramble per card." */
  "Bio-Hazard Containment Vault": { scrapForStats: true },
};

export const roomAllowsScrapForStats = (room: Room): boolean => ROOMS[room.name]?.scrapForStats === true;
