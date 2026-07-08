import { useState } from "react";
import {
  BUSINESS_UNITS,
  BUSINESS_UNIT_ROLES,
  BUSINESS_UNIT_STATUS_LABEL_JA,
  BUSINESS_TEMPLATES,
  GOVERNANCE_NOTES,
  REPORTING_LINE,
  provisionBusinessUnit,
  provisionFromTemplate,
  summarizeFactory,
  type BusinessUnit,
} from "@musasabi/business-factory";

// AI Business Factory(docs/ai-handoff/AI_BUSINESS_FACTORY_DIRECTIVE.md)。
// 標準テンプレートで新規事業ユニットを立ち上げ・運営する(Mock)。初期ターゲットは MEISHI-TUBE。

export function BusinessFactoryPage() {
  const [units, setUnits] = useState<BusinessUnit[]>(() => BUSINESS_UNITS.map((u) => ({ ...u })));
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string>(BUSINESS_UNITS[0]?.id ?? "");
  const summary = summarizeFactory(units);
  const selected = units.find((u) => u.id === selectedId) ?? null;

  function provision() {
    const n = name.trim();
    if (n === "") return;
    const bu = provisionBusinessUnit(n);
    setUnits((prev) => [...prev, bu]);
    setSelectedId(bu.id);
    setName("");
  }

  function provisionTemplate(templateId: string) {
    const bu = provisionFromTemplate(templateId);
    // 既存の同名ユニットがあれば連番を付与(Mock・決定論の範囲で重複回避)。
    const finalBu = units.some((u) => u.id === bu.id)
      ? provisionFromTemplate(templateId, { name: `${bu.name}-${units.length + 1}` })
      : bu;
    setUnits((prev) => [...prev, finalBu]);
    setSelectedId(finalBu.id);
  }

  return (
    <>
      <section aria-label="事業ファクトリー概要">
        <h2>AI Business Factory(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          標準テンプレートで新規事業ユニットを立ち上げ・運営します。各ユニットは AI事業部長 +
          各チーム + AI監査リエゾンで構成し、部門構造・KPI・ワークフロー・Company Brain・
          ナレッジ・レポート・リスク監視・運用データを自動プロビジョニングします(すべて Mock)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="事業ユニット" value={`${summary.totalUnits}`} />
          <StatTile label="稼働中" value={`${summary.operating}`} />
          <StatTile label="構築中" value={`${summary.provisioning}`} />
          <StatTile label="ロール/ユニット" value={`${summary.rolesPerUnit}`} />
        </div>
      </section>

      <section aria-label="事業ユニットテンプレート">
        <h3>事業ユニット標準テンプレート(ロール構成)</h3>
        <ul style={{ columns: 2, maxWidth: "40rem" }}>
          {BUSINESS_UNIT_ROLES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <div style={{ marginTop: "0.5rem" }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="新規事業名(例: CARD-LINK)"
            style={{ width: "16rem" }}
          />{" "}
          <button type="button" onClick={provision}>新規事業ユニットを立ち上げ(Mock)</button>
        </div>
      </section>

      <section aria-label="事業テンプレートカタログ">
        <h3>事業テンプレートカタログ</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          業種テンプレートを選択すると、部門・AI社員・KPIダッシュボード・ワークフロー・必要ドキュメント・
          ダッシュボードカード・リスクチェック・レポートフォーマットを備えた事業ユニットを Mock 生成します。
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.75rem" }}>
          {BUSINESS_TEMPLATES.map((t) => (
            <div key={t.id} className="card" style={{ padding: "0.7rem 0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <strong>{t.name}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.summary}</span>
              <div style={{ fontSize: "0.78rem" }}>
                <div><span style={{ color: "var(--text-muted)" }}>チーム:</span> {t.teams.length}／<span style={{ color: "var(--text-muted)" }}>AI社員:</span> {t.aiEmployees.length}種</div>
                <div><span style={{ color: "var(--text-muted)" }}>KPI例:</span> {t.monthlyKpi.map((k) => k.label).join("・")}</div>
              </div>
              <button
                type="button"
                onClick={() => provisionTemplate(t.id)}
                aria-label={`テンプレートから生成: ${t.name}`}
                style={{ marginTop: "auto" }}
              >
                このテンプレートで事業ユニット生成(Mock)
              </button>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="事業ユニット一覧">
        <h3>事業ユニット</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id)}
              aria-pressed={u.id === selectedId}
              className={u.id === selectedId ? "badge is-active" : "badge"}
              style={{ padding: "0.35rem 0.7rem", cursor: "pointer" }}
            >
              {u.name}({BUSINESS_UNIT_STATUS_LABEL_JA[u.status]})
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <section aria-label={`事業ユニット詳細: ${selected.name}`}>
          <h3>{selected.name} — 自動プロビジョニング結果</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {selected.description}／事業部長: {selected.director}／レポート: {selected.reportsTo}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "0.75rem" }}>
            <Card title="部門構造" items={selected.provisioning.departmentStructure} />
            <Card title="ワークフローテンプレート" items={selected.provisioning.workflowTemplates} />
            <Card title="レポートテンプレート" items={selected.provisioning.reportingTemplates} />
            <Card title="リスク監視" items={selected.provisioning.riskMonitoring} />
            <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
              <strong>KPIダッシュボード</strong>
              <ul style={{ margin: "0.3rem 0 0", listStyle: "none", paddingLeft: 0, fontSize: "0.85rem" }}>
                {selected.provisioning.kpiDashboard.map((k) => (
                  <li key={k.label}><span style={{ color: "var(--text-muted)" }}>{k.label}:</span> <strong>{k.value}</strong></li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
              <strong>運用データ(Mock)</strong>
              <ul style={{ margin: "0.3rem 0 0", listStyle: "none", paddingLeft: 0, fontSize: "0.85rem" }}>
                {selected.provisioning.mockOperatingData.map((k) => (
                  <li key={k.label}><span style={{ color: "var(--text-muted)" }}>{k.label}:</span> <strong>{k.value}</strong></li>
                ))}
              </ul>
            </div>
            <Card title="連携" items={[
              `経営ダッシュボード統合: ${selected.provisioning.executiveDashboardIntegrated ? "済み" : "未"}`,
              selected.provisioning.companyBrainWorkspace,
              selected.provisioning.knowledgeRepository,
            ]} />
            {selected.provisioning.aiEmployees && selected.provisioning.aiEmployees.length > 0 && (
              <Card title="AI社員(Mock)" items={selected.provisioning.aiEmployees} />
            )}
            {selected.provisioning.dashboardCards && selected.provisioning.dashboardCards.length > 0 && (
              <Card title="ダッシュボードカード" items={selected.provisioning.dashboardCards} />
            )}
            {selected.provisioning.requiredDocuments && selected.provisioning.requiredDocuments.length > 0 && (
              <Card title="必要ドキュメント" items={selected.provisioning.requiredDocuments} />
            )}
            {selected.provisioning.reportingFormat && (
              <Card title="レポートフォーマット" items={[selected.provisioning.reportingFormat]} />
            )}
          </div>
        </section>
      )}

      <section aria-label="ガバナンス">
        <h3>ガバナンス</h3>
        <p style={{ fontSize: "0.85rem" }}>レポートライン: <strong>{REPORTING_LINE}</strong></p>
        <ul>
          {GOVERNANCE_NOTES.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </section>
    </>
  );
}

function Card({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
      <strong>{title}</strong>
      <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
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
