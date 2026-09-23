/* A balance report over many seeds (issue #93): win rate, floor reached, why
 * runs end, deck/Exhaust size per character after each Ascend, and per-card
 * play/take/keep counts. Everything here reads events and states `simulate`
 * already produces, through `RunOptions.onStep`, so one pass per seed is
 * enough — nothing is replayed twice.
 */

import { settleableStuff } from "@domain/queries";
import type { CardContent } from "@domain/printed";
import type { AscendChoice, Character, Command, DomainEvent, GameState } from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";
import { greedyAscendStats, greedyPolicy, resetGreedyAscendStats, type Policy } from "./policy";
import { seedsFrom, simulate, type RunResult, type StopReason } from "./run";

export interface FloorCount {
  readonly floor: number;
  readonly runs: number;
}

export interface EndReasonCount {
  readonly reason: string;
  readonly runs: number;
}

export interface CharacterAscendStats {
  readonly ascends: number;
  readonly meanDeckSize: number;
  readonly meanExhaustSize: number;
  /** deck + hand + discard right after the Ascend — the same total `policy.ts`'s `liveDeckSize` reads. */
  readonly meanLiveSize: number;
}

export interface CardStat {
  readonly name: string;
  readonly played: number;
  readonly taken: number;
  readonly kept: number;
}

/**
 * Where one character's cards went on one floor: Exhausted (`CARD_EXHAUSTED`),
 * Scrapped (`CARD_SCRAPPED`, e.g. paying to settle Stuff), paid as a Play
 * cost (`COST_PAID` — discarded, not lost) and Good Stuff returned to the
 * pool at Settle your Stuff for going unpaid (rulebook, Ascending, step 2).
 * Only the first two, plus a returned Good Stuff, shrink the live deck
 * (`policy.ts`, `liveDeckSize`) — paying a cost does not.
 */
export interface FloorLossRow {
  readonly floor: number;
  readonly character: Character;
  readonly exhausted: number;
  readonly scrapped: number;
  readonly paidAsCost: number;
  readonly stuffReturned: number;
}

export interface BalanceReport {
  readonly policy: string;
  readonly from: number;
  readonly seeds: number;
  readonly runs: number;
  readonly wins: number;
  readonly winRate: number;
  readonly floors: readonly FloorCount[];
  readonly endReasons: readonly EndReasonCount[];
  readonly characters: Readonly<Record<Character, CharacterAscendStats>>;
  readonly cards: readonly CardStat[];
  readonly floorLosses: readonly FloorLossRow[];
  /**
   * How many Ascends the greedy policy's composed `ASCEND` command was
   * refused, falling back to the move generator's own (capped) list — see
   * `policy.ts`, `composeChoice`. Null for a policy with no such stat.
   */
  readonly ascendFallbacks: number | null;
}

/** Why a run ended, in the engine's own terms where it has one. */
function endReasonOf(run: RunResult): string {
  if (run.stopped === "GameOver") return run.outcome === "Victory" ? "Victory" : "Defeat (Down)";
  const other: Record<Exclude<StopReason, "GameOver">, string> = {
    Budget: "Unfinished: command budget",
    NoLegalMove: "Unfinished: no legal move offered",
    Rejected: "Unfinished: engine refused the policy's move",
    Threw: "Unfinished: engine threw",
  };
  return other[run.stopped];
}

interface CardTally {
  played: number;
  taken: number;
  kept: number;
}

interface LossTally {
  exhausted: number;
  scrapped: number;
  paidAsCost: number;
  stuffReturned: number;
}

const emptyLossTally = (): LossTally => ({ exhausted: 0, scrapped: 0, paidAsCost: 0, stuffReturned: 0 });

class Accumulator {
  runs = 0;
  wins = 0;
  private readonly floorCounts = new Map<number, number>();
  private readonly endCounts = new Map<string, number>();
  private readonly ascendCounts: Record<Character, number> = { Red: 0, Gray: 0 };
  private readonly deckSums: Record<Character, number> = { Red: 0, Gray: 0 };
  private readonly exhaustSums: Record<Character, number> = { Red: 0, Gray: 0 };
  private readonly liveSums: Record<Character, number> = { Red: 0, Gray: 0 };
  private readonly cardTallies = new Map<string, CardTally>();
  private readonly lossTallies = new Map<string, LossTally>();

  private tally(name: string): CardTally {
    let t = this.cardTallies.get(name);
    if (!t) {
      t = { played: 0, taken: 0, kept: 0 };
      this.cardTallies.set(name, t);
    }
    return t;
  }

