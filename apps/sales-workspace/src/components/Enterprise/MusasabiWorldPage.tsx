import { useMemo, useState } from "react";
import {
  BUSINESS_TEMPLATES,
  FIRST_USE_CASE_TEMPLATE_IDS,
  WORLD_GOVERNANCE_NOTES,
  generateCompany,
  summarizeCompanyJa,
  summarizeWorld,
  type GeneratedCompany,
} from "@musasabi/musasabi-world";

// Musasabi World(docs/ai-handoff/MUSASABI_WORLD_DIRECTIVE.md)。
// 1つの事業アイデア/テンプレートから AI 会社ワークスペースを Mock 生成するウィザード。
// 生成組織プレビュー→KPI/ワークフロープレビュー→起動確認(Mock)→生成会社ダッシュボード。
// 実アカウント作成・課金・外部接続・secrets なし。生成会社は localStorage に保持(Mock)。

const STORAGE_KEY = "musasabi.world.companies";

function loadCompanies(): GeneratedCompany[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GeneratedCompany[]) : [];
  } catch {
    return [];
  }
}

function saveCompanies(companies: readonly GeneratedCompany[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch {
    // 保持失敗は致命的ではない(Mock)。
  }
}

export function MusasabiWorldPage() {
  const [companies, setCompanies] = useState<GeneratedCompany[]>(() => loadCompanies());
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("auto");
  const [draft, setDraft] = useState<GeneratedCompany | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  const summary = summarizeWorld(companies);
  const selected = companies.find((c) => c.id === selectedId) ?? null;

  function preview() {
    const company = generateCompany({
      templateId: templateId === "auto" ? undefined : templateId,
      idea,
      name,
    });
    setDraft(company);
  }

  function launch() {
    if (!draft) return;
    setCompanies((prev) => {
      // 同IDは上書き(決定論の再生成に対応)。
      const next = [...prev.filter((c) => c.id !== draft.id), draft];
      saveCompanies(next);
      return next;
    });
    setSelectedId(draft.id);
    setDraft(null);
    setIdea("");
    setName("");
    setTemplateId("auto");
  }

  function quickCreate(tid: string) {
    const company = generateCompany({ templateId: tid });
    setCompanies((prev) => {
      const next = [...prev.filter((c) => c.id !== company.id), company];
      saveCompanies(next);
      return next;
    });
    setSelectedId(company.id);
  }

  function removeCompany(id: string) {
    setCompanies((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCompanies(next);
      return next;
    });
    if (selectedId === id) setSelectedId("");
  }

  const firstUseCases = useMemo(
    () => FIRST_USE_CASE_TEMPLATE_IDS.map((id) => BUSINESS_TEMPLATES.find((t) => t.id === id)).filter(Boolean),
    [],
  );

  return (
    <>
      <section aria-label="Musasabi World 概要">
        <h2>Musasabi World — AI会社ジェネレーター(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
          1つの事業アイデア、またはテンプレートから AI 会社ワークスペースを生成します。AI CEO・役員・
          事業ユニット・部門マップ・AI社員名簿・KPI・ワークフロー・Company Brain・Musasabi DNA・
          Knowledge Vault・レポート・監査モニタリング・Mock運用データを自動生成します(すべて Mock)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="生成済み会社" value={`${summary.totalCompanies}`} />
          <StatTile label="利用可能テンプレート" value={`${summary.templatesAvailable}`} />
        </div>
      </section>

      <section aria-label="AI会社作成ウィザード">
        <h3>AI会社作成ウィザード</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "40rem" }}>
          <label style={{ fontSize: "0.85rem" }}>
            事業アイデア(任意・自動判定に使用)
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="例: 名刺をデジタル化して管理するクラウドサービス"
              rows={2}
              style={{ width: "100%", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.85rem" }}>
            テンプレート
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={{ width: "100%", marginTop: "0.2rem" }}>
              <option value="auto">アイデアから自動判定</option>
              {BUSINESS_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.85rem" }}>
            会社名(任意)
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: MEISHI-TUBE Company" style={{ width: "100%", marginTop: "0.2rem" }} />
          </label>
          <div>
            <button type="button" onClick={preview}>組織をプレビュー生成(Mock)</button>
          </div>
        </div>

        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>初期ユースケース(ワンクリック生成):</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {firstUseCases.map((t) => (
              <button key={t!.id} type="button" onClick={() => quickCreate(t!.id)} className="badge" style={{ padding: "0.35rem 0.7rem", cursor: "pointer" }}>
                ＋ {t!.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {draft && (
        <section aria-label="生成組織プレビュー">
          <h3>生成組織プレビュー: {draft.name}</h3>
          <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeCompanyJa(draft)}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "0.75rem" }}>
            <Card title={`AI CEO 体制`} items={[draft.ceo, ...draft.executives.map((e) => `${e.role}（${e.focus}）`)]} />
            <Card title="部門マップ" items={draft.departmentMap} />
            <Card title="AI社員名簿" items={draft.employeeRoster} />
            <LvCard title="KPIプレビュー" items={draft.kpiDashboard} />
            <Card title="ワークフロープレビュー" items={draft.workflows} />
            <LvCard title="Musasabi DNA" items={draft.dnaProfile} />
            <Card title="Knowledge Vault" items={draft.knowledgeVaultFolders} />
            <Card title="レポートテンプレート" items={draft.reportTemplates} />
            <Card title="監査モニタリング" items={draft.auditMonitoring} />
          </div>
          <div style={{ marginTop: "0.6rem" }}>
            <button type="button" onClick={launch}>この内容で会社ワークスペースを作成(Mock・起動確認)</button>{" "}
            <button type="button" onClick={() => setDraft(null)} className="badge" style={{ padding: "0.35rem 0.7rem" }}>破棄</button>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            ※ 作成は Mock です。実アカウント・課金・外部接続は発生しません。
          </p>
        </section>
      )}

      <section aria-label="生成会社ダッシュボード">
        <h3>生成会社ダッシュボード</h3>
        {companies.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>まだ会社は生成されていません。ウィザードから作成してください。</p>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                aria-pressed={c.id === selectedId}
                className={c.id === selectedId ? "badge is-active" : "badge"}
                style={{ padding: "0.35rem 0.7rem", cursor: "pointer" }}
              >
                {c.name}（{c.templateName}）
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div style={{ marginTop: "0.75rem" }} aria-label={`会社ダッシュボード: ${selected.name}`}>
            <h4 style={{ margin: "0.3rem 0" }}>{selected.name} — 会社ダッシュボード</h4>
            <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeCompanyJa(selected)}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              アイデア: {selected.idea}／レポート: {selected.reportsTo}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "0.75rem" }}>
              <Card title="AI CEO 体制" items={[selected.ceo, ...selected.executives.map((e) => `${e.role}（${e.focus}）`)]} />
              <LvCard title="KPIダッシュボード" items={selected.kpiDashboard} />
              <Card title="部門マップ" items={selected.departmentMap} />
              <Card title="AI社員名簿" items={selected.employeeRoster} />
              <Card title="ワークフロー" items={selected.workflows} />
              <LvCard title="Musasabi DNA" items={selected.dnaProfile} />
              <Card title="Knowledge Vault" items={selected.knowledgeVaultFolders} />
              <Card title="レポートテンプレート" items={selected.reportTemplates} />
              <Card title="監査モニタリング" items={selected.auditMonitoring} />
              <LvCard title="運用データ(Mock)" items={selected.mockOperatingData} />
              <Card title="連携" items={[selected.companyBrainWorkspace, `統合: 経営ダッシュボード`]} />
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <button type="button" onClick={() => removeCompany(selected.id)} className="badge" style={{ padding: "0.35rem 0.7rem" }}>
                このワークスペースを削除(Mock)
              </button>
            </div>
          </div>
        )}
      </section>

      <section aria-label="Musasabi World ガバナンス">
        <h3>ガバナンス</h3>
        <ul style={{ fontSize: "0.85rem" }}>
          {WORLD_GOVERNANCE_NOTES.map((n) => <li key={n}>{n}</li>)}
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
        {items.map((i, idx) => <li key={`${i}-${idx}`}>{i}</li>)}
      </ul>
    </div>
  );
}

function LvCard({ title, items }: { title: string; items: readonly { label: string; value: string }[] }) {
  return (
    <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
      <strong>{title}</strong>
      <ul style={{ margin: "0.3rem 0 0", listStyle: "none", paddingLeft: 0, fontSize: "0.85rem" }}>
        {items.map((k) => (
          <li key={k.label}><span style={{ color: "var(--text-muted)" }}>{k.label}:</span> <strong>{k.value}</strong></li>
        ))}
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
