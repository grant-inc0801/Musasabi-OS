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

// 市場調査部の詳細パネル(D-20260706-009)。すべてMockデータ
// (実Web巡回・実API接続はしない)。

export function MarketResearchDetail() {
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
      <div className="detail-block">
        <strong>KPI(Mock)</strong>
        <div className="detail-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {kpiTiles.map((t) => (
            <div key={t.label}>
              <span>{t.label}</span>
              <b>{t.value}件</b>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-block">
        <strong>AI最新情報(収集Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {AI_TECHNOLOGY_ITEMS.map((item) => (
            <li key={item.title}>
              [{item.source}/{item.category}] {item.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>新サービス一覧(Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {AI_SERVICE_ITEMS.map((item) => (
            <li key={item.name}>
              {item.name}({item.provider})— {item.summary} → {item.relatedDept}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>技術評価一覧(Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {AI_SERVICE_EVALUATIONS.map((e) => (
            <li key={e.name}>
              {e.name} — 精度{e.accuracy}/コスト{e.cost}/日本語{e.japanese}/商用{e.commercialUse}/
              {e.license} → <b>{e.recommendation}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>AI組み合わせ候補(研究Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {AI_COMBINATION_CANDIDATES.map((c) => (
            <li key={c.combo}>
              {c.combo} → {c.outcome}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>部署間連携・CEO提案(Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {HANDOFF_PROPOSALS.map((p) => (
            <li key={p.title}>
              [{p.target}] {p.title} — {p.status}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>採用済み / 保留</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {TECHNOLOGY_ADOPTIONS.map((t) => (
            <li key={t.name}>
              {t.name} — {t.status}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>AI社員(Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {MARKET_RESEARCH_STAFF.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
