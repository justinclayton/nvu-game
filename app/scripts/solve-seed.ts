/* Throwaway: is a seed solver tractable? (wayfinder ticket #240)
 *
 * Walks every line of play for one seed, one turn at a time. Every transition
 * is deterministic because the rng lives in `GameState.seed`, so the walk is a
 * plain search over `legalCommands` and `execute`. Within a layer (from one
 * Turn Start to the next, or to GameOver), states are deduplicated through a
 * transposition table keyed on a hash of the state with every card and room
 * projected to its id. The table also yields the size of the raw tree (what a
 * solver without a table would visit) without walking it, and the number of
 * distinct lines reaching each exit.
 *
 *   tsx --tsconfig app/tsconfig.json app/scripts/solve-seed.ts --seed 7
 *     [--max-nodes N] [--max-seconds S] [--turns T] [--no-table]
 */

import { CARD_CONTENT } from "@content/index";
import { execute } from "@domain/engine";
import { createInitialState } from "@domain/setup";
import type { Command, GameState } from "@domain/types";
import { legalCommands } from "@sim/moves";

/* ------------------------------------------------------------------ args */

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] !== undefined ? String(process.argv[i + 1]) : fallback;
};
const SEED = Number(arg("seed", "7")) | 0;
const MAX_NODES = Number(arg("max-nodes", "3000000"));
const MAX_SECONDS = Number(arg("max-seconds", "300"));
const MAX_TURNS = Number(arg("turns", "200"));
const USE_TABLE = !process.argv.includes("--no-table");
/** Count exits without keeping their states or edges: completes one layer in a fraction of the memory, but cannot start the next. */
const COUNT_ONLY = process.argv.includes("--count-only");

/* -------------------------------------------------------- canonical hash */

/** Sorted-key serialisation; a card or room (an object with `id` and `name`) becomes its id. */
function canon(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "u";
  if (Array.isArray(value)) return `[${value.map(canon).join(",")}]`;
  const o = value as Record<string, unknown>;
  if (typeof o["id"] === "string" && typeof o["name"] === "string") return o["id"];
  const keys = Object.keys(o).sort();
  return `{${keys.map((k) => `${k}:${canon(o[k])}`).join(",")}}`;
}

/** Two independent 32-bit FNV-style passes over the canonical form: a 64-bit key. */
function hashState(state: GameState): string {
  const s = canon(state);
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    a = Math.imul(a ^ ch, 0x01000193) >>> 0;
    b = Math.imul(b ^ ch, 0x27d4eb2d) >>> 0;
  }
  return `${a.toString(36)}.${b.toString(36)}`;
}

const [initial] = createInitialState(SEED, CARD_CONTENT);

/* ------------------------------------------------------------- the walk */

type Exit = "next" | "Victory" | "Defeat" | "Aborted" | "dead";
const EXITS: readonly Exit[] = ["next", "Victory", "Defeat", "Aborted", "dead"];

interface Node {
  /** Lines from here to each exit. */
  readonly lines: Record<Exit, bigint>;
  /** Nodes a table-less walk would visit from here, this one included. */
  tree: bigint;
  /** Keys of the children, for the arrivals pass. */
  readonly children: string[];
  /** Set when this node ends the layer; the state the next layer starts from. */
  boundary: { exit: Exit; state: GameState } | null;
}

class Budget extends Error {}

const zeroLines = (): Record<Exit, bigint> => ({ next: 0n, Victory: 0n, Defeat: 0n, Aborted: 0n, dead: 0n });

/** A layer ends at the next fresh Turn Start, or when the run is over. */
function exitOf(state: GameState, isRoot: boolean): Exit | null {
  if (state.phase === "GameOver") return state.outcome ?? "dead";
  if (!isRoot && state.phase === "Turn Start" && state.pending === null) return "next";
  return null;
}

interface Stats {
  expanded: number;
  interior: number;
  hits: number;
  commandsRun: number;
  maxDepth: number;
  maxBranch: number;
}

type Roots = ReadonlyMap<string, { state: GameState; arrivals: bigint }>;

