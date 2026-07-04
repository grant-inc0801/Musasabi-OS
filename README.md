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

## 現在のステータス: Phase 0(基盤整備中)

このリポジトリは、Issue open をトリガーに `main_app.py` / `spec.md` を
AI が上書き生成し続ける自動ループ(`.github/workflows/ai-pipeline.yml`)により、
長期間「完了済み」を名乗るコミットが積まれていましたが、実際にはコードが
一切蓄積されていませんでした。ワークフローは無効化済みで、ここからモノレポ
構成で実装をゼロから積み上げています。詳しい経緯は
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

## Epic β-001 優先タスク

1. Windows デスクトップアプリ化 (`apps/desktop`)
2. MUSA 常駐アバター (`packages/avatar-2d`)
3. Voice Analysis (`packages/voice-analysis`)
4. Voice Engine (`packages/voice-engine`)
5. 3D アバター (`packages/avatar-3d`)
6. Sales Workspace β 版仕上げ (`apps/sales-workspace`)

## リポジトリ構成

```
apps/
  desktop/            Desktop Application(Electron、Windowsインストーラ、トレイ常駐)
  sales-workspace/    Sales Workspace β 版 UI(React + Vite)
packages/
  avatar-2d/          MUSA 常駐アバター(2D オーバーレイ、状態機械)
  avatar-3d/          3D アバター(three.js + VRM、リップシンク)
  voice-engine/       TTS / STT(発話合成・音声認識)
  voice-analysis/     通話音声解析(感情分析・キーワード抽出)
  ai-core/            AI Sales Employee ロジック
  ai-company/         AI Company System(組織階層・役職・KPI・承認フロー)
  memory/             Brain Memory Engine
  vision/             Vision Engine
  automation/         Automation Engine
  self-improvement/   Self Improvement Engine
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
tests/                横断的な統合・E2Eテスト
scripts/              ビルド・リリース・開発補助スクリプト
config/               環境別設定
plugins/              Plugin SDK 準拠のプラグイン
```

## セットアップ

各パッケージはスケルトン段階です。依存関係のインストールはまだ実行していません。

```
npm install
npm run build
```
