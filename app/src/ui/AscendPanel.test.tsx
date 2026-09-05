// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { card, pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { AscendPanel, NO_CHOICES, type AscendChoices } from "./AscendPanel";
import { Mat } from "./Mat";

/* The ascension panel offers both halves of the Scrap tax; the reward is chosen
 * from the three cards floating above the mat. Both read one choice, which the
 * table owns, so the test stands in for the table. */

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

function Harness({
  state,
  dispatch,
}: {
  readonly state: GameState;
  readonly dispatch: (command: Command) => void;
}) {
  const [choices, setChoices] = useState<AscendChoices>(NO_CHOICES);
  const choose = (c: Character, patch: Partial<AscendChoice>) => {
    setChoices((current) => ({ ...current, [c]: { ...current[c], ...patch } }));
  };
  return (
    <>
      <Mat
        state={state}
        delays={new Map()}
        paying={null}
        onPickCard={vi.fn()}
        onDraw={vi.fn()}
        reward={{ Red: choices.Red.takeRewardId, Gray: choices.Gray.takeRewardId }}
        onPickReward={(c, picked) => {
          choose(c, { takeRewardId: choices[c].takeRewardId === picked.id ? null : picked.id });
        }}
        onInspect={vi.fn()}
      />
      <AscendPanel state={state} dispatch={dispatch} choices={choices} onChoose={choose} />
    </>
  );
}

beforeEach(resetRig);

/** The panel, as opposed to the mat: the same card names appear on both. */
function panel() {
  const el = document.querySelector(".ascend");
  if (!(el instanceof HTMLElement)) throw new Error("no ascend panel");
  return within(el);
}

describe("the ascension panel", () => {
  it("floats three cards above each character's side of the mat", () => {
    const state = atAscension();
    render(<Harness state={state} dispatch={vi.fn()} />);
    for (const c of ["Red", "Gray"] as const) {
      const floating = Array.from(
        document.querySelectorAll(`[data-zone="${c.toLowerCase()}-offer"]`),
      );
      expect(floating).toHaveLength(3);
      for (const offered of state.offer?.[c] ?? []) {
        expect(floating.some((el) => el.textContent?.includes(offered.name))).toBe(true);
      }
    }
    // The offered cards are off the pool while they float, and the rest are still in it.
    const inPool = document.querySelectorAll('[data-zone="red-rewards"]');
    expect(inPool).toHaveLength(state.pools.Red.length - 3);
    expect(screen.getByRole("button", { name: "Ascend to floor 2" })).toBeDefined();
  });

  it("asks for the other half of the Scrap tax only once a piece of Stuff is picked", () => {
    const state = atAscension();
    render(<Harness state={state} dispatch={vi.fn()} />);
    expect(screen.queryByText(/by Scrapping this card in its place/)).toBeNull();
    fireEvent.click(panel().getAllByText("Pry Bar")[0] as HTMLElement);
    expect(screen.getByText(/by Scrapping this card in its place/)).toBeDefined();
  });

  it("takes a floating card on click, and declines it on a second click", () => {
    const state = atAscension();
    render(<Harness state={state} dispatch={vi.fn()} />);
    const reward = state.offer?.Red[0];
    if (!reward) throw new Error("rig");
    const floating = document.querySelector('[data-zone="red-offer"]');
    if (!(floating instanceof HTMLElement)) throw new Error("no floating card");
    expect(screen.getByText(/Declining\. Click one of the cards floating above Red/)).toBeDefined();
    fireEvent.click(floating);
    expect(floating.classList.contains("is-selected")).toBe(true);
    expect(screen.getByText(/^Taking/).textContent).toContain(reward.name);
    fireEvent.click(floating);
    expect(floating.classList.contains("is-selected")).toBe(false);
  });

  it("sends the whole choice as one command", () => {
    const state = atAscension();
    const dispatch = vi.fn();
    render(<Harness state={state} dispatch={dispatch} />);
    const pryBar = state.Red.exhaust.find((c) => c.name === "Pry Bar");
    const payer = state.Red.exhaust.find((c) => c.name === "Charge In");
    const reward = state.offer?.Red[0];
    if (!pryBar || !payer || !reward) throw new Error("rig");

    fireEvent.click(panel().getAllByText("Pry Bar")[0] as HTMLElement);
    fireEvent.click(panel().getAllByText("Charge In")[0] as HTMLElement);
    fireEvent.click(document.querySelector('[data-zone="red-offer"]') as HTMLElement);
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
