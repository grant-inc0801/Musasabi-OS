import { useMemo, useState } from "react";
import {
  AI_MODELS,
  PROVIDER_LABEL,
  MODEL_STATUS_LABEL_JA,
  APPROVAL_LABEL_JA,
  CAPABILITY_KEYS,
  CAPABILITY_LABEL_JA,
  TASK_TYPES,
  TASK_LABEL_JA,
  UPGRADE_EVALUATIONS,
  ADOPTION_LABEL_JA,
  MODEL_NOTIFICATIONS,
  NOTIFICATION_LABEL_JA,
  MODEL_USAGE_KNOWLEDGE,
  SECRET_CENTER_RULES,
  PRODUCTION_CONNECTIONS_ENABLED,
  recommendAll,
  recommendModelForTask,
  compareModels,
  getModel,
  summarizeRegistryJa,
  type TaskType,
} from "@musasabi/ai-model-registry";

// AI統合センター / AIモデルレジストリ(AI_MODEL_REGISTRY_DIRECTIVE.md)。
// モデル一覧・能力スコア・タスク別ルーティング・比較・アップグレード評価・秘書通知・
// Company Brain 利用ナレッジ・Secret Center ルール。すべて Mock・決定論。
// APIキーは保持せず参照名のみ。本番接続は承認までロック。

const cell: React.CSSProperties = { border: "1px solid var(--border)", padding: "0.28rem 0.5rem", textAlign: "left", verticalAlign: "top", whiteSpace: "nowrap" };

