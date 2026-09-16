/* Where the mat's slots are, in pixels relative to the mat. The card layer
 * positions every sprite from these, so a slot is only ever an empty, measured
 * box; the cards are drawn over it. */

import { useLayoutEffect, useState, type RefObject } from "react";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export type SlotRects = Readonly<Record<string, Rect>>;

const same = (a: SlotRects, b: SlotRects): boolean => {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => {
    const x = a[k];
    const y = b[k];
    return x && y && x.x === y.x && x.y === y.y && x.w === y.w && x.h === y.h;
  });
};

/**
 * Measure every `[data-slot]` inside `ref`. Re-measures when the mat resizes
 * and whenever `key` or `metrics` changes — the table passes its state and the
 * table dimensions in force — so a slot that moved because the layout around
 * it changed is caught on the same frame.
 */
export function useSlotRects(
  ref: RefObject<HTMLElement | null>,
  key: unknown,
  metrics?: unknown,
): SlotRects {
  const [rects, setRects] = useState<SlotRects>({});

  useLayoutEffect(() => {
    const mat = ref.current;
    if (!mat) return;

    const measure = () => {
      const base = mat.getBoundingClientRect();
      const next: Record<string, Rect> = {};
      for (const slot of mat.querySelectorAll<HTMLElement>("[data-slot]")) {
        const r = slot.getBoundingClientRect();
        const id = slot.dataset["slot"];
        if (!id) continue;
        next[id] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
      }
      setRects((prev) => (same(prev, next) ? prev : next));
    };

    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());
    observer?.observe(mat);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, key, metrics]);

  return rects;
}
