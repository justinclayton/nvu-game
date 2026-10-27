/* A conditional stat's hand line shows its current value, not `(conditional)`. */

import { beforeEach, describe, expect, it } from "vitest";
import { cardLine, moveHint, printedFaceLine } from "./render";
import { card, handCard, must, pile, player, playing, resetRig, rig, room } from "@domain/__fixtures__/rig";
import { CARD_CONTENT } from "@content/index";

beforeEach(resetRig);

describe("cardLine — a conditional stat", () => {
  it('shows In Step\'s current Scramble, marked "now"', () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 6), hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 6), hand: [card("In Step")] }),
    });
    const [firstShove, secondShove] = state.Red.hand;
    if (!firstShove || !secondShove) throw new Error("rig: Red is not holding two Shoves");
    const { state: afterRedPlays } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: firstShove.id,
      payWith: [secondShove.id],
    });

    const line = cardLine(afterRedPlays, "Gray", handCard(afterRedPlays, "Gray", "In Step"));

    expect(line).toBe(
      "In Step [cost 2; Scramble 2 now] — Scramble equal to 2 times the number of cards Red has played this turn.",
    );
  });

  it("shows One Man's Junk's stats from the Bad Stuff Gray is holding", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 6) }),
      Gray: player({ hand: [card("One Man's Junk"), card("Torn Seal")] }),
    });
    const line = cardLine(state, "Gray", handCard(state, "Gray", "One Man's Junk"));
    expect(line).toBe(
      "One Man's Junk [cost 1; Oomph 3 now, Scramble 3 now] — +3 Oomph and +3 Scramble for each Bad Stuff you're holding.",
    );
  });

  it("shows Junk Launcher's Oomph as it would be once played, counting its own cost", () => {
    const state = playing({
      Red: player({ hand: [card("Junk Launcher")] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    const shove = card("Shove");
    const withAPlay = { ...state, playZone: [{ owner: "Gray" as const, card: shove }] };

    const launcher = handCard(withAPlay, "Red", "Junk Launcher");
    const line = cardLine(withAPlay, "Red", launcher);

    expect(line).toBe(
      `Junk Launcher [cost 2; Oomph ${String(shove.cost + launcher.cost)} now] — Oomph equal to the total printed cost of all cards in the play zone.`,
    );
  });

  it('still prints "(conditional)" for a printed face, with no game state to compute from', () => {
    const face = CARD_CONTENT.cards.find((c) => c.name === "In Step");
    if (!face) throw new Error("rig: no In Step in cards.yaml");
    expect(printedFaceLine(face)).toBe(
      "In Step [cost 2; (conditional)] — Scramble equal to 2 times the number of cards Red has played this turn.",
    );
  });
});

describe("moveHint — a 'you may draw'", () => {
  const asking = (options: { character: "Red" | "Gray"; count: number }[]) =>
    rig({
      phase: "Play",
      pending: { kind: "ChooseDraw", prompt: "Draw?", options, source: null },
    });

  it("says how to draw, and that none is an answer", () => {
    const hint = moveHint(asking([{ character: "Red", count: 1 }, { character: "Red", count: 2 }]));
    expect(hint).toContain("choose <N> — draw: 1, 2 — or choose none");
  });

  it("asks for a name when either character may draw", () => {
    const hint = moveHint(asking([{ character: "Red", count: 1 }, { character: "Gray", count: 1 }]));
    expect(hint).toContain("choose <Name> — draw: Red 1, Gray 1 — or choose none");
  });
});

describe("moveHint — a room choice", () => {
  const revealing = (names: string[]) =>
    rig({
      phase: "Turn Start",
      pending: { kind: "ChooseRoom", prompt: "Enter which room?", options: names.map(room), source: null },
    });

  it("offers every revealed room", () => {
    const hint = moveHint(revealing(["Security Turnstile", "Ventilation Shaft", "Puzzle Room"]));
    expect(hint).toContain("enter one of: Security Turnstile, Ventilation Shaft, Puzzle Room;");
  });

  it("names Ambush when it leaves one room to enter", () => {
    const hint = moveHint(revealing(["Security Turnstile", "Regular Monster 2", "Puzzle Room"]));
    expect(hint).toContain("Ambush: you must enter Regular Monster 2;");
  });
});

describe("moveHint — an Exhaust", () => {
  it("names the hand, the discard pile and the deck", () => {
    const state = rig({
      phase: "Play",
      Red: player({ deck: pile("Shove", 2), discard: [card("Charge")], hand: [card("Coil Of Cable")] }),
    });
    const hand = state.Red.hand;
    const discard = state.Red.discard;
    const hint = moveHint({
      ...state,
      pending: {
        kind: "ChooseExhaust",
        prompt: "Red: Exhaust 1.",
        character: "Red",
        options: [...hand, ...discard],
        deck: 2,
        remaining: 1,
        source: null,
      },
    });
    expect(hint).toContain(
      "hand Coil Of Cable; discard Charge, or choose deck for the top card, unseen (2 in the deck)",
    );
  });
});
