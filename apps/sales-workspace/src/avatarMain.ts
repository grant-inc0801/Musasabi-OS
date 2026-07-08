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
import {
  AVATAR_APPEARANCE_KEY,
  AVATAR_VRM_UPDATED_KEY,
  loadAvatarAppearance,
} from "./lib/avatarAppearance";
import { loadVrmBlob } from "./lib/vrmStore";
import {
  AUTOMATION_LAST_RUN_KEY,
  AUTOMATION_RECORDING_KEY,
  isRecordingFlagOn,
  loadRoutines,
  sendAutomationCommand,
} from "./lib/automationStorage";
import { addWorkLogEntry } from "@musasabi/call-training";
import { loadWorkLog, saveWorkLog } from "./lib/workLogStorage";
import mascotUrl from "./assets/mascot.png";

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
  setAppearance: (a: { bodyColor: string; bellyColor: string; eyeColor: string }) => void;
};
let avatar3d: Avatar3d | null = null;

// ミニパネルのアバターは管理画面(コマンドセンター)と同じ公式マスコット画像に
// 統一する(ユーザーFB第5弾)。アバター作成でVRMを保存した場合のみ3D表示する。
let mascotShown = false;

function showMascot(): void {
  const container = el("avatar");
  if (!container) return;
  container.textContent = "";
  const img = document.createElement("img");
  img.src = mascotUrl;
  img.alt = "";
  img.draggable = false;
  container.appendChild(img);
  avatar3d = null;
  mascotShown = true;
}

/** アバター表示の初期化: 保存済みVRMがあれば3D、無ければ公式マスコット画像。 */
async function initAvatar(): Promise<void> {
  let hasVrm = false;
  try {
    hasVrm = (await loadVrmBlob()) !== null;
  } catch {
    hasVrm = false;
  }
  if (hasVrm) {
    await initAvatar3d();
    if (!avatar3d) showMascot(); // WebGL不可でもマスコット画像で統一
  } else {
    showMascot();
  }
}

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
    renderer.setAppearance(loadAvatarAppearance());
    avatar3d = {
      manager,
      renderFrame: (t) => renderer.renderFrame(t),
      resize: (px) => renderer.resize(px),
      loadVrm: (url) => manager.loadAvatar(url),
      setAppearance: (a) => renderer.setAppearance(a),
    };
    const loop = (t: number): void => {
      manager.tick(t);
      renderer.renderFrame(t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // 設定画面で保存されたVRMがあれば読み込む(IndexedDB共有)。
    void loadSavedVrm();
  } catch {
    // WebGLが使えない環境では絵文字プレースホルダーのまま動かす。
    avatar3d = null;
  }
}

/** 設定画面(アバター作成)で保存されたVRMを常駐アバターへ反映する。 */
async function loadSavedVrm(): Promise<void> {
  if (!avatar3d) return;
  try {
    const blob = await loadVrmBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    await avatar3d.loadVrm(url).finally(() => URL.revokeObjectURL(url));
  } catch {
    // VRMが壊れている場合は標準ムササビのまま続行する。
  }
}

// 設定画面(別ウィンドウ)での「保存して反映」を storage イベントで検知して反映する。
window.addEventListener("storage", (event) => {
  if (event.key === AVATAR_APPEARANCE_KEY) {
    avatar3d?.setAppearance(loadAvatarAppearance());
  } else if (event.key === AVATAR_VRM_UPDATED_KEY) {
    if (avatar3d) {
      avatar3d.setAppearance(loadAvatarAppearance());
      void loadSavedVrm();
    } else {
      // マスコット表示中にVRMが保存されたら3D表示へ切り替える
      void initAvatar();
    }
  }
});

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
    // パネルの実寸を測ってウィンドウをコンテンツにフィットさせる
    // (固定の見積もりサイズだと膜がパネルより大きく見えるバグの修正)。
    // アバター領域はスライダー上限(AVATAR_MAX)分だけ確保し、スライダー操作では
    // ウィンドウを動かさない方針は維持する。
    const panelEl = el("panel");
    const panelH =
      panelEl && !panelEl.classList.contains("hidden") && panelEl.offsetHeight > 0
        ? panelEl.offsetHeight
        : PANEL_SIZE.h - AVATAR_MAX - 50;
    return { w: PANEL_SIZE.w, h: panelH + 8 + HANDLE_HEIGHT + AVATAR_MAX + 16 };
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
  // マスコット画像表示中は状態絵文字で上書きしない(画像で統一)
  if (mascotShown) return;
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

