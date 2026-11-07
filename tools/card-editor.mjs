#!/usr/bin/env node
/* North vs Up — the card editor: cards.yaml as card faces you edit in a browser.
 *
 *   node tools/card-editor.mjs                    write .lavish/cards-editor.html from cards.yaml
 *   node tools/card-editor.mjs apply <changes.json> [--dry]
 *                                                 write a change set the page produced into cards.yaml
 *
 * The page is tools/card-editor.html with the card list and tools/card-yaml.js
 * put inside it, so the one file opens anywhere. `make card-editor` builds and
 * opens it; the /card-editor skill opens it in Lavish and applies what comes back.
 *
 * A change set is { added: [{id, card}], edited: [{id, name, card}], removed: [{id, name}] }.
 * An edited or removed card is found by its original name and its block replaced
 * or deleted in place; comments and the blocks around it stay. An added card goes
 * after the last card of its own group (kind, owner and starter flag for player
 * cards, tier for rooms), else after the last card of its kind, else at the end.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { parseCardsYaml, structure, rulesVersion, cardListId } from "./cards.mjs";

const require = createRequire(import.meta.url);
const CardYaml = require("./card-yaml.js");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "cards.yaml");
const TEMPLATE = join(ROOT, "tools/card-editor.html");
const SERIALISER = join(ROOT, "tools/card-yaml.js");
const OUT = join(ROOT, ".lavish/cards-editor.html");

/* ------------------------------------------------------------------- build */

function build() {
  const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
  let rules = "", listId = "", note = "";
  try { rules = rulesVersion(); } catch (e) { note = e.message; }
  try { listId = cardListId(structure(doc)); } catch (e) { note += (note ? " · " : "") + "the generator would reject this list: " + e.message; }

  const payload = { meta: doc.meta, cards: doc.cards, rulesVersion: rules, cardListId: listId, buildNote: note };
  const json = JSON.stringify(payload).replace(/<\/script/gi, "<\\/script");
  const html = readFileSync(TEMPLATE, "utf8");
  const start = html.indexOf("<!--cards-data-start-->"), end = html.indexOf("<!--cards-data-end-->");
  if (start === -1 || end === -1) throw new Error("tools/card-editor.html: cards-data markers missing");
  const js = readFileSync(SERIALISER, "utf8").replace(/<\/script/gi, "<\\/script");
  const out = html.slice(0, start) +
    `<!--cards-data-start-->\n<script id="cards-data" type="application/json">${json}</script>\n` +
    html.slice(end).replace('<script src="card-yaml.js"></script>', `<script>\n${js}\n</script>`);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, out);
  console.log(`wrote .lavish/cards-editor.html — ${doc.cards.length} cards from cards.yaml (${doc.meta.version}${listId ? ", list " + listId : ""})${note ? "\n  note: " + note : ""}`);
}

/* ------------------------------------------------------------------- apply */

function unquote(s) {
  s = s.trim();
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")) return s.slice(1, -1);
  return s;
}
const indentOf = (l) => l.length - l.trimStart().length;

/** Every card block in the file: [start, end) and the scalar fields on its own lines. */
function blocks(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^  - name:\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    let j = i + 1;
    while (j < lines.length && !(lines[j].trim() !== "" && indentOf(lines[j]) <= 2)) j++;
    let end = j;
    while (end > i + 1 && lines[end - 1].trim() === "") end--;
    const fields = {};
    for (let k = i + 1; k < end; k++) {
      const f = /^    ([a-z_]+):\s*(.*)$/.exec(lines[k]);
      if (f) fields[f[1]] = unquote(f[2]);
    }
    out.push({ name: unquote(m[1]), start: i, end, fields });
  }
  return out;
}

function sameGroup(c, b) {
  const kind = b.fields.kind;
  if (c.kind !== kind) return false;
  if (kind === "room" || kind === "stairwell") return String(c.tier) === String(b.fields.tier ?? "null");
  if (kind === "player") {
    return (c.owner || "") === (b.fields.owner || "") && (c.starter === true) === (b.fields.starter === "true");
  }
  return true;
}

