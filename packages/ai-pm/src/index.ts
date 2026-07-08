// Phase 4: Autonomous Enterprise(Directive D-20260708-005)。
// AI PM が部門横断で改善提案を優先順位付けし、実行キューをレビューゲート付きで管理する。
// 高インパクトな操作は人間承認を必須とし、意思決定は監査可能。すべて決定論・Mock。

/** 提案カテゴリ。 */
export type ProposalCategory = "process" | "automation" | "quality" | "revenue" | "cost";

export const PROPOSAL_CATEGORY_LABEL_JA: Record<ProposalCategory, string> = {
  process: "業務プロセス",
  automation: "自動化",
  quality: "品質",
  revenue: "売上",
  cost: "コスト",
};

/** AI PM が扱う改善提案。 */
export interface AiPmProposal {
  id: string;
  title: string;
  /** 発案元部門。 */
  department: string;
  category: ProposalCategory;
  /** 効果(1-5、大きいほど良い)。 */
  impact: number;
  /** 労力(1-5、大きいほど重い)。 */
  effort: number;
  /** 本番/財務/法務/外部影響など、人間承認が必要か。 */
  requiresApproval: boolean;
}

/** 実行キューのステージ。 */
export type ExecutionStage =
  | "proposed"
  | "queued"
  | "in_review"
  | "approved"
  | "blocked"
  | "done";

export const EXECUTION_STAGE_LABEL_JA: Record<ExecutionStage, string> = {
  proposed: "提案",
  queued: "実行待ち",
  in_review: "レビュー中",
  approved: "承認済み",
  blocked: "保留(承認待ち)",
  done: "完了",
};

/** 優先度スコア(効果 - 労力の重み付け)。高いほど優先。決定論。 */
export function priorityScore(p: AiPmProposal): number {
  return p.impact * 2 - p.effort;
}

/** 提案を優先度降順で並べる(同点は id 昇順で安定化)。 */
export function prioritizeProposals(proposals: readonly AiPmProposal[]): AiPmProposal[] {
  return [...proposals].sort((a, b) => {
    const d = priorityScore(b) - priorityScore(a);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
}

/** 実行キュー項目。 */
export interface ExecutionItem {
  proposal: AiPmProposal;
  stage: ExecutionStage;
  rank: number;
}

/**
 * 提案から実行キューを構築する。レビューゲート:
 * requiresApproval の提案は自動で "blocked"(承認待ち)、それ以外は上位を "queued"。
 */
export function buildExecutionQueue(
  proposals: readonly AiPmProposal[],
  activeSlots = 3,
): ExecutionItem[] {
  const ordered = prioritizeProposals(proposals);
  let queued = 0;
  return ordered.map((proposal, i) => {
    let stage: ExecutionStage;
    if (proposal.requiresApproval) {
      stage = "blocked";
    } else if (queued < activeSlots) {
      stage = "queued";
      queued += 1;
    } else {
      stage = "proposed";
    }
    return { proposal, stage, rank: i + 1 };
  });
}

/** 提案を承認する(承認後は in_review → 実行可能状態へ)。 */
export function approveProposal(item: ExecutionItem): ExecutionItem {
  if (item.stage !== "blocked") return item;
  return { ...item, stage: "approved" };
}

// ---- 部門KPI(Phase 4 objective) ----

export interface DepartmentKpi {
  department: string;
  /** 稼働率(0-100)。 */
  utilizationPercent: number;
  /** 完了タスク数。 */
  completedTasks: number;
  /** 保留タスク数。 */
  pendingTasks: number;
}

/** AI社員パフォーマンス(Mock)。 */
export interface EmployeePerformance {
  employee: string;
  department: string;
  /** スコア(0-100)。 */
  score: number;
}

// ---- 経営サマリー(Executive report) ----

export interface ExecutiveSummary {
  totalProposals: number;
  approvalPending: number;
  activeExecution: number;
  topPriority: AiPmProposal | null;
  /** 部門KPIの平均稼働率。 */
  avgUtilization: number;
  /** 日次/EOD 用の要約行。 */
  lines: string[];
}

/** 経営サマリーを組み立てる(決定論)。 */
export function buildExecutiveSummary(
  proposals: readonly AiPmProposal[],
  kpis: readonly DepartmentKpi[],
): ExecutiveSummary {
  const queue = buildExecutionQueue(proposals);
  const approvalPending = queue.filter((q) => q.stage === "blocked").length;
  const activeExecution = queue.filter((q) => q.stage === "queued").length;
  const ordered = prioritizeProposals(proposals);
  const avgUtilization =
    kpis.length === 0
      ? 0
      : Math.round(kpis.reduce((s, k) => s + k.utilizationPercent, 0) / kpis.length);
  const lines: string[] = [];
  lines.push(`本日の改善提案は${proposals.length}件、うち承認待ちが${approvalPending}件です。`);
  if (ordered[0]) {
    lines.push(`最優先は「${ordered[0].title}」(${ordered[0].department})です。`);
  }
  lines.push(`部門平均稼働率は約${avgUtilization}%、実行中タスクは${activeExecution}件です。`);
  return {
    totalProposals: proposals.length,
    approvalPending,
    activeExecution,
    topPriority: ordered[0] ?? null,
    avgUtilization,
    lines,
  };
}

// ---- Mock データ ----

export const MOCK_PROPOSALS: readonly AiPmProposal[] = [
  { id: "p-01", title: "架電スクリプトのA/Bテスト自動化", department: "営業部門", category: "automation", impact: 5, effort: 2, requiresApproval: false },
  { id: "p-02", title: "出版校正の類似性チェック強化", department: "出版部門", category: "quality", impact: 4, effort: 3, requiresApproval: false },
  { id: "p-03", title: "会計ソフト本番連携の有効化", department: "管理部門", category: "process", impact: 5, effort: 4, requiresApproval: true },
  { id: "p-04", title: "サポートFAQ自動生成", department: "カスタマーサポート部門", category: "automation", impact: 3, effort: 2, requiresApproval: false },
  { id: "p-05", title: "広告費の再配分(実出稿)", department: "管理部門", category: "revenue", impact: 4, effort: 3, requiresApproval: true },
];

export const MOCK_DEPARTMENT_KPIS: readonly DepartmentKpi[] = [
  { department: "営業部門", utilizationPercent: 78, completedTasks: 12, pendingTasks: 3 },
  { department: "出版部門", utilizationPercent: 64, completedTasks: 6, pendingTasks: 4 },
  { department: "開発部門", utilizationPercent: 82, completedTasks: 9, pendingTasks: 2 },
  { department: "カスタマーサポート部門", utilizationPercent: 55, completedTasks: 8, pendingTasks: 5 },
];
