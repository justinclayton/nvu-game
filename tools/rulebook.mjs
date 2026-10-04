#!/usr/bin/env node
/* North vs Up — the rulebook as a printable page.
 *
 *   node tools/rulebook.mjs [out.html]    render rulebook.md to HTML
 *
 * The default output is print/rulebook-<rules version>.html, such as
 * rulebook-R29.html; `make rulebook` names it for the kit instead and renders
 * it to a PDF beside it.  rulebook.md stays the one place the
 * rules are written down, so this only renders the Markdown it already uses:
 * headings, paragraphs, bullet and numbered lists, block quotes, rules, and
 * bold, italic and `term` inline.  No dependencies, like tools/cards.mjs.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULEBOOK = join(ROOT, "rulebook.md");

/* ---------------------------------------------------------------- inline */

function escape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* A backticked term is a game term, not code.  Red and Gray get their colours
   from the card sheet; everything else is set in small caps. */
function term(t) {
  const cls = t === "Red" ? "term red" : t === "Gray" ? "term gray" : "term";
  return `<span class="${cls}">${escape(t)}</span>`;
}

function inline(s) {
  const out = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (let m; (m = re.exec(s)); ) {
    out.push(text(s.slice(last, m.index)));
    if (m[1] !== undefined) out.push(term(m[1]));
    else if (m[2] !== undefined) out.push(`<strong>${inline(m[2])}</strong>`);
    else out.push(`<em>${inline(m[3])}</em>`);
    last = m.index + m[0].length;
  }
  out.push(text(s.slice(last)));
  return out.join("");
}

function text(s) {
  return escape(s).replace(/ -- /g, " – ").replace(/\.\.\./g, "…");
}

/* ----------------------------------------------------------------- blocks */

function parse(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  const para = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para.length = 0;
  };
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (line.trim() === "") {
      flush();
      i++;
    } else if (/^---+\s*$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
      i++;
    } else if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      flush();
      blocks.push({ type: "h", level: m[1].length, text: m[2].trim() });
      i++;
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flush();
      const q = [];
      while (i < lines.length && (m = lines[i].match(/^>\s?(.*)$/))) {
        q.push(m[1]);
        i++;
      }
      blocks.push({ type: "quote", blocks: parse(q.join("\n")) });
    } else if ((m = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/))) {
      flush();
      const ordered = /\d/.test(m[2]);
      const items = [];
      while (i < lines.length && (m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/))) {
        if (/\d/.test(m[2]) !== ordered) break;
        let item = m[3];
        i++;
        while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) {
          item += " " + lines[i].trim();
          i++;
        }
        items.push(item);
      }
      blocks.push({ type: "list", ordered, items });
    } else {
      para.push(line.trim());
      i++;
    }
  }
  flush();
  return blocks;
}

/* ----------------------------------------------------------------- render */

function render(blocks) {
  return blocks.map(renderBlock).join("\n");
}

function renderBlock(b) {
  switch (b.type) {
    case "p":
      return `<p>${inline(b.text)}</p>`;
    case "hr":
      return `<hr>`;
    case "h": {
      if (/^placeholder for diagram/i.test(b.text)) {
        const what = b.text.replace(/^placeholder for diagram( of)?\s*/i, "");
        return `<div class="placeholder">Diagram${what ? ": " + inline(what) : ""}</div>`;
      }
      const m = b.text.match(/^(\d+)\.\s+(.*)$/);
      const label = m ? `<span class="num">${m[1]}</span>${inline(m[2])}` : inline(b.text);
      return `<h${b.level}>${label}</h${b.level}>`;
    }
    case "quote":
      return `<blockquote>${render(b.blocks)}</blockquote>`;
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      return `<${tag}>${b.items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`;
    }
  }
  throw new Error(`unknown block ${b.type}`);
}

/* A ten-tier tower, the same figure as the floor-deck card backs. */
function tower() {
  const tiers = [];
  for (let t = 0; t < 10; t++) {
    const w = 46 - t * 4;
    const x = (48 - w) / 2;
    const y = 44 - (t + 1) * 4.2;
    const fill = t === 9 ? "currentColor" : "white";
    tiers.push(`<rect x="${x}" y="${y}" width="${w}" height="3.6" rx="0.5" fill="${fill}" stroke="currentColor" stroke-width="0.8"/>`);
  }
  return `<svg class="tower" viewBox="0 0 48 46" xmlns="http://www.w3.org/2000/svg">${tiers.join("")}</svg>`;
}