function apply(jsonPath, { yamlPath = YAML, dry = false } = {}) {
  const changes = JSON.parse(readFileSync(jsonPath, "utf8"));
  const lines = readFileSync(yamlPath, "utf8").split("\n");
  const all = blocks(lines);
  const report = [];
  const ops = [];

  for (const r of changes.removed || []) {
    const b = all.find((x) => x.name === r.name);
    if (!b) { report.push(`${r.id}: not applied, no card named "${r.name}" in cards.yaml`); continue; }
    let end = b.end;
    while (end < lines.length && lines[end].trim() === "") end++;
    ops.push({ at: b.start, remove: end - b.start, insert: [] });
    report.push(`${r.id}: removed "${r.name}"`);
  }
  for (const e of changes.edited || []) {
    const b = all.find((x) => x.name === e.name);
    if (!b) { report.push(`${e.id}: not applied, no card named "${e.name}" in cards.yaml`); continue; }
    ops.push({ at: b.start, remove: b.end - b.start, insert: CardYaml.cardLines(e.card) });
    report.push(`${e.id}: edited "${e.name}"${e.card.name !== e.name ? ` (now "${e.card.name}")` : ""}`);
  }
  /* Names this batch frees up: removed cards and the old names of renamed ones. */
  const freed = new Set([
    ...(changes.removed || []).map((r) => r.name),
    ...(changes.edited || []).filter((e) => e.card.name !== e.name).map((e) => e.name),
  ]);
  for (const a of changes.added || []) {
    const c = a.card;
    if (!c.name || !c.name.trim()) { report.push(`${a.id}: not applied, the new card has no name`); continue; }
    if (all.some((x) => x.name === c.name) && !freed.has(c.name)) {
      report.push(`${a.id}: not applied, a card named "${c.name}" already exists`);
      continue;
    }
    const anchor = [...all].reverse().find((b) => sameGroup(c, b)) ||
      [...all].reverse().find((b) => b.fields.kind === c.kind) || all[all.length - 1];
    ops.push({ at: anchor ? anchor.end : lines.length, remove: 0, insert: ["", ...CardYaml.cardLines(c)] });
    report.push(`${a.id}: added "${c.name}" after "${anchor ? anchor.name : "(end)"}"`);
  }

  /* Bottom up, so earlier offsets stay valid; inserts at one offset keep their order. */
  ops.forEach((op, i) => { op.idx = i; });
  ops.sort((x, y) => y.at - x.at || y.remove - x.remove || y.idx - x.idx);
  const out = lines.slice();
  for (const op of ops) out.splice(op.at, op.remove, ...op.insert);
  let text = out.join("\n").replace(/\n{3,}/g, "\n\n");
  if (!text.endsWith("\n")) text += "\n";

  if (!dry) writeFileSync(yamlPath, text);
  console.log(report.join("\n") + (dry ? "\n(dry run, nothing written)" : `\nwrote ${yamlPath}`));
}

/* -------------------------------------------------------------------- main */

const args = process.argv.slice(2);
const cmd = args[0] || "build";
if (cmd === "build") {
  build();
} else if (cmd === "apply") {
  const dry = args.includes("--dry");
  const yamlIdx = args.indexOf("--yaml");
  const yamlPath = yamlIdx !== -1 ? resolve(args[yamlIdx + 1]) : YAML;
  const file = args.slice(1).find((a, i, arr) => !a.startsWith("--") && arr[i - 1] !== "--yaml");
  if (!file) { console.error("usage: node tools/card-editor.mjs apply <changes.json> [--dry] [--yaml path]"); process.exit(2); }
  apply(resolve(file), { yamlPath, dry });
} else {
  console.error("usage: node tools/card-editor.mjs [build | apply <changes.json> [--dry]]");
  process.exit(2);
}
