import { useState } from "react";
import { connectionStatus } from "@musasabi/integrations";
import { appLogger } from "../../lib/appLogger";

const {
  resolveConnectionStatus,
  isDraftComplete,
  isSecretField,
  CONNECTION_STATUS_LABEL_JA,
  REQUIRED_CREDENTIAL_FIELDS,
  INTEGRATION_IDS,
  INTEGRATION_LABEL_JA,
  INTEGRATION_CATEGORY,
  INTEGRATION_CATEGORY_LABEL_JA,
  MockCredentialStore,
} = connectionStatus;

type IntegrationId = connectionStatus.IntegrationId;
type IntegrationCategory = connectionStatus.IntegrationCategory;
type CredentialDraft = connectionStatus.CredentialDraft;

// 実接続は行わないため、保存先はメモリ上のみのMockCredentialStore
// (docs/ARCHITECTURE.md 第4.3章)。アプリを再起動すれば内容は失われる。
const credentialStore = new MockCredentialStore();

// 各サービスのフィールド表示ラベル。未定義のフィールドはフィールド名をそのまま使う。
const FIELD_LABELS_JA: Partial<Record<IntegrationId, Record<string, string>>> = {
  filemaker: {
    host: "サーバーURL(例: https://filemaker.example.com)",
    database: "データベース名",
    username: "ユーザー名",
    password: "パスワード",
  },
  zoom_phone: {
    accountId: "Account ID",
    clientId: "Client ID",
    clientSecret: "Client Secret",
  },
  voicevox: {
    endpoint: "エンドポイントURL(例: http://127.0.0.1:50021)",
  },
  whisper_cpp: {
    endpoint: "エンドポイントURL(例: http://127.0.0.1:8080)",
  },
  openai: {
    apiKey: "APIキー(ダミー値のみ)",
    model: "モデル名(例: gpt-4o)",
  },
  claude: {
    apiKey: "APIキー(ダミー値のみ)",
    model: "モデル名(例: claude-sonnet-5)",
  },
};

function fieldLabel(integrationId: IntegrationId, field: string): string {
  return FIELD_LABELS_JA[integrationId]?.[field] ?? field;
}

// URL 形式が必要なフィールド(host/endpoint)は http(s):// で始まることを最低限確認する。
function validateDraftFormat(_integrationId: IntegrationId, draft: CredentialDraft): boolean {
  for (const field of ["host", "endpoint"]) {
    const value = draft[field];
    if (value && !(value.startsWith("http://") || value.startsWith("https://"))) {
      return false;
    }
  }
  return true;
}

function IntegrationSettingsCard({ integrationId }: { integrationId: IntegrationId }) {
  const requiredFields = REQUIRED_CREDENTIAL_FIELDS[integrationId];
  // credentialStoreはタブ切り替え(コンポーネントの再マウント)をまたいで値を保持するため、
  // フォームの初期値もそこから読み込む。そうしないと、保存済みのドラフトがあっても
  // 設定タブを離れて戻るたびに空欄・mock_connected表示に戻ってしまう。
  const [draft, setDraft] = useState<CredentialDraft>(() => credentialStore.get(integrationId) ?? {});
  const [setupStarted, setSetupStarted] = useState(() => credentialStore.get(integrationId) !== null);
  const [wasReset, setWasReset] = useState(false);

  const status = resolveConnectionStatus({
    setupStarted,
    wasReset,
    requiredFieldsFilled: isDraftComplete(draft, requiredFields),
    hasValidationError: setupStarted && !validateDraftFormat(integrationId, draft),
  });

  function handleFieldChange(field: string, value: string): void {
    setSetupStarted(true);
    setWasReset(false);
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(): void {
    credentialStore.save(integrationId, draft);
    appLogger.info("connection settings draft saved (dummy values)", { integrationId });
  }

  function handleReset(): void {
    credentialStore.clear(integrationId);
    setDraft({});
    setSetupStarted(false);
    setWasReset(true);
    appLogger.info("connection settings draft reset", { integrationId });
  }

  return (
    <fieldset style={{ marginBottom: "1.5rem" }}>
      <legend>{INTEGRATION_LABEL_JA[integrationId]}</legend>
      <p>
        接続ステータス: <strong>{CONNECTION_STATUS_LABEL_JA[status]}</strong>
      </p>
      <p style={{ color: "#555", fontSize: "0.9rem", maxWidth: "36rem" }}>
        本番接続は次フェーズで実装予定です。ここには<strong>ダミー値のみ</strong>
        入力してください。実際のAPIキー・パスワード・トークンは入力しないでください
        (保存先はこのアプリのメモリ上のみで、外部には一切送信されません)。
      </p>
      {requiredFields.map((field) => (
        <div key={field} style={{ marginBottom: "0.5rem" }}>
          <label>
            {fieldLabel(integrationId, field)}
            <br />
            <input
              type={isSecretField(field) ? "password" : "text"}
              value={draft[field] ?? ""}
              onChange={(event) => handleFieldChange(field, event.target.value)}
              placeholder="ダミー値"
            />
          </label>
        </div>
      ))}
      <button type="button" onClick={handleSave} disabled={!setupStarted}>
        保存(ダミー値)
      </button>{" "}
      <button type="button" onClick={handleReset}>
        リセット
      </button>
    </fieldset>
  );
}

const CATEGORY_ORDER: IntegrationCategory[] = ["external", "voice_engine", "ai_provider"];

export function ConnectionSettingsPanel() {
  return (
    <section aria-label="連携・プロバイダ設定">
      <h2>連携・プロバイダ設定(準備UI)</h2>
      <p style={{ color: "#555", fontSize: "0.9rem", maxWidth: "40rem" }}>
        FileMaker / Zoom Phone / VOICEVOX / whisper.cpp / OpenAI / Claude の接続設定を
        準備します。このフェーズでは<strong>実API接続・実認証情報の保存は行いません</strong>。
      </p>
      {CATEGORY_ORDER.map((category) => {
        const ids = INTEGRATION_IDS.filter((id) => INTEGRATION_CATEGORY[id] === category);
        return (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <h3>{INTEGRATION_CATEGORY_LABEL_JA[category]}</h3>
            {ids.map((id) => (
              <IntegrationSettingsCard key={id} integrationId={id} />
            ))}
          </div>
        );
      })}
    </section>
  );
}
