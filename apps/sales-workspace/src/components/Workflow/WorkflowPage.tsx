import { useMemo } from "react";
import {
  COMPANY_WORKFLOWS,
  WORKFLOW_STATUS_COLOR,
  buildWorkflowSummary,
  currentStep,
  workflowProgress,
  workflowStepIcon,
} from "@musasabi/ai-company";
import { loadMemoryRecords } from "../../lib/memoryStorage";
import { loadSchedules, nextRunMs } from "../../lib/agentSchedule";
import { loadVaultDocs } from "../../lib/vaultStorage";
import { loadAppEvents } from "../../lib/appEvents";

// D-012 AI Company Workflow: 部署をまたぐ業務フローの可視化ページ。
// 上段は実実行データ(エージェント実行履歴・定例フロー・成果物)、下段はMockの
// 部署横断フロー図。実データはすべてローカル(外部送信なし)。

/** エージェント系の実実行を Brain 記録から抽出するためのタグ。 */
const AGENT_RUN_TAGS = ["agent-run", "agent-chat-run", "agent-schedule", "forecast-build"];

const SCHEDULE_KIND_JA: Record<string, string> = {
  agent: "エージェント実行",
  forecast_verify: "⚖ 予測突合",
  vault_curation: "🧹 整理提案",
};

/** 実行フロー(実データ)セクション: 実行履歴・定例フロー・成果物を一望する。 */
function RealWorkflowSection({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const data = useMemo(() => {
    const runs = loadMemoryRecords()
      .filter((r) => r.tags.some((t) => AGENT_RUN_TAGS.includes(t)))
      .slice(0, 8);
    const schedules = loadSchedules();
    const artifacts = loadVaultDocs().filter((d) => d.source === "agent");
    const waiting = loadAppEvents().filter((e) => !e.read && e.level === "warn").length;
    return { runs, schedules, artifacts, waiting };
  }, []);

  const tiles = [
    { label: "実実行の記録", value: `${data.runs.length}件`, page: "company_brain" },
    { label: "定例フロー(有効)", value: `${data.schedules.filter((s) => s.enabled).length}件`, page: "scheduler" },
    { label: "承認待ち(未読)", value: `${data.waiting}件`, page: "notifications" },
    { label: "AI成果物", value: `${data.artifacts.length}件`, page: "vault" },
  ];

  return (
    <section aria-label="実行フロー">
      <h3 style={{ marginTop: "1rem" }}>
        実行フロー <span className="badge" style={{ fontSize: "0.62rem" }}>実データ</span>
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", maxWidth: "48rem", margin: "0 0 0.5rem" }}>
        エージェント・スケジューラ・チャット実行の<strong>実際の実行履歴と成果物</strong>です。
        タイルをクリックすると各画面へ移動できます。
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        {tiles.map((t) => (
          <button
            key={t.label}
            type="button"
            className="card"
            style={{ minWidth: "9rem", textAlign: "center", cursor: "pointer" }}
            onClick={() => onOpenPage(t.page)}
          >
            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{t.label}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700 }}>{t.value}</div>
          </button>
        ))}
      </div>

      {data.schedules.length > 0 && (
        <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {data.schedules.map((s) => {
            const last = s.runs[0];
            return (
              <div key={s.id} className="card" style={{ padding: "0.45rem 0.7rem", fontSize: "0.78rem", minWidth: "16rem", flex: "1 1 16rem" }}>
                <strong>{SCHEDULE_KIND_JA[s.kind ?? "agent"] ?? "エージェント実行"}: {s.title}</strong>
                <div style={{ color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  {s.enabled ? `次回 ${new Date(nextRunMs(s)).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : "無効"}
                  {last && ` / 前回: ${last.status === "completed" ? "完了" : last.status === "error" ? "エラー" : last.status}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.runs.length > 0 ? (
        <ul style={{ fontSize: "0.82rem", marginTop: "0.6rem" }}>
          {data.runs.map((r) => (
            <li key={r.id}>
              {new Date(r.timestampMs).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}{" "}
              <strong>{r.actor}</strong>: {r.action}
              {r.detail && <span style={{ color: "var(--text-muted)" }}> — {r.detail.slice(0, 60)}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
          実実行の記録はまだありません。チャット「実行 ◯◯」や実行センター・スケジューラから実行すると、ここに履歴が並びます。
        </p>
      )}
      {data.artifacts.length > 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: "0.3rem" }}>
          直近のAI成果物: {data.artifacts.slice(0, 3).map((d) => d.title).join(" / ")}(保管庫で全文閲覧可)
        </p>
      )}
    </section>
  );
}

const DEPT_PAGE: Record<string, string> = {
  sales: "sales_kpi",
  support: "support",
  development: "development",
  publishing: "publishing",
  planning: "planning",
  market_research: "market_research",
  marketing: "marketing",
  accounting: "accounting",
  hr: "hr",
};

export function WorkflowPage({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const summary = buildWorkflowSummary();
  const tiles = [
    { label: "ワークフロー数", value: `${summary.total}件` },
    { label: "進行中", value: `${summary.running}件` },
    { label: "承認待ち", value: `${summary.waitingApproval}件` },
    { label: "平均進捗", value: `${summary.averageProgressPercent}%` },
  ];

  return (
    <>
      <section aria-label="ワークフローサマリー">
        <h3 style={{ marginTop: 0 }}>AIカンパニー・ワークフロー</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          部署をまたぐ業務フローを可視化します。上の「実行フロー」は実データ、
          下のフロー図はMock(参考図)です。
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

      <RealWorkflowSection onOpenPage={onOpenPage} />

      {COMPANY_WORKFLOWS.map((wf) => {
        const cur = currentStep(wf);
        const progress = workflowProgress(wf);
        return (
          <section key={wf.id} aria-label={wf.name}>
            <h3 style={{ marginBottom: "0.2rem" }}>{wf.name}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>
              {wf.description}
            </p>
            <div className="progress-track" style={{ maxWidth: "48rem" }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: "var(--ok)" }} />
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0.6rem" }}>
              進捗{progress}%
              {cur ? ` ・ 現在: ${cur.deptName}「${cur.action}」` : " ・ 完了"}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "stretch" }}>
              {wf.steps.map((step, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ minWidth: "12rem", flex: "1 1 12rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span aria-hidden="true" style={{ fontSize: 16 }}>
                      {workflowStepIcon(step)}
                    </span>
                    <strong style={{ flex: 1, fontSize: "0.85rem" }}>{step.deptName}</strong>
                    <span
                      className="dept-lamp"
                      style={{
                        background: WORKFLOW_STATUS_COLOR[step.status],
                        boxShadow: `0 0 6px ${WORKFLOW_STATUS_COLOR[step.status]}`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.82rem" }}>{step.action}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {i + 1}. {step.status}
                  </div>
                  {DEPT_PAGE[step.deptId] && (
                    <button
                      type="button"
                      style={{ alignSelf: "flex-start", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                      onClick={() => onOpenPage(DEPT_PAGE[step.deptId])}
                    >
                      部署を見る
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
