/* Every card on the table, drawn once and keyed by id.
 *
 * The layer sits over the mat. Each sprite is positioned by a transform worked
 * out from its placement and the slot it belongs to, and CSS transitions the
 * transform, so a card whose zone changes slides from where it was to where it
 * is. A face-down card turns over on the way. React never re-parents a sprite,
 * which is what keeps the same DOM node travelling.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { costOf, handsShared, playableCards } from "@domain/queries";
import type { Card, Character, GameState } from "@domain/types";
import { CardBack, CardFace, RoomFace, toneOf } from "./CardFace";
import { inspectHandlers, isInspected, useTouchInspect, type Inspected } from "./Inspector";
import { FLOAT_SCALE, STACK_STEP_MAX, STACK_STEP_X, STACK_STEP_Y, type Metrics } from "./metrics";
import { LOOSE_ZONES, canChooseOffer, ZONE_SHAPE, placements, type Placement, type ZoneId } from "./placements";
import type { Rect, SlotRects } from "./useSlotRects";

export interface Paying {
  readonly character: Character;
  readonly cardId: Card["id"];
  readonly chosen: readonly Card["id"][];
}

interface Props {
  readonly state: GameState;
  readonly metrics: Metrics;
  readonly rects: SlotRects;
  /** Per card id, how long to wait before travelling. From the last command's events. */
  readonly delays: ReadonlyMap<string, number>;
  readonly paying: Paying | null;
  readonly onPickCard: (character: Character, card: Card) => void;
  readonly onPickReward?: ((character: Character, card: Card) => void) | undefined;
  /** What is zoomed now. On touch, the second tap on it is the one that acts. */
  readonly inspected: Inspected | null;
  readonly onInspect: (item: Inspected | null) => void;
  /** Debug mode: every card and room comes back face up. View-only. */
  readonly debug?: boolean | undefined;
}

interface Pose {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rot: number;
  readonly scale: number;
}

/** A small, fixed lean for a card tossed onto a loose pile. Same card, same lean. */
function leanOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 9) - 4) * 1.1;
}

/** How far apart the cards in a row sit: a gap between them while they fit, closer once they don't. */
function rowSpacing(count: number, slot: Rect, m: Metrics): number {
  if (count <= 1) return 0;
  const usable = slot.w - 2 * m.slotPad;
  return Math.min(m.cardW + m.rowGap, (usable - m.cardW) / (count - 1));
}

/** The share of a card's width the next card in a row can cover before the cost circle,
 * printed at the top-right, can no longer be read. */
const COST_COVER_LIMIT = 0.2;

/** A card in a row with the next card laid over its cost. */
function isCostCovered(p: Placement, slot: Rect, m: Metrics): boolean {
  if (ZONE_SHAPE[p.zone] !== "row" || p.index === p.count - 1) return false;
  const covered = m.cardW - rowSpacing(p.count, slot, m);
  return covered > m.cardW * COST_COVER_LIMIT;
}

function poseOf(p: Placement, slot: Rect, m: Metrics): Pose {
  const { cardW: CARD_W, cardH: CARD_H, slotPad: SLOT_PAD, rowGap: ROW_GAP } = m;
  const shape = ZONE_SHAPE[p.zone];
  if (shape === "row") {
    const spacing = rowSpacing(p.count, slot, m);
    return {
      x: slot.x + SLOT_PAD + p.index * spacing,
      y: slot.y + SLOT_PAD,
      z: 20 + p.index,
      rot: 0,
      scale: 1,
    };
  }
  if (shape === "float") {
    // Held up off the table: larger, centred in the band, spread so they never
    // overlap. The scale is applied about the card's centre, so the card is
    // placed by where its centre should land.
    const w = CARD_W * FLOAT_SCALE;
    const gap = ROW_GAP * 2;
    const total = p.count * w + (p.count - 1) * gap;
    const cx = slot.x + (slot.w - total) / 2 + p.index * (w + gap) + w / 2;
    const cy = slot.y + slot.h / 2 - 6;
    return { x: cx - CARD_W / 2, y: cy - CARD_H / 2, z: 300 + p.index, rot: 0, scale: FLOAT_SCALE };
  }
  const step = Math.min(p.index, STACK_STEP_MAX);
  return {
    x: slot.x + SLOT_PAD + step * STACK_STEP_X,
    y: slot.y + SLOT_PAD + step * STACK_STEP_Y,
    z: 1 + p.index,
    rot: LOOSE_ZONES.has(p.zone) ? leanOf(p.id) : 0,
    scale: 1,
  };
}

const offerOf = (zone: ZoneId): Character | null =>
  zone === "red-offer" ? "Red" : zone === "gray-offer" ? "Gray" : null;

const handOf = (zone: ZoneId): Character | null =>
  zone === "red-hand" ? "Red" : zone === "gray-hand" ? "Gray" : null;

