// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(screen.queryByRole("button", { name: /finished drawing/ })).toBeNull();
  });

  it("names the room once it is flipped, and moves to the draw phase", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const room = session.getState().state.activeRoom;
    expect(room).not.toBeNull();
    expect(screen.getAllByText(room?.name ?? "").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Draw a card" })).toHaveLength(2);
  });

  it("will not let the draw phase end before both have drawn", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const end = screen.getByRole("button", { name: /finished drawing/ });
    expect(end.hasAttribute("disabled")).toBe(true);

    for (const button of screen.getAllByRole("button", { name: "Draw a card" })) {
      fireEvent.click(button);
    }
    expect(screen.getByRole("button", { name: /finished drawing/ }).hasAttribute("disabled")).toBe(
      false,
    );
  });

  it("puts a drawn card in that character's hand", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Draw a card" })[0] as HTMLElement);
    const drawn = session.getState().state.Red.hand[0];
    expect(drawn).toBeDefined();
    const redPanel = screen.getByRole("heading", { name: "Red" }).closest("section");
    expect(redPanel).not.toBeNull();
    if (redPanel && drawn) {
      expect(within(redPanel).getAllByText(drawn.name).length).toBeGreaterThan(0);
    }
  });

  it("shows the rejection when a command the rules refuse gets through", () => {
    // The button for this would be greyed; dispatching past it is how a bug
    // would reach the player, and the message is what they would see.
    act(() => {
      session.getState().dispatch({ type: "END_PLAY" });
    });
    expect(screen.getByText(/Cannot end the play phase during the Flip phase/)).toBeDefined();
  });

  it("writes the log outside React", () => {
    fireEvent.click(screen.getByRole("button", { name: /Flip the next room/ }));
    const log = screen.getByLabelText("Log");
    expect(log.textContent).toContain("You are in:");
  });
});
