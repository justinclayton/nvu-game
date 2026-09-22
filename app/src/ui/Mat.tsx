/* The mat: the printed layout every card sits on.
 *
 * Rulebook, Setup, drawn. The floor deck, its Fled and Cleared piles and the active
 * room across the top with the room's brief beside them; each character's deck,
 * side of the play zone, discard pile and Exhaust pile in the middle; their
 * hands along the near edge. The pools sit off to the right, as the rulebook
 * keeps them off to one side. Every slot here is an empty, measured box; the
 * card layer draws the cards over it.
 */

import { useRef, type CSSProperties } from "react";

import type { Card, Character, GameState } from "@domain/types";
import { CardLayer, type Inspected, type Paying } from "./CardLayer";
import type { Metrics } from "./metrics";
import type { ZoneId } from "./placements";
import { RoomBrief } from "./RoomBrief";
import { useSlotRects } from "./useSlotRects";

interface Props {
  readonly state: GameState;
  readonly metrics: Metrics;
  readonly delays: ReadonlyMap<string, number>;
  readonly paying: Paying | null;
  readonly onPickCard: (character: Character, card: Card) => void;
  readonly reward?: Readonly<Record<Character, Card["id"] | null>> | undefined;
  readonly onPickReward?: ((character: Character, card: Card) => void) | undefined;
  readonly onInspect: (item: Inspected | null) => void;
  /** Debug mode: every pile is face up, and a stacked one can be opened for a full read. */
  readonly debug?: boolean | undefined;
  readonly onOpenPile?: ((zone: ZoneId) => void) | undefined;
}

interface SlotProps {
  readonly id: ZoneId;
  readonly label: string;
  readonly count?: number | undefined;
  readonly row?: boolean | undefined;
  readonly tone?: "red" | "gray" | undefined;
  readonly onOpenPile?: ((zone: ZoneId) => void) | undefined;
}

function Slot({ id, label, count, row, tone, onOpenPile }: SlotProps) {
  const classes = ["slot", row ? "slot--row" : "slot--stack", tone ? `slot--${tone}` : ""]
    .filter(Boolean)
    .join(" ");
  // Only a stack piles up in a way the table can't show all of at once; a row
  // already lays every card out where it can be read.
  const inspectable = !row && onOpenPile;
  return (
    <div className={classes}>
      <span className="slot__label">{label}</span>
      {count !== undefined ? (
        <span className="slot__count" aria-label={`${label}: ${String(count)} cards`}>
          {count}
        </span>
      ) : null}
      <div className="well" data-slot={id} />
      {inspectable ? (
        <button
          type="button"
          className="slot__inspect"
          aria-label={`Read every card in ${label}`}
          onClick={() => {
            onOpenPile(id);
          }}
        >
          Read pile
        </button>
      ) : null}
    </div>
  );
}

function statusOf(state: GameState, c: Character): string {
  return state[c].down ? "Down" : "Standing";
}

function HandSlot({
  state,
  character,
}: {
  readonly state: GameState;
  readonly character: Character;
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
      </header>
      <div className="well well--hand" data-slot={`${tone}-hand`} />
      {/* The band over this character's side of the play zone, where the cards
          they are offered on ascending are held up for a look. Measured only. */}
      <div className="float" data-slot={`${tone}-offer`} aria-hidden="true" />
    </section>
  );
}

export function Mat({
  state,
  metrics,
  delays,
  paying,
  onPickCard,
  reward,
  onPickReward,
  onInspect,
  debug,
  onOpenPile,
}: Props) {
  const matRef = useRef<HTMLDivElement>(null);
  const rects = useSlotRects(matRef, state, metrics);
  // Only offered in debug mode, and only for piles that stack more than one
  // card deep — a row already shows everything, and the active room is a
  // single card that is already face up.
  const openPile = debug ? onOpenPile : undefined;

  const vars: CSSProperties & Record<`--${string}`, string> = {
    "--cw": `${String(metrics.cardW)}px`,
    "--ch": `${String(metrics.cardH)}px`,
    "--pad": `${String(metrics.slotPad)}px`,
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
          <Slot id="floor" label="Floor deck" count={state.floorDeck.length} onOpenPile={openPile} />
          <Slot id="fled" label="Fled" count={state.fled.length} onOpenPile={openPile} />
          <Slot id="cleared" label="Cleared" count={state.cleared.length} onOpenPile={openPile} />
          <Slot id="room" label="Active room" />
          <RoomBrief state={state} />
        </div>

        <div className="mat-row mat-row--table">
          <Slot
            id="red-deck"
            label="Deck"
            count={state.Red.deck.length}
            tone="red"
            onOpenPile={openPile}
          />
          <Slot id="red-play" label="Play zone" row tone="red" />
          <Slot
            id="red-discard"
            label="Discard"
            count={state.Red.discard.length}
            tone="red"
            onOpenPile={openPile}
          />
          <Slot
            id="red-exhaust"
            label="Exhaust"
            count={state.Red.exhaust.length}
            tone="red"
            onOpenPile={openPile}
          />
          <div className="mat__divider" />
          <Slot
            id="gray-deck"
            label="Deck"
            count={state.Gray.deck.length}
            tone="gray"
            onOpenPile={openPile}
          />
          <Slot id="gray-play" label="Play zone" row tone="gray" />
          <Slot
            id="gray-discard"
            label="Discard"
            count={state.Gray.discard.length}
            tone="gray"
            onOpenPile={openPile}
          />
          <Slot
            id="gray-exhaust"
            label="Exhaust"
            count={state.Gray.exhaust.length}
            tone="gray"
            onOpenPile={openPile}
          />
        </div>

        <div className="mat-row mat-row--hands">
          <HandSlot state={state} character="Red" />
          <div className="mat__divider" />
          <HandSlot state={state} character="Gray" />
        </div>
      </div>

      <aside className="mat__rail" aria-label="The pools at the side of the table">
        <Slot id="good" label="Good Stuff" count={state.pools.goodStuff.length} onOpenPile={openPile} />
        <Slot id="bad" label="Bad Stuff" count={state.pools.badStuff.length} onOpenPile={openPile} />
        <Slot
          id="red-rewards"
          label="Red rewards"
          count={state.pools.Red.length}
          tone="red"
          onOpenPile={openPile}
        />
        <Slot
          id="gray-rewards"
          label="Gray rewards"
          count={state.pools.Gray.length}
          tone="gray"
          onOpenPile={openPile}
        />
        <Slot id="scrap" label="Scrapyard" count={state.scrapyard.length} onOpenPile={openPile} />
      </aside>

      <CardLayer
        state={state}
        metrics={metrics}
        rects={rects}
        delays={delays}
        paying={paying}
        onPickCard={onPickCard}
        reward={reward}
        onPickReward={onPickReward}
        onInspect={onInspect}
        debug={debug}
      />
    </div>
  );
}
