/* PROTOTYPE — throwaway. Variant C, "Board": everything on one screen.
 *
 * No tabs and no first screen: status, reviews and data are three panels
 * across the top and the table is a wide panel along the bottom, cropped,
 * with a button that expands it to fill the window. A flagged run expands it
 * in replay mode. Nothing is the host; the table is one panel among four.
 */

import { useState } from "react";

import { AGENTS, ANOMALIES, BUILD, CHAIN_RUNS, ISSUES, PRS, REPORTS } from "./data";
import type { VariantProps } from "./index";
import { AnomalyRow, ChainRunRow, Dot, Headline, IssueRow, PrCard } from "./parts";
import { TableHost } from "./TableHost";

export function VariantC(props: VariantProps) {
  const [expanded, setExpanded] = useState(false);
  const latest = CHAIN_RUNS[0];

  return (
    <div className="op-c">
      <header className="op-c__head">
        <span className="op-brand">North vs Up</span>
        <span className="op-brand__sub">the one place</span>
        <span className="op-muted">
          main {BUILD.main} · rules {BUILD.rules} · cards {BUILD.cards}
        </span>
        <span className="op-actions">
          <button type="button" className="button button--small">
            Run the chain here
          </button>
          <button type="button" className="button button--small">
            Open a playtest issue
          </button>
        </span>
      </header>

      <div className="op-c__grid">
        <section className="op-panel op-c__status">
          <h2>{latest ? <Dot light={latest.light} /> : null} Status</h2>
          {CHAIN_RUNS.slice(0, 3).map((r) => (
            <ChainRunRow key={r.id} run={r} compact />
          ))}
          <h3>Agents</h3>
          {AGENTS.map((a) => (
            <article key={a.label + a.subject} className="op-agent op-agent--stack">
              <strong>{a.label}</strong>
              <span className="op-muted">
                {a.subject} · {a.state}
              </span>
            </article>
          ))}
        </section>

        <section className="op-panel op-c__reviews">
          <h2>Reviews</h2>
          {PRS.map((pr) => (
            <PrCard key={pr.number} pr={pr} onRule={() => undefined} />
          ))}
          <h3>Rulings owed</h3>
          {ISSUES.filter((i) => i.kind === "needs-human").map((i) => (
            <IssueRow key={i.number} issue={i} onRule={() => undefined} />
          ))}
          <h3>Ideas from agents</h3>
          {ISSUES.filter((i) => i.kind === "idea").map((i) => (
            <IssueRow key={i.number} issue={i} onRule={() => undefined} />
          ))}
        </section>

        <section className="op-panel op-c__data">
          <h2>Data</h2>
          {REPORTS[0] ? <Headline report={REPORTS[0]} /> : null}
          <h3>Anomalies</h3>
          {ANOMALIES.map((a) => (
            <AnomalyRow
              key={a.kind + a.detail}
              anomaly={a}
              onOpen={(run) => {
                props.openFlagged(run);
                setExpanded(true);
              }}
            />
          ))}
        </section>

        <section className={`op-panel op-c__table${expanded ? " is-expanded" : ""}`}>
          <h2>
            Playtesting
            <span className="op-actions">
              <button
                type="button"
                className="button button--small"
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Back to the board" : "Sit down at the table"}
              </button>
            </span>
          </h2>
          <div className="op-c__window">
            <TableHost {...props} />
          </div>
        </section>
      </div>
    </div>
  );
}
