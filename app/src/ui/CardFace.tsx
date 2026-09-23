/* The printed face of a card, and its back.
 *
 * One face for every size the table shows: a sprite on the mat, the zoomed copy
 * under the pointer, a choice in a panel. Everything on it is sized in em, and
 * the `.card` around it sets the font size from its width, so the same markup
 * prints small and large.
 *
 * Rulebook, Card anatomy: Character cards sets the order: name, type line, Cost in the corner, stats, text,
 * a rarity edge. There is no art on the digital card, so the art window is
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
  room: "Room",
  stairwell: "Stairwell",
};

/** The class that colours a card: its type line, or for a room its kind. */
export function toneOf(item: Card | Room): string {
  if ("thresholds" in item) return `tone--${item.kind}`;
  if (item.kind === "player") return `tone--${(item.owner ?? "red").toLowerCase()}`;
  return item.kind === "good_stuff" ? "tone--good" : "tone--bad";
}

/**
 * How much room a card's printed text needs, in steps `table.css` shrinks the
 * art window and the text itself for — the longer the text, the less of the
 * face the art keeps. A card with no text isn't tiered at all, so untexted
 * cards (most of them) keep the full-size art window they have today.
 */
type TextTier = "s" | "m" | "l" | "xl";

function textTierOf(text: string): TextTier {
  if (text.length > 100) return "xl";
  if (text.length > 70) return "l";
  if (text.length > 40) return "m";
  return "s";
}

/** A name long enough to wrap past the two lines the head row is sized for. */
const LONG_NAME = 16;

/**
 * The same shrink steps as `textTierOf`, weighed for a room instead of a
 * card: each threshold line costs roughly as much height as its outcome text
 * does, whatever that outcome says, so a line is counted at a flat weight
 * plus its outcome's length rather than by length alone.
 */
function roomTextTierOf(room: Room): TextTier {
  const weight =
    room.thresholds.reduce((sum, t) => sum + 30 + t.outcome.length, 0) + room.flee.text.length;
  if (weight > 160) return "xl";
  if (weight > 110) return "l";
  if (weight > 70) return "m";
  return "s";
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
  const hasStats = card.conditionalStat || card.oomph > 0 || card.scramble > 0;
  const textTier = card.text ? textTierOf(card.text) : null;
  const longName = card.name.length > LONG_NAME;
  const faceClass = [
    "face",
    textTier ? `face--text-${textTier}` : "",
    longName ? "face--long-name" : "",
  ]
    .filter(Boolean)
    .join(" ");
  // Oomph and Scramble together are wider than one card is, at either
  // metrics tier — without shrinking, the second stat wraps to a line of its
  // own and eats the height the text needs.
  const twoStats = card.oomph > 0 && card.scramble > 0;
  const statsClass = twoStats ? "face__stats face__stats--pair" : "face__stats";
  return (
    <div className={faceClass}>
      <div className="face__head">
        <span className="name">{card.name}</span>
        <span className="cost" title="Cost">
          {cost}
        </span>
      </div>
      <div className="face__type">{typeLine}</div>
      <div className="face__art" aria-hidden="true" />
      {hasStats ? (
        <div className={statsClass}>
          {card.conditionalStat ? <span className="stat stat--conditional">?</span> : null}
          {card.oomph > 0 ? (
            <span className="stat stat--oomph">
              <b>{card.oomph}</b>
              <i>Oomph</i>
            </span>
          ) : null}
          {card.scramble > 0 ? (
            <span className="stat stat--scramble">
              <b>{card.scramble}</b>
              <i>Scramble</i>
            </span>
          ) : null}
        </div>
      ) : null}
      {card.text ? <p className="face__text">{card.text}</p> : null}
      <div className="face__foot">
        <span className="rarity">{card.rarity ?? ""}</span>
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
  const tier = roomTextTierOf(room);
  return (
    <div className={`face face--room face--text-${tier}`}>
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
