import {
  MOCK_METRICS,
  MOCK_INCIDENTS,
  SLO_STATUS_LABEL_JA,
  SEVERITY_LABEL_JA,
  INCIDENT_STATUS_LABEL_JA,
  RUNBOOKS,
  evaluateSlo,
  buildOpsSummary,
  getRunbook,
  type SloStatus,
} from "@musasabi/ops-monitor";

// Phase 6: Operational Excellence(D-20260708-007)。監視ダッシュボード・SLO・
// インシデント管理・復旧ランブック(Mock・実監視には接続しない)。

const STATUS_COLOR: Record<SloStatus, string> = {
  healthy: "#22C55E",
  at_risk: "#FACC15",
  breached: "#EF4444",
};

export function OpsMonitorPage() {
  const summary = buildOpsSummary(MOCK_METRICS, MOCK_INCIDENTS);

  return (
    <>
      <section aria-label="運用サマリー">
        <h2>運用モニタリング(Phase 6・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          本番運用の監視・SLO・インシデント・復旧手順を扱います(すべて Mock。実監視データには接続しません)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="監視サービス" value={`${summary.services}`} />
          <StatTile label="正常" value={`${summary.healthy}`} />
          <StatTile label="注意" value={`${summary.atRisk}`} />
          <StatTile label="違反" value={`${summary.breached}`} />
          <StatTile label="未解決インシデント" value={`${summary.openIncidents}`} />
          <StatTile label="平均稼働率" value={`${summary.avgUptimePercent}%`} />
        </div>
      </section>

      <section aria-label="サービスSLO">
        <h3>サービス SLO</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["サービス", "稼働率", "エラー率", "p95", "SLO状態"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_METRICS.map((m) => {
              const st = evaluateSlo(m);
              return (
                <tr key={m.service}>
                  <td style={cell}>{m.service}</td>
                  <td style={cell}>{m.uptimePercent}%</td>
                  <td style={cell}>{m.errorRatePercent}%</td>
                  <td style={cell}>{m.p95LatencyMs}ms</td>
                  <td style={cell}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[st], display: "inline-block" }} />
                      {SLO_STATUS_LABEL_JA[st]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section aria-label="インシデント">
        <h3>インシデント</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {MOCK_INCIDENTS.map((i) => {
            const rb = i.runbookId ? getRunbook(i.runbookId) : undefined;
            return (
              <li key={i.id} style={{ margin: "0.35rem 0" }}>
                <strong>[{SEVERITY_LABEL_JA[i.severity]}]</strong> {i.title}（{i.service}）— {INCIDENT_STATUS_LABEL_JA[i.status]}
                {rb && <span style={{ color: "var(--text-muted)" }}>／復旧: {rb.title}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="復旧ランブック">
        <h3>復旧ランブック</h3>
        {RUNBOOKS.map((rb) => (
          <div key={rb.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{rb.title}</strong>
            <ol style={{ margin: "0.25rem 0 0" }}>
              {rb.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
        ))}
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
