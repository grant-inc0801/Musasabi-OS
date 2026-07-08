import { useState } from "react";
import {
  HIRING_PLANS,
  HR_MEMBER_RECORDS,
  HR_STAFF,
  buildHrKpi,
} from "@musasabi/ai-company";
import { buildXlsx } from "@musasabi/call-list";
import { saveBinaryFile } from "../../lib/saveFile";

// 人事部ページ(従来画面・コア部署の完成フェーズ)。
// すべてMock(実採用活動・実人事データ連携なし)。

export function HrPage() {
  const kpi = buildHrKpi();
  const [exportNote, setExportNote] = useState<string | null>(null);

  async function handleExport(): Promise<void> {
    // AI社員の稼働・評価+採用計画をExcel(.xlsx)で書き出す(経理部と同パターン)。
    const rows: string[][] = [
      ["AI社員", "部署", "稼働率(%)", "評価", "メモ"],
      ...HR_MEMBER_RECORDS.map((r) => [
        r.name,
        r.dept,
        String(r.utilizationPercent),
        r.evaluation,
        r.note,
      ]),
      [],
      ["採用計画", "部署", "人数", "状態", ""],
      ...HIRING_PLANS.map((p) => [p.role, p.dept, String(p.headcount), p.status, ""]),
    ];
    const bytes = buildXlsx(rows, "人事");
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(`musasabi-hr-${stamp}.xlsx`, bytes, "Excel", ["xlsx"]);
    setExportNote(
      result === "cancelled" ? "書き出しをキャンセルしました。" : "稼働・評価/採用計画をExcelで書き出しました。",
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>AI社員の稼働・評価(Mock)</h3>
          <button type="button" onClick={() => void handleExport()}>
            Excel出力(.xlsx)
          </button>
          {exportNote && (
            <span style={{ color: "var(--ok)", fontSize: "0.85rem" }}>{exportNote}</span>
          )}
        </div>
        <table style={{ borderCollapse: "collapse", marginTop: "0.6rem" }}>
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
