import {
  COMMAND_DEPARTMENTS,
  deptIcon,
  summarizeCompany,
  type CommandDepartment,
} from "./commandCenter";
import { COMPANY_WORKFLOWS } from "./workflow";
import { COLLAB_ITEMS } from "./collaboration";
import { buildWorkflowSummary } from "./workflow";
import { buildCollaborationSummary } from "./collaboration";

// D-016 AI Company Operation: 会社運営ビュー。承認待ちを一元化した承認キューと、
// 稼働状況の総括を提供する。各機能(部署/ワークフロー/コラボ)を束ねる。すべてMock。

export type ApprovalSource = "部署" | "ワークフロー" | "コラボレーション";

/** 承認キューの1項目。 */
export interface ApprovalItem {
  id: string;
  source: ApprovalSource;
  icon: string;
  title: string;
  detail: string;
}

/**
 * 全社の承認待ちを一元化する。
 * - 部署: status === "waiting_approval"
 * - ワークフロー: ステップ status === "承認待ち"
 * - コラボレーション: status === "承認待ち"(承認依頼など)
 */
export function buildApprovalQueue(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): ApprovalItem[] {
  const items: ApprovalItem[] = [];

  for (const d of departments.filter((x) => x.status === "waiting_approval")) {
    items.push({
      id: `dept-${d.id}`,
      source: "部署",
      icon: deptIcon(d.id),
      title: `${d.name}の承認待ち`,
      detail: d.tasks[0] ?? "承認待ちのタスクがあります",
    });
  }

  for (const wf of COMPANY_WORKFLOWS) {
    for (const step of wf.steps.filter((s) => s.status === "承認待ち")) {
      items.push({
        id: `wf-${wf.id}-${step.action}`,
        source: "ワークフロー",
        icon: deptIcon(step.deptId),
        title: `${wf.name}: ${step.action}`,
        detail: `${step.deptName}が承認待ちです`,
      });
    }
  }

  for (const c of COLLAB_ITEMS.filter((x) => x.status === "承認待ち")) {
    items.push({
      id: `collab-${c.id}`,
      source: "コラボレーション",
      icon: deptIcon(c.toDeptId),
      title: c.title,
      detail: `${c.fromDept} → ${c.toDept}(${c.type})`,
    });
  }

  return items;
}

export interface OperationsOverview {
  totalMembers: number;
  activeMembers: number;
  utilizationPercent: number;
  runningWorkflows: number;
  workflowApprovals: number;
  collabInProgress: number;
  collabApprovals: number;
  approvalQueueCount: number;
}

/** 会社運営の総括。各サマリーを束ねる。 */
export function buildOperationsOverview(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): OperationsOverview {
  const overview = summarizeCompany(departments);
  const wf = buildWorkflowSummary();
  const collab = buildCollaborationSummary();
  return {
    totalMembers: overview.totalMembers,
    activeMembers: overview.activeMembers,
    utilizationPercent: overview.utilizationPercent,
    runningWorkflows: wf.running,
    workflowApprovals: wf.waitingApproval,
    collabInProgress: collab.inProgress,
    collabApprovals: collab.waitingApproval,
    approvalQueueCount: buildApprovalQueue(departments).length,
  };
}