export function CardLayer({
  state,
  metrics,
  rects,
  delays,
  paying,
  onPickCard,
  onPickReward,
  inspected,
  onInspect,
  debug,
}: Props) {
  const touch = useTouchInspect();
  const placed = placements(state, debug ?? false);

  /* A card that just changed zone is lifted above everything while it travels,
   * then settles back into its pile's order. The previous zones are remembered
   * across renders; a re-render a moment later drops the lift. */
  const previousZones = useRef<Map<string, ZoneId>>(new Map());
  const [, settle] = useState(0);
  const moving = new Set<string>();
  for (const p of placed) {
    const before = previousZones.current.get(p.id);
    if (before !== undefined && before !== p.zone) moving.add(p.id);
  }
  useLayoutEffect(() => {
    previousZones.current = new Map(placed.map((p) => [p.id, p.zone]));
    if (moving.size === 0) return;
    const timer = setTimeout(() => {
      settle((n) => n + 1);
    }, 1400);
    return () => {
      clearTimeout(timer);
    };
  });

  /* The first paint places every card where it already is, with no travel. */
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    if (Object.keys(rects).length === 0) return;
    const frame = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [rects]);

  const playable: Record<Character, ReadonlySet<string>> = {
    Red: new Set(playableCards(state, "Red").map((c) => c.id)),
    Gray: new Set(playableCards(state, "Gray").map((c) => c.id)),
  };

  /* The payment in progress that this hand can pay into: its own, or the partner's while hands are shared. */
  const payingFrom = (c: Character) =>
    paying && (paying.character === c || handsShared(state)) ? paying : null;

  const canClick = (c: Character, card: Card): boolean => {
    if (state.pending || state.phase !== "Play" || state[c].down) return false;
    const payingHere = payingFrom(c);
    if (!payingHere) return playable[c].has(card.id);
    return card.id !== payingHere.cardId; // mid-payment, any other card is a way to pay
  };

  return (
    <div className={ready ? "layer" : "layer is-settling"}>
      {placed.map((p) => {
        const slot = rects[p.zone];
        if (!slot) return null;
        const pose = poseOf(p, slot, metrics);
        const isMoving = moving.has(p.id);
        const hand = p.kind === "card" ? handOf(p.zone) : null;
        const offer = p.kind === "card" ? offerOf(p.zone) : null;
        const payingHere = hand ? payingFrom(hand) : null;
        const selected = p.kind === "card" && payingHere?.cardId === p.id;
        const chosen = p.kind === "card" && (payingHere?.chosen.includes(p.card.id) ?? false);
        const clickable =
          p.kind === "card" &&
          ((hand !== null && canClick(hand, p.card)) ||
            (offer !== null && onPickReward !== undefined && canChooseOffer(state, offer)));
        const dimmed =
          p.kind === "card" && hand !== null && state.phase === "Play" && !state[hand].down
            ? payingHere
              ? chosen
              : !playable[hand].has(p.id)
            : false;

        const classes = [
          "sprite",
          p.kind === "card" ? toneOf(p.card) : toneOf(p.room),
          p.kind === "card" && p.card.rarity ? `rarity--${p.card.rarity.toLowerCase()}` : "",
          p.kind === "room" ? "sprite--room" : "",
          hand ? "sprite--hand" : "",
          offer ? "sprite--float" : "",
          p.faceUp ? "" : "is-down",
          isMoving ? "is-moving" : "",
          selected ? "is-selected" : "",
          chosen ? "is-chosen" : "",
          dimmed && !selected ? "is-dimmed" : "",
          clickable ? "is-clickable" : "",
          isCostCovered(p, slot, metrics) ? "is-cost-covered" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const style: CSSProperties & Record<`--${string}`, string> = {
          transform: `translate(${pose.x}px, ${pose.y}px)`,
          zIndex: (isMoving ? 200 : selected ? 150 : 0) + pose.z,
          transitionDelay: `${delays.get(p.id) ?? 0}ms`,
          "--lean": `${pose.rot}deg`,
          "--scale": String(pose.scale),
          "--bob-delay": `${String(p.index * 0.6)}s`,
        };

        const item: Inspected | null = p.faceUp
          ? p.kind === "card"
            ? { kind: "card", card: p.card, owner: p.owner }
            : { kind: "room", room: p.room }
          : null;
        const hover = item ? inspectHandlers(onInspect, item, touch) : {};

        const inner = (
          <div className="sprite__in">
            {p.faceUp ? (
              p.kind === "card" ? (
                <CardFace card={p.card} state={state} owner={p.owner} />
              ) : (
                <RoomFace room={p.room} state={state} />
              )
            ) : (
              <div className="face" />
            )}
            <CardBack kind={p.kind} />
            {chosen ? <span className="card__badge">paying</span> : null}
          </div>
        );

        if (clickable && p.kind === "card" && (hand || offer)) {
          const card = p.card;
          const title = offer
            ? `Take ${card.name}`
            : payingHere
              ? payingHere.cardId === card.id
                ? "Click again to cancel"
                : `Exhaust ${card.name} to pay`
              : `Play ${card.name} (costs ${String(costOf(state, hand ?? "Red", card))})`;
          return (
            <button
              key={p.id}
              type="button"
              className={classes}
              style={style}
              data-zone={p.zone}
              title={title}
              onClick={() => {
                /* Touch: the first tap reads the card, the second one plays it. */
                if (touch && item && !isInspected(inspected, item)) {
                  onInspect(item);
                  return;
                }
                if (offer) onPickReward?.(offer, card);
                else if (hand) onPickCard(hand, card);
              }}
              {...hover}
            >
              <span className="sprite__pose">{inner}</span>
            </button>
          );
        }

        return (
          <div
            key={p.id}
            className={classes}
            style={style}
            data-zone={p.zone}
            {...(item
              ? {
                  ...hover,
                  /* A row is all reachable; a pile only by its top card. */
                  tabIndex: ZONE_SHAPE[p.zone] === "row" || p.index === p.count - 1 ? 0 : undefined,
                  role: "group",
                  "aria-label": p.kind === "card" ? p.card.name : p.room.name,
                  onClick: touch
                    ? () => {
                        onInspect(item);
                      }
                    : undefined,
                }
              : {})}
          >
            <span className="sprite__pose">{inner}</span>
          </div>
        );
      })}
    </div>
  );
}
