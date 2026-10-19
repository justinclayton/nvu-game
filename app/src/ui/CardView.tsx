/* A card standing on its own, outside the mat: in a pending choice, in the
 * ascension panel, or zoomed under the pointer. The card layer draws the ones
 * on the table. */

import type { Card, Character, GameState, Room } from "@domain/types";
import { CardFace, RoomFace, toneOf } from "./CardFace";
import { inspectHandlers, isInspected, useTouchInspect, type Inspected } from "./Inspector";

/** What a card needs to open the zoom: where to send it, and which one is open. */
interface Inspect {
  readonly onInspect: (item: Inspected | null) => void;
  /** The zoomed item, so a tap on a card that is already zoomed can act. */
  readonly inspected: Inspected | null;
}

interface Props {
  readonly card: Card;
  readonly state?: GameState | undefined;
  readonly owner?: Character | null | undefined;
  readonly selected?: boolean | undefined;
  readonly dimmed?: boolean | undefined;
  readonly onClick?: (() => void) | undefined;
  readonly badge?: string | undefined;
  readonly size?: "table" | "large" | undefined;
  /** Wires the card to the zoom: hover and focus, and on touch the first tap. */
  readonly inspect?: Inspect | undefined;
}

export function CardView({
  card,
  state,
  owner,
  selected,
  dimmed,
  onClick,
  badge,
  size,
  inspect,
}: Props) {
  const touch = useTouchInspect();
  const classes = [
    "card",
    toneOf(card),
    card.rarity ? `rarity--${card.rarity.toLowerCase()}` : "",
    size === "large" ? "card--large" : "",
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
    onClick ? "is-clickable" : "",
    inspect ? "is-inspectable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const item: Inspected = { kind: "card", card, owner: owner ?? null };
  const hover = inspect ? inspectHandlers(inspect.onInspect, item, touch) : {};

  const body = (
    <>
      <CardFace card={card} state={state} owner={owner} />
      {badge ? <span className="card__badge">{badge}</span> : null}
    </>
  );

  if (!onClick) {
    return (
      <div
        className={classes}
        {...(inspect
          ? {
              ...hover,
              tabIndex: 0,
              role: "group",
              "aria-label": card.name,
              onClick: touch
                ? () => {
                    inspect.onInspect(item);
                  }
                : undefined,
            }
          : {})}
      >
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      onClick={() => {
        /* Touch: the first tap reads the card, the second one acts on it. */
        if (touch && inspect && !isInspected(inspect.inspected, item)) {
          inspect.onInspect(item);
          return;
        }
        onClick();
      }}
      {...hover}
    >
      {body}
    </button>
  );
}

export function RoomCardView({
  room,
  state,
  size,
  inspect,
}: {
  readonly room: Room;
  readonly state?: GameState | undefined;
  readonly size?: "table" | "large" | undefined;
  readonly inspect?: Inspect | undefined;
}) {
  const touch = useTouchInspect();
  const item: Inspected = { kind: "room", room };
  const classes = [
    "card",
    "card--room",
    toneOf(room),
    size === "large" ? "card--large" : "",
    inspect ? "is-inspectable" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={classes}
      {...(inspect
        ? {
            ...inspectHandlers(inspect.onInspect, item, touch),
            tabIndex: 0,
            role: "group",
            "aria-label": room.name,
            onClick: touch
              ? () => {
                  inspect.onInspect(item);
                }
              : undefined,
          }
        : {})}
    >
      <RoomFace room={room} state={state} />
    </div>
  );
}
