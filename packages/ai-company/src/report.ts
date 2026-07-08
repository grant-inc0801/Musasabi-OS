import { COMMAND_DEPARTMENTS, type CommandDepartment } from "./commandCenter";
import { buildCompanyDashboard } from "./companyDashboard";
import { buildOperationsOverview } from "./operations";
import { buildWorkflowSummary } from "./workflow";
import { buildCollaborationSummary } from "./collaboration";

// D-017 Reporting & Analytics: 全社レポートを生成する。各機能の集計を束ね、
// 構造化データ+Markdown文字列で提供する。すべてMock・外部送信なし。

export interface CompanyReport {
  generatedAtMs: number;
  overview: ReturnType<typeof buildOperationsOverview>;
  departments: { name: string; status: string; metrics: { label: string; value: string }[] }[];
  workflow: ReturnType<typeof buildWorkflowSummary>;
  collaboration: ReturnType<typeof buildCollaborationSummary>;
}

/** 全社レポートを構築する(営業部の実データを反映したい場合は departments を渡す)。 */
export function buildCompanyReport(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
  nowMs: number = Date.now(),
): CompanyReport {
  const dashboard = buildCompanyDashboard(departments);
  return {
    generatedAtMs: nowMs,
    overview: buildOperationsOverview(departments),
    departments: dashboard.departments.map((d) => ({
      name: d.name,
      status: d.statusLabel,
      metrics: d.metrics,
    })),
    workflow: buildWorkflowSummary(),
    collaboration: buildCollaborationSummary(),
  };
}

/** レポートを日本語 Markdown に整形する。 */
export function renderReportMarkdown(report: CompanyReport): string {
  const d = new Date(report.generatedAtMs);
  const stamp = d.toLocaleString("ja-JP");
  const o = report.overview;
  const lines: string[] = [];
  lines.push(`# Musasabi OS 全社レポート`);
  lines.push("");
  lines.push(`生成日時: ${stamp}`);
  lines.push("");
  lines.push(`## 運営サマリー`);
  lines.push(`- 全社員数: ${o.totalMembers}人(稼働中 ${o.activeMembers}人 / 稼働率 ${o.utilizationPercent}%)`);
  lines.push(`- 承認待ち(合計): ${o.approvalQueueCount}件`);
  lines.push(`- 進行中ワークフロー: ${o.runningWorkflows}件(承認待ち ${o.workflowApprovals}件)`);
  lines.push(`- 部署間連携: 進行中 ${o.collabInProgress}件 / 承認待ち ${o.collabApprovals}件`);
  lines.push("");
  lines.push(`## 部署別KPI`);
  for (const dep of report.departments) {
    const metrics = dep.metrics.map((m) => `${m.label} ${m.value}`).join(" / ");
    lines.push(`- ${dep.name}(${dep.status}): ${metrics}`);
  }
  lines.push("");
  lines.push(`## ワークフロー`);
  lines.push(`- 総数 ${report.workflow.total}件 / 進行中 ${report.workflow.running}件 / 承認待ち ${report.workflow.waitingApproval}件 / 平均進捗 ${report.workflow.averageProgressPercent}%`);
  lines.push("");
  lines.push(`## コラボレーション`);
  lines.push(`- 連携項目 ${report.collaboration.totalItems}件 / 対応中 ${report.collaboration.inProgress}件 / 承認待ち ${report.collaboration.waitingApproval}件`);
  lines.push(`- 共有ナレッジ ${report.collaboration.sharedKnowledgeCount}件(採用延べ ${report.collaboration.adoptionCount}部署)`);
  lines.push("");
  lines.push(`> 本レポートはMock構成に基づく集計です(実API接続・外部送信なし)。`);
  lines.push("");
  return lines.join("\n");
}
