use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

// Tauri移行(docs/ARCHITECTURE.md 第0.2章・第4.2章)。Electron版
// (旧 apps/desktop/src/main.ts、git履歴に残る)からメインウィンドウ・トレイ常駐・
// 自動起動・アバターオーバーレイウィンドウの構成を移植したもの。
//
// ビジネスロジック(リード取得・通話解析・音声合成)はNode/Electron特権プロセスに
// 依存しないフレームワーク非依存パッケージ(@musasabi/ai-core 等)なので、Rust側に
// IPCコマンドとして持たず、Sales Workspace側(メインウィンドウのWebViewそのもの)から
// 直接呼び出す(apps/sales-workspace/src/desktopBridge.ts)。Rust側の責務はネイティブな
// ウィンドウ管理・トレイ・自動起動・アバターウィンドウ間のイベント中継のみ。

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Windows/macOSでログイン時自動起動を有効化する(Electron版の
      // `app.setLoginItemSettings({ openAtLogin: true })` 相当)。
      let _ = app.autolaunch().enable();

      // MUSA常駐アバターのオーバーレイウィンドウ(Phase 2 / D-20260706-004 / -006)。
      // 表示ロジック(アバター・吹き出し・ミニパネル)は apps/sales-workspace/avatar.html +
      // src/avatarMain.ts に実装。常駐時に「アバター以外の透明画面を出さない」ため、
      // ウィンドウは最初アバターのみのサイズで生成し、ミニパネル/吹き出しの開閉・
      // サイズ変更時は JS 側(avatarMain.ts)が右下アンカーを維持したまま
      // set_size / set_position でリサイズする(D-20260706-006)。
      let avatar_w = 152.0; // 大サイズアバター(120px)+余白
      let avatar_h = 152.0;
      let avatar_window =
        WebviewWindowBuilder::new(app, "avatar", WebviewUrl::App("avatar.html".into()))
          .title("MUSA")
          .inner_size(avatar_w, avatar_h)
          .decorations(false)
          .transparent(true)
          .always_on_top(true)
          .skip_taskbar(true)
          .resizable(false)
          .build()?;
      // プライマリモニタの右下(タスクバー分の余白込み)に配置する。
      if let Ok(Some(monitor)) = avatar_window.primary_monitor() {
        let size = monitor.size();
        let scale = monitor.scale_factor();
        let margin = (16.0 * scale) as i32;
        let taskbar_margin = (56.0 * scale) as i32;
        let x = size.width as i32 - (avatar_w * scale) as i32 - margin;
        let y = size.height as i32 - (avatar_h * scale) as i32 - taskbar_margin;
        let _ = avatar_window.set_position(tauri::PhysicalPosition::new(x, y));
      }

      // システムトレイ常駐(Development Bible 第8章: 常駐アバター)。
      let open_item = MenuItem::with_id(app, "open", "開く", true, None::<&str>)?;
      let quit_item = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
      let tray_menu = Menu::with_items(app, &[&open_item, &quit_item])?;

      TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Musasabi OS")
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "open" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
          } = event
          {
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
        })
        .build(app)?;

      Ok(())
    })
    .on_window_event(|window, event| {
      // メイン管理画面のXボタン・最小化では、アプリを終了せずウィンドウを隠して
      // 右下アバターのみ常駐させる(D-20260706-004)。復帰はトレイ「開く」または
      // ミニパネルの「メイン画面を開く」から行う。トレイの「終了」は app.exit() で
      // 直接プロセスを終了するため、このハンドラを経由しない。
      if window.label() == "main" {
        match event {
          WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let _ = window.hide();
          }
          WindowEvent::Resized(_) => {
            if window.is_minimized().unwrap_or(false) {
              let _ = window.unminimize();
              let _ = window.hide();
            }
          }
          _ => {}
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
