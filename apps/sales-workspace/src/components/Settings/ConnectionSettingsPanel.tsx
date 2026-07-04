import { useState } from "react";
import { connectionStatus } from "@musasabi/integrations";

const {
  resolveConnectionStatus,
  isDraftComplete,
  CONNECTION_STATUS_LABEL_JA,
  REQUIRED_CREDENTIAL_FIELDS,
  MockCredentialStore,
} = connectionStatus;

type IntegrationId = connectionStatus.IntegrationId;
type CredentialDraft = connectionStatus.CredentialDraft;

// 実接続は行わないため、保存先はメモリ上のみのMockCredentialStore
// (docs/ARCHITECTURE.md 第4.3章)。アプリを再起動すれば内容は失われる。
const credentialStore = new MockCredentialStore();

const INTEGRATION_LABELS_JA: Record<IntegrationId, string> = {
  filemaker: "FileMaker",
  zoom_phone: "Zoom Phone",
};

const FIELD_LABELS_JA: Record<IntegrationId, Record<string, string>> = {
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
};

const SECRET_FIELD_PATTERN = /password|secret/i;

/** FileMakerのhostフィールドのみ、最低限の形式チェックを行う(その他は完全性のみ判定)。 */
function validateDraftFormat(integrationId: IntegrationId, draft: CredentialDraft): boolean {
  if (integrationId === "filemaker" && draft.host) {
    return draft.host.startsWith("http://") || draft.host.startsWith("https://");
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
  }

  function handleReset(): void {
    credentialStore.clear(integrationId);
    setDraft({});
    setSetupStarted(false);
    setWasReset(true);
  }

  return (
    <fieldset style={{ marginBottom: "1.5rem" }}>
      <legend>{INTEGRATION_LABELS_JA[integrationId]}</legend>
      <p>
        ステータス: <strong>{CONNECTION_STATUS_LABEL_JA[status]}</strong>
      </p>
      <p style={{ color: "#555", fontSize: "0.9rem", maxWidth: "36rem" }}>
        本番接続は次フェーズで実装予定です。ここには<strong>ダミー値のみ</strong>
        入力してください。実際のAPIキー・パスワード・トークンは入力しないでください
        (保存先はこのアプリのメモリ上のみで、外部には一切送信されません)。
      </p>
      {requiredFields.map((field) => (
        <div key={field} style={{ marginBottom: "0.5rem" }}>
          <label>
            {FIELD_LABELS_JA[integrationId][field]}
            <br />
            <input
              type={SECRET_FIELD_PATTERN.test(field) ? "password" : "text"}
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

export function ConnectionSettingsPanel() {
  return (
    <section aria-label="連携設定">
      <h2>連携設定(準備UI)</h2>
      <IntegrationSettingsCard integrationId="filemaker" />
      <IntegrationSettingsCard integrationId="zoom_phone" />
    </section>
  );
}
