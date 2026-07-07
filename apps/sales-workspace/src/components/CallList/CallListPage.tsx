import { useState } from "react";
import {
  MockGoogleMapsProvider,
  PREFECTURES_JA,
  buildXlsx,
  callListToRows,
  summarizeCallList,
} from "@musasabi/call-list";
import type { CallListSummary, PlaceSearchResult } from "@musasabi/call-list";
import { recordMemory } from "../../lib/memoryStorage";

// 架電リスト制作課(開発部)。Googleマップ由来の飲食店情報を抽出し、
// 件数集計と Excel(.xlsx)出力を行う。現フェーズの検索は Mock プロバイダのみ
// (実 Google Maps / Places API への接続は承認後に差し替え)。外部送信なし。

const provider = new MockGoogleMapsProvider();

export function CallListPage() {
  const [prefecture, setPrefecture] = useState<string>(PREFECTURES_JA[12]); // 東京都
  const [cities, setCities] = useState<string[]>([""]);
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
  const [summary, setSummary] = useState<CallListSummary | null>(null);

  function updateCity(index: number, value: string): void {
    setCities((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addCityInput(): void {
    setCities((prev) => [...prev, ""]);
  }

  function removeCityInput(index: number): void {
    setCities((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSearch(): void {
    const filled = cities.map((c) => c.trim()).filter((c) => c !== "");
    if (filled.length === 0) {
      alert("市区町村を1件以上入力してください。");
      return;
    }
    const found = provider.search({ prefecture, cities: filled });
    setResults(found);
    const sum = summarizeCallList(found);
    setSummary(sum);
    recordMemory({
      category: "work",
      actor: "MUSA-301",
      action: "架電リストを検索",
      detail: `${prefecture} ${filled.join("・")} / ${sum.total}件(Mockデータ)`,
      tags: ["call-list", "dept-development"],
    });
  }

  function handleExport(): void {
    if (!results || results.length === 0) return;
    const bytes = buildXlsx(callListToRows(results));
    const cityLabel = results.map((r) => r.city).join("・");
    const fileName = `架電リスト_${prefecture}${cityLabel}.xlsx`;
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a); // DOM外のアンカーだとファイル名が反映されない
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    recordMemory({
      category: "work",
      actor: "MUSA-301",
      action: "架電リストをExcel出力",
      detail: `${fileName} / ${summary?.total ?? 0}件`,
      tags: ["call-list", "excel"],
    });
  }

  return (
    <>
      <section aria-label="検索条件">
        <h3 style={{ marginTop: 0 }}>架電リスト制作(飲食店抽出)</h3>
        <p style={{ color: "#f0883e", fontSize: "0.85rem", maxWidth: "44rem" }}>
          現在はMockデータで動作します(実 Google Maps API への接続は承認後)。
          抽出項目: 店舗名・郵便番号・住所・電話番号・ジャンル・営業時間・
          デリバリー有無・デリバリーサービス媒体。
        </p>

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

        <button type="button" onClick={handleSearch}>
          検索
        </button>{" "}
        <button type="button" onClick={handleExport} disabled={!results || results.length === 0}>
          Excel出力(.xlsx)
        </button>
      </section>

      {summary && (
        <section aria-label="件数集計">
          <h3 style={{ marginTop: 0 }}>件数集計</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <div className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>合計</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{summary.total}</div>
              <div style={{ color: "#7d8598", fontSize: "0.75rem" }}>件</div>
            </div>
            <div className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>デリバリー対応</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{summary.deliveryCount}</div>
              <div style={{ color: "#7d8598", fontSize: "0.75rem" }}>件</div>
            </div>
            {summary.byCity.map((c) => (
              <div key={c.city} className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
                <div style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>{c.city}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{c.count}</div>
                <div style={{ color: "#7d8598", fontSize: "0.75rem" }}>件</div>
              </div>
            ))}
          </div>
          <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
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
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
