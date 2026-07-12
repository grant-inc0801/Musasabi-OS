// エージェント定例実行(本番・完全ローカル)。
// スケジューラに登録された目標を、アプリ起動中に期限が来たら実際に
// AgentRuntime(ローカルLLM頭脳 or ルールベース)で自律実行し、
// 結果を Company Brain へ保存する。承認ノードは「登録時の事前承認」フラグが
// 有効な場合のみ自動続行し、その旨を監査ログへ残す(無効なら承認待ちで停止)。
// 課金なし・外部送信なし。

import { AgentRuntime, detectBrain } from "@musasabi/agent-runtime";
import { buildAgentTools } from "./agentTools";
import { loadLlmSettings } from "./llmSettings";
import { resolveLlmFetch } from "./llmFetch";
import { recordMemory } from "./memoryStorage";
import { appLogger } from "./appLogger";

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

/** スケジュール1件を今すぐ実行する(手動/定時共通の実実行)。 */
export async function runScheduleNow(schedule: AgentSchedule): Promise<AgentSchedule> {
  const startedAt = Date.now();
  let log: ScheduleRunLog;
  try {
    const brain = await detectBrain(loadLlmSettings(), await resolveLlmFetch());
    const rt = new AgentRuntime({ provider: brain.provider, tools: buildAgentTools() });
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
 * 定例実行の監視を開始する(アプリ起動中のみ・60秒間隔)。多重起動しない。
 * ※常駐はデスクトップアプリの起動に依存する(OSサービス化は本番ロードマップ)。
 */
export function startAgentScheduler(): void {
  if (tickerStarted || typeof window === "undefined") return;
  tickerStarted = true;
  window.setInterval(() => {
    void runDueSchedules().catch((e) => appLogger.warn("scheduler tick failed", { error: String(e) }));
  }, 60 * 1000);
}
