import {
  HIRING_PLANS,
  HR_MEMBER_RECORDS,
  HR_STAFF,
  buildHrKpi,
} from "@musasabi/ai-company";

// 人事部ページ(従来画面・コア部署の完成フェーズ)。
// すべてMock(実採用活動・実人事データ連携なし)。

export function HrPage() {
  const kpi = buildHrKpi();
  const tiles = [
    { label: "平均稼働率", value: `${kpi.averageUtilizationPercent}%` },
    { label: "S/A評価", value: `${kpi.topEvaluations}人` },
    { label: "採用計画", value: `${kpi.hiringPlanned}人` },
    { label: "承認待ち", value: `${kpi.hiringPendingApproval}件` },
  ];
  return (
    <>
      <section aria-label="人事KPI">
        <h3 style={{ marginTop: 0 }}>KPI(Mock)</h3>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版はMock値の表示のみです(実採用活動・実人事データ連携は行いません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "9rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="AI社員の稼働と評価">
        <h3 style={{ marginTop: 0 }}>AI社員の稼働・評価(Mock)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["AI社員", "部署", "稼働率", "評価", "メモ"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HR_MEMBER_RECORDS.map((r) => (
              <tr key={r.name}>
                <td style={cellStyle}>{r.name}</td>
                <td style={cellStyle}>{r.dept}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{r.utilizationPercent}%</td>
                <td style={cellStyle}>
                  <strong>{r.evaluation}</strong>
                </td>
                <td style={cellStyle}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="採用計画">
        <h3 style={{ marginTop: 0 }}>採用計画(Mock・実採用なし)</h3>
        <ul>
          {HIRING_PLANS.map((p) => (
            <li key={p.role}>
              {p.dept} — {p.role} {p.headcount}人 <strong>[{p.status}]</strong>
            </li>
          ))}
        </ul>
        <h4>人事部AI社員(Mock)</h4>
        <ul>
          {HR_STAFF.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
