// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createSession, type Session } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import { App } from "./App";

/* A handful of smoke tests. The rules are tested in domain; what is checked
 * here is that the table renders what the state says and that a button the
 * rules forbid is not offered. */

const SEED = 20260901;
let session: Session;

const noop = () => {
  /* a new run is the composition root's business */
};

beforeEach(() => {
  session = createSession(SEED, CARD_CONTENT);
  render(<App session={session} onNewRun={noop} />);
});

describe("the table", () => {
  it("shows both characters and the floor", () => {
    expect(screen.getByRole("heading", { name: "North vs Up" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Red" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Gray" })).toBeDefined();
    expect(screen.getByText("Floor 1")).toBeDefined();
  });

  it("offers the flip, and nothing else, at the start of a turn", () => {
    expect(screen.getByRole("button", { name: /Flip the next room/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: /check the room/ })).toBeNull();
  });

  it("names the room once it is flipped, and starts the Draw phase", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const room = session.getState().state.activeRoom;
    expect(room).not.toBeNull();
    expect(screen.getAllByText(room?.name ?? "").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Draw a card" })).toHaveLength(2);
  });

  it("offers the end of the Draw phase, and the room check only after it", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    expect(screen.queryByRole("button", { name: /check the room/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /finished drawing/ }));
    expect(screen.queryByRole("button", { name: "Draw a card" })).toBeNull();
    expect(screen.getByRole("button", { name: /check the room/ }).hasAttribute("disabled")).toBe(
      false,
    );
  });

  it("puts a drawn card in that character's hand", () => {
    // The flip opens Draw by dealing both characters one card; Red then takes
    // a second.
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Draw a card" })[0] as HTMLElement);
    const drawn = session.getState().state.Red.hand[1];
    expect(drawn).toBeDefined();
    // Cards live in one layer over the mat; a sprite says which zone it is in.
    const inRedHand = Array.from(document.querySelectorAll('[data-zone="red-hand"]'));
    expect(inRedHand).toHaveLength(2);
    expect(inRedHand[1]?.textContent).toContain(drawn?.name ?? "");
    expect(document.querySelectorAll('[data-zone="gray-hand"]')).toHaveLength(1);
  });

  it("shows the rejection when a command the rules refuse gets through", () => {
    // The button for this would be greyed; dispatching past it is how a bug
    // would reach the player, and the message is what they would see.
    act(() => {
      session.getState().dispatch({ type: "END_PLAY" });
    });
    expect(screen.getByText(/Cannot end the play phase during the Flip phase/)).toBeDefined();
  });

  it("draws every card exactly once, face down in a deck until it is drawn", () => {
    const sprites = () => Array.from(document.querySelectorAll(".sprite"));
    const { state } = session.getState();
    const onTable =
      state.floorDeck.length +
      state.Red.deck.length +
      state.Gray.deck.length +
      state.pools.Red.length +
      state.pools.Gray.length +
      state.pools.goodStuff.length +
      state.pools.badStuff.length;
    expect(sprites()).toHaveLength(onTable);
    expect(sprites().every((s) => s.classList.contains("is-down"))).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Draw a card" })[0] as HTMLElement);
    expect(sprites()).toHaveLength(onTable);
    const faceUp = sprites().filter((s) => !s.classList.contains("is-down"));
    expect(faceUp.map((s) => s.getAttribute("data-zone")).sort()).toEqual([
      "gray-hand",
      "red-hand",
      "red-hand",
      "room",
    ]);
  });

  it("writes the log outside React", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const log = screen.getByLabelText("Log");
    expect(log.textContent).toContain("You are in:");
  });
});
