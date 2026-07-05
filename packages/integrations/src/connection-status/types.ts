// 各種連携・プロバイダの設定準備UI(docs/ARCHITECTURE.md 第4.3章、Phase β-002 ④)。
// このフェーズでは実API接続を一切行わない。ここで定義するのは、将来の本番接続用
// Provider Interface へ差し替える準備状況を表す型のみ。実接続・実認証情報保存はしない。

/**
 * 設定対象のサービス識別子。
 * - filemaker / zoom_phone: 外部業務システム連携(Provider Interface は Phase 4/5 で定義済み)
 * - voicevox / whisper_cpp: 音声エンジン(ローカルHTTPエンドポイント)
 * - openai / claude: AIプロバイダ(APIキー)
 */
export type IntegrationId =
  | "filemaker"
  | "zoom_phone"
  | "voicevox"
  | "whisper_cpp"
  | "openai"
  | "claude";

export const INTEGRATION_IDS: readonly IntegrationId[] = [
  "filemaker",
  "zoom_phone",
  "voicevox",
  "whisper_cpp",
  "openai",
  "claude",
];

/** サービスのカテゴリ(設定画面のセクション分けに使う)。 */
export type IntegrationCategory = "external" | "voice_engine" | "ai_provider";

export const INTEGRATION_CATEGORY: Record<IntegrationId, IntegrationCategory> = {
  filemaker: "external",
  zoom_phone: "external",
  voicevox: "voice_engine",
  whisper_cpp: "voice_engine",
  openai: "ai_provider",
  claude: "ai_provider",
};

export const INTEGRATION_CATEGORY_LABEL_JA: Record<IntegrationCategory, string> = {
  external: "外部システム連携",
  voice_engine: "音声エンジン",
  ai_provider: "AIプロバイダ",
};

/** サービスの表示名。 */
export const INTEGRATION_LABEL_JA: Record<IntegrationId, string> = {
  filemaker: "FileMaker",
  zoom_phone: "Zoom Phone",
  voicevox: "VOICEVOX",
  whisper_cpp: "whisper.cpp",
  openai: "OpenAI",
  claude: "Claude",
};

/**
 * 接続ステータス(2026-07-04 指定の5値)。
 *
 * - disconnected: 設定を一度も開始していない、または明示的にリセットした
 * - pending_setup: 設定を開始したが必須項目が未入力
 * - mock_connected: 現フェーズのデフォルト。Mock で動作中(実接続はしない)
 * - production_ready: ダミー値で必須項目をすべて入力済み。Provider Interface を
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
 * 認証情報・設定値の「ドラフト」。ダミー値のみを想定しており、実際に外部へ送信される
 * ことはない(MockCredentialStore がメモリ上に保持するのみ)。
 */
export type CredentialDraft = Record<string, string>;

/** 各サービスで入力が必要なフィールド名。 */
export const REQUIRED_CREDENTIAL_FIELDS: Record<IntegrationId, readonly string[]> = {
  filemaker: ["host", "database", "username", "password"],
  zoom_phone: ["accountId", "clientId", "clientSecret"],
  voicevox: ["endpoint"],
  whisper_cpp: ["endpoint"],
  openai: ["apiKey", "model"],
  claude: ["apiKey", "model"],
};

/**
 * 秘密として扱う(画面上マスク表示し、ダミー値のみ許可する)フィールド名の判定。
 * password / secret / apiKey / token 等を秘密扱いにする。
 */
const SECRET_FIELD_PATTERN = /password|secret|api[-_]?key|token/i;

export function isSecretField(field: string): boolean {
  return SECRET_FIELD_PATTERN.test(field);
}
