// Vision Engine の型定義(Development Bible 第11章)。
// 画面認識・UI認識・ボタン検出・テキスト抽出を「手動オプトイン」で行う。
// ユーザーが明示的に実行した時のみ解析し、常時監視はしない。
// 解析はローカルの決定的ロジックのみで、外部送信・LLM推論はしない。

/** UIスナップショットの要素種別。 */
export type UiNodeKind = "button" | "input" | "heading" | "text" | "window";

export const UI_NODE_KIND_LABEL_JA: Record<UiNodeKind, string> = {
  button: "ボタン",
  input: "入力欄",
  heading: "見出し",
  text: "テキスト",
  window: "ウィンドウ",
};

/** 画面上の矩形(CSSピクセル)。 */
export interface UiBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * UIスナップショットの1要素。取得元(DOM / アクセシビリティツリー等)は
 * アプリ側の責務で、このパッケージは解析のみを行う。
 */
export interface UiNode {
  kind: UiNodeKind;
  /** 表示ラベル(ボタン文言・入力欄プレースホルダ・見出し文など)。 */
  label: string;
  bounds: UiBounds;
  /** 操作可能か(ボタンが disabled なら false)。 */
  enabled: boolean;
}

/** 解析結果(UI認識・ボタン検出・テキスト抽出)。 */
export interface VisionAnalysis {
  /** 解析日時(ms)。呼び出し側が渡す(決定論のため)。 */
  analyzedAtMs: number;
  /** 検出した操作可能ボタン(ボタン検出)。 */
  actionableButtons: UiNode[];
  /** 検出した入力欄。 */
  inputs: UiNode[];
  /** 画面から抽出したテキスト(見出し・テキスト。擬似OCR)。 */
  extractedTexts: string[];
  /** ウィンドウ情報(ウィンドウ管理)。 */
  windows: UiNode[];
  /** 種別ごとの件数。 */
  countByKind: Record<UiNodeKind, number>;
  /** 日本語の要約文。 */
  summaryJa: string;
}
