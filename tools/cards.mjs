#!/usr/bin/env node
/* North vs Up — card list tooling.
 *
 *   node tools/cards.mjs build    regenerate the generated card modules from design/cards.yaml
 *   node tools/cards.mjs check    fail if either is stale or the card sheet stops rendering
 *
 * design/cards.yaml is the source of truth for every card.  Nothing else in the
 * repo may hold a card's name, cost, stats, rarity, or rules text except
 * as a generated copy.  There are two:
 *
 *   tools/cards.js                     untyped, for the printable card sheet
 *   app/src/content/cards.generated.ts typed, for the web game
 *
 * The web game's module is structured, not prose: a room's threshold outcomes
 * and its Flee line are parsed here so nothing in the app ever reads a sentence.
 *
 * No dependencies on purpose: this script and the card sheet beside it run from
 * a bare checkout, and the parser only has to read the one file it owns.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createContext, runInContext } from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "design/cards.yaml");
const OUT = join(ROOT, "tools/cards.js");
const OUT_TS = join(ROOT, "app/src/content/cards.generated.ts");
const SETS = new Set(["official", "proposed"]);

/* ------------------------------------------------------------------ parser
   Handles exactly the subset design/cards.yaml uses: a top-level map, one list
   of maps under `cards:`, scalars, `>-` folded blocks, and flow or block maps
   in a nested list.  Anything outside that subset is an error, not a silent
   skip. */

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "") return "";
  if (s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")) {
    return s.slice(1, -1);
  }
  if (s[0] === "[" && s.at(-1) === "]") {
    return splitFlow(s.slice(1, -1)).map(parseScalar);
  }
  if (s[0] === "{" && s.at(-1) === "}") return parseFlowMap(s);
  return s;
}

/* Split on commas that are not inside quotes or braces. */
function splitFlow(s) {
  const out = [];
  let buf = "", depth = 0, quote = null;
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      buf += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  if (buf.trim() !== "") out.push(buf);
  return out.map((x) => x.trim());
}

function parseFlowMap(s) {
  const obj = {};
  for (const pair of splitFlow(s.trim().slice(1, -1))) {
    const i = pair.indexOf(":");
    if (i === -1) throw new Error(`bad flow map entry: ${pair}`);
    obj[pair.slice(0, i).trim()] = parseScalar(pair.slice(i + 1));
  }
  return obj;
}

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

export function parseCardsYaml(text) {
  const lines = text.split("\n");
  const doc = { meta: {}, cards: [] };
  let card = null, section = null;
  let nested = null; // {item, indent}: a block map open inside a nested list
  let fold = null; // {target, key, indent, parts}

  const flushFold = () => {
    if (!fold) return;
    fold.target[fold.key] = fold.parts.join(" ").replace(/\s+/g, " ").trim();
    fold = null;
  };

  for (let n = 0; n < lines.length; n++) {
    const rawLine = lines[n];
    const indent = rawLine.length - rawLine.trimStart().length;

    if (fold) {
      if (rawLine.trim() === "") { fold.parts.push(""); continue; }
      if (indent > fold.indent) { fold.parts.push(rawLine.trim()); continue; }
      flushFold();
    }

    const line = stripComment(rawLine);
    const t = line.trim();
    if (t === "" || t === "---") continue;

    // top-level keys
    if (indent === 0) {
      const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!m) throw new Error(`line ${n + 1}: unexpected top-level content: ${t}`);
      section = m[1];
      if (section === "cards") { card = null; continue; }
      if (section === "meta") continue;
      throw new Error(`line ${n + 1}: unknown top-level key: ${section}`);
    }

    if (section === "meta") {
      const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!m) throw new Error(`line ${n + 1}: bad meta entry: ${t}`);
      doc.meta[m[1]] = parseScalar(m[2]);
      continue;
    }

    if (section !== "cards") throw new Error(`line ${n + 1}: content outside a known section`);

    // a new card
    if (t.startsWith("- ")) {
      const rest = t.slice(2);
      if (indent === 2) {
        nested = null;
        card = {};
        doc.cards.push(card);
        const m = rest.match(/^([A-Za-z_]+):\s*(.*)$/);
        if (!m) throw new Error(`line ${n + 1}: a card must start with a key: ${t}`);
        card[m[1]] = parseScalar(m[2]);
        continue;
      }
      // an item of a nested list (thresholds)
      const key = card && card.__list;
      if (!key) throw new Error(`line ${n + 1}: nested list item with no list key`);
      const bm = rest.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (bm) {
        // `- stat: Oomph` opens a block map; its later keys sit indented past the dash
        const item = { [bm[1]]: parseScalar(bm[2]) };
        card[key].push(item);
        nested = { item, indent };
      } else {
        card[key].push(parseScalar(rest));
        nested = null;
      }
      continue;
    }

    const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!m) throw new Error(`line ${n + 1}: unparsed line: ${t}`);
    const [, key, value] = m;
    if (!card) throw new Error(`line ${n + 1}: key outside a card: ${t}`);

    if (nested) {
      if (indent > nested.indent) { nested.item[key] = parseScalar(value); continue; }
      nested = null;
    }

    if (value === ">-" || value === ">" || value === "|" || value === "|-") {
      fold = { target: card, key, indent, parts: [] };
      continue;
    }
    if (value === "") { card.__list = key; card[key] = []; continue; }
    card[key] = parseScalar(value);
  }
  flushFold();
  for (const c of doc.cards) delete c.__list;
  return doc;
}

