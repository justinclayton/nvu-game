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
      // Rulebook §5: every room prints a Flee line. A Stuff room's clears it.
      expect(room.flee.clears).toBe(room.kind === "stuff");
      for (const t of room.thresholds) {
        expect(t.clears || t.fleeFree).toBe(true);
      }
    }
  });

  it("measures a Stuff room's single-character lines on that character's own side", () => {
    // Rulebook §6: each character is measured on their own side of the play zone.
    for (const room of CARD_CONTENT.rooms.filter((r) => r.kind === "stuff")) {
      for (const t of room.thresholds) {
        const named = t.effects.filter((e) => e.who === "Red" || e.who === "Gray");
        if (named.length === 1) expect(t.measuredOn).toBe(named[0]?.who);
        else expect(t.measuredOn).toBeNull();
      }
    }
    // Every other kind of room reads the shared pool.
    for (const room of CARD_CONTENT.rooms.filter((r) => r.kind !== "stuff")) {
      for (const t of room.thresholds) expect(t.measuredOn).toBeNull();
    }
  });
});
