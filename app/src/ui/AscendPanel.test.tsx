// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { pile, player, resetRig, rig, room } from "@domain/__fixtures__/rig";
import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { AscendPanel, NO_CHOICES, type AscendChoices } from "./AscendPanel";
import { Mat } from "./Mat";
import { FULL } from "./metrics";

/* The reward is chosen from the three cards floating above the mat, one
 * choice per character, sent together as one command. The table owns the
 * choice, so the test stands in for the table. */

function atAscension(): GameState {
  const base = rig({
    phase: "Ascend",
    floor: 1,
    cleared: [room("The Sentry Drone")],
    Red: player({ deck: pile("Shove", 2), discard: pile("Charge In", 2) }),
    Gray: player({ deck: pile("Duck Under", 2), discard: pile("Pick The Lock", 2) }),
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
        metrics={FULL}
        delays={new Map()}
        paying={null}
        onPickCard={vi.fn()}
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

  it("sends both characters' reward choices as one command", () => {
    const state = atAscension();
    const dispatch = vi.fn();
    render(<Harness state={state} dispatch={dispatch} />);
    const reward = state.offer?.Red[0];
    if (!reward) throw new Error("rig");

    fireEvent.click(document.querySelector('[data-zone="red-offer"]') as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "Ascend to floor 2" }));

    const sent = dispatch.mock.calls[0]?.[0] as Command | undefined;
    expect(sent?.type).toBe("ASCEND");
    if (sent?.type !== "ASCEND") throw new Error("expected an ascend");
    expect(sent.Red.takeRewardId).toBe(reward.id);
    expect(sent.Gray.takeRewardId).toBeNull();
  });
});
