/* The table: both characters on one screen, the floor between them. */

import { useCallback, useState } from "react";

import { canUndo, type SessionState } from "@application/session";
import { costOf, payOptions, statPool } from "@domain/queries";
import type { Card, Command, GameState } from "@domain/types";
import { AscendPanel } from "./AscendPanel";
import { CharacterPanel, type Paying } from "./CharacterPanel";
import { Controls } from "./Controls";
import { EventLog } from "./EventLog";
import { RoomView } from "./RoomView";
import { useSession, useSessionState } from "./useSession";

const PHASE_BLURB: Record<GameState["phase"], string> = {
  Flip: "Turn the top card of the floor deck face up.",
  Draw: "Each standing character draws, at least one, until they say they are done.",
  Play: "Play into your own side. Nothing resolves until you both stop.",
  Ascend: "The Enemy is dead. Pack up the floor.",
  GameOver: "The run is over.",
};

export function Table({ onNewRun }: { readonly onNewRun: () => void }) {
  const session = useSession();
  const state = useSessionState((s: SessionState) => s.state);
  const rejection = useSessionState((s: SessionState) => s.lastRejection);
  const undoable = useSessionState(canUndo);
  const [paying, setPaying] = useState<Paying | null>(null);

  const dispatch = useCallback(
    (command: Command) => {
      session.getState().dispatch(command);
      setPaying(null);
    },
    [session],
  );

  /* Picking a card in hand: a free card is played at once, and a card with a
   * cost starts a payment. The set of legal payments is `payOptions`. */
  const pickCard = useCallback(
    (character: GameState["playZone"][number]["owner"], card: Card) => {
      setPaying((current) => {
        if (!current || current.character !== character) {
          const cost = costOf(state, character, card);
          if (cost === 0) {
            session.getState().dispatch({
              type: "PLAY_CARD",
              character,
              cardId: card.id,
              payWith: [],
            });
            return null;
          }
          return { character, cardId: card.id, chosen: [] };
        }
        if (card.id === current.cardId) return null; // click it again to cancel
        const legal = payOptions(state, character, current.cardId).some((c) => c.id === card.id);
        if (!legal) return current;
        const chosen = current.chosen.includes(card.id)
          ? current.chosen.filter((id) => id !== card.id)
          : [...current.chosen, card.id];
        const cost = costOf(state, character, cardById(state, character, current.cardId));
        if (chosen.length === cost) {
          session.getState().dispatch({
            type: "PLAY_CARD",
            character,
            cardId: current.cardId,
            payWith: chosen,
          });
          return null;
        }
        return { ...current, chosen };
      });
    },
    [session, state],
  );

  const pool = statPool(state);

  return (
    <div className="table">
      <header className="table__head">
        <h1>North vs Up</h1>
        <div className="table__meta">
          <span>Floor {state.floor}</span>
          <span>Turn {state.turn}</span>
          <span className="table__phase">{state.phase}</span>
        </div>
        <div className="table__actions">
          <button
            type="button"
            className="button"
            disabled={!undoable}
            title="Undo reaches back to the last thing that showed you a card."
            onClick={() => {
              session.getState().undo();
              setPaying(null);
            }}
          >
            Undo
          </button>
          <button type="button" className="button" onClick={onNewRun}>
            New run
          </button>
        </div>
      </header>

      <p className="table__blurb">{PHASE_BLURB[state.phase]}</p>

      <section className="floor">
        <dl className="piles piles--floor">
          <div>
            <dt>Floor deck</dt>
            <dd>{state.floorDeck.length}</dd>
          </div>
          <div>
            <dt>Fled</dt>
            <dd>{state.fled.length}</dd>
          </div>
          <div>
            <dt>Cleared</dt>
            <dd>{state.cleared.length}</dd>
          </div>
          <div>
            <dt>Scrapyard</dt>
            <dd>{state.scrapyard.length}</dd>
          </div>
          <div className="piles__pool">
            <dt>Stat pool</dt>
            <dd>
              Power {pool.power} · Scramble {pool.scramble}
            </dd>
          </div>
        </dl>
        {state.activeRoom ? (
          <RoomView state={state} room={state.activeRoom} />
        ) : (
          <p className="floor__empty">No room in the zone.</p>
        )}
      </section>

      {state.phase === "Ascend" ? (
        <AscendPanel state={state} dispatch={dispatch} />
      ) : state.phase === "GameOver" ? (
        <section className="over">
          <h2>{state.outcome === "Victory" ? "You reach the rooftop." : "Both of you are Down."}</h2>
          <button type="button" className="button button--primary" onClick={onNewRun}>
            Go again
          </button>
        </section>
      ) : (
        <>
          <div className="characters">
            {(["Red", "Gray"] as const).map((c) => (
              <CharacterPanel
                key={c}
                state={state}
                character={c}
                paying={paying}
                onPickCard={(card) => {
                  pickCard(c, card);
                }}
                onDraw={() => {
                  dispatch({ type: "DRAW", character: c });
                }}
              />
            ))}
          </div>
          <Controls state={state} dispatch={dispatch} />
        </>
      )}

      {rejection ? <p className="rejection">{rejection.message}</p> : null}
      <EventLog />
    </div>
  );
}

function cardById(
  state: GameState,
  character: GameState["playZone"][number]["owner"],
  id: Card["id"],
): Card {
  const found = state[character].hand.find((c) => c.id === id);
  if (!found) throw new Error("The card being paid for left the hand.");
  return found;
}