function walkLayer(roots: Roots, deadline: number) {
  const table = new Map<string, Node>();
  const postOrder: string[] = [];
  const stats: Stats = { expanded: 0, interior: 0, hits: 0, commandsRun: 0, maxDepth: 0, maxBranch: 0 };

  const visit = (state: GameState, key: string, depth: number): Node => {
    const seen = USE_TABLE ? table.get(key) : undefined;
    if (seen) {
      stats.hits++;
      return seen;
    }
    if (stats.expanded >= MAX_NODES || performance.now() > deadline) throw new Budget();
    stats.expanded++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    const exit = exitOf(state, depth === 0);
    const lines = zeroLines();
    const node: Node = { lines, tree: 1n, children: [], boundary: exit ? { exit, state: COUNT_ONLY ? initial : state } : null };
    if (exit) {
      lines[exit] = 1n;
    } else {
      stats.interior++;
      const legal: readonly Command[] = legalCommands(state);
      stats.maxBranch = Math.max(stats.maxBranch, legal.length);
      if (legal.length === 0) {
        lines.dead = 1n;
        node.boundary = { exit: "dead", state: COUNT_ONLY ? initial : state };
      }
      for (const command of legal) {
        stats.commandsRun++;
        const result = execute(state, command);
        if (!result.ok) throw new Error(`generator offered a rejected command: ${command.type}: ${result.reason.message}`);
        const childKey = USE_TABLE ? hashState(result.state) : `${key}/${String(node.children.length)}`;
        const child = visit(result.state, childKey, depth + 1);
        if (!COUNT_ONLY) node.children.push(childKey);
        node.tree += child.tree;
        for (const e of EXITS) lines[e] += child.lines[e];
      }
    }
    table.set(key, node);
    postOrder.push(key);
    return node;
  };

  let truncated = false;
  const rootNodes: { key: string; arrivals: bigint; node: Node }[] = [];
  try {
    for (const [key, root] of roots) {
      const node = visit(root.state, key, 0);
      rootNodes.push({ key, arrivals: root.arrivals, node });
    }
  } catch (error) {
    if (!(error instanceof Budget)) throw error;
    truncated = true;
  }

  // Arrivals: how many lines from the seed's start reach each node of this layer.
  const arrivals = new Map<string, bigint>();
  for (const r of rootNodes) arrivals.set(r.key, (arrivals.get(r.key) ?? 0n) + r.arrivals);
  for (let i = postOrder.length - 1; i >= 0; i--) {
    const key = postOrder[i];
    if (key === undefined) continue;
    const node = table.get(key);
    const here = arrivals.get(key) ?? 0n;
    if (!node || here === 0n) continue;
    for (const c of node.children) arrivals.set(c, (arrivals.get(c) ?? 0n) + here);
  }

  const nextRoots = new Map<string, { state: GameState; arrivals: bigint }>();
  const exits = zeroLines();
  if (COUNT_ONLY) {
    // No edges kept, so no arrivals pass: sum the roots' own line counts instead.
    for (const r of rootNodes) for (const e of EXITS) exits[e] += r.node.lines[e] * r.arrivals;
  }
  const distinctExits = zeroLines();
  for (const [key, node] of table) {
    if (!node.boundary) continue;
    const here = arrivals.get(key) ?? 0n;
    if (!COUNT_ONLY) exits[node.boundary.exit] += here;
    distinctExits[node.boundary.exit] += 1n;
    if (node.boundary.exit === "next") nextRoots.set(key, { state: node.boundary.state, arrivals: here });
  }
  let raw = 0n;
  for (const r of rootNodes) raw += r.node.tree;

  return { stats, truncated, exits, distinctExits, nextRoots, raw, rootsWalked: rootNodes.length, distinct: table.size };
}

/* --------------------------------------------------------------- report */

const mb = (n: number) => (n / 1024 / 1024).toFixed(0);
const big = (n: bigint) => n.toLocaleString("en-US");
const floorsOf = (roots: Roots): string => {
  const floors = new Map<number, number>();
  for (const r of roots.values()) floors.set(r.state.floor, (floors.get(r.state.floor) ?? 0) + 1);
  return [...floors.entries()].sort(([a], [b]) => a - b).map(([f, n]) => `F${String(f)}×${String(n)}`).join(" ");
};

console.log(`seed ${String(SEED)}  table=${USE_TABLE ? "on" : "off"}  max-nodes=${String(MAX_NODES)}  max-seconds=${String(MAX_SECONDS)}`);
console.log(`layer | roots (floors) | expanded (interior) | hits | raw tree | lines: next / victory / defeat / aborted / dead | distinct next | depth | branch | secs | heap MB`);

let roots: Roots = new Map([[hashState(initial), { state: initial, arrivals: 1n }]]);
const deadline = performance.now() + MAX_SECONDS * 1000;
let totalRaw = 0n;
for (let layer = 1; layer <= MAX_TURNS; layer++) {
  if (roots.size === 0) break;
  const t0 = performance.now();
  const r = walkLayer(roots, deadline);
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  const heap = mb(process.memoryUsage().heapUsed);
  totalRaw += r.raw;
  console.log(
    `${String(layer).padStart(5)} | ${String(roots.size).padStart(6)} (${floorsOf(roots)}) | ${String(r.stats.expanded).padStart(8)} (${String(r.stats.interior)}) | ${String(r.stats.hits).padStart(6)} | ${big(r.raw).padStart(10)} | ${big(r.exits.next)} / ${big(r.exits.Victory)} / ${big(r.exits.Defeat)} / ${big(r.exits.Aborted)} / ${big(r.exits.dead)} | ${big(r.distinctExits.next).padStart(9)} | ${String(r.stats.maxDepth).padStart(5)} | ${String(r.stats.maxBranch).padStart(6)} | ${secs.padStart(5)} | ${heap.padStart(7)}${r.truncated ? "  TRUNCATED" : ""}`,
  );
  if (r.truncated) {
    console.log(`budget hit in layer ${String(layer)}: ${String(r.rootsWalked)} of ${String(roots.size)} roots fully walked, ${String(r.distinct)} states in the table`);
    break;
  }
  if (COUNT_ONLY) break;
  roots = r.nextRoots;
}
console.log(`raw tree so far (table-less visits): ${big(totalRaw)}`);
