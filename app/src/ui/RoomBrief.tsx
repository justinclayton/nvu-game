/* The room, at reading size. A room card on the mat is card-sized, and its
 * threshold lines are what the whole turn is played against, so the brief
 * beside it prints them large, with what the pool has against each one.
 * Whether a line is met is the domain's answer. */

import { statPool, thresholdIsMet, thresholdTarget } from "@domain/queries";
import type { GameState } from "@domain/types";

const PHASE_BLURB: Record<GameState["phase"], string> = {
  "Turn Start": "Turn the top card of the floor deck face up, then both of you draw to 5.",
  Play: "Play into your own side. Nothing resolves until you both stop.",
  Outcome: "Checking the room against what you played.",
  Cleanup: "Discarding the play zone and settling what's left of the turn.",
  Ascend: "The Enemy is dead. Pack up the floor.",
  GameOver: "The run is over.",
};

const KIND_LABEL: Record<NonNullable<GameState["activeRoom"]>["kind"], string> = {
  enemy: "Enemy",
  hazard: "Hazard",
  stuff: "Stuff",
};

export function RoomBrief({ state }: { readonly state: GameState }) {
  const room = state.activeRoom;
  const pool = statPool(state);

  return (
    <div className={room ? `brief brief--${room.kind}` : "brief brief--empty"}>
      {room ? (
        <>
          <div className="brief__head">
            <span className="brief__kind">{KIND_LABEL[room.kind]}</span>
            <h2 className="brief__name">{room.name}</h2>
            <span
              className="brief__pool"
              title="The stat pool: every card in the play zone, added up"
            >
              <b>{pool.oomph}</b> Oomph · <b>{pool.scramble}</b> Scramble
            </span>
          </div>
          <ul className="brief__lines">
            {room.thresholds.map((t, i) => {
              const met = thresholdIsMet(state, t);
              const target = thresholdTarget(state, t);
              const have = t.stat === "Oomph" ? pool.oomph : pool.scramble;
              return (
                <li key={i} className={met ? "bline is-met" : "bline"}>
                  <span className="bline__need">
                    {t.stat} {target}
                  </span>
                  <span className="bline__outcome">{t.outcome}</span>
                  <span className="bline__have">
                    {have}/{target}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="brief__flee">
            <b>Flee</b> {room.flee.text}
          </p>
        </>
      ) : (
        <>
          <span className="brief__kind">{state.phase}</span>
          <p className="brief__blurb">{PHASE_BLURB[state.phase]}</p>
          <span className="brief__pool">
            <b>{pool.oomph}</b> Oomph · <b>{pool.scramble}</b> Scramble
          </span>
        </>
      )}
    </div>
  );
}
