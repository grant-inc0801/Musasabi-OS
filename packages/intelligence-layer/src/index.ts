// Musasabi Intelligence Layer(docs/ai-handoff/MUSASABI_INTELLIGENCE_LAYER_DIRECTIVE.md)。
// Company Brain の上位レイヤーとして、判断品質・ナレッジ関係・ワークフロー設計・説明可能性を
// 全AI社員へ提供する。構成: AI Policy Engine / Knowledge Graph / Workflow Composer /
// Explainability Center。すべて Mock・決定論。実外部変更・本番接続・secrets なし。
// 実ポリシー強制・実ワークフロー実行は Production Readiness 承認後のみ(承認ゲート経由)。

import type { SecretaryItem } from "@musasabi/ai-secretary";

// ═══════════════════════ 1. AI Policy Engine ═══════════════════════

/** 管理ルール13種(指示書 Managed Rules)。 */
export type RuleCategory =
  | "constitution" | "dna" | "mission" | "vision" | "values" | "brand"
  | "decision" | "approval" | "security" | "department" | "budget" | "risk" | "kpi";

export const RULE_CATEGORY_LABEL_JA: Record<RuleCategory, string> = {
  constitution: "会社憲章", dna: "Company DNA", mission: "ミッション", vision: "ビジョン",
  values: "バリュー", brand: "ブランドルール", decision: "意思決定原則", approval: "承認ルール",
  security: "セキュリティルール", department: "部署ルール", budget: "予算ルール",
  risk: "リスクルール", kpi: "KPIルール",
};

/** ルール優先度(高いほど優先。上位が下位を上書き)。 */
export type RuleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const RULE_LEVEL_LABEL_JA: Record<RuleLevel, string> = {
  1: "会社憲章", 2: "Company DNA", 3: "ポリシー", 4: "部署ルール", 5: "ワークフロールール", 6: "個別AIルール",
};

export interface PolicyRule {
  id: string;
  category: RuleCategory;
  /** 優先度(1が最上位)。 */
  level: RuleLevel;
  text: string;
}

export const POLICY_RULES: readonly PolicyRule[] = [
  { id: "pr-constitution-approval", category: "constitution", level: 1, text: "本番デプロイ・実課金・実外部接続は人間承認まで一切行わない。" },
  { id: "pr-constitution-audit", category: "constitution", level: 1, text: "重要な意思決定と承認は監査ログに記録する。" },
  { id: "pr-dna-mockfirst", category: "dna", level: 2, text: "Mockファースト。内部検証の後にのみ統合する。" },
  { id: "pr-mission", category: "mission", level: 3, text: "中小企業の営業活動をAIで底上げする。" },
  { id: "pr-vision", category: "vision", level: 3, text: "AI社員が運営する自律型カンパニーOSを実現する。" },
  { id: "pr-values", category: "values", level: 3, text: "透明性・説明可能性・人間の最終承認を尊重する。" },
  { id: "pr-brand", category: "brand", level: 3, text: "ダークガンメタル+メタリックのUIで統一する。" },
  { id: "pr-decision", category: "decision", level: 3, text: "重要な提案は Intelligence Layer の検証を経てから実行する。" },
  { id: "pr-approval-high", category: "approval", level: 3, text: "高インパクト/高リスクの提案は人間承認を必須とする。" },
  { id: "pr-security-secrets", category: "security", level: 3, text: "secrets は論理参照名のみ。値の表示・記録・コミットを禁止する。" },
  { id: "pr-department-sales", category: "department", level: 4, text: "営業部: 実架電は行わない(テストコールのみ)。" },
  { id: "pr-budget", category: "budget", level: 4, text: "Mockフェーズでは費用が発生する処理を行わない。" },
  { id: "pr-risk", category: "risk", level: 4, text: "リスク『高』の提案は自動適用しない。" },
  { id: "pr-kpi", category: "kpi", level: 4, text: "KPIの集計元が欠損した場合は警告を出し数値を確定しない。" },
];

/** 判定対象の提案(Decision Validation の入力)。 */
export interface DecisionInput {
  id: string;
  title: string;
  department: string;
  /** 実外部変更を伴うか。 */
  external: boolean;
  /** 費用が発生するか。 */
  paid: boolean;
  /** インパクト/リスク(low/medium/high)。 */
  impact: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
}

