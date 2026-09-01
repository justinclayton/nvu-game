/* Branded ids. A card id is unique per physical copy — five Shoves are five
 * different cards — and a room id per room. Branding keeps the two apart and
 * keeps a bare string out of either. */

declare const cardIdBrand: unique symbol;
declare const roomIdBrand: unique symbol;

export type CardId = string & { readonly [cardIdBrand]: true };
export type RoomId = string & { readonly [roomIdBrand]: true };

export const cardId = (raw: string): CardId => raw as CardId;
export const roomId = (raw: string): RoomId => raw as RoomId;
