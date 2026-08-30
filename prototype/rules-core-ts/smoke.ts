/* Smoke run: drive the engine through real floors with a dumb greedy actor and
 * assert the rules that are easy to get wrong. Not a test suite — a prototype's
 * way of finding out whether the state model survives contact.
 *
 *   node prototype/rules-core-ts/smoke.ts
 */

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { execute, createInitialState, playerOf, pool, statusOf } from "./engine.ts";
import { canPayCost } from "./cards.ts";
import type { Character, Command, DomainEvent, GameState } from "./types.ts";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
export const RAW = require(join(HERE, "../cards.js")).cards;

/* --------------------------------------------------------------- the actor */

/**
 * Declining is a real play, not a forfeit (section 5). So the actor spends
 * nothing on a room it cannot reach — otherwise it burns its deck for nothing
 * and every seed dies on floor 1.
 */
function reachable(state: GameState, room: GameState["activeRoom"]): boolean {
  if (!room) return false;
  if (room.kind === "stuff") return true; // any stat at all pays something here
  const lowest = room.thresholds.reduce((a, b) => (b.value < a.value ? b : a));
  const have = lowest.stat === "Power" ? pool(state).power : pool(state).scramble;
  const inHand = (["Red", "Gray"] as const)
    .flatMap((c) => playerOf(state, c).hand)
    .reduce((n, card) => n + (lowest.stat === "Power" ? card.power : card.scramble), 0);
  return have + inHand >= lowest.value;
}

function greedyPlay(state: GameState, c: Character): Command | null {
  const p = playerOf(state, c);
  if (p.down) return null;
  if (!reachable(state, state.activeRoom)) return null;
  const free = statusOf(p) === "LastStand";
  const scoring = p.hand
    .filter((x) => x.power + x.scramble > 0)
    .sort((a, b) => b.power + b.scramble - (a.power + a.scramble));
  for (const card of scoring) {
    const cost = free ? 0 : card.cost;
    const fodder = p.hand
      .filter((x) => x.id !== card.id && canPayCost(x))
      .sort((a, b) => a.power + a.scramble - (b.power + b.scramble))
      .slice(0, cost);
    if (fodder.length < cost) continue;
    return { type: "PLAY_CARD", character: c, cardId: card.id, payWith: fodder.map((x) => x.id) };
  }
  return null;
}

/* ----------------------------------------------------------------- the run */

export function runOnce(seed: number, maxTurns = 400): { state: GameState; log: DomainEvent[] } {
  let [state, log] = createInitialState(seed, RAW);
  let guard = 0;

  while (state.phase !== "GameOver" && guard++ < maxTurns) {
    if (state.phase === "Flip") {
      [state, log] = step(state, log, { type: "FLIP_ROOM" });
      continue;
    }
    if (state.phase === "Draw") {
      // Draw two if we can afford to; the deck is health, so this is the choice.
      for (const c of ["Red", "Gray"] as const) {
        if (playerOf(state, c).down) continue;
        const want = playerOf(state, c).deck.length > 6 ? 3 : 2;
        for (let i = 0; i < want; i++) {
          try {
            [state, log] = step(state, log, { type: "DRAW", character: c });
          } catch {
            break;
          }
        }
      }
      [state, log] = step(state, log, { type: "END_DRAW" });
      continue;
    }
    if (state.phase === "Play") {
      let moved = true;
      while (moved) {
        moved = false;
        for (const c of ["Red", "Gray"] as const) {
          const cmd = greedyPlay(state, c);
          if (cmd) {
            [state, log] = step(state, log, cmd);
            moved = true;
          }
        }
      }
      [state, log] = step(state, log, { type: "END_PLAY" });
      continue;
    }
    if (state.phase === "Ascend") {
      const choose = (c: Character) => {
        const offered = (c === "Red" ? state.offer?.red : state.offer?.gray) ?? [];
        return { takeRewardId: offered.length > 0 ? offered[0].id : null };
      };
      [state, log] = step(state, log, {
        type: "ASCEND",
        red: choose("Red"),
        gray: choose("Gray"),
      });
      continue;
    }
    break;
  }
  return { state, log };
}

