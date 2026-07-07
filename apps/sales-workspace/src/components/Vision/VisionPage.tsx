import { useState } from "react";
import { analyzeUiSnapshot, UI_NODE_KIND_LABEL_JA } from "@musasabi/vision";
import type { VisionAnalysis } from "@musasabi/vision";
import { captureOwnUiSnapshot } from "../../lib/visionSnapshot";
import { recordMemory } from "../../lib/memoryStorage";

// Vision ページ(Development Bible 第11章)。手動オプトインの画面解析。
// 「この画面を解析する」を押した時のみ、自アプリのDOMからUI認識・ボタン検出・
// テキスト抽出・ウィンドウ情報を実行する。常時監視・自動実行・外部送信はしない。
// 他アプリ/デスクトップ全体の解析(実画面キャプチャ・実OCR)は未実装(承認後)。

export function VisionPage() {
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);

  function handleAnalyze(): void {
    const result = analyzeUiSnapshot(captureOwnUiSnapshot(), Date.now());
    setAnalysis(result);
    recordMemory({
      category: "work",
      actor: "system",
      action: "画面解析を実行(手動)",
      detail: result.summaryJa,
      tags: ["vision", "opt-in"],
    });
  }

  return (
    <>
      <section aria-label="画面解析">
        <h3 style={{ marginTop: 0 }}>画面解析(手動オプトイン)</h3>
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "44rem" }}>
          下のボタンを押した時のみ、このアプリ自身の画面を解析します
          (UI認識・ボタン検出・テキスト抽出・ウィンドウ情報)。
          常時監視・自動実行はせず、解析はローカル処理のみで外部送信はしません。
          他アプリやデスクトップ全体の解析(実画面キャプチャ・実OCR)は未実装で、
          ユーザー承認後のフェーズで扱います。
        </p>
        <button type="button" onClick={handleAnalyze}>
          この画面を解析する
        </button>
        {analysis && (
          <p style={{ margin: "0.75rem 0 0" }}>
            <strong>要約:</strong> {analysis.summaryJa}
            <br />
            <span style={{ color: "#7d8598", fontSize: "0.8rem" }}>
              解析日時: {new Date(analysis.analyzedAtMs).toLocaleString("ja-JP")}
              (実行は Company Brain に記録されます)
            </span>
          </p>
        )}
      </section>

      {analysis && (
        <>
          <section aria-label="検出要素">
            <h3 style={{ marginTop: 0 }}>検出要素</h3>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {(Object.keys(UI_NODE_KIND_LABEL_JA) as Array<keyof typeof UI_NODE_KIND_LABEL_JA>).map(
                (kind) => (
                  <div key={kind} className="card" style={{ minWidth: "7rem", textAlign: "center" }}>
                    <div style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>
                      {UI_NODE_KIND_LABEL_JA[kind]}
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                      {analysis.countByKind[kind]}
                    </div>
                  </div>
                ),
              )}
            </div>

            <h4>操作可能なボタン({analysis.actionableButtons.length}件)</h4>
            <table style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ラベル", "位置", "サイズ"].map((h) => (
                    <th key={h} style={cellStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.actionableButtons.map((b, i) => (
                  <tr key={`${b.label}-${i}`}>
                    <td style={cellStyle}>{b.label}</td>
                    <td style={cellStyle}>
                      ({b.bounds.x}, {b.bounds.y})
                    </td>
                    <td style={cellStyle}>
                      {b.bounds.width}×{b.bounds.height}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-label="抽出テキスト">
            <h3 style={{ marginTop: 0 }}>抽出テキスト({analysis.extractedTexts.length}件)</h3>
            <ul>
              {analysis.extractedTexts.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <h4>ウィンドウ</h4>
            <ul>
              {analysis.windows.map((w) => (
                <li key={w.label}>{w.label}</li>
              ))}
            </ul>
          </section>
        </>
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
