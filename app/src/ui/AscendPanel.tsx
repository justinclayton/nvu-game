/* Rulebook, Ascending: shuffle the hand into the deck, then the card reward,
 * decided for both characters at once.
 *
 * The three cards each character is offered float above the mat and are
 * chosen by clicking them there; this panel shows the whole choice before it
 * is sent. The offer comes from the state; whether the whole choice is legal
 * is `validate`'s answer, not this component's. The table owns the choice,
 * so the floating cards and the panel are reading the same one. */

import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { isLegal, whyNot } from "./legal";

export const NO_CHOICE: AscendChoice = { takeRewardId: null };

export type AscendChoices = Readonly<Record<Character, AscendChoice>>;

export const NO_CHOICES: AscendChoices = { Red: NO_CHOICE, Gray: NO_CHOICE };

interface Props {
  readonly state: GameState;
  readonly dispatch: (command: Command) => void;
  readonly choices: AscendChoices;
  readonly onChoose: (character: Character, patch: Partial<AscendChoice>) => void;
}

export function AscendPanel({ state, dispatch, choices, onChoose }: Props) {
  const command: Command = { type: "ASCEND", Red: choices.Red, Gray: choices.Gray };

  return (
    <section className="ascend">
      <h2>The floor is clear. Up the stairs.</h2>
      <p className="ascend__note">
        Your hand shuffles into your deck. Each of you is offered three cards from your own
        reward pool: they are floating above your side of the table. Take one into your discard pile, or take none.
      </p>

      {(["Red", "Gray"] as const).map((c) => (
        <CharacterAscend key={c} state={state} character={c} choice={choices[c]} onChoose={onChoose} />
      ))}

      <div className="controls">
        <button
          type="button"
          className="button button--primary"
          disabled={!isLegal(state, command)}
          onClick={() => {
            dispatch(command);
          }}
        >
          Ascend to floor {state.floor + 1}
        </button>
        <span className="controls__why">{whyNot(state, command)}</span>
      </div>
    </section>
  );
}

function CharacterAscend({
  state,
  character: c,
  choice,
  onChoose,
}: {
  readonly state: GameState;
  readonly character: Character;
  readonly choice: AscendChoice;
  readonly onChoose: (character: Character, patch: Partial<AscendChoice>) => void;
}) {
  const offered = state.offer?.[c] ?? [];
  const taking = offered.find((x) => x.id === choice.takeRewardId) ?? null;

  return (
    <div className="ascend__character">
      <h3>{c}</h3>

      <h4>Card reward — take one, or decline</h4>
      <p className="ascend__reward">
        {offered.length === 0 ? (
          <span className="zone__empty">The reward pool is empty.</span>
        ) : taking ? (
          <>
            Taking <b>{taking.name}</b>.{" "}
            <button
              type="button"
              className="button button--small"
              onClick={() => {
                onChoose(c, { takeRewardId: null });
              }}
            >
              Decline instead
            </button>
          </>
        ) : (
          <span className="ascend__declining">
            Declining. Click one of the cards floating above {c}&rsquo;s side to take it.
          </span>
        )}
      </p>
    </div>
  );
}
