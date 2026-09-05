/* The table: both characters on one screen, the floor between them.
 *
 * The mat draws the state; this component owns the one piece of UI state the
 * rules do not — a payment in progress — and turns clicks into commands.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { canUndo, type SessionState } from "@application/session";
import { costOf, payOptions } from "@domain/queries";
import type { Card, Character, Command, GameState } from "@domain/types";
import { AscendPanel } from "./AscendPanel";
import { type Inspected, type Paying } from "./CardLayer";
import { CardView, RoomCardView } from "./CardView";
import { Controls } from "./Controls";
import { EventLog } from "./EventLog";
import { Mat } from "./Mat";
import { moveDelays } from "./placements";
import { useSession, useSessionState } from "./useSession";

export function Table({ onNewRun }: { readonly onNewRun: () => void }) {
  const session = useSession();
  const state = useSessionState((s: SessionState) => s.state);
  const events = useSessionState((s: SessionState) => s.events);
  const rejection = useSessionState((s: SessionState) => s.lastRejection);
  const undoable = useSessionState(canUndo);
  const [paying, setPaying] = useState<Paying | null>(null);
  const [inspected, setInspected] = useState<Inspected | null>(null);

  /* The events the last command produced, and only on the render that shows
   * them, so the cards it moved can leave one after another. */
  const seenEvents = useRef(events.length);
  const fresh = events.length > seenEvents.current ? events.slice(seenEvents.current) : [];
  useEffect(() => {
    seenEvents.current = events.length;
  }, [events]);
  const delays = moveDelays(fresh);

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
    (character: Character, card: Card) => {
      const play = (cardId: Card["id"], payWith: readonly Card["id"][]) => {
        session.getState().dispatch({ type: "PLAY_CARD", character, cardId, payWith });
        setPaying(null);
      };
      if (!paying || paying.character !== character) {
        if (costOf(state, character, card) === 0) {
          play(card.id, []);
        } else {
          setPaying({ character, cardId: card.id, chosen: [] });
        }
        return;
      }
      if (card.id === paying.cardId) {
        setPaying(null); // click it again to cancel
        return;
      }
      const legal = payOptions(state, character, paying.cardId).some((c) => c.id === card.id);
      if (!legal) return;
      const chosen = paying.chosen.includes(card.id)
        ? paying.chosen.filter((id) => id !== card.id)
        : [...paying.chosen, card.id];
      if (chosen.length === costOf(state, character, cardById(state, character, paying.cardId))) {
        play(paying.cardId, chosen);
      } else {
        setPaying({ ...paying, chosen });
      }
    },
    [session, state, paying],
  );

  /* The zoomed card follows the pointer's hover; a card that moves out from
   * under the pointer fires no leave event, so a state change clears it. */
  useEffect(() => {
    setInspected(null);
  }, [state]);

  const payingHint =
    paying && state[paying.character].hand.some((c) => c.id === paying.cardId)
      ? `${paying.character}: choose ${String(
          costOf(state, paying.character, cardById(state, paying.character, paying.cardId)) -
            paying.chosen.length,
        )} more card(s) to Exhaust, or click the card again to cancel.`
      : null;

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

      <Mat
        state={state}
        delays={delays}
        paying={paying}
        onPickCard={pickCard}
        onDraw={(c) => {
          dispatch({ type: "DRAW", character: c });
        }}
        onInspect={setInspected}
      />

      {state.phase === "Ascend" ? (
        <AscendPanel state={state} dispatch={dispatch} />
      ) : state.phase === "GameOver" ? (
        <section className="over">
          <h2>
            {state.outcome === "Victory" ? "You reach the rooftop." : "Both of you are Down."}
          </h2>
          <button type="button" className="button button--primary" onClick={onNewRun}>
            Go again
          </button>
        </section>
      ) : (
        <Controls state={state} dispatch={dispatch} hint={payingHint} />
      )}

      {rejection ? <p className="rejection">{rejection.message}</p> : null}
      <EventLog />

      {inspected ? (
        <div className="inspector" aria-hidden="true">
          {inspected.kind === "card" ? (
            <CardView card={inspected.card} state={state} owner={inspected.owner} size="large" />
          ) : (
            <RoomCardView room={inspected.room} state={state} size="large" />
          )}
        </div>
      ) : null}
    </div>
  );
}

function cardById(state: GameState, character: Character, id: Card["id"]): Card {
  const found = state[character].hand.find((c) => c.id === id);
  if (!found) throw new Error("The card being paid for left the hand.");
  return found;
}
