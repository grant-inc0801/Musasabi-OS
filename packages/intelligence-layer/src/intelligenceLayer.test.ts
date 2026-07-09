import { test } from "node:test";
import assert from "node:assert/strict";
import {
  POLICY_RULES,
  RULE_CATEGORY_LABEL_JA,
  RULE_LEVEL_LABEL_JA,
  GRAPH_NODES,
  GRAPH_EDGES,
  NODE_TYPE_LABEL_JA,
  WORKFLOW_TEMPLATES,
  WF_NODE_LABEL_JA,
  EXPLAINABILITY_REPORTS,
  AUDIT_MONITORS,
  BRAIN_ARTIFACTS,
  MOCK_MODE,
  REAL_ENFORCEMENT_ENABLED,
  validateDecision,
  relatedNodes,
  traceDecision,
  validateWorkflow,
  weakExplainability,
  buildIntelligenceSecretaryItems,
  computeIntelligenceSummary,
  summarizeIntelligenceJa,
} from "./index";

test("ポリシーは13カテゴリ・6優先度をカバーし、憲章が最上位", () => {
  assert.equal(Object.keys(RULE_CATEGORY_LABEL_JA).length, 13);
  assert.equal(Object.keys(RULE_LEVEL_LABEL_JA).length, 6);
  const cats = new Set(POLICY_RULES.map((r) => r.category));
  assert.ok(cats.size >= 10);
  const constitution = POLICY_RULES.filter((r) => r.category === "constitution");
  assert.ok(constitution.every((r) => r.level === 1));
});

test("validateDecision: 実外部変更・課金は違反、承認要件とリスクを返す", () => {
  const ok = validateDecision({ id: "d1", title: "Mock改善", department: "開発", external: false, paid: false, impact: "low", risk: "low" });
  assert.equal(ok.allowed, true);
  assert.equal(ok.approvalRequired, false);
  const ext = validateDecision({ id: "d2", title: "実接続", department: "開発", external: true, paid: false, impact: "medium", risk: "medium" });
  assert.equal(ext.allowed, false);
  assert.ok(ext.violations.includes("pr-constitution-approval"));
  const high = validateDecision({ id: "d3", title: "高リスクMock", department: "企画", external: false, paid: false, impact: "high", risk: "high" });
  assert.equal(high.allowed, true);
  assert.equal(high.approvalRequired, true);
  assert.ok(high.checkedPolicies.includes("pr-approval-high"));
});

test("ナレッジグラフ: ノード種別14種・全エッジが実在ノードを参照", () => {
  assert.equal(Object.keys(NODE_TYPE_LABEL_JA).length, 14);
  const ids = new Set(GRAPH_NODES.map((n) => n.id));
  for (const e of GRAPH_EDGES) {
    assert.ok(ids.has(e.from) && ids.has(e.to), `${e.from}->${e.to}`);
  }
});

test("MEISHI-TUBE が事業ユニット・ワークフロー・レポート・顧客に接続されている", () => {
  const rel = relatedNodes("prj-meishi-launch");
  const types = new Set(rel.map((n) => n.type));
  assert.ok(types.has("business_unit"));
  assert.ok(types.has("workflow"));
  assert.ok(types.has("customer"));
  // ワークフロー経由でレポートに到達
  const wfRel = relatedNodes("wf-launch");
  assert.ok(wfRel.some((n) => n.type === "report"));
});

test("traceDecision は意思決定の根拠ナレッジを辿れる", () => {
  const t = traceDecision("brain-decision-1");
  assert.ok(t.length >= 1);
  assert.equal(t[0].from, "kn-best-cta");
});

test("ワークフローコンポーザ: ノード種別13種・例示フロー(承認・監査込み)が妥当", () => {
  assert.equal(Object.keys(WF_NODE_LABEL_JA).length, 13);
  const example = WORKFLOW_TEMPLATES.find((t) => t.id === "wf-new-service")!;
  const v = validateWorkflow(example);
  assert.equal(v.ok, true);
  assert.equal(v.hasApproval, true);
  // 例示フローの順序: 営業→調査→マーケ→承認→開発→監査
  const labels = example.nodes.map((n) => n.label).join(">");
  assert.ok(labels.includes("営業部") && labels.includes("AI CEO 承認") && labels.includes("AI監査"));
  // Company Brain 保存・秘書通知ノードあり
  assert.ok(example.nodes.some((n) => n.type === "brain_write"));
  assert.ok(example.nodes.some((n) => n.type === "notification"));
});

test("説明レポートは必須13項目+スコア5軸を持つ", () => {
  assert.ok(EXPLAINABILITY_REPORTS.length >= 2);
  for (const r of EXPLAINABILITY_REPORTS) {
    assert.ok(r.recommendation && r.reason && r.evidence && r.usedKnowledge && r.usedPolicy && r.usedWorkflow);
    assert.ok(r.kpiImpact && r.risk && r.roi && r.expectedBenefit && r.nextAction);
    assert.equal(typeof r.requiredApproval, "boolean");
    for (const k of ["confidence", "evidenceStrength", "risk", "cost", "expectedBenefit"] as const) {
      assert.ok(r.scores[k] >= 0 && r.scores[k] <= 100, `${r.id}.${k}`);
    }
  }
});

test("weakExplainability は確信度/根拠が低い提案を検出", () => {
  const weak = weakExplainability();
  assert.ok(weak.some((r) => r.id === "ex-meishi-focus"));
});

test("AI秘書カードは統一形式(違反/リンク/WF提案/弱い説明)", () => {
  const items = buildIntelligenceSecretaryItems();
  const cats = new Set(items.map((i) => i.category));
  assert.ok(cats.has("risk_alert"));
  assert.ok(cats.has("workflow_improvement"));
  assert.ok(cats.has("department_proposal"));
  assert.ok(cats.has("kpi_warning"));
  for (const i of items) {
    assert.equal(i.sourceDepartment, "Intelligence Layer");
    assert.ok(i.summary && i.reason && i.recommendedAction && i.suggestedNextStep);
  }
});

test("監査監視6種・Brain成果物5種・CEOサマリー", () => {
  assert.equal(AUDIT_MONITORS.length, 6);
  assert.ok(AUDIT_MONITORS.includes("承認バイパスの試行"));
  assert.equal(BRAIN_ARTIFACTS.length, 5);
  const s = computeIntelligenceSummary();
  assert.equal(s.policyCount, POLICY_RULES.length);
  assert.ok(s.recentDecisions.length >= 1);
});

test("Mockモード・実強制ロック・要約", () => {
  assert.equal(MOCK_MODE, true);
  assert.equal(REAL_ENFORCEMENT_ENABLED, false);
  assert.ok(summarizeIntelligenceJa().includes("ロック中"));
});
