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

import type { CardId, GameState } from "../types";

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

/** Play a named card, paying its cost with the first other cards in hand. */
function cast(state: GameState, c: "Red" | "Gray", name: string) {
  const played = handCard(state, c, name);
  const pay = state[c].hand.filter((x) => x.id !== played.id).slice(0, played.cost);
  return must(state, {
    type: "PLAY_CARD",
    character: c,
    cardId: played.id,
    payWith: pay.map((x) => x.id),
  });
}

function pendingCards(state: GameState) {
  const pending = state.pending;
  if (pending?.kind !== "ChooseCards") throw new Error("expected a card choice");
  return pending;
}

describe("Break Through — 'Scrap 1 card from your hand'", () => {
  it("makes the player pick a card from hand and Scraps it", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Break Through"), card("Shove"), card("Charge In"), card("Lean In")],
      }),
    });
    const asked = cast(state, "Red", "Break Through");
    const pending = pendingCards(asked.state);
    expect(pending.optional).toBe(false);
    expect(pending.options).toHaveLength(2);
    const target = pending.options.find((c) => c.name === "Charge In") ?? pending.options[0];
    if (!target) throw new Error("no options");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [target.id] });
    expect(next.scrapyard.map((c) => c.id)).toEqual([target.id]);
    expect(next.Red.hand.some((c) => c.id === target.id)).toBe(false);
    expect(eventTypes(events)).toContain("CARD_SCRAPPED");
  });

  it("asks nothing when the hand is empty", () => {
    const state = playing({ Red: player({ deck: pile("Shove", 3), hand: [card("Break Through"), card("Shove")] }) });
    // The one card left in hand pays the cost, so nothing is left to Scrap.
    const { state: next } = cast(state, "Red", "Break Through");
    expect(next.Red.hand).toHaveLength(0);
    expect(next.pending).toBeNull();
    expect(next.scrapyard).toHaveLength(0);
  });
});

describe("Set 'Em Up — 'The next card Gray plays this turn gains +2 Scramble'", () => {
  const armed = () => {
    const state = playing({
      Red: player({ deck: pile("Shove", 3), hand: [card("Set 'Em Up"), card("Shove")] }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: pile("Coil Of Cable", 3),
      }),
    });
    return cast(state, "Red", "Set 'Em Up").state;
  };

  it("gives the first card Gray plays +2 Scramble, and only that card", () => {
    const state = armed();
    const [a, b] = state.Gray.hand;
    if (!a || !b) throw new Error("rig");
    const base = statPool(state).scramble;
    const first = must(state, { type: "PLAY_CARD", character: "Gray", cardId: a.id, payWith: [] });
    const printed = a.scramble;
    expect(statPool(first.state).scramble).toBe(base + printed + 2);
    const second = must(first.state, { type: "PLAY_CARD", character: "Gray", cardId: b.id, payWith: [] });
    expect(statPool(second.state).scramble).toBe(base + printed + 2 + b.scramble);
  });

  it("is lost when Gray plays nothing more, and gone by the next turn", () => {
    const state = armed();
    // Nothing in the pool yet beyond Set 'Em Up's own Scramble: the bonus waits for a card.
    expect(statPool(state).scramble).toBe(1);
  });

  it("does not boost Red's own next card", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Set 'Em Up"), card("Shove"), card("Coil Of Cable")],
      }),
    });
    const after = cast(state, "Red", "Set 'Em Up").state;
    const cable = handCard(after, "Red", "Coil Of Cable");
    const next = must(after, { type: "PLAY_CARD", character: "Red", cardId: cable.id, payWith: [] });
    expect(statPool(next.state).scramble).toBe(1 + cable.scramble);
  });
});

