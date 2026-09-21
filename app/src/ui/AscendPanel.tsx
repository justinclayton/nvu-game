/* Rulebook, Ascending: Settle your Stuff, then the card reward.
 *
 * Every Stuff card in a character's deck, hand or discard pile has a free
 * default fate — Good Stuff goes to its pool, Bad Stuff stays with you — that
 * can be flipped by Scrapping one non-Stuff card of that character's. The
 * offer floats above the mat and is chosen by clicking it there; this panel
 * decides the Settle choices and shows the whole thing before it is sent.
 * Whether the whole choice is legal is `validate`'s answer, not this
 * component's. */

import type { AscendChoice, Card, CardId, Character, Command, GameState } from "@domain/types";
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

const fateLabel = (card: Card, flipped: boolean): string => {
  if (card.kind === "good_stuff") return flipped ? "kept, paid for" : "→ Good Stuff pool";
  return flipped ? "→ Bad Stuff pool, paid for" : "kept";
};

export function AscendPanel({ state, dispatch, choices, onChoose }: Props) {
  const command: Command = { type: "ASCEND", Red: choices.Red, Gray: choices.Gray };

  return (
    <section className="ascend">
      <h2>The floor is clear. Up the stairs.</h2>
      <p className="ascend__note">
        Settle your Stuff: each piece of Stuff in your deck, hand or discard pile has a free
        default — Good Stuff goes to its pool, Bad Stuff stays with you — or Scrap one non-Stuff
        card to flip it: keep the Good Stuff, or shed the Bad Stuff to its pool. Each of you is
        also offered three cards from your own reward pool: they are floating above your side of
        the table. Take one, or take none.
      </p>

      {(["Red", "Gray"] as const).map((c) => {
        const choice = choices[c];
        const p = state[c];
        const stuff = [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind !== "player");
        const usedPayers = new Set(
          choice.settle.flatMap((d) => (d.pay !== null ? [d.pay] : [])),
        );
        const payable = [...p.deck, ...p.hand, ...p.discard].filter((x) => x.kind === "player");
        const offered = state.offer?.[c] ?? [];
        const taking = offered.find((x) => x.id === choice.takeRewardId) ?? null;

        const decisionFor = (id: CardId) => choice.settle.find((d) => d.stuffId === id) ?? null;

        const toggleFlip = (stuffId: CardId) => {
          const exists = decisionFor(stuffId);
          onChoose(
            c,
            exists
              ? { settle: choice.settle.filter((d) => d.stuffId !== stuffId) }
              : { settle: [...choice.settle, { stuffId, pay: null }] },
          );
        };

        const setPayer = (stuffId: CardId, payId: CardId) => {
          onChoose(c, {
            settle: choice.settle.map((d) =>
              d.stuffId === stuffId ? { ...d, pay: d.pay === payId ? null : payId } : d,
            ),
          });
        };

        return (
          <div key={c} className="ascend__character">
            <h3>{c}</h3>

            <h4>Settle your Stuff</h4>
            <div className="zone">
              {stuff.length === 0 ? <p className="zone__empty">No Stuff to settle.</p> : null}
              {stuff.map((card) => {
                const decision = decisionFor(card.id);
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    selected={decision !== null}
                    badge={fateLabel(card, decision !== null)}
                    onClick={() => {
                      toggleFlip(card.id);
                    }}
                  />
                );
              })}
            </div>

            {choice.settle.length > 0 ? (
              <>
                <h4>...paid for by Scrapping</h4>
                {choice.settle.map((d) => {
                  const stuffCard = stuff.find((x) => x.id === d.stuffId);
                  if (!stuffCard) return null;
                  const options = payable.filter(
                    (x) => x.id === d.pay || !usedPayers.has(x.id),
                  );
                  return (
                    <div key={d.stuffId} className="ascend__settle-row">
                      <p className="ascend__settle-label">Pay for {stuffCard.name} with:</p>
                      <div className="zone">
                        {options.length === 0 ? (
                          <p className="zone__empty">Nothing left to pay with.</p>
                        ) : null}
                        {options.map((payer) => (
                          <CardView
                            key={payer.id}
                            card={payer}
                            selected={d.pay === payer.id}
                            onClick={() => {
                              setPayer(d.stuffId, payer.id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
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