// 2階層メニューの状態(ユーザーFB第5弾)。大項目押下で小項目を開閉する。
type MajorMenu = "call" | "biz";
type BizView = "learning" | "development" | "support";
let expandedMajor: MajorMenu | null = "call";
let bizView: BizView | null = null;
let selectedRoutineId: string | null = null;

function menuButton(
  kind: "major" | "minor",
  label: string,
  active: boolean,
  onClick: () => void,
  withLamp = true,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = kind;
  button.classList.toggle("active", active);
  if (withLamp) {
    const lamp = document.createElement("span");
    lamp.className = "lamp";
    button.append(lamp);
  }
  const text = document.createElement("span");
  text.textContent = label;
  button.append(text);
  button.addEventListener("click", onClick);
  return button;
}

function renderPanel(): void {
  const panel = el("panel");
  const bubble = el("bubble");
  const modeLabel = el("mode-label");
  const menu = el("menu");
  const modeNote = el("mode-note");
  const chatLog = el("chat-log");
  if (!panel || !bubble || !modeLabel || !menu || !modeNote || !chatLog) {
    return;
  }

  panel.classList.toggle("hidden", !panelState.panelOpen);
  bubble.classList.toggle("hidden", panelState.bubble === null);
  bubble.textContent = panelState.bubble ?? "";

  modeLabel.textContent = CALL_MODE_LABEL_JA[panelState.mode];
  modeNote.textContent =
    panelState.mode === "autocall" ? "オートコールは承認待ちです(本番実行不可)" : "";

  // 大項目 → 小項目の2階層メニュー(小項目に緑ランプ点灯)
  const items: HTMLElement[] = [];

  // 大項目1: コールシステム(小項目 = Learning / Test / AutoCall)
  items.push(
    menuButton(
      "major",
      `${expandedMajor === "call" ? "▾" : "▸"} コールシステム`,
      false,
      () => {
        expandedMajor = expandedMajor === "call" ? null : "call";
        renderPanel();
      },
      false,
    ),
  );
  if (expandedMajor === "call") {
    for (const mode of CALL_MODES as readonly CallMode[]) {
      items.push(
        menuButton("minor", CALL_MODE_LABEL_JA[mode], mode === panelState.mode, () => {
          panelState = switchMode(panelState, mode);
          renderPanel();
        }),
      );
    }
  }

  // 大項目2: 業務支援(小項目 = Learning / Development / Support)
  items.push(
    menuButton(
      "major",
      `${expandedMajor === "biz" ? "▾" : "▸"} 業務支援`,
      false,
      () => {
        expandedMajor = expandedMajor === "biz" ? null : "biz";
        renderPanel();
      },
      false,
    ),
  );
  if (expandedMajor === "biz") {
    const recording = isRecordingFlagOn();
    items.push(
      menuButton("minor", "Learning(作業内容の学習)", bizView === "learning", () => {
        bizView = bizView === "learning" ? null : "learning";
        renderPanel();
      }),
      menuButton(
        "minor",
        recording ? "Development(記録中…)" : "Development(自動化ツール開発)",
        bizView === "development" || recording,
        () => {
          bizView = bizView === "development" ? null : "development";
          renderPanel();
        },
      ),
      menuButton("minor", "Support(自動化を実行)", bizView === "support", () => {
        bizView = bizView === "support" ? null : "support";
        renderPanel();
      }),
    );
  }
  menu.replaceChildren(...items);

  renderBizViews();

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

/** 業務支援の小項目コンテンツ(Learning/Development/Support)の表示切替と中身。 */
function renderBizViews(): void {
  const showBiz = expandedMajor === "biz" && panelState.panelOpen;
  el("biz-learning")?.classList.toggle("hidden", !(showBiz && bizView === "learning"));
  el("biz-development")?.classList.toggle("hidden", !(showBiz && bizView === "development"));
  el("biz-support")?.classList.toggle("hidden", !(showBiz && bizView === "support"));

  // Development: 記録状態に応じてボタン表示を切り替え
  const devToggle = el<HTMLButtonElement>("biz-dev-toggle");
  const devNote = el("biz-dev-note");
  if (devToggle && devNote) {
    const recording = isRecordingFlagOn();
    devToggle.textContent = recording ? "記録を停止して保存" : "記録を開始";
    devNote.textContent = recording
      ? "● 記録中 — メイン画面でページを移動すると操作が記録されます"
      : "";
  }

  // Support: 保存済み自動化の名前一覧(選択中にランプ点灯。選択で実行)
  const supportList = el("biz-support-list");
  if (supportList && showBiz && bizView === "support") {
    const routines = loadRoutines();
    if (routines.length === 0) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "保存された自動化はまだありません(Developmentで作成できます)。";
      supportList.replaceChildren(p);
    } else {
      supportList.replaceChildren(
        ...routines.map((routine) =>
          menuButton("minor", `${routine.name}(${routine.steps.length}操作)`, routine.id === selectedRoutineId, () => {
            selectedRoutineId = routine.id;
            sendAutomationCommand({ cmd: "replay", id: routine.id, ts: Date.now() });
            panelState = showBubbleState(`自動化「${routine.name}」を実行します(メイン画面で再生)。`);
            renderPanel();
          }),
        ),
      );
    }
  }
}

