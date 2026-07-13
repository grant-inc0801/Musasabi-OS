// 無料外部連携(オプトイン実接続)。ユーザーが自分の Webhook URL / トークンを
// この端末の localStorage に入力した場合のみ有効化される実接続。
// - Discord / Slack Webhook: エージェント実行完了などの通知を実送信(無料)
// - GitHub 実データ: Fine-grained PAT(読み取り専用推奨)で Mission Control に実状況を表示
// URL・トークンは端末内のみに保存し、リポジトリ・外部サーバへは保存しない。
// 未設定なら一切の外部送信は発生しない。メール通知は Secret Center(OS資格情報ストア)
// にパスワードを保管して送信する(mailNotify.ts)。

import { recordMemory } from "./memoryStorage";
import { appLogger } from "./appLogger";
import { sendMailNotification } from "./mailNotify";

export interface FreeConnectorSettings {
  /** Discord Webhook URL(https://discord.com/api/webhooks/…)。空なら無効。 */
  discordWebhookUrl: string;
  /** Slack Incoming Webhook URL(https://hooks.slack.com/services/…)。空なら無効。 */
  slackWebhookUrl: string;
  /** エージェント実行完了時に通知を送るか。 */
  notifyOnAgentComplete: boolean;
  /** GitHub Fine-grained PAT(読み取り専用推奨)。空なら無効。 */
  githubToken: string;
  /** 対象リポジトリ(owner/repo)。 */
  githubRepo: string;
  /** GitHub API ベースURL(通常は変更不要。テスト用)。 */
  githubApiBase: string;
}

const KEY = "musasabi.freeConnectors";

export const DEFAULT_FREE_CONNECTORS: FreeConnectorSettings = {
  discordWebhookUrl: "",
  slackWebhookUrl: "",
  notifyOnAgentComplete: true,
  githubToken: "",
  githubRepo: "",
  githubApiBase: "https://api.github.com",
};

export function loadFreeConnectors(): FreeConnectorSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_FREE_CONNECTORS };
    return { ...DEFAULT_FREE_CONNECTORS, ...(JSON.parse(raw) as Partial<FreeConnectorSettings>) };
  } catch {
    return { ...DEFAULT_FREE_CONNECTORS };
  }
}

export function saveFreeConnectors(settings: FreeConnectorSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

type ExternalFetch = (url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** 外部HTTP(Tauri ではネイティブHTTP=CORS制約なし、ブラウザでは window.fetch)。 */
async function resolveExternalFetch(): Promise<ExternalFetch> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
      return tauriFetch as unknown as ExternalFetch;
    } catch {
      // fall through
    }
  }
  return ((url, init) => fetch(url, init)) as ExternalFetch;
}

/**
 * エージェント通知を実送信する(設定済みの Webhook のみ)。
 * 送信した接続先数を返す(未設定なら 0 で何も送らない)。
 */
export async function sendAgentNotification(title: string, detail: string): Promise<number> {
  const s = loadFreeConnectors();
  if (!s.notifyOnAgentComplete) return 0;
  const doFetch = await resolveExternalFetch();
  let sent = 0;
  const text = `🐿️ Musasabi OS — ${title}\n${detail.slice(0, 600)}`;
  if (s.discordWebhookUrl.startsWith("http")) {
    try {
      await doFetch(s.discordWebhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      sent += 1;
    } catch (e) {
      appLogger.warn("discord webhook failed", { error: String(e) });
    }
  }
  if (s.slackWebhookUrl.startsWith("http")) {
    try {
      await doFetch(s.slackWebhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      sent += 1;
    } catch (e) {
      appLogger.warn("slack webhook failed", { error: String(e) });
    }
  }
  // メール通知(Secret Center 設定時のみ・失敗は静かにスキップ)
  if (await sendMailNotification(`Musasabi OS — ${title}`, detail)) {
    sent += 1;
  }
  if (sent > 0) {
    recordMemory({
      category: "work",
      actor: "system",
      action: "外部通知を送信(Webhook/メール)",
      detail: `${title}(送信先 ${sent} 件)`,
      tags: ["free-connector", "webhook"],
    });
  }
  return sent;
}

export interface GithubRealStatus {
  repo: string;
  openIssues: number;
  latestCommitMessage: string;
  latestCommitSha: string;
  fetchedAtMs: number;
}

/** GitHub 実データ(トークン+リポジトリ設定時のみ)。未設定なら null。 */
export async function fetchGithubRealStatus(): Promise<GithubRealStatus | null> {
  const s = loadFreeConnectors();
  if (s.githubToken === "" || !/^[\w.-]+\/[\w.-]+$/.test(s.githubRepo)) return null;
  const doFetch = await resolveExternalFetch();
  const headers = {
    authorization: `Bearer ${s.githubToken}`,
    accept: "application/vnd.github+json",
  };
  const repoRes = await doFetch(`${s.githubApiBase}/repos/${s.githubRepo}`, { headers });
  if (!repoRes.ok) throw new Error(`GitHub API HTTP ${repoRes.status}`);
  const repo = (await repoRes.json()) as { open_issues_count?: number };
  const commitRes = await doFetch(`${s.githubApiBase}/repos/${s.githubRepo}/commits?per_page=1`, { headers });
  if (!commitRes.ok) throw new Error(`GitHub API HTTP ${commitRes.status}`);
  const commits = (await commitRes.json()) as Array<{ sha?: string; commit?: { message?: string } }>;
  const latest = commits[0];
  return {
    repo: s.githubRepo,
    openIssues: repo.open_issues_count ?? 0,
    latestCommitMessage: (latest?.commit?.message ?? "").split("\n")[0].slice(0, 80),
    latestCommitSha: (latest?.sha ?? "").slice(0, 7),
    fetchedAtMs: Date.now(),
  };
}
