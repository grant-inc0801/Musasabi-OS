// エージェント定例実行(本番・完全ローカル)。
// スケジューラに登録された目標を、アプリ起動中に期限が来たら実際に
// AgentRuntime(ローカルLLM頭脳 or ルールベース)で自律実行し、
// 結果を Company Brain へ保存する。承認ノードは「登録時の事前承認」フラグが
// 有効な場合のみ自動続行し、その旨を監査ログへ残す(無効なら承認待ちで停止)。
// 課金なし・外部送信なし。

import { AgentRuntime, detectBrain } from "@musasabi/agent-runtime";
import { buildAgentTools } from "./agentTools";
import { buildReportProvider } from "./brainProviders";
import { loadLlmSettings } from "./llmSettings";
import { resolveLlmFetch } from "./llmFetch";
import { loadMemoryRecords, recordMemory } from "./memoryStorage";
import { appLogger } from "./appLogger";
import { sendAgentNotification } from "./freeConnectors";
import { runBackupIfDue } from "./autoBackup";
import { notifyOs } from "./osNotify";
import { fetchAllHeadlines } from "./rssFeeds";
import { autoVerifyForecastOutcomes, forecastAccuracyStats } from "./forecastTracking";

export interface ScheduleRunLog {
  atMs: number;
  status: "completed" | "waiting_approval" | "blocked" | "error";
  brainName: string;
  report: string;
}

export interface AgentSchedule {
  id: string;
  title: string;
  description: string;
  /**
   * 定例の種類(省略時 "agent" = エージェント自律実行)。
   * "forecast_verify" は予測と実績の自動突合(的中率の定例更新・決定論)。
   * "vault_curation" は保管庫の整理候補の定例提案(提案のみ・削除は人間の承認後)。
   */
  kind?: "agent" | "forecast_verify" | "vault_curation";
  workflowTemplateId?: string;
  /** 実行間隔(分)。例: 毎時=60 / 毎日=1440 / 毎週=10080。 */
  intervalMinutes: number;
  /** 承認ノードを登録時の事前承認で自動続行するか。 */
  autoApprove: boolean;
  enabled: boolean;
  lastRunMs: number | null;
  /** 直近の実行ログ(新しい順・最大5件)。 */
  runs: ScheduleRunLog[];
}

const KEY = "musasabi.agentSchedules";
const MAX_RUN_LOGS = 5;

export function loadSchedules(): AgentSchedule[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AgentSchedule[]) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.id === "string") : [];
  } catch {
    return [];
  }
}

export function saveSchedules(schedules: readonly AgentSchedule[]): void {
  localStorage.setItem(KEY, JSON.stringify(schedules));
}

export function upsertSchedule(schedule: AgentSchedule): AgentSchedule[] {
  const rest = loadSchedules().filter((s) => s.id !== schedule.id);
  const next = [schedule, ...rest];
  saveSchedules(next);
  return next;
}

export function removeSchedule(id: string): AgentSchedule[] {
  const next = loadSchedules().filter((s) => s.id !== id);
  saveSchedules(next);
  return next;
}

export function nextRunMs(s: AgentSchedule): number {
  if (s.lastRunMs === null) return Date.now();
  return s.lastRunMs + s.intervalMinutes * 60 * 1000;
}

/** 予測突合の定例実行: RSS実データ+社内記録と突合し的中率を更新する(決定論)。 */
async function runForecastVerify(): Promise<string> {
  const headlines = await fetchAllHeadlines(10).catch(() => []);
  const memories = loadMemoryRecords().slice(0, 100).map((r) => `${r.action}: ${r.detail}`);
  const evidence = [...headlines.map((h) => h.title), ...memories];
  if (evidence.length === 0) return "突合できる実績データがありません(RSSソース・社内記録が空)。";
  const { records, verifiedCount } = autoVerifyForecastOutcomes(evidence);
  if (verifiedCount === 0) return "判定待ちの予測はありません(的中率は現状維持)。";
  const stats = forecastAccuracyStats(records);
  const summary = `${verifiedCount}件を突合 — 的中率${stats.hitRatePercent ?? 0}%(的中${stats.hit}・部分${stats.partial}・外れ${stats.miss})`;
  recordMemory({
    category: "company",
    actor: "agent-scheduler",
    action: "予測と実績の定例突合を実行",
    detail: summary,
    tags: ["forecast", "accuracy", "agent-schedule"],
  });
  void sendAgentNotification("予測の定例突合が完了", summary).catch(() => undefined);
  void notifyOs("Musasabi — 予測の的中率を更新", summary).catch(() => undefined);
  return `${summary}(RSS ${headlines.length}件+社内記録と照合。判定は市場調査部で手動上書きできます)`;
}

/**
 * AI司書の定例整理提案: 保管庫の整理候補を洗い出して通知する(提案のみ・削除しない)。
 * 実際の整理(要約して削除)は保管庫ページで人間が候補ごとに承認した場合のみ。
 */
async function runVaultCurationPropose(): Promise<string> {
  const { proposeVaultCuration } = await import("./vaultCuration");
  const candidates = proposeVaultCuration();
  if (candidates.length === 0) return "整理候補はありません(保管庫は整っています)。";
  const summary = `保管庫の整理候補が${candidates.length}件あります: ${candidates
    .slice(0, 3)
    .map((c) => `「${c.doc.title}」(${c.reason})`)
    .join(" / ")}${candidates.length > 3 ? " ほか" : ""}`;
  recordMemory({
    category: "company",
    actor: "AI司書",
    action: "保管庫の整理候補を定例提案",
    detail: summary.slice(0, 200),
    tags: ["vault", "curation", "agent-schedule"],
  });
  void notifyOs("Musasabi — 保管庫の整理候補", summary, "warn").catch(() => undefined);
  return `${summary}\n(提案のみ・削除は保管庫ページで候補ごとに承認した場合のみ実行されます)`;
}

