import {
  RoutineRecorder,
  markRoutineRun,
  parseRoutines,
  serializeRoutines,
  upsertRoutine,
} from "@musasabi/automation";
import type { AutomationRoutine } from "@musasabi/automation";
import { appLogger } from "./appLogger";

// Automation のローカル永続化と記録フック(この端末のlocalStorageのみ。外部送信なし)。
// recorder はアプリ全体で1つ。記録開始〜停止の間のみページ遷移が記録される
// (手動オプトイン。常時記録はしない)。

const STORAGE_KEY = "musasabi.automationRoutines";

export const routineRecorder = new RoutineRecorder();

/** ページ遷移を記録候補として通知する(記録中でなければ無視される)。 */
export function noteNavigation(target: string, label: string): void {
  routineRecorder.record({ kind: "navigate", target, label, timestampMs: Date.now() });
}

export function loadRoutines(): AutomationRoutine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : parseRoutines(raw);
  } catch (error) {
    appLogger.warn("failed to load automation routines; starting empty", { error: String(error) });
    return [];
  }
}

export function saveRoutine(routine: AutomationRoutine): AutomationRoutine[] {
  try {
    const next = upsertRoutine(loadRoutines(), routine);
    localStorage.setItem(STORAGE_KEY, serializeRoutines(next));
    return next;
  } catch (error) {
    appLogger.warn("failed to persist automation routines", { error: String(error) });
    return loadRoutines();
  }
}

// ---- ミニパネル(アバターウィンドウ)との連携 ----
// 記録・再実行はメイン画面側で実行される。アバターウィンドウは同一オリジンの
// localStorage(storage イベント)経由で遠隔コマンドを送り、状態フラグを読む。

/** 記録中フラグ(アバター側のランプ表示用)。 */
export const AUTOMATION_RECORDING_KEY = "musasabi.automationRecording";
/** 遠隔コマンド(アバター→メイン)。JSON {cmd, name?, id?, ts}。 */
export const AUTOMATION_COMMAND_KEY = "musasabi.automationCommand";
/** 最後に実行完了したルーチン(メイン→アバター)。JSON {id, name, ts}。 */
export const AUTOMATION_LAST_RUN_KEY = "musasabi.automationLastRun";

export type AutomationCommand =
  | { cmd: "start"; ts: number }
  | { cmd: "stop"; name: string; ts: number }
  | { cmd: "replay"; id: string; ts: number };

export function sendAutomationCommand(command: AutomationCommand): void {
  try {
    localStorage.setItem(AUTOMATION_COMMAND_KEY, JSON.stringify(command));
  } catch (error) {
    appLogger.warn("failed to send automation command", { error: String(error) });
  }
}

export function isRecordingFlagOn(): boolean {
  try {
    return localStorage.getItem(AUTOMATION_RECORDING_KEY) === "1";
  } catch {
    return false;
  }
}

/** 記録開始(記録中フラグも更新。AutomationページとミニパネルUIの両方が使う)。 */
export function startRecording(nowMs: number): void {
  routineRecorder.start(nowMs);
  try {
    localStorage.setItem(AUTOMATION_RECORDING_KEY, "1");
  } catch {
    /* 表示用フラグのみなので失敗は無視 */
  }
}

/** 記録停止して保存。保存したルーチン(無ければ null)を返す。 */
export function stopRecordingAndSave(name: string, nowMs: number): AutomationRoutine | null {
  const routine = routineRecorder.stop(name, nowMs);
  try {
    localStorage.setItem(AUTOMATION_RECORDING_KEY, "0");
  } catch {
    /* 同上 */
  }
  if (routine !== null) {
    saveRoutine(routine);
  }
  return routine;
}

/** ルーチンを順に再実行する(メイン画面側)。 */
export function replayRoutine(
  routine: AutomationRoutine,
  onNavigate: (page: string) => void,
  stepMs = 500,
): void {
  saveRoutine(markRoutineRun(routine));
  routine.steps.forEach((step, i) => {
    setTimeout(() => {
      onNavigate(step.target);
      if (i === routine.steps.length - 1) {
        try {
          localStorage.setItem(
            AUTOMATION_LAST_RUN_KEY,
            JSON.stringify({ id: routine.id, name: routine.name, ts: Date.now() }),
          );
        } catch {
          /* 通知用のみ */
        }
        // 実行結果サマリーを保管庫へ自動保存+実イベント記録(成果物ループの完結)
        void (async () => {
          try {
            const { saveAgentDocToVault } = await import("./vaultStorage");
            const { pushAppEvent } = await import("./appEvents");
            saveAgentDocToVault({
              title: `自動化実行: ${routine.name}`,
              text: [
                `自動化ルーチン「${routine.name}」を再実行しました(${new Date().toLocaleString("ja-JP")})。`,
                `手順: ${routine.steps.map((s, n) => `${n + 1}. ${s.label}`).join(" → ")}`,
                `累計実行回数: ${routine.runCount + 1}回`,
              ].join("\n"),
              tags: ["agent", "automation"],
            });
            pushAppEvent({ level: "info", title: "自動化ルーチン実行完了", detail: routine.name });
          } catch {
            /* 保存失敗でも再実行自体は完了している */
          }
        })();
      }
    }, stepMs * (i + 1));
  });
}

/**
 * メイン画面でミニパネルからの遠隔コマンドを受け付ける。
 * App 起動時に1回だけ呼ぶ。解除関数を返す。
 */
export function installAutomationRemoteControl(onNavigate: (page: string) => void): () => void {
  const handler = (event: StorageEvent): void => {
    if (event.key !== AUTOMATION_COMMAND_KEY || event.newValue === null) return;
    try {
      const command = JSON.parse(event.newValue) as AutomationCommand;
      if (command.cmd === "start") {
        startRecording(Date.now());
      } else if (command.cmd === "stop") {
        stopRecordingAndSave(command.name, Date.now());
      } else if (command.cmd === "replay") {
        const routine = loadRoutines().find((r) => r.id === command.id);
        if (routine) {
          replayRoutine(routine, onNavigate);
        }
      }
    } catch (error) {
      appLogger.warn("failed to handle automation command", { error: String(error) });
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
