import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { randomPolicy } from "./policy";
import { simulate } from "./run";

describe("random", () => {
  it("is deterministic: the same seed gives the same command log", () => {
    const a = simulate(11, randomPolicy, CARD_CONTENT);
    const b = simulate(11, randomPolicy, CARD_CONTENT);
    expect(b.commands).toEqual(a.commands);
    expect(b.final).toEqual(a.final);
  });
});
