/* design/cli-sim/spec.md, "Card names": name resolution can match initials, so
 * two cards sharing initials collide on that query. This snapshot names every
 * pair design/cards.yaml holds today; a new card that creates a new pair
 * fails this test, so the designer sees the collision when it lands rather
 * than an agent discovering it mid-playtest. */
import { describe, expect, it } from "vitest";
import { initialsCollisions } from "./names";
import { CARD_CONTENT } from "./index";

describe("initials collisions", () => {
  it("names every pair of cards sharing initials", () => {
    const pairs = initialsCollisions(CARD_CONTENT.cards).map(([a, b]) => `${a} / ${b}`);
    expect(pairs.sort()).toEqual(
      [
        "Brute Recycle / Bull Rush",
        "Reckless Swing / Riot Shield",
        "Reckless / Rust",
        "Shove / Sluggish",
      ].sort(),
    );
  });
});
