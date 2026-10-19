/* The behaviour coverage gate.
 *
 * A card with printed text and no behaviour would be a silent no-op at the
 * table, so an official one fails the build. Proposed cards are exempt until
 * they turn official (ticket 03), and are listed below so that adding one
 * without code is still a visible decision rather than an accident.
 */

import { describe, expect, it } from "vitest";
import { BEHAVIOURS } from "../domain/cards/behaviours";
import { CARD_CONTENT } from "./index";

const hasText = (text: string): boolean => text.trim() !== "";
const withText = CARD_CONTENT.cards.filter((c) => hasText(c.text));

/**
 * Cards whose printed text has no reading the rulebook settles, so nothing
 * implements them yet. Adding a card without code changes this list, which is the point: it stays a decision rather than an accident.
 */
const UNIMPLEMENTED: readonly string[] = [];

describe("behaviour coverage", () => {
  it("names every card whose printed text nothing implements yet", () => {
    const missing = withText.filter((c) => !(c.name in BEHAVIOURS)).map((c) => c.name);
    expect(missing.sort()).toEqual([...UNIMPLEMENTED].sort());
  });

  it("every official card with text has a behaviour", () => {
    const missing = withText
      .filter((c) => c.set === "official")
      .filter((c) => !(c.name in BEHAVIOURS))
      .map((c) => c.name);
    expect(missing).toEqual([]);
  });

  it("no behaviour is registered for a card that is not in the list", () => {
    const printed = new Set<string>(CARD_CONTENT.cards.map((c) => c.name));
    expect(Object.keys(BEHAVIOURS).filter((name) => !printed.has(name))).toEqual([]);
  });

  it("no behaviour is registered for a card with nothing printed on it", () => {
    // A vanilla card — a cost and a stat, no text — has no entry.
    const vanilla = CARD_CONTENT.cards.filter((c) => !hasText(c.text) && !c.conditionalStat);
    expect(vanilla.filter((c) => c.name in BEHAVIOURS).map((c) => c.name)).toEqual([]);
  });
});
