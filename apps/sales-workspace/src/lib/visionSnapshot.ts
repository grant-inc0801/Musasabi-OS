import type { UiBounds, UiNode } from "@musasabi/vision";

// 自アプリ画面のUIスナップショット取得(Vision の手動オプトイン入力)。
// ユーザーが「解析」ボタンを押した時のみ呼ばれる — 常時監視・自動実行はしない。
// 対象はこのアプリ自身のDOMのみで、他アプリ・デスクトップ画面は取得しない。

function boundsOf(el: Element): UiBounds {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
}

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** 現在表示中の自アプリ画面から UiNode 列を構築する。 */
export function captureOwnUiSnapshot(): UiNode[] {
  const nodes: UiNode[] = [];

  nodes.push({
    kind: "window",
    label: `${document.title}(${window.innerWidth}x${window.innerHeight})`,
    bounds: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
    enabled: true,
  });

  for (const el of Array.from(document.querySelectorAll("button"))) {
    if (!visible(el)) continue;
    nodes.push({
      kind: "button",
      label: (el.textContent ?? "").trim() || "(ラベルなし)",
      bounds: boundsOf(el),
      enabled: !el.disabled,
    });
  }

  for (const el of Array.from(document.querySelectorAll("input, select, textarea"))) {
    if (!visible(el)) continue;
    const input = el as HTMLInputElement;
    nodes.push({
      kind: "input",
      label: input.placeholder || input.getAttribute("aria-label") || input.name || "(入力欄)",
      bounds: boundsOf(el),
      enabled: !input.disabled,
    });
  }

  for (const el of Array.from(document.querySelectorAll("h1, h2, h3, h4"))) {
    if (!visible(el)) continue;
    const text = (el.textContent ?? "").trim();
    if (text !== "") {
      nodes.push({ kind: "heading", label: text, bounds: boundsOf(el), enabled: true });
    }
  }

  return nodes;
}
