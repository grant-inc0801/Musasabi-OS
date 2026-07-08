import { COMMAND_DEPARTMENTS, type CommandDepartment } from "./commandCenter";
import { buildWorkflowSummary } from "./workflow";
import { buildCollaborationSummary } from "./collaboration";
import { buildSupportKpi, SUPPORT_TICKETS } from "./supportDesk";
import { buildDevKpi, DEV_PROJECTS } from "./devProjects";

// D-014 Desktop Assistant & Workspace: デスクトップアシスタントの「本日のダイジェスト」。
// 全社の要注目事項(承認待ち・進行中ワークフロー・未対応サポート・開発エラー)を
// 横断的に集約する。ワークスペース画面とアバター吹き出しの両方で使う。すべてMock。

export interface WorkspaceCounts {
  /** 承認待ちの部署数。 */
  approvals: number;
  /** 進行中ワークフロー数。 */
  runningWorkflows: number;
  /** 未対応の問い合わせ数。 */
  openSupport: number;
  /** エラー対応中の開発案件数。 */
  devErrors: number;
  /** 対応中のコラボ項目数。 */
  collabInProgress: number;
}

export interface WorkspaceDigest {
  counts: WorkspaceCounts;
  /** 箇条書きの要約(日本語)。 */
  lines: string[];
}

/** 本日のダイジェストを構築する(営業部の実データを反映したい場合は departments を渡す)。 */
export function buildDailyDigest(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): WorkspaceDigest {
  const approvals = departments.filter((d) => d.status === "waiting_approval");
  const wf = buildWorkflowSummary();
  const collab = buildCollaborationSummary();
  const support = buildSupportKpi(SUPPORT_TICKETS);
  const dev = buildDevKpi(DEV_PROJECTS);

  const counts: WorkspaceCounts = {
    approvals: approvals.length,
    runningWorkflows: wf.running,
    openSupport: support.openCount,
    devErrors: dev.errorCount,
    collabInProgress: collab.inProgress,
  };

  const lines: string[] = [];
  if (approvals.length > 0) {
    lines.push(`承認待ちが${approvals.length}部署あります(${approvals.map((d) => d.name).join("・")})。`);
  }
  if (wf.running > 0) {
    lines.push(`進行中のワークフローが${wf.running}件、承認待ちが${wf.waitingApproval}件あります。`);
  }
  if (support.openCount > 0) {
    lines.push(`未対応の問い合わせが${support.openCount}件あります。`);
  }
  if (dev.errorCount > 0) {
    lines.push(`開発部でエラー対応中の案件が${dev.errorCount}件あります。`);
  }
  if (collab.inProgress > 0) {
    lines.push(`部署間の連携が${collab.inProgress}件進行中です。`);
  }
  if (lines.length === 0) {
    lines.push("本日の要対応事項はありません。順調に稼働しています。");
  }
  return { counts, lines };
}

/** アバター吹き出し等で使う、ダイジェストの日本語行。 */
export function buildDailyDigestJa(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): string[] {
  return buildDailyDigest(departments).lines;
}