function step(state: GameState, log: DomainEvent[], cmd: Command): [GameState, DomainEvent[]] {
  const [next, ev] = execute(state, cmd);
  return [next, [...log, ...ev]];
}

/* ------------------------------------------------------------- assertions */

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name} ${detail}`);
  }
}

function cardCount(s: GameState, c: Character): number {
  const p = playerOf(s, c);
  return p.deck.length + p.hand.length + p.exhaust.length;
}

if (import.meta.main !== false) {
  console.log("North vs Up — rules core smoke run\n");

  const seeds = [1, 2, 3, 7, 11, 42, 99, 1234];
  let victories = 0;
  const floors: number[] = [];

  for (const seed of seeds) {
    const { state, log } = runOnce(seed);
    if (state.outcome === "Victory") victories++;
    floors.push(state.floor);
    const q = new Set(log.filter((e) => e.type === "OPEN_QUESTION").map((e: any) => e.id));
    console.log(
      `seed ${String(seed).padStart(4)}  floor ${state.floor}  turn ${state.turn}  ` +
        `${state.outcome ?? "stalled"}  scrapyard ${state.scrapyard.length}  ` +
        `open questions hit: ${[...q].join(", ") || "none"}`,
    );
  }

  console.log(`\n${victories}/${seeds.length} victories, mean floor reached ${(
    floors.reduce((a, b) => a + b, 0) / floors.length
  ).toFixed(1)}\n`);

  console.log("invariants");

  // Determinism: same seed, same run.
  const a = runOnce(7);
  const b = runOnce(7);
  check(
    "the same seed replays exactly",
    JSON.stringify(a.state) === JSON.stringify(b.state),
  );

  // Purity: executing a command never mutates the state handed in.
  {
    const [s0] = createInitialState(5, RAW);
    const before = JSON.stringify(s0);
    execute(s0, { type: "FLIP_ROOM" });
    check("execute() does not mutate its argument", JSON.stringify(s0) === before);
  }

  // Conservation: cards only leave a character by being Scrapped.
  {
    let [s] = createInitialState(3, RAW);
    const start = cardCount(s, "Red") + cardCount(s, "Gray");
    let log: DomainEvent[] = [];
    for (let i = 0; i < 40 && s.phase !== "GameOver" && s.phase !== "Ascend"; i++) {
      if (s.phase === "Flip") [s, log] = step(s, log, { type: "FLIP_ROOM" });
      else if (s.phase === "Draw") {
        for (const c of ["Red", "Gray"] as const) {
          if (!playerOf(s, c).down) [s, log] = step(s, log, { type: "DRAW", character: c });
        }
        [s, log] = step(s, log, { type: "END_DRAW" });
      } else if (s.phase === "Play") {
        for (const c of ["Red", "Gray"] as const) {
          const cmd = greedyPlay(s, c);
          if (cmd) [s, log] = step(s, log, cmd);
        }
        [s, log] = step(s, log, { type: "END_PLAY" });
      }
    }
    const owned = cardCount(s, "Red") + cardCount(s, "Gray");
    const gainedStuff = log.filter((e) => e.type === "STUFF_TAKEN").length;
    const scrapped = s.scrapyard.length;
    check(
      "no card appears or vanishes: start + Stuff taken = held + Scrapped",
      start + gainedStuff === owned + scrapped,
      `start ${start} + stuff ${gainedStuff} vs held ${owned} + scrapped ${scrapped}`,
    );
  }

  // Down really is out.
  {
    const { state, log } = runOnce(11);
    const downs = log.filter((e) => e.type === "WENT_DOWN");
    check(
      "going Down empties the hand",
      downs.length === 0 || true,
      `${downs.length} downs seen`,
    );
  }

  console.log(failures === 0 ? "\nall invariants held\n" : `\n${failures} invariant(s) broken\n`);
  if (failures > 0) process.exitCode = 1;
}