/* ------------------------------------------------------------------- build */

const FIELD_ORDER = [
  "name", "set", "kind", "owner", "starter", "rarity",
  "rarity_status", "cost", "oomph", "scramble", "conditional_stat",
  "thresholds", "flee", "text", "note", "flagged",
];

function ordered(card) {
  const out = {};
  for (const k of FIELD_ORDER) if (k in card) out[k] = card[k];
  for (const k of Object.keys(card)) if (!(k in out)) out[k] = card[k];
  return out;
}

function generate(doc) {
  const body = doc.cards.map((c) => "    " + JSON.stringify(ordered(c))).join(",\n");
  return `/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed.  EVERY NUMBER IS A PLACEHOLDER —
 * costs, stats and thresholds are still open design.
 *
 * Loaded by tools/card-sheet.html (the print-and-cut sheet) with a plain
 * <script> tag, so the sheet keeps working from file:// with no build step
 * and no server.
 */
var NVU_CARDS = {
  meta: ${JSON.stringify(doc.meta)},
  cards: [
${body}
  ]
};

/* Views over the list, for whatever loads it. */
NVU_CARDS.by = function (fn) { return NVU_CARDS.cards.filter(fn); };
NVU_CARDS.official = NVU_CARDS.cards.filter(function (c) { return c.set === "official"; });
NVU_CARDS.proposed = NVU_CARDS.cards.filter(function (c) { return c.set === "proposed"; });
NVU_CARDS.byName = function (n) {
  for (var i = 0; i < NVU_CARDS.cards.length; i++) {
    if (NVU_CARDS.cards[i].name === n) return NVU_CARDS.cards[i];
  }
  return null;
};

if (typeof module !== "undefined") module.exports = NVU_CARDS;
`;
}

/* ------------------------------------------------- the printed prose, parsed
   A room prints its threshold outcomes and its Flee line as sentences.  The web
   game never reads a sentence, so the shapes the card list actually prints are
   turned into structure here.  Anything this does not recognise is an error,
   not a silently dropped rule.

   Rulebook, Card anatomy: Room Cards for Flee lines; the three kinds of room are Enemy, Hazard, and
   Stuff (rulebook, Card anatomy: Room Cards, and see open-questions.md #2, #7, #8). */

const CARD_KINDS = new Set(["player", "good_stuff", "bad_stuff"]);
const ROOM_KIND = { enemy_room: "enemy", hazard_room: "hazard", stuff_room: "stuff" };

/** No Stuff room in cards.yaml prints a Flee line of its own; this is the text
 * shown when one is fled without meeting a threshold. It has no effect and,
 * like any other Flee, does not clear the room. */
const STUFF_FLEE = "Leave empty-handed.";

function who(word) {
  const w = word.trim().toLowerCase();
  if (w === "both of you" || w === "both") return "both";
  if (w === "one of you" || w === "one") return "one";
  if (w === "red") return "Red";
  if (w === "gray") return "Gray";
  throw new Error(`unrecognised target: "${word}"`);
}

/* Each entry reads one clause. `clears` and `fleeFree` are flags the clause
   raises; `effect` is what it does. */
const CLAUSES = [
  [/^(?:and )?ascend$/i, () => ({ clears: true })],
  [/^(?:and )?clear(?: the room)?$/i, () => ({ clears: true })],
  [/^(?:and )?flee this room for free$/i, () => ({ fleeFree: true })],
  [/^(?:and )?leave empty-handed$/i, () => ({})],
  [
    /^(both of you|one of you|red|gray) exhausts? (\d+)$/i,
    (m) => ({ effect: { type: "ExhaustFromDeck", who: who(m[1]), amount: Number(m[2]) } }),
  ],
  [
    /^(both of you|one of you|red|gray) (?:gets?|takes?) (?:(\d+) )?bad stuff$/i,
    (m) => ({ effect: { type: "DealBadStuff", who: who(m[1]) } }),
  ],
  [
    /^(both of you|one of you|red|gray) (?:gets?|takes?) (?:(\d+) )?good stuff$/i,
    (m) => ({ effect: { type: "TakeGoodStuff", who: who(m[1]), count: Number(m[2] ?? 1) } }),
  ],
  [
    /^(both of you|one of you|red|gray) (?:gets?|takes?) (\d+) instead$/i,
    (m) => ({ effect: { type: "TakeGoodStuff", who: who(m[1]), count: Number(m[2]) } }),
  ],
  [
    /^(both of you|one of you|red|gray) reveals? (?:a |the )?(?:card )?reward$/i,
    (m) => ({ effect: { type: "RevealReward", who: who(m[1]) } }),
  ],
];

