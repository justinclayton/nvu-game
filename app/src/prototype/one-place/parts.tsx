/* PROTOTYPE — throwaway. The pieces every variant lays out differently: a
 * stage row, a PR, an issue, an anomaly, a report's headline numbers. Each
 * variant owns its layout and hierarchy; only these leaves are shared.
 */

import {
  type Anomaly,
  type ChainRun,
  type FlaggedRun,
  type Issue,
  type Light,
  type Pr,
  type Report,
} from "./data";

export function Dot({ light }: { readonly light: Light }) {
  return <span className={`op-dot op-dot--${light}`} aria-label={light} />;
}

export function Stages({ run, compact }: { readonly run: ChainRun; readonly compact?: boolean }) {
  return (
    <ol className={`op-stages${compact ? " op-stages--compact" : ""}`}>
      {run.stages.map((s) => (
        <li key={s.name} className={`op-stage op-stage--${s.light}`} title={s.detail}>
          <Dot light={s.light} />
          <span className="op-stage__name">{s.name}</span>
          {!compact && s.detail ? <span className="op-stage__detail">{s.detail}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function ChainRunRow({
  run,
  compact,
}: {
  readonly run: ChainRun;
  readonly compact?: boolean;
}) {
  return (
    <article className={`op-run op-run--${run.light}`}>
      <header className="op-run__head">
        <Dot light={run.light} />
        <strong>#{run.id}</strong>
        <span>{run.event}</span>
        <code>{run.ref}</code>
        <span className="op-run__title">{run.title}</span>
        <span className="op-muted">{run.when}</span>
      </header>
      <Stages run={run} compact={compact ?? false} />
    </article>
  );
}

export function PrCard({
  pr,
  onRule,
}: {
  readonly pr: Pr;
  readonly onRule?: (verb: string) => void;
}) {
  return (
    <article className={`op-pr op-pr--${pr.kind}`}>
      <header className="op-pr__head">
        <Dot light={pr.checks} />
        <strong>#{pr.number}</strong>
        <span className="op-tag">{pr.kind}</span>
        <span className="op-tag op-tag--who">{pr.author}</span>
        {pr.stackedOn ? <span className="op-muted">stacked on #{pr.stackedOn}</span> : null}
      </header>
      <h4>{pr.title}</h4>
      {pr.delta ? (
        <table className="op-delta">
          <thead>
            <tr>
              <th />
              <th>baseline</th>
              <th>changed</th>
            </tr>
          </thead>
          <tbody>
            {pr.delta.map((d) => (
              <tr key={d.metric}>
                <td>{d.metric}</td>
                <td>{d.baseline}</td>
                <td>{d.changed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <footer className="op-pr__foot">
        <span className="op-muted">waiting for {pr.waitingFor}</span>
        {onRule ? (
          <span className="op-actions">
            <button type="button" className="button button--small" onClick={() => onRule("merge")}>
              Merge
            </button>
            <button type="button" className="button button--small" onClick={() => onRule("close")}>
              Close
            </button>
          </span>
        ) : null}
      </footer>
    </article>
  );
}

export function IssueRow({
  issue,
  onRule,
}: {
  readonly issue: Issue;
  readonly onRule?: (verb: string) => void;
}) {
  return (
    <article className={`op-issue op-issue--${issue.kind}`}>
      <span className="op-tag">{issue.kind === "idea" ? "gdlc:idea" : "needs-human"}</span>
      <strong>#{issue.number}</strong>
      <span className="op-issue__title">{issue.title}</span>
      <span className="op-muted">
        {issue.from} · {issue.age}
      </span>
      {onRule ? (
        <span className="op-actions">
          {issue.kind === "idea" ? (
            <>
              <button
                type="button"
                className="button button--small"
                onClick={() => onRule("propose")}
              >
                Make it a proposal
              </button>
              <button
                type="button"
                className="button button--small"
                onClick={() => onRule("decline")}
              >
                Decline
              </button>
            </>
          ) : (
            <button type="button" className="button button--small" onClick={() => onRule("answer")}>
              Answer
            </button>
          )}
        </span>
      ) : null}
    </article>
  );
}

export function Headline({ report }: { readonly report: Report }) {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const diff = (report.winRate - report.baselineWinRate) * 100;
  return (
    <div className="op-headline">
      <div className="op-stat">
        <span className="op-stat__label">win rate</span>
        <span className="op-stat__value">{pct(report.winRate)}</span>
        <span className="op-muted">
          {diff === 0 ? "same as baseline" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} vs baseline`}
        </span>
      </div>
      <div className="op-stat">
        <span className="op-stat__label">seeds</span>
        <span className="op-stat__value">{report.seeds.toLocaleString()}</span>
        <span className="op-muted">
          run #{report.run} · {report.ref}
        </span>
      </div>
      <div className="op-stat op-stat--bars">
        <span className="op-stat__label">floor reached</span>
        {report.floors.map((f) => (
          <div key={f.floor} className="op-bar">
            <span>floor {f.floor}</span>
            <i style={{ width: `${(f.runs / report.seeds) * 100}%` }} />
            <span className="op-muted">{f.runs}</span>
          </div>
        ))}
      </div>
      <div className="op-stat op-stat--bars">
        <span className="op-stat__label">how runs end</span>
        {report.endReasons.map((r) => (
          <div key={r.reason} className="op-bar">
            <span>{r.reason}</span>
            <i style={{ width: `${(r.runs / report.seeds) * 100}%` }} />
            <span className="op-muted">{r.runs}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnomalyRow({
  anomaly,
  onOpen,
}: {
  readonly anomaly: Anomaly;
  readonly onOpen: (run: FlaggedRun) => void;
}) {
  const run = anomaly.run;
  return (
    <article className="op-anomaly">
      <span className="op-tag op-tag--anomaly">{anomaly.kind}</span>
      <span className="op-anomaly__detail">{anomaly.detail}</span>
      {run ? (
        run.file ? (
          <button type="button" className="button button--small" onClick={() => onOpen(run)}>
            Open seed {run.seed} in the replay inspector
          </button>
        ) : (
          <span className="op-muted">seed {run.seed} · run file on the orphan branch</span>
        )
      ) : null}
    </article>
  );
}
