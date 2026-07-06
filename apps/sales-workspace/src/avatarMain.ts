import { AvatarStateMachine, isAvatarState } from "@musasabi/avatar-2d";
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

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function renderAvatar(state: AvatarState): void {
  const avatar = el("avatar");
  if (avatar) {
    avatar.textContent = AVATAR_STATE_EMOJI[state];
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

  // モード切替ボタン(3件固定なので毎回作り直す)
  modeRow.replaceChildren(
    ...CALL_MODES.map((mode: CallMode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = CALL_MODE_LABEL_JA[mode];
      button.classList.toggle("active", mode === panelState.mode);
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
}

renderAvatar(stateMachine.getState());
setupUi();
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
