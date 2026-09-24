/* One test per entry in Red's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { contributionOf, costOf, statPool } from "../queries";
import {
  card,
  eventTypes,
  free,
  handCard,
  must,
  pile,
  play,
  player,
  playing,
  resetRig,
} from "../__fixtures__/rig";

beforeEach(resetRig);

describe("Reckless Swing — 'Exhaust 1'", () => {
  it("takes one off the top of your own deck, into the Exhaust pile", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Reckless Swing"), card("Shove")] }),
    });
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Reckless Swing").id,
      payWith: [handCard(state, "Red", "Shove").id],
    });
    expect(next.Red.deck).toHaveLength(3);
    // Paid from hand, not Exhausted.
    expect(next.Red.discard).toHaveLength(1);
    expect(next.Red.exhaust).toHaveLength(1);
  });
});

describe("Reckless — 'Exhaust 3'", () => {
  it("takes three off the top", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 5), hand: [card("Reckless"), card("Shove")] }),
    });
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Reckless").id,
      payWith: [handCard(state, "Red", "Shove").id],
    });
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("Fast Follow — 'If Gray played a card this turn, play this card for free'", () => {
  it("costs its printed 1 while Gray has played nothing", () => {
    const state = playing({ Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow")] }) });
    expect(costOf(state, "Red", handCard(state, "Red", "Fast Follow"))).toBe(1);
  });

  it("costs nothing once Gray has played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
    });
    const played = play(state, [free("Gray", handCard(state, "Gray", "Coil Of Cable").id)]);
    expect(costOf(played.state, "Red", handCard(played.state, "Red", "Fast Follow"))).toBe(0);
  });

  it("is free even while Sluggish is held, once Gray has played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow"), card("Sluggish")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
    });
    const played = play(state, [free("Gray", handCard(state, "Gray", "Coil Of Cable").id)]);
    expect(costOf(played.state, "Red", handCard(played.state, "Red", "Fast Follow"))).toBe(0);
  });

  it("pays its printed cost plus Sluggish's +1 while Gray has played nothing", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Fast Follow"), card("Sluggish")] }),
    });
    expect(costOf(state, "Red", handCard(state, "Red", "Fast Follow"))).toBe(2);
  });
});

describe("Second Wind — 'Shuffle a Red card from your Exhaust pile into your deck'", () => {
  it("offers Red's own Exhausted cards, and nothing else", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Second Wind"), card("Shove"), card("Shove")],
        exhaust: [card("Charge In"), card("Pry Bar")],
      }),
    });
    const secondWind = handCard(state, "Red", "Second Wind");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: secondWind.id,
      payWith: shoves,
    });
    const pending = asked.state.pending;
    expect(pending?.kind).toBe("ChooseCards");
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    // The Pry Bar is Stuff, not a Red card.
    const offered = pending.options.map((c) => c.name);
    expect(offered).toContain("Charge In");
    expect(offered).not.toContain("Pry Bar");

    const chosen = pending.options.find((c) => c.name === "Charge In");
    if (!chosen) throw new Error("Charge In not offered");
    const { state: next, events } = must(asked.state, {
      type: "CHOOSE_CARDS",
      cardIds: [chosen.id],
    });
    expect(next.Red.deck.some((c) => c.id === chosen.id)).toBe(true);
    expect(next.Red.exhaust.some((c) => c.id === chosen.id)).toBe(false);
    expect(eventTypes(events)).toContain("CARDS_SHUFFLED_IN");
  });
});

describe("Junk Launcher — 'Oomph +2 for each card spent to play it this turn'", () => {
  it("counts the cards already spent, which are no longer anywhere else", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Junk Launcher"), card("Shove"), card("Shove")],
      }),
    });
    const launcher = handCard(state, "Red", "Junk Launcher");
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: launcher.id,
      payWith: shoves,
    });
    // Printed Oomph 2, plus 2 for each of the two cards it cost.
    expect(statPool(next).oomph).toBe(6);
  });

  it("ignores a card paid for a different play later the same turn", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 5),
        hand: [card("Junk Launcher"), card("Shove"), card("Shove"), card("Shove"), card("Shove")],
      }),
    });
    const shoves = state.Red.hand.filter((c) => c.name === "Shove");
    const [payerA, payerB, second, payerC] = shoves;
    if (!payerA || !payerB || !second || !payerC) throw new Error("Red is not holding four Shoves");
    const { state: afterLauncher } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Junk Launcher").id,
      payWith: [payerA.id, payerB.id],
    });
    // Printed Oomph 2, plus 2 for each of the two cards it cost: 6.
    expect(statPool(afterLauncher).oomph).toBe(6);

    const { state: afterSecond } = must(afterLauncher, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: second.id,
      payWith: [payerC.id],
    });
    // Junk Launcher's own Oomph must not rise for a payment spent on a
    // different card played later the same turn.
    const launcherAfter = afterSecond.playZone.find((p) => p.card.name === "Junk Launcher");
    expect(launcherAfter && contributionOf(afterSecond, launcherAfter).oomph).toBe(6);
  });
});

describe("Heavy Pockets — 'Shuffle 1 Stuff from your hand into your deck'", () => {
  it("moves the chosen Stuff out of hand and into the deck", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Heavy Pockets"), card("Shove"), card("Pry Bar")],
      }),
    });
    const asked = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Heavy Pockets").id,
      payWith: [handCard(state, "Red", "Shove").id],
    });
    const pending = asked.state.pending;
    if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
    expect(pending.options.map((c) => c.name)).toEqual(["Pry Bar"]);
    const pryBar = pending.options[0];
    if (!pryBar) throw new Error("Pry Bar not offered");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Red.hand).toEqual([]);
  });
});