export interface DecisionValidation {
  decisionId: string;
  allowed: boolean;
  approvalRequired: boolean;
  riskEstimate: "low" | "medium" | "high";
  checkedPolicies: readonly string[];
  violations: readonly string[];
  note: string;
}

/**
 * 重要提案の事前検証(指示書 Decision Validation)。
 * 1) 関連ポリシー確認 → 2) 承認要否 → 3) リスク見積 → 4) Explainability へ送付 → 5) Mock で許可時のみ続行。
 */
export function validateDecision(d: DecisionInput): DecisionValidation {
  const checked: string[] = ["pr-constitution-approval", "pr-decision", "pr-risk"];
  const violations: string[] = [];
  if (d.external) violations.push("pr-constitution-approval");
  if (d.paid) { checked.push("pr-budget"); violations.push("pr-budget"); }
  const approvalRequired = d.impact === "high" || d.risk === "high" || d.external || d.paid;
  if (approvalRequired) checked.push("pr-approval-high");
  const allowed = violations.length === 0;
  return {
    decisionId: d.id,
    allowed,
    approvalRequired,
    riskEstimate: d.risk,
    checkedPolicies: checked,
    violations,
    note: allowed
      ? approvalRequired
        ? "Mockでは続行可。実行には人間承認が必要。"
        : "ポリシー適合。Mockで続行可。"
      : "ポリシー違反のため実行不可(Mockでも実外部変更・課金は禁止)。",
  };
}

// ═══════════════════════ 2. Knowledge Graph ═══════════════════════

/** ノード種別14種(指示書 Node Types)。 */
export type NodeType =
  | "department" | "ai_employee" | "customer" | "project" | "issue" | "workflow"
  | "brain_item" | "knowledge_item" | "secret_ref" | "api_integration" | "kpi"
  | "report" | "avatar" | "business_unit";

export const NODE_TYPE_LABEL_JA: Record<NodeType, string> = {
  department: "部署", ai_employee: "AI社員", customer: "顧客", project: "プロジェクト",
  issue: "Issue", workflow: "ワークフロー", brain_item: "Company Brain", knowledge_item: "ナレッジ",
  secret_ref: "シークレット参照", api_integration: "API連携", kpi: "KPI", report: "レポート",
  avatar: "アバター", business_unit: "事業ユニット",
};

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

/** Mock ノード(MEISHI-TUBE の事業ユニット連携を含む)。 */
export const GRAPH_NODES: readonly GraphNode[] = [
  { id: "dept-sales", type: "department", label: "営業部" },
  { id: "dept-research", type: "department", label: "市場調査部" },
  { id: "dept-marketing", type: "department", label: "マーケティング部" },
  { id: "dept-dev", type: "department", label: "システム開発部" },
  { id: "ai-salescoach", type: "ai_employee", label: "セールスコーチAI" },
  { id: "ai-research", type: "ai_employee", label: "リサーチAI" },
  { id: "ai-marketing", type: "ai_employee", label: "マーケティングAI" },
  { id: "bu-meishi-tube", type: "business_unit", label: "MEISHI-TUBE" },
  { id: "prj-meishi-launch", type: "project", label: "MEISHI-TUBE ローンチ" },
  { id: "wf-launch", type: "workflow", label: "新サービス立ち上げフロー" },
  { id: "cust-restaurant", type: "customer", label: "飲食店セグメント" },
  { id: "rep-launch", type: "report", label: "ローンチ週次レポート" },
  { id: "kn-best-cta", type: "knowledge_item", label: "ベストCTAパターン" },
  { id: "kpi-leads", type: "kpi", label: "リード獲得数" },
  { id: "sec-openai", type: "secret_ref", label: "secret:openai_api_key(参照名のみ)" },
  { id: "int-sns", type: "api_integration", label: "SNS連携(Mock・未接続)" },
  { id: "brain-decision-1", type: "brain_item", label: "意思決定: 事例記事を週1配信" },
];

