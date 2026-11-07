import type { GameState } from "@domain/types";

/** A phase as a player reads it: "GameOver" is the one name written as a single word. */
export function phaseName(phase: GameState["phase"]): string {
  return phase === "GameOver" ? "Game Over" : phase;
}
