/* PROTOTYPE — throwaway. The real table, live or replaying, with the one line
 * of chrome every variant needs above it when it is a replay. */

import { App } from "@ui/App";
import type { TableMode } from "./index";

interface Props {
  readonly table: TableMode;
  readonly openRun: (text: string) => void;
  readonly newRun: () => void;
  readonly backToLive: () => void;
}

export function TableHost({ table, openRun, newRun, backToLive }: Props) {
  if (table.kind === "replay") {
    return (
      <div className="op-table op-table--replay">
        <div className="op-replaybanner">
          <strong>Replay inspector</strong>
          <span>{table.label}</span>
          <button type="button" className="button button--small" onClick={backToLive}>
            Back to the live table
          </button>
        </div>
        <App
          key="replay"
          session={table.replay.getState().session}
          onNewRun={newRun}
          onOpenRun={openRun}
          replay={table.replay}
        />
      </div>
    );
  }
  return (
    <div className="op-table">
      <App
        key={`live-${String(table.seed)}`}
        session={table.session}
        onNewRun={newRun}
        onOpenRun={openRun}
      />
    </div>
  );
}
