#!/usr/bin/env node
/* North vs Up — card list tooling.
 *
 *   node tools/cards.mjs build    regenerate prototype/cards.js from design/cards.yaml
 *   node tools/cards.mjs check    fail if cards.js is stale or a prototype stops rendering
 *
 * design/cards.yaml is the source of truth for every card.  Nothing else in the
 * repo may hold a card's name, cost, stats, rarity, Hold, or rules text except
 * as a generated copy (prototype/cards.js).
 *
 * No dependencies on purpose: this is a paper-prototype repo with no package.json,
 * and the parser only has to read the one file it owns.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createContext, runInContext } from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "design/cards.yaml");
const OUT = join(ROOT, "prototype/cards.js");
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
        // `- stat: Power` opens a block map; its later keys sit indented past the dash
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
  "rarity_status", "cost", "power", "scramble", "conditional_stat", "hold",
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
 * Loaded by prototype/card-sheet.html (the cutting sheet) and
 * prototype/encounter-sim.html (the simulator) with a plain <script> tag, so
 * both keep working from file:// with no build step and no server.
 */
var NVU_CARDS = {
  meta: ${JSON.stringify(doc.meta)},
  cards: [
${body}
  ]
};

/* Views the prototypes share. */
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

/* --------------------------------------------------- the prototypes render
   Both prototypes are now views of the card list, so "does it still render"
   is part of checking the list. Each page's script is run against a DOM stub
   and asked how many cards it put on the page. */

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
  const total = doc.cards.length;

  try {
    const sheet = readFileSync(join(ROOT, "prototype/card-sheet.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sheet.match(/<script>\n"use strict";([\s\S]*?)<\/script>/)[1], ctx);
    const html = store.sheets.innerHTML;
    const drawn = (html.match(/class="card /g) || []).length;
    if (drawn !== total) {
      problems.push(`prototype/card-sheet.html renders ${drawn} cards, not ${total}`);
    }
  } catch (e) {
    problems.push(`prototype/card-sheet.html failed to render: ${e.message}`);
  }

  try {
    const sim = readFileSync(join(ROOT, "prototype/encounter-sim.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sim.match(/<script>\n"use strict";([\s\S]*)<\/script>/)[1], ctx);
    runInContext("renderLibrary()", ctx);
    const drawn = (store.library.innerHTML.match(/class="card/g) || []).length;
    if (drawn !== total) {
      problems.push(`prototype/encounter-sim.html's card list shows ${drawn} cards, not ${total}`);
    }
  } catch (e) {
    problems.push(`prototype/encounter-sim.html failed to render: ${e.message}`);
  }
  return problems;
}

/* ---------------------------------------------------------------------- main */

const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
const cmd = process.argv[2] || "build";

if (cmd === "build") {
  writeFileSync(OUT, generate(doc));
  console.log(`wrote prototype/cards.js — ${doc.cards.length} cards`);
} else if (cmd === "check") {
  const problems = [];
  problems.push(...checkSchema(doc));
  const want = generate(doc);
  let have = "";
  try { have = readFileSync(OUT, "utf8"); } catch { /* missing counts as stale */ }
  if (have !== want) problems.push("prototype/cards.js is stale — run: node tools/cards.mjs build");
  problems.push(...checkRenders(doc, want));

  if (problems.length) {
    console.error(`card list has drifted — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(`no drift — ${doc.cards.length} cards agree across cards.yaml and cards.js,
and both prototypes render all ${doc.cards.length}`);
} else {
  console.error("usage: node tools/cards.mjs [build|check]");
  process.exit(2);
}
