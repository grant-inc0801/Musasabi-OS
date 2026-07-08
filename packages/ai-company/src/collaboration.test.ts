import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  COLLAB_ITEMS,
  COLLAB_STATUS_COLOR,
  COLLAB_TYPES,
  SHARED_KNOWLEDGE,
  buildCollaborationSummary,
  filterCollabItems,
} from "./collaboration";

test("コラボサマリーは対応中/承認待ち/共有ナレッジ/採用数を集計する", () => {
  const s = buildCollaborationSummary();
  assert.equal(s.totalItems, COLLAB_ITEMS.length);
  assert.equal(s.inProgress, COLLAB_ITEMS.filter((i) => i.status === "対応中").length);
  assert.ok(s.waitingApproval >= 1);
  assert.equal(s.sharedKnowledgeCount, SHARED_KNOWLEDGE.length);
  assert.equal(
    s.adoptionCount,
    SHARED_KNOWLEDGE.reduce((sum, k) => sum + k.adoptedByDepts.length, 0),
  );
});

test("filterCollabItems は種別と部署(from/to)で絞り込む", () => {
  const proposals = filterCollabItems(COLLAB_ITEMS, { type: "提案" });
  assert.ok(proposals.length >= 1);
  assert.ok(proposals.every((i) => i.type === "提案"));

  const salesRelated = filterCollabItems(COLLAB_ITEMS, { deptId: "sales" });
  assert.ok(salesRelated.every((i) => i.fromDeptId === "sales" || i.toDeptId === "sales"));
  assert.ok(salesRelated.length >= 1);

  assert.deepEqual(filterCollabItems(COLLAB_ITEMS, { deptId: "unknown" }), []);
});

test("全種別に色が定義され、項目の状態は定義済み", () => {
  for (const s of Object.keys(COLLAB_STATUS_COLOR)) {
    assert.match(COLLAB_STATUS_COLOR[s as keyof typeof COLLAB_STATUS_COLOR], /^#/);
  }
  for (const i of COLLAB_ITEMS) {
    assert.ok(COLLAB_TYPES.includes(i.type));
  }
});
