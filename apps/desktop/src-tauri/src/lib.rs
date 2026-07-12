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


#[derive(serde::Serialize)]
struct LocalLlmResponse {
  status: u16,
  body: String,
}

// ローカルLLM(Ollama)専用プロキシコマンド。
// WebView からの fetch(plugin-http 含む)は Origin ヘッダ(http://tauri.localhost)が
// 付与され、Ollama の許可リストに無いため HTTP 403 で拒否される。Rust 側から
// Origin なしで転送することで、OLLAMA_ORIGINS の設定なしに接続できるようにする。
// 接続先は localhost / 127.0.0.1 のみ許可(外部送信なし・会社憲章準拠)。
#[tauri::command]
async fn local_llm_request(
  url: String,
  method: String,
  body: Option<String>,
) -> Result<LocalLlmResponse, String> {
  let allowed = url.starts_with("http://127.0.0.1:") || url.starts_with("http://localhost:");
  if !allowed {
    return Err("ローカルLLM(localhost)以外への接続は許可されていません".into());
  }
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(120))
    .connect_timeout(std::time::Duration::from_secs(3))
    .build()
    .map_err(|e| e.to_string())?;
  let request = if method.eq_ignore_ascii_case("POST") {
    client
      .post(&url)
      .header("content-type", "application/json")
      .body(body.unwrap_or_default())
  } else {
    client.get(&url)
  };
  let response = request.send().await.map_err(|e| e.to_string())?;
  let status = response.status().as_u16();
  let text = response.text().await.map_err(|e| e.to_string())?;
  Ok(LocalLlmResponse { status, body: text })
}

// ローカルSTT(whisper.cpp / OpenAI互換サーバ)専用プロキシコマンド。
// WAV音声(base64)を multipart で localhost の音声認識サーバへ転送する。
// 接続先は localhost / 127.0.0.1 のみ許可(外部送信なし)。
#[tauri::command]
async fn local_stt_request(
  url: String,
  audio_base64: String,
  file_name: String,
) -> Result<LocalLlmResponse, String> {
  let allowed = url.starts_with("http://127.0.0.1:") || url.starts_with("http://localhost:");
  if !allowed {
    return Err("ローカルSTT(localhost)以外への接続は許可されていません".into());
  }
  use base64::Engine as _;
  let bytes = base64::engine::general_purpose::STANDARD
    .decode(audio_base64)
    .map_err(|e| e.to_string())?;
  let part = reqwest::multipart::Part::bytes(bytes)
    .file_name(file_name)
    .mime_str("audio/wav")
    .map_err(|e| e.to_string())?;
  let form = reqwest::multipart::Form::new()
    .part("file", part)
    .text("response_format", "json");
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(120))
    .connect_timeout(std::time::Duration::from_secs(3))
    .build()
    .map_err(|e| e.to_string())?;
  let response = client.post(&url).multipart(form).send().await.map_err(|e| e.to_string())?;
  let status = response.status().as_u16();
  let text = response.text().await.map_err(|e| e.to_string())?;
  Ok(LocalLlmResponse { status, body: text })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![local_llm_request, local_stt_request])
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
      // 起動直後はメイン管理画面が表示されているため、ミニパネル/ミニアバターは
      // 隠しておく。メイン画面を最小化/閉じたときにだけ表示する(ユーザーFB第7弾)。
      let _ = avatar_window.hide();

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
            // メイン画面を開いたらミニアバターは隠す(ユーザーFB第7弾)。
            if let Some(avatar) = app.get_webview_window("avatar") {
              let _ = avatar.hide();
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
            if let Some(avatar) = app.get_webview_window("avatar") {
              let _ = avatar.hide();
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
        // メイン画面を隠したら、ミニアバター/ミニパネルを表示する(ユーザーFB第7弾)。
        let show_avatar = || {
          if let Some(avatar) = window.app_handle().get_webview_window("avatar") {
            let _ = avatar.show();
          }
        };
        match event {
          WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let _ = window.hide();
            show_avatar();
          }
          WindowEvent::Resized(_) => {
            if window.is_minimized().unwrap_or(false) {
              let _ = window.unminimize();
              let _ = window.hide();
              show_avatar();
            }
          }
          _ => {}
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
