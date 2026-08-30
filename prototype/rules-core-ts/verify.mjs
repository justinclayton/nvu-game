/* Checks that the built demo actually runs, and that every guided walkthrough
 * gets to its last step without the engine refusing a command.
 *
 *   node prototype/rules-core-ts/verify.mjs
 *
 * The demo is a browser page, so this stubs just enough DOM for the bundle to
 * load, then drives the scenarios in the page's own scope. PROTOTYPE. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, "../rules-core-demo.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length !== 2) throw new Error(`Expected 2 inline scripts, found ${scripts.length}`);

const el = () => ({ innerHTML: "", dataset: {}, classList: { contains: () => false }, closest: () => null });
const sandbox = {
  console,
  document: { getElementById: el, addEventListener() {} },
  window: {},
};
const ctx = createContext(sandbox);

runInContext(scripts[0], ctx); // the generated card list
runInContext(scripts[1], ctx); // the engine, the scenarios and the page

const probe = `
(() => {
  const report = [];
  for (const sc of ALL) {
    let state = sc.setup(content);
    const problems = [];
    let taken = 0;
    for (const step of sc.steps) {
      const cmd = resolveStep(state, step);
      if (!cmd) continue;
      try {
        const [next] = execute(state, cmd);
        state = next;
        taken++;
      } catch (e) {
        problems.push(cmd.type + ": " + e.message);
      }
    }
    report.push({
      id: sc.id,
      steps: sc.steps.length,
      taken,
      problems,
      phase: state.phase,
      red: statusOf(state.red),
      gray: statusOf(state.gray),
      scrapyard: state.scrapyard.length,
    });
  }
  return report;
})()
`;

const report = runInContext(probe, ctx);
let bad = 0;
console.log("built demo loads, and every walkthrough runs:\n");
for (const r of report) {
  const ok = r.problems.length === 0;
  if (!ok) bad++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${r.id.padEnd(20)} ${r.taken}/${r.steps} commands  ` +
      `ends in ${r.phase}  Red ${r.red}  Gray ${r.gray}  scrapyard ${r.scrapyard}` +
      (ok ? "" : `\n       ${r.problems.join("\n       ")}`),
  );
}
console.log(bad === 0 ? "\nall walkthroughs ran\n" : `\n${bad} walkthrough(s) refused\n`);
if (bad > 0) process.exitCode = 1;
