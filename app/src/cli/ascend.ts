/* Ascending, one question at a time (design/cli-sim/spec.md, "Ascending, one
 * question at a time").
 *
 * The engine takes one ASCEND command for both characters at once. The CLI
 * asks about it one Stuff card at a time, then the reward, for Red then
 * Gray, staging each answer in a sidecar file next to the run file until
 * both characters have answered the reward question — then it composes the
 * single ASCEND command, dispatches it, and the sidecar is gone.
 */

import { settleableStuff, settlePayOptions } from "@domain/queries";
import type { AscendChoice, Card, CardId, Character, Command, GameState } from "@domain/types";
import { cardId } from "@domain/ids";
import { CHARACTERS } from "@domain/verbs";

export interface SettleAnswer {
  readonly kind: "settle";
  readonly character: Character;
  readonly cardId: CardId;
  readonly payWith: CardId | null;
}

export interface RewardAnswer {
  readonly kind: "reward";
  readonly character: Character;
  readonly takeRewardId: CardId | null;
}

export type StagedAnswer = SettleAnswer | RewardAnswer;

export interface AscendQuestion {
  readonly character: Character;
  readonly kind: "settle" | "reward";
  /** The Stuff card being asked about; null for the reward question. */
  readonly card: Card | null;
}

/** Every question this Ascend will ask, in the order it asks them. */
export function ascendQuestions(state: GameState): readonly AscendQuestion[] {
  const out: AscendQuestion[] = [];
  for (const c of CHARACTERS) {
    for (const card of settleableStuff(state, c)) out.push({ character: c, kind: "settle", card });
    out.push({ character: c, kind: "reward", card: null });
  }
  return out;
}

/** The question the next answer should address, or null once every question is staged. */
export function currentQuestion(
  state: GameState,
  answers: readonly StagedAnswer[],
): AscendQuestion | null {
  return ascendQuestions(state)[answers.length] ?? null;
}

export const ascendComplete = (state: GameState, answers: readonly StagedAnswer[]): boolean =>
  answers.length === ascendQuestions(state).length;

/** The non-Stuff cards still free to pay with, for one character, given what is staged. */
export function payerCandidates(
  state: GameState,
  c: Character,
  answers: readonly StagedAnswer[],
): readonly Card[] {
  const spent = new Set(
    answers
      .filter((a): a is SettleAnswer => a.kind === "settle" && a.character === c && a.payWith !== null)
      .map((a) => a.payWith),
  );
  return settlePayOptions(state, c).filter((card) => !spent.has(card.id));
}

/** Compose the single ASCEND command once every question has an answer. */
export function composeAscend(answers: readonly StagedAnswer[]): Command {
  const choiceFor = (c: Character): AscendChoice => {
    const settle = answers
      .filter((a): a is SettleAnswer => a.kind === "settle" && a.character === c)
      .map((a) => ({ cardId: a.cardId, payWith: a.payWith }));
    const reward = answers.find(
      (a): a is RewardAnswer => a.kind === "reward" && a.character === c,
    );
    return { settle, takeRewardId: reward?.takeRewardId ?? null };
  };
  return { type: "ASCEND", Red: choiceFor("Red"), Gray: choiceFor("Gray") };
}

/* ------------------------------------------------------------- the sidecar */

interface RawAnswer {
  readonly kind: "settle" | "reward";
  readonly character: Character;
  readonly cardId: string | null;
  readonly payWith: string | null;
  readonly takeRewardId: string | null;
}

export function serializeAnswers(answers: readonly StagedAnswer[]): string {
  const raw: RawAnswer[] = answers.map((a) =>
    a.kind === "settle"
      ? { kind: "settle", character: a.character, cardId: a.cardId, payWith: a.payWith, takeRewardId: null }
      : { kind: "reward", character: a.character, cardId: null, payWith: null, takeRewardId: a.takeRewardId },
  );
  return JSON.stringify(raw, null, 2) + "\n";
}

export function parseAnswers(text: string): StagedAnswer[] {
  const raw = JSON.parse(text) as readonly RawAnswer[];
  return raw.map((a): StagedAnswer =>
    a.kind === "settle"
      ? {
          kind: "settle",
          character: a.character,
          cardId: cardId(a.cardId ?? ""),
          payWith: a.payWith === null ? null : cardId(a.payWith),
        }
      : {
          kind: "reward",
          character: a.character,
          takeRewardId: a.takeRewardId === null ? null : cardId(a.takeRewardId),
        },
  );
}

/** A one-line account of a staged answer, for the narration section. */
export function describeStagedAnswer(state: GameState, answer: StagedAnswer): string {
  const nameOf = (c: Character, id: CardId): string => {
    const found = [...settleableStuff(state, c), ...settlePayOptions(state, c)].find(
      (x) => x.id === id,
    );
    return found ? found.name : id;
  };
  if (answer.kind === "reward") {
    return answer.takeRewardId === null
      ? `${answer.character} declines the reward. (staged, not yet played)`
      : `${answer.character} will take ${nameOf(answer.character, answer.takeRewardId)}. (staged, not yet played)`;
  }
  const card = nameOf(answer.character, answer.cardId);
  return answer.payWith === null
    ? `${answer.character} keeps ${card}, free. (staged, not yet played)`
    : `${answer.character} settles ${card} by Scrapping ${nameOf(answer.character, answer.payWith)}. (staged, not yet played)`;
}
