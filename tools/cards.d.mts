/* Types for the parts of tools/cards.mjs the app's tests import. */

/** The words before the first "(" of a room's text, punctuation dropped: the known keywords, and the rest kept as data. */
export function roomKeywords(text: string | null | undefined): { keywords: string[]; unparsed: string[] };
