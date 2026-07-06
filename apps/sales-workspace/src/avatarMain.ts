import { AvatarStateMachine, isAvatarState } from "@musasabi/avatar-2d";
import { clampAvatarSizePx } from "@musasabi/avatar-2d";
import type { AvatarState } from "@musasabi/avatar-2d";
import { AVATAR_EVENTS } from "@musasabi/shared";
import {
  createAssistantPanelState,
  togglePanel,
  switchMode,
  sendChat,
  dismissBubble,
  CALL_MODES,
  CALL_MODE_LABEL_JA,
} from "@musasabi/call-training";
import type { AssistantPanelState, CallMode } from "@musasabi/call-training";
import { AvatarManager } from "@musasabi/avatar-3d";
import { loadEmployeeSettings } from "./lib/employeeSettings";
import { loadAvatarSettings, saveAvatarSettings } from "./lib/avatarSettings";

// 右下常駐アバターウィンドウ本体(D-20260706-004)。
// apps/desktop/src-tauri/src/lib.rs が avatar.html として右下に生成する。
// - アバタークリック → ミニパネル開閉
// - ミニパネル: 現在モード表示 / Learning・Test・AutoCall 切替 / チャット / 提案表示 /
//   メイン管理画面を開く
// - 吹き出し: 提案・通知・注意事項の短文表示(クリックで閉じる)
// 状態管理は @musasabi/call-training の assistantPanel(決定論・テスト済み)を使う。
// AutoCall はモード表示の切替のみで本番実行はしない(実架電なし)。

// 実アセット(VRM等)はAIクリエイティブ本部が用意するまでの仮表示。
// 白黒ムササビアイコンと合わせた絵文字プレースホルダー(D-20260706-004 実装指示4)。
const AVATAR_STATE_EMOJI: Record<AvatarState, string> = {
  idle: "😴",
  working: "💻",
  preparing_call: "🤔",
  follow_up: "📓",
  goal_achieved: "🎉",
};

const stateMachine = new AvatarStateMachine();
let panelState: AssistantPanelState = createAssistantPanelState(
  loadEmployeeSettings().defaultCallMode,
);
let avatarSizePx = loadAvatarSettings().sizePx;

// 3Dアバター(Issue #200)。three.js + @pixiv/three-vrm による実レンダラー。
// 初期化に失敗した環境(WebGL不可)では従来の絵文字表示へフォールバックする。
// レンダラー実装は動的importで読み込む(three.js を別チャンクに分離)。
type Avatar3d = {
  manager: AvatarManager;
  renderFrame: (timeMs: number) => void;
  resize: (px: number) => void;
  loadVrm: (url: string) => Promise<void>;
};
let avatar3d: Avatar3d | null = null;

