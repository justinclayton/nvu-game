/* Stepping through a recorded run. Takes the place of the controls while the
 * script has commands left: nothing on the table is clickable until the person
 * takes over, so a replay cannot be forked by accident. */

import { useStore } from "zustand";

import type { Replay, ReplayState } from "@application/replay";

interface Props {
  readonly replay: Replay;
}

/** The scripted command at the cursor, as a short label. */
function describe(state: ReplayState): string {
  const next = state.script[state.cursor];
  if (!next) return "End of the recording.";
  switch (next.type) {
    case "PLAY_CARD":
      return `Next: ${next.character} plays ${next.cardId.replace(/#\d+$/, "")}${
        next.payWith.length > 0 ? `, paying ${String(next.payWith.length)}` : ""
      }`;
    case "FLIP_ROOM":
      return "Next: flip the room";
    case "END_PLAY":
      return "Next: check the room";
    case "ASCEND":
      return "Next: ascend";
    default:
      return `Next: ${next.type.toLowerCase().replaceAll("_", " ")}`;
  }
}

export function ReplayBar({ replay }: Props) {
  const cursor = useStore(replay, (r) => r.cursor);
  const total = useStore(replay, (r) => r.script.length);
  const seed = useStore(replay, (r) => r.seed);
  const next = useStore(replay, describe);
  const atEnd = cursor >= total;

  return (
    <div className="controls replay" role="group" aria-label="Replay">
      <span className="replay__where">
        Replaying seed {seed}: {cursor} / {total}
      </span>
      <input
        className="replay__scrub"
        type="range"
        min={0}
        max={total}
        value={cursor}
        aria-label="Position in the recording"
        onChange={(e) => {
          replay.getState().seek(Number(e.target.value));
        }}
      />
      <button
        type="button"
        className="button"
        disabled={cursor === 0}
        onClick={() => {
          replay.getState().stepBack();
        }}
      >
        ◀ Back
      </button>
      <button
        type="button"
        className="button button--primary"
        disabled={atEnd}
        title={next}
        onClick={() => {
          replay.getState().stepForward();
        }}
      >
        Step ▶
      </button>
      <button
        type="button"
        className="button"
        disabled={atEnd}
        title="Through to the next turn's flip"
        onClick={() => {
          replay.getState().nextTurn();
        }}
      >
        Turn ▶▶
      </button>
      <button
        type="button"
        className="button"
        disabled={atEnd}
        onClick={() => {
          replay.getState().seek(total);
        }}
      >
        End ⏭
      </button>
      <button
        type="button"
        className="button"
        title="Drop the rest of the recording and play on from here."
        onClick={() => {
          replay.getState().takeOver();
        }}
      >
        Take over
      </button>
      <span className="replay__next">{next}</span>
    </div>
  );
}
