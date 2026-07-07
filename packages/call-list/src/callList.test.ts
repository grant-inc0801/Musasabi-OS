import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CALL_LIST_HEADERS_JA,
  MockGoogleMapsProvider,
  PREFECTURES_JA,
  buildXlsx,
  callListToRows,
  summarizeCallList,
} from "./index";

const provider = new MockGoogleMapsProvider();

test("Mock検索は市区町村ごとに8件以上の店舗を返し、8項目が全て埋まる", async () => {
  const results = await provider.search({ prefecture: "大阪府", cities: ["高槻市", "茨木市"] });
  assert.equal(results.length, 2);
  for (const result of results) {
    assert.ok(result.records.length >= 8);
    for (const r of result.records) {
      assert.ok(r.storeName.includes(result.city));
      assert.match(r.postalCode, /^\d{3}-\d{4}$/);
      assert.ok(r.address.startsWith("大阪府" + result.city));
      assert.match(r.phone, /^0\d-\d{4}-\d{4}$/);
      assert.ok(r.genre.length > 0);
      assert.ok(r.businessHours.length > 0);
      if (r.deliveryAvailable) {
        assert.ok(r.deliveryServices.length > 0);
      } else {
        assert.deepEqual(r.deliveryServices, []);
      }
    }
  }
});

test("Mock検索は決定的(同じ条件は同じ結果)で、空・空白の市区町村は無視される", async () => {
  const q = { prefecture: "東京都", cities: ["新宿区", "", "  "] };
  const a = await provider.search(q);
  const b = await provider.search(q);
  assert.deepEqual(a, b);
  assert.equal(a.length, 1);
});

test("summarizeCallList は合計・市区町村別・ジャンル別・デリバリー数を集計する", async () => {
  const results = await provider.search({ prefecture: "大阪府", cities: ["高槻市", "茨木市"] });
  const summary = summarizeCallList(results);
  assert.equal(summary.total, results[0].records.length + results[1].records.length);
  assert.deepEqual(
    summary.byCity.map((c) => c.city),
    ["高槻市", "茨木市"],
  );
  assert.equal(
    summary.byGenre.reduce((s, g) => s + g.count, 0),
    summary.total,
  );
  assert.ok(summary.deliveryCount >= 0 && summary.deliveryCount <= summary.total);
});

test("callListToRows は見出し行+店舗行を8列で返す", async () => {
  const results = await provider.search({ prefecture: "京都府", cities: ["京都市"] });
  const rows = callListToRows(results);
  assert.deepEqual(rows[0], [...CALL_LIST_HEADERS_JA]);
  assert.equal(rows.length, 1 + results[0].records.length);
  assert.ok(rows.every((row) => row.length === 8));
  assert.ok(rows[1][6] === "あり" || rows[1][6] === "なし");
});

test("buildXlsx は正しいZIP構造の .xlsx バイト列を生成する", async () => {
  const rows = callListToRows(await provider.search({ prefecture: "北海道", cities: ["札幌市"] }));
  const bytes = buildXlsx(rows);
  // ZIP local file header シグネチャ PK\x03\x04
  assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  // EOCD シグネチャ PK\x05\x06(末尾22バイト)
  const eocd = bytes.slice(bytes.length - 22, bytes.length - 18);
  assert.deepEqual([...eocd], [0x50, 0x4b, 0x05, 0x06]);
  // エントリ数 = 5(Content_Types / .rels / workbook / workbook.rels / sheet1)
  const view = new DataView(bytes.buffer, bytes.length - 22);
  assert.equal(view.getUint16(10, true), 5);
  // 決定的
  assert.deepEqual(buildXlsx(rows), bytes);
});

test("47都道府県が定義されている", () => {
  assert.equal(PREFECTURES_JA.length, 47);
  assert.ok(PREFECTURES_JA.includes("大阪府"));
});
