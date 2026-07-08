// Phase 11: Musasabi AGI(docs/ai-handoff/PHASE11_MUSASABI_AGI.md)。
// 協調的なAI組織として、改善提案・ワークフロー再編・部門/AI社員の新設提案・
// Company Brain 進化・戦略立案支援を、ガバナンス(承認・監査ログ)下で行う。
// 重要な変更は人間承認必須。自律的な本番デプロイはしない。すべて決定論・Mock。

/** AGI 提案の種別。 */
export type AgiProposalKind =
  | "self_optimization"
  | "workflow"
  | "department_creation"
  | "employee_creation"
  | "brain_evolution"
  | "strategy";

export const AGI_PROPOSAL_KIND_LABEL_JA: Record<AgiProposalKind, string> = {
  self_optimization: "自己最適化",
  workflow: "ワークフロー提案",
  department_creation: "部門新設提案",
  employee_creation: "AI社員新設提案",
  brain_evolution: "Company Brain進化",
  strategy: "戦略立案",
};

/** 影響度。significant は人間承認必須。 */
export type ImpactLevel = "minor" | "moderate" | "significant";

/** AGI が生成する提案。 */
export interface AgiProposal {
  id: string;
  kind: AgiProposalKind;
  title: string;
  rationale: string;
  impact: ImpactLevel;
  /** 期待効果(1-5)。 */
  expectedBenefit: number;
}

/** 重要な変更(significant)または 部門/AI社員新設は人間承認必須。 */
export function requiresApproval(p: AgiProposal): boolean {
  return (
    p.impact === "significant" ||
    p.kind === "department_creation" ||
    p.kind === "employee_creation"
  );
}

/** 提案の優先度スコア(期待効果 - 影響リスク)。決定論。 */
export function agiProposalScore(p: AgiProposal): number {
  const impactPenalty = p.impact === "significant" ? 2 : p.impact === "moderate" ? 1 : 0;
  return p.expectedBenefit - impactPenalty;
}

export function prioritizeAgiProposals(proposals: readonly AgiProposal[]): AgiProposal[] {
  return [...proposals].sort((a, b) => {
    const d = agiProposalScore(b) - agiProposalScore(a);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
}

// ---- Musasabi Constitution(憲章) ----

/** 憲章条項。AGI 提案はこれに反してはならない。 */
export const MUSASABI_CONSTITUTION: readonly string[] = [
  "人間承認なしに本番デプロイ・実課金・実データ変更を行わない。",
  "重要な変更は必ず人間の承認を得る。",
  "すべての自律的意思決定の監査ログを保持する。",
  "secrets・認証情報を露出・保存しない。",
  "安全性と説明可能性を最優先する。",
];

/** 提案が憲章に適合するか(決定論)。significant は承認前提でのみ適合。 */
export interface ConstitutionCheck {
  compliant: boolean;
  requiresApproval: boolean;
  notes: string[];
}

export function checkAgainstConstitution(p: AgiProposal): ConstitutionCheck {
  const notes: string[] = [];
  const approval = requiresApproval(p);
  if (approval) {
    notes.push("重要度が高いため、人間承認を得るまで実行しない。");
  }
  notes.push("監査ログを保持する。");
  notes.push("自律的な本番デプロイは行わない。");
  // Mock 提案はいずれも承認・監査前提で適合(実操作をしないため)。
  return { compliant: true, requiresApproval: approval, notes };
}

// ---- AI CEO 戦略立案支援 ----

export interface StrategicPlan {
  /** 承認待ちの提案数。 */
  approvalPending: number;
  /** 自動適用可(minor)の提案数。 */
  autoApplicable: number;
  /** 最優先提案。 */
  topProposal: AgiProposal | null;
  /** 戦略サマリー行。 */
  lines: string[];
}

/** AI CEO 向けの戦略プランを組み立てる(決定論)。 */
export function buildStrategicPlan(proposals: readonly AgiProposal[]): StrategicPlan {
  const ordered = prioritizeAgiProposals(proposals);
  const approvalPending = proposals.filter(requiresApproval).length;
  const autoApplicable = proposals.length - approvalPending;
  const lines: string[] = [];
  lines.push(`AGIは${proposals.length}件の提案を生成、うち${approvalPending}件が人間承認待ちです。`);
  if (ordered[0]) {
    lines.push(`最優先は「${ordered[0].title}」(${AGI_PROPOSAL_KIND_LABEL_JA[ordered[0].kind]})です。`);
  }
  lines.push("重要な変更は承認後にのみ反映し、監査ログを保持します。自律的な本番デプロイは行いません。");
  return {
    approvalPending,
    autoApplicable,
    topProposal: ordered[0] ?? null,
    lines,
  };
}

// ---- Mock データ ----

export const MOCK_AGI_PROPOSALS: readonly AgiProposal[] = [
  { id: "a-01", kind: "self_optimization", title: "承認待ち滞留の自動検知と通知", rationale: "承認待ちが平均2.4日滞留。", impact: "minor", expectedBenefit: 4 },
  { id: "a-02", kind: "workflow", title: "出版校正フローに類似性チェックを常設", rationale: "酷似リスク低減。", impact: "moderate", expectedBenefit: 4 },
  { id: "a-03", kind: "department_creation", title: "カスタマーサクセス部門の新設提案", rationale: "解約率低減と継続支援。", impact: "significant", expectedBenefit: 5 },
  { id: "a-04", kind: "employee_creation", title: "AIリーガルチェッカーの新設提案", rationale: "出版・契約の法務確認。", impact: "significant", expectedBenefit: 4 },
  { id: "a-05", kind: "brain_evolution", title: "Company Brain のナレッジ鮮度スコア導入", rationale: "古いナレッジの参照低減。", impact: "moderate", expectedBenefit: 3 },
  { id: "a-06", kind: "strategy", title: "出版×営業のクロスセル戦略", rationale: "既存顧客への追加提案。", impact: "moderate", expectedBenefit: 4 },
];
