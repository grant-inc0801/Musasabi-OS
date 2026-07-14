// 全社レポートの実データセクション(本番・完全ローカル・決定論)。
// 保管庫・予測的中率・実イベント・定例実行の実データを集計し、
// レポートの Markdown / JSON エクスポートへ組み込む。

import { VAULT_CAPACITY_CHARS, loadVaultDocs, vaultUsageChars } from "./vaultStorage";
import { forecastAccuracyStats, type ForecastAccuracyStats } from "./forecastTracking";
import { loadAppEvents } from "./appEvents";
import { loadSchedules } from "./agentSchedule";

export interface RealDataReport {
  vault: {
    docCount: number;
    usageChars: number;
    usagePercent: number;
    bySource: { upload: number; planning: number; agent: number };
  };
  forecastAccuracy: ForecastAccuracyStats;
  events: { total: number; unread: number; attention: number };
  schedules: { enabled: number; totalRuns: number; errorRuns: number };
}

/** 実データを集計する(決定論)。 */
export function collectRealDataReport(): RealDataReport {
  const docs = loadVaultDocs();
  const usage = vaultUsageChars(docs);
  const events = loadAppEvents();
  const schedules = loadSchedules();
  const runs = schedules.flatMap((s) => s.runs);
  return {
    vault: {
      docCount: docs.length,
      usageChars: usage,
      usagePercent: Math.min(100, Math.round((usage / VAULT_CAPACITY_CHARS) * 100)),
      bySource: {
        upload: docs.filter((d) => d.source === "upload").length,
        planning: docs.filter((d) => d.source === "planning").length,
        agent: docs.filter((d) => d.source === "agent").length,
      },
    },
    forecastAccuracy: forecastAccuracyStats(),
    events: {
      total: events.length,
      unread: events.filter((e) => !e.read).length,
      attention: events.filter((e) => !e.read && e.level !== "info").length,
    },
    schedules: {
      enabled: schedules.filter((s) => s.enabled).length,
      totalRuns: runs.length,
      errorRuns: runs.filter((r) => r.status === "error").length,
    },
  };
}

/** 実データセクションの Markdown を組み立てる。 */
export function renderRealDataMarkdown(data = collectRealDataReport()): string {
  const fa = data.forecastAccuracy;
  const lines = [
    "## 実データサマリー(本番機能)",
    "",
    `### 🗄 保管庫(Knowledge Vault)`,
    `- 保管文書: ${data.vault.docCount}件(使用率${data.vault.usagePercent}%)`,
    `- 出所内訳: ファイル取込${data.vault.bySource.upload} / 企画部${data.vault.bySource.planning} / エージェント${data.vault.bySource.agent}`,
    "",
    `### ⚖ 予測の的中率`,
    fa.total === 0
      ? "- 記録された予測はまだありません"
      : `- 的中率: ${fa.hitRatePercent === null ? "未判定" : `${fa.hitRatePercent}%`}(的中${fa.hit}・部分${fa.partial}・外れ${fa.miss}・判定待ち${fa.pending})`,
    ...(fa.avgPlausibilityHit !== null && fa.avgPlausibilityMiss !== null
      ? [
          `- 較正の妥当性: 的中平均実現性${fa.avgPlausibilityHit}% / 外れ平均実現性${fa.avgPlausibilityMiss}%` +
            (fa.avgPlausibilityMiss >= fa.avgPlausibilityHit ? "(⚠ 楽観寄り)" : "(妥当)"),
        ]
      : []),
    "",
    `### 🔔 実イベント`,
    `- 記録: ${data.events.total}件(未読${data.events.unread}件・うち要対応${data.events.attention}件)`,
    "",
    `### ⏰ 定例実行`,
    `- 有効スケジュール: ${data.schedules.enabled}件 / 実行ログ${data.schedules.totalRuns}件(エラー${data.schedules.errorRuns}件)`,
  ];
  return lines.join("\n");
}
