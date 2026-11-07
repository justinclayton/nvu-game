// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSessionFrom } from "@application/session";
import { buildFixture } from "@domain/__fixtures__/scenarios";
import { App } from "./App";
import { TOUCH_QUERY, overlayBox } from "./Inspector";

/* The zoom opens by hover on a pointer and by a tap on touch. Both modes are
 * driven here by what `(hover: none)` says. */

const noop = () => {
  /* a new run is the composition root's business */
};

function table(touch: boolean, fixture = "play") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: touch && query === TOUCH_QUERY,
    media: query,
    addEventListener: noop,
    removeEventListener: noop,
  }));
  const state = buildFixture(fixture);
  if (!state) throw new Error(`no fixture ${fixture}`);
  act(() => {
    render(<App session={createSessionFrom(state)} onNewRun={noop} onOpenRun={() => null} />);
  });
}

const inspector = () => document.querySelector(".inspector");
const selected = () => document.querySelectorAll(".is-selected").length;
const redCard = () => document.querySelector('[data-zone="red-hand"]') as HTMLElement;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("with a pointer", () => {
  it("previews a hand card on hover, and one click acts on it", () => {
    table(false);
    fireEvent.mouseEnter(redCard());
    expect(inspector()).not.toBeNull();
    fireEvent.mouseLeave(redCard());
    expect(inspector()).toBeNull();

    fireEvent.click(redCard());
    expect(selected()).toBe(1);
  });

  it("zooms a face-up card that is not a button from the keyboard", () => {
    table(false);
    const room = document.querySelector('[data-zone="room"]') as HTMLElement;
    expect(room.tabIndex).toBe(0);
    fireEvent.focus(room);
    expect(inspector()).not.toBeNull();
    fireEvent.blur(room);
    expect(inspector()).toBeNull();
  });
});

describe("on touch", () => {
  it("zooms on the first tap and acts on the second", () => {
    table(true);
    fireEvent.click(redCard());
    expect(inspector()).not.toBeNull();
    expect(selected()).toBe(0);

    fireEvent.click(redCard());
    expect(selected()).toBe(1);
  });

  it("does not zoom on the hover and focus a tap sends ahead of its click", () => {
    table(true);
    fireEvent.mouseEnter(redCard());
    fireEvent.focus(redCard());
    expect(inspector()).toBeNull();
  });

  it("zooms a different card instead of acting on it", () => {
    table(true);
    const cards = document.querySelectorAll('[data-zone="red-hand"]');
    fireEvent.click(cards[0] as HTMLElement);
    fireEvent.click(cards[1] as HTMLElement);
    expect(selected()).toBe(0);
    fireEvent.click(cards[1] as HTMLElement);
    expect(selected()).toBe(1);
  });

  it("clears on a tap elsewhere", () => {
    table(true);
    fireEvent.click(redCard());
    fireEvent.click(screen.getByRole("heading", { name: "North vs Up" }));
    expect(inspector()).toBeNull();
  });

  it("zooms a card that is not a button on a tap", () => {
    table(true);
    fireEvent.click(document.querySelector('[data-zone="room"]') as HTMLElement);
    expect(inspector()).not.toBeNull();
  });
});

/* The cards in a choice panel in the dock zoom the same way. */
describe("in a choice panel", () => {
  const choice = () => document.querySelector(".dock .card") as HTMLElement;
  const picked = () => document.querySelectorAll(".dock .is-selected").length;

  it("previews a card on hover and focus, and one click picks it", () => {
    table(false, "choose-cards");
    fireEvent.mouseEnter(choice());
    expect(inspector()).not.toBeNull();
    fireEvent.mouseLeave(choice());
    expect(inspector()).toBeNull();
    fireEvent.focus(choice());
    expect(inspector()).not.toBeNull();
    fireEvent.blur(choice());

    fireEvent.click(choice());
    expect(picked()).toBe(1);
  });

  it("zooms on the first tap and picks on the second, on touch", () => {
    table(true, "choose-cards");
    fireEvent.click(choice());
    expect(inspector()).not.toBeNull();
    expect(picked()).toBe(0);

    fireEvent.click(choice());
    expect(inspector()).not.toBeNull();
    expect(picked()).toBe(1);
  });

  it("zooms the cards of an ordering, which no click acts on", () => {
    table(false, "order-cards");
    fireEvent.mouseEnter(choice());
    expect(inspector()).not.toBeNull();
    cleanup();
    table(true, "order-cards");
    fireEvent.click(choice());
    expect(inspector()).not.toBeNull();
  });
});

describe("the compact overlay", () => {
  const CARD_W = (h: number) => (h * 5) / 7;
  const clear = (
    box: { top: number; left: number; height: number },
    slot: { left: number; top: number; right: number; bottom: number },
  ) => {
    const w = CARD_W(box.height);
    const r = { left: box.left - w / 2, right: box.left + w / 2, top: box.top, bottom: box.top + box.height };
    return r.right <= slot.left || r.left >= slot.right || r.bottom <= slot.top || r.top >= slot.bottom;
  };

  it("centres a card that has no hand to avoid", () => {
    expect(overlayBox(null, { width: 844, height: 290 })).toEqual({ top: 40, left: 422, height: 210 });
  });

  it("stays at least 180 tall and clear of a half-width hand wherever the hand is on a 844x390 phone", () => {
    // 844 wide, 290 left above the dock; Gray's hand is the right half, 123 tall.
    const screen = { width: 844, height: 290 };
    for (let top = -100; top <= 290; top += 10) {
      const slot = { left: 436, right: 824, top, bottom: top + 123 };
      const box = overlayBox(slot, screen);
      expect(box.height).toBeGreaterThanOrEqual(180);
      expect(clear(box, slot)).toBe(true);
    }
  });

  it("uses the band above or below a hand that spans the screen", () => {
    const screen = { width: 390, height: 800 };
    const above = overlayBox({ left: 8, right: 382, top: 600, bottom: 720 }, screen);
    expect(above).toEqual({ top: 195, left: 195, height: 210 });
    const below = overlayBox({ left: 8, right: 382, top: 40, bottom: 160 }, screen);
    expect(below.top).toBeGreaterThanOrEqual(168);
  });

  it("shrinks, rather than vanish, when nothing clear is tall enough", () => {
    const box = overlayBox({ left: 0, right: 844, top: 100, bottom: 200 }, { width: 844, height: 290 });
    expect(box.height).toBeGreaterThanOrEqual(110);
  });
});
