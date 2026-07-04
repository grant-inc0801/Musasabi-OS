import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from "electron";
import * as path from "path";

// Phase 1(docs/ARCHITECTURE.md): Electron main process, Windowsトレイ常駐、
// ログイン時自動起動。ウィンドウの中身(Sales Workspace / Avatar)は後続フェーズで接続する。

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

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

ipcMain.handle("musasabi:getAppVersion", () => app.getVersion());
