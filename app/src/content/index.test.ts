import { describe, expect, it } from "vitest";
import { CARD_SOURCE } from "./index";

describe("content", () => {
  it("names design/cards.yaml as the one place a card is written down", () => {
    expect(CARD_SOURCE).toBe("design/cards.yaml");
  });
});
