/* Which set of table dimensions is in force: the full table, or the compact one
 * for a viewport too narrow for it. Follows the viewport as it resizes or turns. */

import { useEffect, useState } from "react";

import { COMPACT, COMPACT_QUERY, FULL, type Metrics } from "./metrics";

const matches = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(COMPACT_QUERY).matches;

export function useMetrics(): Metrics {
  const [compact, setCompact] = useState(matches);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(COMPACT_QUERY);
    const update = () => {
      setCompact(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return compact ? COMPACT : FULL;
}
