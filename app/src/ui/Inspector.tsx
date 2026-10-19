/* The zoomed copy of a card or room, and the wiring that opens it.
 *
 * Anything that shows a card can open the zoom: spread `inspectHandlers` onto
 * its element. A pointer opens it by hovering. On a touch screen there is no
 * hover, and a tap is also a click, so the tap is the caller's to handle: the
 * first tap on a card that is clickable zooms it, the second acts on it.
 *
 * Where it draws: on the full table, on the empty felt at the foot of the
 * pools rail. On the compact table, a centred overlay in the largest part of
 * the screen the hand it came from leaves clear.
 */

import {
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
} from "react";

import type { Card, Character, GameState, Room } from "@domain/types";
import { CardView, RoomCardView } from "./CardView";

export type Inspected =
  | { readonly kind: "card"; readonly card: Card; readonly owner: Character | null }
  | { readonly kind: "room"; readonly room: Room };

export const isInspected = (shown: Inspected | null, item: Inspected | null): boolean =>
  shown !== null &&
  item !== null &&
  (shown.kind === "card" && item.kind === "card"
    ? shown.card.id === item.card.id
    : shown.kind === "room" && item.kind === "room" && shown.room.id === item.room.id);

/** A screen that cannot hover: touch. Tapping is the only way to point at a card. */
export const TOUCH_QUERY = "(hover: none)";

const matchesTouch = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(TOUCH_QUERY).matches;

const subscribeTouch = (onChange: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const query = window.matchMedia(TOUCH_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
};

/** True when the zoom is opened by a tap rather than by hover. */
export function useTouchInspect(): boolean {
  return useSyncExternalStore(subscribeTouch, matchesTouch, () => false);
}

interface InspectHandlers {
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
  readonly onFocus: (e: FocusEvent<HTMLElement>) => void;
  readonly onBlur: () => void;
}

const focusFromKeyboard = (e: FocusEvent<HTMLElement>): boolean => {
  try {
    return e.currentTarget.matches(":focus-visible");
  } catch {
    return false;
  }
};

/** The events that open and close the zoom for `item`. Spread onto the element that shows it.
 *
 * Hover and focus preview it with a pointer. On touch a tap also focuses the
 * element and fires hover, which would zoom the card in the same gesture that
 * clicks it, so there only keyboard focus opens it; the tap is the caller's. */
export function inspectHandlers(
  onInspect: (item: Inspected | null) => void,
  item: Inspected,
  touch: boolean,
): InspectHandlers {
  const show = () => {
    onInspect(item);
  };
  const hide = () => {
    onInspect(null);
  };
  if (!touch) return { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide };
  return {
    onFocus: (e) => {
      if (focusFromKeyboard(e)) show();
    },
    onBlur: hide,
  };
}

const OVERLAY_MARGIN = 8;
const OVERLAY_HEIGHT = 210;
/** Least height worth showing when no clear region of the screen is any larger. */
const OVERLAY_MIN_HEIGHT = 110;
/** A card face is 5 wide to 7 tall. */
const CARD_RATIO = 5 / 7;

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Where the compact overlay goes, in viewport coordinates, and how tall the card is drawn.
 *
 * `avoid` is the source hand's slot, or null when there is nothing to keep
 * clear, which centres the card. Otherwise the card goes in the largest clear
 * region of the screen: above, below, or to either side of the slot. A hand
 * fills only its half of the row, so a card that cannot fit above or below it
 * still fits in the other half. `screen` is the area the overlay may use,
 * which stops above the dock. */
export function overlayBox(
  avoid: Box | null,
  screen: { readonly width: number; readonly height: number },
): { readonly top: number; readonly left: number; readonly height: number } {
  const m = OVERLAY_MARGIN;
  const whole: Box = { left: m, top: m, right: screen.width - m, bottom: screen.height - m };
  const regions: Box[] = avoid
    ? [
        { ...whole, bottom: avoid.top - m },
        { ...whole, top: avoid.bottom + m },
        { ...whole, left: avoid.right + m },
        { ...whole, right: avoid.left - m },
      ]
    : [whole];
  const fit = (r: Box) =>
    Math.min(OVERLAY_HEIGHT, r.bottom - r.top, (r.right - r.left) / CARD_RATIO);
  let best = regions[0] as Box;
  for (const r of regions) if (fit(r) > fit(best)) best = r;
  const height = Math.max(OVERLAY_MIN_HEIGHT, Math.floor(fit(best)));
  return {
    top: Math.round((best.top + best.bottom - height) / 2),
    left: Math.round((best.left + best.right) / 2),
    height,
  };
}

/** The slot of the hand `item` was zoomed from, if it is a card in a hand. */
function sourceHand(item: Inspected | null, state: GameState): HTMLElement | null {
  if (item?.kind !== "card" || item.owner === null) return null;
  const { card, owner } = item;
  if (!state[owner].hand.some((c) => c.id === card.id)) return null;
  return document.querySelector<HTMLElement>(`[data-slot="${owner.toLowerCase()}-hand"]`);
}

function useOverlayStyle(
  active: boolean,
  item: Inspected | null,
  state: GameState,
  clear: string | undefined,
): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);
  useLayoutEffect(() => {
    if (!active || !item) return;
    const measure = () => {
      /* The dock holds the bottom edge of the window; the overlay stays above it. */
      const dock = document.querySelector(".dock")?.getBoundingClientRect();
      const height = dock ? Math.min(window.innerHeight, dock.top) : window.innerHeight;
      const away = clear ? document.querySelector<HTMLElement>(clear) : sourceHand(item, state);
      const slot = away?.getBoundingClientRect() ?? null;
      const box = overlayBox(slot, { width: window.innerWidth, height });
      setStyle({
        top: box.top,
        left: box.left,
        "--inspect-h": `${String(box.height)}px`,
        "--inspect-w": `${String(Math.round(box.height * CARD_RATIO))}px`,
      } as CSSProperties);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [active, item, state, clear]);
  return active ? style : undefined;
}

interface Props {
  readonly inspected: Inspected | null;
  readonly state: GameState;
  /** The compact table: a centred overlay instead of a spot in the rail. */
  readonly overlay: boolean;
  /** Opened by tapping: the zoom takes taps itself, and a tap on it closes it (the table clears the zoom on any tap that is not on a card). */
  readonly touch: boolean;
  /** Overlay only: a selector for what to keep clear, instead of the hand the card came from. */
  readonly clear?: string | undefined;
}

export function Inspector({ inspected, state, overlay, touch, clear }: Props) {
  const style = useOverlayStyle(overlay, inspected, state, clear);
  if (!inspected) return null;
  const classes = [
    "inspector",
    overlay ? "inspector--overlay" : "",
    touch ? "inspector--tap" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style} aria-hidden="true">
      {inspected.kind === "card" ? (
        <CardView card={inspected.card} state={state} owner={inspected.owner} size="large" />
      ) : (
        <RoomCardView room={inspected.room} state={state} size="large" />
      )}
    </div>
  );
}
