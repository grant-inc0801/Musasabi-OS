import { useMemo, useState } from "react";
import {
  loadSchedules,
  nextRunMs,
  removeSchedule,
  runScheduleNow,
  upsertSchedule,
  type AgentSchedule,
} from "../../lib/agentSchedule";
import { saveBinaryFile } from "../../lib/saveFile";
import { buildIcs } from "../../lib/icsExport";
import {
  SCHEDULED_ROUTINES,
  SCHEDULE_FREQUENCIES,
  buildSchedulerSummary,
  filterRoutines,
  routineIcon,
  type ScheduleFrequency,
} from "@musasabi/ai-company";
import { loadRoutines } from "../../lib/automationStorage";

// D-019 Scheduler & Routines: 会社の定例業務(スケジュール)と、Automationで保存した
// 自動化ルーチン(実データ)を一覧表示する。実行はしない(表示のみ・Mock)。

export function SchedulerPage({ onOpenAutomation }: { onOpenAutomation: () => void }) {
  const [freq, setFreq] = useState<ScheduleFrequency | "all">("all");
  const [schedules, setSchedules] = useState<AgentSchedule[]>(() => loadSchedules());
  const [newTitle, setNewTitle] = useState("週次レポート自動化");
  const [newTemplate, setNewTemplate] = useState("wf-weekly-report");
  const [newInterval, setNewInterval] = useState(10080);
  const [newAutoApprove, setNewAutoApprove] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);

  function handleAddSchedule(): void {
    const isVerify = newTemplate === "forecast_verify";
    const isCuration = newTemplate === "vault_curation";
    const title = isVerify
      ? "予測と実績の自動突合(的中率更新)"
      : isCuration
        ? "保管庫の整理提案(AI司書)"
        : newTitle.trim();
    if (title === "") return;
    const schedule: AgentSchedule = {
      id: `sch-${Date.now()}`,
      title,
      description: title,
      kind: isVerify ? "forecast_verify" : isCuration ? "vault_curation" : "agent",
      workflowTemplateId: isVerify || isCuration || newTemplate === "custom" ? undefined : newTemplate,
      intervalMinutes: newInterval,
      autoApprove: newAutoApprove,
      enabled: true,
      lastRunMs: null,
      runs: [],
    };
    setSchedules(upsertSchedule(schedule));
  }

  async function handleRunNow(s: AgentSchedule): Promise<void> {
    if (runningId) return;
    setRunningId(s.id);
    try {
      await runScheduleNow(s);
      setSchedules(loadSchedules());
    } finally {
      setRunningId(null);
    }
  }

  function toggleEnabled(s: AgentSchedule): void {
    setSchedules(upsertSchedule({ ...s, enabled: !s.enabled }));
  }
  const summary = buildSchedulerSummary();
  const routines = filterRoutines(SCHEDULED_ROUTINES, freq);
  const savedRoutines = useMemo(() => loadRoutines(), []);

  const tiles = [
    { label: "定例業務", value: `${summary.total}件` },
    { label: "毎日", value: `${summary.daily}件` },
    { label: "毎週", value: `${summary.weekly}件` },
    { label: "毎月", value: `${summary.monthly}件` },
    { label: "自動化済み", value: `${summary.automated}件` },
  ];

  return (
    <>
      <section aria-label="スケジュール概要">
        <h3 style={{ marginTop: 0 }}>スケジューラ / 定例業務(Scheduler & Routines)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          各部署の定例業務を頻度・次回予定つきで一覧化します(下の一覧はMock)。
          「エージェント定例実行」に登録した目標は、期限が来ると実際に自律実行されます。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "7.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="エージェント定例実行">
        <h3 style={{ marginTop: 0 }}>エージェント定例実行(本番・ローカル)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          登録した目標を、アプリ起動中に期限が来たら<strong>エージェントが実際に自律実行</strong>し、
          結果を Company Brain へ保存します(頭脳はローカルLLM自動検出・課金なし・外部送信なし)。
          承認ノードは「事前承認」を有効にした場合のみ自動続行し、監査ログに記録されます。
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            aria-label="定例目標"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: "16rem", fontSize: "0.82rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.55rem" }}
          />
          <select aria-label="テンプレート" value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)}>
            <option value="wf-weekly-report">週次レポートフロー</option>
            <option value="wf-new-service">新サービス例示フロー</option>
            <option value="forecast_verify">予測突合(的中率の自動更新)</option>
            <option value="vault_curation">保管庫の整理提案(AI司書)</option>
            <option value="custom">テンプレートなし(汎用)</option>
          </select>
          <select aria-label="実行間隔" value={newInterval} onChange={(e) => setNewInterval(Number(e.target.value))}>
            <option value={60}>毎時</option>
            <option value={1440}>毎日</option>
            <option value={10080}>毎週</option>
          </select>
          <label style={{ fontSize: "0.78rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <input type="checkbox" checked={newAutoApprove} onChange={(e) => setNewAutoApprove(e.target.checked)} />
            承認ノードを事前承認(自動続行)
          </label>
          <button type="button" onClick={handleAddSchedule}>+ 定例実行を登録</button>
          {schedules.length > 0 && (
            <button
              type="button"
              title="Outlook / Google カレンダーへ取り込める .ics を書き出します(完全ローカル)"
              onClick={() => void saveBinaryFile(
                "musasabi-schedules.ics",
                new TextEncoder().encode(buildIcs(schedules)),
                "iCalendar",
                ["ics"],
              )}
            >
              📅 カレンダー書き出し(.ics)
            </button>
          )}
        </div>

        {schedules.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
            登録済みの定例実行はまだありません。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.6rem" }}>
            {schedules.map((s) => (
              <div key={s.id} className="card" style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>{s.title}</strong>
                  <span className="badge" style={{ fontSize: "0.64rem" }}>
                    {s.intervalMinutes === 60 ? "毎時" : s.intervalMinutes === 1440 ? "毎日" : "毎週"}
                  </span>
                  {s.kind === "forecast_verify" && (
                    <span className="badge" style={{ fontSize: "0.64rem", background: "#22C55E22" }}>⚖ 予測突合</span>
                  )}
                  {s.kind === "vault_curation" && (
                    <span className="badge" style={{ fontSize: "0.64rem", background: "#F59E0B22" }}>🧹 整理提案</span>
                  )}
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    次回: {new Date(nextRunMs(s)).toLocaleString("ja-JP")} / 事前承認: {s.autoApprove ? "有効" : "無効"}
                  </span>
                  <span style={{ marginLeft: "auto", display: "flex", gap: "0.35rem" }}>
                    <button type="button" onClick={() => void handleRunNow(s)} disabled={runningId !== null}>
                      {runningId === s.id ? "実行中…" : "▶ 今すぐ実行"}
                    </button>
                    <button type="button" onClick={() => toggleEnabled(s)}>{s.enabled ? "無効化" : "有効化"}</button>
                    <button type="button" onClick={() => setSchedules(removeSchedule(s.id))}>削除</button>
                  </span>
                </div>
                {s.runs.length > 0 && (
                  <div style={{ marginTop: "0.35rem", borderTop: "1px solid var(--border)", paddingTop: "0.35rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>直近の実行:</div>
                    {s.runs.slice(0, 2).map((r) => (
                      <div key={r.atMs} style={{ marginTop: "0.25rem" }}>
                        <span className="badge" style={{ fontSize: "0.62rem" }}>
                          {r.status === "completed" ? "完了" : r.status === "waiting_approval" ? "承認待ち" : r.status === "blocked" ? "遮断" : "エラー"}
                        </span>{" "}
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {new Date(r.atMs).toLocaleString("ja-JP")} / 頭脳: {r.brainName}
                        </span>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.72rem", margin: "0.2rem 0 0", maxHeight: "8rem", overflow: "auto" }}>{r.report}</pre>
                        <button
                          type="button"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => void saveBinaryFile(
                            `schedule-report-${new Date(r.atMs).toISOString().slice(0, 10)}.md`,
                            new TextEncoder().encode(`# 定例実行報告 — ${s.title}\n\n${r.report}`),
                            "Markdown",
                            ["md"],
                          )}
                        >
                          📄 ファイル保存
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-label="定例業務一覧">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>定例業務一覧</h3>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value as ScheduleFrequency | "all")}
            aria-label="頻度で絞り込み"
          >
            <option value="all">すべての頻度</option>
            {SCHEDULE_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <table style={{ borderCollapse: "collapse", marginTop: "0.6rem" }}>
          <thead>
            <tr>
              {["部署", "業務", "頻度", "次回予定", "自動化"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routines.map((r) => (
              <tr key={r.id}>
                <td style={cellStyle}>
                  {routineIcon(r)} {r.deptName}
                </td>
                <td style={cellStyle}>{r.title}</td>
                <td style={cellStyle}>{r.frequency}</td>
                <td style={cellStyle}>{r.nextRun}</td>
                <td style={cellStyle}>{r.automated ? "✅ 自動化済み" : "手動"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="保存済み自動化ルーチン">
        <h3 style={{ marginTop: 0 }}>保存済み自動化ルーチン(実データ)</h3>
        {savedRoutines.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            保存済みの自動化ルーチンはまだありません。Automation(操作記録)で作成できます。
          </p>
        ) : (
          <ul>
            {savedRoutines.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — 手順{r.steps.length}件・実行{r.runCount}回
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={onOpenAutomation}>
          Automation(操作記録)を開く
        </button>
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
