/* §10 Ascending: the Scrap tax and the card reward, both decided at once.
 *
 * The three cards each character is offered float above the mat, held up for a
 * look, and are chosen by clicking them there; this panel decides the Scrap tax
 * and shows the whole choice before it is sent. The offer and what may be kept
 * come from the state; whether the whole choice is legal is `validate`'s
 * answer, not this component's. The table owns the choice, so the floating
 * cards and the panel are reading the same one. */

import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { CardView } from "./CardView";
import { isLegal, whyNot } from "./legal";

export const NO_CHOICE: AscendChoice = { keepStuffId: null, scrapId: null, takeRewardId: null };

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
        Every Stuff card in a discard pile is Scrapped, then the pile shuffles back into the deck —
        a floor cleared is a full heal. The Scrap tax keeps one piece of Stuff by Scrapping another
        card in its place. Each of you is offered three cards from your own reward pool: they are
        floating above your side of the table. Take one, or take none.
      </p>

      {(["Red", "Gray"] as const).map((c) => {
        const choice = choices[c];
        const stuff = state[c].discard.filter((x) => x.kind !== "player");
        const payers = state[c].discard.filter((x) => x.id !== choice.keepStuffId);
        const offered = state.offer?.[c] ?? [];
        const taking = offered.find((x) => x.id === choice.takeRewardId) ?? null;
        return (
          <div key={c} className="ascend__character">
            <h3>{c}</h3>

            <h4>Scrap tax — keep one piece of Stuff</h4>
            <div className="zone">
              {stuff.length === 0 ? <p className="zone__empty">No Stuff to keep.</p> : null}
              {stuff.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  selected={choice.keepStuffId === card.id}
                  onClick={() => {
                    onChoose(c, {
                      keepStuffId: choice.keepStuffId === card.id ? null : card.id,
                      scrapId: null,
                    });
                  }}
                />
              ))}
            </div>

            {choice.keepStuffId ? (
              <>
                <h4>...by Scrapping this card in its place</h4>
                <div className="zone">
                  {payers.map((card) => (
                    <CardView
                      key={card.id}
                      card={card}
                      selected={choice.scrapId === card.id}
                      onClick={() => {
                        onChoose(c, { scrapId: choice.scrapId === card.id ? null : card.id });
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}

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
      })}

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
