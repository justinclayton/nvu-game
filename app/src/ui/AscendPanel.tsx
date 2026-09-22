/* Rulebook, Ascending: Settle your Stuff, then the card reward, both decided at once.
 *
 * Every Stuff card in a character's deck, hand or discard pile is listed with
 * its default (Good Stuff to its pool, Bad Stuff kept) and the option to pay
 * for the opposite by Scrapping one other card that character owns. The three
 * cards each character is offered float above the mat and are chosen by
 * clicking them there; this panel shows the whole choice before it is sent.
 * The offer and what may be settled come from the state; whether the whole
 * choice is legal is `validate`'s answer, not this component's. The table
 * owns the choice, so the floating cards and the panel are reading the same
 * one. */

import { settleableStuff, settlePayOptions } from "@domain/queries";
import type { AscendChoice, Card, Character, Command, GameState, StuffSettlement } from "@domain/types";
import { CardView } from "./CardView";
import { isLegal, whyNot } from "./legal";

export const NO_CHOICE: AscendChoice = { settle: [], takeRewardId: null };

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
        Every Stuff card in your deck, hand and discard pile is settled: Good Stuff goes to its
        pool unless you keep it, Bad Stuff stays unless you shed it — either way, by Scrapping one
        other card you own. Each of you is offered three cards from your own reward pool: they are
        floating above your side of the table. Take one, or take none.
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
  const stuff = settleableStuff(state, c);
  const payOptions = settlePayOptions(state, c);
  const offered = state.offer?.[c] ?? [];
  const taking = offered.find((x) => x.id === choice.takeRewardId) ?? null;
  const usedPayers = new Set(
    choice.settle.map((s) => s.payWith).filter((id): id is Card["id"] => id !== null),
  );

  const settle = (cardId: Card["id"], payWith: Card["id"] | null) => {
    const rest = choice.settle.filter((s) => s.cardId !== cardId);
    const next: readonly StuffSettlement[] = payWith === null ? rest : [...rest, { cardId, payWith }];
    onChoose(c, { settle: next });
  };

  return (
    <div className="ascend__character">
      <h3>{c}</h3>

      <h4>Settle your Stuff</h4>
      {stuff.length === 0 ? <p className="zone__empty">No Stuff to settle.</p> : null}
      {stuff.map((card) => {
        const settlement = choice.settle.find((s) => s.cardId === card.id) ?? null;
        const paying = settlement !== null;
        const label =
          card.kind === "good_stuff"
            ? paying
              ? "kept in place by Scrapping..."
              : "→ Good Stuff pool by default"
            : paying
              ? "→ Bad Stuff pool by Scrapping..."
              : "kept in place by default";
        const payers = payOptions.filter(
          (x) => !usedPayers.has(x.id) || x.id === settlement?.payWith,
        );
        return (
          <div key={card.id} className="ascend__stuff">
            <CardView
              card={card}
              selected={paying}
              onClick={() => {
                settle(card.id, null);
              }}
            />
            <span className="ascend__default">{label}</span>
            {payers.length === 0 ? null : (
              <div className="zone">
                {payers.map((payer) => (
                  <CardView
                    key={payer.id}
                    card={payer}
                    selected={settlement?.payWith === payer.id}
                    onClick={() => {
                      settle(card.id, settlement?.payWith === payer.id ? null : payer.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

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
