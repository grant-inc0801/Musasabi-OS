import type { PlaceSearchResult } from "./types";
import { CALL_LIST_HEADERS_JA } from "./types";

// 検索結果を Excel 出力用の行列(1行目=見出し)へ変換する。

export function callListToRows(results: readonly PlaceSearchResult[]): string[][] {
  const rows: string[][] = [[...CALL_LIST_HEADERS_JA]];
  for (const result of results) {
    for (const r of result.records) {
      rows.push([
        r.storeName,
        r.postalCode,
        r.address,
        r.phone,
        r.genre,
        r.businessHours,
        r.deliveryAvailable ? "あり" : "なし",
        r.deliveryServices.join("、"),
      ]);
    }
  }
  return rows;
}
