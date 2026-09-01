import { describe, expect, it } from "vitest";
import { freshSeed } from "./seed";

describe("seed source", () => {
  it("produces a 32-bit integer", () => {
    const seed = freshSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBe(seed | 0);
  });
});