/** スケジュール1件を今すぐ実行する(手動/定時共通の実実行)。 */
export async function runScheduleNow(schedule: AgentSchedule): Promise<AgentSchedule> {
  const startedAt = Date.now();
  let log: ScheduleRunLog;
  if (schedule.kind === "vault_curation") {
    try {
      const report = await runVaultCurationPropose();
      log = { atMs: startedAt, status: "completed", brainName: "AI司書(決定論・提案のみ)", report };
    } catch (error) {
      appLogger.warn("scheduled vault curation failed", { error: String(error) });
      log = { atMs: startedAt, status: "error", brainName: "-", report: String(error) };
    }
    const updated: AgentSchedule = {
      ...schedule,
      lastRunMs: startedAt,
      runs: [log, ...schedule.runs].slice(0, MAX_RUN_LOGS),
    };
    upsertSchedule(updated);
    return updated;
  }
  if (schedule.kind === "forecast_verify") {
    try {
      const report = await runForecastVerify();
      log = { atMs: startedAt, status: "completed", brainName: "決定論突合(LLM不使用)", report };
    } catch (error) {
      appLogger.warn("scheduled forecast verify failed", { error: String(error) });
      log = { atMs: startedAt, status: "error", brainName: "-", report: String(error) };
    }
    const updated: AgentSchedule = {
      ...schedule,
      lastRunMs: startedAt,
      runs: [log, ...schedule.runs].slice(0, MAX_RUN_LOGS),
    };
    upsertSchedule(updated);
    return updated;
  }
  try {
    const brain = await detectBrain(loadLlmSettings(), await resolveLlmFetch());
    const rt = new AgentRuntime({ provider: brain.provider, reportProvider: await buildReportProvider(brain), tools: buildAgentTools() });
    let state = await rt.start({
      id: `${schedule.id}-${startedAt}`,
      title: schedule.title,
      description: schedule.description,
      workflowTemplateId: schedule.workflowTemplateId,
    });
    state = await rt.runUntilPause(state);
    // 承認ノード: 事前承認が有効なら自動続行(監査ログに記録される)
    while (state.status === "waiting_approval" && schedule.autoApprove) {
      state.auditLog.push({
        atMs: Date.now(),
        event: "pre_approved",
        detail: "定例実行の登録時に人間が事前承認済み(自動続行)",
      });
      state = await rt.runUntilPause(rt.approve(state));
    }
    if (state.status === "completed") {
      for (const w of state.brainWrites) {
        recordMemory({ category: "work", actor: "agent-scheduler", action: w.action, detail: w.detail, tags: ["agent-schedule", schedule.id] });
      }
      recordMemory({
        category: "work",
        actor: "agent-scheduler",
        action: `定例実行完了: ${schedule.title}`,
        detail: (state.finalReport ?? "").slice(0, 200),
        tags: ["agent-schedule", schedule.id],
      });
      // 無料コネクタ(Webhook)設定時のみ実通知(未設定なら何も送らない)
      void sendAgentNotification(`定例実行完了: ${schedule.title}`, state.finalReport ?? "").catch(() => undefined);
      void notifyOs("Musasabi — 定例実行完了", schedule.title).catch(() => undefined);
    }
    log = {
      atMs: startedAt,
      status: state.status === "completed" ? "completed" : state.status === "waiting_approval" ? "waiting_approval" : "blocked",
      brainName: state.brainName,
      report: state.finalReport ?? state.steps[state.steps.length - 1]?.output ?? "",
    };
  } catch (error) {
    appLogger.warn("scheduled agent run failed", { error: String(error) });
    log = { atMs: startedAt, status: "error", brainName: "-", report: String(error) };
  }
  const updated: AgentSchedule = {
    ...schedule,
    lastRunMs: startedAt,
    runs: [log, ...schedule.runs].slice(0, MAX_RUN_LOGS),
  };
  upsertSchedule(updated);
  return updated;
}

/** 期限が来た有効スケジュールをすべて実行する。実行した件数を返す。 */
export async function runDueSchedules(nowMs = Date.now()): Promise<number> {
  let ran = 0;
  for (const s of loadSchedules()) {
    if (!s.enabled) continue;
    if (nextRunMs(s) > nowMs) continue;
    await runScheduleNow(s);
    ran += 1;
  }
  return ran;
}

let tickerStarted = false;

/**
 * 定例実行+自動バックアップの監視を開始する(アプリ起動中・60秒間隔)。多重起動しない。
 * 起動5秒後に1回キャッチアップ実行(未起動中に期限が過ぎた分を回収)。
 * ※常駐はデスクトップアプリの起動に依存する(OSサービス化は本番ロードマップ)。
 */
export function startAgentScheduler(): void {
  if (tickerStarted || typeof window === "undefined") return;
  tickerStarted = true;
  const tick = (): void => {
    void runDueSchedules().catch((e) => appLogger.warn("scheduler tick failed", { error: String(e) }));
    void runBackupIfDue().catch((e) => appLogger.warn("auto backup tick failed", { error: String(e) }));
  };
  // 起動キャッチアップ: 未起動中に期限が過ぎた定例・バックアップを起動直後に実行
  window.setTimeout(tick, 5 * 1000);
  window.setInterval(tick, 60 * 1000);
}
