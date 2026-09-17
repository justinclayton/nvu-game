/* Debug mode's answer to "what's really in that stack?"
 *
 * The table draws a pile as a stack of overlapping cards, so once debug mode
 * turns them all face up the top card reads fine but everything under it is
 * still hidden. This panel lists a pile's full contents instead — top card
 * first — independent of wherever the pile's slot sits on the mat, so it
 * keeps working however the table around it is laid out. */

import type { GameState } from "@domain/types";
import { CardView, RoomCardView } from "./CardView";
import { pileOf, type ZoneId } from "./placements";

const PILE_LABEL: Partial<Record<ZoneId, string>> = {
  floor: "Floor deck",
  fled: "Fled",
  cleared: "Cleared",
  "red-deck": "Red deck",
  "gray-deck": "Gray deck",
  "red-discard": "Red discard",
  "gray-discard": "Gray discard",
  good: "Good Stuff",
  bad: "Bad Stuff",
  "red-rewards": "Red rewards",
  "gray-rewards": "Gray rewards",
  scrap: "Scrapyard",
};

interface Props {
  readonly state: GameState;
  readonly zone: ZoneId;
  readonly onClose: () => void;
}

export function PilePanel({ state, zone, onClose }: Props) {
  const label = PILE_LABEL[zone] ?? zone;
  const items = pileOf(state, zone);

  return (
    <div className="pile-panel__backdrop" onClick={onClose}>
      <div
        className="pile-panel"
        role="dialog"
        aria-label={`${label}, full contents`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header className="pile-panel__head">
          <h2>{label}</h2>
          <span className="pile-panel__count">
            {items.length} card{items.length === 1 ? "" : "s"}
          </span>
          <button type="button" className="button button--small" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="pile-panel__list">
          {items.length === 0 ? (
            <p className="pile-panel__empty">Empty.</p>
          ) : (
            items.map((p, i) => (
              <div className="pile-panel__item" key={p.id}>
                <span className="pile-panel__pos">{i === 0 ? "Top" : `#${String(i + 1)}`}</span>
                {p.kind === "card" ? (
                  <CardView card={p.card} state={state} owner={p.owner} />
                ) : (
                  <RoomCardView room={p.room} state={state} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
