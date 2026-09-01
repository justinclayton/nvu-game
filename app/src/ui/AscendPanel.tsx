/* §10 Ascending: the Scrap tax and the card reward, both decided at once.
 *
 * The offer and what may be kept come from the state; whether the whole choice
 * is legal is `validate`'s answer, not this component's. */

import { useState } from "react";

import type { AscendChoice, CardId, Character, Command, GameState } from "@domain/types";
import { CardView } from "./CardView";
import { isLegal, whyNot } from "./legal";

const NOTHING: AscendChoice = { keepStuffId: null, scrapId: null, takeRewardId: null };

interface Props {
  readonly state: GameState;
  readonly dispatch: (command: Command) => void;
}

export function AscendPanel({ state, dispatch }: Props) {
  const [choices, setChoices] = useState<Record<Character, AscendChoice>>({
    Red: NOTHING,
    Gray: NOTHING,
  });

  const set = (c: Character, patch: Partial<AscendChoice>) => {
    setChoices((current) => ({ ...current, [c]: { ...current[c], ...patch } }));
  };

  const command: Command = { type: "ASCEND", Red: choices.Red, Gray: choices.Gray };

  return (
    <section className="ascend">
      <h2>The floor is clear. Up the stairs.</h2>
      <p className="ascend__note">
        Every Stuff card in an exhaust pile is Scrapped, then the pile shuffles back into the deck —
        a floor cleared is a full heal. The Scrap tax keeps one piece of Stuff by Scrapping another
        card in its place.
      </p>

      {(["Red", "Gray"] as const).map((c) => {
        const choice = choices[c];
        const stuff = state[c].exhaust.filter((x) => x.kind !== "player");
        const payers = state[c].exhaust.filter((x) => x.id !== choice.keepStuffId);
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
                    set(c, {
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
                        set(c, { scrapId: choice.scrapId === card.id ? null : card.id });
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}

            <h4>Card reward — take one, or decline</h4>
            <div className="zone">
              {(state.offer?.[c] ?? []).map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  selected={choice.takeRewardId === card.id}
                  onClick={() => {
                    set(c, {
                      takeRewardId: choice.takeRewardId === card.id ? null : (card.id as CardId),
                    });
                  }}
                />
              ))}
            </div>
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
            setChoices({ Red: NOTHING, Gray: NOTHING });
          }}
        >
          Ascend to floor {state.floor + 1}
        </button>
        <span className="controls__why">{whyNot(state, command)}</span>
      </div>
    </section>
  );
}
