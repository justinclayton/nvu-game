/* The bottom bar: whatever the game is waiting for right now.
 *
 * While `state.pending` is set it renders exactly that choice and its options
 * and nothing else — only the answering command is legal. Otherwise it offers
 * the phase's commands, each greyed unless `validate` says it would be legal.
 */

import { useEffect, useState } from "react";

import type { CardId, Command, GameState } from "@domain/types";
import { isLegal, whyNot } from "./legal";
import { CardView } from "./CardView";

interface Props {
  readonly state: GameState;
  readonly dispatch: (command: Command) => void;
  /** A payment in progress, described for the player. */
  readonly hint?: string | null | undefined;
}

export function Controls({ state, dispatch, hint }: Props) {
  if (state.pending) return <PendingChoice state={state} dispatch={dispatch} />;

  const buttons: readonly { label: string; command: Command }[] =
    state.phase === "Flip"
      ? [{ label: "Flip the next room", command: { type: "FLIP_ROOM" } }]
      : state.phase === "Play"
        ? [{ label: "Both of us are done — check the room", command: { type: "END_PLAY" } }]
        : [];

  return (
    <div className="controls">
      {buttons.map(({ label, command }) => (
        <button
          key={label}
          type="button"
          className="button button--primary"
          disabled={!isLegal(state, command)}
          title={whyNot(state, command) ?? ""}
          onClick={() => {
            dispatch(command);
          }}
        >
          {label}
        </button>
      ))}
      {hint ? (
        <span className="controls__hint">{hint}</span>
      ) : buttons.length > 0 ? (
        <span className="controls__why">
          {whyNot(state, buttons[0]?.command ?? { type: "END_PLAY" })}
        </span>
      ) : null}
    </div>
  );
}

function PendingChoice({ state, dispatch }: Props) {
  const pending = state.pending;
  if (!pending) return null;

  switch (pending.kind) {
    case "ChooseCharacter":
      return (
        <div className="controls controls--pending">
          <p className="controls__prompt">{pending.prompt}</p>
          {pending.options.map((c) => (
            <button
              key={c}
              type="button"
              className="button button--primary"
              onClick={() => {
                dispatch({ type: "CHOOSE_CHARACTER", character: c });
              }}
            >
              {c}
            </button>
          ))}
        </div>
      );

    case "TakeReward":
      return (
        <div className="controls controls--pending">
          <p className="controls__prompt">{pending.prompt}</p>
          <CardView card={pending.card} />
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              dispatch({ type: "TAKE_REWARD", take: true });
            }}
          >
            Take it
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              dispatch({ type: "TAKE_REWARD", take: false });
            }}
          >
            Skip it
          </button>
        </div>
      );

    case "OrderCards":
      return (
        <div className="controls controls--pending">
          <p className="controls__prompt">{pending.prompt}</p>
          <div className="zone">
            {pending.cards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              dispatch({ type: "ORDER_CARDS", cardIds: pending.cards.map((c) => c.id) });
            }}
          >
            Put them back in this order
          </button>
        </div>
      );

    case "ChooseCards":
      return <ChooseCards state={state} dispatch={dispatch} />;
  }
}

function ChooseCards({ state, dispatch }: Props) {
  const pending = state.pending;
  const [picked, setPicked] = useState<readonly CardId[]>([]);
  const prompt = pending?.kind === "ChooseCards" ? pending.prompt : "";
  useEffect(() => {
    setPicked([]);
  }, [prompt]);

  if (pending?.kind !== "ChooseCards") return null;
  const wanted = Math.min(pending.count, pending.options.length);

  const toggle = (id: CardId) => {
    setPicked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < wanted
          ? [...current, id]
          : current,
    );
  };

  return (
    <div className="controls controls--pending">
      <p className="controls__prompt">
        {pending.prompt} — {pending.character} chooses {wanted}
      </p>
      <div className="zone">
        {pending.options.map((card) => (
          <CardView
            key={card.id}
            card={card}
            selected={picked.includes(card.id)}
            onClick={() => {
              toggle(card.id);
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="button button--primary"
        disabled={picked.length !== wanted}
        onClick={() => {
          dispatch({ type: "CHOOSE_CARDS", cardIds: picked });
          setPicked([]);
        }}
      >
        Confirm
      </button>
      {pending.optional ? (
        <button
          type="button"
          className="button"
          onClick={() => {
            dispatch({ type: "CHOOSE_CARDS", cardIds: [] });
            setPicked([]);
          }}
        >
          None
        </button>
      ) : null}
    </div>
  );
}
