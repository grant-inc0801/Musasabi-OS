import {
  AI_COMBINATION_CANDIDATES,
  AI_SERVICE_EVALUATIONS,
  AI_SERVICE_ITEMS,
  AI_TECHNOLOGY_ITEMS,
  HANDOFF_PROPOSALS,
  MARKET_RESEARCH_STAFF,
  TECHNOLOGY_ADOPTIONS,
  buildMarketResearchKpi,
} from "@musasabi/ai-company";
import { ResearchReportsSection } from "./ResearchReportsSection";
import { RssSourcesSection } from "./RssSourcesSection";

// 市場調査部ページ(従来画面)。AI最新情報・技術評価・組み合わせ研究・
// 部署間連携/CEO提案(D-20260706-009)。すべてMock(実Web巡回・実API接続なし)。

export function MarketResearchPage() {
  const kpi = buildMarketResearchKpi();
  const kpiTiles = [
    { label: "本日収集", value: kpi.collectedToday },
    { label: "新サービス発見", value: kpi.newServicesFound },
    { label: "技術評価", value: kpi.evaluations },
    { label: "開発部連携", value: kpi.devHandoffs },
    { label: "企画部連携", value: kpi.planningHandoffs },
    { label: "CEO提案待ち", value: kpi.ceoPending },
    { label: "採用候補", value: kpi.adoptionCandidates },
  ];
  return (
    <>
      <RssSourcesSection />
      <section aria-label="市場調査KPI">
        <h3 style={{ marginTop: 0 }}>KPI(Mock)</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {kpiTiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{t.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="AI最新情報">
        <h3 style={{ marginTop: 0 }}>AI最新情報(収集Mock・実Web巡回なし)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["情報源", "カテゴリ", "タイトル"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AI_TECHNOLOGY_ITEMS.map((i) => (
              <tr key={i.title}>
                <td style={cellStyle}>{i.source}</td>
                <td style={cellStyle}>{i.category}</td>
                <td style={cellStyle}>{i.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="新サービスと技術評価">
        <h3 style={{ marginTop: 0 }}>新サービス一覧・技術評価・組み合わせ(Mock)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0 0 0.6rem" }}>
          ■新サービス名 / ▽技術評価内容 / ・組み合わせ内容 のフォーマットで統一表示します。
        </p>
        <div className="mr-service">
          {AI_SERVICE_ITEMS.map((s) => (
            <div key={s.name} style={{ margin: "0 0 0.5rem" }}>
              <div className="mr-service-name">■ {s.name}</div>
              <div className="mr-service-sub">
                {s.provider} — {s.summary} → {s.relatedDept}
              </div>
            </div>
          ))}
          {AI_SERVICE_EVALUATIONS.map((e) => (
            <div key={e.name} className="mr-eval">
              ▽ {e.name}: 精度{e.accuracy} / コスト{e.cost} / 日本語{e.japanese} / 商用利用
              {e.commercialUse} / ライセンス{e.license} / 推奨度<strong>{e.recommendation}</strong>
            </div>
          ))}
          {AI_COMBINATION_CANDIDATES.map((c) => (
            <div key={c.combo} className="mr-combo">
              ・ {c.combo} → <strong>{c.outcome}</strong>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="連携と提案">
        <h3 style={{ marginTop: 0 }}>部署間連携・CEO提案(Mock)</h3>
        <ul>
          {HANDOFF_PROPOSALS.map((p) => (
            <li key={p.title}>
              [{p.target}] {p.title} — <strong>{p.status}</strong>
            </li>
          ))}
        </ul>
        <h4>採用済み / 保留</h4>
        <ul>
          {TECHNOLOGY_ADOPTIONS.map((t) => (
            <li key={t.name}>
              {t.name} — {t.status}
            </li>
          ))}
        </ul>
        <h4>AI社員(Mock)</h4>
        <ul>
          {MARKET_RESEARCH_STAFF.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <ResearchReportsSection />
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
