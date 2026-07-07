import type { UiNode, UiNodeKind, VisionAnalysis } from "./types";
import { UI_NODE_KIND_LABEL_JA } from "./types";

// UIスナップショット解析(UI認識・ボタン検出・テキスト抽出・ウィンドウ管理)。
// 決定的ロジックのみ。スナップショットの取得(いつ・何を)はアプリ側の
// 手動オプトイン操作に委ねる — このパッケージは受け取った要素列を解析するだけ。

const KINDS: readonly UiNodeKind[] = ["button", "input", "heading", "text", "window"];

function buildSummaryJa(analysis: Omit<VisionAnalysis, "summaryJa">): string {
  const parts = KINDS.filter((k) => analysis.countByKind[k] > 0).map(
    (k) => `${UI_NODE_KIND_LABEL_JA[k]}${analysis.countByKind[k]}件`,
  );
  const buttons = analysis.actionableButtons
    .slice(0, 3)
    .map((b) => `「${b.label}」`)
    .join("");
  const buttonNote =
    analysis.actionableButtons.length > 0 ? ` 操作可能なボタン: ${buttons}など。` : "";
  return parts.length === 0
    ? "画面から要素を検出できませんでした。"
    : `画面から${parts.join("・")}を検出。${buttonNote}`.trimEnd();
}

/**
 * UIスナップショットを解析する(決定的・入力順を保持)。
 * ボタン検出は enabled なボタンのみを「操作可能」として返す。
 * テキスト抽出は見出し・テキストのラベルを重複除去して返す(擬似OCR)。
 */
export function analyzeUiSnapshot(nodes: readonly UiNode[], analyzedAtMs: number): VisionAnalysis {
  const countByKind = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<UiNodeKind, number>;
  const actionableButtons: UiNode[] = [];
  const inputs: UiNode[] = [];
  const windows: UiNode[] = [];
  const extractedTexts: string[] = [];

  for (const node of nodes) {
    countByKind[node.kind] += 1;
    if (node.kind === "button" && node.enabled) {
      actionableButtons.push({ ...node });
    } else if (node.kind === "input") {
      inputs.push({ ...node });
    } else if (node.kind === "window") {
      windows.push({ ...node });
    } else if (node.kind === "heading" || node.kind === "text") {
      const text = node.label.trim();
      if (text !== "" && !extractedTexts.includes(text)) {
        extractedTexts.push(text);
      }
    }
  }

  const base = { analyzedAtMs, actionableButtons, inputs, extractedTexts, windows, countByKind };
  return { ...base, summaryJa: buildSummaryJa(base) };
}
