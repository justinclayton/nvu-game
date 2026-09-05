/* The mat: the printed layout every card sits on.
 *
 * Rulebook §3, drawn. The floor deck, its Fled and Cleared piles and the active
 * room across the top with the room's brief beside them; each character's deck,
 * side of the play zone and exhaust pile in the middle; their hands along the
 * near edge. The pools sit off to the right, as the rulebook keeps them off to
 * one side. Every slot here is an empty, measured box; the card layer draws the
 * cards over it.
 */

import { useRef, type CSSProperties } from "react";

import { canDraw } from "@domain/queries";
import type { Card, Character, GameState } from "@domain/types";
import { CardLayer, type Inspected, type Paying } from "./CardLayer";
import { CARD_H, CARD_W, SLOT_PAD } from "./metrics";
import type { ZoneId } from "./placements";
import { RoomBrief } from "./RoomBrief";
import { useSlotRects } from "./useSlotRects";

interface Props {
  readonly state: GameState;
  readonly delays: ReadonlyMap<string, number>;
  readonly paying: Paying | null;
  readonly onPickCard: (character: Character, card: Card) => void;
  readonly onDraw: (character: Character) => void;
  readonly onInspect: (item: Inspected | null) => void;
}

interface SlotProps {
  readonly id: ZoneId;
  readonly label: string;
  readonly count?: number | undefined;
  readonly row?: boolean | undefined;
  readonly tone?: "red" | "gray" | undefined;
}

function Slot({ id, label, count, row, tone }: SlotProps) {
  const classes = ["slot", row ? "slot--row" : "slot--stack", tone ? `slot--${tone}` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <span className="slot__label">{label}</span>
      {count !== undefined ? (
        <span className="slot__count" aria-label={`${label}: ${String(count)} cards`}>
          {count}
        </span>
      ) : null}
      <div className="well" data-slot={id} />
    </div>
  );
}

function statusOf(state: GameState, c: Character): string {
  const p = state[c];
  if (p.down) return "Down";
  if (p.lastStand) return "Last stand";
  return "Standing";
}

function HandSlot({
  state,
  character,
  onDraw,
}: {
  readonly state: GameState;
  readonly character: Character;
  readonly onDraw: () => void;
}) {
  const status = statusOf(state, character);
  const tone = character.toLowerCase();
  return (
    <section
      className={`slot slot--row slot--hand slot--${tone}`}
      aria-label={`${character}'s hand`}
    >
      <header className="slot__head">
        <h2 className="slot__title">{character}</h2>
        <span className={`status status--${status.replace(" ", "-").toLowerCase()}`}>{status}</span>
        <span className="slot__label slot__label--inline">
          hand · {state[character].hand.length}
        </span>
        {state.phase === "Draw" ? (
          <button
            type="button"
            className="button button--small"
            disabled={!canDraw(state, character)}
            onClick={onDraw}
          >
            Draw a card
          </button>
        ) : null}
      </header>
      <div className="well well--hand" data-slot={`${tone}-hand`} />
    </section>
  );
}

export function Mat({ state, delays, paying, onPickCard, onDraw, onInspect }: Props) {
  const matRef = useRef<HTMLDivElement>(null);
  const rects = useSlotRects(matRef, state);

  const vars: CSSProperties & Record<`--${string}`, string> = {
    "--cw": `${String(CARD_W)}px`,
    "--ch": `${String(CARD_H)}px`,
    "--pad": `${String(SLOT_PAD)}px`,
  };

  return (
    <div
      className="mat"
      ref={matRef}
      style={vars}
      onMouseLeave={() => {
        onInspect(null);
      }}
    >
      <div className="mat__main">
        <div className="mat-row mat-row--floor">
          <Slot id="floor" label="Floor deck" count={state.floorDeck.length} />
          <Slot id="fled" label="Fled" count={state.fled.length} />
          <Slot id="cleared" label="Cleared" count={state.cleared.length} />
          <Slot id="room" label="Active room" />
          <RoomBrief state={state} />
        </div>

        <div className="mat-row mat-row--table">
          <Slot id="red-deck" label="Red · deck" count={state.Red.deck.length} tone="red" />
          <Slot id="red-play" label="Red · play zone" row tone="red" />
          <Slot id="red-exhaust" label="Exhaust" count={state.Red.exhaust.length} tone="red" />
          <div className="mat__divider" />
          <Slot id="gray-exhaust" label="Exhaust" count={state.Gray.exhaust.length} tone="gray" />
          <Slot id="gray-play" label="Gray · play zone" row tone="gray" />
          <Slot id="gray-deck" label="Gray · deck" count={state.Gray.deck.length} tone="gray" />
        </div>

        <div className="mat-row mat-row--hands">
          <HandSlot
            state={state}
            character="Red"
            onDraw={() => {
              onDraw("Red");
            }}
          />
          <div className="mat__divider" />
          <HandSlot
            state={state}
            character="Gray"
            onDraw={() => {
              onDraw("Gray");
            }}
          />
        </div>
      </div>

      <aside className="mat__rail" aria-label="The pools at the side of the table">
        <Slot id="good" label="Good Stuff" count={state.pools.goodStuff.length} />
        <Slot id="bad" label="Bad Stuff" count={state.pools.badStuff.length} />
        <Slot id="red-rewards" label="Red rewards" count={state.pools.Red.length} tone="red" />
        <Slot id="gray-rewards" label="Gray rewards" count={state.pools.Gray.length} tone="gray" />
        <Slot id="scrap" label="Scrapyard" count={state.scrapyard.length} />
      </aside>

      <CardLayer
        state={state}
        rects={rects}
        delays={delays}
        paying={paying}
        onPickCard={onPickCard}
        onInspect={onInspect}
      />
    </div>
  );
}
