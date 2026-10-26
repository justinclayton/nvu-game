import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { roomKeywords } from "../../../tools/cards.mjs";
import { CARD_CONTENT, CARD_SOURCE } from "./index";

const REPO = fileURLToPath(new URL("../../..", import.meta.url));

describe("content", () => {
  it("names cards.yaml as the one place a card is written down", () => {
    expect(CARD_SOURCE).toBe("cards.yaml");
  });

  it("is fresh against cards.yaml", () => {
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
      expect(room.challenges.length).toBeGreaterThan(0);
      // Each Turn, Outcome: a Flee never clears the room — only a met challenge does.
      expect(room.flee.clears).toBe(false);
      for (const c of room.challenges) {
        expect(c.thresholds.length).toBeGreaterThan(0);
        for (const t of c.thresholds) {
          expect(t.clears || t.fleeFree).toBe(true);
        }
      }
    }
  });

  it("reads the words before any ( of a room's text into keywords", () => {
    const keywordsOf = (name: string) => CARD_CONTENT.rooms.find((r) => r.name === name)?.keywords;
    expect(keywordsOf("Monster 5-3")).toEqual(["Ambush", "Heavy"]);
    expect(keywordsOf("Double Dark Hallway of Death")).toEqual(["Lockstep", "Dim"]);
  });

  it("fails the build on a room keyword it doesn't know", () => {
    expect(() => roomKeywords("Sticky (clings)", "Test Room")).toThrow(/unknown room keyword "Sticky"/);
    expect(roomKeywords("", "Test Room")).toEqual([]);
  });

  it("reads every outcome and Flee line into effects", () => {
    // A clause the generator does not know is kept on the line as `unparsed`
    // so the list still builds. This test is where it goes red: the PR that
    // printed the line plans the engine work, and extends the generator's
    // clauses (tools/cards.mjs) and the engine together.
    const unread: string[] = [];
    for (const room of CARD_CONTENT.rooms) {
      room.challenges.forEach((c, i) =>
        c.thresholds.forEach((t, j) => {
          for (const clause of t.unparsed ?? []) unread.push(`${room.name} line ${String(i + 1)}.${String(j + 1)}: "${clause}"`);
        }),
      );
      for (const clause of room.flee.unparsed ?? []) unread.push(`${room.name} Flee: "${clause}"`);
    }
    expect(unread).toEqual([]);
  });

  it("gives every room's threshold the same shape, whatever the room's printed kind", () => {
    // A Room and a Stairwell check a Challenge the same way, so no threshold
    // carries a kind-specific reading of the pool.
    for (const room of CARD_CONTENT.rooms) {
      for (const c of room.challenges) {
        for (const t of c.thresholds) expect(t).not.toHaveProperty("measuredOn");
      }
    }
  });

  it("only an `Ascend` or `You Win` outcome sets `ascends`", () => {
    for (const room of CARD_CONTENT.rooms) {
      for (const c of room.challenges) {
        for (const t of c.thresholds) {
          expect(t.ascends).toBe(/ascend|you win/i.test(t.outcome));
        }
      }
    }
  });
});
