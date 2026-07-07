import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DELIVERY_MEDIA,
  MockGoogleMapsProvider,
  MockMediaSearchProvider,
  PREFECTURE_WIDE_LABEL,
  SerpApiMediaSearchProvider,
  applyMediaToResults,
  buildMediaSearchUrl,
  mediaStoreKey,
  parseMediaSearchResponse,
} from "./index";
import type { RestaurantRecord } from "./index";

const STORE: RestaurantRecord = {
  storeName: "麺屋 example 高槻本店",
  postalCode: "569-0802",
  address: "大阪府高槻市北園町14-1",
  phone: "072-000-0000",
  genre: "ラーメン屋",
  businessHours: "11:00-22:00",
  deliveryAvailable: false,
  deliveryServices: [],
};

test("buildMediaSearchUrl は店舗名OR電話番号一致×媒体サイト限定クエリを組み立てる", () => {
  const url = new URL(buildMediaSearchUrl("dummy-key", STORE));
  assert.equal(url.searchParams.get("engine"), "google");
  const q = url.searchParams.get("q") ?? "";
  assert.ok(q.includes(`"${STORE.storeName}"`));
  assert.ok(q.includes(`"${STORE.phone}"`));
  for (const media of DELIVERY_MEDIA) {
    assert.ok(q.includes(`site:${media.domain}`));
  }
  // 電話番号が無い店舗は店舗名のみで照合
  const noPhone = new URL(buildMediaSearchUrl("dummy-key", { ...STORE, phone: "" }));
  assert.ok(!(noPhone.searchParams.get("q") ?? "").includes(" OR \"\""));
});

test("parseMediaSearchResponse はリンクのドメインから媒体を検出する", () => {
  const payload = {
    organic_results: [
      { link: "https://www.ubereats.com/jp/store/xxx", displayed_link: "ubereats.com" },
      { link: "https://demae-can.com/shop/menu/yyy" },
      { link: "https://example.com/blog" },
      { link: "https://www.ubereats.com/jp/store/dup" }, // 重複は1回
    ],
  };
  assert.deepEqual(parseMediaSearchResponse(payload), ["Uber Eats", "出前館"]);
  assert.deepEqual(parseMediaSearchResponse(null), []);
  assert.deepEqual(parseMediaSearchResponse({ organic_results: "x" }), []);
});

test("SerpApiMediaSearchProvider はAPIエラーを日本語で投げる", async () => {
  const ok = new SerpApiMediaSearchProvider("k", async () => ({
    organic_results: [{ link: "https://wolt.com/ja/jpn/store" }],
  }));
  assert.deepEqual(await ok.searchMedia(STORE), ["Wolt"]);
  const bad = new SerpApiMediaSearchProvider("k", async () => ({ error: "quota" }));
  await assert.rejects(() => bad.searchMedia(STORE), /SerpAPIエラー.*quota/);
});

test("MockMediaSearchProvider は決定的に媒体を返す", async () => {
  const provider = new MockMediaSearchProvider();
  const a = await provider.searchMedia(STORE);
  const b = await provider.searchMedia(STORE);
  assert.deepEqual(a, b);
  for (const name of a) {
    assert.ok(DELIVERY_MEDIA.some((m) => m.name === name));
  }
});

test("applyMediaToResults は媒体検索結果を既存リストへ統合する", () => {
  const results = [
    {
      city: "高槻市",
      records: [STORE, { ...STORE, storeName: "カフェ example", phone: "072-111-1111" }],
    },
  ];
  const map = new Map([[mediaStoreKey(STORE), ["Uber Eats", "出前館"]]]);
  const merged = applyMediaToResults(results, map);
  assert.deepEqual(merged[0].records[0].deliveryServices, ["Uber Eats", "出前館"]);
  assert.equal(merged[0].records[0].deliveryAvailable, true);
  // 未検索の店舗は元のまま
  assert.deepEqual(merged[0].records[1].deliveryServices, []);
  // 元の配列は不変
  assert.deepEqual(results[0].records[0].deliveryServices, []);
});

test("市区町村未入力なら都道府県全域で検索される(Mock)", async () => {
  const provider = new MockGoogleMapsProvider();
  const results = await provider.search({ prefecture: "大阪府", cities: ["", "  "] });
  assert.equal(results.length, 1);
  assert.equal(results[0].city, PREFECTURE_WIDE_LABEL);
  assert.ok(results[0].records.length >= 8);
  // 店名・住所に「全域」が混入しない
  assert.ok(!results[0].records[0].storeName.includes("全域"));
  assert.ok(results[0].records[0].address.startsWith("大阪府"));
});
