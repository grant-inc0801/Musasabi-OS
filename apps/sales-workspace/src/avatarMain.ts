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

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// 常駐時に「アバター以外の透明画面を出さない」ため、ウィンドウ自体を表示内容に
// 合わせてリサイズする(D-20260706-006)。右下アンカーを保つよう、サイズ変更分だけ
// 位置を右下方向へ補正する。Tauri外(ブラウザ)では何もしない。
const WINDOW_PADDING = 32; // #stack のpadding+影の余白
const HANDLE_HEIGHT = 26; // ドラッグハンドル(⠿ 移動)の分
const PANEL_SIZE = { w: 340, h: 640 };
const BUBBLE_SIZE = { w: 340, h: 240 };

function desiredWindowSize(): { w: number; h: number } {
  if (panelState.panelOpen) {
    return { w: PANEL_SIZE.w, h: PANEL_SIZE.h + avatarSizePx };
  }
  if (panelState.bubble !== null) {
    return { w: BUBBLE_SIZE.w, h: BUBBLE_SIZE.h + avatarSizePx };
  }
  return {
    w: avatarSizePx + WINDOW_PADDING,
    h: avatarSizePx + WINDOW_PADDING + HANDLE_HEIGHT,
  };
}

async function resizeWindowToContent(): Promise<void> {
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
  const avatar = el("avatar");
  if (avatar) {
    avatar.textContent = AVATAR_STATE_EMOJI[state];
  }
}

/** アバターサイズ設定をCSS変数・スライダー・ウィンドウサイズへ反映する。 */
function applyAvatarSize(): void {
  document.documentElement.style.setProperty("--avatar-size", `${avatarSizePx}px`);
  const slider = el<HTMLInputElement>("size-slider");
  if (slider) {
    slider.value = String(avatarSizePx);
  }
}

function setAvatarSize(sizePx: number): void {
  avatarSizePx = clampAvatarSizePx(sizePx);
  saveAvatarSettings({ sizePx: avatarSizePx });
  applyAvatarSize();
  void resizeWindowToContent();
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
  void resizeWindowToContent();
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
}

renderAvatar(stateMachine.getState());
setupUi();
applyAvatarSize();
renderPanel();

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
