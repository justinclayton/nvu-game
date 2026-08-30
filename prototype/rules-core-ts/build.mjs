/* Builds prototype/rules-core-demo.html: one file you can double-click.
 *
 *   node prototype/rules-core-ts/build.mjs
 *
 * No dependencies and no bundler. Node strips the TypeScript types itself; the
 * modules are concatenated in dependency order and their import/export lines
 * dropped, because file:// will not load ES modules and the whole point is that
 * the demo opens without a server.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const ORDER = ["types.ts", "rng.ts", "cards.ts", "engine.ts", "scenarios.ts", "ui.ts"];

function moduleSource(file) {
  const ts = readFileSync(join(HERE, file), "utf8");
  const js = stripTypeScriptTypes(ts, { mode: "strip" });
  return js
    .replace(/^import\s[\s\S]*?from\s+["'][^"']+["'];?[ \t]*$/gm, "")   // drop imports
    .replace(/^export\s*\{[\s\S]*?\};?[ \t]*$/gm, "")                   // drop re-exports
    .replace(/^export\s+(?=(const|let|var|function|class|async))/gm, "") // unwrap exports
    .replace(/^declare\s.*$/gm, "");
}

const bundle = ORDER.map((f) => `\n/* ===== ${f} ===== */\n${moduleSource(f)}`).join("\n");
const cards = readFileSync(join(ROOT, "prototype/cards.js"), "utf8");

const html = `<!doctype html>
<meta charset="utf-8">
<title>North vs Up — rules core (PROTOTYPE)</title>
<style>
  :root { color-scheme: light dark; --bg:#14151a; --fg:#e8e6e1; --dim:#8b8a86;
          --red:#c8503c; --gray:#6f8fa8; --line:#2c2e36; --met:#4c9a5a; }
  body { margin:0; background:var(--bg); color:var(--fg);
         font:14px/1.5 ui-sans-serif,-apple-system,Segoe UI,Roboto,sans-serif; }
  header { padding:14px 20px; border-bottom:1px solid var(--line); }
  header h1 { margin:0 0 4px; font-size:17px; }
  header p { margin:0; color:var(--dim); max-width:70ch; }
  header .warn { color:#d8a33c; }
  #tabs { display:flex; flex-wrap:wrap; gap:6px; padding:10px 20px; border-bottom:1px solid var(--line); }
  #tabs button { background:none; border:1px solid var(--line); color:var(--dim);
                 padding:5px 10px; border-radius:5px; cursor:pointer; font:inherit; }
  #tabs button.on { color:var(--fg); border-color:var(--fg); }
  main { display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); gap:20px; padding:16px 20px; }
  @media (max-width:900px) { main { grid-template-columns:1fr; } }
  .walkthrough { border:1px solid var(--line); border-radius:6px; padding:12px; margin-bottom:14px; }
  .walkthrough h3 { margin:0 0 6px; }
  .walkthrough .question { color:var(--dim); margin:0 0 10px; }
  .walkthrough .next { background:#1d1f27; padding:8px 10px; border-radius:5px; margin:0 0 10px; }
  .walkthrough .next.done { color:var(--dim); }
  button { background:#232630; border:1px solid var(--line); color:var(--fg);
           padding:6px 11px; border-radius:5px; cursor:pointer; font:inherit; margin:0 6px 6px 0; }
  button:disabled { opacity:.4; cursor:default; }
  .meta { display:flex; flex-wrap:wrap; gap:14px; margin-bottom:12px; color:var(--dim); }
  .meta b { color:var(--fg); }
  .meta .scrap b { color:#d8a33c; }
  .room { border:1px solid var(--line); border-left:3px solid var(--dim); border-radius:6px; padding:10px 12px; }
  .room.enemy { border-left-color:var(--red); }
  .room.hazard { border-left-color:#c8a03c; }
  .room.stuff { border-left-color:var(--met); }
  .room h3 { margin:0 0 6px; } .room .kind { color:var(--dim); font-weight:400; font-size:12px; }
  .room ul { margin:0 0 6px; padding-left:18px; }
  .room li.met { color:var(--met); }
  .room .have { color:var(--dim); font-size:12px; }
  .room .flee { margin:0; color:var(--dim); font-size:13px; }
  .controls { margin:12px 0; }
  .players { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:700px) { .players { grid-template-columns:1fr; } }
  .player { border:1px solid var(--line); border-radius:6px; padding:10px; }
  .player.red h3 { color:var(--red); } .player.gray h3 { color:var(--gray); }
  .player h3 { margin:0 0 8px; font-size:15px; }
  .player .status { font-size:12px; padding:1px 6px; border:1px solid var(--line); border-radius:9px; color:var(--fg); }
  .player.laststand .status { border-color:#c8a03c; color:#c8a03c; }
  .player.down .status { border-color:var(--red); color:var(--red); }
  .player .side { float:right; font-size:12px; color:var(--dim); font-weight:400; }
  .player .counts { display:flex; gap:14px; color:var(--dim); font-size:13px; margin:8px 0; }
  h4 { margin:8px 0 4px; font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--dim); }
  .cards { display:flex; flex-wrap:wrap; gap:5px; }
  .chip { display:inline-flex; flex-direction:column; border:1px solid var(--line); border-radius:5px;
          padding:4px 7px; cursor:pointer; background:#1b1d24; min-width:88px; }
  .chip.ticked { border-color:#d8a33c; background:#2a2519; }
  .chip.good_stuff { border-left:3px solid var(--met); }
  .chip.bad_stuff { border-left:3px solid var(--red); }
  .chip b { font-weight:600; font-size:12.5px; }
  .chip i { color:var(--dim); font-size:10.5px; font-style:normal; }
  .chip u { text-decoration:none; color:var(--dim); font-size:10.5px; }
  .chip em { color:#d8a33c; font-style:normal; font-size:11px; }
  .empty { color:var(--line); }
  details { margin-top:12px; } summary { cursor:pointer; color:var(--dim); }
  #log { max-height:80vh; overflow:auto; }
  .entry { border-bottom:1px solid var(--line); padding:8px 0; }
  .entry h5 { margin:0 0 3px; font-size:13px; }
  .entry .note { margin:0 0 5px; color:var(--dim); }
  .entry ul { margin:0; padding-left:16px; font-size:13px; }
  .entry li.question { color:#d8a33c; }
  .outcome { font-size:18px; }
</style>

<header>
  <h1>North vs Up — rules core <span style="color:var(--dim);font-weight:400">PROTOTYPE</span></h1>
  <p>Throwaway. It runs the rules in <code>design/rulebook-draft.md</code> to find out whether the state
     model proposed in <code>north-vs-up-rfc.md</code> survives them. Cards come from
     <code>design/cards.yaml</code> — <span class="warn">every number in them is a placeholder.</span>
     Yellow lines in the log are open questions the rules do not answer.</p>
</header>

<div id="tabs"></div>
<main>
  <div>
    <div id="walkthrough"></div>
    <div id="board"></div>
  </div>
  <div id="log"></div>
</main>

<script>
${cards}
</script>
<script>
${bundle}
</script>
`;

const out = join(ROOT, "prototype/rules-core-demo.html");
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
