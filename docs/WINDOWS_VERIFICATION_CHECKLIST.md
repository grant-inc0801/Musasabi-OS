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
- [ ] 設定タブの連携準備UI(接続ステータス表示、ダミー値専用の入力フォーム)が
  表示・操作できる
- [ ] **実際のFileMaker Data API / Zoom Phone APIへの接続は行わないこと**
  (本フェーズでは未対応。実接続の実装は次フェーズ以降)

## 7. Voice Engine / Voice Analysis(Mock入力)

- [ ] Mock音声入力に対してSTT結果(モック)が処理される
- [ ] Voice Analysisの感情分析・キーワード抽出結果が表示される
- [ ] 話者分離ブリッジ(`DiarizationBridge`、Issue #182)はユニット/結合テストで
  検証済み。実通話音声(チャネル分離済み)での実地確認は次フェーズ
- [ ] **VOICEVOX / whisper.cpp の実エンジンとの接続は次フェーズ Issue
  [#183](https://github.com/grant-inc0801/Musasabi-OS/issues/183) で検証する**

## 8. インストーラー確認

- [ ] `tauri build` による NSIS インストーラーがビルドできる
  (`apps/desktop/src-tauri/tauri.conf.json` の `bundle.windows.nsis`)
- [ ] インストーラーからのインストール → 起動 → アンインストールが正常に行える

## 9. β版評価ビルドの画面操作確認(D-20260706-002)

β版はすべて Mock 構成で動作する。以下を `npm run dev:desktop`(または
`npm run dev:web`)で起動して確認する。

- [ ] 起動直後に初回セットアップウィザードが表示され、完了後に本体UIへ進める
- [ ] 5つのタブ(ダッシュボード / AI社員管理 / コールトレーニング / Sales Brain / 設定)
  すべてに遷移できる
- [ ] **ダッシュボード**: KPI・日次計画・推奨アクション・リード一覧が表示される
- [ ] **AI社員管理**: Company Genome・組織図ツリー・AI社員名簿(7名)が表示され、
  組織単位クリックで名簿が絞り込まれる。「コールトレーニングへ移動」で画面遷移できる
- [ ] **コールトレーニング**: Learning / Test / AutoCall の3モードが見える
- [ ] **Test Mode**: 連絡先(ダミー値)を入力して「テストコール開始」→ AI応答表示 →
  顧客役入力への切り返し → 指摘追加 → 通話終了 まで操作できる
- [ ] **AutoCall Mode**: 「準備中・承認待ち」表示で、開始ボタンが無効(本番実行不可)
- [ ] **Sales Brain**: 学習データソース(Mock/準備中)と共通ナレッジのカテゴリ絞り込みが動く
- [ ] **設定**: AI社員・音声(Mock)・既定コールモードを保存でき、外部サービス
  接続準備状況にダミー値を入力しても実接続が発生しない
- [ ] MUSAアバターが2Dプレースホルダーで表示される(VRM実描画は Pending #200)
- [ ] 一連の操作で実API接続・実架電・実認証情報保存が発生しない(Mock表示のみ)

## 検証結果の記録

検証を実施したら、結果(OK/NG、発生した問題、スクリーンショット等)を
`docs/ai-handoff/STATUS.md` または新しい issue に記録し、
`docs/ai-handoff/CLAUDE_RESPONSE.md` から参照できるようにすること。
