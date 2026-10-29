/* Rulebook, Keywords: Empty deck, and Going Down — running out of cards, and the end of the run. */

import { beforeEach, describe, expect, it } from "vitest";
import {
  card,
  eventTypes,
  free,
  goingDown,
  handCard,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";

beforeEach(resetRig);

describe("Keywords: Empty deck", () => {
  it("'first shuffle your discard pile to form a new deck' — on a draw", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Red.deck).toEqual([]);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });

  it("'first shuffle your discard pile to form a new deck' — on `Exhaust X cards from your deck`", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Comrade Black"),
      Red: player({ deck: [], discard: pile("Shove", 5), hand: [card("Pry Bar")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Comrade Black is Heavy: "Whenever you play a card, Exhaust 1 from the top of your deck."
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Pry Bar").id));
    expect(next.pending).toBeNull();
    expect(next.Red.exhaust).toHaveLength(1);
    expect(next.Red.deck).toHaveLength(4);
    expect(next.Red.discard).toEqual([]);
    expect(eventTypes(events)).toContain("DISCARD_RESHUFFLED");
  });

  it("a bare `Exhaust X` with an empty deck offers the discard pile, and nothing reshuffles", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: pile("Shove", 5), hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Overdrive: "Exhaust 1."
    const { state: asked, events } = must(state, free("Red", handCard(state, "Red", "Overdrive").id));
    const pending = asked.pending;
    if (pending?.kind !== "ChooseExhaust") throw new Error("expected an Exhaust choice");
    expect(pending.deck).toBe(0);
    expect(pending.options).toHaveLength(5);
    expect(eventTypes(events)).not.toContain("DISCARD_RESHUFFLED");
    const first = pending.options[0];
    if (!first) throw new Error("rig");
    const { state: next } = must(asked, { type: "EXHAUST_CARD", cardId: first.id });
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([first.id]);
    expect(next.Red.discard).toHaveLength(4);
  });

  it("'if your discard pile is also empty, you go Down' — on a draw", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: [] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.phase).toBe("GameOver");
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("Turn Start's draw is not a question: both hands fill to 5 with nothing to decline", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: pile("Shove", 5) }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.pending).toBeNull();
    expect(next.Red.hand).toHaveLength(5);
    expect(next.Gray.hand).toHaveLength(5);
    expect(eventTypes(events).filter((t) => t === "CARD_DRAWN")).toHaveLength(10);
  });

  it("'if your discard pile is also empty, you go Down' — on an Exhaust", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [card("Overdrive")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Overdrive: "Exhaust 1."
    const { state: next, events } = must(
      state,
      free("Red", handCard(state, "Red", "Overdrive").id),
    );
    expect(next.phase).toBe("GameOver");
    expect(next.Red.down).toBe(true);
    expect(eventTypes(events)).toContain("WENT_DOWN");
  });

  it("does not end the run while the deck runs out but the discard pile still has cards", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Ticking Time Bomb"),
      Red: player({ deck: pile("Shove", 2), discard: pile("Shove", 3), hand: [] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Ticking Time Bomb's Flee line, Both players Exhaust 3: `play` answers it off
    // the deck, then from the discard pile once the deck is empty, never
    // leaving Red short.
    const { state: next } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).not.toBe("GameOver");
    expect(next.Red.down).toBe(false);
    expect(next.Red.exhaust).toHaveLength(3);
  });
});

describe("Going Down", () => {
  it("'you go Down and the game is lost' — one character is enough", () => {
    const state = goingDown([card("Pry Bar")]);
    // Ticking Time Bomb's Flee line: Both players Exhaust 3.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });

  it("'If one player has no cards in their hand, deck, or discard pile, you go Down' — an Exhaust takes the hand first", () => {
    const state = goingDown([card("Pry Bar"), card("Shove")]);
    // Ticking Time Bomb's Flee line, Both players Exhaust 3: both cards in hand go, then Red is out.
    const { state: next, events } = play(state, [{ type: "END_PLAY" }]);
    expect(next.Red.hand).toEqual([]);
    expect(next.Red.exhaust.map((c) => c.name).sort()).toEqual(["Pry Bar", "Shove"]);
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(next.phase).toBe("GameOver");
  });

  it("a draw with cards in hand and an empty deck and discard pile takes nothing, and nobody goes Down", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Security Turnstile")],
      Red: player({ deck: [], discard: [], hand: [card("Shove"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 5) }),
    });
    const { state: next, events } = must(state, { type: "FLIP_ROOM" });
    expect(next.phase).toBe("Play");
    expect(next.Red.down).toBe(false);
    expect(next.Red.hand).toHaveLength(2);
    expect(eventTypes(events)).not.toContain("WENT_DOWN");
  });
});

