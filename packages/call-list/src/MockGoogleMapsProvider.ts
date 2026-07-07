import type {
  MapsPlaceProvider,
  PlaceSearchQuery,
  PlaceSearchResult,
  RestaurantRecord,
} from "./types";
import { PREFECTURE_WIDE_LABEL } from "./types";

// Mock 版 Googleマップ店舗情報プロバイダ。
// 実 Google Maps / Places API へは接続しない(承認後に実装を差し替える)。
// 都道府県+市区町村の文字列から決定的にサンプル店舗を生成する —
// 同じ検索条件からは常に同じ結果になり、テスト・画面確認が再現可能。

const GENRES = ["居酒屋", "ラーメン", "カフェ", "焼肉", "寿司", "イタリアン", "中華", "定食"] as const;

const STORE_PREFIX = ["味処", "旬彩", "麺屋", "炭火", "食堂", "キッチン", "ダイニング", "喫茶"] as const;
const STORE_SUFFIX = ["一番", "はなれ", "本店", "亭", "屋", "家", "堂", "庵"] as const;

const DELIVERY_SERVICES = ["Uber Eats", "出前館", "Wolt", "menu"] as const;

const HOURS = [
  "11:00-22:00",
  "11:30-14:30, 17:00-23:00",
  "10:00-20:00",
  "17:00-24:00",
  "8:00-18:00",
] as const;

/** 文字列から決定的な32bitシードを作る(FNV-1a)。 */
function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 決定的な擬似乱数(mulberry32)。 */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, list: readonly T[]): T {
  return list[Math.floor(random() * list.length)];
}

function digits(random: () => number, count: number): string {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    out += Math.floor(random() * 10);
  }
  return out;
}

function buildRecord(prefecture: string, city: string, index: number): RestaurantRecord {
  const random = rng(hashSeed(`${prefecture}/${city}/${index}`));
  // 全域検索では店名・住所に「全域」を出さず都道府県名ベースにする。
  const isWide = city === PREFECTURE_WIDE_LABEL;
  const areaName = isWide ? prefecture.replace(/[都道府県]$/u, "") : city;
  const addressCity = isWide ? "" : city;
  const genre = pick(random, GENRES);
  const deliveryAvailable = random() < 0.55;
  const services = deliveryAvailable
    ? DELIVERY_SERVICES.filter(() => random() < 0.5)
    : [];
  if (deliveryAvailable && services.length === 0) {
    services.push(pick(random, DELIVERY_SERVICES));
  }
  return {
    storeName: `${pick(random, STORE_PREFIX)} ${areaName}${pick(random, STORE_SUFFIX)} ${index + 1}号店`,
    postalCode: `${digits(random, 3)}-${digits(random, 4)}`,
    address: `${prefecture}${addressCity}${Math.floor(random() * 9) + 1}丁目${Math.floor(random() * 20) + 1}-${Math.floor(random() * 15) + 1}`,
    phone: `0${Math.floor(random() * 9) + 1}-${digits(random, 4)}-${digits(random, 4)}`,
    genre,
    businessHours: pick(random, HOURS),
    deliveryAvailable,
    deliveryServices: services,
  };
}

export class MockGoogleMapsProvider implements MapsPlaceProvider {
  readonly name = "mock-google-maps";

  search(query: PlaceSearchQuery): Promise<PlaceSearchResult[]> {
    const cities = query.cities.map((c) => c.trim()).filter((c) => c !== "");
    // 市区町村が未入力なら都道府県全域として1件の検索にする。
    const targets = cities.length > 0 ? cities : [PREFECTURE_WIDE_LABEL];
    return Promise.resolve(
      targets.map((city) => {
        // 市区町村ごとに8〜15件を決定的に生成する。
        const count = 8 + (hashSeed(`${query.prefecture}/${city}`) % 8);
        const records = Array.from({ length: count }, (_, i) =>
          buildRecord(query.prefecture, city, i),
        );
        return { city, records };
      }),
    );
  }
}