export const GRAPH_EDGES: readonly GraphEdge[] = [
  { from: "ai-salescoach", to: "dept-sales", relation: "所属" },
  { from: "ai-research", to: "dept-research", relation: "所属" },
  { from: "ai-marketing", to: "dept-marketing", relation: "所属" },
  { from: "dept-marketing", to: "prj-meishi-launch", relation: "所有" },
  { from: "bu-meishi-tube", to: "prj-meishi-launch", relation: "事業ユニット" },
  { from: "prj-meishi-launch", to: "wf-launch", relation: "使用" },
  { from: "wf-launch", to: "rep-launch", relation: "作成" },
  { from: "cust-restaurant", to: "prj-meishi-launch", relation: "関連" },
  { from: "kn-best-cta", to: "brain-decision-1", relation: "根拠" },
  { from: "sec-openai", to: "int-sns", relation: "参照(実値なし)" },
  { from: "prj-meishi-launch", to: "kpi-leads", relation: "計測" },
];

/** あるノードに直接つながるノードを返す(関連検索)。 */
export function relatedNodes(nodeId: string, nodes: readonly GraphNode[] = GRAPH_NODES, edges: readonly GraphEdge[] = GRAPH_EDGES): GraphNode[] {
  const ids = new Set<string>();
  for (const e of edges) {
    if (e.from === nodeId) ids.add(e.to);
    if (e.to === nodeId) ids.add(e.from);
  }
  return nodes.filter((n) => ids.has(n.id));
}

/** 推奨の根拠をたどる(ナレッジ→意思決定の追跡)。 */
export function traceDecision(brainItemId: string, edges: readonly GraphEdge[] = GRAPH_EDGES): GraphEdge[] {
  return edges.filter((e) => e.to === brainItemId && e.relation === "根拠");
}

// ═══════════════════════ 3. Workflow Composer ═══════════════════════

/** ワークフローノード種別13種(指示書 Node Types)。 */
export type WorkflowNodeType =
  | "ai_employee" | "department" | "approval" | "condition" | "timer" | "scheduler"
  | "api_integration" | "secret_ref" | "report" | "notification" | "dashboard_update"
  | "brain_write" | "audit_check";

export const WF_NODE_LABEL_JA: Record<WorkflowNodeType, string> = {
  ai_employee: "AI社員", department: "部署", approval: "承認", condition: "条件", timer: "タイマー",
  scheduler: "スケジューラ", api_integration: "API連携", secret_ref: "シークレット参照",
  report: "レポート", notification: "通知", dashboard_update: "ダッシュボード更新",
  brain_write: "Company Brain 保存", audit_check: "監査チェック",
};

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: readonly WorkflowNode[];
  /** ノードIDの接続(from→to)。 */
  edges: ReadonlyArray<{ from: string; to: string }>;
}

/** テンプレート(指示書 Example Workflow を含む)。 */
export const WORKFLOW_TEMPLATES: readonly WorkflowTemplate[] = [
  {
    id: "wf-new-service",
    name: "新サービス立ち上げ(例示フロー)",
    description: "営業部 → 市場調査部 → マーケティング部 → AI CEO承認 → 開発部 → AI監査。",
    nodes: [
      { id: "n1", type: "department", label: "営業部(提案)" },
      { id: "n2", type: "department", label: "市場調査部(調査)" },
      { id: "n3", type: "department", label: "マーケティング部(販促案)" },
      { id: "n4", type: "approval", label: "AI CEO 承認" },
      { id: "n5", type: "department", label: "開発部(実装Mock)" },
      { id: "n6", type: "audit_check", label: "AI監査" },
      { id: "n7", type: "brain_write", label: "Company Brain 保存" },
      { id: "n8", type: "notification", label: "AI秘書へ通知" },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" },
      { from: "n4", to: "n5" }, { from: "n5", to: "n6" }, { from: "n6", to: "n7" }, { from: "n7", to: "n8" },
    ],
  },
  {
    id: "wf-weekly-report",
    name: "週次レポート自動化",
    description: "スケジューラ起点で各部KPIを集約し、レポート作成→ダッシュボード更新→通知。",
    nodes: [
      { id: "m1", type: "scheduler", label: "毎週月曜 9:00" },
      { id: "m2", type: "ai_employee", label: "レポートAI" },
      { id: "m3", type: "condition", label: "KPI欠損チェック" },
      { id: "m4", type: "report", label: "週次レポート" },
      { id: "m5", type: "dashboard_update", label: "全社ダッシュボード更新" },
      { id: "m6", type: "notification", label: "AI秘書へ通知" },
    ],
    edges: [
      { from: "m1", to: "m2" }, { from: "m2", to: "m3" }, { from: "m3", to: "m4" },
      { from: "m4", to: "m5" }, { from: "m5", to: "m6" },
    ],
  },
];

