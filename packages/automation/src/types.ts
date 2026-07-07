// Automation Engine の型定義(Development Bible 第12章)。
// 操作記録 → 学習 → 再実行 → 改善。記録は「手動オプトイン」—
// ユーザーが記録開始を押した間のみアプリ内操作を記録する。常時記録はしない。
// 対象はこのアプリ内の操作のみで、他アプリ・OS操作は記録しない。外部送信なし。

/** 記録される1操作(現フェーズはアプリ内ページ遷移)。 */
export interface RecordedStep {
  kind: "navigate";
  /** 遷移先ページID(アプリの Page 値)。 */
  target: string;
  /** 表示用ラベル(例: "営業部 — KPI")。 */
  label: string;
  timestampMs: number;
}

/** 保存されたルーチン(記録済み操作列)。 */
export interface AutomationRoutine {
  id: string;
  name: string;
  steps: RecordedStep[];
  createdAtMs: number;
  /** 再実行された回数(改善ループの入力)。 */
  runCount: number;
}