export function AiIntegrationCenterPage() {
  const [task, setTask] = useState<TaskType>("coding");
  const [cmpA, setCmpA] = useState(AI_MODELS[0].id);
  const [cmpB, setCmpB] = useState(AI_MODELS[3].id);

  const routing = useMemo(() => recommendModelForTask(task), [task]);
  const allRouting = useMemo(() => recommendAll(), []);
  const comparison = useMemo(() => compareModels(cmpA, cmpB), [cmpA, cmpB]);

  return (
    <>
      <section aria-label="AIモデルレジストリ概要">
        <h2>AI統合センター — モデルレジストリ(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
          すべてのAIモデルを一元管理し、選択・ルーティング・比較・アップグレード評価・監査・コスト管理を行います。
          <strong> APIキーは保持せず論理参照名のみ</strong>(実行時に AI Secret Center が注入)。
          本番接続・実課金は Production Readiness 承認まで無効です。
        </p>
        <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeRegistryJa()}</p>
      </section>

      {/* レジストリダッシュボード */}
      <section aria-label="レジストリダッシュボード">
        <h3>レジストリ ダッシュボード</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.76rem" }}>
            <thead>
              <tr>{["モデル", "提供元", "版", "状態", "部署", "AI社員", "強み", "速度", "コスト", "文脈長", "評価", "承認"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {AI_MODELS.map((m) => (
                <tr key={m.id}>
                  <td style={cell}><strong>{m.name}</strong></td>
                  <td style={cell}>{PROVIDER_LABEL[m.provider]}</td>
                  <td style={cell}>{m.version}</td>
                  <td style={cell}>{MODEL_STATUS_LABEL_JA[m.status]}</td>
                  <td style={cell}>{m.department}</td>
                  <td style={cell}>{m.aiEmployee}</td>
                  <td style={{ ...cell, whiteSpace: "normal", minWidth: "12rem" }}>{m.strengths}</td>
                  <td style={cell}>{m.averageSpeed}</td>
                  <td style={cell}>{m.estimatedCost}</td>
                  <td style={cell}>{m.contextLength.toLocaleString()}</td>
                  <td style={cell}><b>{m.evaluationScore}</b></td>
                  <td style={cell}>{APPROVAL_LABEL_JA[m.approvalStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
          ※ 各モデルの secrets は参照名のみ保持(値は表示・記録しません)。
        </p>
      </section>

      {/* AIルーティング */}
      <section aria-label="AIルーティング">
        <h3>AIルーティング(タスク別 推奨モデル)</h3>
        <label style={{ fontSize: "0.82rem" }}>タスク種別
          <select value={task} onChange={(e) => setTask(e.target.value as TaskType)} style={{ marginLeft: 6 }}>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{TASK_LABEL_JA[t]}</option>)}
          </select>
        </label>
        <div className="card" style={{ marginTop: "0.4rem" }}>
          <div><strong>推奨:</strong> {routing.model.name}(スコア {routing.score})</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>理由: {routing.reason}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.4rem", marginTop: "0.4rem" }}>
          {allRouting.map((r) => (
            <div key={r.task} className="card" style={{ padding: "0.4rem 0.6rem", fontSize: "0.76rem" }}>
              <div><span className="badge" style={{ fontSize: "0.66rem" }}>{TASK_LABEL_JA[r.task]}</span></div>
              <div style={{ marginTop: "0.2rem" }}>→ <strong>{r.model.name}</strong>(スコア {r.score})</div>
            </div>
          ))}
        </div>
      </section>

      {/* モデル比較 */}
      <section aria-label="モデル比較">
        <h3>モデル比較</h3>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
          <select value={cmpA} onChange={(e) => setCmpA(e.target.value)} aria-label="モデルA">
            {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <span style={{ alignSelf: "center" }}>vs</span>
          <select value={cmpB} onChange={(e) => setCmpB(e.target.value)} aria-label="モデルB">
            {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <table style={{ borderCollapse: "collapse", fontSize: "0.78rem", maxWidth: "42rem" }}>
          <thead><tr><th style={cell}>項目</th><th style={cell}>{getModel(cmpA)?.name}</th><th style={cell}>{getModel(cmpB)?.name}</th></tr></thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label}><td style={cell}>{row.label}</td><td style={cell}>{row.a}</td><td style={cell}>{row.b}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 能力スコア(選択中のモデルA) */}
      <section aria-label="能力スコア">
        <h3>能力スコア(14軸・{getModel(cmpA)?.name})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.3rem 0.8rem", maxWidth: "48rem" }}>
          {CAPABILITY_KEYS.map((k) => {
            const v = getModel(cmpA)?.capabilities[k] ?? 0;
            return (
              <div key={k} style={{ fontSize: "0.74rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>{CAPABILITY_LABEL_JA[k]}</span><span>{v}</span></div>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${v}%`, height: "100%", background: v >= 80 ? "#22C55E" : v >= 60 ? "#F59E0B" : "#94a3b8" }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AIアップグレードマネージャ */}
      <section aria-label="AIアップグレードマネージャ">
        <h3>AIアップグレードマネージャ(Mock評価・実採用はロック 🔒)</h3>
        {UPGRADE_EVALUATIONS.map((u) => (
          <div key={u.id} className="card" style={{ marginBottom: "0.5rem", fontSize: "0.78rem" }}>
            <div style={{ fontWeight: 700 }}>{u.newModel} <span style={{ color: "var(--text-muted)" }}>(基準: {u.baselineModel})</span></div>
            <div>能力差: {u.capabilityDiff} / コスト差: {u.costDiff}</div>
            <div>リスク: {u.riskNotes}</div>
            <div>推奨: <span className="badge" style={{ fontSize: "0.68rem" }}>{ADOPTION_LABEL_JA[u.recommendedAdoption]}</span> / 承認申請: {u.approvalRequest}</div>
          </div>
        ))}
      </section>

      {/* AI秘書への通知 */}
      <section aria-label="AI秘書への通知">
        <h3>AI秘書への通知</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: "0.8rem" }}>
          {MODEL_NOTIFICATIONS.map((n) => (
            <li key={n.id} style={{ display: "flex", gap: 8, padding: "0.15rem 0", alignItems: "center" }}>
              <span className="badge" style={{ fontSize: "0.66rem" }}>{NOTIFICATION_LABEL_JA[n.type]}</span>
              <span>{getModel(n.modelId)?.name}: {n.message}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Company Brain 利用ナレッジ */}
      <section aria-label="Company Brain 利用ナレッジ">
        <h3>Company Brain 連携(モデル利用ナレッジ)</h3>
        {MODEL_USAGE_KNOWLEDGE.map((k) => (
          <div key={k.modelId} className="card" style={{ marginBottom: "0.5rem", fontSize: "0.78rem" }}>
            <strong>{getModel(k.modelId)?.name}</strong>
            <div>得意: {k.strongTasks.join("・")} / 苦手: {k.weakTasks.join("・")}</div>
            <div>成功例: {k.successCases.join(" / ")}</div>
            <div>推奨パターン: {k.recommendedPatterns.join(" / ")}</div>
          </div>
        ))}
      </section>

      {/* Secret Center ルール */}
      <section aria-label="Secret Center 連携ルール">
        <h3>AI Secret Center 連携ルール</h3>
        <ul style={{ fontSize: "0.82rem" }}>
          {SECRET_CENTER_RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#EF4444" }}>
          ⚠ 本番接続: {PRODUCTION_CONNECTIONS_ENABLED ? "有効" : "無効(承認まで)"}。実キー・実課金・外部接続は行いません。
        </p>
      </section>
    </>
  );
}
