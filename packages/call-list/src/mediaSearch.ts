import type { PlaceSearchResult, RestaurantRecord } from "./types";
import type { FetchJson } from "./SerpApiGoogleMapsProvider";

// 媒体検索: 店舗ごとに Google 検索(SerpAPI engine=google)で、店舗名または
// 電話番号が一致するデリバリーサイト掲載を探し、利用中のデリバリー媒体を抽出する。
// 1店舗=1リクエスト。結果は既存の架電リストへ統合して1つのデータとして出力する。

/** 判定対象のデリバリー媒体(ドメイン一致で検出)。 */
export const DELIVERY_MEDIA = [
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "出前館", domain: "demae-can.com" },
  { name: "Wolt", domain: "wolt.com" },
  { name: "menu", domain: "menu.jp" },
] as const;

export interface MediaSearchProvider {
  readonly name: string;
  /** 店舗1件の利用デリバリー媒体名を返す(検出順)。 */
  searchMedia(record: RestaurantRecord): Promise<string[]>;
}

/** 店舗名 or 電話番号一致 × デリバリーサイト限定の Google 検索クエリを組み立てる。 */
export function buildMediaSearchUrl(apiKey: string, record: RestaurantRecord): string {
  const sites = DELIVERY_MEDIA.map((m) => `site:${m.domain}`).join(" OR ");
  const match =
    record.phone.trim() !== ""
      ? `("${record.storeName}" OR "${record.phone}")`
      : `"${record.storeName}"`;
  const params = new URLSearchParams({
    engine: "google",
    hl: "ja",
    num: "10",
    q: `${match} (${sites})`,
    api_key: apiKey,
  });
  return `https://serpapi.com/search.json?${params.toString()}`;
}

/** Google 検索レスポンスの organic_results からデリバリー媒体を検出する(純関数)。 */
export function parseMediaSearchResponse(payload: unknown): string[] {
  const results = (payload as { organic_results?: unknown } | null)?.organic_results;
  const found: string[] = [];
  if (Array.isArray(results)) {
    for (const raw of results) {
      const item = raw as { link?: unknown; displayed_link?: unknown };
      const text = `${typeof item.link === "string" ? item.link : ""} ${
        typeof item.displayed_link === "string" ? item.displayed_link : ""
      }`;
      for (const media of DELIVERY_MEDIA) {
        if (text.includes(media.domain) && !found.includes(media.name)) {
          found.push(media.name);
        }
      }
    }
  }
  return found;
}

export class SerpApiMediaSearchProvider implements MediaSearchProvider {
  readonly name = "serpapi-google";

  constructor(
    private readonly apiKey: string,
    private readonly fetchJson: FetchJson,
  ) {}

  async searchMedia(record: RestaurantRecord): Promise<string[]> {
    const payload = await this.fetchJson(buildMediaSearchUrl(this.apiKey, record));
    const error = (payload as { error?: unknown } | null)?.error;
    if (typeof error === "string") {
      throw new Error(`SerpAPIエラー(${record.storeName}): ${error}`);
    }
    return parseMediaSearchResponse(payload);
  }
}

/** Mock 版(APIキー未入力時)。店舗名+電話番号から決定的に媒体を返す。 */
export class MockMediaSearchProvider implements MediaSearchProvider {
  readonly name = "mock-media";

  searchMedia(record: RestaurantRecord): Promise<string[]> {
    let h = 0x811c9dc5;
    const text = `${record.storeName}|${record.phone}`;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h >>>= 0;
    // 約6割の店舗が1〜2媒体を利用している想定の決定的サンプル。
    if (h % 10 >= 6) return Promise.resolve([]);
    const first = h % DELIVERY_MEDIA.length;
    const media = [DELIVERY_MEDIA[first].name];
    if (h % 3 === 0) {
      media.push(DELIVERY_MEDIA[(first + 1) % DELIVERY_MEDIA.length].name);
    }
    return Promise.resolve(media);
  }
}

function storeKey(record: RestaurantRecord): string {
  return `${record.storeName}|${record.phone}`;
}

export { storeKey as mediaStoreKey };

/**
 * 媒体検索の結果を既存の検索結果へ統合した新しいリストを返す(イミュータブル)。
 * 検出があった店舗はデリバリー有無=あり・媒体列を更新し、
 * 検出が無かった店舗は媒体列を空にする(Googleマップ由来の有無フラグは保持)。
 */
export function applyMediaToResults(
  results: readonly PlaceSearchResult[],
  mediaByStore: ReadonlyMap<string, string[]>,
): PlaceSearchResult[] {
  return results.map((result) => ({
    city: result.city,
    records: result.records.map((record) => {
      const media = mediaByStore.get(storeKey(record));
      if (media === undefined) {
        return { ...record };
      }
      return {
        ...record,
        deliveryServices: [...media],
        deliveryAvailable: media.length > 0 ? true : record.deliveryAvailable,
      };
    }),
  }));
}
