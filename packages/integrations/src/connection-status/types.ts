// FileMaker / Zoom Phone連携準備UI(docs/ARCHITECTURE.md 第4.3章)。
// 今フェーズでは実API接続を一切行わない。ここで定義するのは、将来「本番接続用の
// Provider Interface」(FileMakerAdapter/ZoomPhoneAdapter、Phase 4/5で定義済み)へ
// 差し替える準備状況を表すための型のみ。実際の接続は行わない。

export type IntegrationId = "filemaker" | "zoom_phone";

/**
 * 連携の接続ステータス(ユーザー指示、2026-07-04で明示された5値)。
 *
 * - disconnected: 本番接続の設定を一度も開始していない、または明示的にリセットした
 * - pending_setup: 本番接続を見据えた設定を開始したが、必須項目が未入力
 * - mock_connected: 現フェーズのデフォルト。Mockアダプタで動作中(実接続はしない)
 * - production_ready: ダミー値で必須項目をすべて入力済み。Provider Interfaceを
 *   実アダプタに差し替えればいつでも本番接続を試せる状態(実際には未接続)
 * - error: 入力値の形式が不正(必須項目が空文字など)
 */
export type ConnectionStatus =
  | "disconnected"
  | "pending_setup"
  | "mock_connected"
  | "production_ready"
  | "error";

/** UI表示用の日本語ラベル。 */
export const CONNECTION_STATUS_LABEL_JA: Record<ConnectionStatus, string> = {
  disconnected: "未接続",
  pending_setup: "設定待ち",
  mock_connected: "Mock接続中",
  production_ready: "本番接続準備済み",
  error: "エラー",
};

/**
 * 認証情報の「ドラフト」。ダミー値のみを想定しており、実際にFileMaker/Zoom Phoneへ
 * 送信されることはない(このフェーズではMockCredentialStoreがメモリ上に保持するのみ)。
 */
export type CredentialDraft = Record<string, string>;

/** 各連携で入力が必要なフィールド名(FileMakerCredentials/ZoomPhoneCredentialsと対応)。 */
export const REQUIRED_CREDENTIAL_FIELDS: Record<IntegrationId, readonly string[]> = {
  filemaker: ["host", "database", "username", "password"],
  zoom_phone: ["accountId", "clientId", "clientSecret"],
};
