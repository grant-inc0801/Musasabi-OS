import type {
  MapsPlaceProvider,
  PlaceSearchQuery,
  PlaceSearchResult,
  RestaurantRecord,
} from "./types";
import { PREFECTURE_WIDE_LABEL } from "./types";

// SerpAPI(serpapi.com)の google_maps エンジン経由で実店舗情報を取得する
// プロバイダ(ユーザー承認済み・APIキーはユーザーが実行時に入力)。
// - APIキーはメモリ上でのみ保持し、このパッケージ/アプリは永続化しない
// - HTTP実行は注入された fetchJson に委譲(Tauri環境ではネイティブHTTP、
//   ブラウザ環境では window.fetch)
// - レスポンス解析(parseSerpApiMapsResponse)は純関数でテスト可能

/** 1リクエストで取得する最大件数(SerpAPI google_maps は1ページ約20件)。 */
export const SERPAPI_PAGE_SIZE = 20;

/** 1市区町村あたりの取得上限(ページングで最大この件数まで取得する)。 */
export const SERPAPI_MAX_RESULTS = 5000;

export type FetchJson = (url: string) => Promise<unknown>;

/** SerpAPI google_maps の local_results 1件(利用するフィールドのみ)。 */
interface SerpApiLocalResult {
  title?: string;
  address?: string;
  phone?: string;
  type?: string;
  types?: string[];
  hours?: string;
  open_state?: string;
  operating_hours?: Record<string, string>;
  service_options?: Record<string, unknown>;
}

/** 住所文字列から郵便番号を抽出する(NNN-NNNN、または〒付き)。見つからなければ空。 */
export function extractPostalCode(address: string): string {
  const m = address.match(/〒\s*(\d{3})-?(\d{4})/) ?? address.match(/(\d{3})-(\d{4})/);
  return m ? `${m[1]}-${m[2]}` : "";
}

/** 住所から郵便番号表記を取り除く。 */
function stripPostal(address: string): string {
  return address.replace(/〒?\s*\d{3}-?\d{4}\s*/, "").trim();
}

function businessHoursOf(item: SerpApiLocalResult): string {
  if (item.operating_hours && typeof item.operating_hours === "object") {
    const entries = Object.entries(item.operating_hours);
    if (entries.length > 0) {
      return entries.map(([day, hours]) => `${day}: ${hours}`).join(" / ");
    }
  }
  return item.hours ?? item.open_state ?? "";
}

/**
 * SerpAPI google_maps レスポンスを店舗レコードへ変換する(純関数)。
 * デリバリー媒体(Uber Eats/出前館等)は Google マップの検索結果に含まれない
 * ため常に空 — UI側で「実データでは取得不可」と明示する。
 */
export function parseSerpApiMapsResponse(payload: unknown, city: string): PlaceSearchResult {
  const results = (payload as { local_results?: unknown } | null)?.local_results;
  const records: RestaurantRecord[] = [];
  if (Array.isArray(results)) {
    for (const raw of results) {
      const item = raw as SerpApiLocalResult;
      if (typeof item !== "object" || item === null || typeof item.title !== "string") continue;
      const address = typeof item.address === "string" ? item.address : "";
      const delivery = item.service_options?.["delivery"] === true;
      records.push({
        storeName: item.title,
        postalCode: extractPostalCode(address),
        address: stripPostal(address),
        phone: typeof item.phone === "string" ? item.phone : "",
        genre: item.type ?? item.types?.[0] ?? "",
        businessHours: businessHoursOf(item),
        deliveryAvailable: delivery,
        deliveryServices: [], // Google マップ検索結果には媒体情報が無い
      });
    }
  }
  return { city, records };
}

/**
 * SerpAPI 検索URLを組み立てる(engine=google_maps・日本語)。
 * start はページング用オフセット(0起点・20刻み)。0のときは省略する。
 */
export function buildSerpApiUrl(
  apiKey: string,
  prefecture: string,
  city: string,
  start = 0,
): string {
  const params = new URLSearchParams({
    engine: "google_maps",
    type: "search",
    hl: "ja",
    q: `飲食店 ${prefecture}${city}`,
    api_key: apiKey,
  });
  if (start > 0) params.set("start", String(start));
  return `https://serpapi.com/search.json?${params.toString()}`;
}

export class SerpApiGoogleMapsProvider implements MapsPlaceProvider {
  readonly name = "serpapi-google-maps";

  constructor(
    private readonly apiKey: string,
    private readonly fetchJson: FetchJson,
  ) {}

  /**
   * 市区町村ごとに検索し、SerpAPI をページング取得して最大 maxResults 件(既定
   * 5000件)まで集約する。未入力なら都道府県全域で検索する。
   * 1ページ(約20件)未満が返った時点でその市区町村の取得を打ち切る。
   */
  async search(query: PlaceSearchQuery): Promise<PlaceSearchResult[]> {
    const cities = query.cities.map((c) => c.trim()).filter((c) => c !== "");
    const targets = cities.length > 0 ? cities : [""];
    const cap = Math.max(1, query.maxResults ?? SERPAPI_MAX_RESULTS);
    const out: PlaceSearchResult[] = [];
    for (const city of targets) {
      const label = city === "" ? PREFECTURE_WIDE_LABEL : city;
      const records: RestaurantRecord[] = [];
      for (let start = 0; start < cap; start += SERPAPI_PAGE_SIZE) {
        const payload = await this.fetchJson(
          buildSerpApiUrl(this.apiKey, query.prefecture, city, start),
        );
        const error = (payload as { error?: unknown } | null)?.error;
        if (typeof error === "string") {
          // 2ページ目以降のエラー(例: これ以上の結果なし)は打ち切りとして扱い、
          // 取得済みの分だけ返す。1ページ目のエラーは従来どおり投げる。
          if (start === 0) throw new Error(`SerpAPIエラー(${label}): ${error}`);
          break;
        }
        const page = parseSerpApiMapsResponse(payload, label).records;
        records.push(...page);
        // 1ページ未満しか返らなければ、これ以上のページは存在しない。
        if (page.length < SERPAPI_PAGE_SIZE) break;
      }
      out.push({ city: label, records: records.slice(0, cap) });
    }
    return out;
  }
}
