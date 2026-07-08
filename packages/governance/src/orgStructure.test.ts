import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXECUTIVE_SCOPE,
  REQUIRED_DASHBOARDS,
  buildOrgChart,
  buildCommandChain,
} from "./orgStructure";
import { EXECUTIVE_ROLES } from "./index";

test("全役職に管掌スコープが定義されている", () => {
  for (const r of EXECUTIVE_ROLES) {
    assert.ok(EXECUTIVE_SCOPE[r].headquarters, `${r} の本部`);
    assert.ok(EXECUTIVE_SCOPE[r].focus, `${r} の担当領域`);
  }
});

test("buildOrgChart は CEO頂点・役員層・本部・独立監査を含む", () => {
  const nodes = buildOrgChart();
  const ceo = nodes.find((n) => n.kind === "ceo");
  assert.ok(ceo);
  assert.equal(ceo.parentId, null);
  // 役員(CEO以外7名)
  assert.equal(nodes.filter((n) => n.kind === "executive").length, 7);
  // 本部(役員ごと7)
  assert.equal(nodes.filter((n) => n.kind === "headquarters").length, 7);
  // 独立監査
  const audit = nodes.find((n) => n.kind === "audit");
  assert.ok(audit);
  assert.equal(audit.independent, true);
  assert.equal(audit.parentId, null); // 経営層から独立
});

test("役員ノードはCEO直下、本部は役員直下", () => {
  const nodes = buildOrgChart();
  for (const exec of nodes.filter((n) => n.kind === "executive")) {
    assert.equal(exec.parentId, "ceo");
    const hq = nodes.find((n) => n.kind === "headquarters" && n.parentId === exec.id);
    assert.ok(hq, `${exec.id} の本部`);
  }
});

test("buildCommandChain は CEO→役員→本部 のチェーンと独立ラインを返す", () => {
  const cc = buildCommandChain();
  assert.equal(cc.chains.length, 7); // CEO以外
  for (const chain of cc.chains) {
    assert.equal(chain.length, 3);
    assert.match(chain[0], /CEO/);
  }
  assert.match(cc.independentLine, /独立/);
});

test("必要ダッシュボード一覧に組織図・監査が含まれる", () => {
  assert.ok(REQUIRED_DASHBOARDS.includes("AI組織図"));
  assert.ok(REQUIRED_DASHBOARDS.includes("AI監査ダッシュボード"));
});
