import { useState } from "react";
import {
  MockGoogleMapsProvider,
  MockMediaSearchProvider,
  SerpApiGoogleMapsProvider,
  SerpApiMediaSearchProvider,
  PREFECTURES_JA,
  applyMediaToResults,
  buildXlsx,
  callListToRows,
  mediaStoreKey,
  summarizeCallList,
} from "@musasabi/call-list";
import type {
  CallListSummary,
  MapsPlaceProvider,
  MediaSearchProvider,
  PlaceSearchResult,
} from "@musasabi/call-list";
import { recordMemory } from "../../lib/memoryStorage";
import { fetchJsonExternal } from "../../lib/httpClient";
import { saveBinaryFile } from "../../lib/saveFile";

// 架電リスト制作課(開発部)。Googleマップ由来の飲食店情報を抽出し、
// 件数集計と Excel(.xlsx)出力を行う。
// - APIキー未入力: Mock プロバイダ(決定的サンプルデータ)
// - SerpAPIキー入力時: 実データ取得(ユーザー承認済み)。キーはこの画面の
//   メモリ上でのみ保持し、localStorage 等へは保存しない(実認証情報の保存なし)。

const mockProvider = new MockGoogleMapsProvider();

function selectProvider(apiKey: string): MapsPlaceProvider {
  const key = apiKey.trim();
  return key === ""
    ? mockProvider
    : new SerpApiGoogleMapsProvider(key, fetchJsonExternal);
}

const mockMediaProvider = new MockMediaSearchProvider();

function selectMediaProvider(apiKey: string): MediaSearchProvider {
  const key = apiKey.trim();
  return key === "" ? mockMediaProvider : new SerpApiMediaSearchProvider(key, fetchJsonExternal);
}

