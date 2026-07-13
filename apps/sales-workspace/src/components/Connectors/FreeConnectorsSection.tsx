import { useEffect, useState } from "react";
import {
  clearMailPassword,
  hasMailPassword,
  isMailSupported,
  loadMailSettings,
  saveMailSettings,
  sendMail,
  setMailPassword,
} from "../../lib/mailNotify";
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
  const [mail, setMail] = useState(() => loadMailSettings());
  const [mailPw, setMailPw] = useState("");
  const [pwStored, setPwStored] = useState(false);

  useEffect(() => {
    void hasMailPassword().then(setPwStored);
  }, []);

  async function saveMail(): Promise<void> {
    saveMailSettings(mail);
    if (mailPw !== "") {
      await setMailPassword(mailPw);
      setMailPw("");
      setPwStored(true);
      setNote("メール設定を保存しました(パスワードはOS資格情報ストアに暗号化保管・画面には二度と表示されません)。");
    } else {
      setNote("メール設定を保存しました。");
    }
  }

  async function testMail(): Promise<void> {
    setBusy(true);
    setNote(null);
    try {
      await saveMail();
      await sendMail("Musasabi OS — テストメール", "メール通知のテスト送信です。この通知はエージェント実行完了時にも届きます。");
      setNote("テストメールを送信しました。受信箱を確認してください。");
    } catch (e) {
      setNote(`メール送信に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

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
        未設定なら外部送信は一切発生しません。メール通知のパスワードは Secret Center(OS資格情報ストア)に暗号化保管されます。
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

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginTop: "0.6rem" }}>
        <strong style={{ fontSize: "0.85rem" }}>✉ メール通知(SMTP・Secret Center)</strong>
        {isMailSupported() ? (
          <>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
              エージェント完了通知などをメールで受け取ります(Gmail はアプリパスワードを使用・無料枠)。
              パスワードは <strong>OS資格情報ストア(Secret Center)にのみ暗号化保管</strong>され、
              localStorage・リポジトリには保存されません。
            </p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <input aria-label="SMTPホスト" style={{ ...inputStyle, width: "12rem" }} value={mail.host}
                onChange={(e) => setMail({ ...mail, host: e.target.value.trim() })} placeholder="smtp.gmail.com" />
              <input aria-label="ポート" type="number" style={{ ...inputStyle, width: "5rem" }} value={mail.port}
                onChange={(e) => setMail({ ...mail, port: Number(e.target.value) || 587 })} />
              <label style={{ fontSize: "0.72rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                <input type="checkbox" checked={mail.useTls} onChange={(e) => setMail({ ...mail, useTls: e.target.checked })} />
                STARTTLS
              </label>
            </div>
            <input aria-label="SMTPユーザー" style={inputStyle} value={mail.user}
              onChange={(e) => setMail({ ...mail, user: e.target.value.trim() })} placeholder="ユーザー(例: you@gmail.com)" />
            <input aria-label="SMTPパスワード" type="password" style={inputStyle} value={mailPw}
              onChange={(e) => setMailPw(e.target.value)}
              placeholder={pwStored ? "(保存済み — 変更する場合のみ入力)" : "アプリパスワード(Secret Centerへ保管)"} />
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <input aria-label="From" style={{ ...inputStyle, width: "16rem" }} value={mail.from}
                onChange={(e) => setMail({ ...mail, from: e.target.value.trim() })} placeholder="From(例: Musasabi <you@gmail.com>)" />
              <input aria-label="To" style={{ ...inputStyle, width: "16rem" }} value={mail.to}
                onChange={(e) => setMail({ ...mail, to: e.target.value.trim() })} placeholder="To(通知の宛先)" />
            </div>
            <label style={{ fontSize: "0.78rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <input type="checkbox" checked={mail.enabled} onChange={(e) => setMail({ ...mail, enabled: e.target.checked })} />
              エージェント実行完了をメールで通知する
            </label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button type="button" onClick={() => void saveMail()}>保存</button>
              <button type="button" onClick={() => void testMail()} disabled={busy}>
                {busy ? "送信中…" : "テストメールを送信"}
              </button>
              {pwStored && (
                <button type="button" onClick={() => { void clearMailPassword().then(() => { setPwStored(false); setNote("保存済みパスワードを削除しました。"); }); }}>
                  保存済みパスワードを削除
                </button>
              )}
            </div>
          </>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
            メール通知はデスクトップ版で利用できます(パスワードをOS資格情報ストアに保管するため)。
          </p>
        )}
      </div>

      {note && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{note}</p>}
    </section>
  );
}
