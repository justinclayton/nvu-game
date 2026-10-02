/* PROTOTYPE — throwaway. Variant B, "Table first": the existing table grown.
 *
 * The table is the whole screen, as today. Above it a one-line strip says
 * what the chain and agents are doing and what is waiting. Each word on the
 * strip opens a drawer on the right with that area; one drawer at a time. A
 * flagged run replaces the live table with the replay. The table is the
 * host; the something larger is a panel of it.
 */

import { useState } from "react";

import { AGENTS, ANOMALIES, BUILD, CHAIN_RUNS, ISSUES, NEXT_SCHEDULED, PRS, REPORTS } from "./data";
import type { VariantProps } from "./index";
import { AnomalyRow, ChainRunRow, Dot, Headline, IssueRow, PrCard } from "./parts";
import { TableHost } from "./TableHost";

type Drawer = "status" | "reviews" | "data" | null;

export function VariantB(props: VariantProps) {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const toggle = (d: Drawer) => setDrawer((cur) => (cur === d ? null : d));
  const latest = CHAIN_RUNS[0];
  const running = CHAIN_RUNS.filter((r) => r.light === "running").length;
  const red = CHAIN_RUNS.filter((r) => r.light === "red").length;
  const ideas = ISSUES.filter((i) => i.kind === "idea").length;

  return (
    <div className={`op-b${drawer ? " has-drawer" : ""}`}>
      <div className="op-b__strip">
        <button
          type="button"
          className={`op-strip__item${drawer === "status" ? " is-active" : ""}`}
          onClick={() => toggle("status")}
        >
          {latest ? <Dot light={latest.light} /> : null}
          chain: {running} running, {red} red · {AGENTS.length} agents
        </button>
        <button
          type="button"
          className={`op-strip__item${drawer === "reviews" ? " is-active" : ""}`}
          onClick={() => toggle("reviews")}
        >
          <Dot light="queued" />
          {PRS.length} PRs · {ISSUES.length - ideas} rulings · {ideas} ideas
        </button>
        <button
          type="button"
          className={`op-strip__item${drawer === "data" ? " is-active" : ""}`}
          onClick={() => toggle("data")}
        >
          <Dot light="red" />
          {ANOMALIES.length} anomalies · win rate{" "}
          {REPORTS[0] ? `${(REPORTS[0].winRate * 100).toFixed(1)}%` : ""}
        </button>
        <span className="op-strip__build op-muted">
          main {BUILD.main} · rules {BUILD.rules}
        </span>
      </div>

      <div className="op-b__body">
        <TableHost {...props} />

        {drawer ? (
          <aside className="op-b__drawer">
            <header className="op-b__drawerhead">
              <h2>{drawer === "status" ? "Status" : drawer === "reviews" ? "Reviews" : "Data"}</h2>
              <button
                type="button"
                className="button button--small"
                onClick={() => setDrawer(null)}
              >
                Close
              </button>
            </header>

            {drawer === "status" ? (
              <>
                {CHAIN_RUNS.map((r) => (
                  <ChainRunRow key={r.id} run={r} compact />
                ))}
                <h3>Agents</h3>
                {AGENTS.map((a) => (
                  <article key={a.label + a.subject} className="op-agent op-agent--stack">
                    <strong>{a.label}</strong>
                    <span>{a.subject}</span>
                    <span className="op-muted">
                      {a.where} · {a.state}
                      {a.since ? ` · ${a.since}` : ""}
                    </span>
                  </article>
                ))}
                <p className="op-muted">{NEXT_SCHEDULED}</p>
                <p className="op-actions">
                  <button type="button" className="button button--small">
                    Run the chain here
                  </button>
                  <button type="button" className="button button--small">
                    Open a playtest issue
                  </button>
                </p>
              </>
            ) : null}

            {drawer === "reviews" ? (
              <>
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
              </>
            ) : null}

            {drawer === "data" ? (
              <>
                {REPORTS[0] ? <Headline report={REPORTS[0]} /> : null}
                <h3>Anomalies</h3>
                {ANOMALIES.map((a) => (
                  <AnomalyRow key={a.kind + a.detail} anomaly={a} onOpen={props.openFlagged} />
                ))}
              </>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
