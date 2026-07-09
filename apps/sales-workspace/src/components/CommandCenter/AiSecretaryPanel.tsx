import { useMemo, useState } from "react";
import {
  SECRETARY_ITEMS,
  SECRETARY_CATEGORY_LABEL_JA,
  SECRETARY_STATUS_LABEL_JA,
  SECRETARY_ACTIONS,
  PRIORITY_LABEL_JA,
  PRIORITY_COLOR,
  MARKET_RESEARCH_REPORTS,
  MARKETING_POSTS,
  POST_APPROVAL_LABEL_JA,
  computeBriefing,
  filterSecretaryItems,
  departmentsOf,
  type SecretaryCategory,
  type SecretaryItem,
  type Priority,
} from "@musasabi/ai-secretary";
import { recordMemory } from "../../lib/memoryStorage";

// 右詳細パネルの既定状態 = AI役員秘書 / 参謀(AI_SECRETARY_RIGHT_DETAIL_PANEL_DIRECTIVE.md)。
// 部署未選択のときに表示。デイリーブリーフィング + フィルタ + 統一カード + Mockアクション。
// 市場調査レポート・マーケ承認の要約も集約(MARKET_RESEARCH_AND_MARKETING_DEPARTMENT_DIRECTIVE.md)。
// すべて Mock・決定論。実外部接続・課金・本番アクションなし。

const CATEGORY_OPTIONS: Array<SecretaryCategory | "all"> = [
  "all",
  "approval_request", "department_proposal", "automation_candidate", "ai_combination_idea",
  "risk_alert", "kpi_warning", "workflow_improvement", "new_business_idea", "followup_reminder",
];
const PRIORITY_OPTIONS: Array<Priority | "all"> = ["all", "high", "medium", "low"];

export function AiSecretaryPanel() {
  const [category, setCategory] = useState<SecretaryCategory | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [department, setDepartment] = useState<string | "all">("all");
  const [actionNote, setActionNote] = useState<string | null>(null);

  const briefing = useMemo(() => computeBriefing(), []);
  const depts = useMemo(() => departmentsOf(), []);
  const items = useMemo(
    () => filterSecretaryItems(SECRETARY_ITEMS, { category, priority, department }),
    [category, priority, department],
  );

  function handleAction(item: SecretaryItem, labelJa: string): void {
    setActionNote(`${labelJa}(Mock): ${SECRETARY_CATEGORY_LABEL_JA[item.category]} / ${item.sourceDepartment}`);
    recordMemory({
      category: "work",
      actor: "user",
      action: `AI秘書アクション: ${labelJa}`,
      detail: `${item.sourceDepartment} / ${item.summary}`,
      tags: ["ai-secretary", item.category],
    });
  }

  return (
    <aside className="dept-detail" aria-label="AI秘書 / 参謀">
      <div className="secretary-head">
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>🧭 AI秘書 / 参謀</h2>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Chief of Staff(Mock)</span>
      </div>

      {/* デイリーブリーフィング */}
      <div className="secretary-brief">
        <div style={{ fontWeight: 700, fontSize: "0.86rem" }}>{briefing.headline}</div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.35rem", fontSize: "0.76rem" }}>
          <span>承認待ち <b>{briefing.approvalsWaiting}</b></span>
          <span>優先度高 <b>{briefing.highPriority}</b></span>
          <span>リスク <b>{briefing.risks}</b></span>
          <span>調査 <b>{MARKET_RESEARCH_REPORTS.length}</b></span>
          <span>マーケ投稿 <b>{MARKETING_POSTS.length}</b></span>
        </div>
      </div>

      {/* フィルタ */}
      <div className="secretary-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value as SecretaryCategory | "all")} aria-label="カテゴリ">
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c === "all" ? "全カテゴリ" : SECRETARY_CATEGORY_LABEL_JA[c]}</option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | "all")} aria-label="優先度">
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p === "all" ? "全優先度" : PRIORITY_LABEL_JA[p]}</option>
          ))}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="部署">
          <option value="all">全部署</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {actionNote && <div className="secretary-note">✓ {actionNote}</div>}

      {/* 統一カード */}
      <div className="secretary-cards">
        {items.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>該当する項目はありません。</p>}
        {items.map((i) => (
          <div key={i.id} className="secretary-card" aria-label={`秘書カード: ${SECRETARY_CATEGORY_LABEL_JA[i.category]}`}>
            <div className="secretary-card-top">
              <span className="badge" style={{ fontSize: "0.66rem" }}>{SECRETARY_CATEGORY_LABEL_JA[i.category]}</span>
              <span className="secretary-prio" style={{ color: PRIORITY_COLOR[i.priority] }}>優先度{PRIORITY_LABEL_JA[i.priority]}</span>
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>{SECRETARY_STATUS_LABEL_JA[i.status]}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.84rem", margin: "0.2rem 0" }}>{i.summary}</div>
            <dl className="secretary-fields">
              <div><dt>発信元</dt><dd>{i.sourceDepartment}</dd></div>
              <div><dt>関連AI</dt><dd>{i.relatedAiEmployee}</dd></div>
              <div><dt>理由</dt><dd>{i.reason}</dd></div>
              <div><dt>推奨</dt><dd>{i.recommendedAction}</dd></div>
              <div><dt>効果</dt><dd>{i.expectedImpact}</dd></div>
              <div><dt>リスク</dt><dd style={{ color: PRIORITY_COLOR[i.riskLevel] }}>{PRIORITY_LABEL_JA[i.riskLevel]}</dd></div>
              <div><dt>承認要否</dt><dd>{i.approvalNeeded ? "必要" : "不要"}</dd></div>
              <div><dt>次の一手</dt><dd>{i.suggestedNextStep}</dd></div>
            </dl>
            <div className="secretary-actions">
              {SECRETARY_ACTIONS.map((a) => (
                <button key={a.kind} type="button" className="quick-template" onClick={() => handleAction(i, a.labelJa)}>
                  {a.labelJa}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
