/* One character's side of the table: their three piles, their side of the play
 * zone, and their hand. Which cards can be played, and what a card costs, are
 * the domain's answers. */

import { canDraw, costOf, playableCards, statPool } from "@domain/queries";
import type { Card, CardId, Character, GameState } from "@domain/types";
import { CardView } from "./CardView";

export interface Paying {
  readonly character: Character;
  readonly cardId: CardId;
  readonly chosen: readonly CardId[];
}

interface Props {
  readonly state: GameState;
  readonly character: Character;
  readonly paying: Paying | null;
  readonly onPickCard: (card: Card) => void;
  readonly onDraw: () => void;
}

function statusOf(state: GameState, c: Character): string {
  const p = state[c];
  if (p.down) return "Down";
  if (p.lastStand) return "Last stand";
  return "Standing";
}

export function CharacterPanel({ state, character, paying, onPickCard, onDraw }: Props) {
  const player = state[character];
  const side = statPool(state, character);
  const playable = new Set(playableCards(state, character).map((c) => c.id));
  const payingHere = paying?.character === character ? paying : null;
  const status = statusOf(state, character);

  const canClick = (card: Card): boolean => {
    if (state.pending) return false;
    if (state.phase !== "Play" || player.down) return false;
    if (!payingHere) return playable.has(card.id);
    // Mid-payment: every other card in the hand is a legal way to pay.
    return card.id !== payingHere.cardId;
  };

  return (
    <section className={`panel panel--${character.toLowerCase()}`}>
      <header className="panel__head">
        <h2>{character}</h2>
        <span className={`status status--${status.replace(" ", "-").toLowerCase()}`}>{status}</span>
      </header>

      <dl className="piles">
        <div>
          <dt>Deck</dt>
          <dd title="Your deck is your stamina">{player.deck.length}</dd>
        </div>
        <div>
          <dt>Hand</dt>
          <dd>{player.hand.length}</dd>
        </div>
        <div>
          <dt>Exhaust</dt>
          <dd>{player.exhaust.length}</dd>
        </div>
        <div>
          <dt>Side</dt>
          <dd>
            {side.power} / {side.scramble}
          </dd>
        </div>
      </dl>

      {state.phase === "Draw" ? (
        <button
          type="button"
          className="button"
          disabled={!canDraw(state, character)}
          onClick={onDraw}
        >
          Draw a card
        </button>
      ) : null}

      <h3 className="zone__label">Play zone</h3>
      <div className="zone">
        {state.playZone
          .filter((p) => p.owner === character)
          .map((p) => (
            <CardView key={p.card.id} card={p.card} state={state} owner={character} />
          ))}
        {state.playZone.every((p) => p.owner !== character) ? (
          <p className="zone__empty">Nothing played.</p>
        ) : null}
      </div>

      <h3 className="zone__label">
        Hand
        {payingHere ? (
          <span className="zone__hint">
            {" "}
            — choose {costOf(state, character, cardById(player.hand, payingHere.cardId)) -
              payingHere.chosen.length}{" "}
            more to Exhaust
          </span>
        ) : null}
      </h3>
      <div className="zone zone--hand">
        {player.hand.map((card) => (
          <CardView
            key={card.id}
            card={card}
            state={state}
            owner={character}
            selected={payingHere?.cardId === card.id}
            dimmed={payingHere ? payingHere.chosen.includes(card.id) : !playable.has(card.id)}
            badge={payingHere?.chosen.includes(card.id) ? "paying" : undefined}
            onClick={canClick(card) ? () => onPickCard(card) : undefined}
          />
        ))}
        {player.hand.length === 0 ? <p className="zone__empty">Empty.</p> : null}
      </div>
    </section>
  );
}

function cardById(hand: readonly Card[], id: CardId): Card {
  const found = hand.find((c) => c.id === id);
  if (!found) throw new Error("The card being paid for left the hand.");
  return found;
}
