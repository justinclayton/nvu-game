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

function table(touch: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: touch && query === TOUCH_QUERY,
    media: query,
    addEventListener: noop,
    removeEventListener: noop,
  }));
  const state = buildFixture("play");
  if (!state) throw new Error("no fixture play");
  act(() => {
    render(<App session={createSessionFrom(state)} onNewRun={noop} onOpenRun={noop} />);
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

describe("the compact overlay", () => {
  it("sits in the larger band the hands row leaves clear", () => {
    expect(overlayBox({ top: 500, bottom: 620 }, 800)).toEqual({ top: 145, height: 210 });
    expect(overlayBox({ top: 40, bottom: 160 }, 800)).toEqual({ top: 375, height: 210 });
  });

  it("shrinks to the band when the screen is short, and centres when the hands are out of view", () => {
    const short = overlayBox({ top: 200, bottom: 323 }, 390);
    expect(short.height).toBeLessThan(210);
    expect(short.top + short.height).toBeLessThanOrEqual(200);
    expect(overlayBox(null, 390)).toEqual({ top: 90, height: 210 });
  });
});
