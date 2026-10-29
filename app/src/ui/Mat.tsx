/* The mat: the printed layout every card sits on.
 *
 * Rulebook, Setup, drawn. The floor deck, its Cleared pile and the active
 * room across the top with the room's brief beside them; each character's
 * deck, discard pile and Exhaust pile in the middle, with their side of the
 * play zone spanning the full width beneath — as wide as their hand, since
 * cards travel between the two; their hands along the near edge. The pools
 * sit off to the right, as the rulebook keeps them off to one side. Every
 * slot here is an empty, measured box; the card layer draws the cards over
 * it.
 *
 * On a phone the CSS rearranges these same elements rather than rendering a
 * second mat: held upright, Red's side and hand stack above Gray's; held
 * sideways, the brief takes a column beside the play zones and hands, and the
 * piles move under them. The card layer follows, since it only reads where
 * each `data-slot` ended up.
 */

import { useRef, type CSSProperties } from "react";

import { plural } from "@domain/plural";
import type { Card, Character, GameState, Room } from "@domain/types";
import { CardLayer, type Paying } from "./CardLayer";
import { Inspector, useTouchInspect, type Inspected } from "./Inspector";
import { COMPACT, type Metrics } from "./metrics";
import type { ZoneId } from "./placements";
import { RoomBrief } from "./RoomBrief";
import { useSlotRects } from "./useSlotRects";

interface Props {
  readonly state: GameState;
  readonly metrics: Metrics;
  readonly delays: ReadonlyMap<string, number>;
  readonly paying: Paying | null;
  /** What the payment in progress still needs, shown beside the paying hand. */
  readonly payingNeed?: string | null | undefined;
  readonly onPickCard: (character: Character, card: Card) => void;
  readonly onPickReward?: ((character: Character, card: Card) => void) | undefined;
  readonly onPickRoom?: ((room: Room) => void) | undefined;
  readonly inspected: Inspected | null;
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
        <span className="slot__count" aria-label={`${label}: ${plural(count, "card")}`}>
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
  need,
}: {
  readonly state: GameState;
  readonly character: Character;
  /** What this hand's payment in progress still needs, if it is the one paying. */
  readonly need?: string | null | undefined;
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
        {need ? (
          <span className="slot__pay" role="status">
            {need}
          </span>
        ) : null}
      </header>
      <div className="well well--hand" data-slot={`${tone}-hand`} />
      {/* The band over this character's side of the play zone, where the cards
          they are offered a card reward are held up for a look. Measured only. */}
      <div className="float" data-slot={`${tone}-offer`} aria-hidden="true" />
    </section>
  );
}

export function Mat({
  state,
  metrics,
  delays,
  paying,
  payingNeed,
  onPickCard,
  onPickReward,
  onPickRoom,
  inspected,
  onInspect,
  debug,
  onOpenPile,
}: Props) {
  const matRef = useRef<HTMLDivElement>(null);
  const touch = useTouchInspect();
  const rects = useSlotRects(matRef, state, metrics);
  // Only offered in debug mode, and only for piles that stack more than one
  // card deep — a row already shows everything, and the active room is a
  // single card that is already face up.
  const openPile = debug ? onOpenPile : undefined;
  // Rooms revealed at Turn Start are lifted off the floor deck while the players choose.
  const revealedCount = state.pending?.kind === "ChooseRoom" ? state.pending.options.length : 0;

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
          <div className="mat-floor__piles">
            <Slot
              id="floor"
              label="Floor deck"
              count={state.floorDeck.length - revealedCount}
              onOpenPile={openPile}
            />
            <Slot id="cleared" label="Cleared" count={state.cleared.length} onOpenPile={openPile} />
            <Slot id="room" label="Active room" />
          </div>
          <RoomBrief state={state} />
          {/* The band over the brief where the rooms revealed at Turn Start are
              held up to choose from. Measured only. */}
          <div className="float float--revealed" data-slot="revealed" aria-hidden="true" />
        </div>

        <div className="mat-row mat-row--table">
          <div className="mat-side mat-side--red">
            <div className="mat-side__piles">
              <Slot
                id="red-deck"
                label="Deck"
                count={state.Red.deck.length}
                tone="red"
                onOpenPile={openPile}
              />
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
            </div>
            <Slot id="red-play" label="Play zone" row tone="red" />
          </div>
          <div className="mat__divider" />
          <div className="mat-side mat-side--gray">
            <div className="mat-side__piles">
              <Slot
                id="gray-deck"
                label="Deck"
                count={state.Gray.deck.length}
                tone="gray"
                onOpenPile={openPile}
              />
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
            <Slot id="gray-play" label="Play zone" row tone="gray" />
          </div>
        </div>

        <div className="mat-row mat-row--hands">
          <HandSlot
            state={state}
            character="Red"
            need={paying?.character === "Red" ? payingNeed : null}
          />
          <div className="mat__divider" />
          <HandSlot
            state={state}
            character="Gray"
            need={paying?.character === "Gray" ? payingNeed : null}
          />
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
        onPickReward={onPickReward}
        onPickRoom={onPickRoom}
        inspected={inspected}
        onInspect={onInspect}
        debug={debug}
      />

      <Inspector
        inspected={inspected}
        state={state}
        overlay={metrics === COMPACT}
        touch={touch}
      />
    </div>
  );
}
