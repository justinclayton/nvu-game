/* PROTOTYPE — throwaway. The one place, rough enough to react to (issue #245).
 *
 * Three variants of one screen, switchable with `?variant=A|B|C` and the pill
 * at the bottom, around a real live table and a real replay of a flagged run:
 *
 *   A  Workbench   a new app with four tabs; the table is one tab; status is the first screen
 *   B  Table first the existing table is the screen; status is a strip and the rest a drawer
 *   C  Board       everything on one screen at once; the table is a panel that expands
 *
 * Open under the dev server: /?prototype=one-place&variant=A
 */

import { useCallback, useMemo, useState } from "react";

import { openRunFile, type Replay } from "@application/replay";
import { createSession, type Session } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import type { FlaggedRun } from "./data";
import { Switcher, type VariantInfo } from "./Switcher";
import { VariantA } from "./VariantA";
import { VariantB } from "./VariantB";
import { VariantC } from "./VariantC";
import "./prototype.css";

export type TableMode =
  | { readonly kind: "live"; readonly session: Session; readonly seed: number }
  | { readonly kind: "replay"; readonly replay: Replay; readonly label: string };

export interface VariantProps {
  readonly table: TableMode;
  /** A flagged run from the data area opens in the replay inspector: the table, replaying. */
  readonly openFlagged: (run: FlaggedRun) => void;
  /** A run file's text, dropped or picked on the table. */
  readonly openRun: (text: string) => void;
  readonly newRun: () => void;
  readonly backToLive: () => void;
}

const VARIANTS: readonly VariantInfo[] = [
  { key: "A", name: "Workbench: a new app, the table one tab" },
  { key: "B", name: "Table first: the table hosts a strip and a drawer" },
  { key: "C", name: "Board: everything at once, the table a panel" },
];

const LIVE_SEED = 7;

function readVariant(): string {
  const v = new URLSearchParams(window.location.search).get("variant");
  return v && VARIANTS.some((x) => x.key === v) ? v : "A";
}

export function OnePlacePrototype() {
  const [variant, setVariantState] = useState(readVariant);
  const setVariant = useCallback((key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", key);
    window.history.replaceState(null, "", url);
    setVariantState(key);
  }, []);

  const [seed, setSeed] = useState(LIVE_SEED);
  const live = useMemo<TableMode>(
    () => ({ kind: "live", session: createSession(seed, CARD_CONTENT), seed }),
    [seed],
  );
  const [replaying, setReplaying] = useState<TableMode | null>(null);
  const table = replaying ?? live;

  const openText = useCallback((text: string, label: string) => {
    const opened = openRunFile(text, CARD_CONTENT);
    if (!opened.ok) {
      window.alert(opened.reason);
      return;
    }
    setReplaying({ kind: "replay", replay: opened.replay, label });
  }, []);

  const props: VariantProps = {
    table,
    openFlagged: (run) => {
      if (run.file) openText(JSON.stringify(run.file), `seed ${run.seed} · ${run.why}`);
    },
    openRun: (text) => openText(text, "a run file you opened"),
    newRun: () => {
      setReplaying(null);
      setSeed((s) => s + 1);
    },
    backToLive: () => setReplaying(null),
  };

  return (
    <>
      {variant === "A" ? <VariantA {...props} /> : null}
      {variant === "B" ? <VariantB {...props} /> : null}
      {variant === "C" ? <VariantC {...props} /> : null}
      <Switcher variants={VARIANTS} current={variant} onChange={setVariant} />
    </>
  );
}
