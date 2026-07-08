import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TEMPLATES,
  MARKETPLACE_ITEMS,
  EXTENSION_APIS,
  templatesOfKind,
  instantiateTemplate,
  summarizeEcosystem,
} from "./index";

test("3種のテンプレートが存在する", () => {
  assert.ok(templatesOfKind("department").length >= 1);
  assert.ok(templatesOfKind("employee").length >= 1);
  assert.ok(templatesOfKind("workflow").length >= 1);
});

test("instantiateTemplate は Mock 生成し実登録しない", () => {
  const r = instantiateTemplate("tpl-dept-sales", "新営業部");
  assert.equal(r.ok, true);
  assert.equal(r.createdName, "新営業部");
  assert.match(r.message, /Mock/);
});

test("instantiateTemplate は名称未指定でコピー名を付ける", () => {
  const r = instantiateTemplate("tpl-emp-editor");
  assert.ok(r.createdName.includes("コピー"));
});

test("instantiateTemplate は未知IDで失敗", () => {
  assert.equal(instantiateTemplate("nope").ok, false);
});

test("マーケットプレイスに導入済み/利用可能がある", () => {
  assert.ok(MARKETPLACE_ITEMS.some((m) => m.status === "installed"));
  assert.ok(MARKETPLACE_ITEMS.some((m) => m.status === "available"));
});

test("拡張APIはすべて後方互換を宣言する", () => {
  for (const a of EXTENSION_APIS) assert.equal(a.backwardCompatible, true);
});

test("summarizeEcosystem は集計を返す", () => {
  const s = summarizeEcosystem();
  assert.equal(s.templates, TEMPLATES.length);
  assert.equal(
    s.departmentTemplates + s.employeeTemplates + s.workflowTemplates,
    TEMPLATES.length,
  );
  assert.ok(s.stableApis >= 1);
});
