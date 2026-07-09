import { useState } from "react";
import {
  MARKETING_CAMPAIGNS,
  MARKETING_STAFF,
  SNS_POST_PLANS,
  buildMarketingKpi,
} from "@musasabi/ai-company";
import { buildXlsx } from "@musasabi/call-list";
import { saveBinaryFile } from "../../lib/saveFile";
import { SnsPostingWorkflow } from "./SnsPostingWorkflow";
import { MarketingPdcaSection } from "./MarketingPdcaSection";

// マーケティング部ページ(従来画面・コア部署の完成フェーズ)。
// すべてMock(実広告出稿・実SNS投稿なし)。

export function MarketingPage() {
  const kpi = buildMarketingKpi();
  const [exportNote, setExportNote] = useState<string | null>(null);

  async function handleExport(): Promise<void> {
    // キャンペーン効果測定+SNS投稿計画をExcel(.xlsx)で書き出す(経理部と同パターン)。
    const rows: string[][] = [
      ["キャンペーン", "チャネル", "状態", "リード", "CVR(%)"],
      ...MARKETING_CAMPAIGNS.map((c) => [
        c.name,
        c.channel,
        c.status,
        String(c.leads),
        String(c.cvrPercent),
      ]),
      [],
      ["SNS投稿計画(日付)", "テーマ", "状態", "", ""],
      ...SNS_POST_PLANS.map((p) => [p.date, p.theme, p.status, "", ""]),
    ];
    const bytes = buildXlsx(rows, "マーケティング");
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(`musasabi-marketing-${stamp}.xlsx`, bytes, "Excel", ["xlsx"]);
    setExportNote(
      result === "cancelled" ? "書き出しをキャンセルしました。" : "キャンペーン/SNS計画をExcelで書き出しました。",
    );
  }

  const kpiTiles = [
    { label: "配信中キャンペーン", value: `${kpi.activeCampaigns}件` },
    { label: "リード獲得累計", value: `${kpi.totalLeads}件` },
    { label: "平均CVR", value: `${kpi.averageCvrPercent}%` },
    { label: "投稿計画", value: `${kpi.postsPublished}/${kpi.postsPlanned}件` },
  ];
  return (
    <>
      <section aria-label="マーケティングKPI">
        <h3 style={{ marginTop: 0 }}>KPI(Mock)</h3>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版はMock値の表示のみです(実広告出稿・実SNS投稿は行いません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {kpiTiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "10rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="キャンペーン一覧">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>キャンペーン効果測定(Mock)</h3>
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
              {["キャンペーン", "チャネル", "状態", "リード", "CVR"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MARKETING_CAMPAIGNS.map((c) => (
              <tr key={c.name}>
                <td style={cellStyle}>{c.name}</td>
                <td style={cellStyle}>{c.channel}</td>
                <td style={cellStyle}>{c.status}</td>
                <td style={cellStyle}>{c.leads > 0 ? `${c.leads}件` : "—"}</td>
                <td style={cellStyle}>{c.cvrPercent > 0 ? `${c.cvrPercent}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="SNS投稿計画">
        <h3 style={{ marginTop: 0 }}>SNS投稿計画(Mock・実投稿なし)</h3>
        <ul>
          {SNS_POST_PLANS.map((p) => (
            <li key={p.theme}>
              {p.date} — {p.theme} <strong>[{p.status}]</strong>
            </li>
          ))}
        </ul>
        <h4>マーケティング部AI社員(Mock)</h4>
        <ul>
          {MARKETING_STAFF.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <MarketingPdcaSection />
      <SnsPostingWorkflow />
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
