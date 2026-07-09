import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateCompany,
  inferTemplateId,
  summarizeCompanyJa,
  summarizeWorld,
  EXECUTIVE_TEAM,
  FIRST_USE_CASE_TEMPLATE_IDS,
  WORLD_GOVERNANCE_NOTES,
  WORLD_REPORTING_LINE,
} from "./index";

test("inferTemplateId はキーワードからテンプレートを推定し、既定は SaaS", () => {
  assert.equal(inferTemplateId("名刺のデジタル化サービス"), "tmpl-meishi-tube");
  assert.equal(inferTemplateId("出版事業を立ち上げたい"), "tmpl-publishing");
  assert.equal(inferTemplateId("飲食店を多店舗展開"), "tmpl-restaurant");
  assert.equal(inferTemplateId("なにか新しいビジネス"), "tmpl-saas");
});

test("generateCompany はテンプレートから全成果物を生成する", () => {
  const c = generateCompany({ templateId: "tmpl-saas" });
  assert.equal(c.ceo, "AI CEO");
  assert.equal(c.executives.length, EXECUTIVE_TEAM.length);
  assert.ok(c.executives.some((e) => e.role === "AI監査役"));
  assert.ok(c.departmentMap.length >= 1);
  assert.ok(c.employeeRoster.length >= 1);
  assert.ok(c.kpiDashboard.some((k) => k.label === "MRR"));
  assert.ok(c.workflows.length >= 1);
  assert.ok(c.companyBrainWorkspace.length > 0);
  assert.ok(c.dnaProfile.length >= 1);
  assert.ok(c.knowledgeVaultFolders.length >= 1);
  assert.ok(c.reportTemplates.length >= 1);
  assert.ok(c.auditMonitoring.length >= 1);
  assert.ok(c.mockOperatingData.length >= 1);
  assert.equal(c.reportsTo, WORLD_REPORTING_LINE);
});

test("generateCompany はアイデアからテンプレートを推定できる", () => {
  const c = generateCompany({ idea: "名刺管理のクラウドサービス" });
  assert.equal(c.templateId, "tmpl-meishi-tube");
  assert.ok(c.name.length > 0);
});

test("generateCompany は名前上書きに対応し、決定論(同入力=同ID)", () => {
  const a = generateCompany({ templateId: "tmpl-publishing", name: "MyBooks" });
  const b = generateCompany({ templateId: "tmpl-publishing", name: "MyBooks" });
  assert.equal(a.name, "MyBooks");
  assert.equal(a.id, b.id);
  assert.ok(a.departmentMap.some((d) => d.startsWith("MyBooks")));
});

test("generateCompany は未知テンプレートで例外", () => {
  assert.throws(() => generateCompany({ templateId: "tmpl-unknown" }));
});

test("summarizeCompanyJa は AI CEO 要約を返す", () => {
  const c = generateCompany({ templateId: "tmpl-saas", name: "Acme SaaS" });
  const s = summarizeCompanyJa(c);
  assert.ok(s.includes("AI CEO 報告"));
  assert.ok(s.includes("Acme SaaS"));
  assert.ok(s.includes("Mock"));
});

test("FIRST_USE_CASE は4件で MEISHI-TUBE/SaaS/営業代行/出版を含む", () => {
  assert.equal(FIRST_USE_CASE_TEMPLATE_IDS.length, 4);
  assert.deepEqual([...FIRST_USE_CASE_TEMPLATE_IDS], [
    "tmpl-meishi-tube", "tmpl-saas", "tmpl-sales-agency", "tmpl-publishing",
  ]);
});

test("summarizeWorld は集計を返す", () => {
  const s = summarizeWorld([generateCompany({ templateId: "tmpl-saas" })]);
  assert.equal(s.totalCompanies, 1);
  assert.ok(s.templatesAvailable >= 8);
});

test("ガバナンス方針に承認必須・監査ログ・実アカウント禁止を明記", () => {
  assert.ok(WORLD_GOVERNANCE_NOTES.some((n) => n.includes("承認")));
  assert.ok(WORLD_GOVERNANCE_NOTES.some((n) => n.includes("監査ログ")));
  assert.ok(WORLD_GOVERNANCE_NOTES.some((n) => n.includes("実アカウント")));
});