/** テンプレートの妥当性(承認ノードの有無・接続の破れ)を検査する。 */
export function validateWorkflow(t: WorkflowTemplate): { ok: boolean; hasApproval: boolean; danglingEdges: number } {
  const ids = new Set(t.nodes.map((n) => n.id));
  const dangling = t.edges.filter((e) => !ids.has(e.from) || !ids.has(e.to)).length;
  const hasApproval = t.nodes.some((n) => n.type === "approval");
  return { ok: dangling === 0, hasApproval, danglingEdges: dangling };
}

// ═══════════════════════ 4. Explainability Center ═══════════════════════

/** 説明可能性スコア(0-100)。 */
export interface ExplainabilityScores {
  confidence: number;
  evidenceStrength: number;
  risk: number;
  cost: number;
  expectedBenefit: number;
}

/** 説明レポート(指示書 Required Fields 13項目)。 */
export interface ExplainabilityReport {
  id: string;
  recommendation: string;
  reason: string;
  evidence: string;
  usedKnowledge: string;
  usedPolicy: string;
  usedWorkflow: string;
  kpiImpact: string;
  risk: string;
  roi: string;
  confidence: number;
  expectedBenefit: string;
  requiredApproval: boolean;
  nextAction: string;
  scores: ExplainabilityScores;
}

export const EXPLAINABILITY_REPORTS: readonly ExplainabilityReport[] = [
  {
    id: "ex-case-article",
    recommendation: "導入事例記事を週1で配信する",
    reason: "高スコア投稿の分析で事例型コンテンツのエンゲージ予測が最も高いため。",
    evidence: "マーケPDCA: 事例note記事の総合スコアが平均+12。",
    usedKnowledge: "ベストCTAパターン / ベスト投稿時間帯",
    usedPolicy: "ブランドルール / 承認ルール",
    usedWorkflow: "週次レポート自動化",
    kpiImpact: "リード獲得数 +8%(Mock予測)",
    risk: "低(Mock配信のみ・本番投稿はロック)",
    roi: "工数小・期待効果中",
    confidence: 78,
    expectedBenefit: "継続的なリード創出",
    requiredApproval: true,
    nextAction: "AI CEO承認 → Mock予約を生成",
    scores: { confidence: 78, evidenceStrength: 74, risk: 18, cost: 20, expectedBenefit: 72 },
  },
  {
    id: "ex-meishi-focus",
    recommendation: "MEISHI-TUBE を飲食店セグメントへ集中",
    reason: "Knowledge Graph 上で顧客(飲食店)とプロジェクトの関連が最も強いため。",
    evidence: "市場調査レポート: 機会スコア64・未対応セグメント需要を確認。",
    usedKnowledge: "市場調査レポート(予約×販促パック)",
    usedPolicy: "意思決定原則 / リスクルール",
    usedWorkflow: "新サービス立ち上げ(例示フロー)",
    kpiImpact: "商談化率 +5%(Mock予測)",
    risk: "中(セグメント集中の機会損失)",
    roi: "投資中・期待効果中",
    confidence: 64,
    expectedBenefit: "刺さるセグメントでの初期実績",
    requiredApproval: true,
    nextAction: "市場調査の追補 → AI CEO承認",
    scores: { confidence: 64, evidenceStrength: 60, risk: 42, cost: 45, expectedBenefit: 66 },
  },
];

/** 説明可能性が弱い(確信度/根拠が低い)レポートを抽出する。 */
export function weakExplainability(reports: readonly ExplainabilityReport[] = EXPLAINABILITY_REPORTS, threshold = 70): ExplainabilityReport[] {
  return reports.filter((r) => r.scores.confidence < threshold || r.scores.evidenceStrength < threshold);
}

// ═══════════════════ 5. AI 秘書 / 6. AI 監査 / 7. CEO 統合 ═══════════════════

