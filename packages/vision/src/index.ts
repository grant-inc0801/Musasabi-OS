// Vision Engine(Development Bible 第11章)。UI認識・ボタン検出・テキスト抽出・
// ウィンドウ管理を手動オプトインで行うための解析ロジック。常時監視はしない。
// 実OCR・実画面キャプチャへの接続は未実装(承認後のフェーズ)。

export * from "./types";
export { analyzeUiSnapshot } from "./UiSnapshotAnalyzer";
export { MockOcrProvider } from "./MockOcrProvider";
export type { OcrProvider, OcrRequest, OcrResult } from "./MockOcrProvider";