  private lossTally(floor: number, character: Character): LossTally {
    const key = `${String(floor)}:${character}`;
    let t = this.lossTallies.get(key);
    if (!t) {
      t = emptyLossTally();
      this.lossTallies.set(key, t);
    }
    return t;
  }

  onStep(before: GameState, command: Command, after: GameState, events: readonly DomainEvent[]): void {
    for (const event of events) {
      if (event.type === "CARD_PLAYED") this.tally(event.card.name).played += 1;
      if (event.type === "REWARD_TAKEN") this.tally(event.card.name).taken += 1;
      if (event.type === "CARD_EXHAUSTED") this.lossTally(before.floor, event.character).exhausted += 1;
      if (event.type === "CARD_SCRAPPED" && event.character !== null) {
        this.lossTally(before.floor, event.character).scrapped += 1;
      }
      if (event.type === "COST_PAID") {
        this.lossTally(before.floor, event.character).paidAsCost += event.cards.length;
      }
    }
    if (command.type === "ASCEND") {
      for (const character of CHARACTERS) {
        this.ascendCounts[character] += 1;
        const p = playerOf(after, character);
        this.deckSums[character] += p.deck.length;
        this.exhaustSums[character] += p.exhaust.length;
        this.liveSums[character] += p.deck.length + p.hand.length + p.discard.length;
        this.recordKeeps(before, character, command[character]);
      }
    }
  }

  /**
   * Good Stuff kept iff paid for; Bad Stuff kept iff not (rulebook, section
   * 10, step 2). An unpaid Good Stuff card shuffles back into the pool
   * (`engine.ts`, `settleStuff`), which is a loss from that character's live
   * deck even though no `DomainEvent` says so directly.
   */
  private recordKeeps(before: GameState, character: Character, choice: AscendChoice): void {
    for (const card of settleableStuff(before, character)) {
      const settlement = choice.settle.find((s) => s.cardId === card.id);
      const paid = (settlement?.payWith ?? null) !== null;
      const kept = card.kind === "good_stuff" ? paid : !paid;
      if (kept) this.tally(card.name).kept += 1;
      if (card.kind === "good_stuff" && !paid) {
        this.lossTally(before.floor, character).stuffReturned += 1;
      }
    }
  }

  recordRun(run: RunResult): void {
    this.runs += 1;
    if (run.outcome === "Victory") this.wins += 1;
    this.floorCounts.set(run.floor, (this.floorCounts.get(run.floor) ?? 0) + 1);
    const reason = endReasonOf(run);
    this.endCounts.set(reason, (this.endCounts.get(reason) ?? 0) + 1);
  }

  private characterStats(character: Character): CharacterAscendStats {
    const ascends = this.ascendCounts[character];
    return {
      ascends,
      meanDeckSize: ascends > 0 ? this.deckSums[character] / ascends : 0,
      meanExhaustSize: ascends > 0 ? this.exhaustSums[character] / ascends : 0,
      meanLiveSize: ascends > 0 ? this.liveSums[character] / ascends : 0,
    };
  }

  finish(policy: string, from: number, seeds: number, ascendFallbacks: number | null): BalanceReport {
    const floors = [...this.floorCounts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([floor, runs]) => ({ floor, runs }));
    const endReasons = [...this.endCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([reason, runs]) => ({ reason, runs }));
    const cards = [...this.cardTallies.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, t]) => ({ name, ...t }));
    const floorLosses = [...this.lossTallies.entries()]
      .map(([key, t]) => {
        const [floorStr, character] = key.split(":") as [string, Character];
        return { floor: Number(floorStr), character, ...t };
      })
      .sort((a, b) => a.floor - b.floor || a.character.localeCompare(b.character));
    return {
      policy,
      from,
      seeds,
      runs: this.runs,
      wins: this.wins,
      winRate: this.runs > 0 ? this.wins / this.runs : 0,
      floors,
      endReasons,
      characters: { Red: this.characterStats("Red"), Gray: this.characterStats("Gray") },
      cards,
      floorLosses,
      ascendFallbacks,
    };
  }
}

export function buildReport(policy: Policy, content: CardContent, from: number, seeds: number): BalanceReport {
  const tracksAscendFallbacks = policy === greedyPolicy;
  if (tracksAscendFallbacks) resetGreedyAscendStats();

  const acc = new Accumulator();
  for (const seed of seedsFrom(from, seeds)) {
    const run = simulate(seed, policy, content, {
      onStep: (before, command, after, events) => acc.onStep(before, command, after, events),
    });
    acc.recordRun(run);
  }
  return acc.finish(policy.name, from, seeds, tracksAscendFallbacks ? greedyAscendStats.fallback : null);
}
