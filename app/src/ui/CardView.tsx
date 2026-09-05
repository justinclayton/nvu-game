/* A card standing on its own, outside the mat: in a pending choice, in the
 * ascension panel, or zoomed under the pointer. The card layer draws the ones
 * on the table. */

import type { Card, Character, GameState, Room } from "@domain/types";
import { CardFace, RoomFace, toneOf } from "./CardFace";

interface Props {
  readonly card: Card;
  readonly state?: GameState | undefined;
  readonly owner?: Character | null | undefined;
  readonly selected?: boolean | undefined;
  readonly dimmed?: boolean | undefined;
  readonly onClick?: (() => void) | undefined;
  readonly badge?: string | undefined;
  readonly size?: "table" | "large" | undefined;
}

export function CardView({ card, state, owner, selected, dimmed, onClick, badge, size }: Props) {
  const classes = [
    "card",
    toneOf(card),
    card.rarity ? `rarity--${card.rarity.toLowerCase()}` : "",
    size === "large" ? "card--large" : "",
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
    onClick ? "is-clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <CardFace card={card} state={state} owner={owner} />
      {badge ? <span className="card__badge">{badge}</span> : null}
    </>
  );

  if (!onClick) return <div className={classes}>{body}</div>;
  return (
    <button type="button" className={classes} onClick={onClick}>
      {body}
    </button>
  );
}

export function RoomCardView({
  room,
  state,
  size,
}: {
  readonly room: Room;
  readonly state?: GameState | undefined;
  readonly size?: "table" | "large" | undefined;
}) {
  return (
    <div className={`card card--room ${toneOf(room)} ${size === "large" ? "card--large" : ""}`}>
      <RoomFace room={room} state={state} />
    </div>
  );
}
