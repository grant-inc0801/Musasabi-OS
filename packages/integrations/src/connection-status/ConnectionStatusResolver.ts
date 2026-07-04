import type { ConnectionStatus, CredentialDraft } from "./types";

export interface ConnectionSetupState {
  /** 本番接続を見据えたドラフト入力を一度でも開始したか。 */
  setupStarted: boolean;
  /** ユーザーが明示的にドラフトをリセットし、「未接続」に戻したか。 */
  wasReset: boolean;
  /** ダミー値も含め、必須フィールドがすべて入力されているか。 */
  requiredFieldsFilled: boolean;
  /** 入力値の形式に誤りがあるか(必須フィールドが空文字など)。 */
  hasValidationError: boolean;
}

/**
 * 接続ステータスを決定論的に算出する(Development Bible: 決定論的ロジックを優先)。
 * 実API接続は行わないため、ここでの「接続」は常にMockアダプタを指す。
 * production_ready はあくまで「本番接続用のダミー設定が完了した」ことを示すのみで、
 * 実際にFileMaker/Zoom Phoneへ接続したことを意味しない。
 */
export function resolveConnectionStatus(state: ConnectionSetupState): ConnectionStatus {
  if (state.hasValidationError) {
    return "error";
  }
  if (state.wasReset) {
    return "disconnected";
  }
  if (!state.setupStarted) {
    return "mock_connected";
  }
  return state.requiredFieldsFilled ? "production_ready" : "pending_setup";
}

/** ドラフトの必須フィールドがすべて空でない値で埋まっているかを判定する。 */
export function isDraftComplete(
  draft: CredentialDraft | null,
  requiredFields: readonly string[],
): boolean {
  if (!draft) {
    return false;
  }
  return requiredFields.every((field) => (draft[field] ?? "").trim().length > 0);
}
