import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LARGE_FILE_KB,
  PLANNING_DOC_STATUSES,
  PLANNING_DOC_TASKS,
  VAULT_CAPACITY_KB,
  VAULT_ITEMS,
  VAULT_STATUS_COLOR,
  buildVaultSummaryJa,
  capacityStatusOf,
  computeVaultSummary,
  filterVaultItems,
  findDuplicateCandidates,
} from "./knowledgeVault";

test("容量ステータスは 0-69%正常 / 70-89%注意 / 90%以上危険", () => {
  assert.equal(capacityStatusOf(0), "正常");
  assert.equal(capacityStatusOf(69), "正常");
  assert.equal(capacityStatusOf(70), "注意");
  assert.equal(capacityStatusOf(89), "注意");
  assert.equal(capacityStatusOf(90), "危険");
  assert.equal(VAULT_STATUS_COLOR.正常, "#22C55E");
  assert.equal(VAULT_STATUS_COLOR.注意, "#FACC15");
  assert.equal(VAULT_STATUS_COLOR.危険, "#EF4444");
});

test("computeVaultSummary は件数・容量・使用率・各候補数・部署別/種別容量を集計する", () => {
  const summary = computeVaultSummary(VAULT_ITEMS);
  assert.equal(summary.itemCount, VAULT_ITEMS.length);
  assert.equal(summary.totalKb, VAULT_ITEMS.reduce((s, i) => s + i.sizeKb, 0));
  assert.equal(summary.capacityKb, VAULT_CAPACITY_KB);
  assert.equal(summary.usagePercent, Math.round((summary.totalKb / VAULT_CAPACITY_KB) * 100));
  assert.equal(summary.status, capacityStatusOf(summary.usagePercent));
  assert.equal(summary.largeFileCount, VAULT_ITEMS.filter((i) => i.sizeKb >= LARGE_FILE_KB).length);
  assert.ok(summary.duplicateCount >= 1); // 提案書の新旧版が重複候補
  assert.ok(summary.archiveCandidateCount >= 2);
  assert.ok(summary.deleteCandidateCount >= 1);
  assert.ok(summary.byDept.length >= 4);
  assert.ok(summary.byCategory[0].totalKb >= summary.byCategory[summary.byCategory.length - 1].totalKb);
});

test("findDuplicateCandidates は同一タイトル・同一サイズを検出する", () => {
  const dups = findDuplicateCandidates(VAULT_ITEMS);
  assert.ok(dups.some((d) => d.title === "架電リストツール提案書"));
});

test("filterVaultItems はキーワード・種類・部署で絞り込み、更新日/サイズで並べ替える", () => {
  const byCategory = filterVaultItems(VAULT_ITEMS, { category: "提案書" });
  assert.ok(byCategory.every((i) => i.category === "提案書"));
  const byDept = filterVaultItems(VAULT_ITEMS, { dept: "企画部" });
  assert.ok(byDept.length >= 4);
  const byKeyword = filterVaultItems(VAULT_ITEMS, { keyword: "コール" });
  assert.ok(byKeyword.some((i) => i.title.includes("コール") || i.tags.includes("コール")));
  const bySize = filterVaultItems(VAULT_ITEMS, { sort: "size" });
  assert.ok(bySize[0].sizeKb >= bySize[bySize.length - 1].sizeKb);
  const byUpdated = filterVaultItems(VAULT_ITEMS, {});
  assert.ok(byUpdated[0].updatedAtMs >= byUpdated[byUpdated.length - 1].updatedAtMs);
});

test("企画部の資料作成業務と資料状況・吹き出し要約が定義されている", () => {
  assert.ok(PLANNING_DOC_TASKS.some((t) => t.includes("マニュアル作成")));
  assert.ok(PLANNING_DOC_TASKS.some((t) => t.includes("保管庫への保存")));
  assert.equal(PLANNING_DOC_STATUSES.length, 6);
  const lines = buildVaultSummaryJa();
  assert.ok(lines[0].includes("保管庫へ保存しました"));
  assert.ok(lines[1].includes("保管庫の使用率"));
  // 決定的
  assert.deepEqual(lines, buildVaultSummaryJa());
});
