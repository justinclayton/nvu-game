/* The printed face of a card, and its back.
 *
 * One face for every size the table shows: a sprite on the mat, the zoomed copy
 * under the pointer, a choice in a panel. Everything on it is sized in em, and
 * the `.card` around it sets the font size from its width, so the same markup
 * prints small and large.
 *
 * Rulebook §8 sets the order: name, type line, Cost in the corner, stats, text,
 * Hold, a rarity edge. There is no art on the digital card, so the art window is
 * a field of the type's colour, which is what tells a hand apart at a glance.
 */

import { costOf, thresholdIsMet, thresholdTarget } from "@domain/queries";
import type { Card, Character, GameState, Room } from "@domain/types";

const TYPE_LINE: Record<Card["kind"], string> = {
  player: "",
  good_stuff: "Good Stuff",
  bad_stuff: "Bad Stuff",
};

const ROOM_KIND: Record<Room["kind"], string> = {
  enemy: "Enemy room",
  hazard: "Hazard room",
  stuff: "Stuff room",
};

/** The class that colours a card: its type line, or for a room its kind. */
export function toneOf(item: Card | Room): string {
  if ("thresholds" in item) return `tone--${item.kind}`;
  if (item.kind === "player") return `tone--${(item.owner ?? "red").toLowerCase()}`;
  return item.kind === "good_stuff" ? "tone--good" : "tone--bad";
}

interface CardFaceProps {
  readonly card: Card;
  /** With a state and owner, the corner shows what the card costs right now. */
  readonly state?: GameState | undefined;
  readonly owner?: Character | null | undefined;
}

export function CardFace({ card, state, owner }: CardFaceProps) {
  const typeLine = TYPE_LINE[card.kind] || (card.owner ?? "");
  const cost = state && owner ? costOf(state, owner, card) : card.cost;
  return (
    <div className="face">
      <div className="face__head">
        <span className="name">{card.name}</span>
        <span className="cost" title="Cost">
          {cost}
        </span>
      </div>
      <div className="face__type">{typeLine}</div>
      <div className="face__art" aria-hidden="true" />
      <div className="face__stats">
        {card.conditionalStat ? <span className="stat stat--conditional">?</span> : null}
        {card.power > 0 ? (
          <span className="stat stat--power">
            <b>{card.power}</b>
            <i>Power</i>
          </span>
        ) : null}
        {card.scramble > 0 ? (
          <span className="stat stat--scramble">
            <b>{card.scramble}</b>
            <i>Scramble</i>
          </span>
        ) : null}
      </div>
      {card.text ? <p className="face__text">{card.text}</p> : null}
      <div className="face__foot">
        <span className="rarity">{card.rarity ?? ""}</span>
        {card.hold ? <span className="hold">Hold</span> : null}
      </div>
    </div>
  );
}

interface RoomFaceProps {
  readonly room: Room;
  /** With a state, lines the pool currently meets are ticked. */
  readonly state?: GameState | undefined;
}

export function RoomFace({ room, state }: RoomFaceProps) {
  return (
    <div className="face face--room">
      <div className="face__type">{ROOM_KIND[room.kind]}</div>
      <div className="name">{room.name}</div>
      <div className="face__art" aria-hidden="true" />
      <ul className="lines">
        {room.thresholds.map((t, i) => {
          const met = state ? thresholdIsMet(state, t) : false;
          const target = state ? thresholdTarget(state, t) : t.value;
          return (
            <li key={i} className={met ? "line is-met" : "line"}>
              <b>
                {t.stat} {target}
              </b>
              <span>{t.outcome}</span>
            </li>
          );
        })}
      </ul>
      <div className="flee">
        <b>Flee</b> {room.flee.text}
      </div>
    </div>
  );
}

export function CardBack({ kind }: { readonly kind: "card" | "room" }) {
  return <div className={`back back--${kind}`} aria-hidden="true" />;
}
