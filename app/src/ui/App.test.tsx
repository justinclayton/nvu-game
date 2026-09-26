// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createSession, type Session } from "@application/session";
import { FULL_CONTENT as CARD_CONTENT } from "@domain/__fixtures__/rig";
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
  render(<App session={session} onNewRun={noop} onOpenRun={noop} />);
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

  it("names the room once it is flipped, and draws both hands to 5", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const room = session.getState().state.activeRoom;
    expect(room).not.toBeNull();
    expect(screen.getAllByText(room?.name ?? "").length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-zone="red-hand"]')).toHaveLength(5);
    expect(document.querySelectorAll('[data-zone="gray-hand"]')).toHaveLength(5);
  });

  it("offers the room check once the flip has drawn both hands — there is no Draw phase to wait in", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    expect(screen.getByRole("button", { name: /check the room/ }).hasAttribute("disabled")).toBe(
      false,
    );
  });

  it("shows the rejection when a command the rules refuse gets through", () => {
    // The button for this would be greyed; dispatching past it is how a bug
    // would reach the player, and the message is what they would see.
    act(() => {
      session.getState().dispatch({ type: "END_PLAY" });
    });
    expect(screen.getByText(/Cannot end the play phase during the Turn Start phase/)).toBeDefined();
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
    expect(sprites()).toHaveLength(onTable);
    const faceUp = sprites().filter((s) => !s.classList.contains("is-down"));
    const { state: next } = session.getState();
    const expectedFaceUp = [
      "room",
      ...Array<string>(next.Red.hand.length).fill("red-hand"),
      ...Array<string>(next.Gray.hand.length).fill("gray-hand"),
    ].sort();
    expect(faceUp.map((s) => s.getAttribute("data-zone")).sort()).toEqual(expectedFaceUp);
  });

  it("writes the log outside React", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const log = screen.getByLabelText("Log");
    expect(log.textContent).toContain("You are in:");
  });
});

describe("debug mode", () => {
  const sprites = () => Array.from(document.querySelectorAll(".sprite"));

  it("is off by default: face-down piles stay face down", () => {
    const checkbox = screen.getByRole("checkbox", { name: "Debug" }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(sprites().some((s) => s.classList.contains("is-down"))).toBe(true);
  });

  it("turns every pile face up when switched on, and back when switched off", () => {
    const before = sprites().filter((s) => s.classList.contains("is-down")).length;
    expect(before).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("checkbox", { name: "Debug" }));
    expect(sprites().some((s) => s.classList.contains("is-down"))).toBe(false);

    fireEvent.click(screen.getByRole("checkbox", { name: "Debug" }));
    expect(sprites().filter((s) => s.classList.contains("is-down")).length).toBe(before);
  });

  it("reads a stacked pile's full contents from a panel", () => {
    const { state } = session.getState();
    fireEvent.click(screen.getByRole("checkbox", { name: "Debug" }));

    fireEvent.click(screen.getByRole("button", { name: /Read every card in Floor deck/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain(`${String(state.floorDeck.length)} card`);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has no pile-reading affordance while debug is off", () => {
    expect(screen.queryByRole("button", { name: /Read every card in/ })).toBeNull();
  });
});

describe("the playtester's notes", () => {
  const log = () => document.querySelector(".log__lines") as HTMLElement;

  it("lands a typed note in the log, at the point it was typed", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const before = log().textContent ?? "";

    const field = screen.getByLabelText("Note");
    fireEvent.change(field, { target: { value: "that room should not repeat" } });
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));

    const lines = Array.from(log().querySelectorAll("li"));
    const note = lines[lines.length - 1];
    expect(note?.textContent).toBe("Note — that room should not repeat");
    expect(note?.className).toContain("log__line--note");
    // The note is added to the log, not instead of it.
    expect(log().textContent).toContain(before);
    expect(session.getState().notes).toEqual([
      { at: session.getState().events.length, text: "that room should not repeat" },
    ]);
  });

  it("empties the field once the note is in, and refuses an empty one", () => {
    const field = screen.getByLabelText("Note") as HTMLInputElement;
    expect(screen.getByRole("button", { name: "Add note" }).hasAttribute("disabled")).toBe(true);

    fireEvent.change(field, { target: { value: "  " } });
    expect(screen.getByRole("button", { name: "Add note" }).hasAttribute("disabled")).toBe(true);

    fireEvent.change(field, { target: { value: "a thought" } });
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));
    expect(field.value).toBe("");
    expect(session.getState().notes).toHaveLength(1);
  });

  it("offers the run in all three formats", () => {
    for (const name of [".txt", ".csv", ".json"]) {
      expect(screen.getByRole("button", { name })).toBeDefined();
    }
  });
});
