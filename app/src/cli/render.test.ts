/* A conditional stat's hand line shows its current value, not `(conditional)`. */

import { beforeEach, describe, expect, it } from "vitest";
import { cardLine, moveHint, printedFaceLine } from "./render";
import { card, handCard, must, pile, player, playing, resetRig, rig } from "@domain/__fixtures__/rig";
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

  it("shows One Man's Junk's boosted stats once Bad Stuff has been played this turn", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 6) }),
      Gray: player({ hand: [card("One Man's Junk")] }),
    });

    const line = cardLine(state, "Gray", handCard(state, "Gray", "One Man's Junk"));
    expect(line).toBe(
      "One Man's Junk [cost 1; Oomph 2 now, Scramble 2 now] — If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1.",
    );

    const badStuff = state.pools.badStuff[0];
    if (!badStuff) throw new Error("rig: no Bad Stuff in the pool");
    const withBadStuffPlayed = {
      ...state,
      playZone: [{ owner: "Red" as const, card: badStuff }],
    };
    const boosted = cardLine(
      withBadStuffPlayed,
      "Gray",
      handCard(withBadStuffPlayed, "Gray", "One Man's Junk"),
    );
    expect(boosted).toBe(
      "One Man's Junk [cost 1; Oomph 3 now, Scramble 3 now] — If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1.",
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
    if (!face) throw new Error("rig: no In Step in design/cards.yaml");
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
