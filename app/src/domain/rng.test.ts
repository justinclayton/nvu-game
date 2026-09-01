import { describe, expect, it } from "vitest";
import { drawBlind, nextRandom, shuffle } from "./rng";

describe("seeded randomness", () => {
  it("is a pure function of the seed", () => {
    expect(nextRandom(1)).toEqual(nextRandom(1));
    expect(nextRandom(1)).not.toEqual(nextRandom(2));
  });

  it("shuffles without mutating the input and returns the advanced seed", () => {
    const input = [1, 2, 3, 4, 5];
    const [out, seed] = shuffle(input, 42);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual(input);
    expect(seed).not.toBe(42);
    expect(shuffle(input, 42)[0]).toEqual(out);
  });

  it("draws blind from a pile, leaving the rest", () => {
    const [card, rest] = drawBlind(["a", "b", "c"], 7);
    expect(card).not.toBeNull();
    expect(rest).toHaveLength(2);
    expect(rest).not.toContain(card);
  });

  it("draws nothing from an empty pile", () => {
    expect(drawBlind([], 7)).toEqual([null, [], 7]);
  });
});
