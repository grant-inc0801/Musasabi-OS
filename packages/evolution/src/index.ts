// Phase 7: Self-Evolving AI(Directive D-20260708-008)。
// Musasabi AI が自身の運用を分析し改善提案を自動生成、AI PM が優先順位付けし、
// ドラフト実装計画(ドラフトIssue)を生成する。高インパクトな変更は人間承認必須。
// すべて決定論・Mock。実際のIssue作成・本番変更は行わない(ドラフト生成のみ)。

/** 改善提案の観点。 */
export type ImprovementKind =
  | "workflow"
  | "automation"
  | "quality"
  | "knowledge"
  | "performance";

export const IMPROVEMENT_KIND_LABEL_JA: Record<ImprovementKind, string> = {
  workflow: "ワークフロー最適化",
  automation: "自動化",
  quality: "品質改善",
  knowledge: "ナレッジ強化",
  performance: "パフォーマンス",
};

/** 自動生成される改善提案。 */
export interface ImprovementProposal {
  id: string;
  title: string;
  kind: ImprovementKind;
  /** 根拠となる観測(Mock)。 */
  rationale: string;
  /** 効果(1-5)。 */
  impact: number;
  /** 想定リスク(1-5、高いほど承認必須寄り)。 */
  risk: number;
}

/** 高インパクト/高リスクは人間承認が必要。 */
export function requiresHumanApproval(p: ImprovementProposal): boolean {
  return p.risk >= 4 || p.impact >= 5;
}

/** 提案スコア(効果 - リスク*0.5)。決定論。 */
export function improvementScore(p: ImprovementProposal): number {
  return p.impact - p.risk * 0.5;
}

/** 提案をスコア降順で優先順位付け(同点id昇順)。 */
export function prioritizeImprovements(
  proposals: readonly ImprovementProposal[],
): ImprovementProposal[] {
  return [...proposals].sort((a, b) => {
    const d = improvementScore(b) - improvementScore(a);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
}

/** ドラフトIssue(実際には作成しない・生成のみ)。 */
export interface DraftIssue {
  title: string;
  body: string;
  labels: readonly string[];
  requiresApproval: boolean;
}

/** 改善提案からドラフトIssueを生成する(決定論)。 */
export function generateDraftIssue(p: ImprovementProposal): DraftIssue {
  const approval = requiresHumanApproval(p);
  const body = [
    `## 背景`,
    p.rationale,
    ``,
    `## 種別`,
    IMPROVEMENT_KIND_LABEL_JA[p.kind],
    ``,
    `## 想定効果 / リスク`,
    `- 効果: ${p.impact}/5`,
    `- リスク: ${p.risk}/5`,
    ``,
    `## 提案する実装ステップ(ドラフト)`,
    `1. 現状の計測とベースライン取得`,
    `2. Mock で改善案を実装`,
    `3. テスト追加と検証`,
    `4. ${approval ? "**人間承認後に**" : ""}段階的に反映`,
    ``,
    approval
      ? `> ⚠️ 高インパクト/高リスクのため、人間承認が必須です。`
      : `> 承認不要の安全な改善として扱えます。`,
  ].join("\n");
  return {
    title: `[改善提案] ${p.title}`,
    body,
    labels: ["improvement", `kind:${p.kind}`, approval ? "approval-required" : "safe"],
    requiresApproval: approval,
  };
}

// ---- ナレッジ品質スコアリング ----

export interface KnowledgeItem {
  id: string;
  title: string;
  /** 文字数など内容量の指標。 */
  contentLength: number;
  /** 最終更新からの経過日数。 */
  ageDays: number;
  /** 参照回数。 */
  references: number;
}

export interface KnowledgeScore {
  id: string;
  /** 0-100。 */
  score: number;
  grade: "A" | "B" | "C" | "D";
  /** 改善の要否。 */
  needsRefresh: boolean;
}

/**
 * ナレッジの品質スコア(決定論)。
 * 内容量・新しさ・参照数から算出し、古く参照の少ないものは needsRefresh。
 */
export function scoreKnowledge(item: KnowledgeItem): KnowledgeScore {
  const contentScore = Math.min(40, Math.round(item.contentLength / 25)); // 最大40
  const freshness = Math.max(0, 30 - Math.round(item.ageDays / 3)); // 最大30、90日で0
  const usage = Math.min(30, item.references * 3); // 最大30
  const score = Math.max(0, Math.min(100, contentScore + freshness + usage));
  const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
  return { id: item.id, score, grade, needsRefresh: item.ageDays > 60 && item.references < 3 };
}

// ---- サマリー ----

export interface EvolutionSummary {
  totalProposals: number;
  approvalRequired: number;
  autoApplicable: number;
  topProposal: ImprovementProposal | null;
  knowledgeNeedingRefresh: number;
}

export function buildEvolutionSummary(
  proposals: readonly ImprovementProposal[],
  knowledge: readonly KnowledgeItem[],
): EvolutionSummary {
  const ordered = prioritizeImprovements(proposals);
  const approvalRequired = proposals.filter(requiresHumanApproval).length;
  const knowledgeNeedingRefresh = knowledge.map(scoreKnowledge).filter((k) => k.needsRefresh).length;
  return {
    totalProposals: proposals.length,
    approvalRequired,
    autoApplicable: proposals.length - approvalRequired,
    topProposal: ordered[0] ?? null,
    knowledgeNeedingRefresh,
  };
}

// ---- Mock データ ----

export const MOCK_IMPROVEMENTS: readonly ImprovementProposal[] = [
  { id: "i-01", title: "承認待ちの滞留を検知して通知", kind: "workflow", rationale: "承認待ちが平均2.4日滞留している観測から。", impact: 4, risk: 2 },
  { id: "i-02", title: "架電リスト抽出のキャッシュ化", kind: "performance", rationale: "同一条件の再検索が多い。", impact: 3, risk: 1 },
  { id: "i-03", title: "会計本番連携の自動仕訳", kind: "automation", rationale: "手動仕訳の工数が大きい。", impact: 5, risk: 4 },
  { id: "i-04", title: "FAQナレッジの鮮度スコア導入", kind: "knowledge", rationale: "古いFAQの参照でサポート品質が低下。", impact: 3, risk: 2 },
];

export const MOCK_KNOWLEDGE: readonly KnowledgeItem[] = [
  { id: "k-01", title: "架電トーク基本", contentLength: 1200, ageDays: 10, references: 15 },
  { id: "k-02", title: "旧料金表", contentLength: 400, ageDays: 120, references: 1 },
  { id: "k-03", title: "出版クリーン運営", contentLength: 900, ageDays: 40, references: 6 },
];
