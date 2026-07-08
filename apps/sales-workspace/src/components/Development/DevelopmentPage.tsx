import { useMemo } from "react";
import {
  DEV_PROJECTS,
  DEV_PROJECT_STATUS_COLOR,
  DEV_STAFF,
  buildDevKpi,
} from "@musasabi/ai-company";
import { loadRoutines } from "../../lib/automationStorage";

// システム開発部ページ(従来画面・開発部ページ充実フェーズ)。
// 開発案件はMock。自動化ツール一覧は Automation で保存した実データ
// (localStorage)を表示する。実デプロイ・実外部API接続なし。

export function DevelopmentPage({
  onNavigateToCallList,
  onNavigateToAutomation,
}: {
  onNavigateToCallList: () => void;
  onNavigateToAutomation: () => void;
}) {
  const kpi = buildDevKpi(DEV_PROJECTS);
  const routines = useMemo(() => loadRoutines(), []);
  const tiles = [
    { label: "案件数", value: `${kpi.totalProjects}件` },
    { label: "開発・テスト中", value: `${kpi.inProgress}件` },
    { label: "リリース済み", value: `${kpi.released}件` },
    { label: "エラー対応", value: `${kpi.errorCount}件` },
    { label: "平均進捗", value: `${kpi.averageProgressPercent}%` },
  ];

  return (
    <>
      <section aria-label="開発KPI">
        <h3 style={{ marginTop: 0 }}>開発状況(Mock)</h3>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版の開発案件はMock表示です(実デプロイ・実外部API接続は行いません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="開発案件一覧">
        <h3 style={{ marginTop: 0 }}>開発案件ボード(Mock)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "案件", "依頼元", "状態", "進捗", "メモ"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEV_PROJECTS.map((p) => (
              <tr key={p.id}>
                <td style={cellStyle}>{p.id}</td>
                <td style={cellStyle}>{p.name}</td>
                <td style={cellStyle}>{p.requester}</td>
                <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                  <span
                    className="dept-lamp"
                    style={{
                      background: DEV_PROJECT_STATUS_COLOR[p.status],
                      boxShadow: `0 0 6px ${DEV_PROJECT_STATUS_COLOR[p.status]}`,
                      marginRight: 6,
                    }}
                  />
                  {p.status}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{p.progressPercent}%</td>
                <td style={cellStyle}>{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          「エラー対応」案件はコマンドセンターの開発部エラー表示(原因/対処)と同じ内容です。
        </p>
      </section>

      <section aria-label="自動化ツール">
        <h3 style={{ marginTop: 0 }}>開発済み自動化ツール(実データ)</h3>
        {routines.length > 0 ? (
          <ul>
            {routines.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — 手順{r.steps.length}件・実行{r.runCount}回・作成{" "}
                {new Date(r.createdAtMs).toLocaleDateString("ja-JP")}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            保存済みの自動化ツールはまだありません。Automation(操作記録)またはミニパネルの
            業務支援 &gt; Development で操作を記録して保存できます。
          </p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" onClick={onNavigateToAutomation}>
            Automation(操作記録)を開く
          </button>
          <button type="button" onClick={onNavigateToCallList}>
            架電リスト制作課を開く
          </button>
        </div>
      </section>

      <section aria-label="開発部AI社員">
        <h4>開発部AI社員(Mock)</h4>
        <ul>
          {DEV_STAFF.map((n) => (
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
  verticalAlign: "top",
};
