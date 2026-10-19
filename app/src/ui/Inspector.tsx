/* The zoomed copy of a card or room, and the wiring that opens it.
 *
 * Anything that shows a card can open the zoom: spread `inspectHandlers` onto
 * its element. A pointer opens it by hovering. On a touch screen there is no
 * hover, and a tap is also a click, so the tap is the caller's to handle: the
 * first tap on a card that is clickable zooms it, the second acts on it.
 *
 * Where it draws: on the full table, on the empty felt at the foot of the
 * pools rail. On the compact table, a centred overlay in whichever band of
 * the screen the hands row leaves clear.
 */

import {
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type RefObject,
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
const OVERLAY_MIN_HEIGHT = 110;
/** A card face is 5 wide to 7 tall. */
const CARD_RATIO = 5 / 7;

/** Where the compact overlay goes: the larger band of the screen above or below `avoid`, centred in it.
 * `avoid` is the vertical extent of what must stay visible, in viewport coordinates, and
 * `viewportHeight` is the height of the screen the overlay may use (down to the dock). */
export function overlayBox(
  avoid: { readonly top: number; readonly bottom: number } | null,
  viewportHeight: number,
): { readonly top: number; readonly height: number } {
  const m = OVERLAY_MARGIN;
  const place = (from: number, to: number) => {
    const height = Math.min(OVERLAY_HEIGHT, Math.max(OVERLAY_MIN_HEIGHT, to - from));
    return { top: Math.round(from + (to - from - height) / 2), height };
  };
  if (!avoid || avoid.bottom <= 0 || avoid.top >= viewportHeight) return place(m, viewportHeight - m);
  const above = avoid.top - m;
  const below = viewportHeight - avoid.bottom - m;
  return above >= below ? place(m, avoid.top - m) : place(avoid.bottom + m, viewportHeight - m);
}

function useOverlayStyle(
  active: boolean,
  avoid: RefObject<HTMLElement | null>,
  item: Inspected | null,
): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);
  useLayoutEffect(() => {
    if (!active || !item) return;
    const measure = () => {
      /* The dock holds the bottom edge of the window; the overlay stays above it. */
      const dock = document.querySelector(".dock")?.getBoundingClientRect();
      const bottom = dock ? Math.min(window.innerHeight, dock.top) : window.innerHeight;
      const box = overlayBox(avoid.current?.getBoundingClientRect() ?? null, bottom);
      setStyle({
        top: box.top,
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
  }, [active, avoid, item]);
  return active ? style : undefined;
}

interface Props {
  readonly inspected: Inspected | null;
  readonly state: GameState;
  /** The compact table: a centred overlay instead of a spot in the rail. */
  readonly overlay: boolean;
  /** Opened by tapping: the zoom takes taps itself, and a tap on it closes it (the table clears the zoom on any tap that is not on a card). */
  readonly touch: boolean;
  /** The element the overlay keeps clear of: the hands row. */
  readonly avoid: RefObject<HTMLElement | null>;
}

export function Inspector({ inspected, state, overlay, touch, avoid }: Props) {
  const style = useOverlayStyle(overlay, avoid, inspected);
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
