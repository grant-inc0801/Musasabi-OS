import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEPARTMENT_PROFILES,
  DEPT_PROFILE_STATUS_LABEL_JA,
  VAULT_LINK_STATUS_COLOR,
  getDepartmentProfile,
  buildDepartmentDashboardStats,
} from "./departmentProfiles";

test("9部門のプロファイルが定義されている", () => {
  assert.equal(DEPARTMENT_PROFILES.length, 9);
});

test("営業部門と出版部門が存在する(§14 完了条件)", () => {
  const ids = DEPARTMENT_PROFILES.map((p) => p.id);
  assert.ok(ids.includes("sales"));
  assert.ok(ids.includes("publishing"));
});

test("各部門は§4の概念一式を持つ", () => {
  for (const p of DEPARTMENT_PROFILES) {
    assert.ok(p.name.length > 0, `${p.id} name`);
    assert.ok(p.purpose.length > 0, `${p.id} purpose`);
    assert.ok(p.staff.length >= 1, `${p.id} staff`);
    assert.ok(DEPT_PROFILE_STATUS_LABEL_JA[p.status], `${p.id} status`);
    assert.ok(p.nextActions.length >= 1, `${p.id} nextActions`);
    assert.ok(p.relatedDocs.length >= 1, `${p.id} relatedDocs`);
    assert.ok(VAULT_LINK_STATUS_COLOR[p.vaultLink], `${p.id} vaultLink`);
  }
});

test("出版部門の担当に敏腕編集長AIが含まれる", () => {
  const pub = getDepartmentProfile("publishing");
  assert.ok(pub);
  assert.ok(pub.staff.includes("敏腕編集長AI"));
});

test("部門IDは一意", () => {
  const ids = DEPARTMENT_PROFILES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("getDepartmentProfile は未知IDで undefined", () => {
  assert.equal(getDepartmentProfile("unknown"), undefined);
});

test("buildDepartmentDashboardStats は合計を正しく集計する", () => {
  const stats = buildDepartmentDashboardStats();
  assert.equal(stats.totalDepartments, 9);
  assert.equal(
    stats.workingCount + stats.waitingApprovalCount + stats.errorCount,
    DEPARTMENT_PROFILES.filter((p) => p.status !== "done").length,
  );
  assert.equal(
    stats.totalInProgressTasks,
    DEPARTMENT_PROFILES.reduce((s, p) => s + p.inProgressTasks.length, 0),
  );
  assert.ok(stats.vaultLinkedCount >= 1);
});
