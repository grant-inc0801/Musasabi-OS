# @musasabi/desktop

Tauri 製 Windows デスクトップシェル(docs/ARCHITECTURE.md 第0.2章・第4.2章参照)。
以前の Electron 実装(Phase 1/2/8)は `git log` の履歴に残っているが、
`docs/ai-handoff/CHATGPT_DIRECTIVE.md`(D-20260704-002)によりTauriが公式となり、
本ディレクトリはTauriベースに置き換わっている。

## 構成

- `src-tauri/` — Rustバックエンド(ネイティブシェルのみを担当)
  - `src/lib.rs` — メインウィンドウ、MUSAアバターオーバーレイウィンドウの生成、
    システムトレイ常駐(開く/終了)、Xボタンでは終了せずトレイに常駐、
    `tauri-plugin-autostart` によるログイン時自動起動
  - `tauri.conf.json` — メインウィンドウ設定、`frontendDist` は
    `apps/sales-workspace/dist`(Vite ビルド成果物)を指す。
    `bundle.targets` は `["nsis", "msi"]`(Windows向けに .exe(NSIS)と .msi(WiX)の
    両インストーラを生成、Phase β-002 優先順位①)
- ビジネスロジック(リード取得・通話解析デモ・音声合成デモ・アバター状態管理)は
  Rust側に持たず、`apps/sales-workspace/src/desktopBridge.ts` から
  `@musasabi/{ai-core,integrations,voice-analysis,voice-engine,avatar-2d}` を
  直接呼び出す。これらのパッケージはOS依存のないフレームワーク非依存ロジックであり、
  TauriのWebView(通常のブラウザコンテキスト)から特権プロセスを介さず利用できるため
  (Electron時代のIPC層は不要になった)
- MUSA常駐アバターは `apps/sales-workspace/avatar.html` +
  `src/avatarMain.ts` としてSales Workspaceのビルドにマルチページ出力される。
  メインウィンドウとの状態同期はTauriのイベントAPI(`@tauri-apps/api/event`、
  `packages/shared` の `AVATAR_EVENTS` で定義)経由

## 検証状況

- `npm run build`(依存パッケージのビルド一式 + Sales Workspaceのマルチページ
  Viteビルド)は **成功済み**。クリーン状態からのモノレポ全体ビルドと、
  全パッケージのユニットテスト(90件)を確認済み
- `cargo check` は本開発コンテナでは **未完了**。`libwebkit2gtk-4.1-dev` 等の
  Tauri Linuxビルドに必要なシステムライブラリが、このサンドボックスの
  ネットワークポリシー上 `apt` でインストールできない(Ubuntuのsecurity/updates
  ミラーの一部パッケージが404になる)ため。ただし `cargo add`/`cargo check` の
  初期段階で全依存クレートのソース取得・純Rust部分のコンパイルは進行し、
  `gdk-sys` のネイティブライブラリリンク段階で初めて失敗することを確認しており、
  `src-tauri/src/lib.rs` の各API呼び出しは実際に取得したクレートソース
  (`tauri 2.11.5`, `tauri-plugin-autostart 2.5.1`)のシグネチャと突き合わせて
  検証済み
- `tauri dev` / `tauri build` によるウィンドウ・トレイ・アバター表示の実起動確認、
  および実際のWindowsインストーラ生成は **未検証**。Windows環境または
  必要なシステムライブラリが揃ったLinux CI環境での実機確認が必要
  (`docs/WINDOWS_VERIFICATION_CHECKLIST.md` 参照)

## 既知のギャップ

- FileMaker/Zoom Phoneは実サーバー未接続(Mockアダプタのみ)。連携準備UIは
  実装済み(docs/ARCHITECTURE.md 第4.3章)だが、実接続自体は次フェーズ以降
- VOICEVOX/whisper.cppの実エンジンはこの環境に無いため`VoicevoxTtsProvider`/
  `WhisperCppHttpSttProvider`は未使用(`MockTtsProvider`のみ配線、次フェーズ Issue #183)

## 次にやること

- Windows実機/CIでの `cargo tauri dev` / `cargo tauri build` 起動確認
- 実VOICEVOX/whisper.cppとの接続検証(#183)、実FileMaker/Zoom Phone本番接続の実装
