import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LEAD_STATUSES,
  countByStatus,
  importLeads,
  leadKey,
  parseLeads,
  serializeLeads,
  setLeadNote,
  setLeadStatus,
} from "./index";

const T0 = 1_752_200_000_000;

const RECORDS = [
  { storeName: "麺屋 example", phone: "072-000-0000", address: "大阪府高槻市1-1", genre: "ラーメン" },
  { storeName: "カフェ example", phone: "072-111-1111", address: "大阪府高槻市2-2", genre: "カフェ" },
  { storeName: "電話なし食堂", phone: "", address: "大阪府高槻市3-3", genre: "定食" },
];

test("importLeads は店舗を未架電で取り込み、新しい順に並べる", () => {
  const { leads, added } = importLeads([], RECORDS, "架電リスト制作課(大阪府高槻市)", T0);
  assert.equal(added, 3);
  assert.equal(leads.length, 3);
  assert.ok(leads.every((l) => l.status === "not_called"));
  assert.ok(leads.every((l) => l.source.includes("高槻市")));
});

test("importLeads は電話番号(無ければ店舗名+住所)で重複をスキップする", () => {
  const first = importLeads([], RECORDS, "src", T0).leads;
  // ステータスを進めてから同じレコードを再取込
  const progressed = setLeadStatus(first, first[0].id, "appointment", T0 + 1_000);
  const { leads, added } = importLeads(progressed, RECORDS, "src2", T0 + 2_000);
  assert.equal(added, 0);
  assert.equal(leads.length, 3);
  // 既存のステータスが保持される
  assert.equal(leads.find((l) => l.id === first[0].id)?.status, "appointment");
});

test("leadKey は電話番号優先・無ければ店舗名+住所", () => {
  assert.equal(leadKey({ storeName: "a", phone: "072-1", address: "x" }), "tel:072-1");
  assert.equal(leadKey({ storeName: "a", phone: " ", address: "x" }), "name:a|x");
});

test("setLeadStatus / setLeadNote はイミュータブルに更新する", () => {
  const { leads } = importLeads([], RECORDS, "src", T0);
  const next = setLeadStatus(leads, leads[1].id, "won", T0 + 1_000);
  assert.equal(next[1].status, "won");
  assert.equal(leads[1].status, "not_called"); // 元は不変
  const noted = setLeadNote(next, leads[1].id, "担当: 田中様", T0 + 2_000);
  assert.equal(noted[1].note, "担当: 田中様");
});

test("countByStatus は5ステータス全ての件数を返す", () => {
  const { leads } = importLeads([], RECORDS, "src", T0);
  const counts = countByStatus(setLeadStatus(leads, leads[0].id, "called", T0));
  assert.equal(counts.not_called, 2);
  assert.equal(counts.called, 1);
  assert.equal(LEAD_STATUSES.length, 5);
});

test("serialize/parse の往復と壊れた値の除去", () => {
  const { leads } = importLeads([], RECORDS, "src", T0);
  const restored = parseLeads(serializeLeads(leads));
  assert.deepEqual(restored, leads);
  assert.deepEqual(parseLeads("{broken"), []);
  assert.deepEqual(parseLeads({ leads: [{ id: "x", status: "invalid" }] }), []);
});