const CSS = `
  @page {
    size: 8.5in 11in;
    margin: 0.8in 0.85in 0.9in;
    @bottom-center {
      content: "North vs Up\\00a0\\00a0\\00b7\\00a0\\00a0Rules " env(rules-version) "\\00a0\\00a0\\00b7\\00a0\\00a0" counter(page);
      font-family: "Helvetica Neue", Arial, sans-serif;
      font-size: 8pt;
      color: #888;
    }
  }
  @page :first { @bottom-center { content: none; } }
  * { box-sizing: border-box; }
  html { font-size: 10.5pt; }
  body {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino", "Book Antiqua", Georgia, serif;
    line-height: 1.45;
    color: #111;
    background: white;
  }
  @media screen {
    body { background: #e8e8e8; padding: 10mm 0; }
    .sheet { width: 8.5in; min-height: 11in; margin: 0 auto 10mm; padding: 0.8in 0.85in 0.9in; background: white; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
  }

  /* title page */
  .cover { break-after: page; height: 9.3in; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .cover .tower { width: 1.5in; height: auto; color: #111; margin-bottom: 0.4in; }
  .cover h1 { font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 800; font-size: 44pt; letter-spacing: -0.02em; margin: 0; line-height: 1; }
  .cover h1 em { font-style: normal; }
  .cover .sub { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13pt; letter-spacing: 0.3em; text-transform: uppercase; color: #555; margin: 0.25in 0 0; }
  .cover .version { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9.5pt; color: #777; margin-top: 2.2in; letter-spacing: 0.08em; }
  .cover .players { margin-top: 0.3in; font-size: 11pt; color: #444; }
  .cover .players .term { font-size: 11pt; }

  /* headings */
  h1, h2, h3, h4 { font-family: "Helvetica Neue", Arial, sans-serif; break-after: avoid; }
  h2 { font-size: 17pt; font-weight: 800; letter-spacing: -0.01em; margin: 0.35in 0 0.08in; padding-bottom: 2pt; border-bottom: 1.5pt solid #111; }
  h2 .num { display: inline-block; min-width: 1.4em; color: #999; font-weight: 500; }
  h3 { font-size: 12pt; font-weight: 700; margin: 0.2in 0 0.05in; }
  h3 .num { color: #999; font-weight: 500; margin-right: 0.4em; }
  h4 { font-size: 10.5pt; font-weight: 700; margin: 0.15in 0 0.03in; color: #333; }
  hr { display: none; }
  h2 + h2 { margin-top: 0.08in; border-bottom: 0; font-size: 12pt; font-weight: 700; }

  /* body */
  p { margin: 0 0 0.09in; orphans: 2; widows: 2; }
  ul, ol { margin: 0 0 0.1in; padding-left: 0.28in; }
  li { margin-bottom: 0.03in; }
  ol li::marker { font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 700; }
  blockquote { margin: 0.05in 0 0.12in; padding: 0.04in 0 0.04in 0.16in; border-left: 2pt solid #bbb; color: #333; }
  blockquote p:last-child { margin-bottom: 0; }
  strong { font-weight: 700; }
  .term { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 0.86em; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; }
  .term.red { color: #b52d24; }
  .term.gray { color: #7a7f87; }
  .placeholder { margin: 0.12in 0; padding: 0.3in; border: 1pt dashed #bbb; border-radius: 3pt; text-align: center; color: #999; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9pt; letter-spacing: 0.05em; text-transform: uppercase; break-inside: avoid; }
  .placeholder .term { text-transform: none; letter-spacing: 0.02em; }
`;

function page(version, bodyHTML) {
  return `<!doctype html>
<meta charset="utf-8">
<title>North vs Up — Rulebook ${version}</title>
<style>${CSS.replace("env(rules-version)", JSON.stringify(version))}</style>
<div class="sheet">
<section class="cover">
  ${tower()}
  <h1><em>North</em> vs <em>Up</em></h1>
  <p class="sub">Rulebook</p>
  <p class="players">A cooperative roguelike deckbuilder for ${term("Red")} and ${term("Gray")}.</p>
  <p class="version">Rules version ${version}</p>
</section>
${bodyHTML}
</div>
`;
}

function build() {
  const md = readFileSync(RULEBOOK, "utf8");
  const m = md.match(/^Rules version:\s*(\S+)\s*$/m);
  if (!m) throw new Error('rulebook.md has no "Rules version:" line');
  const version = m[1];
  const body = md
    .replace(/^# .*\n/, "")
    .replace(/^Rules version:.*\n/m, "");
  return { version, html: page(version, render(parse(body))) };
}

const { version, html } = build();
const out = process.argv[2] ?? join(ROOT, "print", `rulebook-${version}.html`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out.replace(ROOT + "/", "")}`);
