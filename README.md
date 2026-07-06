# Musasabi OS

Musasabi OS は、AIが人の代わりに仕事を理解し自律的に実行する Windows AI社員
プラットフォームである。現在の最優先目標は **Epic β-001「営業部運用版完成」** 。

設計ドキュメントは以下の優先順位で参照する(詳細は
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 第0章)。

1. [docs/COMPANY_GENOME.md](docs/COMPANY_GENOME.md) — Mission/Vision/Values/行動原則
2. [docs/DEVELOPMENT_BIBLE.md](docs/DEVELOPMENT_BIBLE.md) — 開発の絶対ルール
3. [docs/ORGANIZATION_BIBLE.md](docs/ORGANIZATION_BIBLE.md) — 組織構造(8本部)
4. [docs/AI_EMPLOYEE_BIBLE.md](docs/AI_EMPLOYEE_BIBLE.md) — AI社員個々の定義
5. [docs/department-playbooks/](docs/department-playbooks/) — 部門別運用書
6. [docs/SECURITY_BIBLE.md](docs/SECURITY_BIBLE.md) — セキュリティルール
7. [docs/PLUGIN_SDK_BIBLE.md](docs/PLUGIN_SDK_BIBLE.md) — プラグイン拡張仕様

システム設計・実装ロードマップへの落とし込みは
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照する。

## 現在のステータス: Epic β-001 優先タスク1〜7 実装済み(実機検証待ち)

このリポジトリは、Issue open をトリガーに `main_app.py` / `spec.md` をAIが
上書き生成し続ける自動ループ(旧`.github/workflows/ai-pipeline.yml`)により、
長期間「完了済み」を名乗るコミットが積まれていましたが実体が無い状態でした
(経緯は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 第6章)。ワークフローを
無効化し、以下の7項目をモノレポ構成でゼロから実装・単体テスト・相互配線しました。

1. Windows デスクトップアプリ化 (`apps/desktop`) — Electron、トレイ常駐、自動起動
2. MUSA 常駐アバター (`packages/avatar-2d`) — 状態機械 + オーバーレイウィンドウ
3. Sales Workspace β 版仕上げ (`apps/sales-workspace`) — React + Vite UI
4. FileMaker連携 (`packages/integrations/filemaker`) — Real/Mockアダプタ
5. Zoom Phone連携 (`packages/integrations/zoom-phone`) — Real/Mockアダプタ
6. Voice Analysis (`packages/voice-analysis`) — 感情分析・キーワード検知・通話サマリ
7. Voice Engine (`packages/voice-engine`) — TTS/STTプラガブルプロバイダ

**未検証・既知のギャップ**(`apps/desktop/README.md` 参照):
実際のWindows起動・インストーラビルドはこの開発コンテナのegressポリシー上
Electronバイナリを取得できず未実施。実FileMaker/Zoom Phone/VOICEVOX/whisper.cpp
サーバーへの接続も同様に未検証。Voice EngineのSTT出力とVoice Analysisの入力を
繋ぐ話者分離(ダイアライゼーション)は未実装。3Dアバター(`packages/avatar-3d`)は
このEpicのスコープ外(β版完成後の拡張)。

## リポジトリ構成

```
apps/
  desktop/            Desktop Application(Tauri、Windowsインストーラ、トレイ常駐)
  sales-workspace/    Sales Workspace β 版 UI(React + Vite)
packages/
  avatar-2d/          MUSA 常駐アバター(2D オーバーレイ、状態機械)
  avatar-3d/          3D アバターロジック(three.js実レンダラーは Pending Issue #200)
  voice-engine/       TTS / STT(発話合成・音声認識)
  voice-analysis/     通話音声解析(感情分析・キーワード抽出・SQLite永続化)
  ai-core/            AI Sales Employee ロジック(リード優先順位付け・日次計画・KPI)
  ai-company/         AI Company System(組織階層・AI社員モデル・Genome・承認フロー)
  call-training/      コール三段階運用(Learning/Test/AutoCall、Mock架電、共通ナレッジ)
  integrations/       外部サービス連携(FileMaker、Zoom Phone)
  memory/             Brain Memory Engine(未実装、Epic β-001完了後)
  vision/             Vision Engine(未実装、Epic β-001完了後)
  automation/         Automation Engine(未実装、Epic β-001完了後)
  self-improvement/   Self Improvement Engine(未実装、Epic β-001完了後)
  shared/             IPC プロトコル・型定義・共通ユーティリティ
docs/
  COMPANY_GENOME.md       Mission/Vision/Values/行動原則
  DEVELOPMENT_BIBLE.md    開発の絶対ルール
  ORGANIZATION_BIBLE.md   組織構造(8本部)
  AI_EMPLOYEE_BIBLE.md    AI社員個々の定義
  department-playbooks/  部門別運用書
  SECURITY_BIBLE.md       セキュリティルール
  PLUGIN_SDK_BIBLE.md     プラグイン拡張仕様
  ARCHITECTURE.md         システム設計・実装ロードマップ
tests/                横断的な統合・E2Eテスト(現状は各パッケージ内の単体テストのみ)
scripts/              ビルド・リリース・開発補助スクリプト
config/               環境別設定
plugins/              Plugin SDK 準拠のプラグイン
```

## セットアップ

```
npm install
npm run build   # 全パッケージをビルド(依存順に自動でビルドされる)
npm test        # 全パッケージのユニットテスト
```

## β版評価ビルドの起動手順(D-20260706-002)

β版は Mock 構成で安全に操作できる評価ビルドである。**実API接続・実認証情報の保存・
実架電は一切行わない**(FileMaker / Zoom Phone / VOICEVOX / whisper.cpp は Mock
または「準備中」表示。AutoCall 本番実行は無効)。

### 1. Tauri デスクトップとして起動(Windows 推奨)

前提: Node.js 22+、Rust ツールチェイン、WebView2 ランタイム
(<https://tauri.app/start/prerequisites/> 参照)。

```
npm install
npm run dev:desktop     # フロントをビルドして Tauri ウィンドウで起動
```

Windows インストーラ(NSIS/MSI)の作成:

```
npm run package:win
```

### 2. ブラウザで起動(Rust 環境が無い場合の代替)

```
npm install
npm run dev:web         # Vite dev server(http://localhost:5173)
```

### β版で操作できる画面

| 画面 | 内容 |
| --- | --- |
| ダッシュボード | KPI・日次計画・推奨アクション・リード一覧・通話解析(Mock) |
| AI社員管理 | Company Genome・組織図・AI社員名簿・社員別コールモード |
| コールトレーニング | Learning / Test / AutoCall の三段階。Test Mode は Mock 架電を操作可能。AutoCall は「準備中・承認待ち」で本番実行不可 |
| Sales Brain | 学習データソース(Mock/準備中)と全AI社員共通トーク改善ナレッジ |
| 設定 | AI社員・音声(Mock)・既定コールモード、外部サービス接続準備状況(ダミー値のみ) |

MUSAアバターは現フェーズでは 2D プレースホルダー表示(`packages/avatar-2d`)。
VRoid/VRM・three.js 実レンダラーは Pending(Issue #200)。

Windows 実機での確認手順は
[docs/WINDOWS_VERIFICATION_CHECKLIST.md](docs/WINDOWS_VERIFICATION_CHECKLIST.md) を参照。
GitHub Actions の手動実行(`workflow_dispatch`)による評価ビルドは
`.github/workflows/beta-build.yml` を使用する。
