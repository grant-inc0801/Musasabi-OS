// 架電リスト制作課(開発部)の型定義。
// Googleマップ由来の飲食店情報を抽出し、Excel(.xlsx)で出力するための
// ドメイン型。現フェーズの検索は Mock プロバイダのみ(実 Google Maps API への
// 接続は承認後。実認証情報は保存しない・外部送信なし)。

/** 抽出する店舗情報1件(ユーザー指定の8項目)。 */
export interface RestaurantRecord {
  storeName: string;
  postalCode: string;
  address: string;
  phone: string;
  genre: string;
  businessHours: string;
  deliveryAvailable: boolean;
  /** デリバリーサービス媒体(Uber Eats / 出前館 など。無い場合は空)。 */
  deliveryServices: string[];
}

/** 検索条件: 都道府県(プルダウン)+ 市区町村(自由入力・複数可)。 */
export interface PlaceSearchQuery {
  prefecture: string;
  /** 空文字は無視される。全て空なら都道府県全域で検索する。 */
  cities: string[];
  /**
   * 1市区町村あたりの最大取得件数(SerpAPIはページング取得する)。
   * 省略時は SERPAPI_MAX_RESULTS(5000)。
   */
  maxResults?: number;
}

/** 市区町村未指定(都道府県全域)検索時の表示ラベル。 */
export const PREFECTURE_WIDE_LABEL = "全域";

/** 検索結果: 市区町村ごとの店舗リスト。 */
export interface PlaceSearchResult {
  city: string;
  records: RestaurantRecord[];
}

/** 店舗情報の取得元プロバイダ。実装は Mock / SerpAPI(実データ・ユーザー承認済み)。 */
export interface MapsPlaceProvider {
  readonly name: string;
  search(query: PlaceSearchQuery): Promise<PlaceSearchResult[]>;
}

/** Excel 出力の列見出し(ユーザー指定の8項目・この順)。 */
export const CALL_LIST_HEADERS_JA = [
  "店舗名",
  "郵便番号",
  "住所",
  "電話番号",
  "ジャンル",
  "営業時間",
  "デリバリー有無",
  "デリバリーサービス媒体",
] as const;

/** 47都道府県(プルダウン用)。 */
export const PREFECTURES_JA: readonly string[] = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
