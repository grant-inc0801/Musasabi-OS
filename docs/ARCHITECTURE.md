# Musasabi OS アーキテクチャ計画 — Epic β-001

## 経緯(なぜゼロから作り直すのか)

`.github/workflows/ai-pipeline.yml` は Issue が open されるたびに以下を自動実行していた。

1. GPT-4o に Issue タイトル/本文を渡し `spec.md` を上書き生成
2. GPT-4o に `spec.md` を渡し、コードを `main_app.py` に上書き生成(単一ファイル)
3. `main_app.py` と `spec.md` のみを commit & push
4. GPT-4o に次のタスクを考えさせて新しい Issue を自動作成
5. 現在の Issue を close

このループは `main_app.py` / `spec.md` を毎回全置換するだけで、何も蓄積しない。
そのため "Epic β-001 Sales Department Operational Release" や
"S10-001 MUSA 3D Avatar Engine" のような「完了」コミットメッセージが
300 件以上積まれていたが、対応する実装(Electron アプリ、アバター、
Voice Engine、ドキュメント等)はリポジトリに一度も存在しなかった。

このワークフローは manual dispatch 専用に変更し、無効化した。
今後はこの `docs/ARCHITECTURE.md` を計画の正とし、実際に動く実装を積み上げる。

## 技術スタック

- デスクトップ: Electron + electron-builder(Windows NSIS インストーラ)
- UI: React + Vite(Sales Workspace)
- 3D アバター: three.js + `@pixiv/three-vrm`
- 音声: TTS/STT はプラガブルなプロバイダインターフェース
- 言語: TypeScript 全体で統一

## フェーズ別計画

### Phase 0 — 基盤整備(実施中)
- 自動ループの無効化、ダミー Issue のクローズ
- モノレポ雛形(`package.json` workspaces, `tsconfig.base.json`)
- 実体のある README / docs 作成

### Phase 1 — Windows デスクトップアプリ化(`apps/desktop`)
- Electron main/preload(contextIsolation)
- `electron-builder` で NSIS installer
- Windows ログイン時自動起動、トレイ常駐
- 受け入れ基準: `.exe` インストーラが生成され、自動起動・トレイ操作が動作する

### Phase 2 — MUSA 常駐アバター(`packages/avatar-2d`)
- 透過・最前面・枠なしのオーバーレイウィンドウ
- 状態機械: 待機 / 作業中 / コール準備中(考え中) / フォローアップ / 目標達成(祝福)
- IPC 経由で Voice Engine / ai-sales-core のイベントに反応
- 受け入れ基準: テストイベント送信でアバターの状態が切り替わる

### Phase 3 — Voice Engine(`packages/voice-engine`)
- TTS(MUSA の発話)、STT(音声認識)をプラガブルなプロバイダで実装
- 通話音声取得(Zoom Phone 等)は別途 API 連携タスクとして切り出す
- 受け入れ基準: テキスト→音声再生+リップシンク用タイミングデータ出力、
  マイク入力→ストリーミング文字起こし

### Phase 4 — Voice Analysis(`packages/voice-analysis`)
- Voice Engine の文字起こしを受けてリアルタイム感情分析・キーワード検知・通話サマリ生成
- SQLite に保存し Sales Workspace のダッシュボードに連携
- 受け入れ基準: サンプル通話ログから感情タイムラインとサマリが生成される

### Phase 5 — 3D アバター(`packages/avatar-3d`)
- three.js + VRM モデル描画(透過 Electron ウィンドウ内)
- リップシンク・感情に応じたブレンドシェイプ制御
- 受け入れ基準: VRM モデルが発話に同期して口が動き、アイドルモーションが滑らかに再生される

### Phase 6 — Sales Workspace β 仕上げ(`apps/sales-workspace`)
- 日次計画・リード管理・KPI ダッシュボード・推奨アクション
- Voice Analysis・ai-sales-core のデータと連携
- 受け入れ基準: 通話終了後にリード状況・KPI が反映され、アバターも状態遷移する

### Phase 7 — 統合・β リリース
- エンドツーエンドの動作確認、Windows インストーラへの一括パッケージング
- README/docs 更新、テスト整備
