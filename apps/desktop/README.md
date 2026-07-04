# @musasabi/desktop

Electron 製 Windows デスクトップシェル(Phase 1/2/8、docs/ARCHITECTURE.md 参照)。

## 実装済み

- `src/main.ts` — Electron main process。メインウィンドウ(`apps/sales-workspace`の
  ビルド成果物を読み込む)、トレイ常駐(開く/終了)、Xボタンでは終了せずトレイに常駐、
  `app.setLoginItemSettings` によるログイン時自動起動、MUSA常駐アバターのオーバーレイ
  ウィンドウ(`packages/avatar-2d`)
- `src/callOrchestrator.ts` — FileMaker Mockアダプタでのリードシード、Voice Analysis
  デモ(サンプル通話解析→アバター状態遷移)、Voice Engine デモ(TTS/viseme生成)を
  IPC経由でSales Workspaceに提供する統合層(Phase 8)
- `src/preload.ts` — contextIsolation 有効。`getAppVersion` / `setAvatarState` /
  `getLeads` / `runDemoCallAnalysis` / `speakCoachingMessage` を公開
- `package.json` の `build` フィールド — `electron-builder` による Windows NSIS
  インストーラ設定。`extraResources` で `apps/sales-workspace/dist` を同梱
- `assets/icon.png` — 仮アイコン(16x16 placeholder。本番用アセットは
  AIクリエイティブ本部が別途用意する — Organization Bible 第3.5章)

## 検証状況

- `npm run build`(依存パッケージのビルド一式 + `tsc`)は **成功済み**(型エラーなし)。
  クリーン状態からのモノレポ全体ビルドと、全パッケージのユニットテスト(70件)を確認済み
- 実際にElectronアプリを起動してのウィンドウ・トレイ・アバター表示確認、および
  `electron-builder` によるWindowsインストーラの実ビルドは **未検証**。
  この開発コンテナはネットワーク egress ポリシー上 `github.com` からの
  Electronバイナリダウンロードが許可されておらず(`registry.npmjs.org` 等の
  パッケージメタデータ取得のみ許可)、Electron本体を取得できないため。
  Windows環境またはgithub.comへのダウンロードが許可されたCI環境での実機確認が必要

## 既知のギャップ

- Voice EngineのSTT出力(テキストのみ)とVoice Analysisの入力(話者・タイミング付き
  セグメント)の間の話者分離(ダイアライゼーション)は未実装。`callOrchestrator.ts`の
  デモは両エンジンを個別に確認する形に留まる
- FileMaker/Zoom Phoneは実サーバー未接続(Mockアダプタのみ)
- VOICEVOX/whisper.cppの実エンジンはこの環境に無いため`VoicevoxTtsProvider`/
  `WhisperCppHttpSttProvider`は未使用(`MockTtsProvider`のみ配線)

## 次にやること

- Windows実機/CIでの起動確認とインストーラビルド検証
- 話者分離を実装し、実通話からVoice Engine→Voice Analysisへの直結を実現する
- 実FileMaker/Zoom Phone/VOICEVOX/whisper.cppとの接続検証