export function CallListPage() {
  const [prefecture, setPrefecture] = useState<string>(PREFECTURES_JA[12]); // 東京都
  const [cities, setCities] = useState<string[]>([""]);
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
  const [summary, setSummary] = useState<CallListSummary | null>(null);
  // SerpAPIキー(メモリ保持のみ。localStorage等へ保存しない)
  const [apiKey, setApiKey] = useState("");
  const [searching, setSearching] = useState(false);
  const [dataSource, setDataSource] = useState<"mock" | "serpapi" | null>(null);
  const [mediaProgress, setMediaProgress] = useState<string | null>(null);
  const [mediaDone, setMediaDone] = useState(false);

  function updateCity(index: number, value: string): void {
    setCities((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addCityInput(): void {
    setCities((prev) => [...prev, ""]);
  }

  function removeCityInput(index: number): void {
    setCities((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSearch(): Promise<void> {
    // 市区町村が空欄の場合は都道府県全域で検索する(ユーザーFB第4弾)。
    const filled = cities.map((c) => c.trim()).filter((c) => c !== "");
    const provider = selectProvider(apiKey);
    const source = provider === mockProvider ? "mock" : "serpapi";
    setSearching(true);
    try {
      const found = await provider.search({ prefecture, cities: filled });
      setResults(found);
      setDataSource(source);
      setMediaDone(false);
      const sum = summarizeCallList(found);
      setSummary(sum);
      recordMemory({
        category: "work",
        actor: "MUSA-301",
        action: "架電リストを検索",
        detail: `${prefecture} ${filled.length > 0 ? filled.join("・") : "全域"} / ${sum.total}件(${source === "serpapi" ? "SerpAPI実データ" : "Mockデータ"})`,
        tags: ["call-list", "dept-development"],
      });
    } catch (error) {
      alert(`検索に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSearching(false);
    }
  }

  /**
   * 媒体検索: リスト中の各店舗について、Google 検索(SerpAPI)で店舗名または
   * 電話番号が一致するデリバリーサイト掲載を探し、利用媒体を同じリストへ統合する。
   * 1店舗=1リクエスト(SerpAPIのクォータを消費)。
   */
  async function handleMediaSearch(): Promise<void> {
    if (!results || results.length === 0 || mediaProgress !== null) return;
    const provider = selectMediaProvider(apiKey);
    const records = results.flatMap((r) => r.records);
    const mediaByStore = new Map<string, string[]>();
    try {
      for (let i = 0; i < records.length; i += 1) {
        setMediaProgress(`${i + 1}/${records.length}`);
        const media = await provider.searchMedia(records[i]);
        mediaByStore.set(mediaStoreKey(records[i]), media);
      }
    } catch (error) {
      alert(
        `媒体検索の途中でエラーが発生しました(取得済みの分だけ反映します): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      setMediaProgress(null);
    }
    const merged = applyMediaToResults(results, mediaByStore);
    setResults(merged);
    setSummary(summarizeCallList(merged));
    setMediaDone(true);
    recordMemory({
      category: "work",
      actor: "MUSA-301",
      action: "デリバリー媒体を照合",
      detail: `${mediaByStore.size}/${records.length}店舗を照合(${provider.name === "mock-media" ? "Mock" : "Google検索"})`,
      tags: ["call-list", "media-search"],
    });
  }

  async function handleExport(): Promise<void> {
    if (!results || results.length === 0) return;
    const bytes = buildXlsx(callListToRows(results));
    const cityLabel = results.map((r) => r.city).join("・");
    const fileName = `架電リスト_${prefecture}${cityLabel}.xlsx`;
    try {
      // Tauriでは保存先を選ぶダイアログを表示、ブラウザではダウンロード。
      const outcome = await saveBinaryFile(fileName, bytes, "Excel ワークブック", ["xlsx"]);
      if (outcome === "cancelled") return;
      recordMemory({
        category: "work",
        actor: "MUSA-301",
        action: "架電リストをExcel出力",
        detail: `${fileName} / ${summary?.total ?? 0}件${mediaDone ? "(媒体照合済み)" : ""}`,
        tags: ["call-list", "excel"],
      });
    } catch (error) {
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <>
      <section aria-label="検索条件">
        <h3 style={{ marginTop: 0 }}>架電リスト制作(飲食店抽出)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          抽出項目: 店舗名・郵便番号・住所・電話番号・ジャンル・営業時間・
          デリバリー有無・デリバリーサービス媒体。SerpAPIキーを入力すると
          Googleマップの実データを取得します(1市区町村につき1リクエスト・最大約20件)。
          未入力の場合はMockデータで動作します。
        </p>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            SerpAPIキー(実データ取得用・任意)
            <br />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="未入力の場合はMockデータ"
              style={{ width: "24rem" }}
              autoComplete="off"
            />
          </label>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
            キーはこの画面のメモリ上でのみ使用し、保存・記録はしません(アプリ再起動で消えます)。
            接続先は serpapi.com のみに制限されています。
          </p>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>
            都道府県
            <br />
            <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>
              {PREFECTURES_JA.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>市区町村(自由入力・複数可)</label>
          {cities.map((city, i) => (
            <div key={i} style={{ margin: "0.35rem 0" }}>
              <input
                type="text"
                value={city}
                onChange={(e) => updateCity(i, e.target.value)}
                placeholder="例: 高槻市"
                style={{ width: "16rem" }}
              />{" "}
              {cities.length > 1 && (
                <button type="button" onClick={() => removeCityInput(i)}>
                  削除
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCityInput}>
            + 入力欄を追加
          </button>
        </div>

        <button type="button" onClick={() => void handleSearch()} disabled={searching || mediaProgress !== null}>
          {searching ? "検索中…" : "検索"}
        </button>{" "}
        <button
          type="button"
          onClick={() => void handleMediaSearch()}
          disabled={!results || results.length === 0 || searching || mediaProgress !== null}
          title="店舗名または電話番号が一致するデリバリーサイト掲載をGoogle検索で照合します"
        >
          {mediaProgress ? `媒体検索中… ${mediaProgress}` : "媒体検索"}
        </button>{" "}
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={!results || results.length === 0 || mediaProgress !== null}
        >
          Excel出力(.xlsx)
        </button>
        {mediaDone && (
          <p style={{ color: "var(--ok)", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
            媒体検索の結果をリストへ統合しました。このままExcel出力すると媒体列も含まれます。
          </p>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.5rem 0 0", maxWidth: "44rem" }}>
          市区町村が空欄の場合は都道府県全域で検索します。媒体検索は1店舗につき
          1リクエストを消費します(SerpAPIキー入力時)。
        </p>
      </section>

      {summary && (
        <section aria-label="件数集計">
          <h3 style={{ marginTop: 0 }}>件数集計</h3>
          <p style={{ color: dataSource === "serpapi" ? "var(--ok)" : "var(--warn)", fontSize: "0.85rem" }}>
            データソース: {dataSource === "serpapi" ? "SerpAPI(Googleマップ実データ)" : "Mockデータ(サンプル)"}
            {dataSource === "serpapi" &&
              " ※デリバリー媒体はGoogleマップの検索結果に含まれないため空欄になります"}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <div className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>合計</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{summary.total}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
            <div className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>デリバリー対応</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{summary.deliveryCount}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
            {summary.byCity.map((c) => (
              <div key={c.city} className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.city}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{c.count}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            ジャンル別: {summary.byGenre.map((g) => `${g.genre} ${g.count}件`).join(" / ")}
          </p>
        </section>
      )}

      {results && (
        <section aria-label="抽出結果">
          <h3 style={{ marginTop: 0 }}>抽出結果</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", whiteSpace: "nowrap" }}>
              <thead>
                <tr>
                  {["店舗名", "郵便番号", "住所", "電話番号", "ジャンル", "営業時間", "デリバリー", "媒体"].map(
                    (h) => (
                      <th key={h} style={cellStyle}>
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {results.flatMap((result) =>
                  result.records.map((r) => (
                    <tr key={`${result.city}-${r.storeName}`}>
                      <td style={cellStyle}>{r.storeName}</td>
                      <td style={cellStyle}>{r.postalCode}</td>
                      <td style={cellStyle}>{r.address}</td>
                      <td style={cellStyle}>{r.phone}</td>
                      <td style={cellStyle}>{r.genre}</td>
                      <td style={cellStyle}>{r.businessHours}</td>
                      <td style={cellStyle}>{r.deliveryAvailable ? "あり" : "なし"}</td>
                      <td style={cellStyle}>{r.deliveryServices.join("、") || "—"}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
