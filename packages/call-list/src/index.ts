// 架電リスト制作課(開発部)— Googleマップ由来の飲食店情報抽出とExcel出力。
// 現フェーズの検索は Mock のみ(実 Google Maps / Places API への接続は承認後)。
// Excel(.xlsx)は依存ライブラリなしで生成する。外部送信なし。

export * from "./types";
export { MockGoogleMapsProvider } from "./MockGoogleMapsProvider";
export {
  SERPAPI_PAGE_SIZE,
  SERPAPI_MAX_RESULTS,
  SerpApiGoogleMapsProvider,
  buildSerpApiUrl,
  extractPostalCode,
  parseSerpApiMapsResponse,
} from "./SerpApiGoogleMapsProvider";
export type { FetchJson } from "./SerpApiGoogleMapsProvider";
export { summarizeCallList } from "./aggregate";
export type { CallListSummary } from "./aggregate";
export { callListToRows } from "./toRows";
export {
  DELIVERY_MEDIA,
  MockMediaSearchProvider,
  SerpApiMediaSearchProvider,
  applyMediaToResults,
  buildMediaSearchUrl,
  mediaStoreKey,
  parseMediaSearchResponse,
} from "./mediaSearch";
export type { MediaSearchProvider } from "./mediaSearch";
export { buildXlsx } from "./xlsx";
