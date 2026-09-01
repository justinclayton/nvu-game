// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { Command, GameState } from "@domain/types";
import { AscendPanel } from "./AscendPanel";

/* The ascension panel offers both halves of the Scrap tax and the reward, and
 * leaves whether the whole choice is legal to `validate`. */

function atAscension(): GameState {
  const base = rig({
    phase: "Ascend",
    floor: 1,
    cleared: [room("Gross Thing That Looks Like A Cherry")],
    Red: player({ deck: pile("Shove", 2), exhaust: [...pile("Charge In", 2), card("Pry Bar")] }),
    Gray: player({ deck: pile("Duck Under", 2), exhaust: pile("Pick The Lock", 2) }),
  });
  return {
    ...base,
    offer: { Red: base.pools.Red.slice(0, 3), Gray: base.pools.Gray.slice(0, 3) },
  };
}

beforeEach(resetRig);

describe("the ascension panel", () => {
  it("offers three cards to each character", () => {
    const state = atAscension();
    render(<AscendPanel state={state} dispatch={vi.fn()} />);
    for (const c of state.offer?.Red ?? []) {
      expect(screen.getAllByText(c.name).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole("button", { name: "Ascend to floor 2" })).toBeDefined();
  });

  it("asks for the other half of the Scrap tax only once a piece of Stuff is picked", () => {
    const state = atAscension();
    render(<AscendPanel state={state} dispatch={vi.fn()} />);
    expect(screen.queryByText(/by Scrapping this card in its place/)).toBeNull();
    fireEvent.click(screen.getAllByText("Pry Bar")[0] as HTMLElement);
    expect(screen.getByText(/by Scrapping this card in its place/)).toBeDefined();
  });

  it("sends the whole choice as one command", () => {
    const state = atAscension();
    const dispatch = vi.fn();
    render(<AscendPanel state={state} dispatch={dispatch} />);
    const pryBar = state.Red.exhaust.find((c) => c.name === "Pry Bar");
    const payer = state.Red.exhaust.find((c) => c.name === "Charge In");
    const reward = state.offer?.Red[0];
    if (!pryBar || !payer || !reward) throw new Error("rig");

    fireEvent.click(screen.getAllByText("Pry Bar")[0] as HTMLElement);
    fireEvent.click(screen.getAllByText("Charge In")[0] as HTMLElement);
    fireEvent.click(screen.getAllByText(reward.name)[0] as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "Ascend to floor 2" }));

    const sent = dispatch.mock.calls[0]?.[0] as Command | undefined;
    expect(sent?.type).toBe("ASCEND");
    if (sent?.type !== "ASCEND") throw new Error("expected an ascend");
    expect(sent.Red.keepStuffId).toBe(pryBar.id);
    expect(sent.Red.scrapId).toBe(payer.id);
    expect(sent.Red.takeRewardId).toBe(reward.id);
    expect(sent.Gray.keepStuffId).toBeNull();
  });
});
