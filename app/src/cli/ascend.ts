/* Ascending, one question at a time (design/cli-sim/spec.md, "Ascending, one
 * question at a time").
 *
 * The engine takes one ASCEND command for both characters at once. The CLI
 * asks about the reward one character at a time, Red then Gray, staging each
 * answer in a sidecar file next to the run file until both characters have
 * answered — then it composes the single ASCEND command, dispatches it, and
 * the sidecar is gone.
 */

import type { AscendChoice, CardId, Character, Command, GameState } from "@domain/types";
import { cardId } from "@domain/ids";
import { CHARACTERS } from "@domain/verbs";

export interface StagedAnswer {
  readonly character: Character;
  readonly takeRewardId: CardId | null;
}

/** The character being asked about the reward next, or null once both have answered. */
export function currentQuestion(
  _state: GameState,
  answers: readonly StagedAnswer[],
): Character | null {
  return CHARACTERS[answers.length] ?? null;
}

export const ascendComplete = (_state: GameState, answers: readonly StagedAnswer[]): boolean =>
  answers.length === CHARACTERS.length;

/** Compose the single ASCEND command once both characters have answered. */
export function composeAscend(answers: readonly StagedAnswer[]): Command {
  const choiceFor = (c: Character): AscendChoice => {
    const answer = answers.find((a) => a.character === c);
    return { takeRewardId: answer?.takeRewardId ?? null };
  };
  return { type: "ASCEND", Red: choiceFor("Red"), Gray: choiceFor("Gray") };
}

/* ------------------------------------------------------------- the sidecar */

interface RawAnswer {
  readonly character: Character;
  readonly takeRewardId: string | null;
}

export function serializeAnswers(answers: readonly StagedAnswer[]): string {
  const raw: RawAnswer[] = answers.map((a) => ({
    character: a.character,
    takeRewardId: a.takeRewardId,
  }));
  return JSON.stringify(raw, null, 2) + "\n";
}

export function parseAnswers(text: string): StagedAnswer[] {
  const raw = JSON.parse(text) as readonly RawAnswer[];
  return raw.map(
    (a): StagedAnswer => ({
      character: a.character,
      takeRewardId: a.takeRewardId === null ? null : cardId(a.takeRewardId),
    }),
  );
}

/** A one-line account of a staged answer, for the narration section. */
export function describeStagedAnswer(state: GameState, answer: StagedAnswer): string {
  const offered = state.offer?.[answer.character] ?? [];
  const nameOf = (id: CardId): string => offered.find((x) => x.id === id)?.name ?? id;
  return answer.takeRewardId === null
    ? `${answer.character} declines the reward. (staged, not yet played)`
    : `${answer.character} will take ${nameOf(answer.takeRewardId)}. (staged, not yet played)`;
}
