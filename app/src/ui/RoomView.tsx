/* The active room: its threshold lines and its Flee line, with what the pool
 * currently meets marked. Whether a line is met is the domain's answer. */

import { statPool, thresholdIsMet, thresholdTarget } from "@domain/queries";
import type { GameState, Room } from "@domain/types";

const KIND_LABEL: Record<Room["kind"], string> = {
  enemy: "Enemy",
  hazard: "Hazard",
  stuff: "Stuff",
};

export function RoomView({ state, room }: { readonly state: GameState; readonly room: Room }) {
  return (
    <div className={`room room--${room.kind}`}>
      <div className="room__type">{KIND_LABEL[room.kind]}</div>
      <h2 className="room__name">{room.name}</h2>
      <ul className="room__lines">
        {room.thresholds.map((threshold, i) => {
          const met = thresholdIsMet(state, threshold);
          const target = thresholdTarget(state, threshold);
          const side = threshold.measuredOn;
          const pool = statPool(state, side ?? undefined);
          const have = threshold.stat === "Power" ? pool.power : pool.scramble;
          return (
            <li key={i} className={met ? "line is-met" : "line"}>
              <span className="line__threshold">
                {threshold.stat} {target}
              </span>
              <span className="line__outcome">{threshold.outcome}</span>
              <span className="line__have">
                {side ? `${side}'s side: ` : ""}
                {have}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="room__flee">
        <strong>Flee:</strong> {room.flee.text}
      </p>
    </div>
  );
}
