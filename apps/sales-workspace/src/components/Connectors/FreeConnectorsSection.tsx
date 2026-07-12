import { useState } from "react";
import {
  loadFreeConnectors,
  saveFreeConnectors,
  sendAgentNotification,
  fetchGithubRealStatus,
} from "../../lib/freeConnectors";

// 無料コネクタ設定(実接続・オプトイン)。ユーザーが自分の Webhook URL / トークンを
// 入力した場合のみ有効。端末内(localStorage)のみに保存し、外部・リポジトリへは保存しない。

const inputStyle: React.CSSProperties = {
  width: "26rem",
  maxWidth: "100%",
  fontSize: "0.8rem",
  background: "var(--bg-card)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.35rem 0.55rem",
};

export function FreeConnectorsSection() {
  const [settings, setSettings] = useState(() => loadFreeConnectors());
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function save(): void {
    saveFreeConnectors(settings);
    setNote("保存しました(この端末のみ・外部/リポジトリへは保存しません)。");
  }

  async function testNotify(): Promise<void> {
    setBusy(true);
    setNote(null);
    try {
      saveFreeConnectors(settings);
      const sent = await sendAgentNotification("テスト通知", "無料コネクタのテスト送信です(Musasabi OS)。");
      setNote(sent > 0 ? `テスト通知を ${sent} 件送信しました。チャンネルを確認してください。` : "Webhook URL が未設定のため送信していません。");
    } catch (e) {
      setNote(`送信に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function testGithub(): Promise<void> {
    setBusy(true);
    setNote(null);
    try {
      saveFreeConnectors(settings);
      const status = await fetchGithubRealStatus();
      setNote(
        status
          ? `GitHub 接続OK: ${status.repo} / open issues+PRs ${status.openIssues} 件 / 最新: ${status.latestCommitSha} ${status.latestCommitMessage}`
          : "トークンまたはリポジトリ(owner/repo)が未設定です。",
      );
    } catch (e) {
      setNote(`GitHub 接続に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="無料コネクタ">
      <h3>無料コネクタ(実接続・オプトイン)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
        自分の Webhook URL / トークンを入力した場合のみ有効になる<strong>本物の外部連携(無料枠のみ)</strong>です。
        URL・トークンは<strong>この端末内(localStorage)のみ</strong>に保存され、リポジトリや外部サーバへは保存しません。
        未設定なら外部送信は一切発生しません。メール送信・カレンダー連携は認証情報の保管設計の確定後に追加予定です。
      </p>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        <strong style={{ fontSize: "0.85rem" }}>📣 エージェント完了通知(Discord / Slack Webhook)</strong>
        <label style={{ fontSize: "0.75rem" }}>
          Discord Webhook URL
          <br />
          <input
            aria-label="Discord Webhook URL"
            style={inputStyle}
            value={settings.discordWebhookUrl}
            onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value.trim() })}
            placeholder="https://discord.com/api/webhooks/…(未設定なら送信なし)"
          />
        </label>
        <label style={{ fontSize: "0.75rem" }}>
          Slack Incoming Webhook URL
          <br />
          <input
            aria-label="Slack Webhook URL"
            style={inputStyle}
            value={settings.slackWebhookUrl}
            onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value.trim() })}
            placeholder="https://hooks.slack.com/services/…(未設定なら送信なし)"
          />
        </label>
        <label style={{ fontSize: "0.78rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={settings.notifyOnAgentComplete}
            onChange={(e) => setSettings({ ...settings, notifyOnAgentComplete: e.target.checked })}
          />
          エージェント実行完了(手動/定例)を通知する
        </label>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button type="button" onClick={save}>保存</button>
          <button type="button" onClick={() => void testNotify()} disabled={busy}>
            {busy ? "送信中…" : "テスト通知を送信"}
          </button>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginTop: "0.6rem" }}>
        <strong style={{ fontSize: "0.85rem" }}>🐙 GitHub 実データ(Mission Control に実状況を表示)</strong>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
          Fine-grained PAT の<strong>読み取り専用・対象リポジトリ限定</strong>を推奨します。
        </p>
        <label style={{ fontSize: "0.75rem" }}>
          Personal Access Token
          <br />
          <input
            aria-label="GitHub Token"
            type="password"
            style={inputStyle}
            value={settings.githubToken}
            onChange={(e) => setSettings({ ...settings, githubToken: e.target.value.trim() })}
            placeholder="github_pat_…(未設定なら無効)"
          />
        </label>
        <label style={{ fontSize: "0.75rem" }}>
          リポジトリ(owner/repo)
          <br />
          <input
            aria-label="GitHub Repo"
            style={inputStyle}
            value={settings.githubRepo}
            onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value.trim() })}
            placeholder="例: your-name/your-repo"
          />
        </label>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button type="button" onClick={save}>保存</button>
          <button type="button" onClick={() => void testGithub()} disabled={busy}>
            {busy ? "確認中…" : "接続テスト"}
          </button>
        </div>
      </div>

      {note && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{note}</p>}
    </section>
  );
}