/** AI秘書へ送るインテリジェンス項目(統一カード形式)。 */
export function buildIntelligenceSecretaryItems(): SecretaryItem[] {
  const weak = weakExplainability();
  const items: SecretaryItem[] = [
    {
      id: "intel-policy-violation", category: "risk_alert",
      sourceDepartment: "Intelligence Layer", relatedAiEmployee: "AI Policy Engine",
      status: "in_review", priority: "high",
      summary: "実課金を伴う提案がポリシー違反として遮断されました(Mock)。",
      reason: "予算ルール: Mockフェーズでは費用が発生する処理を行わない。",
      recommendedAction: "提案を無償スコープに再設計。", approvalNeeded: false,
      expectedImpact: "統制の維持。", riskLevel: "medium", suggestedNextStep: "再設計後に再検証。",
    },
    {
      id: "intel-new-link", category: "workflow_improvement",
      sourceDepartment: "Intelligence Layer", relatedAiEmployee: "Knowledge Graph",
      status: "proposed", priority: "low",
      summary: "新しいナレッジリンク: ベストCTA → 週次配信の意思決定。",
      reason: "高スコア投稿のナレッジが意思決定の根拠として接続された。",
      recommendedAction: "Company Brain で確認。", approvalNeeded: false,
      expectedImpact: "説明可能性の向上。", riskLevel: "low", suggestedNextStep: "リンクを確認。",
    },
    {
      id: "intel-wf-proposal", category: "department_proposal",
      sourceDepartment: "Intelligence Layer", relatedAiEmployee: "Workflow Composer",
      status: "waiting_approval", priority: "medium",
      summary: "『新サービス立ち上げフロー』テンプレートの適用提案。",
      reason: "MEISHI-TUBE ローンチに例示フロー(承認・監査込み)が適合。",
      recommendedAction: "テンプレートを適用し AI CEO 承認へ。", approvalNeeded: true,
      expectedImpact: "立ち上げの標準化。", riskLevel: "low", suggestedNextStep: "承認へ回付。",
    },
  ];
  for (const w of weak) {
    items.push({
      id: `intel-weak-${w.id}`, category: "kpi_warning",
      sourceDepartment: "Intelligence Layer", relatedAiEmployee: "Explainability Center",
      status: "in_review", priority: "medium",
      summary: `説明可能性が弱い提案: ${w.recommendation}(確信度${w.scores.confidence})。`,
      reason: "確信度または根拠強度が閾値未満。",
      recommendedAction: "追加の根拠(調査/実績)を収集。", approvalNeeded: false,
      expectedImpact: "承認判断の質向上。", riskLevel: "medium", suggestedNextStep: "根拠を追補して再評価。",
    });
  }
  return items;
}

/** AI監査の監視対象(指示書 AI Audit Integration)。 */
export const AUDIT_MONITORS: readonly string[] = [
  "ポリシー変更", "ワークフロー変更", "ナレッジグラフ変更",
  "説明可能性の品質", "ルール違反", "承認バイパスの試行",
];

/** AI CEO ダッシュボード用サマリー(指示書 §7)。 */
export interface IntelligenceSummary {
  policyCount: number;
  policyViolations: number;
  graphNodes: number;
  graphEdges: number;
  workflowTemplates: number;
  explainabilityAlerts: number;
  recentDecisions: readonly string[];
}

export function computeIntelligenceSummary(): IntelligenceSummary {
  return {
    policyCount: POLICY_RULES.length,
    policyViolations: 1,
    graphNodes: GRAPH_NODES.length,
    graphEdges: GRAPH_EDGES.length,
    workflowTemplates: WORKFLOW_TEMPLATES.length,
    explainabilityAlerts: weakExplainability().length,
    recentDecisions: EXPLAINABILITY_REPORTS.map((r) => r.recommendation),
  };
}

// ═══════════════════ 8. Company Brain 統合 / 本番ルール ═══════════════════

/** Company Brain に保存/参照する成果物の種類。 */
export const BRAIN_ARTIFACTS: readonly string[] = [
  "ポリシー", "ワークフローテンプレート", "ナレッジリンク", "説明レポート", "意思決定履歴",
];

/** Mockフェーズ(実ポリシー強制・実ワークフロー実行は承認後のみ)。 */
export const MOCK_MODE = true;
export const REAL_ENFORCEMENT_ENABLED = false;

export function summarizeIntelligenceJa(): string {
  const s = computeIntelligenceSummary();
  return `Intelligence Layer: ポリシー${s.policyCount}・ノード${s.graphNodes}・テンプレ${s.workflowTemplates}・説明アラート${s.explainabilityAlerts}(実強制はロック中)。`;
}