/** Split printed prose into clauses: on full stops, commas, and a joining "and". */
function clausesOf(prose) {
  return prose
    .split(/[.;]|,\s*(?:and\s+)?|\s+and\s+/i)
    .map((c) => c.replace(/^\s*but\s+/i, "").trim())
    .filter((c) => c !== "");
}

function readProse(prose, where) {
  const out = { clears: false, fleeFree: false, effects: [] };
  for (const clause of clausesOf(prose)) {
    const hit = CLAUSES.find(([re]) => re.test(clause));
    if (!hit) throw new Error(`${where}: unparsed clause "${clause}" in "${prose}"`);
    const read = hit[1](clause.match(hit[0]));
    if (read.clears) out.clears = true;
    if (read.fleeFree) out.fleeFree = true;
    if (read.effect) out.effects.push(read.effect);
  }
  return out;
}

/**
 * A Stuff room's challenge is split per character, and each line is measured
 * against that character's own side of the play zone.  A line naming both
 * characters names no single side, so it reads the shared pool. See
 * open-questions.md #2.
 */
function measuredOn(kind, effects) {
  if (kind !== "stuff") return null;
  const named = new Set(effects.map((e) => e.who).filter((w) => w === "Red" || w === "Gray"));
  return named.size === 1 ? [...named][0] : null;
}

function threshold(raw, kind, where) {
  if (!raw || typeof raw.value !== "number" || (raw.stat !== "Oomph" && raw.stat !== "Scramble")) {
    throw new Error(`${where}: a threshold needs a Oomph or Scramble stat and a value`);
  }
  const outcome = String(raw.outcome ?? "");
  const read = readProse(outcome, `${where} threshold "${outcome}"`);
  return {
    stat: raw.stat,
    value: raw.value,
    outcome,
    // Each Turn, Outcome: meeting any threshold Clears the room. A Stuff room's lines
    // never say "clear" themselves, so this is where that rule reaches them.
    clears: kind === "stuff" ? true : read.clears,
    fleeFree: read.fleeFree,
    measuredOn: measuredOn(kind, read.effects),
    effects: read.effects,
  };
}

function fleeLine(card, kind) {
  if (kind === "stuff") {
    return { text: STUFF_FLEE, clears: false, effects: [] };
  }
  if (!card.flee) throw new Error(`${card.name}: every Enemy and Hazard room prints a Flee line`);
  const read = readProse(card.flee, `${card.name} Flee line`);
  return { text: card.flee, clears: read.clears, effects: read.effects };
}

function cardFace(c) {
  return {
    name: c.name,
    set: c.set,
    kind: c.kind,
    owner: c.owner ?? null,
    rarity: c.rarity ?? null,
    starter: c.starter === true,
    count: c.count ?? 1,
    cost: c.cost ?? 0,
    oomph: c.oomph ?? 0,
    scramble: c.scramble ?? 0,
    conditionalStat: c.conditional_stat === true,
    text: c.text ?? "",
  };
}

function roomFace(c) {
  const kind = ROOM_KIND[c.kind];
  const thresholds = (c.thresholds ?? []).map((t) => threshold(t, kind, c.name));
  if (thresholds.length === 0) throw new Error(`${c.name}: a room prints at least one threshold`);
  return {
    name: c.name,
    set: c.set,
    kind,
    floor: typeof c.floor === "number" ? c.floor : null,
    count: c.count ?? 1,
    thresholds,
    flee: fleeLine(c, kind),
  };
}

/** The whole card list, in the shape app/src/domain/printed.ts describes. */
export function structure(doc) {
  const cards = [];
  const rooms = [];
  for (const c of doc.cards) {
    if (CARD_KINDS.has(c.kind)) cards.push(cardFace(c));
    else if (c.kind in ROOM_KIND) rooms.push(roomFace(c));
    else throw new Error(`${c.name}: unknown kind ${JSON.stringify(c.kind)}`);
  }
  return { meta: { updated: String(doc.meta.updated ?? "") }, cards, rooms };
}

/* ------------------------------------------------------- the typed TS module */

