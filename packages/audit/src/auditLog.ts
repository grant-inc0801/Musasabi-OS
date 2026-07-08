// 監査ログ(AI_ORGANIZATION_STRUCTURE.md「keep audit logs」/ AI_AUDIT_AND_RISK_GOVERNANCE.md)。
// 経営・監査の意思決定(エスカレーション・一時停止提案・レビュー要求・承認・是正)を
// 追記型(append-only・イミュータブル)で記録する。決定論・Mock。本番データは変更しない。

import type { AuditFinding } from "./index";
import { FINDING_CATEGORY_LABEL_JA } from "./index";

/** 監査ログのイベント種別。 */
export type AuditLogEventType =
  | "escalation"
  | "pause_recommended"
  | "review_requested"
  | "approval"
  | "corrective_action";

export const AUDIT_LOG_EVENT_LABEL_JA: Record<AuditLogEventType, string> = {
  escalation: "エスカレーション",
  pause_recommended: "一時停止提案",
  review_requested: "レビュー要求",
  approval: "承認",
  corrective_action: "是正アクション",
};

/** 監査ログの1エントリ(追記型)。 */
export interface AuditLogEntry {
  timestampMs: number;
  eventType: AuditLogEventType;
  /** 実行主体(例: AI監査 / AI CEO)。 */
  actor: string;
  /** 対象(部門・所見ID等)。 */
  target: string;
  detail: string;
  /** 関連する監査所見ID(あれば)。 */
  findingId?: string;
}

/** 監査ログへ追記する(新配列・最新が先頭)。 */
export function appendAuditLog(log: readonly AuditLogEntry[], entry: AuditLogEntry): AuditLogEntry[] {
  return [entry, ...log];
}

/**
 * 監査所見から監査ログのイベントを導出する(決定論)。
 * - 高/重大かつ未是正: 一時停止提案 + AI CEO と AI監査へエスカレーション
 * - 未是正: レビュー要求
 * - 是正済み: 是正アクション記録
 * nowMs を基準に finding index で時刻をずらして安定した順序にする。
 */
export function deriveAuditLog(
  findings: readonly AuditFinding[],
  nowMs = 0,
): AuditLogEntry[] {
  let log: AuditLogEntry[] = [];
  findings.forEach((f, i) => {
    const base = nowMs + i;
    const categoryJa = FINDING_CATEGORY_LABEL_JA[f.category];
    if ((f.severity === "high" || f.severity === "critical") && f.status !== "corrected") {
      log = appendAuditLog(log, {
        timestampMs: base,
        eventType: "pause_recommended",
        actor: "AI監査",
        target: f.department,
        detail: `${categoryJa}(${f.severity})に対し高リスク操作の一時停止を提案(承認待ち)。`,
        findingId: f.id,
      });
      log = appendAuditLog(log, {
        timestampMs: base,
        eventType: "escalation",
        actor: "AI監査",
        target: "AI CEO / AI監査委員会",
        detail: `${f.department}の重大リスクをAI CEOおよびAI監査へエスカレーション。`,
        findingId: f.id,
      });
    } else if (f.status !== "corrected") {
      log = appendAuditLog(log, {
        timestampMs: base,
        eventType: "review_requested",
        actor: "AI監査",
        target: f.department,
        detail: `${categoryJa}のレビューを要求。推奨: ${f.recommendedAction}`,
        findingId: f.id,
      });
    } else {
      log = appendAuditLog(log, {
        timestampMs: base,
        eventType: "corrective_action",
        actor: f.department,
        target: f.id,
        detail: `是正済み: ${f.recommendedAction}`,
        findingId: f.id,
      });
    }
  });
  return log;
}
