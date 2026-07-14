// 本日の実データダイジェスト(本番・完全ローカル)。
// 実イベント・保管庫・予測的中率・定例実行・Brain記録の「今日の動き」を
// localStorage の実データから集計し、ワークスペースで一望+読み上げできる文面にする。

import { loadAppEvents } from "./appEvents";
import { loadVaultDocs } from "./vaultStorage";
import { forecastAccuracyStats } from "./forecastTracking";
import { loadSchedules } from "./agentSchedule";
import { loadMemoryRecords } from "./memoryStorage";

export interface TodayDigest {
  /** 箇条書き行(画面表示用)。 */
  lines: string[];
  /** 未読の要対応(warn/error)イベントのタイトル(最大3件)。 */
  attentionTitles: string[];
  /** 読み上げ用の一文。 */
  speech: string;
}

/** チャット文からの「今日の動き」コマンド判定(今日何した?/本日の動きは? など)。 */
export function isTodayDigestQuery(message: string): boolean {
  const normalized = message.replace(/[??!!。\s]/g, "");
  return /^(今日|本日)(は|の)?(何|なに|動き|状況|サマリー?|ダイジェスト)(を|が|は)?(した|やった|あった|どう|教えて)?$/.test(
    normalized,
  );
}

/** チャット返信用の「今日の動き」文面(決定論・LLM不要)。 */
export function buildTodayDigestReply(nowMs = Date.now()): string {
  const digest = buildTodayDigest(nowMs);
  const lines = digest.lines.map((l) => `・${l}`);
  const attention =
    digest.attentionTitles.length > 0
      ? `\n⚠ 未読の要対応: ${digest.attentionTitles.join(" / ")}(通知センターで確認できます)`
      : "\n要対応はありません。";
  return `📋 今日の動き(実データ):\n${lines.join("\n")}${attention}`;
}

function startOfTodayMs(nowMs: number): number {
  const d = new Date(nowMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 今日の実データダイジェストを組み立てる(決定論・外部送信なし)。 */
export function buildTodayDigest(nowMs = Date.now()): TodayDigest {
  const since = startOfTodayMs(nowMs);
  const lines: string[] = [];

  // 実イベント(今日)
  const events = loadAppEvents();
  const todayEvents = events.filter((e) => e.atMs >= since);
  const unreadAttention = events.filter((e) => !e.read && e.level !== "info");
  lines.push(
    todayEvents.length === 0
      ? "今日の実イベントはまだありません。"
      : `今日の実イベントは${todayEvents.length}件(うち要対応${todayEvents.filter((e) => e.level !== "info").length}件)。`,
  );

  // 保管庫(今日の追加)
  const vaultDocs = loadVaultDocs();
  const todayDocs = vaultDocs.filter((d) => d.createdAtMs >= since);
  lines.push(
    `保管庫は${vaultDocs.length}件${todayDocs.length > 0 ? `(今日${todayDocs.length}件追加)` : ""}。`,
  );

  // 予測的中率
  const stats = forecastAccuracyStats();
  if (stats.total > 0) {
    lines.push(
      `予測の的中率は${stats.hitRatePercent === null ? "未判定" : `${stats.hitRatePercent}%`}` +
        `${stats.pending > 0 ? `(判定待ち${stats.pending}件)` : ""}。`,
    );
  }

  // 定例実行(今日走った回数)
  const schedules = loadSchedules();
  const todayRuns = schedules.flatMap((s) => s.runs).filter((r) => r.atMs >= since);
  if (schedules.length > 0) {
    const errors = todayRuns.filter((r) => r.status === "error").length;
    lines.push(
      `定例実行は${schedules.filter((s) => s.enabled).length}件有効・今日${todayRuns.length}回実行` +
        `${errors > 0 ? `(エラー${errors}件)` : ""}。`,
    );
  }

  // Brain 記録(今日)
  const todayMemories = loadMemoryRecords().filter((r) => r.timestampMs >= since);
  lines.push(`Company Brain への記録は今日${todayMemories.length}件。`);

  const attentionTitles = unreadAttention.slice(0, 3).map((e) => e.title);
  const speech =
    `本日のダイジェストです。` +
    lines.join("") +
    (attentionTitles.length > 0 ? `未読の要対応が${unreadAttention.length}件あります。` : "要対応はありません。");

  return { lines, attentionTitles, speech };
}
