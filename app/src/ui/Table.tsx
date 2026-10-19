/* The table: both characters on one screen, the floor between them.
 *
 * The mat draws the state; this component owns the one piece of UI state the
 * rules do not — a payment in progress — and turns clicks into commands.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { Replay } from "@application/replay";
import { canUndo, type SessionState } from "@application/session";
import { plural } from "@domain/plural";
import { costOf, payOptions } from "@domain/queries";
import type { Card, Character, Command, GameState } from "@domain/types";
import { type Paying } from "./CardLayer";
import { Controls } from "./Controls";
import { EventLog } from "./EventLog";
import { useTouchInspect, type Inspected } from "./Inspector";
import { Mat } from "./Mat";
import { moveDelays, type ZoneId } from "./placements";
import { OpenRun } from "./OpenRun";
import { PilePanel } from "./PilePanel";
import { ReplayBar } from "./ReplayBar";
import { useMetrics } from "./useMetrics";
import { useSession, useSessionState } from "./useSession";
import { KIT_REVISION } from "./kit";

interface Props {
  readonly onNewRun: () => void;
  /** A run file's text, dropped or picked, to replay. */
  readonly onOpenRun: (text: string) => void;
  /** Set while a recording is being stepped through; the table is view-only until taken over. */
  readonly replay?: Replay | undefined;
}

