import { describe, expect, it } from "vitest";
import type { DrawOption } from "@domain/types";
import { answerDraw } from "./draw";

const one: readonly DrawOption[] = [{ character: "Red", count: 1 }];
const upToTwo: readonly DrawOption[] = [
  { character: "Gray", count: 1 },
  { character: "Gray", count: 2 },
];
const either: readonly DrawOption[] = [
  { character: "Red", count: 1 },
  { character: "Gray", count: 1 },
];

const draw = (character: "Red" | "Gray" | null, count: number) => ({
  ok: true,
  command: { type: "CHOOSE_DRAW", character, count },
});

describe("answering a 'you may draw'", () => {
  it("'choose none' draws nothing", () => {
    expect(answerDraw(one, [])).toEqual(draw(null, 0));
    expect(answerDraw(upToTwo, ["0"])).toEqual(draw(null, 0));
  });

  it("takes the only draw on offer with a bare 'choose 1' or 'choose Red'", () => {
    expect(answerDraw(one, ["1"])).toEqual(draw("Red", 1));
    expect(answerDraw(one, ["red"])).toEqual(draw("Red", 1));
  });

  it("asks how many when up to 2 is on offer", () => {
    expect(answerDraw(upToTwo, ["2"])).toEqual(draw("Gray", 2));
    expect(answerDraw(upToTwo, ["Gray", "1"])).toEqual(draw("Gray", 1));
    expect(answerDraw(upToTwo, ["3"])).toMatchObject({ ok: false });
  });

  it("asks who when either character may draw", () => {
    expect(answerDraw(either, ["Gray"])).toEqual(draw("Gray", 1));
    expect(answerDraw(either, ["1"])).toMatchObject({ ok: false });
    expect(answerDraw(either, ["Red", "Red"])).toMatchObject({ ok: false });
  });

  it("refuses a name that is neither a character nor a number", () => {
    expect(answerDraw(one, ["Shove"])).toMatchObject({ ok: false });
  });
});
