/* Types for the parts of tools/cards.mjs the app's tests import. */

/** The keywords before the first "(" of a room's text; a word the generator doesn't know throws. */
export function roomKeywords(text: string | undefined, name: string): string[];
