import { useState } from "react";
import {
  fetchFeedItems,
  loadFeeds,
  saveFeeds,
  type RssFeed,
  type RssItem,
} from "../../lib/rssFeeds";
import { recordMemory } from "../../lib/memoryStorage";

// 市場調査部: 実データソース(RSS/Atom)管理。登録した公開フィードのみ取得
// (認証不要・読み取りのみ・無料)。エージェントの市場調査ツールもこの見出しを利用する。

export function RssSourcesSection() {
  const [feeds, setFeeds] = useState<RssFeed[]>(() => loadFeeds());
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [items, setItems] = useState<RssItem[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function addFeed(): void {
    const url = newUrl.trim();
    if (!url.startsWith("http")) {
      setNote("http/https のフィードURLを入力してください。");
      return;
    }
    const next = [...feeds, { id: `rss-${Date.now()}`, label: newLabel.trim() || url, url }];
    setFeeds(next);
    saveFeeds(next);
    setNewLabel("");
    setNewUrl("");
    setNote(null);
  }

  function removeFeed(id: string): void {
    const next = feeds.filter((f) => f.id !== id);
    setFeeds(next);
    saveFeeds(next);
  }

  async function preview(feed: RssFeed): Promise<void> {
    setBusy(true);
    setNote(null);
    try {
      const fetched = await fetchFeedItems(feed, 5);
      setItems(fetched);
      recordMemory({
        category: "work",
        actor: "市場調査部",
        action: `実データソース取得: ${feed.label}`,
        detail: fetched.map((i) => i.title).join(" / ").slice(0, 160),
        tags: ["rss", "research"],
      });
      if (fetched.length === 0) setNote("フィードから記事を取得できませんでした(形式を確認してください)。");
    } catch (e) {
      setNote(`取得に失敗しました: ${String(e)}`);
      setItems(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="実データソース">
      <h3>実データソース(RSS/Atom・本番)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
        公開フィードを登録すると、市場調査部とエージェントの市場調査ツールが
        <strong>本物の外部情報</strong>を使うようになります(認証不要・読み取りのみ・無料)。
        未登録なら外部取得は発生しません。
      </p>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <input
          aria-label="フィード名"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="表示名(例: 業界ニュース)"
          style={{ width: "12rem", fontSize: "0.8rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.55rem" }}
        />
        <input
          aria-label="フィードURL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/feed.xml"
          style={{ width: "22rem", fontSize: "0.8rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.55rem" }}
        />
        <button type="button" onClick={addFeed}>+ フィードを追加</button>
      </div>

      {feeds.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.5rem" }}>
          {feeds.map((f) => (
            <div key={f.id} className="card" style={{ padding: "0.4rem 0.7rem", fontSize: "0.8rem", display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
              <strong>{f.label}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{f.url}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: "0.35rem" }}>
                <button type="button" onClick={() => void preview(f)} disabled={busy}>
                  {busy ? "取得中…" : "▶ 最新を取得"}
                </button>
                <button type="button" onClick={() => removeFeed(f.id)}>削除</button>
              </span>
            </div>
          ))}
        </div>
      )}
      {note && <p style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>{note}</p>}
      {items && items.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>最新の見出し(実データ・Company Brain に記録済み):</div>
          <ul style={{ fontSize: "0.82rem", margin: "0.3rem 0 0" }}>
            {items.map((i, idx) => (
              <li key={idx}>
                {i.title}
                <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>({i.feedLabel} {i.publishedAt})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
