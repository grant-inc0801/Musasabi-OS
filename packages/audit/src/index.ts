// AI Audit and Risk Governance(docs/ai-handoff/AI_AUDIT_AND_RISK_GOVERNANCE.md)。
// 独立した AI 監査機能。ワークフロー実行・ガバナンス遵守・運用リスクを継続監視し、
// 異常・ポリシー違反・KPI整合性・承認遵守を検知して監査所見を出す。
// 権限: リスク警告・レビュー要求・高リスク操作の一時停止提案(人間承認前提)。
// 本番データは直接変更しない。すべて決定論・Mock。

/** 監査所見のカテゴリ。 */
export type FindingCategory =
  | "anomaly"
  | "policy_violation"
  | "kpi_integrity"
  | "approval_compliance"
  | "operational_risk";

export const FINDING_CATEGORY_LABEL_JA: Record<FindingCategory, string> = {
  anomaly: "異常検知",
  policy_violation: "ポリシー違反",
  kpi_integrity: "KPI整合性",
  approval_compliance: "承認遵守",
  operational_risk: "運用リスク",
};

/** 重大度。 */
export type Severity = "low" | "medium" | "high" | "critical";

export const SEVERITY_LABEL_JA: Record<Severity, string> = {
  low: "低",
  medium: "中",
  high: "高",
  critical: "重大",
};

const SEVERITY_WEIGHT: Record<Severity, number> = { low: 1, medium: 3, high: 6, critical: 10 };

/** 是正状況。 */
export type CorrectiveStatus = "open" | "reviewing" | "corrected";

export const CORRECTIVE_STATUS_LABEL_JA: Record<CorrectiveStatus, string> = {
  open: "未対応",
  reviewing: "レビュー中",
  corrected: "是正済み",
};

/** 監査所見。 */
export interface AuditFinding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  department: string;
  description: string;
  status: CorrectiveStatus;
  /** 是正・予防の推奨アクション。 */
  recommendedAction: string;
}

/** 高リスク(high/critical かつ未是正)は一時停止の提案対象。監査は直接停止しない。 */
export function shouldRecommendPause(finding: AuditFinding): boolean {
  return (finding.severity === "high" || finding.severity === "critical") && finding.status !== "corrected";
}

/** 部門リスクスコア(未是正所見の重大度合計)。決定論。 */
export function departmentRiskScore(
  department: string,
  findings: readonly AuditFinding[],
): number {
  return findings
    .filter((f) => f.department === department && f.status !== "corrected")
    .reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
}

/** 全部門のリスクスコアを算出し降順で返す。 */
export function rankDepartmentRisk(findings: readonly AuditFinding[]): Array<{ department: string; score: number }> {
  const depts = [...new Set(findings.map((f) => f.department))];
  return depts
    .map((department) => ({ department, score: departmentRiskScore(department, findings) }))
    .sort((a, b) => b.score - a.score);
}

/** ポリシー遵守率(%)。承認遵守・ポリシー違反の未是正が減点。 */
export function policyCompliancePercent(findings: readonly AuditFinding[]): number {
  const policyFindings = findings.filter(
    (f) => f.category === "policy_violation" || f.category === "approval_compliance",
  );
  if (policyFindings.length === 0) return 100;
  const open = policyFindings.filter((f) => f.status !== "corrected").length;
  return Math.round(((policyFindings.length - open) / policyFindings.length) * 100);
}

// ---- 監査レポート ----

export type AuditPeriod = "daily" | "weekly" | "monthly";

export const AUDIT_PERIOD_LABEL_JA: Record<AuditPeriod, string> = {
  daily: "日次",
  weekly: "週次",
  monthly: "月次",
};

export interface AuditReport {
  period: AuditPeriod;
  totalFindings: number;
  openFindings: number;
  bySeverity: Record<Severity, number>;
  pauseRecommendations: number;
  policyCompliancePercent: number;
  topRiskDepartment: string | null;
  lines: string[];
}

/** 監査レポートを生成する(決定論)。 */
export function buildAuditReport(period: AuditPeriod, findings: readonly AuditFinding[]): AuditReport {
  const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 } as Record<Severity, number>;
  for (const f of findings) bySeverity[f.severity] += 1;
  const openFindings = findings.filter((f) => f.status !== "corrected").length;
  const pauseRecommendations = findings.filter(shouldRecommendPause).length;
  const ranked = rankDepartmentRisk(findings);
  const topRiskDepartment = ranked.length > 0 && ranked[0].score > 0 ? ranked[0].department : null;
  const compliance = policyCompliancePercent(findings);
  const lines: string[] = [];
  lines.push(
    `${AUDIT_PERIOD_LABEL_JA[period]}監査: 所見${findings.length}件中${openFindings}件が未是正、一時停止提案は${pauseRecommendations}件です。`,
  );
  lines.push(`ポリシー遵守率は${compliance}%です。`);
  if (topRiskDepartment) {
    lines.push(`最もリスクが高いのは${topRiskDepartment}です。人間承認のうえレビューを推奨します。`);
  }
  return {
    period,
    totalFindings: findings.length,
    openFindings,
    bySeverity,
    pauseRecommendations,
    policyCompliancePercent: compliance,
    topRiskDepartment,
    lines,
  };
}

// ---- Mock データ ----

export const MOCK_FINDINGS: readonly AuditFinding[] = [
  { id: "f-01", category: "approval_compliance", severity: "high", department: "管理部門", description: "会計本番連携の有効化が承認前に実行キューへ入っていた。", status: "reviewing", recommendedAction: "承認ゲートを再確認し、承認まで実行を保留する。" },
  { id: "f-02", category: "kpi_integrity", severity: "medium", department: "マーケティング部門", description: "リード獲得数の集計元が一部欠損している可能性。", status: "open", recommendedAction: "集計ソースを再検証し、欠損期間を補正する。" },
  { id: "f-03", category: "anomaly", severity: "critical", department: "開発部門", description: "beta-build のエラー率が閾値を大幅超過(異常検知)。", status: "open", recommendedAction: "高リスクのため該当パイプラインの一時停止を提案(人間承認)。" },
  { id: "f-04", category: "policy_violation", severity: "low", department: "営業部門", description: "架電スクリプトのテスト記録に軽微な記入漏れ。", status: "corrected", recommendedAction: "記録テンプレートの必須項目化。" },
  { id: "f-05", category: "operational_risk", severity: "medium", department: "カスタマーサポート部門", description: "未対応チケットの滞留が増加傾向。", status: "open", recommendedAction: "一次対応の自動化候補を評価し、リソースを再配分する。" },
];

export * from "./auditLog";
