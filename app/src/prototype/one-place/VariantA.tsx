/* PROTOTYPE — throwaway. Variant A, "Workbench": a new app around the table.
 *
 * A top bar with four tabs. Status is the first screen. The table is the
 * fourth tab, full width, exactly as it is today. A flagged run switches to
 * the table tab in replay mode. The something larger is the host; the table
 * is a tab of it.
 */

import { useState } from "react";

import { AGENTS, ANOMALIES, BUILD, CHAIN_RUNS, ISSUES, NEXT_SCHEDULED, PRS, REPORTS } from "./data";
import type { VariantProps } from "./index";
import { AnomalyRow, ChainRunRow, Dot, Headline, IssueRow, PrCard } from "./parts";
import { TableHost } from "./TableHost";

type Tab = "status" | "reviews" | "data" | "table";

const TABS: readonly { readonly key: Tab; readonly label: string; readonly badge?: number }[] = [
  { key: "status", label: "Status" },
  { key: "reviews", label: "Reviews", badge: PRS.length + ISSUES.length },
  { key: "data", label: "Data", badge: ANOMALIES.length },
  { key: "table", label: "Table" },
];

export function VariantA(props: VariantProps) {
  const [tab, setTab] = useState<Tab>("status");
  const latest = CHAIN_RUNS.find((r) => r.event === "push to main") ?? CHAIN_RUNS[0];

  return (
    <div className="op-a">
      <nav className="op-a__nav">
        <span className="op-brand">North vs Up</span>
        <span className="op-brand__sub">workbench</span>
        <ul className="op-tabs">
          {TABS.map((t) => (
            <li key={t.key}>
              <button
                type="button"
                className={`op-tab${tab === t.key ? " is-active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.badge ? <span className="op-badge">{t.badge}</span> : null}
              </button>
            </li>
          ))}
        </ul>
        <span className="op-a__chain">
          {latest ? <Dot light={latest.light} /> : null}
          main {BUILD.main} · rules {BUILD.rules} · {latest?.when}
        </span>
        <span className="op-actions">
          <button type="button" className="button button--small">
            Run the chain here
          </button>
          <button type="button" className="button button--small">
            Open a playtest issue
          </button>
        </span>
      </nav>

      {tab === "status" ? (
        <main className="op-a__main op-a__status">
          <section className="op-panel">
            <h2>The chain</h2>
            {CHAIN_RUNS.map((r) => (
              <ChainRunRow key={r.id} run={r} />
            ))}
          </section>
          <section className="op-panel">
            <h2>Agents</h2>
            {AGENTS.map((a) => (
              <article key={a.label + a.subject} className="op-agent">
                <span className="op-tag">{a.where}</span>
                <strong>{a.label}</strong>
                <span>{a.subject}</span>
                <span className="op-muted">
                  {a.state}
                  {a.since ? ` · ${a.since}` : ""}
                </span>
              </article>
            ))}
            <p className="op-muted">{NEXT_SCHEDULED}</p>
          </section>
        </main>
      ) : null}

      {tab === "reviews" ? (
        <main className="op-a__main op-a__reviews">
          <section className="op-panel">
            <h2>Pull requests</h2>
            {PRS.map((pr) => (
              <PrCard key={pr.number} pr={pr} onRule={() => undefined} />
            ))}
          </section>
          <div className="op-a__reviews-side">
            <section className="op-panel">
              <h2>Rulings owed</h2>
              {ISSUES.filter((i) => i.kind === "needs-human").map((i) => (
                <IssueRow key={i.number} issue={i} onRule={() => undefined} />
              ))}
            </section>
            <section className="op-panel op-panel--ideas">
              <h2>Ideas from agents</h2>
              <p className="op-muted">
                Filed as gdlc:idea. Nothing happens to a card until you say so.
              </p>
              {ISSUES.filter((i) => i.kind === "idea").map((i) => (
                <IssueRow key={i.number} issue={i} onRule={() => undefined} />
              ))}
            </section>
          </div>
        </main>
      ) : null}

      {tab === "data" ? (
        <main className="op-a__main op-a__data">
          <section className="op-panel">
            <h2>Latest report</h2>
            {REPORTS[0] ? <Headline report={REPORTS[0]} /> : null}
            <p className="op-muted">
              Earlier:{" "}
              {REPORTS.slice(1)
                .map((r) => `#${r.run} (${r.when})`)
                .join(", ")}
              . Bulk output on the orphan branch; the summary is committed on main.
            </p>
          </section>
          <section className="op-panel">
            <h2>Anomalies</h2>
            {ANOMALIES.map((a) => (
              <AnomalyRow
                key={a.kind + a.detail}
                anomaly={a}
                onOpen={(run) => {
                  props.openFlagged(run);
                  setTab("table");
                }}
              />
            ))}
          </section>
        </main>
      ) : null}

      {tab === "table" ? (
        <main className="op-a__main op-a__table">
          <TableHost {...props} />
        </main>
      ) : null}
    </div>
  );
}
