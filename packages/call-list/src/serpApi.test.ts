import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SerpApiGoogleMapsProvider,
  SERPAPI_PAGE_SIZE,
  SERPAPI_MAX_RESULTS,
  buildSerpApiUrl,
  extractPostalCode,
  parseSerpApiMapsResponse,
} from "./index";

/** 指定件数の local_results を持つ SerpAPI レスポンスを作る。 */
function pageOf(count: number): { local_results: unknown[] } {
  return {
    local_results: Array.from({ length: count }, (_, i) => ({
      title: `店舗${i}`,
      address: "大阪府高槻市芥川町1-2-3",
      types: ["飲食店"],
    })),
  };
}

// SerpAPI 公開仕様(google_maps エンジン)の local_results 形状に沿ったフィクスチャ。
// APIキー・実レスポンスは含めない。
const FIXTURE = {
  local_results: [
    {
      position: 1,
      title: "麺屋 example 高槻本店",
      address: "〒569-0802 大阪府高槻市北園町14-1",
      phone: "072-000-0000",
      type: "ラーメン屋",
      types: ["ラーメン屋"],
      operating_hours: { 月曜日: "11:00~22:00", 火曜日: "11:00~22:00" },
      service_options: { dine_in: true, takeout: true, delivery: true },
    },
    {
      position: 2,
      title: "カフェ example",
      address: "大阪府高槻市芥川町1-2-3",
      open_state: "営業中 ⋅ 営業終了: 20:00",
      types: ["カフェ"],
      service_options: { dine_in: true, delivery: false },
    },
    { position: 3, notitle: true }, // title の無い要素は捨てる
  ],
};

test("extractPostalCode は住所から郵便番号を抽出する", () => {
  assert.equal(extractPostalCode("〒569-0802 大阪府高槻市北園町14-1"), "569-0802");
  assert.equal(extractPostalCode("5690802 ではない"), "");
  assert.equal(extractPostalCode("569-0802 大阪府高槻市"), "569-0802");
});

test("parseSerpApiMapsResponse は8項目へ変換し、不正要素を捨てる", () => {
  const result = parseSerpApiMapsResponse(FIXTURE, "高槻市");
  assert.equal(result.city, "高槻市");
  assert.equal(result.records.length, 2);
  const [ramen, cafe] = result.records;
  assert.equal(ramen.storeName, "麺屋 example 高槻本店");
  assert.equal(ramen.postalCode, "569-0802");
  assert.equal(ramen.address, "大阪府高槻市北園町14-1"); // 〒表記は除去
  assert.equal(ramen.phone, "072-000-0000");
  assert.equal(ramen.genre, "ラーメン屋");
  assert.ok(ramen.businessHours.includes("月曜日: 11:00~22:00"));
  assert.equal(ramen.deliveryAvailable, true);
  assert.deepEqual(ramen.deliveryServices, []); // 媒体は実データでは取得不可
  assert.equal(cafe.postalCode, "");
  assert.equal(cafe.businessHours, "営業中 ⋅ 営業終了: 20:00");
  assert.equal(cafe.deliveryAvailable, false);
});

test("parseSerpApiMapsResponse は壊れたレスポンスでも安全に空を返す", () => {
  assert.deepEqual(parseSerpApiMapsResponse(null, "高槻市").records, []);
  assert.deepEqual(parseSerpApiMapsResponse({ local_results: "x" }, "高槻市").records, []);
});

test("buildSerpApiUrl は google_maps エンジン・日本語・都道府県+市区町村クエリを組み立てる", () => {
  const url = new URL(buildSerpApiUrl("dummy-key", "大阪府", "高槻市"));
  assert.equal(url.origin, "https://serpapi.com");
  assert.equal(url.searchParams.get("engine"), "google_maps");
  assert.equal(url.searchParams.get("hl"), "ja");
  assert.equal(url.searchParams.get("q"), "飲食店 大阪府高槻市");
  assert.equal(url.searchParams.get("api_key"), "dummy-key");
});

test("SerpApiGoogleMapsProvider は市区町村ごとに1リクエストし、APIエラーを日本語で投げる", async () => {
  const urls: string[] = [];
  const provider = new SerpApiGoogleMapsProvider("dummy-key", async (url) => {
    urls.push(url);
    return FIXTURE;
  });
  const results = await provider.search({ prefecture: "大阪府", cities: ["高槻市", " 茨木市 ", ""] });
  assert.equal(urls.length, 2);
  assert.equal(results.length, 2);
  assert.equal(results[1].city, "茨木市");

  const failing = new SerpApiGoogleMapsProvider("bad-key", async () => ({
    error: "Invalid API key",
  }));
  await assert.rejects(
    () => failing.search({ prefecture: "大阪府", cities: ["高槻市"] }),
    /SerpAPIエラー.*Invalid API key/,
  );
});

test("buildSerpApiUrl は start>0 のときだけ start パラメータを付与する", () => {
  assert.equal(new URL(buildSerpApiUrl("k", "大阪府", "高槻市")).searchParams.has("start"), false);
  assert.equal(new URL(buildSerpApiUrl("k", "大阪府", "高槻市", 40)).searchParams.get("start"), "40");
});

test("SerpApiGoogleMapsProvider はページングで満杯ページを追い、短いページで打ち切る", async () => {
  const starts: string[] = [];
  // 2ページ満杯(各20件)+3ページ目に5件 → 合計45件、3リクエストで停止。
  const pages = [pageOf(SERPAPI_PAGE_SIZE), pageOf(SERPAPI_PAGE_SIZE), pageOf(5)];
  const provider = new SerpApiGoogleMapsProvider("dummy-key", async (url) => {
    starts.push(new URL(url).searchParams.get("start") ?? "0");
    return pages.shift() ?? pageOf(0);
  });
  const results = await provider.search({ prefecture: "大阪府", cities: ["高槻市"] });
  assert.deepEqual(starts, ["0", "20", "40"]);
  assert.equal(results[0].records.length, 45);
});

test("SerpApiGoogleMapsProvider は maxResults で取得件数を制限する", async () => {
  let calls = 0;
  const provider = new SerpApiGoogleMapsProvider("dummy-key", async () => {
    calls += 1;
    return pageOf(SERPAPI_PAGE_SIZE); // 常に満杯ページを返す(無限に続く想定)
  });
  const results = await provider.search({
    prefecture: "大阪府",
    cities: ["高槻市"],
    maxResults: 50,
  });
  // 50件上限 → 0,20,40 の3ページで停止し、50件へ切り詰め。
  assert.equal(calls, 3);
  assert.equal(results[0].records.length, 50);
});

test("SERPAPI_MAX_RESULTS の既定は5000件", () => {
  assert.equal(SERPAPI_MAX_RESULTS, 5000);
});
