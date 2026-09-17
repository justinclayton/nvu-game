/* Which set of table dimensions is in force: compact, full, or wide. Follows
 * the viewport as it resizes or turns. */

import { useEffect, useState } from "react";

import { COMPACT, COMPACT_QUERY, FULL, WIDE, WIDE_QUERY, type Metrics } from "./metrics";

const matchesQuery = (query: string): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(query).matches;

export function useMetrics(): Metrics {
  const [compact, setCompact] = useState(() => matchesQuery(COMPACT_QUERY));
  const [wide, setWide] = useState(() => matchesQuery(WIDE_QUERY));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const compactQuery = window.matchMedia(COMPACT_QUERY);
    const wideQuery = window.matchMedia(WIDE_QUERY);
    const updateCompact = () => {
      setCompact(compactQuery.matches);
    };
    const updateWide = () => {
      setWide(wideQuery.matches);
    };
    updateCompact();
    updateWide();
    compactQuery.addEventListener("change", updateCompact);
    wideQuery.addEventListener("change", updateWide);
    return () => {
      compactQuery.removeEventListener("change", updateCompact);
      wideQuery.removeEventListener("change", updateWide);
    };
  }, []);

  if (compact) return COMPACT;
  if (wide) return WIDE;
  return FULL;
}