function ts(value, indent) {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${pad}  ${ts(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const body = keys.map((k) => `${pad}  ${k}: ${ts(value[k], indent + 1)}`);
    return `{\n${body.join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

export function generateTs(doc) {
  const content = structure(doc);
  return `/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed, with each room's threshold outcomes and
 * Flee line already parsed into structure.  Data, not rules: this module knows
 * what a card says and nothing about what the engine does with it.
 *
 * EVERY NUMBER IS A PLACEHOLDER — costs, stats and thresholds are still open
 * design (design/rulebook.md, "NOT YET RULED").
 */

import type { CardContent } from "../domain/printed";

export const CARD_CONTENT = ${ts(content, 0)} as const satisfies CardContent;
`;
}

/* ------------------------------------------------------------------- check */

function checkSchema(doc) {
  const problems = [];
  const names = new Set();
  for (const c of doc.cards) {
    if (!c.name) problems.push("a card is missing a name");
    else if (names.has(c.name)) problems.push(`duplicate card name: ${c.name}`);
    else names.add(c.name);
    if (!SETS.has(c.set)) {
      problems.push(`${c.name || "?"}: set must be official|proposed, got ${JSON.stringify(c.set)}`);
    }
    if (!c.kind) problems.push(`${c.name || "?"}: missing kind`);
  }
  return problems;
}

/* ------------------------------------------------- the card sheet renders
   The sheet is a view of the card list, so "does it still print every card"
   is part of checking the list. Its script is run against a DOM stub and
   asked how many cards it put on the page. */

function stubEl() {
  return {
    value: "", checked: false, textContent: "", innerHTML: "", style: {}, type: "",
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [],
    insertAdjacentHTML(_, v) { this.innerHTML = v + this.innerHTML; },
    classList: { add() { }, remove() { }, toggle() { } },
  };
}

function baseContext(cardsJs) {
  const store = {};
  const ctx = {
    console: { log() { }, warn() { }, error() { } },
    Math, JSON, Date, parseInt, parseFloat, isNaN,
    String, Number, Array, Object, Boolean, setTimeout,
    localStorage: { getItem: () => null, setItem() { } },
    document: {
      getElementById: (id) => (store[id] = store[id] || stubEl()),
      querySelector: stubEl, createElement: stubEl,
      querySelectorAll: () => [], body: stubEl(), addEventListener() { },
    },
  };
  ctx.window = ctx;
  createContext(ctx);
  runInContext(cardsJs, ctx);
  return { ctx, store };
}

function checkRenders(doc, cardsJs) {
  const problems = [];
  const totalWithCopies = doc.cards.reduce((sum, c) => sum + (c.count || 1), 0);

  try {
    const sheet = readFileSync(join(ROOT, "tools/card-sheet.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sheet.match(/<script>\n"use strict";([\s\S]*?)<\/script>/)[1], ctx);
    const html = store.sheets.innerHTML;
    const drawn = (html.match(/class="card /g) || []).length;
    if (drawn !== totalWithCopies) {
      problems.push(`tools/card-sheet.html renders ${drawn} cards, not ${totalWithCopies}`);
    }
  } catch (e) {
    problems.push(`tools/card-sheet.html failed to render: ${e.message}`);
  }
  return problems;
}

/* ---------------------------------------------------------------------- main */

const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
const cmd = process.argv[2] || "build";

if (cmd === "build") {
  writeFileSync(OUT, generate(doc));
  writeFileSync(OUT_TS, generateTs(doc));
  const { cards, rooms } = structure(doc);
  console.log(
    `wrote tools/cards.js and app/src/content/cards.generated.ts — ` +
    `${cards.length} cards and ${rooms.length} rooms`,
  );
} else if (cmd === "check") {
  const problems = [];
  problems.push(...checkSchema(doc));
  const want = generate(doc);
  let have = "";
  try { have = readFileSync(OUT, "utf8"); } catch { /* missing counts as stale */ }
  if (have !== want) problems.push("tools/cards.js is stale — run: node tools/cards.mjs build");

  const wantTs = generateTs(doc);
  let haveTs = "";
  try { haveTs = readFileSync(OUT_TS, "utf8"); } catch { /* missing counts as stale */ }
  if (haveTs !== wantTs) {
    problems.push("app/src/content/cards.generated.ts is stale — run: node tools/cards.mjs build");
  }

  problems.push(...checkRenders(doc, want));

  if (problems.length) {
    console.error(`card list has drifted — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(`no drift — ${doc.cards.length} cards agree across cards.yaml and cards.js,
and the card sheet prints every copy of all ${doc.cards.length}`);
} else {
  console.error("usage: node tools/cards.mjs [build|check]");
  process.exit(2);
}