/** 業務支援ビューのイベント登録(初期化時に1回)。 */
function setupBizViews(): void {
  el("biz-learn-add")?.addEventListener("click", () => {
    const input = el<HTMLInputElement>("biz-learn-input");
    const note = el("biz-learn-note");
    if (!input || input.value.trim() === "") return;
    const next = addWorkLogEntry(loadWorkLog(), {
      departmentId: "dept-sales",
      text: input.value,
      nowMs: Date.now(),
    });
    saveWorkLog(next);
    if (note) note.textContent = "学習素材として保存しました。";
    input.value = "";
    renderPanel();
  });

  el("biz-dev-toggle")?.addEventListener("click", () => {
    const nameInput = el<HTMLInputElement>("biz-dev-name");
    if (isRecordingFlagOn()) {
      sendAutomationCommand({ cmd: "stop", name: nameInput?.value ?? "", ts: Date.now() });
      panelState = showBubbleState("記録を停止しました。名前を付けて自動化を保存します。");
      if (nameInput) nameInput.value = "";
    } else {
      sendAutomationCommand({ cmd: "start", ts: Date.now() });
      panelState = showBubbleState("記録を開始しました。メイン画面で操作してください。");
    }
    // フラグ反映は storage イベントで来るが、体感を良くするため少し待って再描画
    setTimeout(renderPanel, 150);
  });
}

// メイン画面側の記録フラグ・実行完了の変化を検知してランプ/表示を更新する。
window.addEventListener("storage", (event) => {
  if (event.key === AUTOMATION_RECORDING_KEY) {
    renderPanel();
  } else if (event.key === AUTOMATION_LAST_RUN_KEY && event.newValue !== null) {
    try {
      const info = JSON.parse(event.newValue) as { name?: string };
      panelState = showBubbleState(`自動化「${info.name ?? ""}」の実行が完了しました。`);
      renderPanel();
    } catch {
      /* 通知のみ */
    }
  }
});

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
  // VRMの取り込みは管理画面の「設定 > アバター作成」へ移行した(ユーザーFB第4弾)。
  // 保存されたVRM/カラーは storage イベント経由でこのウィンドウへ反映される。
}

function showBubbleState(text: string): AssistantPanelState {
  return { ...panelState, bubble: text };
}

renderAvatar(stateMachine.getState());
setupUi();
setupBizViews();
applyAvatarSize();
renderPanel();
void initAvatar();

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