async function initAvatar3d(): Promise<void> {
  const container = el("avatar");
  if (!container) {
    return;
  }
  try {
    const { ThreeVrmRenderer } = await import("./avatar3d/ThreeVrmRenderer");
    const canvas = document.createElement("canvas");
    const renderer = new ThreeVrmRenderer(canvas);
    const manager = new AvatarManager(renderer);
    manager.setState(stateMachine.getState());
    container.textContent = ""; // 絵文字を消してcanvasへ置き換え
    container.appendChild(canvas);
    renderer.resize(avatarSizePx);
    avatar3d = {
      manager,
      renderFrame: (t) => renderer.renderFrame(t),
      resize: (px) => renderer.resize(px),
      loadVrm: (url) => manager.loadAvatar(url),
    };
    const loop = (t: number): void => {
      manager.tick(t);
      renderer.renderFrame(t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } catch {
    // WebGLが使えない環境では絵文字プレースホルダーのまま動かす。
    avatar3d = null;
  }
}

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// 常駐時に「アバター以外の透明画面を出さない」ため、ウィンドウ自体を表示内容に
// 合わせてリサイズする(D-20260706-006)。右下アンカーを保つよう、サイズ変更分だけ
// 位置を右下方向へ補正する。Tauri外(ブラウザ)では何もしない。
//
// スライダー操作でウィンドウが移動して見えなくなる不具合対策(ユーザーFB):
// - パネル表示中のウィンドウサイズはアバターサイズに依存しない固定値にする
//   (スライダー操作ではウィンドウを一切動かさない)
// - リサイズ処理は直列化し、並行実行による位置ドリフトを防ぐ
const WINDOW_PADDING = 32; // #stack のpadding+影の余白
const HANDLE_HEIGHT = 26; // ドラッグハンドル(⠿ 移動)の分
const AVATAR_MAX = 160; // スライダー上限(パネル表示中はこの分を常に確保)
const PANEL_SIZE = { w: 340, h: 620 + AVATAR_MAX };
const BUBBLE_SIZE = { w: 340, h: 240 };

function desiredWindowSize(): { w: number; h: number } {
  if (panelState.panelOpen) {
    // アバターサイズに依存しない固定サイズ(スライダー中に窓が動かないように)。
    return PANEL_SIZE;
  }
  if (panelState.bubble !== null) {
    return { w: BUBBLE_SIZE.w, h: BUBBLE_SIZE.h + avatarSizePx };
  }
  return {
    w: avatarSizePx + WINDOW_PADDING,
    h: avatarSizePx + WINDOW_PADDING + HANDLE_HEIGHT,
  };
}

// リサイズの直列化キュー。並行した outerSize/setPosition の読み書き競合で
// ウィンドウが右下方向へ流れていくのを防ぐ。
let resizeChain: Promise<void> = Promise.resolve();

function resizeWindowToContent(): void {
  resizeChain = resizeChain.then(doResizeWindow).catch(() => {});
}

async function doResizeWindow(): Promise<void> {
  try {
    const { getCurrentWindow, PhysicalPosition, PhysicalSize } = await import(
      "@tauri-apps/api/window"
    );
    const win = getCurrentWindow();
    const scale = await win.scaleFactor();
    const current = await win.outerSize();
    const position = await win.outerPosition();
    const next = desiredWindowSize();
    const nextW = Math.round(next.w * scale);
    const nextH = Math.round(next.h * scale);
    if (nextW === current.width && nextH === current.height) {
      return;
    }
    // 右下アンカー: 右下座標(x+w, y+h)を固定したままサイズを変える。
    const x = position.x + current.width - nextW;
    const y = position.y + current.height - nextH;
    await win.setSize(new PhysicalSize(nextW, nextH));
    await win.setPosition(new PhysicalPosition(x, y));
  } catch {
    // ブラウザ単体(vite dev)ではウィンドウAPIが無い。表示のみで続行する。
  }
}

function renderAvatar(state: AvatarState): void {
  if (avatar3d) {
    avatar3d.manager.setState(state);
    return;
  }
  const avatar = el("avatar");
  if (avatar) {
    avatar.textContent = AVATAR_STATE_EMOJI[state];
  }
}

/** アバターサイズ設定をCSS変数・スライダー・3Dキャンバスへ反映する。 */
function applyAvatarSize(): void {
  document.documentElement.style.setProperty("--avatar-size", `${avatarSizePx}px`);
  avatar3d?.resize(avatarSizePx);
  const slider = el<HTMLInputElement>("size-slider");
  if (slider) {
    slider.value = String(avatarSizePx);
  }
}

function setAvatarSize(sizePx: number): void {
  avatarSizePx = clampAvatarSizePx(sizePx);
  saveAvatarSettings({ sizePx: avatarSizePx });
  applyAvatarSize();
  // パネル表示中はウィンドウ固定サイズのためリサイズ不要(スライダーで窓が動かない)。
  // 閉じている(アバターのみ)状態でのサイズ変更のみウィンドウへ反映する。
  if (!panelState.panelOpen) {
    resizeWindowToContent();
  }
}

function renderPanel(): void {
  const panel = el("panel");
  const bubble = el("bubble");
  const modeLabel = el("mode-label");
  const modeRow = el("mode-row");
  const modeNote = el("mode-note");
  const chatLog = el("chat-log");
  if (!panel || !bubble || !modeLabel || !modeRow || !modeNote || !chatLog) {
    return;
  }

  panel.classList.toggle("hidden", !panelState.panelOpen);
  bubble.classList.toggle("hidden", panelState.bubble === null);
  bubble.textContent = panelState.bubble ?? "";

  modeLabel.textContent = CALL_MODE_LABEL_JA[panelState.mode];
  modeNote.textContent =
    panelState.mode === "autocall" ? "オートコールは承認待ちです(本番実行不可)" : "";

  // モード切替(縦配置。該当モードに緑ランプ点灯)
  modeRow.replaceChildren(
    ...CALL_MODES.map((mode: CallMode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.toggle("active", mode === panelState.mode);
      const lamp = document.createElement("span");
      lamp.className = "lamp";
      const label = document.createElement("span");
      label.textContent = CALL_MODE_LABEL_JA[mode];
      button.append(lamp, label);
      button.addEventListener("click", () => {
        panelState = switchMode(panelState, mode);
        renderPanel();
      });
      return button;
    }),
  );

  chatLog.replaceChildren(
    ...panelState.chat.map((message) => {
      const p = document.createElement("p");
      p.className = message.speaker;
      p.textContent = `${message.speaker === "musa" ? "MUSA" : "あなた"}: ${message.text}`;
      return p;
    }),
  );
  chatLog.scrollTop = chatLog.scrollHeight;

  // 表示内容(アバターのみ/吹き出し/ミニパネル)に合わせてウィンドウをリサイズする。
  resizeWindowToContent();
}

function handleSend(): void {
  const input = el<HTMLInputElement>("chat-input");
  if (!input) {
    return;
  }
  panelState = sendChat(panelState, input.value, Date.now());
  input.value = "";
  renderPanel();
}

/** メイン管理画面を開く(Tauri内のみ。ブラウザ実行時は何もしない)。 */
async function openMainWindow(): Promise<void> {
  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const main = await WebviewWindow.getByLabel("main");
    if (main) {
      await main.unminimize();
      await main.show();
      await main.setFocus();
    }
  } catch {
    // ブラウザ単体(vite dev)ではTauri APIが無い。UI開発時は無視してよい。
  }
}

function setupUi(): void {
  el("avatar")?.addEventListener("click", () => {
    panelState = togglePanel(panelState);
    renderPanel();
  });
  el("bubble")?.addEventListener("click", () => {
    panelState = dismissBubble(panelState);
    renderPanel();
  });
  el("send-btn")?.addEventListener("click", handleSend);
  el<HTMLInputElement>("chat-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  });
  el("open-main")?.addEventListener("click", () => {
    void openMainWindow();
  });
  el<HTMLInputElement>("size-slider")?.addEventListener("input", (event) => {
    setAvatarSize(Number((event.target as HTMLInputElement).value));
  });
  // VRoid Studio 製 VRM の読み込み(ローカルファイルのみ。外部送信なし)。
  el("load-vrm")?.addEventListener("click", () => {
    el<HTMLInputElement>("vrm-file")?.click();
  });
  el<HTMLInputElement>("vrm-file")?.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    if (!avatar3d) {
      panelState = showBubbleState("この環境では3D表示を利用できません(WebGL無効)。");
      renderPanel();
      return;
    }
    const url = URL.createObjectURL(file);
    avatar3d
      .loadVrm(url)
      .then(() => {
        panelState = showBubbleState(`VRMアバターを読み込みました: ${file.name}`);
        renderPanel();
      })
      .catch((error) => {
        panelState = showBubbleState(`VRMの読み込みに失敗しました: ${String(error)}`);
        renderPanel();
      })
      .finally(() => URL.revokeObjectURL(url));
  });
}

function showBubbleState(text: string): AssistantPanelState {
  return { ...panelState, bubble: text };
}

renderAvatar(stateMachine.getState());
setupUi();
applyAvatarSize();
renderPanel();
void initAvatar3d();

// メインウィンドウからのアバター状態遷移イベント(Tauri内のみ)。
async function listenAvatarEvents(): Promise<void> {
  const { emit, listen } = await import("@tauri-apps/api/event");

  await listen<string>(AVATAR_EVENTS.setState, async (event) => {
    const requested = event.payload;
    if (!isAvatarState(requested)) {
      return;
    }
    const nextState = stateMachine.transition(requested);
    renderAvatar(nextState);
    await emit(AVATAR_EVENTS.stateChanged, nextState);
  });
}

listenAvatarEvents().catch(() => {
  // ブラウザ単体実行時はTauriイベントAPIが無い。アバター表示のみ行う。
});
