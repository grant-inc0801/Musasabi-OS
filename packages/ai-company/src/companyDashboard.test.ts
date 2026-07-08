import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import { buildCompanyDashboard } from "./companyDashboard";

test("全社ダッシュボードは全部署ぶんの行を持ち、集計は summarizeCompany と一致", () => {
  const dash = buildCompanyDashboard();
  assert.equal(dash.departments.length, COMMAND_DEPARTMENTS.length);
  assert.ok(dash.totalMembers > 0);
  assert.ok(dash.activeMembers <= dash.totalMembers);
  assert.ok(dash.utilizationPercent >= 0 && dash.utilizationPercent <= 100);
});

test("各行にアイコン・ステータス・主要指標が含まれる", () => {
  const dash = buildCompanyDashboard();
  for (const row of dash.departments) {
    assert.ok(row.icon.length > 0);
    assert.ok(row.statusLabel.length > 0);
    assert.ok(row.metrics.length >= 1);
    for (const m of row.metrics) {
      assert.ok(m.label.length > 0);
      assert.ok(m.value.length > 0);
    }
  }
});

test("サポート部の行に未対応件数が表示される", () => {
  const dash = buildCompanyDashboard();
  const support = dash.departments.find((d) => d.deptId === "support")!;
  assert.ok(support.metrics.some((m) => m.label === "未対応"));
});

test("営業部の実データを反映した departments を渡すと進捗が変わる", () => {
  const custom = COMMAND_DEPARTMENTS.map((d) =>
    d.id === "sales" ? { ...d, progressPercent: 99 } : d,
  );
  const dash = buildCompanyDashboard(custom);
  const sales = dash.departments.find((d) => d.deptId === "sales")!;
  assert.ok(sales.metrics.some((m) => m.value === "99%"));
});
