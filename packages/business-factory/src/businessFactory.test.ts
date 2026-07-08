import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_UNIT_ROLES,
  BUSINESS_UNITS,
  MEISHI_TUBE,
  REPORTING_LINE,
  GOVERNANCE_NOTES,
  provisionBusinessUnit,
  summarizeFactory,
} from "./index";

test("標準ロールに AI事業部長・各チーム・AI監査リエゾンが含まれる(8ロール)", () => {
  assert.equal(BUSINESS_UNIT_ROLES.length, 8);
  assert.ok(BUSINESS_UNIT_ROLES.some((r) => r.includes("AI事業部長")));
  assert.ok(BUSINESS_UNIT_ROLES.some((r) => r.includes("AI監査リエゾン")));
  assert.ok(BUSINESS_UNIT_ROLES.includes("カスタマーサクセスチーム"));
});

test("provisionBusinessUnit は全成果物を自動生成する", () => {
  const bu = provisionBusinessUnit("TestBiz");
  assert.equal(bu.name, "TestBiz");
  assert.ok(bu.director.includes("AI事業部長"));
  assert.equal(bu.reportsTo, REPORTING_LINE);
  const p = bu.provisioning;
  assert.ok(p.departmentStructure.length >= 1);
  assert.ok(p.kpiDashboard.length >= 1);
  assert.equal(p.executiveDashboardIntegrated, true);
  assert.ok(p.workflowTemplates.length >= 1);
  assert.ok(p.companyBrainWorkspace.length > 0);
  assert.ok(p.knowledgeRepository.length > 0);
  assert.ok(p.reportingTemplates.length >= 1);
  assert.ok(p.riskMonitoring.length >= 1);
  assert.ok(p.mockOperatingData.length >= 1);
});

test("新規ユニットは既定で構築中(provisioning)", () => {
  assert.equal(provisionBusinessUnit("NewBiz").status, "provisioning");
});

test("MEISHI-TUBE が初期ターゲットとして稼働中", () => {
  assert.equal(MEISHI_TUBE.id, "bu-meishi-tube");
  assert.equal(MEISHI_TUBE.status, "operating");
  assert.ok(MEISHI_TUBE.provisioning.kpiDashboard.some((k) => k.value.includes("800,000")));
  assert.ok(BUSINESS_UNITS.includes(MEISHI_TUBE));
});

test("ガバナンス: レポートラインは COO→CEO、憲章遵守を明記", () => {
  assert.equal(REPORTING_LINE, "AI COO → AI CEO");
  assert.ok(GOVERNANCE_NOTES.some((n) => n.includes("憲章")));
  assert.ok(GOVERNANCE_NOTES.some((n) => n.includes("監査")));
});

test("summarizeFactory は集計を返す", () => {
  const s = summarizeFactory();
  assert.equal(s.totalUnits, BUSINESS_UNITS.length);
  assert.equal(s.operating, 1);
  assert.equal(s.rolesPerUnit, 8);
});
