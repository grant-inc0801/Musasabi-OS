# Windows実機検証チェックリスト(Epic β-001 統合後)

このチェックリストは、`main` に統合された Epic β-001(Phase 1〜8, PR #184)、
および `apps/desktop` のTauri移行(PR #184後の次フェーズ、
`docs/ai-handoff/CLAUDE_RESPONSE.md` 参照)を実際の Windows 端末で検証するための
手順である。サンドボックス開発環境では `libwebkit2gtk-4.1-dev` 等のシステム
ライブラリがネットワークポリシー上インストールできず `cargo build` 自体が
完了しないため、下記項目はすべて**実機での確認が未実施**である。

> **前提**: `apps/desktop` は Tauri ベースに移行済み(`docs/ARCHITECTURE.md`
> 第0.2章参照)。Electron実装は git 履歴にのみ残る。

## 0. 事前準備

- [ ] Windows 10/11 端末を用意する
- [ ] Node.js(`package.json` の `engines` または CI 設定と同じメジャーバージョン)をインストール
- [ ] Rust ツールチェイン(`rustup`)と Tauri の Windows ビルド要件
  (Microsoft Visual Studio C++ Build Tools、WebView2 ランタイム。
  <https://tauri.app/start/prerequisites/> 参照)をインストール
- [ ] リポジトリを `git clone` し、対象ブランチ(`main`)を checkout する

## 1. ビルド確認

- [ ] `npm install` がエラーなく完了する
- [ ] `npm run build` がモノレポ全体でエラーなく完了する
  (`packages/shared`, `avatar-2d`, `ai-core`, `integrations`, `voice-analysis`,
  `voice-engine` → 各 `apps/*` の順にビルドされることを確認)
- [ ] `npm run test --workspaces --if-present` で全ユニットテストが green になる
- [ ] `cd apps/desktop/src-tauri && cargo check` がエラーなく完了する
  (このサンドボックス環境では未検証。Windows実機では
  `libwebkit2gtk-4.1-dev` 相当の制約はない)

## 2. Tauriアプリ起動確認(`apps/desktop`)

- [ ] `npm --prefix apps/desktop run dev`(内部で `tauri dev` を呼ぶ)でアプリが起動する
- [ ] メインウィンドウが表示され、白画面にならない
- [ ] メインウィンドウ内に Sales Workspace の UI が正しく描画される
- [ ] コンソール/ログにアセット読み込みエラーが出ていない
- [ ] `npm --prefix apps/desktop run package:win`(`tauri build`)でWindows向け
  バンドルが生成される

## 3. システムトレイ・自動起動

- [ ] アプリ起動後、システムトレイにアイコンが常駐する
- [ ] トレイアイコンのメニュー(表示/終了など)が機能する
- [ ] ウィンドウを閉じてもアプリがトレイに残る(意図した挙動であることを確認)
- [ ] 自動起動設定を有効にした場合、OS再起動後にアプリが自動的に起動する

## 4. MUSA常駐アバター(`avatar.html` / `packages/avatar-2d`)

- [ ] アバターのオーバーレイウィンドウ(フレームレス・透過・最前面)が表示される
- [ ] Sales Workspaceの「デモ通話を分析」操作で、アバターの状態遷移が
  オーバーレイウィンドウに反映される(Tauriイベント経由の往復確認)
- [ ] アバターウィンドウ・メインウィンドウのいずれかを閉じても、
  もう一方や本体アプリがクラッシュしない

## 5. Sales Workspace UI

- [ ] リード一覧が表示される
- [ ] 日次プラン(Daily Plan)が表示され、推奨アクションが算出されている
- [ ] KPI表示が正しく計算されている(0〜100%の範囲に収まっていること)
- [ ] Settings画面が開ける

## 6. FileMaker / Zoom Phone 連携(Mockのみ、実接続はしない)

- [ ] Mockアダプタ経由でのデータ取得・表示が正しく動作する
- [ ] **実際のFileMaker Data API / Zoom Phone APIへの接続は行わないこと**
  (本フェーズでは未対応。次フェーズで連携準備UIを追加予定)

## 7. Voice Engine / Voice Analysis(Mock入力)

- [ ] Mock音声入力に対してSTT結果(モック)が処理される
- [ ] Voice Analysisの感情分析・キーワード抽出結果が表示される
- [ ] **VOICEVOX / whisper.cpp の実エンジンとの接続は次フェーズ Issue
  [#183](https://github.com/grant-inc0801/Musasabi-OS/issues/183) で検証する**
- [ ] 話者分離(ダイアライゼーション)は未実装(次フェーズ Issue
  [#182](https://github.com/grant-inc0801/Musasabi-OS/issues/182))

## 8. インストーラー確認

- [ ] `tauri build` による NSIS インストーラーがビルドできる
  (`apps/desktop/src-tauri/tauri.conf.json` の `bundle.windows.nsis`)
- [ ] インストーラーからのインストール → 起動 → アンインストールが正常に行える

## 検証結果の記録

検証を実施したら、結果(OK/NG、発生した問題、スクリーンショット等)を
`docs/ai-handoff/STATUS.md` または新しい issue に記録し、
`docs/ai-handoff/CLAUDE_RESPONSE.md` から参照できるようにすること。
