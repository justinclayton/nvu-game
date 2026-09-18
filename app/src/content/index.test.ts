import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CARD_CONTENT, CARD_SOURCE } from "./index";

const REPO = fileURLToPath(new URL("../../..", import.meta.url));

describe("content", () => {
  it("names design/cards.yaml as the one place a card is written down", () => {
    expect(CARD_SOURCE).toBe("design/cards.yaml");
  });

  it("is fresh against design/cards.yaml", () => {
    // The generator is the only thing that reads the YAML, so freshness is its
    // own question to answer. A failure here means: run `make build`.
    execFileSync("node", ["tools/cards.mjs", "check"], { cwd: REPO, stdio: "pipe" });
  });

  it("carries every card and every room", () => {
    expect(CARD_CONTENT.cards.length).toBeGreaterThan(0);
    expect(CARD_CONTENT.rooms.length).toBeGreaterThan(0);
    const names = CARD_CONTENT.cards.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("carries structure, never prose, for what a room does", () => {
    for (const room of CARD_CONTENT.rooms) {
      expect(room.thresholds.length).toBeGreaterThan(0);
      // Each Turn, Outcome: a Flee never clears the room — only a met threshold does.
      expect(room.flee.clears).toBe(false);
      for (const t of room.thresholds) {
        expect(t.clears || t.fleeFree).toBe(true);
      }
    }
  });

  it("gives every room's threshold the same shape, whatever the room's printed kind", () => {
    // A room's type line (Enemy/Hazard/Stuff) is flavor: every Challenge is checked
    // the same way, so no threshold carries a kind-specific reading of the pool.
    for (const room of CARD_CONTENT.rooms) {
      for (const t of room.thresholds) expect(t).not.toHaveProperty("measuredOn");
    }
  });

  it("only an `Ascend` outcome sets `ascends`", () => {
    for (const room of CARD_CONTENT.rooms) {
      for (const t of room.thresholds) {
        expect(t.ascends).toBe(/ascend/i.test(t.outcome));
      }
    }
  });
});