export function Table({ onNewRun, onOpenRun, replay }: Props) {
  const session = useSession();
  const replaying = useStore(replay ?? NO_REPLAY, (r) => r !== null && !r.live);
  const state = useSessionState((s: SessionState) => s.state);
  const events = useSessionState((s: SessionState) => s.events);
  const rejection = useSessionState((s: SessionState) => s.lastRejection);
  const undoable = useSessionState(canUndo);
  const metrics = useMetrics();
  const touch = useTouchInspect();
  const [paying, setPaying] = useState<Paying | null>(null);
  const [inspected, setInspected] = useState<Inspected | null>(null);
  /* Debug mode: a playtester's view, not a rule. Off by default, and nothing
   * under `execute` ever reads it — it only changes what `placements()` hands
   * back to the card layer. */
  const [debug, setDebug] = useState(false);
  const [openPile, setOpenPile] = useState<ZoneId | null>(null);
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
      if (replaying) return;
      session.getState().dispatch(command);
      setPaying(null);
    },
    [session, replaying],
  );

  /* Picking a card in hand: a free card is played at once, and a card with a
   * cost starts a payment. The set of legal payments is `payOptions`. */
  const pickCard = useCallback(
    (character: Character, card: Card) => {
      if (replaying) return;
      const play = (by: Character, cardId: Card["id"], payWith: readonly Card["id"][]) => {
        session.getState().dispatch({ type: "PLAY_CARD", character: by, cardId, payWith });
        setPaying(null);
      };
      const legal =
        paying !== null && payOptions(state, paying.character, paying.cardId).some((c) => c.id === card.id);
      if (!paying || (paying.character !== character && !legal)) {
        if (costOf(state, character, card) === 0) {
          play(character, card.id, []);
        } else {
          setPaying({ character, cardId: card.id, chosen: [] });
        }
        return;
      }
      if (card.id === paying.cardId) {
        setPaying(null); // click it again to cancel
        return;
      }
      if (!legal) return;
      const chosen = paying.chosen.includes(card.id)
        ? paying.chosen.filter((id) => id !== card.id)
        : [...paying.chosen, card.id];
      const by = paying.character;
      if (chosen.length === costOf(state, by, cardById(state, by, paying.cardId))) {
        play(by, paying.cardId, chosen);
      } else {
        setPaying({ ...paying, chosen });
      }
    },
    [session, state, paying, replaying],
  );

  /* The zoomed card follows the pointer's hover; a card that moves out from
   * under the pointer fires no leave event, so a state change clears it, and
   * so does a pile panel opening or closing. */
  useEffect(() => {
    setInspected(null);
  }, [state, openPile]);

  /* What a payment in progress still needs, said where the player is looking:
   * next to the paying hand, and in the bar with the way out. */
  const payingNeed =
    paying && state[paying.character].hand.some((c) => c.id === paying.cardId)
      ? `choose ${plural(
          costOf(state, paying.character, cardById(state, paying.character, paying.cardId)) -
            paying.chosen.length,
          "more card",
        )} to discard`
      : null;
  const payingHint =
    paying && payingNeed
      ? `${paying.character}: ${payingNeed}, or click the card again to cancel.`
      : null;

  return (
    <div
      className={`table-page${replaying ? " table--replaying" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onClick={(e) => {
        /* Touch: a tap anywhere but on a card puts the zoom away. */
        if (
          touch &&
          !(e.target instanceof Element && e.target.closest(".sprite, .is-inspectable"))
        ) {
          setInspected(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) void file.text().then(onOpenRun);
      }}
    >
      <div className="table">
        <header className="table__head">
          <h1>North vs Up</h1>
          <div className="table__meta">
            <span>Floor {state.floor}</span>
            <span>Turn {state.turn}</span>
            <span className="table__phase">{state.phase}</span>
            {KIT_REVISION === undefined ? null : (
              <span className="table__kit" title="Kit revision: rules, card list, engine build.">
                {KIT_REVISION}
              </span>
            )}
          </div>
          <div className="table__actions">
            <label
              className="debug-toggle"
              title="Turn every pile face up, for inspecting the table."
            >
              <input
                type="checkbox"
                checked={debug}
                onChange={(e) => {
                  setDebug(e.target.checked);
                  if (!e.target.checked) setOpenPile(null);
                }}
              />
              Debug
            </label>
            <OpenRun onOpen={onOpenRun} />
            <button
              type="button"
              className="button"
              disabled={!undoable || replaying}
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
          metrics={metrics}
          delays={delays}
          paying={paying}
          payingNeed={payingNeed}
          onPickCard={pickCard}
          onPickReward={(_c, card) => {
            if (state.pending?.kind === "TakeReward") {
              dispatch({ type: "TAKE_REWARD", cardId: card.id });
            } else if (state.pending?.kind === "ChooseGoodStuff") {
              dispatch({ type: "CHOOSE_CARDS", cardIds: [card.id] });
            }
          }}
          inspected={openPile ? null : inspected}
          onInspect={setInspected}
          debug={debug}
          onOpenPile={setOpenPile}
        />

        <EventLog />
      </div>

      {/* Whatever the game is waiting for stays on screen at the bottom of the
          window while the mat scrolls beneath it. */}
      <div className="dock">
        <div className="dock__inner">
          {rejection ? <p className="rejection">{rejection.message}</p> : null}
          {replaying && replay ? (
            <ReplayBar replay={replay} />
          ) : state.phase === "GameOver" ? (
            <section className="over">
              <h2>{state.outcome === "Victory" ? "You reach the rooftop." : "You lose"}</h2>
              <button type="button" className="button button--primary" onClick={onNewRun}>
                Go again
              </button>
            </section>
          ) : (
            <Controls
              state={state}
              dispatch={dispatch}
              hint={payingHint}
              inspected={inspected}
              onInspect={setInspected}
            />
          )}
        </div>
      </div>

      {openPile ? (
        <PilePanel
          state={state}
          zone={openPile}
          inspected={inspected}
          onInspect={setInspected}
          onClose={() => {
            setOpenPile(null);
          }}
        />
      ) : null}
    </div>
  );
}

/** A store that says "no replay", so the hook above has something to subscribe to. */
const NO_REPLAY = createStore<null>()(() => null);

function cardById(state: GameState, character: Character, id: Card["id"]): Card {
  const found = state[character].hand.find((c) => c.id === id);
  if (!found) throw new Error("The card being paid for left the hand.");
  return found;
}
