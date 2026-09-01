/* One card, as printed (rulebook §8): name, type line, Cost, stats, text, Hold. */

import type { Card, Character, GameState } from "@domain/types";
import { costOf } from "@domain/queries";

const TYPE_LINE: Record<Card["kind"], string> = {
  player: "",
  good_stuff: "Good Stuff",
  bad_stuff: "Bad Stuff",
};

interface Props {
  readonly card: Card;
  /** When given, the corner shows what this card costs its owner right now. */
  readonly state?: GameState | undefined;
  readonly owner?: Character | undefined;
  readonly selected?: boolean | undefined;
  readonly dimmed?: boolean | undefined;
  readonly onClick?: (() => void) | undefined;
  readonly badge?: string | undefined;
}

export function CardView({ card, state, owner, selected, dimmed, onClick, badge }: Props) {
  const typeLine = TYPE_LINE[card.kind] || (card.owner ?? "");
  const cost = state && owner ? costOf(state, owner, card) : card.cost;
  const classes = [
    "card",
    `card--${card.kind}`,
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
    onClick ? "is-clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div className="card__top">
        <span className="card__name">{card.name}</span>
        <span className="card__cost" title="Cost">
          {cost}
        </span>
      </div>
      <div className="card__type">
        {typeLine}
        {card.rarity ? <span className="card__rarity"> · {card.rarity}</span> : null}
      </div>
      <div className="card__stats">
        {card.conditionalStat ? <span className="stat stat--conditional">?</span> : null}
        {card.power > 0 ? <span className="stat stat--power">Power {card.power}</span> : null}
        {card.scramble > 0 ? (
          <span className="stat stat--scramble">Scramble {card.scramble}</span>
        ) : null}
        {card.hold ? <span className="stat stat--hold">Hold</span> : null}
      </div>
      {card.text ? <p className="card__text">{card.text}</p> : null}
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
