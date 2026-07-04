import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from "electron";
import * as path from "path";
import { AvatarStateMachine, isAvatarState, type AvatarState } from "@musasabi/avatar-2d";
import { IPC_CHANNELS } from "@musasabi/shared";

// Phase 1(docs/ARCHITECTURE.md): Electron main process, Windowsトレイ常駐、
// ログイン時自動起動。Phase 2: MUSA常駐アバターのオーバーレイウィンドウとIPC連携。

let mainWindow: BrowserWindow | null = null;
let avatarWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const avatarStateMachine = new AvatarStateMachine();

// 実アセット(SVG/Live2D等)はAIクリエイティブ本部が用意するまでの仮表示(Organization Bible 第3.5章)。
const AVATAR_STATE_EMOJI: Record<AvatarState, string> = {
  idle: "😴",
  working: "💻",
  preparing_call: "🤔",
  follow_up: "📓",
  goal_achieved: "🎉",
};

const ICON_PATH = path.join(__dirname, "..", "assets", "icon.png");

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(
    `data:text/html,${encodeURIComponent(
      "<title>Musasabi OS</title><body style='font-family:sans-serif;padding:2rem'>" +
        "<h1>Musasabi OS</h1><p>Sales Workspace は今後のフェーズで接続されます。</p></body>",
    )}`,
  );

  mainWindow.on("close", (event) => {
    // Xボタンではアプリを終了せず、トレイに常駐させる(Development Bible 第8章: 常駐アバター)。
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function renderAvatarHtml(state: AvatarState): string {
  return `<title>MUSA</title><body style="margin:0;display:flex;align-items:center;
    justify-content:center;height:100vh;background:transparent;font-size:64px;">
    <span id="avatar">${AVATAR_STATE_EMOJI[state]}</span></body>`;
}

function createAvatarWindow(): void {
  avatarWindow = new BrowserWindow({
    width: 120,
    height: 120,
    x: 40,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  avatarWindow.loadURL(
    `data:text/html,${encodeURIComponent(renderAvatarHtml(avatarStateMachine.getState()))}`,
  );

  avatarStateMachine.onChange((state) => {
    avatarWindow?.loadURL(`data:text/html,${encodeURIComponent(renderAvatarHtml(state))}`);
  });
}

function createTray(): void {
  const icon = nativeImage.createFromPath(ICON_PATH);
  tray = new Tray(icon);
  tray.setToolTip("Musasabi OS");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "開く",
        click: () => mainWindow?.show(),
      },
      {
        label: "終了",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on("click", () => mainWindow?.show());
}

function configureAutoLaunch(): void {
  // Windows/macOSではElectron標準APIでログイン時自動起動を設定できる(Linuxは非対応)。
  app.setLoginItemSettings({ openAtLogin: true });
}

app.whenReady().then(() => {
  createMainWindow();
  createAvatarWindow();
  createTray();
  configureAutoLaunch();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on("window-all-closed", () => {
  // トレイ常駐が前提のため、ウィンドウを閉じてもプロセスは終了しない。
});

app.on("before-quit", () => {
  isQuitting = true;
});

ipcMain.handle(IPC_CHANNELS.getAppVersion, () => app.getVersion());

// テストイベント(手動IPC呼び出しや将来のVoice Engine/ai-coreからの通知)でアバターの
// 状態を切り替える(docs/ARCHITECTURE.md Phase 2 受け入れ基準)。
ipcMain.handle(IPC_CHANNELS.avatarSetState, (_event, state: string) => {
  if (!isAvatarState(state)) {
    throw new Error(`Unknown avatar state: ${state}`);
  }
  return avatarStateMachine.transition(state);
});
