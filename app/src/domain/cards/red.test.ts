/* One test per entry in Red's registry, beside the behaviour. */

import { beforeEach, describe, expect, it } from "vitest";
import { contributionOf, costOf, statPool } from "../queries";
import {
  card,
  eventTypes,
  free,
  handCard,
  ids,
  must,
  pile,
  play,
  player,
  playing,
  resetRig,
} from "../__fixtures__/rig";

import type { CardId } from "../types";

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

describe("Cross Punch — 'Exhaust 1'", () => {
  it("takes one off the top of your own deck, into the Exhaust pile", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Cross Punch"), card("Shove"), card("Shove")] }),
    });
    const hand = ids(state, "Red");
    const { state: next } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId, hand[2] as CardId],
    });
    expect(next.Red.deck).toHaveLength(3);
    expect(next.Red.exhaust).toHaveLength(1);
  });
});

describe("Tag Team — 'If Gray played a card this turn, draw 1 card'", () => {
  it("draws nothing while Gray has played nothing", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Tag Team"), card("Shove")] }),
    });
    const hand = ids(state, "Red");
    const { state: next, events } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(eventTypes(events)).not.toContain("CARD_DRAWN");
    expect(next.Red.deck).toHaveLength(4);
  });

  it("draws a card once Gray has played", () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 4), hand: [card("Tag Team"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
    });
    const played = play(state, [free("Gray", ids(state, "Gray")[0] as CardId)]);
    const hand = ids(played.state, "Red");
    const { state: next, events } = must(played.state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: hand[0] as CardId,
      payWith: [hand[1] as CardId],
    });
    expect(eventTypes(events)).toContain("CARD_DRAWN");
    expect(next.Red.deck).toHaveLength(3);
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

describe("Junk Launcher — 'Oomph equal to the total printed cost of all cards in the play zone'", () => {
  it("is just its own cost when nothing else has been played", () => {
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
    // Junk Launcher costs 2, the payment cards it's discarded do not count.
    expect(statPool(next).oomph).toBe(2);
  });

  it("counts a second card played and paid for later the same turn", () => {
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
    // Junk Launcher is the only card played so far, costing 2.
    expect(statPool(afterLauncher).oomph).toBe(2);

    const { state: afterSecond } = must(afterLauncher, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: second.id,
      payWith: [payerC.id],
    });
    // Junk Launcher (cost 2) plus the Shove played later the same turn (cost 1): 3.
    const launcherAfter = afterSecond.playZone.find((p) => p.card.name === "Junk Launcher");
    expect(launcherAfter && contributionOf(afterSecond, launcherAfter).oomph).toBe(3);
  });

  it("counts a card Gray plays after Red has played Junk Launcher", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Junk Launcher"), card("Shove"), card("Shove")],
      }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: [card("Duck Under"), card("Coil Of Cable")],
      }),
    });
    const shoves = state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const { state: afterLauncher } = must(state, {
      type: "PLAY_CARD",
      character: "Red",
      cardId: handCard(state, "Red", "Junk Launcher").id,
      payWith: shoves,
    });
    // Junk Launcher is the only card in the play zone so far, costing 2.
    expect(statPool(afterLauncher).oomph).toBe(2);

    const { state: afterGray } = must(afterLauncher, {
      type: "PLAY_CARD",
      character: "Gray",
      cardId: handCard(afterLauncher, "Gray", "Duck Under").id,
      payWith: [handCard(afterLauncher, "Gray", "Coil Of Cable").id],
    });
    // Duck Under costs 1, and Gray owns it: Junk Launcher's Oomph goes up by 1.
    const launcherAfter = afterGray.playZone.find((p) => p.card.name === "Junk Launcher");
    expect(launcherAfter && contributionOf(afterGray, launcherAfter).oomph).toBe(3);
  });

  it("counts a card played for free at its printed cost", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Junk Launcher"), card("Shove"), card("Shove"), card("Fast Follow")],
      }),
      Gray: player({ deck: pile("Duck Under", 4), hand: [card("Coil Of Cable")] }),
    });
    // Gray plays first so Fast Follow's freeIf is satisfied.
    const afterGray = play(state, [free("Gray", handCard(state, "Gray", "Coil Of Cable").id)]);
    const shoves = afterGray.state.Red.hand.filter((c) => c.name === "Shove").map((c) => c.id);
    const afterLauncher = play(afterGray.state, [
      { type: "PLAY_CARD", character: "Red", cardId: handCard(afterGray.state, "Red", "Junk Launcher").id, payWith: shoves },
    ]);
    // Fast Follow is free (its cost is reduced to 0), but its printed cost is 1.
    expect(costOf(afterLauncher.state, "Red", handCard(afterLauncher.state, "Red", "Fast Follow"))).toBe(0);
    const afterFastFollow = play(afterLauncher.state, [
      free("Red", handCard(afterLauncher.state, "Red", "Fast Follow").id),
    ]);
    // Coil Of Cable (0) + Junk Launcher (2) + Fast Follow's printed cost (1), even though it was free: 3.
    const launcherAfter = afterFastFollow.state.playZone.find((p) => p.card.name === "Junk Launcher");
    expect(launcherAfter && contributionOf(afterFastFollow.state, launcherAfter).oomph).toBe(3);
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