describe("Winning and losing", () => {
  it("'you lose when either character goes Down'", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Security Turnstile"),
      Red: player({ deck: [], discard: [], hand: [] }),
      Gray: player({ deck: pile("Duck Under", 4), hand: pile("Duck Under", 2) }),
    });
    // Security Turnstile's Flee line, Both players Exhaust 1, sends Red Down
    // immediately: Red's deck and discard pile are both already empty.
    const { state: next, events } = must(state, { type: "END_PLAY" });
    expect(next.phase).toBe("GameOver");
    expect(next.outcome).toBe("Defeat");
    expect(eventTypes(events)).toContain("WENT_DOWN");
    expect(eventTypes(events)).toContain("GAME_OVER");
  });
});

describe("Keywords: `Exhaust X` — the player picks each card", () => {
  const fleeing = (red: Parameters<typeof player>[0]) =>
    rig({
      phase: "Play",
      // Security Turnstile's Flee line: Both players Exhaust 1.
      activeRoom: room("Security Turnstile"),
      Red: player(red),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });

  it("asks for a card from the hand or discard pile, or the top of the deck, one character at a time", () => {
    const state = fleeing({ deck: pile("Shove", 3), discard: [card("Charge")], hand: [card("Coil Of Cable")] });
    const asked = must(state, { type: "END_PLAY" }).state;
    const pending = asked.pending;
    if (pending?.kind !== "ChooseExhaust") throw new Error("expected an Exhaust choice");
    expect(pending.character).toBe("Red");
    expect(pending.remaining).toBe(1);
    expect(pending.deck).toBe(3);
    expect(pending.options.map((c) => c.name)).toEqual(["Coil Of Cable", "Charge"]);
    const coil = handCard(asked, "Red", "Coil Of Cable");
    const next = must(asked, { type: "EXHAUST_CARD", cardId: coil.id }).state;
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([coil.id]);
    expect(next.Red.deck).toHaveLength(3);
    // Gray holds only a deck, so Gray's card goes without a question.
    expect(next.Gray.exhaust).toHaveLength(1);
    expect(next.pending).toBeNull();
  });

  it("the top of the deck is an answer while the deck holds a card", () => {
    const state = fleeing({ deck: pile("Shove", 3), hand: [card("Coil Of Cable")] });
    const asked = must(state, { type: "END_PLAY" }).state;
    const top = asked.Red.deck[0];
    const next = must(asked, { type: "EXHAUST_CARD", cardId: null }).state;
    expect(next.Red.exhaust.map((c) => c.id)).toEqual([top?.id]);
    expect(next.Red.hand.map((c) => c.name)).toContain("Coil Of Cable");
  });

  it("asks nothing when the deck alone holds cards", () => {
    const state = fleeing({ deck: pile("Shove", 3) });
    const { state: next } = must(state, { type: "END_PLAY" });
    expect(next.pending).toBeNull();
    expect(next.Red.exhaust).toHaveLength(1);
  });

  it("`Exhaust X cards from your deck` asks for a card in hand only once the deck and discard pile are empty", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Comrade Black"),
      Red: player({ deck: [], discard: [], hand: [card("Pry Bar"), card("Shove"), card("Coil Of Cable")] }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    // Comrade Black is Heavy: "Whenever you play a card, Exhaust 1 from the top of your deck."
    const asked = must(state, free("Red", handCard(state, "Red", "Pry Bar").id)).state;
    const pending = asked.pending;
    if (pending?.kind !== "ChooseExhaust") throw new Error("expected an Exhaust choice");
    expect(pending.deck).toBe(0);
    expect(pending.options.map((c) => c.name)).toEqual(["Shove", "Coil Of Cable"]);
    expect(asked.Red.down).toBe(false);
  });
});
