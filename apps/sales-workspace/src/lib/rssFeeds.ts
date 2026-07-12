// 市場調査の実データソース(RSS/Atom・本番実装・無課金)。
// ユーザーが登録した公開フィードのみを取得する(認証情報不要・読み取りのみ)。
// デスクトップでは Rust コマンド fetch_rss(GET・1MB上限)経由、ブラウザでは fetch。
// 未登録なら外部取得は一切発生しない。

export interface RssFeed {
  id: string;
  label: string;
  url: string;
}

export interface RssItem {
  feedLabel: string;
  title: string;
  link: string;
  publishedAt: string;
}

const KEY = "musasabi.rssFeeds";

export function loadFeeds(): RssFeed[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as RssFeed[]) : [];
    return Array.isArray(parsed) ? parsed.filter((f) => f && typeof f.url === "string") : [];
  } catch {
    return [];
  }
}

export function saveFeeds(feeds: readonly RssFeed[]): void {
  localStorage.setItem(KEY, JSON.stringify(feeds));
}

async function fetchFeedXml(url: string): Promise<string> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { invoke } = await import("@tauri-apps/api/core");
    const res = await invoke<{ status: number; body: string }>("fetch_rss", { url });
    if (res.status < 200 || res.status >= 300) throw new Error(`RSS HTTP ${res.status}`);
    return res.body;
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`RSS HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** RSS2.0 / Atom の両方をパースして最新 items を返す。 */
export function parseFeedXml(xml: string, feedLabel: string, limit = 10): RssItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  const items: RssItem[] = [];
  // RSS 2.0
  for (const item of Array.from(doc.querySelectorAll("channel > item")).slice(0, limit)) {
    items.push({
      feedLabel,
      title: item.querySelector("title")?.textContent?.trim() ?? "",
      link: item.querySelector("link")?.textContent?.trim() ?? "",
      publishedAt: item.querySelector("pubDate")?.textContent?.trim() ?? "",
    });
  }
  if (items.length > 0) return items;
  // Atom
  for (const entry of Array.from(doc.getElementsByTagName("entry")).slice(0, limit)) {
    items.push({
      feedLabel,
      title: entry.getElementsByTagName("title")[0]?.textContent?.trim() ?? "",
      link: entry.getElementsByTagName("link")[0]?.getAttribute("href") ?? "",
      publishedAt: entry.getElementsByTagName("updated")[0]?.textContent?.trim() ?? "",
    });
  }
  return items;
}

/** 1フィードを取得してパースする。 */
export async function fetchFeedItems(feed: RssFeed, limit = 10): Promise<RssItem[]> {
  const xml = await fetchFeedXml(feed.url);
  return parseFeedXml(xml, feed.label, limit).filter((i) => i.title !== "");
}

/** 登録済み全フィードの最新見出しを集める(失敗フィードはスキップ)。 */
export async function fetchAllHeadlines(limitPerFeed = 5): Promise<RssItem[]> {
  const feeds = loadFeeds();
  const all: RssItem[] = [];
  for (const feed of feeds) {
    try {
      all.push(...(await fetchFeedItems(feed, limitPerFeed)));
    } catch {
      // 失敗フィードはスキップ(調査は残りのソースで続行)
    }
  }
  return all;
}