describe("Brute Recycle — 'Scrap 1 starter card from your hand or discard pile. If you do, draw 1 card'", () => {
  it("offers only starter cards from hand and discard", () => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("Brute Recycle"), card("Shove"), card("Cross Punch")],
        discard: [card("Charge In"), card("Pry Bar")],
      }),
    });
    const asked = cast(state, "Red", "Brute Recycle");
    const offered = pendingCards(asked.state).options.map((c) => c.name);
    expect(offered).toEqual(expect.arrayContaining(["Charge In"]));
    expect(offered).not.toContain("Cross Punch");
    expect(offered).not.toContain("Pry Bar");
  });

  it("Scraps a starter from the discard pile and draws a card", () => {
    const state = playing({
      Red: player({
        deck: pile("Lean In", 3),
        hand: [card("Brute Recycle"), card("Cross Punch")],
        discard: [card("Charge In")],
      }),
    });
    const asked = cast(state, "Red", "Brute Recycle");
    const target = pendingCards(asked.state).options[0];
    if (!target) throw new Error("no options");
    expect(target.name).toBe("Charge In");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [target.id] });
    expect(next.scrapyard.map((c) => c.id)).toEqual([target.id]);
    expect(next.Red.discard.some((c) => c.id === target.id)).toBe(false);
    expect(eventTypes(events)).toContain("CARD_DRAWN");
  });

  it("Scraps a starter from hand and draws a card", () => {
    const state = playing({
      Red: player({
        deck: pile("Lean In", 3),
        hand: [card("Brute Recycle"), card("Cross Punch"), card("Shove")],
      }),
    });
    const asked = cast(state, "Red", "Brute Recycle");
    const target = pendingCards(asked.state).options[0];
    if (!target) throw new Error("no options");
    const { state: next } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [target.id] });
    expect(next.scrapyard).toHaveLength(1);
    expect(next.Red.hand.some((c) => c.id === target.id)).toBe(false);
    expect(next.Red.deck).toHaveLength(2);
  });

  it("scraps and draws nothing when there is no starter card", () => {
    const state = playing({
      Red: player({
        deck: pile("Lean In", 3),
        hand: [card("Brute Recycle"), card("Cross Punch")],
        discard: [card("Pry Bar")],
      }),
    });
    const { state: next, events } = cast(state, "Red", "Brute Recycle");
    expect(next.pending).toBeNull();
    expect(next.scrapyard).toHaveLength(0);
    expect(eventTypes(events)).not.toContain("CARD_DRAWN");
  });
});

describe("Rhythm & Bruise — 'Gains Oomph +2 for each card Gray has played this turn'", () => {
  const withGrayPlays = (n: number) => {
    const state = playing({
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Rhythm & Bruise"), card("Shove")],
      }),
      Gray: player({
        deck: pile("Duck Under", 4),
        hand: pile("Coil Of Cable", 3),
      }),
    });
    const plays = state.Gray.hand.slice(0, n).map((c) => free("Gray", c.id));
    return play(state, plays).state;
  };

  it("adds 2 Oomph per Gray card in the play zone, recalculated as more arrive", () => {
    const state = withGrayPlays(1);
    const { state: next } = cast(state, "Red", "Rhythm & Bruise");
    const rhythm = next.playZone.find((p) => p.card.name === "Rhythm & Bruise");
    if (!rhythm) throw new Error("not played");
    expect(contributionOf(next, rhythm).oomph).toBe(4);
    const gray = next.Gray.hand[0];
    if (!gray) throw new Error("rig");
    const more = must(next, free("Gray", gray.id));
    expect(contributionOf(more.state, rhythm).oomph).toBe(6);
  });

  it("does not draw when Gray has played fewer than 2 cards", () => {
    const { events } = cast(withGrayPlays(1), "Red", "Rhythm & Bruise");
    expect(eventTypes(events)).not.toContain("CARD_DRAWN");
  });

  it("draws 1 when Gray has played 2 cards", () => {
    const { state: next, events } = cast(withGrayPlays(2), "Red", "Rhythm & Bruise");
    expect(eventTypes(events).filter((t) => t === "CARD_DRAWN")).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(3);
  });

  it("does not draw for cards Gray plays after it", () => {
    const state = withGrayPlays(0);
    const { state: next } = cast(state, "Red", "Rhythm & Bruise");
    const [a, b] = next.Gray.hand;
    if (!a || !b) throw new Error("rig");
    const later = play(next, [free("Gray", a.id), free("Gray", b.id)]);
    expect(later.events.map((e) => e.type)).not.toContain("CARD_DRAWN");
  });
});

describe("Momentum Shift — 'Draw 2 cards, then Exhaust 1 card from your hand'", () => {
  it("draws 2, then asks which card in hand to Exhaust", () => {
    const state = playing({
      Red: player({
        deck: pile("Lean In", 4),
        hand: [card("Momentum Shift"), card("Shove")],
      }),
    });
    const asked = cast(state, "Red", "Momentum Shift");
    expect(asked.events.filter((e) => e.type === "CARD_DRAWN")).toHaveLength(2);
    const pending = pendingCards(asked.state);
    expect(pending.options).toHaveLength(2);
    const target = pending.options.find((c) => c.name === "Lean In");
    if (!target) throw new Error("drawn card not offered");
    const { state: next, events } = must(asked.state, { type: "CHOOSE_CARDS", cardIds: [target.id] });
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([target.id]);
    expect(next.Red.hand.some((c) => c.id === target.id)).toBe(false);
    expect(eventTypes(events)).toContain("CARD_EXHAUSTED");
  });
});
