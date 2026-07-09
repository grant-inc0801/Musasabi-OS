import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEVELOPMENT_POLICY,
  MOCK_COMPLETION_SCOPE,
  PRODUCTION_READINESS_ITEMS,
  PRODUCTION_LAUNCH_CHECKLIST,
  PRODUCTION_RULE,
  PRODUCTION_APPROVED,
  PRODUCTION_READINESS_DESIGN_DOC,
  ROADMAP_GOVERNANCE_NOTES,
  computeMockCompletion,
  isProductionReadinessUnlocked,
  summarizeRoadmapJa,
} from "./index";

test("開発方針は5ステップ", () => {
  assert.equal(DEVELOPMENT_POLICY.length, 5);
  assert.ok(DEVELOPMENT_POLICY[0].includes("Mock"));
});

test("Mock完成スコープは指示書の全14項目を含む", () => {
  assert.equal(MOCK_COMPLETION_SCOPE.length, 14);
  const ids = MOCK_COMPLETION_SCOPE.map((s) => s.id);
  for (const id of [
    "executive-governance", "departments-employees", "company-brain", "dna-constitution",
    "ceo-dashboard", "two-layer-ui", "business-factory", "business-templates",
    "musasabi-world", "evolution-modules", "audit-kpi-risk", "workflow-engine",
    "dashboards", "reports",
  ]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
});

test("各Mockスコープ項目に実装元が紐づく", () => {
  for (const s of MOCK_COMPLETION_SCOPE) {
    assert.ok(s.implementedBy.length > 0, `${s.id} implementedBy`);
  }
});

test("computeMockCompletion は全doneで complete=true・100%", () => {
  const c = computeMockCompletion();
  assert.equal(c.total, 14);
  assert.equal(c.done, 14);
  assert.equal(c.percent, 100);
  assert.equal(c.complete, true);
});

test("computeMockCompletion は未完スコープを反映する", () => {
  const c = computeMockCompletion([
    { id: "a", name: "A", status: "done", implementedBy: "x" },
    { id: "b", name: "B", status: "in_progress", implementedBy: "y" },
  ]);
  assert.equal(c.percent, 50);
  assert.equal(c.complete, false);
});

test("Production Readiness 項目はすべて承認必須・既定ロック・設計ありで実装なし", () => {
  assert.equal(PRODUCTION_READINESS_ITEMS.length, 11);
  for (const r of PRODUCTION_READINESS_ITEMS) {
    assert.equal(r.requiresApproval, true, `${r.id} requiresApproval`);
    assert.equal(r.status, "locked", `${r.id} locked`);
    // 設計のみ用意する(実装は承認後)。全項目に設計方針がある。
    assert.ok(r.design.length > 0, `${r.id} design`);
  }
});

test("設計ドキュメントの場所が定義されている(設計のみ・実装は承認後)", () => {
  assert.ok(PRODUCTION_READINESS_DESIGN_DOC.includes("PRODUCTION_READINESS_DESIGN"));
});

test("本番承認は既定 false、ゲートは未承認でロック解除しない", () => {
  assert.equal(PRODUCTION_APPROVED, false);
  assert.equal(isProductionReadinessUnlocked(false), false);
  // Mock完成でも承認がなければロック
  assert.equal(isProductionReadinessUnlocked(PRODUCTION_APPROVED), false);
  // 承認かつMock完成でのみ解放
  assert.equal(isProductionReadinessUnlocked(true), true);
});

test("Mock未完なら承認済みでもゲートは開かない", () => {
  const incomplete = [
    { id: "a", name: "A", status: "in_progress" as const, implementedBy: "x" },
  ];
  assert.equal(isProductionReadinessUnlocked(true, incomplete), false);
});

test("リリースチェックリストは一部済み・一部保留", () => {
  const done = PRODUCTION_LAUNCH_CHECKLIST.filter((c) => c.status === "done");
  const pending = PRODUCTION_LAUNCH_CHECKLIST.filter((c) => c.status === "pending");
  assert.ok(done.length >= 1);
  assert.ok(pending.some((c) => c.id === "human-approval"));
});

test("本番ルールとガバナンスに課金・承認・監査を明記", () => {
  assert.ok(PRODUCTION_RULE.includes("承認"));
  assert.ok(PRODUCTION_RULE.includes("課金"));
  assert.ok(ROADMAP_GOVERNANCE_NOTES.some((n) => n.includes("監査")));
});

test("summarizeRoadmapJa は完成度とゲート状態を要約する", () => {
  const s = summarizeRoadmapJa();
  assert.ok(s.includes("Mock完成 100%"));
  assert.ok(s.includes("ロック中"));
});
