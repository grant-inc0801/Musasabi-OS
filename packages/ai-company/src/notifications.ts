import { COMMAND_DEPARTMENTS, deptIcon, type CommandDepartment } from "./commandCenter";
import { buildApprovalQueue } from "./operations";
import { buildSupportKpi, SUPPORT_TICKETS } from "./supportDesk";
import { DEV_PROJECTS } from "./devProjects";
import { VAULT_ITEMS, computeVaultSummary } from "./knowledgeVault";

// D-018 Notifications & Alerts: 全社の要注目事項を通知(アラート)として集約する。
// 承認待ち・エラー・容量注意などを一元化し、既読管理は localStorage 側で行う。すべてMock。

export type NotificationLevel = "承認" | "エラー" | "注意" | "情報";

export const NOTIFICATION_LEVEL_COLOR: Record<NotificationLevel, string> = {
  承認: "#A855F7",
  エラー: "#EF4444",
  注意: "#FACC15",
  情報: "#3b82f6",
};

/** 通知(アラート)1件。id は決定的で、既読管理のキーになる。 */
export interface NotificationItem {
  id: string;
  level: NotificationLevel;
  icon: string;
  title: string;
  detail: string;
}

/**
 * 全社の通知を決定的に構築する。
 * - 承認: 承認キュー(部署/ワークフロー/コラボ)
 * - エラー: 開発部のエラー対応案件
 * - 注意: 保管庫の容量ステータスが正常でない / 未対応サポートが一定以上
 */
export function buildNotifications(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): NotificationItem[] {
  const items: NotificationItem[] = [];

  for (const a of buildApprovalQueue(departments)) {
    items.push({
      id: `approval-${a.id}`,
      level: "承認",
      icon: a.icon,
      title: a.title,
      detail: `${a.source}: ${a.detail}`,
    });
  }

  for (const p of DEV_PROJECTS.filter((x) => x.status === "エラー対応")) {
    items.push({
      id: `error-${p.id}`,
      level: "エラー",
      icon: deptIcon("development"),
      title: `開発案件のエラー: ${p.name}`,
      detail: p.note,
    });
  }

  const vault = computeVaultSummary(VAULT_ITEMS);
  if (vault.status !== "正常") {
    items.push({
      id: "vault-capacity",
      level: "注意",
      icon: "🗄",
      title: `保管庫の容量が${vault.status}です`,
      detail: `使用率${vault.usagePercent}%(${vault.itemCount}件)`,
    });
  }

  const support = buildSupportKpi(SUPPORT_TICKETS);
  if (support.openCount > 0) {
    items.push({
      id: "support-open",
      level: "注意",
      icon: deptIcon("support"),
      title: `未対応の問い合わせが${support.openCount}件`,
      detail: "サポート部で対応が必要です",
    });
  }

  return items;
}

/** 既読ID集合を除いた未読通知を返す。 */
export function unreadNotifications(
  items: readonly NotificationItem[],
  readIds: ReadonlySet<string>,
): NotificationItem[] {
  return items.filter((i) => !readIds.has(i.id));
}

/** 既読ID配列(JSON)から Set を復元する。壊れた入力は空。 */
export function parseReadIds(json: string | null): Set<string> {
  if (!json) return new Set();
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}
